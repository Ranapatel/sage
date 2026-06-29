/**
 * Activities Booking Service
 *
 * Orchestrates the full booking lifecycle:
 *   preconfirm → payment (via razorpayService) → reconfirm
 *   → getBooking → listBookings → cancelSimulation → cancel
 *
 * Key invariants enforced here:
 *  - rateKey must be valid (not expired) before preconfirm
 *  - rateKey is invalidated (single-use) immediately after preconfirm
 *  - reconfirm is gated behind a verified Razorpay payment record
 *  - cancel only executes after SIMULATION has been shown + customer confirmed
 */

const client      = require('./hotelbedsActivitiesClient')
const repo        = require('./activitiesRepository')
const { bookingStore } = require('../models/ActivityBooking')
const { paymentStore } = require('../models/Payment')

const EUR_TO_INR = 90
const USD_TO_INR = 83

function toINR(amount, currency) {
  if (!amount) return null
  if (currency === 'EUR') return Math.round(amount * EUR_TO_INR)
  if (currency === 'USD') return Math.round(amount * USD_TO_INR)
  return Math.round(amount)
}

// ── Preconfirm ────────────────────────────────────────────────────────────────

/**
 * Creates a preconfirmed booking reservation with Hotelbeds.
 *
 * Flow:
 *  1. Validate rateKey is still valid (Redis TTL check)
 *  2. Build Hotelbeds preconfirm payload
 *  3. Call Hotelbeds preconfirm API
 *  4. Invalidate rateKey (single-use enforcement)
 *  5. Persist booking record (status: PRECONFIRMED, expiresAt: +30 min)
 *
 * @param {object} input — validated output from preconfirmSchema
 */
async function preconfirmBooking(input) {
  const {
    bookingId, activityCode, activityName, rateKey,
    modalityCode, modalityName, language,
    fromDate, toDate, passengers, holder, amount, currency,
  } = input

  // Step 1: Validate rateKey freshness
  const storedKey = await repo.getRateKey(bookingId)
  if (!storedKey) {
    throw Object.assign(
      new Error('rateKey has expired or was not found. Please re-fetch activity details.'),
      { statusCode: 410 }
    )
  }
  if (storedKey.rateKey !== rateKey) {
    throw Object.assign(
      new Error('rateKey mismatch. Re-fetch activity details to get a fresh key.'),
      { statusCode: 409 }
    )
  }

  // Step 2: Build Hotelbeds preconfirm payload
  const hbPayload = {
    language:      language || 'en',
    clientReference: bookingId,
    activities: [{
      rateKey,
      paxes: passengers.map(p => ({
        firstName: sanitizeName(p.firstName),
        lastName:  sanitizeName(p.lastName),
        age:       p.age,
        type:      p.type || 'ADULT',
      })),
    }],
    holder: {
      name:    sanitizeName(holder.firstName),
      surname: sanitizeName(holder.lastName),
    },
    contactInfo: {
      email: holder.email,
      phone: holder.phone,
    },
    remark: `TripSage booking ${bookingId}`,
  }

  // Step 3: Call Hotelbeds
  let hbResponse
  try {
    hbResponse = await client.preconfirmBooking(hbPayload)
  } catch (err) {
    // Rethrow with cleaned message
    throw Object.assign(
      new Error(`Hotelbeds preconfirm failed: ${err.response?.data?.message || err.message}`),
      { statusCode: err.response?.status || 502 }
    )
  }

  // Step 4: Invalidate rateKey immediately (single-use)
  await repo.invalidateRateKey(bookingId)

  // Extract HB reference from response
  const hbRef  = hbResponse.reference || hbResponse.bookingReference || hbResponse.id || null
  const hbAmount = hbResponse.totalAmount || amount

  // Step 5: Persist booking
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000)  // 30 min from now

  const booking = await bookingStore.create({
    bookingId,
    hotelbedsReference: hbRef,
    status:             'PRECONFIRMED',
    activityCode,
    activityName,
    modalityCode:  modalityCode || null,
    modalityName:  modalityName || null,
    rateKey,
    language:      language || 'en',
    fromDate,
    toDate,
    passengers,
    holder,
    amount:        hbAmount || amount,
    currency,
    amountINR:     toINR(hbAmount || amount, currency),
    cancellationPolicies: hbResponse.cancellationPolicies || [],
    rawPreconfirmResponse: hbResponse,
    expiresAt,
  })

  return {
    bookingId,
    hotelbedsReference: hbRef,
    status:    'PRECONFIRMED',
    amount:    booking.amount,
    amountINR: booking.amountINR,
    currency,
    expiresAt: expiresAt.toISOString(),
    cancellationPolicies: booking.cancellationPolicies,
  }
}

