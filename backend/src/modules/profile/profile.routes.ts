import { Router } from 'express'
import { ProfileController } from './profile.controller'
import { authMiddleware } from '../../middleware/auth.middleware'

const router = Router()

// Basic profile details & preferences
router.get('/', authMiddleware as any, ProfileController.getProfile as any)
router.put('/', authMiddleware as any, ProfileController.updateProfile as any)
router.get('/preferences', authMiddleware as any, ProfileController.getPreferences as any)
router.put('/preferences', authMiddleware as any, ProfileController.updatePreferences as any)
router.get('/stats', authMiddleware as any, ProfileController.getStats as any)

// Saved Items bookmarks
router.get('/saved', authMiddleware as any, ProfileController.getSavedItems as any)
router.post('/saved', authMiddleware as any, ProfileController.addSavedItem as any)
router.delete('/saved/:id', authMiddleware as any, ProfileController.removeSavedItem as any)

// Trip Memories
router.get('/memories', authMiddleware as any, ProfileController.getMemories as any)
router.post('/memories', authMiddleware as any, ProfileController.createMemory as any)
router.delete('/memories/:id', authMiddleware as any, ProfileController.deleteMemory as any)

// Sage Wallet Points
router.get('/wallet', authMiddleware as any, ProfileController.getWallet as any)
router.post('/wallet/transaction', authMiddleware as any, ProfileController.createWalletTransaction as any)

// Invite Referrals
router.get('/referrals', authMiddleware as any, ProfileController.getReferrals as any)
router.post('/referrals', authMiddleware as any, ProfileController.createReferral as any)

export default router
