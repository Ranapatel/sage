/**
 * Activity Bookings Router
 *
 * Endpoints:
 *   GET  /api/bookings              — List/filter bookings (admin + user history)
 *   GET  /api/bookings/:reference   — Get single booking by ID or HB reference
 *   POST /api/bookings/:reference/cancel-simulation — Show cancellation fee (no cancel)
 *   POST /api/bookings/:reference/cancel            — Execute actual cancellation
 */

const express = require('express')
const router  = express.Router()

const bookingService = require('../activities/activitiesBookingService')
const reconciliationService = require('../activities/activitiesReconciliationService')
const { writeAudit } = require('../models/AuditLog')
const { zodValidate } = require('../middleware/validateRequest')
const { authMiddleware } = require('../middleware/authMiddleware')
const { cancellationSchema, bookingListSchema } = require('../activities/activitiesValidator')
const { bookingMutationLimiter } = require('../middleware/rateLimitMiddleware')

function clientMeta(req) {
  return {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || null,
    userId:    req.user?.email || req.user?.id || null,
  }
}
function safeError(err) {
  return process.env.NODE_ENV === 'production' ? 'An error occurred.' : err.message
}

// ── GET /api/bookings ─────────────────────────────────────────────────────────

router.get('/', authMiddleware, async (req, res) => {
  const start   = Date.now()
  const parsed  = bookingListSchema.safeParse(req.query)
  const filters = parsed.success ? parsed.data : {}
  const userId  = req.user?.email || null

  try {
    const result = await bookingService.listBookings(filters, userId)

    await writeAudit({
      action:     'BOOKING_LIST',
      payload:    filters,
      result:     'SUCCESS',
      durationMs: Date.now() - start,
      ...clientMeta(req),
    })

    res.json({ success: true, data: result })
  } catch (err) {
    await writeAudit({ action: 'BOOKING_LIST', result: 'FAILURE', errorMsg: err.message, durationMs: Date.now() - start, ...clientMeta(req) })
    res.status(500).json({ success: false, error: safeError(err) })
  }
})

// ── GET /api/bookings/:reference ──────────────────────────────────────────────

router.get('/:reference', authMiddleware, async (req, res) => {
  const start     = Date.now()
  const reference = req.params.reference
  const language  = req.query.language || 'en'

  if (!reference || reference.length > 100) {
    return res.status(400).json({ success: false, error: 'Invalid reference' })
  }

  try {
    const booking = await bookingService.getBookingDetails(reference, language)

    await writeAudit({
      action:     'BOOKING_GET',
      bookingId:  reference,
      result:     'SUCCESS',
      durationMs: Date.now() - start,
      ...clientMeta(req),
    })

    res.json({ success: true, data: booking })
  } catch (err) {
    await writeAudit({ action: 'BOOKING_GET', bookingId: reference, result: 'FAILURE', errorMsg: err.message, durationMs: Date.now() - start, ...clientMeta(req) })
    const status = err.statusCode || 500
    res.status(status).json({ success: false, error: safeError(err) })
  }
})

// ── POST /api/bookings/:reference/cancel-simulation ──────────────────────────

router.post(
  '/:reference/cancel-simulation',
  authMiddleware,
  bookingMutationLimiter,
  async (req, res) => {
    const start     = Date.now()
    const reference = req.params.reference
    const language  = req.body?.language || req.query.language || 'en'

    try {
      const result = await bookingService.simulateCancellation(reference, language)

      await writeAudit({
        action:     'CANCEL_SIMULATION',
        bookingId:  reference,
        payload:    { language },
        result:     'SUCCESS',
        durationMs: Date.now() - start,
        ...clientMeta(req),
      })

      res.json({ success: true, data: result })
    } catch (err) {
      await writeAudit({ action: 'CANCEL_SIMULATION', bookingId: reference, result: 'FAILURE', errorMsg: err.message, durationMs: Date.now() - start, ...clientMeta(req) })
      const status = err.statusCode || 500
      res.status(status).json({ success: false, error: safeError(err) })
    }
  }
)

// ── POST /api/bookings/:reference/cancel ─────────────────────────────────────

router.post(
  '/:reference/cancel',
  authMiddleware,
  bookingMutationLimiter,
  zodValidate(cancellationSchema),
  async (req, res) => {
    const start     = Date.now()
    const reference = req.params.reference
    const { language = 'en', confirmed = false } = req.validatedBody

    try {
      const result = await bookingService.cancelBooking(reference, language, confirmed)

      await writeAudit({
        action:     'CANCEL',
        bookingId:  reference,
        payload:    { language, confirmed },
        result:     'SUCCESS',
        durationMs: Date.now() - start,
        ...clientMeta(req),
      })

      res.json({ success: true, data: result })
    } catch (err) {
      await writeAudit({ action: 'CANCEL', bookingId: reference, result: 'FAILURE', errorMsg: err.message, durationMs: Date.now() - start, ...clientMeta(req) })
      const status = err.statusCode || 500
      res.status(status).json({ success: false, error: safeError(err) })
    }
  }
)

router.post(
  '/reconcile',
  authMiddleware,
  bookingMutationLimiter,
  async (req, res) => {
    const start = Date.now()
    try {
      const result = await reconciliationService.reconcileStrandedBookings()
      res.json({ success: true, data: result })
    } catch (err) {
      const status = err.statusCode || 500
      res.status(status).json({ success: false, error: safeError(err) })
    }
  }
)

module.exports = router
