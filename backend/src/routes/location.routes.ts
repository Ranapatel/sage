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

import { Router } from 'express'
import { z } from 'zod'
import { LocationController } from '../controllers/location.controller'
import { authMiddleware } from '../middleware/auth.middleware'

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
  LocationController.geocode as any
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
  LocationController.calculateRoute as any
)

/**
 * POST /route/optimize
 */
router.post(
  '/route/optimize',
  LocationController.optimizeRoute as any
)

/**
 * POST /route/save
 */
router.post(
  '/route/save',
  LocationController.saveRoute as any
)

/**
 * GET /route/trip/:tripId
 */
router.get(
  '/route/trip/:tripId',
  LocationController.getTripRoutes as any
)

/**
 * GET /route/matrix-usage
 *
 * Returns daily Route Matrix API credit usage summary.
 */
router.get(
  '/route/matrix-usage',
  LocationController.getMatrixUsage as any
)

// ── New Intel Navigator Routes ────────────────────────────────────────────────

// User Location Tracking
router.post('/user-location', authMiddleware as any, LocationController.saveUserLocation as any)
router.get('/user-location', authMiddleware as any, LocationController.getUserLocation as any)

// Map Preferences
router.post('/preference', authMiddleware as any, LocationController.saveMapPreference as any)
router.get('/preference', authMiddleware as any, LocationController.getMapPreference as any)

// Place Visit Status
router.post('/visit-status', LocationController.savePlaceVisitStatus as any)
router.get('/visit-status/:tripId', LocationController.getPlaceVisitStatuses as any)

// Recommendations and Assistant Advice
router.post('/nearby', LocationController.getNearbyRecommendations as any)
router.post('/assistant', LocationController.getAssistantAdvice as any)

export default router
