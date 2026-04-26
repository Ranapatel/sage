const Redis = require('ioredis');

let client = null;
let isConnected = false;

async function connectRedis() {
  // Support both REDIS_URL and individual REDIS_HOST/PORT/PASSWORD env variables
  let url = process.env.REDIS_URL;

  if (!url) {
    const host = process.env.REDIS_HOST;
    const port = process.env.REDIS_PORT || 6379;
    const password = process.env.REDIS_PASSWORD;

    if (host) {
      url = password ? `redis://:${password}@${host}:${port}` : `redis://${host}:${port}`;
    }
  }

  if (!url) {
    console.warn('[TripSage] ⚠️ REDIS_URL (or REDIS_HOST) not set. Skipping Redis connection.');
    return null;
  }

  try {
    // Validate Redis host, port, and password from environment variables
    const parsedUrl = new URL(url);
    if (!parsedUrl.hostname || !parsedUrl.port) {
      console.warn('[TripSage] ⚠️ Invalid Redis URL structure (missing host or port). Skipping Redis connection.');
      return null;
    }
  } catch (err) {
    console.warn('[TripSage] ⚠️ Invalid REDIS_URL format. Skipping Redis connection.');
    return null;
  }

  client = new Redis(url, {
    connectTimeout: 10000,
    maxRetriesPerRequest: null,
    lazyConnect: true,
    retryStrategy(times) {
      // Exponential backoff
      if (times > 5) {
        console.warn('[TripSage] ⚠️ Redis failed to connect after 5 attempts. Giving up and proceeding without cache.');
        return null; // Stop retrying
      }
      const delay = Math.min(times * 100, 3000);
      return delay;
    }
  });

  let lastError = '';
  client.on('error', (err) => {
    const errMsg = err.message || err.code || String(err);
    if (errMsg !== lastError) {
      console.warn(`[Redis] Error: ${errMsg}`);
      lastError = errMsg;
    }
    isConnected = false;
  });

  client.on('connect', () => {
    lastError = '';
    console.log('[Redis] Connected');
  });

  client.on('ready', () => {
    isConnected = true;
  });

  client.on('close', () => {
    isConnected = false;
  });

  client.on('reconnecting', () => {
    console.log('[Redis] Reconnecting...');
    isConnected = false;
  });

  try {
    await client.connect();
  } catch (err) {
    console.warn(`[TripSage] ⚠️ Initial Redis connection failed: ${err.message}. App will continue without caching.`);
    isConnected = false; // Ensure fallback logic triggers
  }

  return client;
}

const CACHE_TTL = 15 * 60; // 15 minutes

async function cacheGet(key) {
  if (!client || !isConnected) return null;
  try {
    const val = await client.get(key);
    return val ? JSON.parse(val) : null;
  } catch (err) {
    return null;
  }
}

async function cacheSet(key, value, ttl = CACHE_TTL) {
  if (!client || !isConnected) return;
  try {
    await client.setex(key, ttl, JSON.stringify(value));
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

// Generate cache key from query + context
function generateCacheKey(prefix, params) {
  const str = JSON.stringify(params, Object.keys(params).sort());
  const hash = Buffer.from(str).toString('base64').slice(0, 32);
  return `tripsage:${prefix}:${hash}`;
}

module.exports = { connectRedis, cacheGet, cacheSet, cacheDel, generateCacheKey };
