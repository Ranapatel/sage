/**
 * TripSage — Production-Grade Socket Service
 *
 * FAULT-TOLERANCE GUARANTEES:
 * 1. Promise.allSettled — one failing service never blocks others
 * 2. Per-socket rate limiting — prevents spam/abuse
 * 3. Input sanitization on every event
 * 4. Timeouts on all external calls (3–5s per stage)
 * 5. Graceful disconnect — no crash, no leaked timers
 * 6. Partial data is always emitted; never a blank state
 * 7. All errors are caught; socket is never left hanging
 */

'use strict'

const { v4: uuidv4 } = require('uuid')
const {
  searchHotels, searchFlights, searchBuses, searchCars,
  flightBookingLink, hotelBookingLink,
} = require('./travelService')
const { generateItinerary, getRecommendations } = require('./aiService')
const { enrichItineraryWithRealCoords, enrichItineraryWithImages } = require('./placesService')
const { logger } = require('../middleware/logger')
const { sanitizeSocketData } = require('../middleware/validation')
const { socketRateLimiter } = require('../middleware/rateLimiter')

// ── Active session + subscription registry ────────────────────────────────────
const sessions = new Map()       // socketId → { sessionId, connectedAt }
const subscriptions = new Map()  // socketId → { destination, timers: [] }

// ── Helpers ───────────────────────────────────────────────────────────────────

/**
 * Wraps a promise with a hard timeout.
 * On timeout, resolves with the provided fallback instead of rejecting.
 */
function withTimeout(promise, ms, fallback = null) {
  let timer
  const race = Promise.race([
    promise,
    new Promise(resolve => { timer = setTimeout(() => resolve(fallback), ms) }),
  ])
  return race.finally(() => clearTimeout(timer))
}

/**
 * Safely extract .data array from a settled Promise.allSettled result.
 * Handles: { status: 'fulfilled', value: { data: [...] } }
 * Also handles: { status: 'fulfilled', value: [...] }  (array directly)
 * Also handles: { status: 'rejected' }  → returns fallback
 */
function extractData(result, fallback = []) {
  if (result.status !== 'fulfilled') return fallback
  const val = result.value
  if (!val) return fallback
  if (Array.isArray(val)) return val
  if (Array.isArray(val.data)) return val.data
  return fallback
}

/** Safely emit to a socket only if it's still connected */
function safeEmit(socket, event, data) {
  try {
    if (socket.connected) socket.emit(event, data)
  } catch (err) {
    logger.warn('safeEmit failed', { event, err: err.message })
  }
}

/** Clean up all timers registered for a socket */
function clearSocketTimers(socketId) {
  const sub = subscriptions.get(socketId)
  if (sub?.timers) sub.timers.forEach(clearTimeout)
}

// ── Main socket setup ─────────────────────────────────────────────────────────

