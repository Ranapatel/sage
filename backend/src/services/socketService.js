const { v4: uuidv4 } = require('uuid')
const { searchFlights, searchHotels, searchBuses, searchCars } = require('./travelService')
const { generateItinerary } = require('./aiService')
const { enrichHotelsWithImages, enrichFlightsWithImages } = require('./imageService')

const sessions = new Map()
const subscriptions = new Map()

module.exports = function setupSocket(io) {
  io.on('connection', (socket) => {
    const sessionId = uuidv4()
    sessions.set(socket.id, { sessionId, connectedAt: new Date() })
    console.log(`[TripSage Socket] Client connected: ${socket.id} | Session: ${sessionId}`)

    // Send session ID to client
    socket.emit('SESSION_INIT', { sessionId })

    // Subscribe to destination updates
    socket.on('SUBSCRIBE_UPDATES', (data) => {
      const { destination, sessionId: clientSession } = data
      if (!destination) return

      // Join destination room for targeted updates
      socket.join(`dest:${destination.toLowerCase()}`)
      subscriptions.set(socket.id, { destination, sessionId: clientSession })

      console.log(`[TripSage Socket] ${socket.id} subscribed to ${destination}`)

      // Send immediate welcome notification
      socket.emit('LOCATION_ALERT', {
        title: `Subscribed to ${destination}`,
        message: `You'll receive real-time updates for prices, weather, and alerts in ${destination}`,
      })

      // Simulate periodic price updates for demo
      startPriceSimulation(socket, destination)
    })

    // Handle search requests via socket
    socket.on('SEARCH_REQUEST', async (data) => {
      socket.emit('SEARCH_START', { timestamp: new Date().toISOString() })
      // Search results would come from the search service
    })

    socket.on('GENERATE_TRIP_STREAM', async (data) => {
      const { destination, from, startDate, endDate, budget, travelers, style, preferences } = data
      const startTime = Date.now()
      console.log(`[Perf] Starting trip generation for ${destination}`)
      
      socket.emit('TRIP_STAGE', { stage: 'analysis', data: { userType: style }, message: 'Analyzing request' })

      try {
        const fetchStart = Date.now()
        // Execute parallel requests for fast transport/hotel results
        const [flightRes, hotelRes, busRes, carRes] = await Promise.allSettled([
          searchFlights({ from, to: destination, date: startDate, returnDate: endDate, travelers, budget }),
          searchHotels({ destination, checkin: startDate, checkout: endDate, members: travelers, budget }),
          searchBuses({ from, to: destination, date: startDate, budget }),
          searchCars({ destination, date: startDate, budget }),
        ])

        const flights = flightRes.status === 'fulfilled' ? flightRes.value?.data || [] : []
        const hotels = hotelRes.status === 'fulfilled' ? hotelRes.value?.data || [] : []
        const buses = busRes.status === 'fulfilled' ? busRes.value?.data || [] : []
        const cars = carRes.status === 'fulfilled' ? carRes.value?.data || [] : []
        const fetchLatency = Date.now() - fetchStart
        console.log(`[Perf] Parallel APIs completed in ${fetchLatency}ms (Flights/Hotels/Buses/Cars)`)

        // Enrich images without blocking
        enrichHotelsWithImages(hotels, destination).catch(() => {})
        enrichFlightsWithImages(flights, destination).catch(() => {})

        // Stream transport and hotel results immediately
        socket.emit('TRIP_STAGE', { 
          stage: 'transport', 
          data: { flights, buses, cars }, 
          message: 'Transport options loaded' 
        })
        
        socket.emit('TRIP_STAGE', { 
          stage: 'hotels', 
          data: hotels, 
          message: 'Hotels loaded' 
        })

        // Calculate days
        let days = 3;
        if (startDate && endDate) {
          const s = new Date(startDate);
          const e = new Date(endDate);
          if (!isNaN(s) && !isNaN(e)) {
            days = Math.max(1, Math.ceil((e - s) / (1000 * 60 * 60 * 24)));
          }
        }

        // Then asynchronously fetch the itinerary from Groq
        const aiStart = Date.now()
        const itineraryRes = await generateItinerary({ 
          destination, 
          days, 
          budget, 
          style, 
          preferences, 
          members: travelers, 
          startDate 
        })
        const aiLatency = Date.now() - aiStart
        console.log(`[Perf] AI Itinerary generation completed in ${aiLatency}ms`)

        if (itineraryRes.success) {
          socket.emit('TRIP_STAGE', { 
            stage: 'itinerary', 
            data: itineraryRes.data.itinerary, 
            message: 'Itinerary generated' 
          })
        }

        const totalLatency = Date.now() - startTime
        console.log(`[Perf] Total Trip Generation Stream completed in ${totalLatency}ms`)
        socket.emit('TRIP_STAGE', { stage: 'complete', message: 'Trip generation complete' })

      } catch (error) {
        console.error('[TripSage Socket] Stream error:', error)
        socket.emit('TRIP_STAGE', { stage: 'error', message: error.message })
      }
    })

    // User location update for location-based notifications
    socket.on('LOCATION_UPDATE', (coords) => {
      const sub = subscriptions.get(socket.id)
      if (sub) {
        checkLocationAlerts(socket, coords, sub.destination)
      }
    })

    socket.on('disconnect', () => {
      sessions.delete(socket.id)
      subscriptions.delete(socket.id)
      console.log(`[TripSage Socket] Client disconnected: ${socket.id}`)
    })
  })

  // Broadcast weather alerts to all subscribers of a destination
  io.broadcastWeather = (destination, weatherData) => {
    io.to(`dest:${destination.toLowerCase()}`).emit('WEATHER_ALERT', {
      ...weatherData,
      destination,
      message: `${weatherData.condition} in ${destination} — ${weatherData.temperature}°C`,
    })
  }

  // Broadcast price updates
  io.broadcastPriceUpdate = (destination, priceData) => {
    io.to(`dest:${destination.toLowerCase()}`).emit('PRICE_UPDATE', priceData)
  }

  // Simulate real-time updates for demo
  function startPriceSimulation(socket, destination) {
    const ALERTS = [
      { type: 'deal', message: 'Flash sale: 20% off hotels this weekend!', delay: 8000 },
      { type: 'weather', message: `Rain expected in ${destination} — pack light gear`, delay: 15000 },
      { type: 'info', message: `Best time to visit ${destination}: early morning`, delay: 25000 },
    ]

    ALERTS.forEach(({ type, message, delay }) => {
      setTimeout(() => {
        if (!socket.connected) return
        socket.emit('LOCATION_ALERT', {
          title: type === 'deal' ? '💰 Deal Alert' : type === 'weather' ? '🌦️ Weather' : '💡 Tip',
          message,
        })
      }, delay)
    })

    // Simulate price drop after 12 seconds
    setTimeout(() => {
      if (!socket.connected) return
      socket.emit('PRICE_UPDATE', {
        type: 'flight',
        price: Math.floor(Math.random() * 200) + 150,
        destination,
        message: 'Flight price dropped!',
      })
    }, 12000)
  }

  function checkLocationAlerts(socket, coords, destination) {
    // In production, this would check against POI database
    socket.emit('LOCATION_ALERT', {
      title: '📍 Nearby Attraction',
      message: `You're near a popular spot in ${destination}! Check it out.`,
    })
  }

  // Periodic weather refresh (every 5 mins in production)
  setInterval(() => {
    io.emit('SYSTEM_STATUS', {
      type: 'heartbeat',
      timestamp: new Date().toISOString(),
      activeSessions: sessions.size,
    })
  }, 60000)

  console.log('[TripSage] ✅ Socket.IO service initialized')
}
