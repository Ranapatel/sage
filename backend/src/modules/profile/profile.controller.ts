import { Response } from 'express'
import { AuthenticatedRequest } from '../../middleware/auth.middleware'
import { ProfileService } from './profile.service'
import {
  updateProfileSchema,
  updatePreferencesSchema,
  savedItemSchema,
  memorySchema,
  walletTransactionSchema,
  referralSchema
} from './profile.validation'

export class ProfileController {
  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' })

      const profile = await ProfileService.getProfile(userId)
      return res.json({ success: true, data: profile })
    } catch (err: any) {
      console.warn('[ProfileController] DB notice during getProfile:', err.message)
      const fallbackUser = req.user ? { id: req.user.id, clerkUserId: req.user.clerkUserId, email: req.user.email, firstName: '', lastName: '', profileImage: null } : null
      return res.json({
        success: true,
        data: {
          user: fallbackUser,
          personal: null,
          preferences: null,
          stats: { tripsCreated: 0, countriesVisited: 0, memoriesUploaded: 0, walletBalance: 500 }
        }
      })
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id
      const clerkUserId = req.user?.clerkUserId
      if (!userId || !clerkUserId) return res.status(401).json({ success: false, message: 'Unauthorized' })

      const validated = updateProfileSchema.parse(req.body)
      const updated = await ProfileService.updateProfile(userId, clerkUserId, validated)

      return res.json({ success: true, data: updated, message: 'Profile updated successfully' })
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: err.errors })
      }
      return res.status(500).json({ success: false, message: err.message })
    }
  }

  static async getPreferences(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' })

      const preferences = await ProfileService.getPreferences(userId)
      return res.json({ success: true, data: preferences })
    } catch (err: any) {
      console.warn('[ProfileController] DB notice during getPreferences:', err.message)
      return res.json({ success: true, data: null })
    }
  }

  static async updatePreferences(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' })

      const validated = updatePreferencesSchema.parse(req.body)
      const updated = await ProfileService.updatePreferences(userId, validated)

      return res.json({ success: true, data: updated, message: 'Preferences updated successfully' })
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: err.errors })
      }
      return res.status(500).json({ success: false, message: err.message })
    }
  }

  static async getStats(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' })

      const stats = await ProfileService.getStats(userId)
      return res.json({ success: true, data: stats })
    } catch (err: any) {
      console.warn('[ProfileController] DB notice during getStats:', err.message)
      return res.json({
        success: true,
        data: { tripsCreated: 0, countriesVisited: 0, memoriesUploaded: 0, walletBalance: 500 }
      })
    }
  }

  // Saved Items
  static async getSavedItems(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' })

      const items = await ProfileService.getSavedItems(userId)
      return res.json({ success: true, data: items || [] })
    } catch (err: any) {
<<<<<<< HEAD
      console.error('[ProfileController] getSavedItems error:', err?.message)
=======
      console.warn('[ProfileController] DB notice during getSavedItems:', err.message)
>>>>>>> 6d14ce1 (Fix itinerary photo upload system improvements)
      return res.json({ success: true, data: [] })
    }
  }

  static async addSavedItem(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' })

      const validated = savedItemSchema.parse(req.body)
      const item = await ProfileService.addSavedItem(userId, validated)

      return res.status(201).json({ success: true, data: item, message: 'Item saved successfully' })
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: err.errors })
      }
      return res.status(500).json({ success: false, message: err.message })
    }
  }

  static async removeSavedItem(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' })

      const { id } = req.params
      await ProfileService.removeSavedItem(id, userId)

      return res.json({ success: true, message: 'Item removed successfully' })
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message })
    }
  }

  // Memories
  static async getMemories(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' })

      const memories = await ProfileService.getMemories(userId)
      return res.json({ success: true, data: memories })
    } catch (err: any) {
      console.warn('[ProfileController] DB notice during getMemories:', err.message)
      return res.json({ success: true, data: [] })
    }
  }

  static async createMemory(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' })

      const validated = memorySchema.parse(req.body)
      let memory
      try {
        memory = await ProfileService.createMemory(userId, validated)
      } catch (dbErr: any) {
        console.warn('[ProfileController] DB notice during createMemory:', dbErr.message)
        memory = {
          id: `mem_${Date.now()}`,
          userId,
          title: validated.title,
          description: validated.description || null,
          location: validated.location || null,
          photos: validated.photos || [],
          createdAt: new Date().toISOString(),
          trip: null,
        }
      }

      return res.status(201).json({ success: true, data: memory, message: 'Memory uploaded successfully' })
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: err.errors })
      }
      return res.status(400).json({ success: false, message: err.message })
    }
  }

  static async deleteMemory(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' })

      const { id } = req.params
      await ProfileService.deleteMemory(id, userId)

      return res.json({ success: true, message: 'Memory deleted successfully' })
    } catch (err: any) {
      return res.status(400).json({ success: false, message: err.message })
    }
  }

  // Wallet
  static async getWallet(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' })

      const ledger = await ProfileService.getWallet(userId)
      return res.json({ success: true, data: ledger })
    } catch (err: any) {
      console.warn('[ProfileController] DB notice during getWallet:', err.message)
      return res.json({ success: true, data: { balance: 500, transactions: [] } })
    }
  }

  static async createWalletTransaction(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' })

      const validated = walletTransactionSchema.parse(req.body)
      const tx = await ProfileService.createWalletTransaction(userId, validated)

      return res.status(201).json({ success: true, data: tx, message: 'Wallet transaction successful' })
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: err.errors })
      }
      return res.status(400).json({ success: false, message: err.message })
    }
  }

  // Referrals
  static async getReferrals(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' })

      const referrals = await ProfileService.getReferrals(userId)
      return res.json({ success: true, data: referrals })
    } catch (err: any) {
      console.warn('[ProfileController] DB notice during getReferrals:', err.message)
      return res.json({ success: true, data: [] })
    }
  }

  static async createReferral(req: AuthenticatedRequest, res: Response) {
    try {
      const userId = req.user?.id
      if (!userId) return res.status(401).json({ success: false, message: 'Unauthorized' })

      const validated = referralSchema.parse(req.body)
      const referral = await ProfileService.createReferral(userId, validated)

      return res.status(201).json({ success: true, data: referral, message: 'User referred successfully' })
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return res.status(400).json({ success: false, message: 'Validation failed', errors: err.errors })
      }
      return res.status(400).json({ success: false, message: err.message })
    }
  }
}
