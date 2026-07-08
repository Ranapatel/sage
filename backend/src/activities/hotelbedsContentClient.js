/**
 * Hotelbeds Activities Content API Client
 *
 * Low-level client for static activities catalog data curation.
 */

const axios = require('axios')
const { generateActivitiesHeaders } = require('../middleware/hotelbedsSignature')
const { withRetry, CircuitBreaker } = require('../services/retryService')

const CONTENT_BASE_URL = process.env.ACTIVITIES_HB_CONTENT_URL
  || 'https://api.test.hotelbeds.com/activity-content-api/1.0'

const contentCircuit = new CircuitBreaker('hb-activities-content', {
  failureThreshold: 5,
  timeout: 120000,
})

async function request(label, axiosFn) {
  try {
    return await contentCircuit.fire(() =>
      withRetry(axiosFn, {
        maxAttempts: 3,
        baseDelayMs: 1000,
        shouldRetry: (err) => {
          const status = err.response?.status
          if (!status) return true
          return status === 429 || status >= 500
        },
      })
    )
  } catch (err) {
    logError(label, err)
    throw err
  }
}

function logError(label, err) {
  const status = err.response?.status || 'NO_RESPONSE'
  const body = err.response?.data || {}
  const url = err.config?.url || label
  console.error(`[ActivitiesContentClient] ${label} failed - HTTP ${status}`, { url, body })
}

function getHeaders() {
  return generateActivitiesHeaders()
}

async function getActivities(params = {}) {
  const { data } = await request('getActivities', () =>
    axios.get(`${CONTENT_BASE_URL}/activities`, {
      headers: getHeaders(),
      params,
      timeout: 45000,
    })
  )
  return data
}

async function getDestinations(params = {}) {
  const { data } = await request('getDestinations', () =>
    axios.get(`${CONTENT_BASE_URL}/destinations`, {
      headers: getHeaders(),
      params,
      timeout: 30000,
    })
  )
  return data
}

module.exports = {
  getActivities,
  getDestinations,
}
