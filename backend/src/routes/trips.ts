import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { TripController } from '../modules/trips/trip.controller'

const router = Router()

router.get('/', authMiddleware as any, TripController.getTrips as any)
router.post('/', authMiddleware as any, TripController.createTrip as any)

export default router
