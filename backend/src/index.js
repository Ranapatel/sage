require('dotenv').config()

process.on('uncaughtException', (err) => {
  console.error('[TripSage] 💥 Uncaught Exception:', err)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('[TripSage] 💥 Unhandled Rejection at:', promise, 'reason:', reason)
})

// Increase default EventEmitter limit (prevents TLSSocket warning from concurrent axios requests)
require('events').EventEmitter.defaultMaxListeners = 30

const express = require('express')
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')

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
app.use(morgan('dev'))

// Request logger (verbose in dev, minimal in production)
app.use((req, res, next) => {
  if (process.env.NODE_ENV !== 'production') {
    console.log(`[DEBUG] ${req.method} ${req.url}`);
  }
  next();
});

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 min
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/', limiter)

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

app.use('/api/auth', authRouter)
app.use('/api/search', searchRouter)
app.use('/api/itinerary', itineraryRouter)
app.use('/api/weather', weatherRouter)
app.use('/api/booking', bookingRouter)
app.use('/api/explore', exploreRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/profile', profileRouter)
app.use('/api/places', placesRouter)

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

// 404 handler — includes path so remote logs show exactly what's missing
app.use((req, res) => {
  console.warn(`[TripSage] 404 — ${req.method} ${req.originalUrl}`)
  res.status(404).json({
    success: false,
    error: 'Route not found',
    attempted: `${req.method} ${req.originalUrl}`,
    hint: 'Check /health for available routes'
  })
})

// Error handler - NEVER expose stack traces
app.use((err, req, res, next) => {
  console.error('[TripSage Error]', err.message)
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  })
})

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
    if (port !== parseInt(process.env.PORT || '5000', 10)) {
      console.warn(`[TripSage] ⚠️  Original port was busy — using port ${port} instead. Update PORT in .env if needed.`);
    }
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[TripSage] ⚠️  Port ${port} is in use. Trying port ${port + 1}...`);
      server.removeAllListeners('error');
      server.close();
      startServer(port + 1);
    } else {
      console.error('[TripSage] 💥 Server error:', err.message);
      process.exit(1);
    }
  });
}

startServer(PORT);

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

