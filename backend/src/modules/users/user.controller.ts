import { Response } from 'express'
import { AuthenticatedRequest } from '../../middleware/auth.middleware'
import { UserService } from './user.service'

export class UserController {
  static async getProfile(req: AuthenticatedRequest, res: Response) {
    try {
      const user = await UserService.getProfile(req.user!.clerkUserId)
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User profile not found in database'
        })
      }
      res.json({ success: true, data: user })
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message })
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
