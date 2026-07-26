import axios from 'axios'

// 7 days in seconds
export const DEFAULT_TTL_SECONDS = 7 * 24 * 60 * 60

interface CacheEntry<T> {
  value: T
  expiresAt: number
}

// In-Memory Fallback Map
const inMemoryStore = new Map<string, CacheEntry<any>>()

// In-flight promise dedupe — prevents duplicate concurrent API calls for the same key
const inFlight = new Map<string, Promise<any>>()

/**
 * Normalizes Redis cache keys to format: images:{provider}:{query}
 * Examples:
 *   images:google:{placeId}
 *   images:unsplash:{query}
 *   images:pexels:{query}
 */
export function formatImageCacheKey(provider: string, query: string): string {
  const cleanProvider = provider.toLowerCase().trim()
  const cleanQuery = query
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 180)
  return `images:${cleanProvider}:${cleanQuery || 'default'}`
}

/**
 * Gets a cached item from Upstash Redis or In-Memory fallback.
 */
export async function cacheGet<T = any>(key: string): Promise<T | null> {
  const restUrl = process.env.UPSTASH_REDIS_REST_URL
  const restToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (restUrl && restToken) {
    try {
      const res = await axios.get(`${restUrl}/get/${encodeURIComponent(key)}`, {
        headers: { Authorization: `Bearer ${restToken}` },
        timeout: 2000,
      })
      if (res.data && res.data.result != null && res.data.result !== '') {
        try {
          return JSON.parse(res.data.result) as T
        } catch {
          return res.data.result as T
        }
      }
    } catch (err: any) {
      console.warn(`[RedisCache] Upstash GET error for key ${key}: ${err.message}`)
    }
  }

  // In-Memory Fallback
  const entry = inMemoryStore.get(key)
  if (entry) {
    if (Date.now() < entry.expiresAt) {
      return entry.value as T
    }
    inMemoryStore.delete(key)
  }

  return null
}

/**
 * Sets a cached item in Upstash Redis and In-Memory fallback with 7-day TTL.
 */
export async function cacheSet<T = any>(
  key: string,
  value: T,
  ttlSeconds: number = DEFAULT_TTL_SECONDS
): Promise<void> {
  const expiresAt = Date.now() + ttlSeconds * 1000
  inMemoryStore.set(key, { value, expiresAt })

  const restUrl = process.env.UPSTASH_REDIS_REST_URL
  const restToken = process.env.UPSTASH_REDIS_REST_TOKEN

  if (restUrl && restToken) {
    try {
      const valStr = typeof value === 'string' ? value : JSON.stringify(value)
      // Upstash REST SET with EX: POST /set/{key}/{value}?EX={ttl}
      await axios.post(
        `${restUrl}/set/${encodeURIComponent(key)}/${encodeURIComponent(valStr)}?EX=${ttlSeconds}`,
        null,
        {
          headers: {
            Authorization: `Bearer ${restToken}`,
          },
          timeout: 2500,
        }
      )
    } catch (err: any) {
      // Fallback: body-style set used by some Upstash clients
      try {
        const valStr = typeof value === 'string' ? value : JSON.stringify(value)
        await axios.post(
          `${restUrl}/set/${encodeURIComponent(key)}?EX=${ttlSeconds}`,
          valStr,
          {
            headers: {
              Authorization: `Bearer ${restToken}`,
              'Content-Type': 'text/plain',
            },
            timeout: 2500,
          }
        )
      } catch (err2: any) {
        console.warn(`[RedisCache] Upstash SET error for key ${key}: ${err2.message}`)
      }
    }
  }
}

/**
 * Deduplicates concurrent async work for the same key.
 * First caller runs `fn`; subsequent callers await the same promise.
 */
export async function withInFlightDedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const existing = inFlight.get(key)
  if (existing) {
    return existing as Promise<T>
  }

  const promise = (async () => {
    try {
      return await fn()
    } finally {
      inFlight.delete(key)
    }
  })()

  inFlight.set(key, promise)
  return promise
}

/**
 * Cache-aside helper: return cached value or compute, store, and return.
 */
export async function cacheGetOrSet<T>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
  options?: { cacheEmpty?: boolean }
): Promise<T> {
  const cached = await cacheGet<T>(key)
  if (cached != null) {
    return cached
  }

  return withInFlightDedupe(key, async () => {
    // Double-check after winning the lock
    const again = await cacheGet<T>(key)
    if (again != null) return again

    const value = await fn()
    const shouldCache =
      options?.cacheEmpty === true ||
      (value != null &&
        !(Array.isArray(value) && value.length === 0) &&
        !(typeof value === 'object' && Object.keys(value as object).length === 0))

    if (shouldCache) {
      await cacheSet(key, value, ttlSeconds)
    }
    return value
  })
}
