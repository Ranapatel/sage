const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const { searchHotels, searchBuses, searchCars, searchFlights, generateMockHotels } = require('../services/travelService')
const { getWeather } = require('../services/weatherService')
let enrichHotelsWithImages = async (hotels) => hotels;
try {
  enrichHotelsWithImages = require('../services/imageService').enrichHotelsWithImages;
} catch (e) {
  try {
    enrichHotelsWithImages = require('../services/imageService.ts').enrichHotelsWithImages;
  } catch (e2) {
    console.warn('[search.js] Could not load imageService:', e2.message);
  }
}
const { v4: uuidv4 } = require('uuid')
const { fetchWithRetry } = require('../utils/fetchWithRetry')
const { isSameCountry } = require('../utils/countryUtils')
const axios = require('axios')

// Input validation
const searchValidation = [
  body('from').trim().notEmpty().isLength({ max: 100 }).escape(),
  body('to').optional({ checkFalsy: true }).isLength({ max: 200 }).escape(),
  body('startDate').optional({ checkFalsy: true }).isISO8601(),
  body('endDate').optional({ checkFalsy: true }).isISO8601(),
  body('budget').optional({ checkFalsy: true }).isFloat({ min: 0, max: 10000000 }).toFloat(),
  body('travelers').optional({ checkFalsy: true }).isInt({ min: 1, max: 20 }).toInt(),
  body('style').optional({ checkFalsy: true }).trim().isLength({ max: 50 }),
  body('rooms').optional({ checkFalsy: true }).isInt({ min: 1, max: 10 }).toInt(),
  body('adults').optional({ checkFalsy: true }).isInt({ min: 1, max: 20 }).toInt(),
  body('children').optional({ checkFalsy: true }).isInt({ min: 0, max: 20 }).toInt(),
  body('isMultiCity').optional().isBoolean(),
  body('stops').optional().isArray(),
]

