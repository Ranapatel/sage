# Verification — every flight feature uses the central Travelport auth workflow

**Constraint:** do not modify any existing business logic. The new auth stack is reached by composition: every existing adapter already injects `TravelportHttpClient`, which already injects `TravelportOAuth2Manager`. Both classes remain with the same public surface; the OAuth2 manager now delegates to the new `AuthenticationService → TokenManager → TokenCache` stack.

## Mapping

| Flight feature | Use-case | Adapter | Central client? | New auth stack? |
|---|---|---|---|---|
| Search flights | `SearchFlightsUseCase` | `TravelportSearchAdapter.searchOffers` | ✅ via `httpClient.post(...)` | ✅ via `OAuth2Manager → AuthService → TokenManager → TokenCache` |
| Price offer | `SearchFlightsUseCase` | `TravelportSearchAdapter.priceOffer` | ✅ | ✅ |
| Fare rules | (use-case layer) | `TravelportSearchAdapter.getFareRules` | ✅ | ✅ |
| Create workbench / PNR | `CreateWorkbenchBookingUseCase` | `TravelportWorkbenchAdapter.createWorkbench` | ✅ | ✅ |
| Add offer to workbench | `CreateWorkbenchBookingUseCase` | `TravelportWorkbenchAdapter.addOffer` | ✅ | ✅ |
| Add traveler | `CreateWorkbenchBookingUseCase` | `TravelportWorkbenchAdapter.addTraveler` | ✅ | ✅ |
| Commit workbench | `CreateWorkbenchBookingUseCase` | `TravelportWorkbenchAdapter.commitWorkbench` | ✅ | ✅ |
| Form of payment | `CreateWorkbenchBookingUseCase` | `TravelportWorkbenchAdapter.addFormOfPayment` | ✅ | ✅ |
| Issue ticket | `IssueTicketUseCase` | `TravelportTicketingAdapter.issueTicket` | ✅ | ✅ |
| Void / cancel | `VoidTicketUseCase` | `TravelportTicketingAdapter.voidTicket` | ✅ | ✅ |
| Refund quote | (use-case layer) | `TravelportTicketingAdapter.quoteRefund` | ✅ | ✅ |
| Process refund | (use-case layer) | `TravelportTicketingAdapter.processRefund` | ✅ | ✅ |
| Exchange | `ExchangeTicketUseCase` | (workbench + ticketing adapters) | ✅ | ✅ |
| Seat map | (presentation → use-case) | `TravelportAncillariesAdapter.getSeatMap` | ✅ | ✅ |
| Ancillaries shop | (presentation → use-case) | `TravelportAncillariesAdapter.shopAncillaries` | ✅ | ✅ |
| EMD by locator | (use-case layer) | `TravelportAncillariesAdapter.getEmdsByLocator` | ✅ | ✅ |
| Schedule change | `ScheduleChangeService` (use-case layer) | (workbench + ticketing adapters) | ✅ | ✅ |
| NDC restrictions | `NDCRestrictionsEngine` | (none — pure domain engine) | n/a | n/a |
| Commission | `CommissionEngine` | (none — pure domain engine) | n/a | n/a |
| Reporting / metrics | `ReportingService` | (none — reads from a store) | n/a | n/a |

**Adapters, use-cases, controllers, DTOs, and domain services that do not talk to Travelport at all (NDC, commission, reporting, state machine, traveler validation) are unchanged — they are pure domain logic and have no transport concerns.**

## How to confirm

1. `grep -r "api.travelport.net\|api.pp.travelport.net" backend/transport/src` returns only:
   - `client/travelport-config.service.ts` (base URL defaults)
   - `client/travelport-oauth2.manager.ts` (now a thin shim — re-exports the surface)
   - `client/travelport-http.client.ts` (the central client)
   No adapter, controller, use-case, or DTO mentions a Travelport URL.

2. `grep -r "import axios" backend/transport/src` returns only the same three files. No adapter imports axios.

3. `flights.module.ts` registers `TokenManager` and `AuthenticationService` as providers. The `TravelportOAuth2Manager` provider is kept so the existing DI graph (HTTP client → OAuth2 manager → auth service → token manager → cache) keeps resolving.

4. `git diff` against `adapters/`, `use-cases/`, `controllers/`, `domain/`, `application/`, and `presentation/` is empty.

## Production workflow walkthrough

1. **Read credentials from environment.** `TravelportConfigService` constructor reads from `process.env` once; fields are exposed as readonly.
2. **Validate on startup.** `main.ts` calls `app.get(TravelportConfigService).validateOrThrow()` before `app.listen()`. Failure throws and the process exits.
3. **Request OAuth token.** First `getToken()` call → `TokenManager.refreshAccessToken()` → POST to `TRAVELPORT_TOKEN_URL` with Basic auth.
4. **Cache token securely.** Stored in `TokenCache`. If `TRAVELPORT_TOKEN_ENCRYPTION_KEY` is set, the at-rest form is AES-256-GCM ciphertext.
5. **Execute Search request.** `TravelportSearchAdapter.searchOffers()` → `TravelportHttpClient.post('/air/catalog/search/catalogproductofferings', payload)`.
6. **Execute Price request.** `TravelportSearchAdapter.priceOffer(offeringId)` → `post('/air/price/offers/buildfromcatalogproductofferings', ...)`.
7. **Execute Book request.** `TravelportWorkbenchAdapter` chain: `createWorkbench → addOffer → addTraveler → addFormOfPayment → commitWorkbench`.
8. **Execute Retrieve Order request.** Reachable via `getEmdsByLocator` (an ancillaries call); the canonical retrieve is the workbench re-open path used by exchange/refund/schedule-change flows.
9. **Refresh token automatically when expired.** `TokenManager.getToken()` checks the safety window and mints a new one transparently.
10. **Handle authentication failures gracefully.** All `TravelportAuthError` instances surface as a structured `{ code, message, status }` to the calling use-case, which the controller maps to a 4xx/5xx HTTP response with the right code.

## Tests run during implementation

- `npx tsc --noEmit` — passes, no errors.
- `npm run build` — `nest build` succeeds, no warnings.
- `node dist/modules/flights/infrastructure/travelport/client/token-manager.js` — the embedded self-check exercises the cache encryption round-trip and cache hit. Output: `[token-manager self-check] OK — encryption round-trip + cache hit work.`
- Startup with empty credentials — process throws `[Travelport Startup Error] Missing mandatory Travelport production credentials: TRAVELPORT_CLIENT_ID, TRAVELPORT_CLIENT_SECRET.` and exits before binding the port. No secrets appear in the log line.
- Startup with valid credentials — `✅ Validated credentials. Target Base URL: https://api.pp.travelport.net/11 | PCC: DU7_1G | Target Branch: P7051234 | Client ID: cid***est`. Client ID is masked; secret never logged.
