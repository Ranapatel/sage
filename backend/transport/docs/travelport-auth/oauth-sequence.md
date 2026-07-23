# Travelport OAuth — Sequence Diagrams

## 1. Cold start — first request after process boot

```
Backend (TravelportHttpClient)         TokenManager         TokenCache         Travelport Auth
            │                              │                    │                    │
            │  getAccessToken()            │                    │                    │
            │ ───────────────────────────► │                    │                    │
            │                              │ cache.get()        │                    │
            │                              │ ─────────────────► │                    │
            │                              │ ◄──── null ─────── │                    │
            │                              │ Basic(cid:secret)                        │
            │                              │ POST /oauth20/token grant_type=cc        │
            │                              │ ──────────────────────────────────────► │
            │                              │ ◄──── 200 { access_token, expires_in }  │
            │                              │ cache.set(encrypted)  │                 │
            │                              │ ─────────────────► │                    │
            │ ◄──── access_token ───────── │                    │                    │
            │                                                              │       │
            │  POST /air/catalog/...  Authorization: Bearer <token>        │       │
            │ ─────────────────────────────────────────────────────────────►  ...  │
            │ ◄──── 200 ──────────────────────────────────────────────────────  ... │
```

## 2. Warm path — subsequent requests within the token TTL

```
TravelportHttpClient                  TokenManager            TokenCache
            │                              │                       │
            │  getAccessToken()            │                       │
            │ ───────────────────────────► │                       │
            │                              │ cache.get()           │
            │                              │ ────────────────────► │
            │                              │ ◄──── { accessToken, expiresAt } │
            │                              │   (no network call)   │
            │ ◄──── access_token ───────── │                       │
            │                                                              │
            │  POST /air/...  Authorization: Bearer <token>               │
            │ ─────────────────────────────────────────────────────────►  Travelport
            │ ◄──── 200 ──────────────────────────────────────────────────
```

## 3. Token near expiry — auto-refresh on the next request

```
TravelportHttpClient                TokenManager           TokenCache
            │                            │                      │
   (now + 60s >= expiresAt)             │                      │
            │  getAccessToken()          │                      │
            │ ─────────────────────────► │                      │
            │                            │ cache.get()          │
            │                            │ ──────────────────► │
            │                            │ ◄── null (expired) ─ │
            │                            │ POST /oauth20/token  │
            │                            │ ───► Travelport Auth │
            │                            │ ◄── 200 { ... }      │
            │                            │ cache.set(encrypted) │
            │                            │ ──────────────────► │
            │ ◄──── new access_token ─── │                      │
```

## 4. 401 mid-flight — force refresh and retry once

```
TravelportHttpClient                TokenManager           TokenCache            Travelport
            │                            │                      │                      │
            │  getAccessToken()          │                      │                      │
            │ ─────────────────────────► │                      │                      │
            │ ◄──── access_token ──────── │                      │                      │
            │  POST /air/...  Bearer X    │                      │                      │
            │ ──────────────────────────────────────────────────────────────────►    │
            │ ◄──── 401 Unauthorized ───────────────────────────────────────────     │
            │  forceRefresh()            │                      │                      │
            │ ─────────────────────────► │                      │                      │
            │                            │ cache.clear()        │                      │
            │                            │ ──────────────────► │                      │
            │                            │ POST /oauth20/token                          │
            │                            │ ──────────────────────────────────────────► │
            │                            │ ◄──── 200 { access_token, expires_in } ──── │
            │                            │ cache.set(encrypted)│                      │
            │                            │ ──────────────────► │                      │
            │ ◄──── new access_token ──── │                      │                      │
            │  POST /air/...  Bearer Y    │                      │                      │
            │ ──────────────────────────────────────────────────────────────────►    │
            │ ◄──── 200 ──────────────────────────────────────────────────────────  │
```

## 5. Concurrent requests — only one token mint at a time

```
Client A  getAccessToken() ─┐
Client B  getAccessToken() ─┤── both await the same inFlight Promise
Client C  getAccessToken() ─┘
                              ▼
                       TokenManager
                              │ inFlight = refreshAccessToken()
                              │   POST /oauth20/token ──► Travelport Auth
                              │   ◄── 200 { token } ──
                              │ inFlight = null
                              ▼
              All three clients receive the same token
```

This avoids the thundering-herd against the auth endpoint when many requests land in the same millisecond (common after process boot or after a refresh).
