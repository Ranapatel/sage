/**
 * TripSage — TS Register Shim
 *
 * Loaded at the very top of `index.js` to patch Node's `require()` so that
 * any subsequent `require('../middleware/auth.middleware')` (no extension)
 * can resolve a `.ts` file. Without this, plain `.js` files in `src/routes/`
 * cannot import the TypeScript middleware and the server crashes on boot.
 *
 * Uses `ts-node/register/transpile-only` for speed — we don't need full
 * typechecking at runtime; the build/IDE does that. We only need the
 * on-the-fly transpile of `.ts` to CommonJS.
 *
 * NOTE: This file is intentionally CommonJS, with no imports of its own,
 * so it can be loaded with the very first `require('./register')` in
 * `index.js` before anything else.
 */

require('ts-node/register/transpile-only')