const addDays = (dateStr, days) => {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().split('T')[0]
}

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
    rooms = 1, adults = 2, children = 0,
    isMultiCity = false, stops = []
  } = req.body

  const requestId = uuidv4()
  const timestamp = new Date().toISOString()

  try {
    if (isMultiCity && stops.length > 0) {
      console.log(`[Search Route] Orchestrating Multi-City trip from ${from} with stops:`, stops);

      // 1. Build flight search promises for each leg (including return to origin)
      const flightPromises = []
      let legStart = startDate
      for (let i = 0; i < stops.length; i++) {
        const origin = i === 0 ? from : stops[i - 1].city
        const dest = stops[i].city
        const date = legStart

        flightPromises.push(
          fetchWithRetry(
            () => searchFlights({ from: origin, to: dest, date, travelers, budget }),
            { timeout: 10000, maxRetries: 2, label: `Flights-Leg-${i + 1}` }
          ).catch(() => ({ data: [], meta: { source: 'error' } }))
        )
        legStart = addDays(legStart, stops[i].nights)
      }
      // Add return flight to origin
      flightPromises.push(
        fetchWithRetry(
          () => searchFlights({ from: stops[stops.length - 1].city, to: from, date: legStart, travelers, budget }),
          { timeout: 10000, maxRetries: 2, label: 'Flights-Leg-Return' }
        ).catch(() => ({ data: [], meta: { source: 'error' } }))
      )

      // 2. Build hotel search promises for each stop
      let hotelStart = startDate
      const hotelPromises = stops.map((stop, idx) => {
        const checkin = hotelStart
        const checkout = addDays(checkin, stop.nights)
        hotelStart = checkout // forward dates for next check-in
        return fetchWithRetry(
          () => searchHotels({ destination: stop.city, checkin, checkout, members: travelers, budget, rooms, adults, children }),
          { timeout: 10000, maxRetries: 2, label: `Hotels-${stop.city}` }
        ).catch(() => ({ data: [], meta: { source: 'error' } }))
      })

      // Run flight legs, hotel queries, and first-stop weather in parallel
      const [flightsResults, hotelsResults, weatherResult] = await Promise.all([
        Promise.all(flightPromises),
        Promise.all(hotelPromises),
        fetchWithRetry(
          () => getWeather(stops[0].city),
          { timeout: 10000, maxRetries: 2, label: 'Weather-Stop-1' }
        ).catch(() => ({ data: null }))
      ])

      // Flatten and merge transport options
      const transport = flightsResults.reduce((acc, curr) => acc.concat(curr.data || []), [])
      // Flatten and merge hotel options
      const hotels = hotelsResults.reduce((acc, curr) => acc.concat(curr.data || []), [])
      const weather = weatherResult.data || null

      // Enrich with real images
      const targetEnrichCity = stops[0].city
      const [enrichedHotels, enrichedFlights] = await Promise.all([
        enrichHotelsWithImages(hotels, targetEnrichCity).catch(() => hotels),
        enrichFlightsWithImages(transport, targetEnrichCity).catch(() => transport),
      ])

      return res.json({
        success: true,
        meta: { timestamp, requestId, cache: false, flightSource: 'multi', hotelSource: 'multi' },
        data: {
          transport: enrichedFlights,
          hotels: enrichedHotels,
          buses: [],
          busSearchUrl: '',
          cars: [],
          weather,
          trains: [],
          trainSearchUrl: '',
          trainStationInfo: null,
          isTrainDomestic: false
        },
        message: 'LIVE_UPDATE',
        error: null,
      })
    }

    // Single city fallback (existing path)
    const isDomesticRoute = isSameCountry(from, to);

    const [flightResult, hotelResult, busResult, carResult, weatherResult, trainResult] = await Promise.all([
      fetchWithRetry(
        () => searchFlights({ from, to, date: startDate, returnDate: endDate, travelers, budget }),
        { timeout: 10000, maxRetries: 2, label: 'Flights' }
      ).catch(() => ({ data: [], meta: { source: 'error' } })),
      fetchWithRetry(
        () => searchHotels({ destination: to, checkin: startDate, checkout: endDate, members: travelers, budget, rooms, adults, children }),
        { timeout: 12000, maxRetries: 2, label: 'Hotels' }
      ).catch(() => ({ data: generateMockHotels(to, startDate, endDate, travelers, budget), meta: { source: 'fallback' } })),
      isDomesticRoute
        ? fetchWithRetry(
            () => searchBuses({ from, to, date: startDate, budget }),
            { timeout: 4000, maxRetries: 1, label: 'Buses' }
          ).catch(() => ({ data: [] }))
        : Promise.resolve({ success: false, results: [], isDomestic: false, message: 'International bus services are not available for this route.' }),
      fetchWithRetry(
        () => searchCars({ from, destination: to, date: startDate, budget }),
        { timeout: 4000, maxRetries: 1, label: 'Cars' }
      ).catch(() => ({ data: [] })),
      fetchWithRetry(
        () => getWeather(to),
        { timeout: 4000, maxRetries: 1, label: 'Weather' }
      ).catch(() => ({ data: null })),
<<<<<<< Updated upstream
      isDomesticRoute
        ? fetchWithRetry(
            async () => {
              const nestUrl = process.env.TRANSPORT_SERVICE_URL || 'http://localhost:4001';
              const response = await axios.post(`${nestUrl}/api/train/search`, {
                departureCity: from,
                destinationCity: to,
                departureDate: startDate,
                passengers: travelers || 1,
                travelClass: 'ALL'
              }, { timeout: 3000 });
              return response.data;
            },
            { timeout: 4000, maxRetries: 0, label: 'Trains' }
          ).catch((err) => {
            console.warn('[Search Route] Train search fallback:', err.message);
            return [];
          })
        : Promise.resolve({ trains: [], isDomestic: false, message: 'International train services are not available for this route.' }),
=======
      fetchWithRetry(
        async () => {
          if (!isSameCountry(from, to)) {
            return {
              results: [],
              searchUrl: '',
              message: 'International train services are not available for this route.',
              isDomestic: false
            };
          }
          const nestUrl = process.env.TRANSPORT_SERVICE_URL || 'http://localhost:4001';
          const response = await axios.post(`${nestUrl}/api/train/search`, {
            departureCity: from,
            destinationCity: to,
            departureDate: startDate,
            passengers: travelers || 1,
            travelClass: 'ALL'
          }, { timeout: 3000 });
          return response.data;
        },
        { timeout: 4000, maxRetries: 0, label: 'Trains' }
      ).catch((err) => {
        console.warn('[Search Route] Train search fallback:', err.message);
        return [];
      }),
>>>>>>> Stashed changes
    ])

    const hotels = hotelResult.data || []
    const cars = carResult.data || []
    const weather = weatherResult.data || null
    const flights = flightResult.data || []

    // Unwrap bus service envelope
    const busEnvelope = busResult || {}
    const buses = Array.isArray(busEnvelope.results) ? busEnvelope.results : (Array.isArray(busResult) ? busResult : [])
    const busSearchUrl = busEnvelope.searchUrl || ''

    // Unwrap train service envelope
    const trainEnvelope = trainResult || {}
    const trains = Array.isArray(trainEnvelope.results) ? trainEnvelope.results : (Array.isArray(trainEnvelope.trains) ? trainEnvelope.trains : (Array.isArray(trainResult) ? trainResult : []))
    const trainStationInfo = trainEnvelope.stationInfo || null
    const trainSearchUrl = trainEnvelope.searchUrl || ''
    const isTrainDomestic = trainEnvelope.isDomestic !== undefined ? trainEnvelope.isDomestic : (trains.length > 0 || !!trainSearchUrl)

    const hotelSource = hotelResult.meta?.source || 'error'

    // Combine all multi-modal ground and flight transport into unified transport list
    const transport = [...flights, ...trains, ...buses, ...cars]

    // Enrich with real images — capped at 3s so slow image APIs never delay search output
    const enrichedHotels = await Promise.race([
      enrichHotelsWithImages(hotels, to),
      new Promise((resolve) => setTimeout(() => resolve(hotels), 3000)),
    ]).catch(() => hotels)

    res.json({
      success: true,
      meta: { timestamp, requestId, cache: false, hotelSource },
      data: {
        transport,
        flights,
        flightError: flightResult.error || null,
        flightValidation: {
          hasCommercialAirport: flightResult.hasCommercialAirport ?? true,
          reason: flightResult.reason || null,
          noAirportCity: flightResult.noAirportCity || null,
          nearestAirport: flightResult.nearestAirport || null,
          alternativeModes: flightResult.alternativeModes || [],
          message: flightResult.message || null,
        },
        hotels: enrichedHotels,
        buses,
        busSearchUrl,
        cars,
        weather,
        trains,
        trainSearchUrl,
        trainStationInfo,
        isTrainDomestic,
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
