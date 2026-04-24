const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const { searchFlights, searchHotels } = require('../services/travelService')
const { getWeather } = require('../services/weatherService')
const { v4: uuidv4 } = require('uuid')

// Input validation
const searchValidation = [
  body('from').trim().notEmpty().isLength({ max: 100 }).escape(),
  body('to').trim().notEmpty().isLength({ max: 100 }).escape(),
  body('startDate').optional({ checkFalsy: true }).isISO8601(),
  body('endDate').optional({ checkFalsy: true }).isISO8601(),
  body('budget').optional({ checkFalsy: true }).isFloat({ min: 0, max: 10000000 }).toFloat(),
  body('travelers').optional({ checkFalsy: true }).isInt({ min: 1, max: 20 }).toInt(),
  body('style').optional({ checkFalsy: true }).trim().isLength({ max: 50 }),
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
    budget = 2000, travelers = 2, style = 'adventure'
  } = req.body

  const requestId = uuidv4()
  const timestamp = new Date().toISOString()

  try {
    // Execute all searches in parallel (3-5 sec timeout)
    const [flightResult, hotelResult, weatherResult] = await Promise.allSettled([
      searchFlights({ from, to, date: startDate, returnDate: endDate, travelers, budget }),
      searchHotels({ destination: to, checkin: startDate, checkout: endDate, members: travelers, budget }),
      getWeather(to),
    ])

    const transport = flightResult.status === 'fulfilled' ? flightResult.value.data : []
    const hotels = hotelResult.status === 'fulfilled' ? hotelResult.value.data : []
    const weather = weatherResult.status === 'fulfilled' ? weatherResult.value.data : null

    const flightSource = flightResult.status === 'fulfilled' ? flightResult.value.meta?.source : 'error'
    const hotelSource = hotelResult.status === 'fulfilled' ? hotelResult.value.meta?.source : 'error'

    res.json({
      success: true,
      meta: { timestamp, requestId, cache: false, flightSource, hotelSource },
      data: { transport, hotels, weather },
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
