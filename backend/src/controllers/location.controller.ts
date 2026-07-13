/**
 * TripSage — Location Controller
 *
 * Express request handler for the geocoding API endpoint.
 * Delegates all logic to GeocodingService — this layer only handles
 * HTTP request/response mapping.
 */

import { Request, Response } from 'express'
import { GeocodingService } from '../services/geocoding.service'
import { GeoapifyRoutingService } from '../services/geoapifyRouting.service'
import { GeocodingError, GeocodingResponse } from '../types/location'
import { LocationService } from '../services/location.service'
import { NearbyRecommendationService } from '../services/nearbyRecommendation.service'
import { TravelAssistantService } from '../services/travelAssistant.service'
import { AuthenticatedRequest } from '../middleware/auth.middleware'

export class LocationController {
  /**
   * POST /api/location/geocode
   *
   * Request body: { destination: string }
   * Response: { success: true, location: Location }
   *       or { success: false, error: string }
   */
  static async geocode(req: Request, res: Response): Promise<void> {
    try {
      // validatedBody is set by the zodValidate middleware
      const { destination } = (req as any).validatedBody || req.body

      const location = await GeocodingService.geocodeDestination(destination)

      const response: GeocodingResponse = {
        success: true,
        location,
      }

      res.json(response)
    } catch (error) {
      if (error instanceof GeocodingError) {
        const response: GeocodingResponse = {
          success: false,
          error: error.message,
        }
        res.status(error.statusCode).json(response)
        return
      }

      // Unexpected errors — log and return generic message
      const message = error instanceof Error ? error.message : 'Unknown error'
      console.error('[LocationController] 💥 Unexpected error:', message)

      const response: GeocodingResponse = {
        success: false,
        error: process.env.NODE_ENV === 'production'
          ? 'Internal server error'
          : message,
      }
      res.status(500).json(response)
    }
  }