// ── Reconfirm ─────────────────────────────────────────────────────────────────

/**
 * Confirms a preconfirmed booking after payment has been verified.
 *
 * Flow:
 *  1. Load booking — must be PRECONFIRMED
 *  2. Verify payment record exists and is CAPTURED
 *  3. Check booking has not expired
 *  4. Call Hotelbeds reconfirm API
 *  5. Update booking to CONFIRMED with voucher URL
 *
 * @param {object} input — { bookingId, razorpayOrderId, razorpayPaymentId, razorpaySignature }
 * @param {object} verifiedPayment — payment doc already verified by razorpayService
 */
async function reconfirmBooking(input, verifiedPayment) {
  const { bookingId } = input

  // Step 1: Load booking
  const booking = await bookingStore.findById(bookingId)
  if (!booking) {
    throw Object.assign(new Error('Booking not found.'), { statusCode: 404 })
  }
  if (booking.status !== 'PRECONFIRMED') {
    throw Object.assign(
      new Error(`Booking is in status '${booking.status}'. Only PRECONFIRMED bookings can be reconfirmed.`),
      { statusCode: 409 }
    )
  }

  // Step 2: Verify payment
  if (!verifiedPayment || verifiedPayment.status !== 'CAPTURED') {
    throw Object.assign(
      new Error('Payment has not been verified. Complete payment before reconfirming.'),
      { statusCode: 402 }
    )
  }

  // Step 3: Check expiry
  if (booking.expiresAt && new Date() > new Date(booking.expiresAt)) {
    await bookingStore.update(bookingId, { status: 'EXPIRED' })
    throw Object.assign(
      new Error('Preconfirmed booking has expired (30-minute window). Please start a new booking.'),
      { statusCode: 410 }
    )
  }

  // Step 4: Call Hotelbeds reconfirm
  let hbResponse
  try {
    hbResponse = await client.reconfirmBooking(booking.hotelbedsReference)
  } catch (err) {
    throw Object.assign(
      new Error(`Hotelbeds reconfirm failed: ${err.response?.data?.message || err.message}`),
      { statusCode: err.response?.status || 502 }
    )
  }

  const voucherUrl = hbResponse.voucherURL || hbResponse.voucher?.url || null

  // Step 5: Update booking to CONFIRMED
  const confirmed = await bookingStore.update(bookingId, {
    status:                'CONFIRMED',
    voucherUrl,
    paymentId:             verifiedPayment.idempotencyKey,
    paymentVerifiedAt:     new Date(),
    rawReconfirmResponse:  hbResponse,
    expiresAt:             null,   // remove TTL expiry
  })

  return {
    bookingId,
    hotelbedsReference: booking.hotelbedsReference,
    status:       'CONFIRMED',
    voucherUrl,
    activityName: booking.activityName,
    fromDate:     booking.fromDate,
    toDate:       booking.toDate,
    amount:       booking.amount,
    amountINR:    booking.amountINR,
    currency:     booking.currency,
    cancellationPolicies: booking.cancellationPolicies,
  }
}

// ── Get Booking ───────────────────────────────────────────────────────────────

/**
 * Retrieves a booking from local DB, optionally refreshing from Hotelbeds.
 *
 * @param {string} reference  — bookingId (UUID) or Hotelbeds reference
 * @param {string} language   — language code
 */
async function getBookingDetails(reference, language = 'en') {
  // Try local DB first (by UUID or HB reference)
  let booking = await bookingStore.findById(reference)
  if (!booking) booking = await bookingStore.findByReference(reference)

  if (!booking) {
    throw Object.assign(new Error('Booking not found.'), { statusCode: 404 })
  }

  // For CONFIRMED bookings, optionally refresh from Hotelbeds
  if (booking.status === 'CONFIRMED' && booking.hotelbedsReference) {
    try {
      const hbData  = await client.getBooking(language, booking.hotelbedsReference)
      const updated = await bookingStore.update(booking.bookingId, {
        voucherUrl: hbData.voucherURL || hbData.voucher?.url || booking.voucherUrl,
        status:     mapHBStatus(hbData.status) || booking.status,
      })
      return formatBookingResponse(updated || booking)
    } catch (err) {
      // Non-fatal: return local record on Hotelbeds error
      console.warn('[BookingService] Failed to refresh from HB:', err.message)
    }
  }

  return formatBookingResponse(booking)
}

function mapHBStatus(hbStatus) {
  const map = {
    CONFIRMED:    'CONFIRMED',
    PRECONFIRMED: 'PRECONFIRMED',
    CANCELLED:    'CANCELLED',
    ANNULLED:     'CANCELLED',
  }
  return map[hbStatus] || null
}

