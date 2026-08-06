const express = require('express')
const router = express.Router()
const { param, query } = require('express-validator')
const { getExplorePlaces, generateMockPlaces } = require('../services/aiService')
const { searchActivities, searchRestaurants, getPlaceDetailsWithNearby } = require('../services/googlePlaces')
const { GeocodingService } = require('../services/geocoding.service')
const { ImageService } = require('../services/imageService')
const { activitiesDetailsLimiter } = require('../middleware/rateLimitMiddleware')
const { DestinationResolverService } = require('../services/destinationResolver.service')
const { validateAndSanitizeActivities, validateAndSanitizeRestaurants } = require('../middleware/destinationValidationGuard')
const { getCategoryFallbackImage, getCategoryFallbackGallery } = require('../data/cuisineFallbacks')

// ── GET /api/explore/activities/:destination ───────────────────────────────────

router.get('/activities/:destination', [
  param('destination').trim().notEmpty().isLength({ max: 100 }),
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
    // 1. Resolve canonical destination (Single Source of Truth)
    let destContext = null
    let coords = null
    try {
      destContext = await DestinationResolverService.resolve(dest)
      coords = { latitude: destContext.latitude, longitude: destContext.longitude }
      console.log(`[Explore Activities] Canonical destination: ${destContext.city}, ${destContext.state}, ${destContext.country}`)
    } catch (err) {
      console.warn(`[Explore Route] Destination resolution failed for "${dest}":`, err.message)
      // Soft fallback: try basic geocoding
      try {
        const geo = await GeocodingService.geocodeDestination(dest)
        if (geo && geo.latitude && geo.longitude) {
          coords = { latitude: geo.latitude, longitude: geo.longitude }
        }
      } catch (geoErr) {
        console.warn(`[Explore Route] Geocoding also failed for "${dest}":`, geoErr.message)
      }
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
      // 3. Validate geographic consistency if destContext is available
      let finalActivities = result.activities
      if (destContext) {
        const { validActivities, rejectedCount } = validateAndSanitizeActivities(result.activities, destContext)
        finalActivities = validActivities
        if (rejectedCount > 0) {
          console.log(`[Explore Activities] Filtered out ${rejectedCount} cross-city activities for "${destContext.city}"`)
        }
      }

      return res.json({
        success: true,
        data: {
          activities: finalActivities,
          total: finalActivities.length
        },
        meta: {
          timestamp: new Date().toISOString(),
          source: 'google_places',
          canonicalDestination: destContext ? destContext.city : dest
        }
      })
    }

    // 4. Fallback to mock activities if Google Places returned 0 results
    const cityName = destContext ? destContext.city : dest
    const mockList = generateMockPlaces(cityName)
    const fallbackActs = mockList.map((p, i) => ({
      id: `act_fb_${i}_${Date.now()}`,
      name: p.name,
      category: p.category || category || 'Tourist Attractions',
      description: p.description,
      rating: 4.8 - (i * 0.1),
      userRatingCount: 150 + (i * 25),
      priceLevel: p.cost ? (p.cost > 500 ? '$$$' : '$$') : '$',
      formattedAddress: `${p.name}, ${cityName}`,
      openNow: true,
      heroImage: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80&auto=format&fit=crop',
      photos: ['https://images.unsplash.com/photo-1502602898657-3e91760cbb34?w=800&q=80&auto=format&fit=crop'],
      photoCount: 1
    }))

    return res.json({
      success: true,
      data: { activities: fallbackActs, total: fallbackActs.length },
      meta: { timestamp: new Date().toISOString(), source: 'fallback', canonicalDestination: cityName }
    })
  } catch (err) {
    console.warn('[Explore Activities Router] Soft fallback triggered:', err.message)
    const cityName = dest.split(',')[0].trim()
    const mockList = generateMockPlaces(cityName)
    const fallbackActs = mockList.map((p, i) => ({
      id: `act_fb_${i}_${Date.now()}`,
      name: p.name,
      category: p.category || category || 'Tourist Attractions',
      description: p.description,
      rating: 4.7,
      userRatingCount: 120,
      priceLevel: '$$',
      formattedAddress: `${p.name}, ${cityName}`,
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
  param('destination').trim().notEmpty().isLength({ max: 100 }),
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
    // 1. Resolve canonical destination (Single Source of Truth)
    let destContext = null
    let coords = null
    try {
      destContext = await DestinationResolverService.resolve(dest)
      coords = { latitude: destContext.latitude, longitude: destContext.longitude }
      console.log(`[Explore Restaurants] Canonical destination: ${destContext.city}, ${destContext.state}, ${destContext.country}`)
    } catch (err) {
      console.warn(`[Explore Route] Destination resolution failed for "${dest}":`, err.message)
      try {
        const geo = await GeocodingService.geocodeDestination(dest)
        if (geo && geo.latitude && geo.longitude) {
          coords = { latitude: geo.latitude, longitude: geo.longitude }
        }
      } catch (geoErr) {
        console.warn(`[Explore Route] Geocoding also failed for "${dest}":`, geoErr.message)
      }
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
      // 3. Validate geographic consistency
      let finalRestaurants = result.restaurants
      if (destContext) {
        const { validRestaurants, rejectedCount } = validateAndSanitizeRestaurants(result.restaurants, destContext)
        finalRestaurants = validRestaurants
        if (rejectedCount > 0) {
          console.log(`[Explore Restaurants] Filtered out ${rejectedCount} cross-city restaurants for "${destContext.city}"`)
        }
      }

      return res.json({
        success: true,
        data: {
          restaurants: finalRestaurants,
          total: finalRestaurants.length
        },
        meta: {
          timestamp: new Date().toISOString(),
          source: 'google_places',
          canonicalDestination: destContext ? destContext.city : dest
        }
      })
    }

    // 4. Fallback mock restaurants
    const cityName = destContext ? destContext.city : dest
    const mockList = generateMockPlaces(cityName)
    const fallbackRests = mockList.map((p, i) => ({
      id: `rest_fb_${i}_${Date.now()}`,
      name: `${p.name} Dining`,
      category: 'Restaurants',
      description: p.description,
      rating: 4.6,
      userRatingCount: 200,
      priceLevel: '$$',
      formattedAddress: `${p.name}, ${cityName}`,
      openNow: true,
      heroImage: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&auto=format&fit=crop',
      photos: ['https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80&auto=format&fit=crop'],
      photoCount: 1
    }))

    return res.json({
      success: true,
      data: { restaurants: fallbackRests, total: fallbackRests.length },
      meta: { timestamp: new Date().toISOString(), source: 'fallback', canonicalDestination: cityName }
    })
  } catch (err) {
    console.warn('[Explore Restaurants Router] Soft fallback triggered:', err.message)
    const cityName = dest.split(',')[0].trim()
    const mockList = generateMockPlaces(cityName)
    const fallbackRests = mockList.map((p, i) => ({
      id: `rest_fb_${i}_${Date.now()}`,
      name: `${p.name} Dining`,
      category: 'Restaurants',
      description: p.description,
      rating: 4.6,
      userRatingCount: 200,
      priceLevel: '$$',
      formattedAddress: `${p.name}, ${cityName}`,
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
  activitiesDetailsLimiter,
  param('placeId').trim().notEmpty(),
], async (req, res) => {
  const { placeId } = req.params

  // 1. Soft fallback for mock or fallback place IDs (e.g. rest_fb_..., act_fb_..., mock_...)
  if (placeId.startsWith('rest_fb_') || placeId.startsWith('act_fb_') || placeId.startsWith('mock_')) {
    const isRest = placeId.startsWith('rest_fb_')
    const heroImage = getCategoryFallbackImage(isRest ? 'dining' : 'attraction', 'Popular Landmark', placeId)
    const gallery = getCategoryFallbackGallery(isRest ? 'dining' : 'attraction', 'Popular Landmark', placeId)

    return res.json({
      success: true,
      data: {
        id: placeId,
        name: isRest ? 'Local Dining Landmark' : 'Top Attraction & Landmark',
        formattedAddress: 'City Center, Destination',
        category: isRest ? 'Restaurants' : 'Tourist Attractions',
        rating: 4.7,
        userRatingCount: 180,
        priceLevel: '$$',
        heroImage,
        photos: gallery,
        photoCount: gallery.length,
        openNow: true,
        description: isRest
          ? 'Popular local restaurant serving authentic regional specialties with high visitor ratings.'
          : 'Highly recommended local attraction featuring rich cultural heritage and scenic views.',
        openingHours: ['Monday - Sunday: 09:00 AM - 10:00 PM'],
        reviews: [
          { author: 'Curated Traveler', rating: 5, text: 'Must-visit spot with incredible ambience and service!', relativeTime: 'a week ago' }
        ],
        source: 'fallback_mock'
      },
      meta: { timestamp: new Date().toISOString(), source: 'fallback_mock' }
    })
  }

  try {
    const details = await getPlaceDetailsWithNearby(placeId)
    if (!details) {
      // Return graceful fallback rather than 404
      const heroImage = getCategoryFallbackImage('attraction', 'Place Landmark', placeId)
      return res.json({
        success: true,
        data: {
          id: placeId,
          name: 'Point of Interest',
          formattedAddress: 'Destination Center',
          category: 'Attractions',
          rating: 4.6,
          userRatingCount: 120,
          heroImage,
          photos: [heroImage],
          openNow: true,
          source: 'fallback'
        },
        meta: { timestamp: new Date().toISOString(), source: 'fallback' }
      })
    }

    res.json({
      success: true,
      data: details,
      meta: { timestamp: new Date().toISOString(), source: 'google_places' }
    })
  } catch (err) {
    console.warn('[Explore Details Router] Soft fallback triggered:', err.message)
    const heroImage = getCategoryFallbackImage('attraction', 'Place Details', placeId)

    return res.json({
      success: true,
      data: {
        id: placeId,
        name: 'Featured Destination Spot',
        formattedAddress: 'City Center',
        category: 'Attractions',
        rating: 4.6,
        userRatingCount: 150,
        heroImage,
        photos: [heroImage],
        openNow: true,
        source: 'soft_fallback',
        error: err.message
      },
      meta: { timestamp: new Date().toISOString(), source: 'soft_fallback' }
    })
  }
})

// ── GET /api/explore/places/:destination ───────────────────────────────────────

router.get('/places/:destination', [
  param('destination').trim().notEmpty().isLength({ max: 100 }),
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
