/**
 * Hotelbeds Activities API Client
 *
 * Low-level HTTP wrapper for the Hotelbeds Activity API:
 *   https://api.test.hotelbeds.com/activity-api/3.0/
 *
 * Credential isolation:
 *   This module reads ONLY ACTIVITIES_HB_API_KEY and ACTIVITIES_HB_SECRET.
 *   It NEVER touches HOTELS_HB_API_KEY, HOTELS_HB_SECRET, or any hotel credential.
 *   Enforced via generateActivitiesHeaders() — a dedicated function that only
 *   resolves ACTIVITIES_HB_* env vars.
 *
 * Features:
 *  - SHA256 signature auto-injection on every request (Activities credentials)
 *  - Retry with exponential backoff (3 attempts)
 *  - Per-surface circuit breakers (search / details / booking)
 *  - Structured error logging (no secrets)
 *  - 15s request timeout
 */

const axios  = require('axios')
const { generateActivitiesHeaders } = require('../middleware/hotelbedsSignature')
const { withRetry, CircuitBreaker } = require('../services/retryService')

const ACTIVITIES_BASE_URL = process.env.ACTIVITIES_HB_BASE_URL
  || 'https://api.test.hotelbeds.com/activity-api/3.0'

// One circuit breaker per logical API surface
const searchCircuit    = new CircuitBreaker('hb-activities-search',  { failureThreshold: 5, timeout: 60000 })
const detailsCircuit   = new CircuitBreaker('hb-activities-details', { failureThreshold: 5, timeout: 60000 })
const bookingCircuit   = new CircuitBreaker('hb-activities-booking', { failureThreshold: 5, timeout: 120000 })

/**
 * Internal request helper — signs, retries, and executes an Axios call.
 * @param {CircuitBreaker} circuit
 * @param {() => Promise} axiosFn
 */
async function request(circuit, axiosFn) {
  return circuit.fire(() =>
    withRetry(axiosFn, {
      maxAttempts: 3,
      baseDelayMs: 600,
      shouldRetry: (err) => {
        const status = err.response?.status
        if (!status) return true               // network error
        if (status === 429) return true        // rate limited
        if (status >= 500) return true         // server error
        return false                           // 4xx — don't retry
      },
    })
  )
}

