/**
 * Cache layer — Upstash Redis REST API (HTTPS, works on free tier)
 * No TCP connection. Uses UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN.
 * Falls back to no-op (never crashes) if credentials are absent.
 */

const axios = require('axios')

const REST_URL   = (process.env.UPSTASH_REDIS_REST_URL   || '').replace(/\/$/, '')
const REST_TOKEN = process.env.UPSTASH_REDIS_REST_TOKEN  || ''

const CACHE_TTL = 15 * 60   // 15 minutes
let isConnected = false

// Shared axios instance with auth header pre-set
const upstash = axios.create({
  baseURL: REST_URL,
  timeout: 5000,
  headers: { Authorization: `Bearer ${REST_TOKEN}` },
})

async function connectRedis() {
  if (!REST_URL || !REST_TOKEN) {
    console.warn('[TripSage] ⚠️  UPSTASH_REDIS_REST_URL / TOKEN not set — cache disabled.')
    return null
  }

  try {
    // Upstash REST uses GET /ping (returns {"result":"PONG"})
    const { data } = await upstash.get('/ping')
    if (data?.result === 'PONG') {
      isConnected = true
      console.log('[TripSage] ✅ Upstash Redis connected (REST API)')
      return { type: 'upstash-rest' }
    }
    console.warn('[TripSage] ⚠️  Upstash ping returned unexpected payload:', JSON.stringify(data), '— cache disabled.')
  } catch (err) {
    const reason = err.response?.status
      ? `HTTP ${err.response.status}: ${JSON.stringify(err.response.data)}`
      : err.message
    console.warn(`[TripSage] ⚠️  Upstash Redis unreachable (${reason}) — cache disabled.`)
  }

  isConnected = false
  return null
}

async function cacheGet(key) {
  if (!isConnected) return null
  try {
    const { data } = await upstash.get(`/get/${encodeURIComponent(key)}`)
    const val = data?.result
    return val ? JSON.parse(val) : null
  } catch {
    return null
  }
}

async function cacheSet(key, value, ttl = CACHE_TTL) {
  if (!isConnected) return
  try {
    // Upstash REST: POST /set/<key>/<value>?ex=<ttl>
    await upstash.post(
      `/set/${encodeURIComponent(key)}/${encodeURIComponent(JSON.stringify(value))}`,
      null,
      { params: { ex: ttl } }
    )
  } catch (err) {
    // Silent — cache failure must never break the response
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[TripSage] Cache set error:', err.message)
    }
  }
}

async function cacheDel(key) {
  if (!isConnected) return
  try {
    await upstash.post(`/del/${encodeURIComponent(key)}`)
  } catch { /* silent */ }
}

function generateCacheKey(prefix, params) {
  const sorted = JSON.stringify(params, Object.keys(params).sort())
  const hash   = Buffer.from(sorted).toString('base64url').slice(0, 32)
  return `ts:${prefix}:${hash}`
}

module.exports = { connectRedis, cacheGet, cacheSet, cacheDel, generateCacheKey }
