/**
 * Context middleware — attaches a *lazy* `req.context` getter so controllers
 * can opt into building the full ContextObject only when they need it.
 *
 * Usage:
 *   await req.context.build({ userId, tripId })  // returns ContextObject
 *
 * Assumes `auth.middleware` has already populated `req.user.id`.
 */

import type { Request, Response, NextFunction } from 'express'
import { AuthenticatedRequest } from '../../middleware/auth.middleware'
import type { ContextObject } from '../context.types'

export interface ContextBuildOptions {
  userId: string
  tripId?: string
  /** Optional override of the cache TTL (seconds). */
  ttlSeconds?: number
  /** Skip cache entirely (e.g. user requested a fresh fetch). */
  bypassCache?: boolean
}

export interface ContextRequest extends AuthenticatedRequest {
  context: {
    build(opts: ContextBuildOptions): Promise<ContextObject>
  }
}

/**
 * Lazy context builder. Phase 2+ wires the real collector + processor via
 * `context.service.bootstrap`. The lazy import keeps the middleware loadable
 * before the bootstrap module exists (boot order safety).
 */
export function contextMiddleware(req: ContextRequest, _res: Response, next: NextFunction) {
  req.context = {
    build: async (opts: ContextBuildOptions): Promise<ContextObject> => {
      const { buildContext } = await import('../context.service.bootstrap')
      return buildContext({
        userId: opts.userId,
        tripId: opts.tripId ?? null,
        ttlSeconds: opts.ttlSeconds,
        bypassCache: opts.bypassCache,
      })
    },
  }
  next()
}