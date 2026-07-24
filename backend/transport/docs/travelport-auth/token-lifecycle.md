# Token Lifecycle

The OAuth token is a single per-process entry, keyed by environment (pre-prod / prod). The cache stores the token in encrypted form (AES-256-GCM) when `TRAVELPORT_TOKEN_ENCRYPTION_KEY` is set; without a key it stores plaintext in-memory (acceptable for dev/sandbox; explicitly logged on startup).

## States

```
                 ┌──────────┐
                 │   EMPTY  │  process just started, or clear() was called
                 └────┬─────┘
                      │  getToken() → cache miss → refreshAccessToken()
                      ▼
                 ┌──────────┐
                 │  MINTING │  inFlight Promise pending; concurrent callers share it
                 └────┬─────┘
                      │  200 OK → cache.set(encrypted)
                      ▼
                 ┌──────────┐  reads return instantly, no network
                 │   FRESH  │
                 └────┬─────┘
                      │  now + 60s > expiresAt
                      ▼
                 ┌──────────┐
                 │  STALE   │  next getToken() refreshes transparently
                 └────┬─────┘
                      │  forceRefresh() (HTTP client 401 path)
                      ▼
                 ┌──────────┐
                 │  CLEARED │  cache wiped; next call re-mints
                 └────┬─────┘
                      │  getToken()
                      ▼
                  MINTING
```

## Methods

| Method | Effect | Used by |
|---|---|---|
| `TokenCache.get(windowMs=60_000)` | return cached if `now + windowMs < expiresAt`, else `null` | `TokenManager.getToken()` |
| `TokenCache.set(token)` | encrypts (if key set) and stores; overwrites previous | `TokenManager.refreshAccessToken()` |
| `TokenCache.clear()` | wipes the entry | `TokenManager.forceRefresh()` |
| `TokenManager.getToken()` | coalesced `get → refresh`; returns the access token string | `AuthenticationService.getAccessToken()` |
| `TokenManager.forceRefresh()` | `clear → refresh`; returns the new access token string | `AuthenticationService.forceRefresh()` |
| `AuthenticationService.getAccessToken()` | the seam the HTTP client uses; never touches the cache directly | `TravelportHttpClient.request()` |
| `AuthenticationService.forceRefresh()` | the seam the HTTP client uses after a 401 | `TravelportHttpClient.request()` 401 branch |

## Expiry policy

- **Safety window:** 60 seconds. A token is treated as stale when it has less than 60 s left. The HTTP client uses the latest available token up to that boundary so a refresh doesn't race a request mid-flight.
- **Refresh trigger #1:** `getToken()` finds the cache empty or stale.
- **Refresh trigger #2:** the HTTP client receives a 401 from Travelport — it calls `forceRefresh()` and retries once.
- **No scheduled refresh.** Refresh is on-demand, not timer-driven. The Travelport token TTL is short (~15 minutes in production) and the safety window absorbs minor drift, so a setInterval-driven prefetch is unnecessary.

## Encryption details

- Algorithm: **AES-256-GCM**, 12-byte random IV per `set()`, auth tag stored alongside ciphertext.
- Key derivation: `scrypt(hexKey, "tripsage-travelport-<env>", 32)`. The per-env salt means the same key gives different derived keys across environments.
- Encrypted blob layout: `base64(iv).base64(tag).base64(ciphertext)`.
- `get()` decrypts on every call. There is no in-process plaintext copy of the token.

## Limits (ponytail:)

- **Single-process.** No cross-pod sharing. With N pods, each mints independently; the auth endpoint sees N refreshes per TTL. If you run > 2 replicas, replace the `Map`-backed store with Redis and add a short distributed lock around the mint. Until then, this is fine.
- **No proactive eviction.** A STALE entry sits in the cache until the next `get()` call. The next call clears it via the mint path, so memory does not grow.
- **Encryption is at-rest, not in-use.** A core dump of the process still contains the decrypted token while it sits in a `get()` return value. Hardening against core dumps is a host-level concern (disable core dumps in production).
