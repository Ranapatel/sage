import { Router } from 'express'
import { authMiddleware, optionalAuthMiddleware } from '../middleware/auth.middleware'
import { TripController } from '../modules/trips/trip.controller'
import { getPhotosHandler } from '../modules/photos/photo.controller'

const router = Router()

router.get('/', authMiddleware as any, TripController.getTrips as any)
router.post('/', authMiddleware as any, TripController.createTrip as any)

// Photo routes nested under trips (optional auth for non-blocking read)
router.get('/:tripId/days/:dayId/photos', optionalAuthMiddleware as any, getPhotosHandler as any)

export default router
