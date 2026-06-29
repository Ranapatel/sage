const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const { searchFlights, searchHotels, searchBuses, searchCars } = require('../services/travelService')
const { getWeather } = require('../services/weatherService')
const { enrichHotelsWithImages, enrichFlightsWithImages } = require('../services/imageService')
const { v4: uuidv4 } = require('uuid')
const { fetchWithRetry } = require('../utils/fetchWithRetry')
const axios = require('axios')

// Input validation
const searchValidation = [
  body('from').trim().notEmpty().isLength({ max: 100 }).escape(),
  body('to').trim().notEmpty().isLength({ max: 100 }).escape(),
  body('startDate').optional({ checkFalsy: true }).isISO8601(),
  body('endDate').optional({ checkFalsy: true }).isISO8601(),
  body('budget').optional({ checkFalsy: true }).isFloat({ min: 0, max: 10000000 }).toFloat(),
  body('travelers').optional({ checkFalsy: true }).isInt({ min: 1, max: 20 }).toInt(),
  body('style').optional({ checkFalsy: true }).trim().isLength({ max: 50 }),
  body('rooms').optional({ checkFalsy: true }).isInt({ min: 1, max: 10 }).toInt(),
  body('adults').optional({ checkFalsy: true }).isInt({ min: 1, max: 20 }).toInt(),
  body('children').optional({ checkFalsy: true }).isInt({ min: 0, max: 20 }).toInt(),
]

// POST /api/search — Parallel search orchestration
router.post('/', searchValidation, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    console.warn('[Search Validation Failed]', req.body, errors.array())
    return res.status(400).json({ success: false, error: 'Invalid input', details: errors.array() })
  }

  const {
    from, to, startDate, endDate,
    budget = 2000, travelers = 2, style = 'adventure',
    rooms = 1, adults = 2, children = 0
  } = req.body

  const requestId = uuidv4()
  const timestamp = new Date().toISOString()

  try {
    // Execute all searches in parallel — each with 10s timeout and 2 retries
    const [flightResult, hotelResult, busResult, carResult, weatherResult, trainResult] = await Promise.all([
      fetchWithRetry(
        () => searchFlights({ from, to, date: startDate, returnDate: endDate, travelers, budget }),
        { timeout: 10000, maxRetries: 2, label: 'Flights' }
      ).catch(() => ({ data: [], meta: { source: 'error' } })),
      fetchWithRetry(
        () => searchHotels({ destination: to, checkin: startDate, checkout: endDate, members: travelers, budget, rooms, adults, children }),
        { timeout: 10000, maxRetries: 2, label: 'Hotels' }
      ).catch(() => ({ data: [], meta: { source: 'error' } })),
      fetchWithRetry(
        () => searchBuses({ from, to, date: startDate, budget }),
        { timeout: 10000, maxRetries: 2, label: 'Buses' }
      ).catch(() => ({ data: [] })),
      fetchWithRetry(
        () => searchCars({ destination: to, date: startDate, budget }),
        { timeout: 10000, maxRetries: 2, label: 'Cars' }
      ).catch(() => ({ data: [] })),
      fetchWithRetry(
        () => getWeather(to),
        { timeout: 10000, maxRetries: 2, label: 'Weather' }
      ).catch(() => ({ data: null })),
      fetchWithRetry(
        async () => {
          const nestUrl = process.env.TRANSPORT_SERVICE_URL || 'http://localhost:4001';
          const response = await axios.post(`${nestUrl}/api/train/search`, {
            departureCity: from,
            destinationCity: to,
            departureDate: startDate,
            passengers: travelers || 1,
            travelClass: 'ALL'
          });
          return response.data;
        },
        { timeout: 10000, maxRetries: 2, label: 'Trains' }
      ).catch((err) => {
        console.error('[Search Route] Train search failed:', err.message);
        return [];
      }),
    ])

    const transport = flightResult.data || []
    const hotels = hotelResult.data || []
    const cars = carResult.data || []
    const weather = weatherResult.data || null

    // Unwrap bus service envelope: { results: [...], searchUrl: "..." }
    const busEnvelope = busResult || {}
    const buses = Array.isArray(busEnvelope.results) ? busEnvelope.results : (Array.isArray(busResult) ? busResult : [])
    const busSearchUrl = busEnvelope.searchUrl || ''

    // Unwrap train service envelope: { results: [...], stationInfo: {...}, isDomestic: bool, searchUrl: "..." }
    const trainEnvelope = trainResult || {}
    const trains = Array.isArray(trainEnvelope.results) ? trainEnvelope.results : (Array.isArray(trainEnvelope.trains) ? trainEnvelope.trains : (Array.isArray(trainResult) ? trainResult : []))
    const trainStationInfo = trainEnvelope.stationInfo || null
    const trainSearchUrl = trainEnvelope.searchUrl || ''
    const isTrainDomestic = trainEnvelope.isDomestic !== undefined ? trainEnvelope.isDomestic : (trains.length > 0 || !!trainSearchUrl)

    const flightSource = flightResult.meta?.source || 'error'
    const hotelSource = hotelResult.meta?.source || 'error'

    // Enrich with real Unsplash images (non-blocking — falls back silently)
    const [enrichedHotels, enrichedFlights] = await Promise.all([
      enrichHotelsWithImages(hotels, to).catch(() => hotels),
      enrichFlightsWithImages(transport, to).catch(() => transport),
    ])

    res.json({
      success: true,
      meta: { timestamp, requestId, cache: false, flightSource, hotelSource },
      data: {
        transport: enrichedFlights,
        hotels: enrichedHotels,
        buses,
        busSearchUrl,
        cars,
        weather,
        trains,
        trainSearchUrl,
        trainStationInfo,
        isTrainDomestic
      },
      message: 'LIVE_UPDATE',
      error: null,
    })
  } catch (err) {
    console.error('[Search Route] Error:', err.message)
    res.status(500).json({
      success: false,
      error: 'Search service temporarily unavailable',
      meta: { timestamp, requestId },
    })
  }
})

module.exports = router
