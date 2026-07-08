/**
 * Hotelbeds Activities Cache API Client
 *
 * Low-level client for cache endpoints used to power local activity search.
 * This does not participate in live booking transactions.
 */

const axios = require('axios')
const { generateActivitiesHeaders } = require('../middleware/hotelbedsSignature')
const { withRetry, CircuitBreaker } = require('../services/retryService')

const CACHE_BASE_URL = process.env.ACTIVITIES_HB_CACHE_URL
  || 'https://api.test.hotelbeds.com/activity-cache-api/1.0'

const cacheCircuit = new CircuitBreaker('hb-activities-cache', {
  failureThreshold: 5,
  timeout: 120000,
})

async function request(label, axiosFn) {
  try {
    return await cacheCircuit.fire(() =>
      withRetry(axiosFn, {
        maxAttempts: 3,
        baseDelayMs: 750,
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
  console.error(`[ActivitiesCacheClient] ${label} failed - HTTP ${status}`, { url, body })
}

function getHeaders() {
  return generateActivitiesHeaders()
}

async function getPortfolio(params = {}) {
  const { data } = await request('getPortfolio', () =>
    axios.get(`${CACHE_BASE_URL}/portfolio`, {
      headers: getHeaders(),
      params,
      timeout: 30000,
    })
  )
  return data
}

async function getBasicInformation(params = {}) {
  const { data } = await request('getBasicInformation', () =>
    axios.get(`${CACHE_BASE_URL}/basic-information`, {
      headers: getHeaders(),
      params,
      timeout: 30000,
    })
  )
  return data
}

async function getPriceFrom(params = {}) {
  const { data } = await request('getPriceFrom', () =>
    axios.get(`${CACHE_BASE_URL}/price-from`, {
      headers: getHeaders(),
      params,
      timeout: 30000,
    })
  )
  return data
}

async function getModalities(params = {}) {
  const { data } = await request('getModalities', () =>
    axios.get(`${CACHE_BASE_URL}/modalities`, {
      headers: getHeaders(),
      params,
      timeout: 30000,
    })
  )
  return data
}

async function getOperationalDates(params = {}) {
  const { data } = await request('getOperationalDates', () =>
    axios.get(`${CACHE_BASE_URL}/operational-dates`, {
      headers: getHeaders(),
      params,
      timeout: 30000,
    })
  )
  return data
}

function getCircuitState() {
  return cacheCircuit.toJSON()
}

module.exports = {
  getPortfolio,
  getBasicInformation,
  getPriceFrom,
  getModalities,
  getOperationalDates,
  getCircuitState,
}
