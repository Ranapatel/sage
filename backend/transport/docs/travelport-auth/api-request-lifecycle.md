# API Request Lifecycle

Every Travelport API call from the four adapters (`search`, `workbench`, `ticketing`, `ancillaries`) follows the same path. The adapter knows nothing about tokens or credentials; it calls `TravelportHttpClient.post(url, body, sessionIdentifier)` or `.get()` / `.put()` / `.delete()`.

```
Adapter
   │
   │  post('/air/catalog/...', payload)
   ▼
TravelportHttpClient.request({ method: 'POST', url, data }, retries=2, backoff=1000)
   │
   │  1. getAccessToken() ─► AuthenticationService ─► TokenManager
   │       └─► cache hit  : return immediately
   │       └─► cache miss : mint from tokenEndpoint, cache.set(encrypted), return
   │
   │  2. build headers
   │       Authorization          = "Bearer <token>"
   │       TVP-PCC-Core           = TRAVELPORT_PCC
   │       Travelport-Target-Branch = TRAVELPORT_TARGET_BRANCH
   │       XAUTH_TRAVELPORT_ACCESSGROUP = TRAVELPORT_ACCESS_GROUP
   │       TraceId                = "TraceID_<uuid12>"
   │       X-Correlation-ID       = uuid
   │       travelportPlusSessionIdentifier = <workbenchId>, if provided
   │       Content-Type / Accept  = application/json
   │
   │  3. axios.request(config, timeout = TRAVELPORT_REQUEST_TIMEOUT_MS || 20000)
   ▼
Travelport TripServices
   │
   ├── 200 / 2xx ─────────────────────────────────► adapter (success)
   │
   ├── 401 + retries > 0
   │       forceRefresh()  ─►  AuthenticationService ─►  TokenManager
   │       request(config, retries - 1)
   │       ▲
   │       │  (one retry, then bubble up as UNAUTHORIZED)
   │
   ├── 429 + retries > 0
   │       wait backoffMs, then double
   │       request(config, retries - 1, backoffMs * 2)
   │       ▲
   │       │  (up to 2 retries with exponential backoff)
   │
   ├── 4xx / 5xx / network ───────────────────────►  throw { code, message, status, details }
   │
   │  (all error logs pass through sanitizeSensitiveData()
   │   which strips Bearer tokens, client_secret, cardNumber, cvv,
   │   passportNumber, docID before writing to the log)
   ▼
Adapter catches the structured error and re-raises as a NestJS exception;
the controller maps it to an HTTP response.
```

## Per-endpoint request shape

The adapter decides the path, method, and body; everything else (auth, headers, retries, logging) is identical.

| Feature | Adapter | Endpoint(s) |
|---|---|---|
| Flight search | `TravelportSearchAdapter` | `POST /air/catalog/search/catalogproductofferings` |
| Offer price | `TravelportSearchAdapter` | `POST /air/price/offers/buildfromcatalogproductofferings` |
| Fare rules | `TravelportSearchAdapter` | `GET /air/farerule/farerules/fromoffer?offerId=…` |
| Workbench create | `TravelportWorkbenchAdapter` | `POST /air/book/session/reservationworkbench` |
| Add offer to workbench | `TravelportWorkbenchAdapter` | `POST /air/book/airoffer/reservationworkbench/{wb}/offers/buildfromcatalogproductofferings` |
| Add traveler | `TravelportWorkbenchAdapter` | `POST /air/book/traveler/reservationworkbench/{wb}/travelers` |
| Commit workbench → PNR | `TravelportWorkbenchAdapter` | `POST /air/book/reservation/reservations/{wb}` |
| Form of payment | `TravelportWorkbenchAdapter` | `POST /air/payment/reservationworkbench/{wb}/formofpayment` |
| Issue ticket | `TravelportTicketingAdapter` | `POST /air/paymentoffer/reservationworkbench/{pnr}/payments` |
| Void / cancel | `TravelportTicketingAdapter` | `POST /air/book/airoffer/reservationworkbench/{pnr}/offers/canceloffer` |
| Refund quote | `TravelportTicketingAdapter` | same path, `cancelAtCommitWorkbenchInd: false` |
| Seat map | `TravelportAncillariesAdapter` | `POST /air/search/seat/catalogofferingsancillaries/seatavailabilities` |
| Ancillaries shop | `TravelportAncillariesAdapter` | `POST /air/ancillaryshop/catalogofferingsancillaries` |
| EMD by locator | `TravelportAncillariesAdapter` | `GET /air/emds/getbylocator?locator=…` |

## Why the central client matters

- **One place to add a new header.** When Travelport rolls out a new required header (it does, periodically), the change is one line in `TravelportHttpClient.request()`.
- **One place to tune retry policy.** Today: 1 retry on 401 with forced token refresh; up to 2 retries on 429 with exponential backoff. Tomorrow: anything else changes in one file.
- **One place to scrub secrets.** `sanitizeSensitiveData()` runs on every error path, so a developer can't accidentally log a raw token by skipping a step in a new adapter.
- **One place to swap HTTP clients.** If you ever want to replace axios, only the central client moves.

## What an adapter is and isn't allowed to do

**Allowed:** call `httpClient.{post,get,put,delete}(url, body?, sessionIdentifier?)`. Build the request body. Parse the response into a domain shape.

**Not allowed:** construct URLs to `*.travelport.net` directly. Call `axios` directly. Hold a reference to the token, the client id, the secret, or the config service. Throw raw `Error` — the central client already throws a `TravelportApiError` shape that the controller maps.
