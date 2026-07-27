const express = require('express')
const router = express.Router()
const { param, query } = require('express-validator')
const { getExplorePlaces, generateMockPlaces } = require('../services/aiService')
const { searchActivities, searchRestaurants, getPlaceDetailsWithNearby } = require('../services/googlePlaces')
const { GeocodingService } = require('../services/geocoding.service')
const { ImageService } = require('../services/imageService')

// ── GET /api/explore/activities/:destination ───────────────────────────────────

router.get('/activities/:destination', [
  param('destination').trim().notEmpty().isLength({ max: 100 }).escape(),
  query('category').optional().trim(),
  query('rating').optional().isFloat({ min: 0, max: 5 }),
  query('price').optional().isInt({ min: 0, max: 4 }),
  query('openNow').optional().isString(),
  query('sortBy').optional().isIn(['distance', 'popularity']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
], async (req, res) => {
  const dest = decodeURIComponent(req.params.destination)
  const { category, rating, price, openNow, sortBy, page, limit } = req.query

  try {
    // 1. Resolve destination coordinates using central GeocodingService (soft failover)
    let coords = null
    try {
      const geo = await GeocodingService.geocodeDestination(dest)
      if (geo && geo.latitude && geo.longitude) {
        coords = { latitude: geo.latitude, longitude: geo.longitude }
      }
    } catch (err) {
      console.warn(`[Explore Route] Geocoding skipped for "${dest}":`, err.message)
    }

    // 2. Query Google Places activities via exploreService
    const result = await searchActivities(dest, coords, {
      category,
      rating: rating ? parseFloat(rating) : undefined,
      price: price ? parseInt(price, 10) : undefined,
      openNow: openNow === 'true',
      sortBy,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    })

    if (result && Array.isArray(result.activities) && result.activities.length > 0) {
      return res.json({
        success: true,
        data: {
          activities: result.activities,
          total: result.total
        },
        meta: { timestamp: new Date().toISOString(), source: 'google_places' }
      })
    }

    // 3. Fallback to mock activities if Google Places returned 0 results
    const mockList = generateMockPlaces(dest)
    const fallbackActs = mockList.map((p, i) => ({
      id: `act_fb_${i}_${Date.now()}`,
      name: p.name,
      category: p.category || category || 'Tourist Attractions',
      description: p.description,
      rating: 4.8 - (i * 0.1),
      userRatingCount: 150 + (i * 25),
      priceLevel: p.cost ? (p.cost > 500 ? '$$$' : '$$') : '$',
      formattedAddress: `${p.name}, ${dest}`,
      openNow: true,
      heroImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80&auto=format&fit=crop',
      photos: ['https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80&auto=format&fit=crop'],
      photoCount: 1
    }))

    return res.json({
      success: true,
      data: { activities: fallbackActs, total: fallbackActs.length },
      meta: { timestamp: new Date().toISOString(), source: 'fallback' }
    })
  } catch (err) {
    console.warn('[Explore Activities Router] Soft fallback triggered:', err.message)
    const mockList = generateMockPlaces(dest)
    const fallbackActs = mockList.map((p, i) => ({
      id: `act_fb_${i}_${Date.now()}`,
      name: p.name,
      category: p.category || category || 'Tourist Attractions',
      description: p.description,
      rating: 4.7,
      userRatingCount: 120,
      priceLevel: '$$',
      formattedAddress: `${p.name}, ${dest}`,
      openNow: true,
      heroImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80&auto=format&fit=crop',
      photos: ['https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80&auto=format&fit=crop'],
      photoCount: 1
    }))

    return res.json({
      success: true,
      data: { activities: fallbackActs, total: fallbackActs.length },
      meta: { timestamp: new Date().toISOString(), source: 'fallback_mock', error: err.message }
    })
  }
})

// ── GET /api/explore/restaurants/:destination ──────────────────────────────────

router.get('/restaurants/:destination', [
  param('destination').trim().notEmpty().isLength({ max: 100 }).escape(),
  query('rating').optional().isFloat({ min: 0, max: 5 }),
  query('price').optional().isInt({ min: 0, max: 4 }),
  query('openNow').optional().isString(),
  query('sortBy').optional().isIn(['distance', 'popularity']),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 50 }),
], async (req, res) => {
  const dest = decodeURIComponent(req.params.destination)
  const { rating, price, openNow, sortBy, page, limit } = req.query

  try {
    // 1. Resolve coordinates (soft failover)
    let coords = null
    try {
      const geo = await GeocodingService.geocodeDestination(dest)
      if (geo && geo.latitude && geo.longitude) {
        coords = { latitude: geo.latitude, longitude: geo.longitude }
      }
    } catch (err) {
      console.warn(`[Explore Route] Geocoding skipped for "${dest}":`, err.message)
    }

    // 2. Query Google Places restaurants
    const result = await searchRestaurants(dest, coords, {
      rating: rating ? parseFloat(rating) : undefined,
      price: price ? parseInt(price, 10) : undefined,
      openNow: openNow === 'true',
      sortBy,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    })

    if (result && Array.isArray(result.restaurants) && result.restaurants.length > 0) {
      return res.json({
        success: true,
        data: {
          restaurants: result.restaurants,
          total: result.total
        },
        meta: { timestamp: new Date().toISOString(), source: 'google_places' }
      })
    }

    // 3. Fallback mock restaurants
    const mockList = generateMockPlaces(dest)
    const fallbackRests = mockList.map((p, i) => ({
      id: `rest_fb_${i}_${Date.now()}`,
      name: `${p.name} Dining`,
      category: 'Restaurants',
      description: p.description,
      rating: 4.6,
      userRatingCount: 200,
      priceLevel: '$$',
      formattedAddress: `${p.name}, ${dest}`,
      openNow: true,
      heroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&auto=format&fit=crop',
      photos: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&auto=format&fit=crop'],
      photoCount: 1
    }))

    return res.json({
      success: true,
      data: { restaurants: fallbackRests, total: fallbackRests.length },
      meta: { timestamp: new Date().toISOString(), source: 'fallback' }
    })
  } catch (err) {
    console.warn('[Explore Restaurants Router] Soft fallback triggered:', err.message)
    const mockList = generateMockPlaces(dest)
    const fallbackRests = mockList.map((p, i) => ({
      id: `rest_fb_${i}_${Date.now()}`,
      name: `${p.name} Dining`,
      category: 'Restaurants',
      description: p.description,
      rating: 4.6,
      userRatingCount: 200,
      priceLevel: '$$',
      formattedAddress: `${p.name}, ${dest}`,
      openNow: true,
      heroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&auto=format&fit=crop',
      photos: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&auto=format&fit=crop'],
      photoCount: 1
    }))

    return res.json({
      success: true,
      data: { restaurants: fallbackRests, total: fallbackRests.length },
      meta: { timestamp: new Date().toISOString(), source: 'fallback_mock', error: err.message }
    })
  }
})

