const { v4: uuidv4 } = require('uuid')
const { searchHotels, searchFlights, searchBuses, searchCars, flightBookingLink, hotelBookingLink } = require('./travelService')
const { generateItinerary, getRecommendations } = require('./aiService')
const { enrichItineraryWithRealCoords } = require('./placesService')

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

    // Handle progressive trip generation streaming
    socket.on('GENERATE_TRIP_STREAM', async (data) => {
      try {
        const { destination, from, startDate, endDate, budget = 2000, travelers = 2, style = 'adventure', preferences = [] } = data;
        
        // Use realistic dates if missing
        const checkin = startDate || new Date().toISOString().split('T')[0];
        const checkout = endDate || new Date(Date.now() + 86400000 * 3).toISOString().split('T')[0];
        const days = Math.max(1, Math.ceil((new Date(checkout) - new Date(checkin)) / 86400000));

        // 1. INITIATE ALL FETCHES IN PARALLEL
        const hotelPromise = searchHotels({ destination, checkin, checkout, members: travelers, budget });
        const actPromise = getRecommendations({ destination, category: 'activities', budget, style });
        const flightPromise = searchFlights({ from, to: destination, date: checkin, returnDate: checkout, travelers, budget });
        const busPromise = searchBuses({ from, to: destination, date: checkin, budget });
        const carPromise = searchCars({ destination, date: checkin, budget });
        
        // Start itinerary in parallel too
        const itineraryPromise = generateItinerary({ destination, days, budget, style, preferences, members: travelers, startDate: checkin })
          .then(async itinRes => {
            if (itinRes.data?.itinerary) {
              return await enrichItineraryWithRealCoords(itinRes.data.itinerary, destination);
            }
            return [];
          })
          .catch(err => {
            console.error('[Socket] Itinerary error:', err.message);
            return [];
          });

        // Timeout helper to ensure < 3s per block (total < 5s as they run in parallel)
        const withTimeout = (promise, ms = 3000) => {
          let timer;
          return Promise.race([
            promise,
            new Promise((resolve) => timer = setTimeout(() => resolve({ data: [] }), ms))
          ]).finally(() => clearTimeout(timer));
        };

        // Stage 1: analysis (emit immediately)
        socket.emit('TRIP_STAGE', { 
          stage: 'analysis', 
          data: { 
            userType: style, 
            preferences: preferences.length > 0 ? preferences : [style, 'budget:' + budget] 
          } 
        });

        // STRICT EMIT ORDER:
        // 1. Hotels
        const hotelRes = await withTimeout(hotelPromise, 3000).catch(() => ({ data: [] }));
        socket.emit('TRIP_STAGE', { 
          stage: 'hotels', 
          data: hotelRes.data || [] 
        });

        // 2. Activities
        const actRes = await withTimeout(actPromise, 3000).catch(() => ({ data: [] }));
        socket.emit('TRIP_STAGE', { 
          stage: 'activities', 
          data: actRes.data || [] 
        });

        // 3. Flights (Transport)
        const flightRes = await withTimeout(flightPromise, 3000).catch(() => ({ data: [] }));
        const busRes = await busPromise.catch(() => ({ data: [] }));
        const carRes = await carPromise.catch(() => ({ data: [] }));
        
        socket.emit('TRIP_STAGE', {
          stage: 'transport',
          data: {
            flights: flightRes.data || [],
            buses: busRes.data || [],
            cars: carRes.data || []
          }
        });

        // 4. Itinerary
        const enrichedItinerary = await withTimeout(itineraryPromise, 4500).catch(() => []);
        socket.emit('TRIP_STAGE', { 
          stage: 'itinerary', 
          data: Array.isArray(enrichedItinerary) ? enrichedItinerary : (enrichedItinerary.data || [])
        });

        // Stage 5: booking (deep links)
        const fLink = flightBookingLink(from, destination, checkin);
        const hLink = hotelBookingLink(destination, checkin, checkout, travelers);
        socket.emit('TRIP_STAGE', { 
          stage: 'booking', 
          data: { flightLink: fLink, hotelLink: hLink } 
        });

        // Final emit
        socket.emit('TRIP_STAGE', { stage: 'complete', status: true });

      } catch (err) {
        console.error('[Socket] Stream error:', err.message);
        socket.emit('TRIP_STAGE', { stage: 'error', message: err.message });
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
