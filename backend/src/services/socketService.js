const { v4: uuidv4 } = require('uuid')

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
