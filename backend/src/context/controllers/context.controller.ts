/**
 * Context controller — thin handlers that defer to the context services.
 *
 * Phase 3: build + recommend dispatch to the real services.
 * Phase 4: budget.plan reads from Prisma; recommendation.log persists Feedback.
 * Phase 6: feedback endpoint records Feedback + updates RecommendationLog.
 */

import type { Request, Response } from 'express'
import type { ContextRequest } from '../middleware/context.middleware'
import { recommend as recommendService, markRecommendation } from '../recommendation.service'
import { recordFeedback as recordFeedbackSvc, listNotifications as listNotificationsSvc, markNotificationRead as markNotificationReadSvc, addFavoriteHotel, removeFavoriteHotel, addFavoriteActivity, removeFavoriteActivity } from '../memory.service'
import type { ModuleId } from '../context.types'

const ALL_MODULES: ModuleId[] = [
  'budget', 'transport', 'weather', 'hotel', 'restaurant', 'route',
  'itinerary', 'rental', 'activity', 'notification',
]

/**
 * POST /api/context/build
 * Builds the ContextObject for the authenticated user.
 * Body: { tripId?: string, bypassCache?: boolean }
 */
export async function buildContext(req: ContextRequest, res: Response) {
  const userId = req.user?.id
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Not authenticated' })
  }

  const { tripId, bypassCache } = (req.body ?? {}) as { tripId?: string; bypassCache?: boolean }
  try {
    const ctx = await req.context.build({ userId, tripId, bypassCache })
    return res.json({ success: true, context: ctx })
  } catch (err: any) {
    console.error('[ContextController] build error:', err?.message || err)
    return res.status(500).json({
      success: false,
      error: 'Failed to build context',
      details: process.env.NODE_ENV === 'production' ? undefined : err?.message,
    })
  }
}

/**
 * POST /api/context/recommend
 * Body: { module: ModuleId, input: unknown, tripId?: string, bypassCache?: boolean }
 */
export async function recommend(req: ContextRequest, res: Response) {
  const userId = req.user?.id
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Not authenticated' })
  }

  const { module: moduleId, input, tripId, bypassCache } = (req.body ?? {}) as {
    module?: string
    input?: unknown
    tripId?: string
    bypassCache?: boolean
  }

  if (!moduleId || !ALL_MODULES.includes(moduleId as ModuleId)) {
    return res.status(400).json({
      success: false,
      error: `module is required and must be one of: ${ALL_MODULES.join(', ')}`,
    })
  }

  try {
    const recommendations = await recommendService({
      userId,
      module: moduleId as ModuleId,
      tripId,
      input,
      bypassCache,
    })
    return res.json({ success: true, module: moduleId, recommendations })
  } catch (err: any) {
    console.error('[ContextController] recommend error:', err?.message || err)
    return res.status(500).json({
      success: false,
      error: 'Failed to generate recommendations',
      details: process.env.NODE_ENV === 'production' ? undefined : err?.message,
    })
  }
}

/**
 * POST /api/context/feedback
 * Records user feedback. Body: { recommendationId, action, rating?, metadata? }
 */
export async function recordFeedback(req: ContextRequest, res: Response) {
  const userId = req.user?.id
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Not authenticated' })
  }

  const { recommendationId, module: moduleId, targetId, action, rating, tripId, metadata } = (req.body ?? {}) as {
    recommendationId?: string
    module?: string
    targetId?: string
    action?: string
    rating?: number
    tripId?: string
    metadata?: any
  }

  if (!action || !moduleId || !targetId) {
    return res.status(400).json({ success: false, error: 'action, module, targetId are required' })
  }

  const validActions = ['SAVED', 'SKIPPED', 'RATED', 'BOOKED', 'CANCELLED', 'CLICKED', 'IGNORED']
  if (!validActions.includes(action)) {
    return res.status(400).json({ success: false, error: `action must be one of: ${validActions.join(', ')}` })
  }

  try {
    const fb = await recordFeedbackSvc({
      userId,
      tripId,
      module: moduleId,
      targetId,
      action: action as any,
      rating,
      metadata,
    })

    // Phase 6: also flip the matching RecommendationLog.accepted for positive
    // (SAVED/BOOKED/RATED ≥4/CLICKED) or negative actions. Best-effort.
    const isPositive = ['SAVED', 'BOOKED', 'CLICKED'].includes(action) ||
      (action === 'RATED' && typeof rating === 'number' && rating >= 4)
    const isNegative = ['SKIPPED', 'IGNORED', 'CANCELLED'].includes(action) ||
      (action === 'RATED' && typeof rating === 'number' && rating <= 2)
    if (isPositive || isNegative) {
      try {
        await markRecommendation({
          userId,
          module: moduleId as ModuleId,
          accepted: isPositive,
        })
      } catch {
        /* best-effort */
      }
    }

    return res.json({ success: true, feedback: fb })
  } catch (err: any) {
    console.error('[ContextController] feedback error:', err?.message || err)
    return res.status(500).json({
      success: false,
      error: 'Failed to record feedback',
      details: process.env.NODE_ENV === 'production' ? undefined : err?.message,
    })
  }
}

