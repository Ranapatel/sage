/**
 * Payments Router
 *
 * Endpoints:
 *   POST /api/payments/create-order  — Create Razorpay order
 *   POST /api/payments/verify        — Verify payment signature (frontend callback)
 *   POST /api/payments/webhook       — Razorpay webhook (raw body required)
 *
 * Security:
 *   - RAZORPAY_KEY_SECRET never returned to frontend
 *   - Webhook verified with HMAC-SHA256 using RAZORPAY_WEBHOOK_SECRET
 *   - Idempotency enforced on create-order
 */

const express    = require('express')
const router     = express.Router()
const razorpay   = require('../services/razorpayService')
const { writeAudit } = require('../models/AuditLog')
const { zodValidate } = require('../middleware/validateRequest')
const { createPaymentOrderSchema } = require('../activities/activitiesValidator')
const { paymentLimiter } = require('../middleware/rateLimitMiddleware')

function clientMeta(req) {
  return {
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'] || null,
    userId:    req.user?.email || req.user?.id || null,
  }
}
function safeError(err) {
  return process.env.NODE_ENV === 'production'
    ? 'Payment operation failed. Please try again.'
    : err.message
}

// ── POST /api/payments/create-order ─────────────────────────────────────────

router.post(
  '/create-order',
  paymentLimiter,
  zodValidate(createPaymentOrderSchema),
  async (req, res) => {
    const start = Date.now()
    const { bookingId, idempotencyKey, amountINR, currency } = req.validatedBody
    try {
      const order = await razorpay.createOrder({ bookingId, idempotencyKey, amountINR, currency })

      await writeAudit({
        action:     'PAYMENT_CREATE',
        bookingId,
        payload:    { idempotencyKey, amountINR },
        result:     'SUCCESS',
        durationMs: Date.now() - start,
        ...clientMeta(req),
      })

      res.json({ success: true, data: order })
    } catch (err) {
      await writeAudit({ action: 'PAYMENT_CREATE', bookingId, result: 'FAILURE', errorMsg: err.message, durationMs: Date.now() - start, ...clientMeta(req) })
      const status = err.statusCode || 500
      res.status(status).json({ success: false, error: safeError(err) })
    }
  }
)

// ── POST /api/payments/verify ────────────────────────────────────────────────
// Called by frontend after Razorpay checkout modal success, BEFORE reconfirm

router.post('/verify', paymentLimiter, async (req, res) => {
  const start = Date.now()
  const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body || {}

  if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
    return res.status(400).json({
      success: false,
      error:   'razorpayOrderId, razorpayPaymentId, and razorpaySignature are required',
    })
  }

  try {
    const payment = await razorpay.verifyPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature })

    await writeAudit({
      action:     'PAYMENT_VERIFY',
      bookingId:  payment?.bookingId,
      payload:    { razorpayOrderId },
      result:     'SUCCESS',
      durationMs: Date.now() - start,
      ...clientMeta(req),
    })

    res.json({ success: true, data: { verified: true, bookingId: payment?.bookingId } })
  } catch (err) {
    await writeAudit({ action: 'PAYMENT_VERIFY', result: 'FAILURE', errorMsg: err.message, durationMs: Date.now() - start, ...clientMeta(req) })
    const status = err.statusCode || 400
    res.status(status).json({ success: false, error: safeError(err) })
  }
})

// ── POST /api/payments/webhook ───────────────────────────────────────────────
// Razorpay webhooks require raw body parsing — mount BEFORE express.json()
// The index.js router registration uses express.raw() for this path.

router.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    const start = Date.now()
    const sig   = req.headers['x-razorpay-signature'] || ''

    let parsed
    try {
      parsed = JSON.parse(req.body)
    } catch {
      return res.status(400).json({ success: false, error: 'Invalid JSON body' })
    }

    try {
      const result = await razorpay.handleWebhook(req.body, sig, parsed)

      await writeAudit({
        action:  'PAYMENT_WEBHOOK',
        payload: { event: result.event, orderId: result.orderId },
        result:  'SUCCESS',
        durationMs: Date.now() - start,
        ...clientMeta(req),
      })

      // Always respond 200 to Razorpay to stop retries
      res.json({ success: true })
    } catch (err) {
      await writeAudit({ action: 'PAYMENT_WEBHOOK', result: 'FAILURE', errorMsg: err.message, durationMs: Date.now() - start, ...clientMeta(req) })
      const status = err.statusCode || 400
      // Return error but Razorpay will retry — handle idempotently
      res.status(status).json({ success: false, error: err.message })
    }
  }
)

module.exports = router
