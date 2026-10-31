const express = require('express')
const router = express.Router()
const { body, query, validationResult } = require('express-validator')
const { generateItinerary, optimizeBudget } = require('../services/aiService') // AI services
const { enrichItineraryWithRealCoords, searchPlace } = require('../services/placesService')
const { cacheGet, cacheSet, generateCacheKey } = require('../config/redis')
const { v4: uuidv4 } = require('uuid')
const { DestinationResolverService } = require('../services/destinationResolver.service')
const { validateAndSanitizeItinerary } = require('../middleware/destinationValidationGuard')
const { stampItineraryDates, reconcileTripCost, originCity } = require('../services/itineraryFacts')

function budgetBand(budget) {
  return Math.round((Number(budget) || 0) / 10000) * 10000
}

function publishPlan(data, { startDate, budget }) {
  const phases = data?.generationPhases || null
  const aiStatus = data?.aiStatus || 'live'
  const clean = { ...(data || {}) }
  delete clean.generationPhases
  const stamped = stampItineraryDates(clean, startDate)
  const reconciled = reconcileTripCost(stamped, { budget })
  delete reconciled.aiStatus
  return {
    data: reconciled,
    aiStatus,
    fallback: aiStatus !== 'live',
    phases,
  }
}

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
  let clientClosed = false
  req.on('close', () => { clientClosed = true })

  // startDate and the exact budget are not part of the key. Dates are stamped
  // for the request, and the cost lines are reconciled to this budget.
  // Origin is part of the key: two trips to the same place from different cities
  // must not share a cached plan. v7 omitted it.
  const cacheKey = generateCacheKey('itinerary_v8', {
    destination,
    from: originCity(from),
    days,
    budgetBand: budgetBand(budget),
    style,
    members,
    preferences: preferences.join(','),
  })
  const cached = await cacheGet(cacheKey)
  if (cached && cached.meta?.aiStatus === 'live' && Array.isArray(cached.data?.itinerary) && cached.data.itinerary.length >= days) {
    const published = publishPlan(cached.data, { startDate, budget })
    return res.json({
      ...cached,
      data: published.data,
      meta: { ...cached.meta, requestId, cache: true, aiStatus: 'live', fallback: false, phases: null },
    })
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
          startDate,
          shouldAbort: () => clientClosed || req.destroyed,
        });
        isHybrid = true;
      } catch (hybridErr) {
        if (clientClosed || hybridErr.message === 'CLIENT_CLOSED') {
          console.log(`[Itinerary Route] Client closed during generation (${requestId}). Stopped.`)
          return
        }
        if (String(hybridErr.message || '').includes('DESTINATION_NOT_FOUND')) throw hybridErr
        console.warn(`[Itinerary Route] AI step failed (${hybridErr.message}). Returning a starter outline instead of a second model call.`)
        enrichedData = {
          itinerary: [],
          aiStatus: 'fallback',
          totalEstimatedCost: 0,
          budgetBreakdown: {},
          tips: ['The AI step did not finish. This outline is a starter, not a full plan.'],
        }
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

    // Resolve canonical destination for validation
    let destContext = null
    try {
      destContext = await DestinationResolverService.resolve(destination)
      console.log(`[Itinerary Route] Canonical destination resolved: ${destContext.city}, ${destContext.state}, ${destContext.country}`)
    } catch (resolveErr) {
      console.warn(`[Itinerary Route] Destination resolution warning: ${resolveErr.message}`)
    }

    if (clientClosed) {
      console.log(`[Itinerary Route] Client closed before the response (${requestId}).`)
      return
    }

    // Validate itinerary stops against canonical destination
    let validatedData = enrichedData
    if (destContext && Array.isArray(enrichedData?.itinerary) && enrichedData.itinerary.length > 0) {
      validatedData = validateAndSanitizeItinerary(enrichedData, destContext)
    }

    const published = publishPlan(validatedData, { startDate, budget })
    if (published.aiStatus !== 'live') {
      console.warn(`[Itinerary Route] aiStatus=${published.aiStatus} requestId=${requestId} destination=${destination} startDate=${startDate || 'none'}`)
    } else {
      console.log(`[Itinerary Route] aiStatus=live requestId=${requestId} phases=${JSON.stringify(published.phases)}`)
    }

    const body = {
      success: true,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
        cache: false,
        googleEnriched: hasGoogleKey,
        isHybrid,
        canonicalDestination: destContext ? destContext.city : destination,
        aiStatus: published.aiStatus,
        fallback: published.fallback,
        phases: published.phases,
      },
      data: published.data,
      message: published.fallback ? 'STARTER_OUTLINE' : 'LIVE_UPDATE',
      error: null,
    }

    if (published.aiStatus === 'live' && Array.isArray(published.data?.itinerary) && published.data.itinerary.length >= days) {
      await cacheSet(cacheKey, { success: true, data: published.data, meta: { aiStatus: 'live' } })
    }
    res.json(body)
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