/**
 * GET /api/context/notifications
 * Body: ?onlyUnread=true&limit=50
 */
export async function listNotifications(req: ContextRequest, res: Response) {
  const userId = req.user?.id
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Not authenticated' })
  }

  const { onlyUnread, limit } = req.query as { onlyUnread?: string; limit?: string }
  try {
    const notifications = await listNotificationsSvc(userId, {
      onlyUnread: onlyUnread === 'true',
      limit: limit ? parseInt(limit, 10) : undefined,
    })
    return res.json({ success: true, notifications })
  } catch (err: any) {
    console.error('[ContextController] notifications error:', err?.message || err)
    return res.status(500).json({
      success: false,
      error: 'Failed to list notifications',
      details: process.env.NODE_ENV === 'production' ? undefined : err?.message,
    })
  }
}

/**
 * POST /api/context/notifications/:id/read
 */
export async function markNotificationRead(req: ContextRequest, res: Response) {
  const userId = req.user?.id
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Not authenticated' })
  }

  const { id } = req.params as { id: string }
  try {
    const ok = await markNotificationReadSvc(id, userId)
    if (!ok) {
      return res.status(404).json({ success: false, error: 'Notification not found' })
    }
    return res.json({ success: true, id, read: true })
  } catch (err: any) {
    console.error('[ContextController] markNotificationRead error:', err?.message || err)
    return res.status(500).json({
      success: false,
      error: 'Failed to mark notification read',
      details: process.env.NODE_ENV === 'production' ? undefined : err?.message,
    })
  }
}

/**
 * POST /api/context/memory/favorite
 * Body: { type: 'hotel' | 'activity', action: 'add' | 'remove', ... }
 */
export async function toggleFavorite(req: ContextRequest, res: Response) {
  const userId = req.user?.id
  if (!userId) {
    return res.status(401).json({ success: false, error: 'Not authenticated' })
  }

  const { type, action, hotelId, hotelName, city, rating, activityId, name } = (req.body ?? {}) as {
    type?: string
    action?: string
    hotelId?: string
    hotelName?: string
    city?: string
    rating?: number
    activityId?: string
    name?: string
  }

  if (!type || !action) {
    return res.status(400).json({ success: false, error: 'type and action are required' })
  }

  try {
    if (type === 'hotel') {
      if (!hotelId || !hotelName) {
        return res.status(400).json({ success: false, error: 'hotelId and hotelName are required for hotel favorites' })
      }
      if (action === 'add') {
        const fav = await addFavoriteHotel({ userId, hotelId, hotelName, city, rating })
        return res.json({ success: true, favorite: fav })
      } else {
        const ok = await removeFavoriteHotel(userId, hotelId)
        return res.json({ success: ok })
      }
    } else if (type === 'activity') {
      if (!activityId || !name) {
        return res.status(400).json({ success: false, error: 'activityId and name are required for activity favorites' })
      }
      if (action === 'add') {
        const fav = await addFavoriteActivity({ userId, activityId, name, city })
        return res.json({ success: true, favorite: fav })
      } else {
        // For activity removal, the frontend must pass the favorite-row id.
        // Accept either id or activityId for ergonomics.
        const { id } = (req.body ?? {}) as { id?: string }
        const targetId = id || activityId
        const ok = await removeFavoriteActivity(targetId)
        return res.json({ success: ok })
      }
    } else {
      return res.status(400).json({ success: false, error: `type must be 'hotel' or 'activity'` })
    }
  } catch (err: any) {
    console.error('[ContextController] toggleFavorite error:', err?.message || err)
    return res.status(500).json({
      success: false,
      error: 'Failed to update favorite',
      details: process.env.NODE_ENV === 'production' ? undefined : err?.message,
    })
  }
}