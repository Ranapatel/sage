/**
 * TripSage — Auth Bypass Regression Test
 *
 * Phase-0 hardening regression test. Verifies that the Clerk auth middleware
 * returns 401 for every tampered, unsigned, or otherwise invalid JWT — and
 * never falls through to the request handler.
 *
 * Strategy: We test the middleware in isolation by feeding it mock req/res
 * objects. This avoids loading the route files (which have heavy imports:
 * Prisma, Razorpay, Mongoose, etc.) and keeps the test fast and hermetic.
 *
 * Run with:  node src/middleware/auth.middleware.test.js
 */

const assert = require('assert')

// Set a deliberately-fake Clerk secret BEFORE requiring the app.
// Any real token will fail signature verification; any fake token
// will fail signature verification. Either way → 401.
process.env.CLERK_SECRET_KEY = 'sk_test_FAKE_KEY_FOR_REGRESSION_TEST_ONLY'
process.env.NODE_ENV = 'test'

// ts-node register is needed because the middleware is .ts
require('../register')

const { authMiddleware } = require('./auth.middleware')

// ── Mocks ─────────────────────────────────────────────────────────────────────

/**
 * Build a minimal mock Express req/res pair suitable for the middleware.
 * Captures status, json body, and whether next() was called.
 */
function makeMocks({ headers = {} } = {}) {
  const res = {
    _status: 200,
    _body: null,
    _headers: {},
    status(code) { this._status = code; return this },
    json(body) { this._body = body; return this },
    set(k, v) { this._headers[k] = v; return this },
  }
  const req = { headers }
  let nextCalled = false
  const next = () => { nextCalled = true }
  return { req, res, next, wasNext: () => nextCalled }
}

// ── Tampered/unsigned JWT samples ─────────────────────────────────────────────

// A JWT-shaped string with three base64-url segments. Header is `alg: none`,
// payload is `sub: attacker`. NOT signed. The old dev-fallback would have
// happily base64-decoded this and authenticated the attacker.
const TAMPERED_JWT_NONE_ALG =
  'eyJhbGciOiJub25lIiwidHlwIjoiSldUIn0.' +
  Buffer.from(JSON.stringify({ sub: 'user_attacker', email: 'attacker@evil.com' }))
    .toString('base64url') +
  '.'

// A JWT with HS256 header but garbage signature.
const TAMPERED_JWT_GARBAGE_SIG =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  Buffer.from(JSON.stringify({ sub: 'user_attacker' })).toString('base64url') +
  '.not-a-real-signature'

// A JWT with a real-looking payload claiming to be a legitimate user,
// with a forged-but-plausible signature.
const TAMPERED_JWT_FORGED_PAYLOAD =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.' +
  Buffer.from(JSON.stringify({
    sub: 'user_real_victim',
    email: 'victim@example.com',
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
  })).toString('base64url') +
  '.AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA'

// A real-looking JWT (3 segments) but with arbitrary random content.
const RANDOM_GARBAGE = 'aaaaaaaaaa.bbbbbbbbbb.cccccccccc'

// ── Test cases ────────────────────────────────────────────────────────────────

const TOKEN_CASES = [
  { name: 'no Authorization header',       headers: {} },
  { name: 'malformed (no Bearer prefix)',  headers: { authorization: 'just-a-random-string' } },
  { name: 'malformed (empty Bearer)',      headers: { authorization: 'Bearer ' } },
  { name: 'random garbage (3 segments)',   headers: { authorization: `Bearer ${RANDOM_GARBAGE}` } },
  { name: 'unsigned alg=none JWT',         headers: { authorization: `Bearer ${TAMPERED_JWT_NONE_ALG}` } },
  { name: 'garbage signature',             headers: { authorization: `Bearer ${TAMPERED_JWT_GARBAGE_SIG}` } },
  { name: 'forged payload, fake sig',      headers: { authorization: `Bearer ${TAMPERED_JWT_FORGED_PAYLOAD}` } },
]

;(async () => {
  let passed = 0
  let failed = 0
  const failures = []

  for (const tc of TOKEN_CASES) {
    const { req, res, next, wasNext } = makeMocks({ headers: tc.headers })

    try {
      await authMiddleware(req, res, next)
    } catch (err) {
      failed++
      failures.push(`${tc.name}: middleware threw (should return 401, not throw): ${err.message}`)
      continue
    }

    if (wasNext()) {
      failed++
      failures.push(
        `${tc.name}: CRITICAL — next() was called. The auth bypass has been re-introduced.`
      )
      continue
    }

    if (res._status !== 401) {
      failed++
      failures.push(`${tc.name}: expected 401, got ${res._status} body=${JSON.stringify(res._body)}`)
      continue
    }

    if (!res._body || res._body.success !== false) {
      failed++
      failures.push(`${tc.name}: 401 returned but body did not match { success: false, ... }: ${JSON.stringify(res._body)}`)
      continue
    }

    passed++
    console.log(`✓ ${tc.name}`)
  }

  // ── Server-misconfig check ──────────────────────────────────────────────────

  // If CLERK_SECRET_KEY is missing, the middleware must NOT fall through.
  // It should return 500 (server misconfigured). This catches the
  // "developer forgot to set the env var and the app starts wide open" case.
  {
    const orig = process.env.CLERK_SECRET_KEY
    delete process.env.CLERK_SECRET_KEY
    const { req, res, next, wasNext } = makeMocks({
      headers: { authorization: `Bearer ${TAMPERED_JWT_NONE_ALG}` },
    })
    await authMiddleware(req, res, next)
    process.env.CLERK_SECRET_KEY = orig

    if (wasNext()) {
      failed++
      failures.push('missing CLERK_SECRET_KEY: next() was called. Misconfigured server should fail closed.')
    } else if (res._status !== 500) {
      failed++
      failures.push(`missing CLERK_SECRET_KEY: expected 500 (misconfigured), got ${res._status}`)
    } else {
      passed++
      console.log('✓ missing CLERK_SECRET_KEY → 500 (fails closed)')
    }
  }

  console.log('')
  console.log('──────────────────────────────────────────────')
  console.log(`Auth bypass test: ${passed} passed, ${failed} failed`)
  if (failed > 0) {
    console.log('')
    console.log('Failures:')
    failures.forEach((f) => console.log('  ✗ ' + f))
    process.exit(1)
  } else {
    console.log('✓ Every tampered/unsigned/forged token is rejected with 401')
    console.log('✓ Server misconfig (no CLERK_SECRET_KEY) fails closed (500)')
    console.log('✓ The base64-decode dev-fallback bypass vector is closed')
    process.exit(0)
  }
})().catch((err) => {
  console.error('Test runner crashed:', err)
  process.exit(2)
})
