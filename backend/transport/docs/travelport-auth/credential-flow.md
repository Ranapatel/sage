# Travelport Credential Flow

End-to-end: how a Travelport credential moves from the operator's secrets store to a live API call, and back into the audit log.

```
┌───────────────────┐
│ Secrets Manager   │   (Vault / AWS SM / GCP SM / Kubernetes Secret)
│ ────────────────  │
│ TRAVELPORT_CLIENT_ID
│ TRAVELPORT_CLIENT_SECRET
│ TRAVELPORT_CUSTOMER_ID
│ TRAVELPORT_PCC
│ TRAVELPORT_TARGET_BRANCH
│ TRAVELPORT_ACCESS_GROUP
│ TRAVELPORT_TOKEN_ENCRYPTION_KEY  (optional, 32-byte hex)
│ TRAVELPORT_REQUEST_TIMEOUT_MS    (optional, default 20000)
│ TRAVELPORT_ENV                   (development | sandbox | pre-production | production)
└────────┬──────────┘
         │ injected as env vars into the NestJS process
         ▼
┌──────────────────────────────────────────────────────┐
│ TravelportConfigService (process startup)            │
│ 1. reads env vars                                    │
│ 2. picks baseUrl / tokenEndpoint by TRAVELPORT_ENV   │
│    production  → https://api.travelport.net/11       │
│    pre-prod    → https://api.pp.travelport.net/11    │
│ 3. validateOrThrow() — fails fast if any required    │
│    var is empty; logs the masked client ID and the   │
│    chosen base URL; never logs the secret             │
└────────┬─────────────────────────────────────────────┘
         │ passed in via DI to TokenManager and AuthenticationService
         ▼
┌──────────────────────────────────────────────────────┐
│ TokenManager                                         │
│ 1. on first getToken():                              │
│      Basic base64(clientId:clientSecret)             │
│      POST <tokenEndpoint>                            │
│      grant_type=client_credentials                    │
│ 2. on 200: store { accessToken, expiresAt, scope }   │
│    in TokenCache (encrypted at rest if key set)      │
│ 3. on 4xx/5xx/timeout: throw TravelportAuthError     │
│    with one of the standardized codes                │
│ 4. on subsequent getToken(): return cached if       │
│    expiresAt > now + 60s; else re-mint               │
│ 5. forceRefresh(): clear cache, then re-mint        │
└────────┬─────────────────────────────────────────────┘
         │ Bearer token exposed through AuthenticationService.getAccessToken()
         ▼
┌──────────────────────────────────────────────────────┐
│ TravelportHttpClient                                 │
│ 1. requests token from AuthenticationService         │
│ 2. adds Authorization, TVP-PCC-Core,                 │
│    Travelport-Target-Branch, XAUTH_TRAVELPORT_…      │
│ 3. sends request                                     │
│ 4. on 401 → forceRefresh() once, then retry          │
│ 5. on 429 → exponential backoff up to retries        │
│ 6. on any error: sanitize Bearer / card / passport   │
│    / docID / client_secret before logging            │
└────────┬─────────────────────────────────────────────┘
         │ XML / JSON over HTTPS
         ▼
┌──────────────────────────────────────────────────────┐
│ Travelport TripServices (api.pp.travelport.net/11)   │
│   /air/catalog/search/catalogproductofferings        │
│   /air/price/offers/buildfromcatalogproductofferings │
│   /air/book/session/reservationworkbench             │
│   /air/payment/reservationworkbench/.../formofpayment│
│   /air/paymentoffer/reservationworkbench/.../payments│
│   /air/search/seat/catalogofferingsancillaries/...   │
│   /air/ancillaryshop/catalogofferingsancillaries     │
│   /air/emds/getbylocator                             │
│   /air/book/airoffer/.../offers/canceloffer          │
└──────────────────────────────────────────────────────┘
```

## What never leaves the backend

- `TRAVELPORT_CLIENT_SECRET` — used only to compute the Basic auth header inside `TokenManager.refreshAccessToken()`. Never logged. Never returned in any HTTP response.
- The raw access token — only passed as a Bearer header. Logged only in masked form (`maskSecret()` shows first 3 + last 3 chars).
- Traveler's `passportNumber`, `docID`, `cardNumber`, `cvv` — stripped by `TravelportHttpClient.sanitizeSensitiveData()` before any log line is written.

## What the operator controls

| Control | Where | Effect |
|---|---|---|
| Switch environment | `TRAVELPORT_ENV` | picks base URL + token endpoint |
| Override base URL | `TRAVELPORT_BASE_URL` | forces a custom base URL (use sparingly) |
| Override token URL | `TRAVELPORT_TOKEN_URL` | forces a custom auth endpoint (use sparingly) |
| Force token encryption | `TRAVELPORT_TOKEN_ENCRYPTION_KEY` | AES-256-GCM at rest |
| Tune per-request timeout | `TRAVELPORT_REQUEST_TIMEOUT_MS` | axios timeout |
