# Production Deployment Checklist

## Secrets

- [ ] `TRAVELPORT_CLIENT_ID` and `TRAVELPORT_CLIENT_SECRET` live in a real secrets manager (AWS Secrets Manager / GCP Secret Manager / HashiCorp Vault / Kubernetes Secret with encryption-at-rest). **Not** in `docker-compose.yml`, **not** in `.env` files committed to git, **not** in CI logs.
- [ ] `TRAVELPORT_TOKEN_ENCRYPTION_KEY` is a freshly generated 64-hex-char (32-byte) value, distinct from any other key. Generate with: `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`.
- [ ] `TRAVELPORT_ENV=production` is set explicitly. Do not rely on defaults.
- [ ] `TRAVELPORT_BASE_URL` and `TRAVELPORT_TOKEN_URL` are left empty so the code uses the production endpoints (`api.travelport.net/11` and `api.travelport.net/v1/oauth/oauth20/token`).

## Process

- [ ] `npm run build` produces a `dist/` with no TypeScript errors.
- [ ] `node dist/main.js` runs the startup credential validation. With intentionally blank credentials, the process exits with a logged error and never binds the port.
- [ ] The startup log line shows the **masked** client ID (`abc***xyz`), the chosen base URL, PCC, and target branch. If you see a real client ID in the logs, the masking is broken — do not deploy.
- [ ] The startup log does **not** contain the client secret, the access token, the PCC if you consider it sensitive in your jurisdiction, or any `Authorization: Bearer …` header.

## Network

- [ ] Outbound HTTPS to `api.travelport.net` (and `api.pp.travelport.net` if pre-prod) is allowed from the pod / container / VM.
- [ ] `TRAVELPORT_REQUEST_TIMEOUT_MS` is set to a value that matches the slowest Travelport call you expect (default 20000 ms is fine for most).
- [ ] A load balancer or ingress terminates TLS and forwards the request to NestJS; NestJS does not need to listen on 443.
- [ ] CORS: `main.ts` currently allows `origin: '*'` for development — restrict this in production to the frontends that actually call the API.

## Observability

- [ ] Logs are shipped to your central log store (CloudWatch / Datadog / ELK / Loki).
- [ ] Sensitive-data scrubbing in `TravelportHttpClient.sanitizeSensitiveData()` is the **last** line of defence; do not rely on it to keep secrets out of structured fields. Filter `passportNumber`, `cardNumber`, `cvv`, `client_secret`, and `Authorization` headers at the logger level too.
- [ ] Alert on `TravelportAuthError` events with code in `{INVALID_CLIENT_ID, INVALID_CLIENT_SECRET, FORBIDDEN, MISSING_PCC, MISSING_TARGET_BRANCH}` — these are configuration / credential problems, not transient.
- [ ] Alert on `NETWORK_TIMEOUT` rate spikes — usually an outbound firewall change.
- [ ] Each Travelport request logs a `TraceId`. Capture the `TraceId` in your APM so a customer-reported booking can be traced through NestJS → Travelport.
- [ ] Track `expires_in` from the token endpoint. A sudden drop from the expected ~900s to a small number means Travelport is throttling the credential.

## Multi-instance (when you scale beyond one pod)

- [ ] Replace the process-local `TokenCache` with a Redis-backed implementation. Marked in `token-cache.ts` as a future cut.
- [ ] Add a short distributed lock around the mint to prevent N pods from racing to refresh at the same time.

## Rollback

- [ ] The pre-prod env is `TRAVELPORT_ENV=pre-production`; switch back to it by setting the env var and restarting. No code change.
- [ ] If the production credential is suspected compromised, rotate the secret in the Travelport portal first, then deploy the new value. The cached token in flight is short-lived; once it expires (≤ 15 min), the new credential takes over.

## Smoke test after deploy

```bash
# Should return 200 with a flight search result
curl -X POST https://<host>/api/api/v1/flights/search \
  -H 'Content-Type: application/json' \
  -d '{"origin":"DEL","destination":"BOM","departureDate":"2026-09-01","adults":1,"cabinClass":"Economy"}'

# Should return 200 with metrics
curl https://<host>/api/api/v1/flights/reporting/metrics
```

If either fails, check the logs for `TravelportAuthError` first — usually the credential is the cause.
