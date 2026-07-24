import { Response } from 'express'
import { AuthenticatedRequest } from '../../middleware/auth.middleware'
import { TripService } from './trip.service'

export class TripController {
  static async getTrips(req: AuthenticatedRequest, res: Response) {
    try {
      const trips = await TripService.getUserTrips(req.user!.id)
      res.json({ success: true, data: trips })
    } catch (err: any) {
      console.warn('[TripController] DB notice during getTrips:', err.message)
      res.json({ success: true, data: [] })
    }
  }

  static async createTrip(req: AuthenticatedRequest, res: Response) {
    try {
      // Validate inputs
      const { destination, title, startDate, endDate, budget, travelers, status } = req.body
      if (!destination || !title || !startDate || !endDate || budget === undefined || travelers === undefined || !status) {
        return res.status(400).json({
          success: false,
          message: 'Missing required trip fields'
        })
      }

      const trip = await TripService.createTrip(req.user!.id, req.body)
      res.status(201).json({ success: true, data: trip })
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message })
    }
  }
}
