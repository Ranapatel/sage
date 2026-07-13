import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { TripController } from '../modules/trips/trip.controller'
import { getPhotosHandler } from '../modules/photos/photo.controller'

const router = Router()

router.get('/', authMiddleware as any, TripController.getTrips as any)
router.post('/', authMiddleware as any, TripController.createTrip as any)

// Photo routes nested under trips
router.get('/:tripId/days/:dayId/photos', authMiddleware as any, getPhotosHandler as any)

export default router
