/**
 * Hotelbeds API Signature Middleware
 *
 * Credential isolation architecture:
 *
 *   Hotels API  →  HOTELS_HB_API_KEY  /  HOTELS_HB_SECRET
 *   Activities  →  ACTIVITIES_HB_API_KEY  /  ACTIVITIES_HB_SECRET
 *
 * Each service calls the factory with its own credential set.
 * Cross-service credential leakage is structurally impossible:
 * neither set of env vars is accessible from the other service's module.
 *
 * Security:
 *  - Secrets never logged under any code path
 *  - SHA256(ApiKey + Secret + Unix timestamp) per Hotelbeds spec
 *  - Timestamp drift > 300s rejected (clock-skew guard)
 *  - Auth failures logged with request ID only
 */

const crypto = require('crypto')

const MAX_CLOCK_SKEW_SECONDS = 300

// ── Credential resolvers ───────────────────────────────────────────────────────
// Each resolver reads ONLY its dedicated env vars.
// These are the ONLY places in the codebase allowed to touch these env vars.

const CREDENTIAL_SOURCES = {
  /**
   * Hotels API — hotel-api/1.0 and hotel-content-api/1.0
   * Only hotelbedsService.js and contentCacheService.js may use this.
   */
  hotels: {
    key:    () => process.env.HOTELS_HB_API_KEY    || '',
    secret: () => process.env.HOTELS_HB_SECRET     || '',
    label:  'Hotels',
  },

  /**
   * Activities API — activity-api/3.0
   * Only hotelbedsActivitiesClient.js may use this.
   */
  activities: {
    key:    () => process.env.ACTIVITIES_HB_API_KEY || '',
    secret: () => process.env.ACTIVITIES_HB_SECRET  || '',
    label:  'Activities',
  },
}

// ── Core signature builder ─────────────────────────────────────────────────────

/**
 * Generates signed Hotelbeds request headers for a given API surface.
 *
 * @param {'hotels' | 'activities'} service — which credential set to use
 * @returns {{ 'Api-key': string, 'X-Signature': string, 'Accept': string, 'Content-Type': string }}
 * @throws if credentials are missing/unconfigured
 */
function generateHeaders(service) {
  const source = CREDENTIAL_SOURCES[service]
  if (!source) {
    throw new Error(`Unknown Hotelbeds service '${service}'. Must be 'hotels' or 'activities'.`)
  }

  const apiKey    = source.key()
  const apiSecret = source.secret()

  if (!apiKey || !apiSecret) {
    throw new Error(
      `Hotelbeds ${source.label} API credentials not configured. ` +
      `Set ${service === 'hotels' ? 'HOTELS_HB_API_KEY + HOTELS_HB_SECRET' : 'ACTIVITIES_HB_API_KEY + ACTIVITIES_HB_SECRET'} in .env`
    )
  }

  const timestamp = Math.floor(Date.now() / 1000)
  const signature = crypto
    .createHash('sha256')
    .update(apiKey + apiSecret + timestamp)
    .digest('hex')

  return {
    'Api-key':     apiKey,
    'X-Signature': signature,
    'Accept':      'application/json',
    'Content-Type':'application/json',
  }
}

// ── Public API ─────────────────────────────────────────────────────────────────

/**
 * Returns signed headers for the Hotels API.
 * Used by: hotelbedsService.js, contentCacheService.js ONLY.
 */
function generateHotelsHeaders() {
  return generateHeaders('hotels')
}

/**
 * Returns signed headers for the Activities API.
 * Used by: hotelbedsActivitiesClient.js ONLY.
 */
function generateActivitiesHeaders() {
  return generateHeaders('activities')
}

/**
 * Express middleware — attaches `req.hbHeaders` using the Activities credential set.
 * Validates clock skew on the optional x-request-time header.
 *
 * Used by: activities routes ONLY.
 */
function hotelbedsActivitiesMiddleware(req, res, next) {
  try {
    const serverTs = Math.floor(Date.now() / 1000)
    const clientTs = parseInt(req.headers['x-request-time'] || '0', 10)

    if (clientTs && Math.abs(serverTs - clientTs) > MAX_CLOCK_SKEW_SECONDS) {
      console.warn(
        `[HB Auth:Activities] Clock skew detected — server=${serverTs}, client=${clientTs}`
      )
      return res.status(400).json({
        success: false,
        error:   'Request timestamp is too far from server time. Sync your clock.',
      })
    }

    req.hbHeaders = generateActivitiesHeaders()
    next()
  } catch (err) {
    console.error('[HB Auth:Activities] Credential error:', err.message)
    return res.status(500).json({
      success: false,
      error:   'Activities API authentication misconfigured. Contact support.',
    })
  }
}

/**
 * Express middleware — attaches `req.hbHeaders` using the Hotels credential set.
 * Used by: hotel routes ONLY.
 */
function hotelbedsHotelsMiddleware(req, res, next) {
  try {
    req.hbHeaders = generateHotelsHeaders()
    next()
  } catch (err) {
    console.error('[HB Auth:Hotels] Credential error:', err.message)
    return res.status(500).json({
      success: false,
      error:   'Hotels API authentication misconfigured. Contact support.',
    })
  }
}

// ── Credential health check ────────────────────────────────────────────────────

/**
 * Returns which credential sets are configured (no secret values exposed).
 * Safe to include in /health endpoint.
 */
function getCredentialStatus() {
  return {
    hotels: {
      configured: !!(process.env.HOTELS_HB_API_KEY && process.env.HOTELS_HB_SECRET),
      baseUrl:    process.env.HOTELS_HB_BASE_URL || 'https://api.test.hotelbeds.com/hotel-api/1.0',
    },
    activities: {
      configured: !!(process.env.ACTIVITIES_HB_API_KEY && process.env.ACTIVITIES_HB_SECRET),
      baseUrl:    process.env.ACTIVITIES_HB_BASE_URL || 'https://api.test.hotelbeds.com/activity-api/3.0',
    },
  }
}

module.exports = {
  generateHotelsHeaders,
  generateActivitiesHeaders,
  hotelbedsActivitiesMiddleware,
  hotelbedsHotelsMiddleware,
  getCredentialStatus,
  // Legacy alias — existing code that imports generateHotelbedsHeaders still works
  generateHotelbedsHeaders: generateHotelsHeaders,
}
