/**
 * Context bootstrap — entry point used by the Express middleware.
 *
 * Wires the collector → processor pipeline with cache-aside via
 * `cacheGetOrSet` (Upstash + in-memory fallback). Returns the canonical
 * `ContextObject`.
 */

import { cacheGetOrSet } from '../cache/redis'
import { CTX_CACHE_PREFIX, DEFAULT_TTL_SECONDS } from './context.constants'
import { collectContext } from './collector.service'
import { processContext } from './processor.service'
import type { ContextObject } from './context.types'
import type { AuthenticatedRequest } from '../middleware/auth.middleware'

export interface BuildOptions {
  userId: string
  tripId?: string | null
  ttlSeconds?: number
  bypassCache?: boolean
}

function cacheKey(userId: string, tripId?: string | null): string {
  return `${CTX_CACHE_PREFIX}${userId}:${tripId ?? 'none'}`
}

/**
 * Build a fresh ContextObject for the given user/trip.
 * Used both by the middleware and by direct callers (e.g. budget service).
 */
export async function buildContext(opts: BuildOptions): Promise<ContextObject> {
  const key = cacheKey(opts.userId, opts.tripId)
  const ttl = opts.ttlSeconds ?? DEFAULT_TTL_SECONDS

  if (opts.bypassCache) {
    const raw = await collectContext({ userId: opts.userId, tripId: opts.tripId ?? undefined })
    return processContext(raw)
  }

  return cacheGetOrSet<ContextObject>(
    key,
    async () => {
      const raw = await collectContext({ userId: opts.userId, tripId: opts.tripId ?? undefined })
      return processContext(raw)
    },
    ttl
  )
}

/**
 * Middleware-facing wrapper. Resolves the user from req.user and forwards.
 */
export async function buildContextForRequest(
  req: AuthenticatedRequest,
  opts: { userId?: string; tripId?: string; ttlSeconds?: number; bypassCache?: boolean }
): Promise<ContextObject> {
  const userId = opts.userId ?? req.user?.id
  if (!userId) {
    throw new Error('buildContextForRequest: userId is required (req.user.id missing)')
  }
  return buildContext({
    userId,
    tripId: opts.tripId ?? null,
    ttlSeconds: opts.ttlSeconds,
    bypassCache: opts.bypassCache,
  })
}

/**
 * Invalidate the cached context for a user/trip. Call after writes (feedback,
 * preferences update, favorite toggled) so the next read picks up fresh data.
 */
export async function invalidateContext(userId: string, tripId?: string | null): Promise<void> {
  const key = cacheKey(userId, tripId ?? null)
  // Best-effort: call cacheGetOrSet with a no-op to leverage dedupe, then
  // delete via the lower-level cacheGet (which exposes nothing — we instead
  // use the public Upstash REST API via config/redis.js).
  try {
    const restUrl = process.env.UPSTASH_REDIS_REST_URL
    const restToken = process.env.UPSTASH_REDIS_REST_TOKEN
    if (restUrl && restToken) {
      const axios = (await import('axios')).default
      await axios.get(
        `${restUrl}/del/${encodeURIComponent(key)}`,
        {
          headers: { Authorization: `Bearer ${restToken}` },
          timeout: 1500,
        }
      )
    }
  } catch {
    // Best-effort — failing to invalidate just means stale data until TTL.
  }
}