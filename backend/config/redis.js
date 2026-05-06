const { Redis } = require('@upstash/redis');

let client = null;
let isConnected = false;

async function connectRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn('[TripSage] ⚠️ Upstash Redis URL or Token not set. Skipping Redis connection.');
    return null;
  }

  try {
    client = new Redis({
      url,
      token,
    });
    
    // Upstash Redis is REST based, ping to verify connection
    await client.ping();
    isConnected = true;
    console.log('[TripSage] ✅ Connected to Upstash Redis (REST)');
    return client;
  } catch (err) {
    console.warn(`[TripSage] ⚠️ Initial Redis connection failed: ${err.message}. App will continue without caching.`);
    client = null;
    isConnected = false;
    return null;
  }
}

const CACHE_TTL = 15 * 60; // 15 minutes

async function cacheGet(key) {
  if (!client || !isConnected) return null;
  try {
    const val = await client.get(key);
    // Upstash automatically parses JSON if it was stored as an object,
    // but if it's a raw stringified JSON, we need to handle it.
    if (typeof val === 'string') {
      try { return JSON.parse(val); } catch (e) { return val; }
    }
    return val;
  } catch (err) {
    return null;
  }
}

async function cacheSet(key, value, ttl = CACHE_TTL) {
  if (!client || !isConnected) return;
  try {
    // Upstash `.set` accepts options for expiration
    await client.set(key, value, { ex: ttl });
  } catch (err) {
    console.warn('[TripSage] Cache set error:', err.message);
  }
}

async function cacheDel(key) {
  if (!client || !isConnected) return;
  try {
    await client.del(key);
  } catch (err) {}
}

const crypto = require('crypto');

// Generate cache key from query + context
function generateCacheKey(prefix, params) {
  const str = JSON.stringify(params, Object.keys(params).sort());
  const hash = crypto.createHash('sha256').update(str).digest('hex');
  return `tripsage:${prefix}:${hash}`;
}

module.exports = { connectRedis, cacheGet, cacheSet, cacheDel, generateCacheKey };