function formatBookingResponse(booking) {
  return {
    bookingId:          booking.bookingId,
    hotelbedsReference: booking.hotelbedsReference,
    status:             booking.status,
    activityCode:       booking.activityCode,
    activityName:       booking.activityName,
    fromDate:           booking.fromDate,
    toDate:             booking.toDate,
    holder:             { ...booking.holder },
    passengers:         booking.passengers || [],
    amount:             booking.amount,
    amountINR:          booking.amountINR,
    currency:           booking.currency,
    voucherUrl:         booking.voucherUrl,
    cancellationPolicies: booking.cancellationPolicies || [],
    createdAt:          booking.createdAt,
    cancelledAt:        booking.cancelledAt  || null,
    cancellationFee:    booking.cancellationFee || null,
    refundAmount:       booking.refundAmount    || null,
  }
}

// ── List Bookings ─────────────────────────────────────────────────────────────

/**
 * Lists bookings with pagination and filters.
 *
 * @param {object} filters — { status, fromDate, toDate, page, limit }
 * @param {string} userId  — optional user email to scope results
 */
async function listBookings(filters = {}, userId = null) {
  return bookingStore.list({ ...filters, userId })
}

// ── Cancel Simulation ─────────────────────────────────────────────────────────

/**
 * Simulates cancellation — returns fee + refund without actually cancelling.
 *
 * @param {string} reference — bookingId or Hotelbeds reference
 * @param {string} language
 */
async function simulateCancellation(reference, language = 'en') {
  const booking = await resolveBooking(reference)

  if (!['CONFIRMED'].includes(booking.status)) {
    throw Object.assign(
      new Error(`Only CONFIRMED bookings can be cancelled. Current status: ${booking.status}`),
      { statusCode: 409 }
    )
  }

  const hbData = await client.simulateCancellation(language, booking.hotelbedsReference)

  return {
    bookingId:          booking.bookingId,
    hotelbedsReference: booking.hotelbedsReference,
    activityName:       booking.activityName,
    cancellationFee:    hbData.cancellationAmount || hbData.cancellationFee || 0,
    refundAmount:       hbData.refundAmount       || (booking.amount - (hbData.cancellationAmount || 0)),
    currency:           booking.currency,
    cancellationPolicies: booking.cancellationPolicies || [],
    simulation:         true,
  }
}

// ── Cancel ────────────────────────────────────────────────────────────────────

/**
 * Executes actual booking cancellation after customer confirmation.
 *
 * @param {string}  reference   — bookingId or Hotelbeds reference
 * @param {string}  language
 * @param {boolean} confirmed   — must be true (customer explicitly confirmed)
 */
async function cancelBooking(reference, language = 'en', confirmed = false) {
  if (!confirmed) {
    throw Object.assign(
      new Error('Customer confirmation required. Pass confirmed=true after showing cancellation fee.'),
      { statusCode: 400 }
    )
  }

  const booking = await resolveBooking(reference)

  if (booking.status === 'CANCELLED') {
    throw Object.assign(new Error('Booking is already cancelled.'), { statusCode: 409 })
  }
  if (!['CONFIRMED'].includes(booking.status)) {
    throw Object.assign(
      new Error(`Only CONFIRMED bookings can be cancelled. Current status: ${booking.status}`),
      { statusCode: 409 }
    )
  }

  const hbData = await client.cancelBooking(language, booking.hotelbedsReference)

  const cancellationFee = hbData.cancellationAmount || hbData.cancellationFee || 0
  const refundAmount    = booking.amount - cancellationFee

  await bookingStore.update(booking.bookingId, {
    status:          'CANCELLED',
    cancelledAt:     new Date(),
    cancellationFee,
    refundAmount,
  })

  return {
    bookingId:          booking.bookingId,
    hotelbedsReference: booking.hotelbedsReference,
    status:             'CANCELLED',
    cancellationFee,
    refundAmount,
    currency:           booking.currency,
    cancelledAt:        new Date().toISOString(),
  }
}

// ── Helpers ───────────────────────────────────────────────────────────────────

async function resolveBooking(reference) {
  let booking = await bookingStore.findById(reference)
  if (!booking) booking = await bookingStore.findByReference(reference)
  if (!booking) throw Object.assign(new Error('Booking not found.'), { statusCode: 404 })
  return booking
}

function sanitizeName(name) {
  return String(name || '').trim().replace(/[^\w\s'-]/g, '').slice(0, 60)
}

module.exports = {
  preconfirmBooking,
  reconfirmBooking,
  getBookingDetails,
  listBookings,
  simulateCancellation,
  cancelBooking,
}
