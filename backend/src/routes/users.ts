import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { UserController } from '../modules/users/user.controller'

const router = Router()

router.get('/profile', authMiddleware as any, UserController.getProfile as any)
router.patch('/profile', authMiddleware as any, UserController.updateProfile as any)

export default router
