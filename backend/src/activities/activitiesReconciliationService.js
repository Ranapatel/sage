const client = require('./hotelbedsActivitiesClient')
const { bookingStore } = require('../models/ActivityBooking')
const { STATES, assertTransition } = require('./bookingStateMachine')

const RECONCILE_AGE_MS = 10 * 60 * 1000 // 10 minutes

async function reconcileStrandedBookings() {
  console.log('[ActivitiesReconciliation] Checking for stranded bookings...')
  const now = Date.now()

  // Find all preconfirmed / reconfirming / failed reconfirm bookings
  const queryFilters = {
    // We fetch all and filter locally because the in-memory/mongo stores share this service
    limit: 100
  }
  const { bookings } = await bookingStore.list(queryFilters)

  const stranded = bookings.filter(b => {
    if (!['RECONFIRMING', 'RECONFIRM_FAILED'].includes(b.status)) return false
    const age = now - new Date(b.updatedAt).getTime()
    return age > RECONCILE_AGE_MS
  })

  console.log(`[ActivitiesReconciliation] Found ${stranded.length} potential stranded bookings to process`)

  const results = []
  for (const booking of stranded) {
    try {
      const result = await reconcileBooking(booking)
      results.push({ bookingId: booking.bookingId, status: result.status, action: result.action })
    } catch (err) {
      console.error(`[ActivitiesReconciliation] Reconcile failed for ${booking.bookingId}:`, err.message)
      results.push({ bookingId: booking.bookingId, error: err.message })
    }
  }

  return { reconciledCount: results.length, details: results }
}

async function reconcileBooking(booking) {
  if (!booking.hotelbedsReference) {
    // Cannot poll Hotelbeds without a reference
    console.warn(`[ActivitiesReconciliation] Booking ${booking.bookingId} misses hotelbedsReference, setting to FAILED`)
    assertTransition(booking.status, STATES.FAILED)
    const updated = await bookingStore.update(booking.bookingId, {
      status: STATES.FAILED,
      lastError: 'Missing Hotelbeds reference during reconciliation'
    })
    return { status: updated.status, action: 'FAIL_NO_REF' }
  }

  let hbBooking
  try {
    hbBooking = await client.getBooking(booking.language || 'en', booking.hotelbedsReference)
  } catch (err) {
    if (err.response?.status === 404) {
      // Booking does not exist in HB, mark failed so user can refund
      console.warn(`[ActivitiesReconciliation] Booking ${booking.bookingId} not found in HB (404), marking FAILED`)
      assertTransition(booking.status, STATES.FAILED)
      const updated = await bookingStore.update(booking.bookingId, {
        status: STATES.FAILED,
        lastError: 'Not found in Hotelbeds system'
      })
      return { status: updated.status, action: 'FAIL_404' }
    }
    throw err
  }

  const hbStatus = hbBooking.status || hbBooking.booking?.status || 'UNKNOWN'
  console.log(`[ActivitiesReconciliation] HTB status for ${booking.bookingId}: ${hbStatus}`)

  if (['CONFIRMED', 'ACTIVE'].includes(hbStatus.toUpperCase())) {
    assertTransition(booking.status, STATES.CONFIRMED)
    const voucherUrl = hbBooking.voucherURL || hbBooking.voucher?.url || null
    const updated = await bookingStore.update(booking.bookingId, {
      status: STATES.CONFIRMED,
      voucherUrl,
      rawReconfirmResponse: hbBooking,
      expiresAt: null,
      lastError: null
    })
    console.log(`[ActivitiesReconciliation] Booking ${booking.bookingId} verified as CONFIRMED`)
    return { status: updated.status, action: 'CONFIRMED' }
  } else if (['CANCELLED', 'ANNULLED'].includes(hbStatus.toUpperCase())) {
    assertTransition(booking.status, STATES.CANCELLED)
    const updated = await bookingStore.update(booking.bookingId, {
      status: STATES.CANCELLED,
      cancelledAt: new Date()
    })
    console.log(`[ActivitiesReconciliation] Booking ${booking.bookingId} verified as CANCELLED`)
    return { status: updated.status, action: 'CANCELLED' }
  } else {
    // Keep in RECONFIRM_FAILED, bump attempts
    const updated = await bookingStore.update(booking.bookingId, {
      reconfirmAttempts: (booking.reconfirmAttempts || 0) + 1,
      lastError: `Reconciliation checked status, got: ${hbStatus}`
    })
    console.log(`[ActivitiesReconciliation] Booking ${booking.bookingId} remains stranded in status: ${updated.status}`)
    return { status: updated.status, action: 'NO_CHANGE' }
  }
}

module.exports = {
  reconcileStrandedBookings,
  reconcileBooking
}