// ── GET /api/explore/details/:placeId ──────────────────────────────────────────

router.get('/details/:placeId', [
  param('placeId').trim().notEmpty().escape(),
], async (req, res) => {
  const { placeId } = req.params

  try {
    const details = await getPlaceDetailsWithNearby(placeId)
    if (!details) {
      return res.status(404).json({
        success: false,
        error: 'Place details not found'
      })
    }

    res.json({
      success: true,
      data: details,
      meta: { timestamp: new Date().toISOString(), source: 'google_places' }
    })
  } catch (err) {
    console.error('[Explore Details Router] Error:', err.message)
    const status = err.status || err.statusCode || 500
    res.status(status).json({
      success: false,
      error: 'Details fetch failed: ' + (err.message || 'unknown')
    })
  }
})

// ── GET /api/explore/places/:destination ───────────────────────────────────────

router.get('/places/:destination', [
  param('destination').trim().notEmpty().isLength({ max: 100 }).escape(),
], async (req, res) => {
  const dest = decodeURIComponent(req.params.destination)
  try {
    const places = await getExplorePlaces(dest)
    res.json({
      success: true,
      data: places,
      meta: { timestamp: new Date().toISOString(), source: 'groq' }
    })
  } catch (err) {
    console.warn(`[Explore Places] Groq failed for ${dest}, falling back to mock data:`, err.message)
    const fallback = generateMockPlaces(dest)
    res.json({
      success: true,
      data: fallback,
      meta: { timestamp: new Date().toISOString(), source: 'fallback', error: err.message }
    })
  }
})

// ── GET /api/explore/place-image ──────────────────────────────────────────────
router.get('/place-image', [
  query('placeName').trim().notEmpty().withMessage('placeName query param is required'),
  query('city').trim().notEmpty().withMessage('city query param is required'),
  query('category').optional().trim(),
  query('placeId').optional().trim(),
  query('lat').optional().isFloat(),
  query('lng').optional().isFloat(),
  query('ignoreUrls').optional().trim(),
], async (req, res) => {
  const { placeName, city, category, placeId, lat, lng, ignoreUrls } = req.query
  const ignoreList = ignoreUrls ? ignoreUrls.split(',').map(u => u.trim()).filter(Boolean) : []

  try {
    const result = await ImageService.resolvePlaceImages({
      placeName,
      city,
      category,
      placeId,
      lat: lat ? parseFloat(lat) : undefined,
      lng: lng ? parseFloat(lng) : undefined,
      ignoreUrls: ignoreList
    })
    return res.json({ success: true, data: result })
  } catch (err) {
    console.error('[Explore Place Image Route] Error:', err.message)
    return res.status(500).json({ success: false, error: 'Failed to resolve place image: ' + err.message })
  }
})

module.exports = router