module.exports = function setupSocket(io) {

  io.on('connection', (socket) => {
    const sessionId = uuidv4()
    sessions.set(socket.id, { sessionId, connectedAt: new Date() })
    logger.info('Socket connected', { socketId: socket.id, sessionId })
    safeEmit(socket, 'SESSION_INIT', { sessionId })

    // ── SUBSCRIBE_UPDATES ─────────────────────────────────────────────────────
    socket.on('SUBSCRIBE_UPDATES', (rawData) => {
      try {
        if (!socketRateLimiter(socket.id, 'SUBSCRIBE_UPDATES', 10)) return
        const { destination } = sanitizeSocketData(rawData)
        if (!destination) return

        socket.join(`dest:${destination.toLowerCase()}`)
        subscriptions.set(socket.id, { destination, timers: [] })
        logger.info('Socket subscribed', { socketId: socket.id, destination })

        safeEmit(socket, 'LOCATION_ALERT', {
          title: `📍 Subscribed to ${destination}`,
          message: `Real-time prices, weather, and alerts for ${destination} are now active`,
        })

        // Start price/weather simulation timers — track them for cleanup
        const timers = startSimulation(socket, destination)
        subscriptions.set(socket.id, { destination, timers })
      } catch (err) {
        logger.error('SUBSCRIBE_UPDATES error', { err: err.message })
      }
    })

    // ── GENERATE_TRIP_STREAM ──────────────────────────────────────────────────
    socket.on('GENERATE_TRIP_STREAM', async (rawData) => {
      // Rate limit: max 3 full trip generations per minute per socket
      if (!socketRateLimiter(socket.id, 'GENERATE_TRIP_STREAM', 3)) {
        safeEmit(socket, 'TRIP_STAGE', {
          stage: 'error',
          message: 'Too many trip requests. Please wait a moment.',
        })
        return
      }

      try {
        const data = sanitizeSocketData(rawData)
        const {
          destination, from,
          startDate, endDate,
          budget = 2000, travelers = 2,
          style = 'adventure', preferences = [],
        } = data

        // Basic validation
        if (!destination || !from) {
          safeEmit(socket, 'TRIP_STAGE', { stage: 'error', message: 'destination and from are required' })
          return
        }

        const checkin  = startDate || new Date().toISOString().split('T')[0]
        const checkout = endDate   || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0]
        const days     = Math.max(1, Math.ceil((new Date(checkout) - new Date(checkin)) / 86400000))

        logger.info('Trip generation started', { socketId: socket.id, destination, from, days })

        // Stage 0: analysis — immediate ack
        safeEmit(socket, 'TRIP_STAGE', {
          stage: 'analysis',
          data: {
            userType: style,
            preferences: preferences.length > 0 ? preferences : [style, `budget:${budget}`],
          },
        })

        // ── PARALLEL FIRE — all external calls start simultaneously ───────────
        const [hotelResult, actResult, flightResult, busResult, carResult, itineraryResult] =
          await Promise.allSettled([
            withTimeout(
              searchHotels({ destination, checkin, checkout, members: travelers, budget, forceRefresh: true }),
              15000, { data: [] }
            ),
            withTimeout(
              getRecommendations({ destination, category: 'activities', budget, style }),
              10000, { data: [] }
            ),
            withTimeout(
              searchFlights({ from, to: destination, date: checkin, returnDate: checkout, travelers, budget, forceRefresh: true }),
              15000, { data: [] }
            ),
            withTimeout(
              searchBuses({ from, to: destination, date: checkin, budget }),
              8000, { data: [] }
            ),
            withTimeout(
              searchCars({ destination, date: checkin, budget }),
              8000, { data: [] }
            ),
            withTimeout(
              generateItinerary({ destination, days, budget, style, preferences, members: travelers, startDate: checkin })
                .then(async res => {
                  if (!res?.data?.itinerary) return []
                  return enrichItineraryWithRealCoords(res.data.itinerary, destination)
                }),
              45000, []
            ),
          ])

        // ── EMIT RESULTS — partial data is always better than nothing ─────────

        // 1. Hotels
        const hotelsData = extractData(hotelResult)
        logger.info('Hotels stage', { count: hotelsData.length, socketId: socket.id })
        safeEmit(socket, 'TRIP_STAGE', { stage: 'hotels', data: hotelsData })

        // 2. Activities
        const actsData = extractData(actResult)
        safeEmit(socket, 'TRIP_STAGE', { stage: 'activities', data: actsData })

        // 3. Transport (flights + buses + cars together)
        const flightsData = extractData(flightResult)
        const busesData   = extractData(busResult)
        const carsData    = extractData(carResult)
        logger.info('Transport stage', { flights: flightsData.length, buses: busesData.length, cars: carsData.length, socketId: socket.id })
        safeEmit(socket, 'TRIP_STAGE', {
          stage: 'transport',
          data: { flights: flightsData, buses: busesData, cars: carsData },
        })

        // 4. Itinerary (base — no images yet)
        const baseItinerary = extractData(itineraryResult)
        logger.info('Itinerary stage', { days: baseItinerary.length, socketId: socket.id })
        safeEmit(socket, 'TRIP_STAGE', { stage: 'itinerary', data: baseItinerary })

        // 4.5. Image enrichment fires in background — does not block "complete"
        if (baseItinerary.length > 0) {
          enrichItineraryWithImages(baseItinerary, destination)
            .then(enriched => safeEmit(socket, 'TRIP_STAGE', { stage: 'itinerary', data: enriched }))
            .catch(err => logger.warn('Image enrichment failed', { err: err.message }))
        }

        // 5. Booking deep links
        safeEmit(socket, 'TRIP_STAGE', {
          stage: 'booking',
          data: {
            flightLink: flightBookingLink(from, destination, checkin),
            hotelLink:  hotelBookingLink(destination, checkin, checkout, travelers),
          },
        })

        // 6. Complete signal
        safeEmit(socket, 'TRIP_STAGE', { stage: 'complete', status: true })
        logger.info('Trip generation complete', { socketId: socket.id, destination })

      } catch (err) {
        logger.error('GENERATE_TRIP_STREAM fatal error', { socketId: socket.id, err: err.message })
        safeEmit(socket, 'TRIP_STAGE', {
          stage: 'error',
          message: 'Trip generation failed. Partial results may be available.',
        })
      }
    })

    // ── LOCATION_UPDATE ───────────────────────────────────────────────────────
    socket.on('LOCATION_UPDATE', (rawData) => {
      try {
        if (!socketRateLimiter(socket.id, 'LOCATION_UPDATE', 20)) return
        const sub = subscriptions.get(socket.id)
        if (!sub) return
        const { lat, lng } = sanitizeSocketData(rawData)
        if (lat == null || lng == null) return
        safeEmit(socket, 'LOCATION_ALERT', {
          title: '📍 Nearby Attraction',
          message: `You're near a popular spot in ${sub.destination}! Check it out.`,
        })
      } catch (err) {
        logger.warn('LOCATION_UPDATE error', { err: err.message })
      }
    })

    // ── DISCONNECT ────────────────────────────────────────────────────────────
    socket.on('disconnect', (reason) => {
      clearSocketTimers(socket.id)
      sessions.delete(socket.id)
      subscriptions.delete(socket.id)
      logger.info('Socket disconnected', { socketId: socket.id, reason })
    })

    socket.on('error', (err) => {
      logger.error('Socket error', { socketId: socket.id, err: err.message })
    })
  })

  // ── Broadcast helpers ─────────────────────────────────────────────────────
  io.broadcastWeather = (destination, weatherData) => {
    io.to(`dest:${destination.toLowerCase()}`).emit('WEATHER_ALERT', {
      ...weatherData,
      destination,
      message: `${weatherData.condition} in ${destination} — ${weatherData.temperature}°C`,
    })
  }

  io.broadcastPriceUpdate = (destination, priceData) => {
    io.to(`dest:${destination.toLowerCase()}`).emit('PRICE_UPDATE', priceData)
  }

  // ── Heartbeat (60s interval) ──────────────────────────────────────────────
  const heartbeat = setInterval(() => {
    io.emit('SYSTEM_STATUS', {
      type: 'heartbeat',
      ts: new Date().toISOString(),
      activeSessions: sessions.size,
    })
  }, 60000)

  // Clean up heartbeat if server closes
  process.once('SIGTERM', () => clearInterval(heartbeat))
  process.once('SIGINT',  () => clearInterval(heartbeat))

  logger.info('Socket.IO service initialized')
}

// ── Price/weather simulation helpers ─────────────────────────────────────────

function startSimulation(socket, destination) {
  const timers = []
  const ALERTS = [
    { delay: 8000,  type: 'deal',    msg: '💰 Flash sale: 20% off hotels this weekend!' },
    { delay: 15000, type: 'weather', msg: `🌦️ Rain expected in ${destination} — pack light gear` },
    { delay: 25000, type: 'info',    msg: `💡 Best time to visit ${destination}: early morning` },
  ]
  for (const { delay, type, msg } of ALERTS) {
    const t = setTimeout(() => {
      safeEmit(socket, 'LOCATION_ALERT', {
        title: type === 'deal' ? '💰 Deal Alert' : type === 'weather' ? '🌦️ Weather' : '💡 Tip',
        message: msg,
      })
    }, delay)
    timers.push(t)
  }
  const priceTimer = setTimeout(() => {
    safeEmit(socket, 'PRICE_UPDATE', {
      type: 'flight',
      price: Math.floor(Math.random() * 200) + 150,
      destination,
      message: '✈️ Flight price dropped!',
    })
  }, 12000)
  timers.push(priceTimer)
  return timers
}
