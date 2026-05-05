/**
 * TripSage Search Route — Real-Time Orchestration
 *
 * EXECUTION FLOW:
 *  Step 1 — Validate input (from, to required; dates optional but validated)
 *  Step 2 — Parallel fetch: flights (API) + hotels (API) + weather (Open-Meteo)
 *  Step 3 — AI ranking of real API results (Groq)
 *  Step 4 — Attach affiliate links (already done in travelService)
 *  Step 5 — Return strict JSON with honest source metadata
 *
 * HARD RULES:
 *  - message = "REALTIME_DATA" only when source === 'live'
 *  - message = "API_ERROR" when API call failed
 *  - NEVER return source='estimated' or source='mock'
 */

'use strict'

const express    = require('express')
const router     = express.Router()
const { body, validationResult } = require('express-validator')
const { searchFlights, searchHotels, searchBuses, searchCars } = require('../services/travelService')
const { getWeather } = require('../services/weatherService')
const { rankResults } = require('../services/aiService')
const { v4: uuidv4 } = require('uuid')

// ─── Validation ───────────────────────────────────────────────────────────────

const searchValidation = [
  body('from')
    .trim().notEmpty().withMessage('Origin city is required')
    .isLength({ max: 100 }).escape(),
  body('to')
    .trim().notEmpty().withMessage('Destination city is required')
    .isLength({ max: 100 }).escape(),
  body('startDate')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('startDate must be a valid ISO date (YYYY-MM-DD)'),
  body('endDate')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('endDate must be a valid ISO date (YYYY-MM-DD)'),
  body('budget')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 100000000 }).toFloat()
    .withMessage('budget must be a positive number'),
  body('travelers')
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 20 }).toInt()
    .withMessage('travelers must be between 1 and 20'),
  body('style')
    .optional({ checkFalsy: true })
    .trim().isLength({ max: 50 }),
]

// ─── POST /api/search ─────────────────────────────────────────────────────────

router.post('/', searchValidation, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error:   'Invalid input',
      details: errors.array(),
    })
  }

  const {
    from,
    to,
    startDate,
    endDate,
    budget    = null,
    travelers = 2,
    style     = 'adventure',
  } = req.body

  const requestId = uuidv4()
  const timestamp = new Date().toISOString()

  try {
    // ── Step 2: Parallel real-data fetch ──────────────────────────────────────
    const [flightResult, hotelResult, busResult, carResult, weatherResult] =
      await Promise.allSettled([
        searchFlights({ from, to, date: startDate, returnDate: endDate, travelers, budget }),
        searchHotels({ destination: to, checkin: startDate, checkout: endDate, members: travelers, budget }),
        searchBuses({ from, to, date: startDate, budget }),
        searchCars({ destination: to, date: startDate, budget }),
        getWeather(to),
      ])

    const rawFlights = flightResult.status === 'fulfilled' ? flightResult.value.data  : []
    const rawHotels  = hotelResult.status  === 'fulfilled' ? hotelResult.value.data   : []
    const buses      = busResult.status    === 'fulfilled' ? busResult.value.data     : []
    const cars       = carResult.status    === 'fulfilled' ? carResult.value.data     : []
    const weather    = weatherResult.status === 'fulfilled' ? weatherResult.value.data : null

    const flightSource = flightResult.status === 'fulfilled' ? (flightResult.value.meta?.source || 'unknown') : 'error'
    const hotelSource  = hotelResult.status  === 'fulfilled' ? (hotelResult.value.meta?.source  || 'unknown') : 'error'

    // ── Step 3: AI ranking (only when we have live data) ──────────────────────
    let transport = rawFlights
    let hotels    = rawHotels

    if (rawFlights.length > 0 || rawHotels.length > 0) {
      try {
        const ranked = await rankResults({
          flights:     rawFlights,
          hotels:      rawHotels,
          userProfile: { style, budget, travelers },
        })
        transport = ranked.flights
        hotels    = ranked.hotels
      } catch (rankErr) {
        console.warn('[Search] AI ranking skipped:', rankErr.message)
        // Use original API-fetched order — do not fall back to any generated data
      }
    }

    // ── Step 5: Determine honest message ──────────────────────────────────────
    const isLive = flightSource === 'live' || hotelSource === 'live'
    const hasData = transport.length > 0 || hotels.length > 0
    const message = isLive
      ? 'REALTIME_DATA'
      : hasData
        ? 'AFFILIATE_REDIRECT'
        : 'API_ERROR'

    // ── Step 6: Return ────────────────────────────────────────────────────────
    return res.json({
      success: true,
      meta: {
        timestamp,
        requestId,
        cache:        false,
        flightSource,
        hotelSource,
        aiRanked:     transport.length > 0,
      },
      data: {
        transport,
        hotels,
        buses,
        cars,
        weather,
        itinerary:   [],
        exploration: [],
      },
      message,
      error: null,
    })

  } catch (err) {
    console.error('[Search Route] Unexpected error:', err.message)
    return res.status(500).json({
      success: false,
      error:   'Search service temporarily unavailable',
      meta:    { timestamp, requestId },
      message: 'SYSTEM_ERROR',
    })
  }
})

module.exports = router
