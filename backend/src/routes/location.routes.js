/**
 * TripSage — Location Routes
 *
 * API endpoint definitions for the geocoding service.
 *
 * Routes:
 *   POST /geocode  →  Forward geocode a destination string
 *
 * Uses the existing zodValidate middleware for request validation.
 */

const { Router } = require('express')
const { z } = require('zod')
const { LocationController } = require('../controllers/location.controller')
const { authMiddleware } = require('../middleware/auth.middleware')

// Import the existing Zod validation middleware (CommonJS module)
const { zodValidate } = require('../middleware/validateRequest')

const router = Router()

// ── Validation Schema ────────────────────────────────────────────────────────

const geocodeSchema = z.object({
  destination: z
    .string({ error: 'destination is required and must be a string' })
    .trim()
    .min(1, 'destination cannot be empty')
    .max(500, 'destination must be 500 characters or less'),
})

const routeSchema = z.object({
  waypoints: z
    .array(
      z.object({
        latitude: z.number({ error: 'latitude is required and must be a number' }),
        longitude: z.number({ error: 'longitude is required and must be a number' }),
      })
    )
    .min(2, 'At least two waypoints are required to calculate a route'),
  mode: z.string().optional(),
})

// ── Routes ───────────────────────────────────────────────────────────────────

/**
 * POST /geocode
 *
 * Body: { "destination": "Tokyo" }
 * Returns: { success: true, location: { name, city, country, ... } }
 */
router.post(
  '/geocode',
  zodValidate(geocodeSchema),
  LocationController.geocode
)

/**
 * POST /route
 *
 * Body: { "waypoints": [{ "latitude": 48.8584, "longitude": 2.2945 }, { "latitude": 48.8606, "longitude": 2.3376 }] }
 * Returns: { success: true, route: { coordinates, distanceKm, durationSeconds } }
 */
router.post(
  '/route',
  zodValidate(routeSchema),
  LocationController.calculateRoute
)

/**
 * POST /route/optimize
 */
router.post(
  '/route/optimize',
  LocationController.optimizeRoute
)

/**
 * POST /route/save
 */
router.post(
  '/route/save',
  LocationController.saveRoute
)

/**
 * GET /route/trip/:tripId
 */
router.get(
  '/route/trip/:tripId',
  LocationController.getTripRoutes
)

/**
 * GET /route/matrix-usage
 *
 * Returns daily Route Matrix API credit usage summary.
 */
router.get(
  '/route/matrix-usage',
  LocationController.getMatrixUsage
)

// ── New Intel Navigator Routes ────────────────────────────────────────────────

// User Location Tracking
router.post('/user-location', authMiddleware, LocationController.saveUserLocation)
router.get('/user-location', authMiddleware, LocationController.getUserLocation)

// Map Preferences
router.post('/preference', authMiddleware, LocationController.saveMapPreference)
router.get('/preference', authMiddleware, LocationController.getMapPreference)

// Place Visit Status
router.post('/visit-status', LocationController.savePlaceVisitStatus)
router.get('/visit-status/:tripId', LocationController.getPlaceVisitStatuses)

// Recommendations and Assistant Advice
router.post('/nearby', LocationController.getNearbyRecommendations)
router.post('/assistant', LocationController.getAssistantAdvice)

module.exports = router
module.exports.default = router
