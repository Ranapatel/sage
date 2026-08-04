const { Router } = require('express')
const { authMiddleware, optionalAuthMiddleware } = require('../middleware/auth.middleware')
const { TripController } = require('../modules/trips/trip.controller')
const { getPhotosHandler } = require('../modules/photos/photo.controller')

const router = Router()

router.get('/', authMiddleware, TripController.getTrips)
router.post('/', authMiddleware, TripController.createTrip)

// Photo routes nested under trips (optional auth for non-blocking read)
router.get('/:tripId/days/:dayId/photos', optionalAuthMiddleware, getPhotosHandler)

module.exports = router
module.exports.default = router