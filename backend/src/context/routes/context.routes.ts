/**
 * Context routes — mounted at /api/context.
 *
 * Phase 1 ships the route table with stub handlers. Subsequent phases wire up
 * the real services. The route shape is stable from day one.
 *
 * Auth: per-route. `authMiddleware` must run BEFORE `contextMiddleware` so
 * `req.user.id` is populated when the lazy `req.context.build()` is called.
 */

import { Router } from 'express'
import { authMiddleware } from '../../middleware/auth.middleware'
import { contextMiddleware } from '../middleware/context.middleware'
import {
  buildContext,
  recommend,
  recordFeedback,
  listNotifications,
  markNotificationRead,
  toggleFavorite,
} from '../controllers/context.controller'

const router = Router()

// All authenticated routes — authMiddleware first, then contextMiddleware.
router.post('/build',            authMiddleware as any, contextMiddleware as any, buildContext      as any)
router.post('/recommend',        authMiddleware as any, contextMiddleware as any, recommend        as any)
router.post('/feedback',         authMiddleware as any, contextMiddleware as any, recordFeedback   as any)
router.post('/memory/favorite',  authMiddleware as any, contextMiddleware as any, toggleFavorite   as any)
router.get( '/notifications',    authMiddleware as any, contextMiddleware as any, listNotifications as any)
router.post('/notifications/:id/read', authMiddleware as any, markNotificationRead as any)

export default router