  static async calculateRoute(req: Request, res: Response): Promise<void> {
    const { waypoints, mode } = (req as any).validatedBody || req.body
    try {
      const route = await GeoapifyRoutingService.getRoute(waypoints, mode)
      res.json({
        success: true,
        route,
      })
    } catch (error: any) {
      console.warn('[LocationController] Routing service failed, falling back to straight-line path:', error.message)
      
      // Calculate a rough straight-line distance (haversine) as fallback
      let totalDist = 0
      for (let i = 0; i < waypoints.length - 1; i++) {
        const p1 = waypoints[i]
        const p2 = waypoints[i + 1]
        const R = 6371 // radius in km
        const dLat = (p2.latitude - p1.latitude) * Math.PI / 180
        const dLon = (p2.longitude - p1.longitude) * Math.PI / 180
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                  Math.cos(p1.latitude * Math.PI / 180) * Math.cos(p2.latitude * Math.PI / 180) *
                  Math.sin(dLon / 2) * Math.sin(dLon / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        totalDist += R * c
      }

      // Estimate walking time (12 minutes per km)
      const durationSeconds = Math.round(totalDist * 12 * 60)

      res.json({
        success: true,
        route: {
          coordinates: waypoints.map((w: any) => [w.longitude, w.latitude]), // [[lon, lat], ...]
          distanceKm: totalDist,
          durationSeconds,
          isFallback: true
        }
      })
    }
  }

  /**
   * POST /api/location/route/optimize
   *
   * Accepts an optional `trigger` field to integrate with the optimization guard.
   * Valid triggers: 'itinerary_generated', 'user_requested', 'places_changed', 'preferences_changed'
   * Invalid/blocked triggers: 'page_opened', 'day_switched', 'map_viewed'
   *
   * When tripId + dayNumber + trigger are provided, the guard validates whether
   * the optimization should proceed. Otherwise, falls back to legacy behavior.
   */
  static async optimizeRoute(req: Request, res: Response): Promise<void> {
    try {
      const { RouteOptimizationService } = require('../services/routeOptimization.service')
      const { places, preferences, travelStyle, tripId, dayNumber, trigger } = req.body

      if (!places || !Array.isArray(places)) {
        res.status(400).json({ success: false, error: 'places array is required' })
        return
      }

      // If trigger + tripId + dayNumber are provided, use the guarded path
      if (trigger && tripId && dayNumber !== undefined) {
        const result = await RouteOptimizationService.optimizeDailyItinerary({
          tripId,
          dayNumber,
          places,
          preferences,
          travelStyle,
          trigger
        })

        res.json({
          success: true,
          optimizedPlaces: result.optimizedPlaces,
          wasOptimized: result.wasOptimized,
          totalDistanceKm: result.totalDistanceKm,
          estimatedTimeMinutes: result.estimatedTimeMinutes,
          creditsUsed: result.creditsUsed,
          reason: result.reason
        })
        return
      }

      // Legacy fallback (no trigger provided)
      const optimized = await RouteOptimizationService.optimizeRoute(places, preferences, travelStyle, tripId, dayNumber)
      res.json({ success: true, optimizedPlaces: optimized })
    } catch (error: any) {
      console.error('[LocationController] Route optimization error:', error.message)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  /**
   * GET /api/location/route/matrix-usage
   *
   * Returns current daily Route Matrix API credit usage summary.
   * Useful for monitoring and debugging credit consumption.
   */
  static async getMatrixUsage(_req: Request, res: Response): Promise<void> {
    try {
      const { GeoapifyKeyManager } = require('../services/geoapify/geoapifyKeyManager')
      const summary = await GeoapifyKeyManager.getUsageSummary()
      res.json({ success: true, data: summary })
    } catch (error: any) {
      console.error('[LocationController] Matrix usage error:', error.message)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  /**
   * POST /api/location/route/save
   */
  static async saveRoute(req: Request, res: Response): Promise<void> {
    try {
      const { prisma } = require('../prisma/prisma.client')
      const { tripId, dayNumber, startPlaceId, endPlaceId, distance, duration, transportMode, geometry } = req.body

      if (!tripId || dayNumber === undefined || !startPlaceId || !endPlaceId || distance === undefined || duration === undefined || !transportMode || !geometry) {
        res.status(400).json({ success: false, error: 'Missing required itinerary route fields' })
        return
      }

      const routeRecord = await prisma.itineraryRoute.create({
        data: {
          tripId,
          dayNumber,
          startPlaceId,
          endPlaceId,
          distance,
          duration,
          transportMode,
          geometry: JSON.stringify(geometry),
        }
      })

      res.json({ success: true, data: routeRecord })
    } catch (error: any) {
      console.error('[LocationController] Save route error:', error.message)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  /**
   * GET /api/location/route/trip/:tripId
   */
  static async getTripRoutes(req: Request, res: Response): Promise<void> {
    try {
      const { prisma } = require('../prisma/prisma.client')
      const { tripId } = req.params

      const routes = await prisma.itineraryRoute.findMany({
        where: { tripId },
        orderBy: { createdAt: 'asc' }
      })

      const parsedRoutes = routes.map((r: any) => ({
        ...r,
        geometry: JSON.parse(r.geometry)
      }))

      res.json({ success: true, data: parsedRoutes })
    } catch (error: any) {
      console.error('[LocationController] Get trip routes error:', error.message)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  /**
   * POST /api/location/user-location
   */
  static async saveUserLocation(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest
      const userId = authReq.user?.id
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' })
        return
      }

      const { latitude, longitude } = req.body
      if (latitude === undefined || longitude === undefined) {
        res.status(400).json({ success: false, error: 'latitude and longitude are required' })
        return
      }

      const entry = await LocationService.saveUserLocation(userId, latitude, longitude)
      res.json({ success: true, data: entry })
    } catch (error: any) {
      console.error('[LocationController] Save user location error:', error.message)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  /**
   * GET /api/location/user-location
   */
  static async getUserLocation(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest
      const userId = authReq.user?.id
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' })
        return
      }

      const location = await LocationService.getUserLocation(userId)
      res.json({ success: true, data: location })
    } catch (error: any) {
      console.error('[LocationController] Get user location error:', error.message)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  /**
   * POST /api/location/preference
   */
  static async saveMapPreference(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest
      const userId = authReq.user?.id
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' })
        return
      }

      const { layers, transportMode, travelStyle } = req.body
      if (!layers || !Array.isArray(layers)) {
        res.status(400).json({ success: false, error: 'layers must be an array of strings' })
        return
      }

      const preference = await LocationService.saveMapPreference(
        userId,
        layers,
        transportMode || 'walk',
        travelStyle || 'adventure'
      )
      res.json({ success: true, data: preference })
    } catch (error: any) {
      console.error('[LocationController] Save map preference error:', error.message)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  /**
   * GET /api/location/preference
   */
  static async getMapPreference(req: Request, res: Response): Promise<void> {
    try {
      const authReq = req as AuthenticatedRequest
      const userId = authReq.user?.id
      if (!userId) {
        res.status(401).json({ success: false, error: 'Unauthorized' })
        return
      }

      const preference = await LocationService.getMapPreference(userId)
      res.json({ success: true, data: preference })
    } catch (error: any) {
      console.error('[LocationController] Get map preference error:', error.message)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  /**
   * POST /api/location/visit-status
   */
  static async savePlaceVisitStatus(req: Request, res: Response): Promise<void> {
    try {
      const { tripId, placeId, status } = req.body
      if (!tripId || !placeId || !status) {
        res.status(400).json({ success: false, error: 'tripId, placeId, and status are required' })
        return
      }

      const entry = await LocationService.savePlaceVisitStatus(tripId, placeId, status)
      res.json({ success: true, data: entry })
    } catch (error: any) {
      console.error('[LocationController] Save place visit status error:', error.message)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  /**
   * GET /api/location/visit-status/:tripId
   */
  static async getPlaceVisitStatuses(req: Request, res: Response): Promise<void> {
    try {
      const { tripId } = req.params
      if (!tripId) {
        res.status(400).json({ success: false, error: 'tripId parameter is required' })
        return
      }

      const statuses = await LocationService.getPlaceVisitStatuses(tripId)
      res.json({ success: true, data: statuses })
    } catch (error: any) {
      console.error('[LocationController] Get place visit statuses error:', error.message)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  /**
   * POST /api/location/nearby
   */
  static async getNearbyRecommendations(req: Request, res: Response): Promise<void> {
    try {
      const { latitude, longitude, category, radius, travelStyle, interests, budget, cuisine, rating } = req.body
      if (latitude === undefined || longitude === undefined) {
        res.status(400).json({ success: false, error: 'latitude and longitude are required' })
        return
      }

      const recommendations = await NearbyRecommendationService.getNearbyRecommendations({
        latitude,
        longitude,
        category,
        radius,
        travelStyle,
        interests,
        budget,
        cuisine,
        rating
      })
      res.json({ success: true, data: recommendations })
    } catch (error: any) {
      console.error('[LocationController] Get nearby recommendations error:', error.message)
      res.status(500).json({ success: false, error: error.message })
    }
  }

  /**
   * POST /api/location/assistant
   */
  static async getAssistantAdvice(req: Request, res: Response): Promise<void> {
    try {
      const { message, latitude, longitude, currentTime, weather, itinerary, preferences } = req.body
      if (!message || latitude === undefined || longitude === undefined) {
        res.status(400).json({ success: false, error: 'message, latitude, and longitude are required' })
        return
      }

      const advice = await TravelAssistantService.getAssistantAdvice({
        message,
        latitude,
        longitude,
        currentTime: currentTime || new Date().toTimeString().slice(0, 5),
        weather,
        itinerary: itinerary || [],
        preferences: preferences || {}
      })
      res.json({ success: true, data: advice })
    } catch (error: any) {
      console.error('[LocationController] Get AI assistant advice error:', error.message)
      res.status(500).json({ success: false, error: error.message })
    }
  }
}
