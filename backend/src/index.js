require('dotenv').config()

// Increase default EventEmitter limit (prevents TLSSocket warning from concurrent axios requests)
require('events').EventEmitter.defaultMaxListeners = 30

const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')

// Production-grade middleware
const { logger, requestLogger } = require('./middleware/logger')
const { notFoundHandler, globalErrorHandler } = require('./middleware/errorHandler')
const { apiLimiter, searchLimiter, aiLimiter, cityLimiter } = require('./middleware/rateLimiter')

// Validate required env vars
const REQUIRED_ENV = [
  'GROQ_API_KEY', 'REDIS_URL', 'DB_URL',
  'RAPIDAPI_KEY',
]
const missing = REQUIRED_ENV.filter(k => !process.env[k])
if (missing.length > 0) {
  console.warn(`[TripSage] ⚠️  Missing env vars: ${missing.join(', ')} — running in DEMO mode`)
}

const app = express()
const server = http.createServer(app)

// Allow any localhost port in dev; allow CORS_ORIGIN (or *) in production
const allowedOrigin = (origin, callback) => {
  if (!origin) return callback(null, true) // non-browser (curl, Postman)
  // Always allow localhost
  if (
    origin.startsWith('http://localhost') ||
    origin.startsWith('http://127.0.0.1')
  ) return callback(null, true)
  
  // Explicitly allow custom production domains
  if (origin === 'https://tripsage.in' || origin === 'https://www.tripsage.in') {
    return callback(null, true);
  }

  // Allow wildcard
  if (process.env.CORS_ORIGIN === '*') return callback(null, true)
  // Allow explicit origin match
  if (process.env.CORS_ORIGIN && origin === process.env.CORS_ORIGIN) return callback(null, true)
  // Allow all HTTPS in non-production so deployed frontends work
  if (process.env.NODE_ENV !== 'production' && origin.startsWith('https://')) return callback(null, true)
  // Production: allow any vercel/render/railway preview URL by default
  if (
    origin.endsWith('.vercel.app') ||
    origin.endsWith('.onrender.com') ||
    origin.endsWith('.railway.app') ||
    origin.endsWith('.netlify.app')
  ) return callback(null, true)
  callback(new Error(`CORS: origin '${origin}' not allowed`))
}

// Socket.IO
const io = new Server(server, {
  cors: {
    origin: allowedOrigin,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  transports: ['websocket', 'polling'],
})

// Middleware
app.use(helmet({ contentSecurityPolicy: false }))
app.use(compression())
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}))
app.use(express.json({ limit: '10kb' }))
// Structured request logger (replaces morgan)
app.use(requestLogger)

// Routes
const searchRouter = require('./routes/search')
const itineraryRouter = require('./routes/itinerary')
const weatherRouter = require('./routes/weather')
const bookingRouter = require('./routes/booking')
const exploreRouter = require('./routes/explore')
const notificationsRouter = require('./routes/notifications')
const profileRouter = require('./routes/profile')
const authRouter = require('./routes/auth')
const placesRouter = require('./routes/places')
const citiesRouter = require('./routes/cities')

app.use('/api/auth', authRouter)
app.use('/api/search',        searchLimiter, searchRouter)
app.use('/api/itinerary',     aiLimiter, itineraryRouter)
app.use('/api/weather',       apiLimiter, weatherRouter)
app.use('/api/booking',       apiLimiter, bookingRouter)
app.use('/api/explore',       apiLimiter, exploreRouter)
app.use('/api/notifications', apiLimiter, notificationsRouter)
app.use('/api/profile',       apiLimiter, profileRouter)
app.use('/api/places',        apiLimiter, placesRouter)
app.use('/api/cities',        cityLimiter, citiesRouter)

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    env: process.env.NODE_ENV || 'development',
    port: process.env.PORT || 5000,
    routes: [
      '/api/auth', '/api/search', '/api/itinerary', '/api/weather',
      '/api/booking', '/api/explore', '/api/notifications', '/api/profile', '/api/places'
    ],
    services: {
      groq: !!process.env.GROQ_API_KEY,
      redis: !!process.env.REDIS_URL,
      db: !!process.env.DB_URL,
      rapidapi: !!process.env.RAPIDAPI_KEY,
    }
  })
})

// Root route (Welcome message)
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to the TripSage API Backend',
    status: 'Running smoothly',
    hint: 'Visit /health for system status, or use the /api endpoints for data.'
  })
})

// 404 + global error handlers (must be after all routes)
app.use(notFoundHandler)
app.use(globalErrorHandler)

// Socket.IO real-time engine
require('./services/socketService')(io)

// Database connection
const connectDB = require('../config/database')
const seedDemo = require('./services/seedService')
connectDB()
  .then(() => seedDemo())
  .catch(err => {
    console.warn('[TripSage] DB connection skipped:', err.message)
    seedDemo() // still seed in-memory fallback
  })

// Redis connection
const { connectRedis } = require('../config/redis')
connectRedis().catch(err => console.warn('[TripSage] Redis connection skipped:', err.message || err.code || 'unavailable'))

let PORT = parseInt(process.env.PORT || '5000', 10);

function startServer(port) {
  server.listen(port, () => {
    console.log(`[TripSage] 🚀 Server running on port ${port}`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(`\n[TripSage] 💥 ERROR: Port ${port} is already in use!`);
      console.error(`Please kill the process using port ${port} or restart your terminal.`);
      process.exit(1);
    } else {
      console.error('[TripSage] 💥 Server error:', err.message);
      process.exit(1);
    }
  });
}

startServer(PORT)

// Process-level crash guards (last resort)
process.on('uncaughtException', (err) => {
  logger.error('uncaughtException — server kept alive', { msg: err.message, stack: err.stack })
})
process.on('unhandledRejection', (reason) => {
  logger.error('unhandledRejection — server kept alive', { reason: String(reason) })
})

// Graceful shutdown
function shutdown(signal) {
  console.log(`\n[TripSage] ${signal} received — shutting down gracefully...`);
  server.close(() => {
    console.log('[TripSage] ✅ HTTP server closed.');
    process.exit(0);
  });
  setTimeout(() => {
    console.error('[TripSage] ⏱ Forced shutdown after 5s timeout.');
    process.exit(1);
  }, 5000);
}
process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

module.exports = { app, server, io }

