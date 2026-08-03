const express = require('express')
const router = express.Router()
const { body, query, validationResult } = require('express-validator')
const { generateItinerary, optimizeBudget } = require('../services/aiService') // AI services
const { enrichItineraryWithRealCoords, searchPlace } = require('../services/placesService')
const { cacheGet, cacheSet, generateCacheKey } = require('../config/redis')
const { v4: uuidv4 } = require('uuid')

const itineraryValidation = [
  body('destination').trim().notEmpty().isLength({ max: 100 }),
  body('days').customSanitizer(val => {
    const parsed = parseInt(val, 10);
    return isNaN(parsed) || parsed < 1 || parsed > 90 ? 3 : parsed;
  }).isInt({ min: 1, max: 90 }),
  body('budget').customSanitizer(val => {
    const parsed = parseFloat(val);
    return isNaN(parsed) || parsed < 0 || parsed > 10000000 ? 50000 : parsed;
  }).isFloat({ min: 0, max: 10000000 }),
  body('style').customSanitizer(val => {
    if (typeof val !== 'string') return 'adventure';
    const clean = val.trim().toLowerCase();
    const allowed = ['adventure', 'luxury', 'budget', 'family', 'romantic', 'cultural', 'business', 'honeymoon'];
    return allowed.includes(clean) ? clean : 'adventure';
  }).isIn(['adventure', 'luxury', 'budget', 'family', 'romantic', 'cultural', 'business', 'honeymoon']),
  body('members').customSanitizer(val => {
    const parsed = parseInt(val, 10);
    return isNaN(parsed) || parsed < 1 || parsed > 20 ? 2 : parsed;
  }).isInt({ min: 1, max: 20 }),
  body('preferences').optional().isArray({ max: 10 }),
  body('startDate').optional().isString(),
]

// POST /api/itinerary/generate
router.post('/generate', itineraryValidation, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.error('[Itinerary Validation Error]:', errors.array(), 'req.body:', req.body)
    return res.status(400).json({ success: false, error: 'Invalid input', details: errors.array() })
  }

  const { destination, from, days, budget, currency = 'INR', style, members = 2, preferences = [], startDate } = req.body
  const requestId = uuidv4()

  // Check cache first
  const cacheKey = generateCacheKey('itinerary', { destination, from, days, budget, style, startDate, members, preferences: preferences.join(',') })
  const cached = await cacheGet(cacheKey)
  if (cached) {
    return res.json({ ...cached, meta: { ...cached.meta, requestId, cache: true } })
  }

  const hasGoogleKey = process.env.GOOGLE_PLACES_API_KEY &&
    process.env.GOOGLE_PLACES_API_KEY !== 'your_google_places_key'

  try {
    let enrichedData;
    let isHybrid = false;

    if (hasGoogleKey) {
      console.log('[Itinerary Route] Google Places API Key present. Attempting Hybrid Itinerary Engine...');
      try {
        const { HybridItineraryService } = require('../services/googlePlaces');
        enrichedData = await HybridItineraryService.generate({
          destination,
          from,
          days,
          budget,
          currency,
          style,
          members,
          preferences,
          startDate
        });
        isHybrid = true;
      } catch (hybridErr) {
        console.warn(`[Itinerary Route] Hybrid Itinerary Engine failed (${hybridErr.message}) — falling back to legacy AI engine.`);
        const result = await generateItinerary({ destination, from, days, budget, currency, style, members, preferences, startDate })
        if (!result.success) throw new Error('Itinerary generation failed')
        const enrichedItinerary = await enrichItineraryWithRealCoords(result.data.itinerary, destination)
        enrichedData = { ...result.data, itinerary: enrichedItinerary }
      }
    } else {
      console.log('[Itinerary Route] Google Places key not configured. Running legacy geocoded engine...');
      // 1. Generate itinerary via AI
      const result = await generateItinerary({ destination, from, days, budget, currency, style, members, preferences, startDate })

      if (!result.success) throw new Error('Itinerary generation failed')

      // 2. Enrich with real Google coordinates (non-blocking — falls back to AI coords if key missing)
      const enrichedItinerary = await enrichItineraryWithRealCoords(result.data.itinerary, destination)
      enrichedData = { ...result.data, itinerary: enrichedItinerary }
    }

    await cacheSet(cacheKey, { success: true, data: enrichedData })
    res.json({
      success: true,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
        cache: false,
        googleEnriched: hasGoogleKey,
        isHybrid,
      },
      data: enrichedData,
      message: 'LIVE_UPDATE',
      error: null,
    })
  } catch (err) {
    console.error('[Itinerary Route] Error:', err.message)
    res.status(500).json({
      success: false,
      error: err.message || 'Failed to generate itinerary. Please try again.',
      meta: { timestamp: new Date().toISOString(), requestId },
    })
  }
})

// GET /api/itinerary/places/search?q=Taj+Mahal&city=Agra
router.get('/places/search', [
  query('q').trim().notEmpty().withMessage('Query required'),
  query('city').optional().trim(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ success: false, error: errors.array()[0].msg })

  const { q, city } = req.query
  try {
    const result = await searchPlace(q, city)
    if (!result) return res.json({ success: false, data: null, message: 'Place not found' })
    res.json({ success: true, data: result })
  } catch (err) {
    res.status(500).json({ success: false, error: err.message })
  }
})

// POST /api/itinerary/optimize-budget
router.post('/optimize-budget', itineraryValidation, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ success: false, error: 'Invalid input' })

  const { destination, days, budget, style, members = 2, preferences = [] } = req.body

  try {
    const result = await optimizeBudget({ destination, days, budget, style, members, preferences })
    res.json({ success: true, data: result.data })
  } catch (err) {
    console.error('[Optimizer Route] Error:', err.message)
    res.status(500).json({ success: false, error: 'Failed to optimize budget.' })
  }
})

module.exports = router

