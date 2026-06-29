/**
 * Activities Repository
 *
 * Handles Redis rateKey TTL management (primary) with MongoDB fallback.
 * Redis TTL = 1800s (30 minutes) per Hotelbeds spec — rateKeys are single-use
 * and must be invalidated after consumption.
 */

const { cacheGet, cacheSet, cacheDel } = require('../../config/redis')
const { activityCache }                = require('../models/Activity')

const RATE_KEY_TTL = 30 * 60  // 1800 seconds

// ── rateKey Management ────────────────────────────────────────────────────────

/**
 * Store a rateKey in Redis with 30-minute TTL.
 * Falls back to a module-level Map if Redis is unavailable.
 *
 * @param {string} bookingId  — client booking UUID (used as namespace)
 * @param {string} rateKey    — Hotelbeds rate key string
 * @param {object} metadata   — { activityCode, amount, currency, fromDate, toDate }
 */
const memoryRateKeys = new Map()

async function storeRateKey(bookingId, rateKey, metadata = {}) {
  const redisKey = `ts:ratekey:${bookingId}`
  const payload  = { rateKey, ...metadata, storedAt: Date.now() }

  try {
    await cacheSet(redisKey, payload, RATE_KEY_TTL)
    console.log(`[RateKey] Stored in Redis (TTL ${RATE_KEY_TTL}s) for booking ${bookingId}`)
  } catch (err) {
    console.warn('[RateKey] Redis unavailable — using memory fallback:', err.message)
  }

  // Always write to memory as belt-and-suspenders
  memoryRateKeys.set(bookingId, {
    ...payload,
    expiresAt: Date.now() + RATE_KEY_TTL * 1000,
  })
}

/**
 * Retrieve and validate a stored rateKey.
 * Returns null if expired or not found.
 *
 * @param {string} bookingId
 * @returns {{ rateKey: string, [k: string]: any } | null}
 */
async function getRateKey(bookingId) {
  const redisKey = `ts:ratekey:${bookingId}`

  // Try Redis first
  try {
    const cached = await cacheGet(redisKey)
    if (cached) {
      console.log(`[RateKey] Cache HIT (Redis) for booking ${bookingId}`)
      return cached
    }
  } catch (err) {
    console.warn('[RateKey] Redis get failed, checking memory:', err.message)
  }

  // Fallback to memory
  const mem = memoryRateKeys.get(bookingId)
  if (mem) {
    if (Date.now() > mem.expiresAt) {
      memoryRateKeys.delete(bookingId)
      console.warn(`[RateKey] Memory key EXPIRED for booking ${bookingId}`)
      return null
    }
    console.log(`[RateKey] Cache HIT (memory) for booking ${bookingId}`)
    return mem
  }

  console.warn(`[RateKey] Cache MISS for booking ${bookingId}`)
  return null
}

/**
 * Invalidate (delete) a rateKey after single use.
 *
 * @param {string} bookingId
 */
async function invalidateRateKey(bookingId) {
  const redisKey = `ts:ratekey:${bookingId}`
  try {
    await cacheDel(redisKey)
  } catch (err) {
    console.warn('[RateKey] Redis delete failed:', err.message)
  }
  memoryRateKeys.delete(bookingId)
  console.log(`[RateKey] Invalidated for booking ${bookingId}`)
}

/**
 * Check if a rateKey is still valid (not expired, not invalidated).
 *
 * @param {string} bookingId
 * @returns {boolean}
 */
async function isRateKeyValid(bookingId) {
  const entry = await getRateKey(bookingId)
  return entry !== null
}

// ── Activity Data Access ──────────────────────────────────────────────────────

/**
 * Cache a batch of normalized activities from a search response.
 *
 * @param {object[]} activities
 */
async function cacheActivities(activities) {
  if (!activities || !activities.length) return
  await activityCache.mset(activities)
}

/**
 * Get a single cached activity.
 *
 * @param {string} activityCode
 */
async function getCachedActivity(activityCode) {
  return activityCache.get(activityCode)
}

module.exports = {
  storeRateKey,
  getRateKey,
  invalidateRateKey,
  isRateKeyValid,
  cacheActivities,
  getCachedActivity,
}
