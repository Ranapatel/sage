/**
 * Rate Limit Middleware — Per-Route Limiters
 *
 * Provides stricter per-route limiters for sensitive activities endpoints
 * on top of the global `/api/` limiter already applied in index.js.
 */

const rateLimit = require('express-rate-limit')

/** Activities search — 30 req / 15 min per IP */
const activitiesSearchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      30,
  message:  { success: false, error: 'Too many activity searches. Please try again in a few minutes.' },
  standardHeaders: true,
  legacyHeaders:   false,
})

/** Activity details — 60 req / 15 min in prod, 3000 in dev */
const activitiesDetailsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      process.env.NODE_ENV === 'production' ? 60 : 3000,
  message:  { success: false, error: 'Too many detail requests. Please try again shortly.' },
  standardHeaders: true,
  legacyHeaders:   false,
})

/** Booking mutation (preconfirm / reconfirm / cancel) — 10 req / 15 min per IP */
const bookingMutationLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      10,
  message:  { success: false, error: 'Too many booking requests. Please wait and try again.' },
  standardHeaders: true,
  legacyHeaders:   false,
})

/** Payment create — 5 req / 15 min per IP (strict) */
const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max:      5,
  message:  { success: false, error: 'Too many payment requests. Please wait before trying again.' },
  standardHeaders: true,
  legacyHeaders:   false,
})

module.exports = {
  activitiesSearchLimiter,
  activitiesDetailsLimiter,
  bookingMutationLimiter,
  paymentLimiter,
}
