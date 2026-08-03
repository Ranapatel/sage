import axios from 'axios'

export const DEFAULT_TTL_SECONDS = 7 * 24 * 60 * 60

const inMemoryStore = new Map<string, { value: any; expiresAt: number }>()
const inFlight = new Map<string, Promise<any>>()

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

  const entry = inMemoryStore.get(key)
  if (entry) {
    if (Date.now() < entry.expiresAt) {
      return entry.value as T
    }
    inMemoryStore.delete(key)
  }

  return null
}

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
      await axios.post(
        `${restUrl}/set/${encodeURIComponent(key)}/${encodeURIComponent(valStr)}?EX=${ttlSeconds}`,
        null,
        {
          headers: { Authorization: `Bearer ${restToken}` },
          timeout: 2500,
        }
      )
    } catch (err: any) {
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

export async function withInFlightDedupe<T = any>(key: string, fn: () => Promise<T>): Promise<T> {
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

export async function cacheGetOrSet<T = any>(
  key: string,
  fn: () => Promise<T>,
  ttlSeconds: number = DEFAULT_TTL_SECONDS,
  options?: { cacheEmpty?: boolean }
): Promise<T> {
  const cached = await cacheGet<T>(key)
  if (cached != null) {
    return cached
  }

  return withInFlightDedupe<T>(key, async () => {
    const again = await cacheGet<T>(key)
    if (again != null) return again

    const value = await fn()
    const shouldCache =
      (options && options.cacheEmpty === true) ||
      (value != null &&
        !(Array.isArray(value) && value.length === 0) &&
        !(typeof value === 'object' && Object.keys(value as object).length === 0))

    if (shouldCache) {
      await cacheSet(key, value, ttlSeconds)
    }
    return value
  })
}

module.exports = { DEFAULT_TTL_SECONDS, formatImageCacheKey, cacheGet, cacheSet, withInFlightDedupe, cacheGetOrSet }
module.exports.DEFAULT_TTL_SECONDS = DEFAULT_TTL_SECONDS
module.exports.formatImageCacheKey = formatImageCacheKey
module.exports.cacheGet = cacheGet
module.exports.cacheSet = cacheSet
module.exports.withInFlightDedupe = withInFlightDedupe
module.exports.cacheGetOrSet = cacheGetOrSet
