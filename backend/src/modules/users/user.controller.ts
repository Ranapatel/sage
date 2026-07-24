import { Response } from 'express'
import { AuthenticatedRequest } from '../../middleware/auth.middleware'
import { UserService } from './user.service'

export class UserController {
  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const user = await UserService.getProfile(req.user!.clerkUserId)
      if (!user) {
        return res.json({
          success: true,
          data: { clerkUserId: req.user!.clerkUserId, email: req.user!.email }
        })
      }
      res.json({ success: true, data: user })
    } catch (err: any) {
      console.warn('[UserController] DB notice during getProfile:', err.message)
      res.json({
        success: true,
        data: { clerkUserId: req.user!.clerkUserId, email: req.user!.email }
      })
    }
  }

  static async updateProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const updated = await UserService.updateProfile(req.user!.clerkUserId, {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        profileImage: req.body.profileImage
      })
      res.json({ success: true, data: updated })
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message })
    }
  }
}
