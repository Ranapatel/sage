# Travelport Authentication — Architecture

```
                    ┌─────────────────────────────────────────────────────────────┐
                    │                  TripSage Backend (NestJS)                  │
                    │                                                             │
   User Request     │   ┌─────────────────┐    ┌──────────────────────────────┐    │
   ────────────►    │   │  Use-Case       │    │  Adapter (search / workbench │    │
                    │   │  (search, book, │───►│  / ticketing / ancillaries)  │    │
                    │   │  ticket, void)  │    └──────────────┬───────────────┘    │
                    │   └─────────────────┘                   │                    │
                    │                                        │ injects            │
                    │                                        ▼                    │
                    │                          ┌──────────────────────────┐       │
                    │                          │  TravelportHttpClient    │       │
                    │                          │  • builds request        │       │
                    │                          │  • adds TraceId / PCC    │       │
                    │                          │  • retries 401/429       │       │
                    │                          │  • sanitizes logs        │       │
                    │                          └────────────┬─────────────┘       │
                    │                                       │                     │
                    │                          ┌────────────▼─────────────┐       │
                    │                          │  TravelportOAuth2Manager │       │
                    │                          │  (compat shim — passthru)│       │
                    │                          └────────────┬─────────────┘       │
                    │                                       │                     │
                    │                          ┌────────────▼─────────────┐       │
                    │                          │  AuthenticationService   │       │
                    │                          │  (façade)                │       │
                    │                          └────────────┬─────────────┘       │
                    │                                       │                     │
                    │                          ┌────────────▼─────────────┐       │
                    │                          │  TokenManager            │       │
                    │                          │  • getToken()            │       │
                    │                          │  • forceRefresh()        │       │
                    │                          │  • maps TravelportAuthError      │
                    │                          └────────────┬─────────────┘       │
                    │                                       │                     │
                    │                          ┌────────────▼─────────────┐       │
                    │                          │  TokenCache              │       │
                    │                          │  • in-process Map        │       │
                    │                          │  • optional AES-256-GCM  │       │
                    │                          └──────────────────────────┘       │
                    │                                                             │
                    │   On bootstrap: TravelportConfigService.validateOrThrow()    │
                    │   fails fast on missing TRAVELPORT_CLIENT_ID / _SECRET /    │
                    │   PCC — no traffic is served.                                │
                    └─────────────────────────────────────────────────────────────┘
                                       │
                                       │  Bearer <token>  +  TVP-PCC-Core
                                       │  + Travelport-Target-Branch
                                       ▼
                            ┌─────────────────────┐
                            │  Travelport Auth    │  https://api.pp.travelport.net/v1/oauth/oauth20/token
                            │  (OAuth client_creds)│
                            └──────────┬──────────┘
                                       │ access_token + expires_in
                                       ▼
                            ┌─────────────────────┐
                            │  Travelport TripSvc │  https://api.pp.travelport.net/11/...
                            │  /air/*             │
                            └─────────────────────┘
```

**Reading direction** — arrows show call direction. The TokenCache, TokenManager, AuthenticationService form the new auth stack; TravelportOAuth2Manager is a one-line shim that exists only so the existing `TravelportHttpClient` and DI graph don't have to change. It can be deleted in a follow-up.

**What each box owns**

| Component | Owns | Reads from | Talks to |
|---|---|---|---|
| `TravelportConfigService` | env parsing, masking, fail-fast validation | `process.env` | nothing |
| `TokenCache` | encrypted blob storage, TTL | constructor-injected key | nothing |
| `TokenManager` | minting, force-refresh, error mapping | `TravelportConfigService`, `TokenCache` | Travelport Auth API |
| `AuthenticationService` | façade exposing `getAccessToken` / `forceRefresh` / header helpers | `TokenManager` | HTTP client |
| `TravelportHttpClient` | request assembly, retries, sanitization | `TravelportOAuth2Manager` (shim) | Travelport TripServices |
| Adapters | business-specific XML/JSON payloads | `TravelportHttpClient` | nothing else |
