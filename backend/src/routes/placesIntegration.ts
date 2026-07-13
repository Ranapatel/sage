/**
 * TripSage — Places Integration Routes
 *
 * Exposes provider-agnostic endpoints for searching, detailing, nearby places,
 * and fetching photos. Decouples the frontend from specific APIs (like Google).
 */

import { Router, Request, Response } from 'express'
import { z } from 'zod'
import {
  searchPlaces,
  getPlaceDetails,
  nearbySearch,
  getPlacePhotos,
  PlaceCategory,
} from '../services/googlePlaces'

const router = Router()

// ── Validation Lists ────────────────────────────────────────────────────────

const VALID_SEARCH_CATEGORIES: PlaceCategory[] = [
  'attractions', 'restaurants', 'cafes', 'museums', 'parks',
  'shopping', 'beaches', 'temples', 'landmarks'
]

const VALID_NEARBY_CATEGORIES: PlaceCategory[] = [
  'restaurants', 'cafes', 'hospitals', 'pharmacies', 'bus_stops',
  'metro_stations', 'parking', 'fuel_stations', 'shopping'
]

// ── 1. Search Places ─────────────────────────────────────────────────────────

router.get('/search', async (req: Request, res: Response) => {
  try {
    const { destination, category, maxResults } = req.query

    if (!destination || typeof destination !== 'string' || destination.trim() === '') {
      return res.status(400).json({ success: false, error: 'destination query parameter is required' })
    }

    if (!category || typeof category !== 'string' || !VALID_SEARCH_CATEGORIES.includes(category as PlaceCategory)) {
      return res.status(400).json({
        success: false,
        error: `category must be one of: ${VALID_SEARCH_CATEGORIES.join(', ')}`
      })
    }

    const parsedMaxResults = maxResults ? parseInt(maxResults as string, 10) : undefined

    const data = await searchPlaces({
      destination: destination.trim(),
      category: category as PlaceCategory,
      maxResults: parsedMaxResults
    })

    return res.json({ success: true, data })
  } catch (err: any) {
    console.error('[PlacesIntegration/Search] Error:', err.message)
    return res.status(500).json({ success: false, error: err.message || 'Internal server error' })
  }
})

// ── 2. Place Details ─────────────────────────────────────────────────────────

router.get('/details/:placeId', async (req: Request, res: Response) => {
  try {
    const { placeId } = req.params

    if (!placeId || placeId.trim() === '') {
      return res.status(400).json({ success: false, error: 'placeId parameter is required' })
    }

    const data = await getPlaceDetails(placeId.trim())

    return res.json({ success: true, data })
  } catch (err: any) {
    console.error('[PlacesIntegration/Details] Error:', err.message)
    return res.status(500).json({ success: false, error: err.message || 'Internal server error' })
  }
})

// ── 3. Nearby Search ────────────────────────────────────────────────────────

router.get('/nearby', async (req: Request, res: Response) => {
  try {
    const { latitude, longitude, category, radiusMeters, maxResults } = req.query

    if (!latitude || !longitude) {
      return res.status(400).json({ success: false, error: 'latitude and longitude query parameters are required' })
    }

    const lat = parseFloat(latitude as string)
    const lng = parseFloat(longitude as string)

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ success: false, error: 'latitude and longitude must be numbers' })
    }

    if (!category || typeof category !== 'string' || !VALID_NEARBY_CATEGORIES.includes(category as PlaceCategory)) {
      return res.status(400).json({
        success: false,
        error: `category must be one of: ${VALID_NEARBY_CATEGORIES.join(', ')}`
      })
    }

    const parsedRadius = radiusMeters ? parseInt(radiusMeters as string, 10) : undefined
    const parsedMaxResults = maxResults ? parseInt(maxResults as string, 10) : undefined

    const data = await nearbySearch({
      latitude: lat,
      longitude: lng,
      category: category as PlaceCategory,
      radiusMeters: parsedRadius,
      maxResults: parsedMaxResults
    })

    return res.json({ success: true, data })
  } catch (err: any) {
    console.error('[PlacesIntegration/Nearby] Error:', err.message)
    return res.status(500).json({ success: false, error: err.message || 'Internal server error' })
  }
})

// ── 4. Place Photos ─────────────────────────────────────────────────────────

router.get('/photos/:placeId', async (req: Request, res: Response) => {
  try {
    const { placeId } = req.params
    const { maxPhotos, maxWidthPx } = req.query

    if (!placeId || placeId.trim() === '') {
      return res.status(400).json({ success: false, error: 'placeId parameter is required' })
    }

    const parsedMaxPhotos = maxPhotos ? parseInt(maxPhotos as string, 10) : undefined
    const parsedMaxWidth = maxWidthPx ? parseInt(maxWidthPx as string, 10) : undefined

    const data = await getPlacePhotos({
      placeId: placeId.trim(),
      maxPhotos: parsedMaxPhotos,
      maxWidthPx: parsedMaxWidth
    })

    return res.json({ success: true, data })
  } catch (err: any) {
    console.error('[PlacesIntegration/Photos] Error:', err.message)
    return res.status(500).json({ success: false, error: err.message || 'Internal server error' })
  }
})

export default router