function logError(label, err) {
  const status  = err.response?.status || 'NO_RESPONSE'
  const body    = err.response?.data   || {}
  const url     = err.config?.url      || label
  console.error(`[ActivitiesClient] ${label} failed — HTTP ${status}`, { url, body })
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * POST /activity-api/3.0/activities
 * Search for activities.
 *
 * @param {object} searchParams — validated search input
 * @returns {object} raw Hotelbeds response
 */
async function searchActivities(searchParams) {
  try {
    const headers = generateActivitiesHeaders()
    const { data } = await request(searchCircuit, () =>
      axios.post(`${ACTIVITIES_BASE_URL}/activities`, searchParams, {
        headers,
        timeout: 15000,
      })
    )
    return data
  } catch (err) {
    logError('searchActivities', err)
    throw err
  }
}

/**
 * POST /activity-api/3.0/activities/details
 * Get activity details including rateKey, sessions, cancellation policies.
 *
 * @param {object} detailsParams — { activityCode, fromDate, toDate, paxes }
 * @returns {object} raw Hotelbeds response
 */
async function getActivityDetails(detailsParams) {
  try {
    const headers = generateActivitiesHeaders()
    const { data } = await request(detailsCircuit, () =>
      axios.post(`${ACTIVITIES_BASE_URL}/activities/details`, detailsParams, {
        headers,
        timeout: 15000,
      })
    )
    return data
  } catch (err) {
    logError('getActivityDetails', err)
    throw err
  }
}

/**
 * PUT /activity-api/3.0/bookings/preconfirm
 * Create a preconfirmed (reserved but unpaid) booking.
 *
 * @param {object} bookingPayload
 * @returns {object} raw Hotelbeds response with booking reference
 */
async function preconfirmBooking(bookingPayload) {
  try {
    const headers = generateActivitiesHeaders()
    const { data } = await request(bookingCircuit, () =>
      axios.put(`${ACTIVITIES_BASE_URL}/bookings/preconfirm`, bookingPayload, {
        headers,
        timeout: 30000,
      })
    )
    return data
  } catch (err) {
    logError('preconfirmBooking', err)
    throw err
  }
}

/**
 * PUT /activity-api/3.0/bookings/reconfirm
 * Confirm a preconfirmed booking (after payment).
 *
 * @param {string} hotelbedsReference
 * @returns {object} raw Hotelbeds response
 */
async function reconfirmBooking(hotelbedsReference) {
  try {
    const headers = generateActivitiesHeaders()
    const { data } = await request(bookingCircuit, () =>
      axios.put(
        `${ACTIVITIES_BASE_URL}/bookings/reconfirm`,
        { bookingReference: hotelbedsReference },
        { headers, timeout: 30000 }
      )
    )
    return data
  } catch (err) {
    logError('reconfirmBooking', err)
    throw err
  }
}

/**
 * GET /activity-api/3.0/bookings/{language}/{reference}
 * Retrieve a booking's latest status, voucher URL, etc.
 *
 * @param {string} language — e.g. 'en'
 * @param {string} reference — Hotelbeds booking reference
 */
async function getBooking(language, reference) {
  try {
    const headers = generateActivitiesHeaders()
    const { data } = await request(bookingCircuit, () =>
      axios.get(
        `${ACTIVITIES_BASE_URL}/bookings/${encodeURIComponent(language)}/${encodeURIComponent(reference)}`,
        { headers, timeout: 15000 }
      )
    )
    return data
  } catch (err) {
    logError('getBooking', err)
    throw err
  }
}

/**
 * GET /activity-api/3.0/bookings/{language}
 * List bookings with optional filters.
 *
 * @param {string} language
 * @param {object} params — { fromDate, toDate, status, from, to }
 */
async function listBookings(language, params = {}) {
  try {
    const headers = generateActivitiesHeaders()
    const { data } = await request(bookingCircuit, () =>
      axios.get(
        `${ACTIVITIES_BASE_URL}/bookings/${encodeURIComponent(language)}`,
        { headers, params, timeout: 15000 }
      )
    )
    return data
  } catch (err) {
    logError('listBookings', err)
    throw err
  }
}

/**
 * DELETE /activity-api/3.0/bookings/{language}/{reference}?cancellationFlag=SIMULATION
 * Simulate cancellation — returns fee + refund without actually cancelling.
 *
 * @param {string} language
 * @param {string} reference
 */
async function simulateCancellation(language, reference) {
  try {
    const headers = generateHotelbedsHeaders()
    const { data } = await request(bookingCircuit, () =>
      axios.delete(
        `${ACTIVITIES_BASE_URL}/bookings/${encodeURIComponent(language)}/${encodeURIComponent(reference)}`,
        { headers, params: { cancellationFlag: 'SIMULATION' }, timeout: 15000 }
      )
    )
    return data
  } catch (err) {
    logError('simulateCancellation', err)
    throw err
  }
}

/**
 * DELETE /activity-api/3.0/bookings/{language}/{reference}?cancellationFlag=CANCELLATION
 * Execute actual cancellation.
 *
 * @param {string} language
 * @param {string} reference
 */
async function cancelBooking(language, reference) {
  try {
    const headers = generateHotelbedsHeaders()
    const { data } = await request(bookingCircuit, () =>
      axios.delete(
        `${ACTIVITIES_BASE_URL}/bookings/${encodeURIComponent(language)}/${encodeURIComponent(reference)}`,
        { headers, params: { cancellationFlag: 'CANCELLATION' }, timeout: 30000 }
      )
    )
    return data
  } catch (err) {
    logError('cancelBooking', err)
    throw err
  }
}

/** Returns circuit breaker diagnostics for health checks */
function getCircuitState() {
  return {
    search:  searchCircuit.toJSON(),
    details: detailsCircuit.toJSON(),
    booking: bookingCircuit.toJSON(),
  }
}

module.exports = {
  searchActivities,
  getActivityDetails,
  preconfirmBooking,
  reconfirmBooking,
  getBooking,
  listBookings,
  simulateCancellation,
  cancelBooking,
  getCircuitState,
}
