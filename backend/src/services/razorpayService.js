/**
 * Razorpay Service
 *
 * Handles:
 *  1. createOrder    — Create Razorpay order (returns order_id for frontend)
 *  2. verifyPayment  — Verify frontend-submitted signature after payment
 *  3. handleWebhook  — Process Razorpay webhook events with signature verification
 *
 * Security:
 *  - RAZORPAY_KEY_SECRET never sent to frontend
 *  - Webhook signature verified with RAZORPAY_WEBHOOK_SECRET (separate secret)
 *  - Idempotency enforced via idempotencyKey
 */

const crypto = require('crypto')
const { paymentStore } = require('../models/Payment')

// Lazily initialise Razorpay to avoid startup crash if package not ready
let Razorpay = null
let razorpay = null

function getRazorpayInstance() {
  if (razorpay) return razorpay
  if (!Razorpay) {
    try {
      Razorpay = require('razorpay')
    } catch {
      throw new Error('razorpay package not installed. Run: npm install razorpay')
    }
  }
  const keyId     = process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keyId || !keySecret) {
    throw new Error('RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET not configured in .env')
  }
  razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })
  return razorpay
}

// ── Create Order ──────────────────────────────────────────────────────────────

/**
 * Creates a Razorpay order.
 *
 * @param {object} params
 * @param {string} params.bookingId      — TripSage booking UUID
 * @param {string} params.idempotencyKey — UUID for dedup (one order per key)
 * @param {number} params.amountINR      — Amount in INR (NOT paise; we convert internally)
 * @param {string} params.currency       — 'INR'
 *
 * @returns {{ razorpayOrderId, amount, currency, keyId }} — safe to return to frontend
 */
async function createOrder({ bookingId, idempotencyKey, amountINR, currency = 'INR' }) {
  // Idempotency check — return existing order if already created
  const existing = await paymentStore.findByBookingId(bookingId)
  if (existing && existing.status === 'CREATED') {
    console.log(`[Razorpay] Returning existing order for booking ${bookingId}`)
    return {
      razorpayOrderId: existing.razorpayOrderId,
      amount:          existing.amount,
      currency:        existing.currency,
      keyId:           process.env.RAZORPAY_KEY_ID,
    }
  }

  const rp     = getRazorpayInstance()
  const paise  = Math.round(amountINR * 100)   // Razorpay uses smallest unit

  const rpOrder = await rp.orders.create({
    amount:   paise,
    currency,
    receipt:  bookingId.slice(0, 40),           // max 40 chars
    notes:    { bookingId, idempotencyKey },
  })

  await paymentStore.create({
    idempotencyKey,
    bookingId,
    razorpayOrderId: rpOrder.id,
    amount:          paise,
    currency,
    amountDisplay:   amountINR,
    status:          'CREATED',
  })

  console.log(`[Razorpay] Created order ${rpOrder.id} for booking ${bookingId} (₹${amountINR})`)

  return {
    razorpayOrderId: rpOrder.id,
    amount:          paise,
    currency,
    keyId:           process.env.RAZORPAY_KEY_ID,  // safe to expose (public key)
  }
}

// ── Verify Payment ────────────────────────────────────────────────────────────

/**
 * Verifies the Razorpay payment signature submitted by the frontend
 * after the user completes the checkout modal.
 *
 * Razorpay signature = HMAC-SHA256(orderId + "|" + paymentId, key_secret)
 *
 * @param {object} params
 * @param {string} params.razorpayOrderId
 * @param {string} params.razorpayPaymentId
 * @param {string} params.razorpaySignature
 *
 * @returns {object} verified payment record
 */
async function verifyPayment({ razorpayOrderId, razorpayPaymentId, razorpaySignature }) {
  const keySecret = process.env.RAZORPAY_KEY_SECRET
  if (!keySecret) throw new Error('RAZORPAY_KEY_SECRET not configured')

  const body      = `${razorpayOrderId}|${razorpayPaymentId}`
  const expected  = crypto
    .createHmac('sha256', keySecret)
    .update(body)
    .digest('hex')

  if (!timingSafeEqual(expected, razorpaySignature)) {
    console.error('[Razorpay] Signature verification FAILED for order', razorpayOrderId)
    throw Object.assign(new Error('Payment signature verification failed.'), { statusCode: 400 })
  }

  // Mark payment as captured in our DB
  const updated = await paymentStore.update(razorpayOrderId, {
    razorpayPaymentId,
    razorpaySignature,
    status:     'CAPTURED',
    verifiedAt: new Date(),
  })

  if (!updated) {
    throw Object.assign(new Error('Payment record not found.'), { statusCode: 404 })
  }

  console.log(`[Razorpay] Payment CAPTURED — order ${razorpayOrderId}, payment ${razorpayPaymentId}`)
  return updated
}

// ── Webhook ───────────────────────────────────────────────────────────────────

/**
 * Validates and processes a Razorpay webhook event.
 *
 * @param {Buffer} rawBody        — must be raw Buffer (use express.raw() for this route)
 * @param {string} signature      — value of razorpay-signature header
 * @param {object} parsedPayload  — JSON.parse(rawBody)
 *
 * @returns {{ event, payment }} processed event details
 */
async function handleWebhook(rawBody, signature, parsedPayload) {
  const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
  if (!webhookSecret) {
    throw new Error('RAZORPAY_WEBHOOK_SECRET not configured')
  }

  // Verify webhook signature
  const expected = crypto
    .createHmac('sha256', webhookSecret)
    .update(rawBody)
    .digest('hex')

  if (!timingSafeEqual(expected, signature || '')) {
    console.error('[Razorpay] Webhook signature FAILED')
    throw Object.assign(new Error('Invalid webhook signature'), { statusCode: 401 })
  }

  const event   = parsedPayload.event
  const payment = parsedPayload.payload?.payment?.entity

  console.log(`[Razorpay] Webhook event: ${event}, paymentId: ${payment?.id}`)

  if (event === 'payment.captured' && payment) {
    await paymentStore.update(payment.order_id, {
      razorpayPaymentId: payment.id,
      status:            'CAPTURED',
      verifiedAt:        new Date(),
      webhookEventId:    parsedPayload.account_id || null,
      webhookEvent:      event,
    })
  }

  if (event === 'payment.failed' && payment) {
    await paymentStore.update(payment.order_id, {
      razorpayPaymentId: payment.id,
      status:            'FAILED',
      failedAt:          new Date(),
      failReason:        payment.error_description || 'Payment failed',
      webhookEvent:      event,
    })
  }

  return { event, orderId: payment?.order_id, paymentId: payment?.id }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Constant-time string comparison to prevent timing attacks */
function timingSafeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const bufA = Buffer.from(a)
  const bufB = Buffer.from(b)
  if (bufA.length !== bufB.length) {
    // Still compare to avoid timing leakage of length
    crypto.timingSafeEqual(bufA, bufA)
    return false
  }
  return crypto.timingSafeEqual(bufA, bufB)
}

module.exports = { createOrder, verifyPayment, handleWebhook }
