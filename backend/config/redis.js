const { createClient } = require('redis')

let client = null
let isConnected = false

async function connectRedis() {
  const url = process.env.REDIS_URL
  if (!url) throw new Error('REDIS_URL not set')

  client = createClient({
    url,
    socket: {
      reconnectStrategy: false
    }
  })

  client.on('error', (err) => {
    console.warn('[TripSage] Redis error:', err.message || err.code || String(err))
    isConnected = false
  })

  client.on('connect', () => {
    isConnected = true
    console.log('[TripSage] ✅ Redis connected')
  })

  await client.connect()
  return client
}

const CACHE_TTL = 15 * 60 // 15 minutes

async function cacheGet(key) {
  if (!client || !isConnected) return null
  try {
    const val = await client.get(key)
    return val ? JSON.parse(val) : null
  } catch {
    return null
  }
}

async function cacheSet(key, value, ttl = CACHE_TTL) {
  if (!client || !isConnected) return
  try {
    await client.setEx(key, ttl, JSON.stringify(value))
  } catch (err) {
    console.warn('[TripSage] Cache set error:', err.message)
  }
}

async function cacheDel(key) {
  if (!client || !isConnected) return
  try {
    await client.del(key)
  } catch {}
}

// Generate cache key from query + context
function generateCacheKey(prefix, params) {
  const str = JSON.stringify(params, Object.keys(params).sort())
  const hash = Buffer.from(str).toString('base64').slice(0, 32)
  return `tripsage:${prefix}:${hash}`
}

module.exports = { connectRedis, cacheGet, cacheSet, cacheDel, generateCacheKey }
