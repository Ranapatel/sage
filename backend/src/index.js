require('dotenv').config()

process.on('uncaughtException', (err) => {
  console.error('[TripSage] 💥 Uncaught Exception:', err.message)
})

process.on('unhandledRejection', (reason) => {
  console.error('[TripSage] 💥 Unhandled Rejection:', reason?.message || reason)
})

// Increase default EventEmitter limit (prevents TLSSocket warning from concurrent axios requests)
require('events').EventEmitter.defaultMaxListeners = 30

const express     = require('express')
const http        = require('http')
const { Server }  = require('socket.io')
const cors        = require('cors')
const helmet      = require('helmet')
const compression = require('compression')
const morgan      = require('morgan')
const rateLimit   = require('express-rate-limit')

// ── Validate required env vars ────────────────────────────────────────────────
const REQUIRED_ENV = ['GROQ_API_KEY', 'DB_URL', 'RAPIDAPI_KEY']
const missing = REQUIRED_ENV.filter(k => !process.env[k])
if (missing.length > 0) {
  console.warn(`[TripSage] ⚠️  Missing env vars: ${missing.join(', ')} — running in DEMO mode`)
}

// ── App & CORS ────────────────────────────────────────────────────────────────
const app = express()

const allowedOrigin = (origin, callback) => {
  if (!origin) return callback(null, true) // curl / Postman
  if (origin.startsWith('http://localhost') || origin.startsWith('http://127.0.0.1')) return callback(null, true)
  if (origin === 'https://tripsage.in' || origin === 'https://www.tripsage.in') return callback(null, true)
  if (process.env.CORS_ORIGIN === '*') return callback(null, true)
  if (process.env.CORS_ORIGIN && origin === process.env.CORS_ORIGIN) return callback(null, true)
  if (process.env.NODE_ENV !== 'production' && origin.startsWith('https://')) return callback(null, true)
  if (origin.endsWith('.vercel.app') || origin.endsWith('.onrender.com') ||
      origin.endsWith('.railway.app') || origin.endsWith('.netlify.app')) return callback(null, true)
  callback(new Error(`CORS: origin '${origin}' not allowed`))
}

// ── Middleware ─────────────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false }))
app.use(compression())
app.use(cors({ origin: allowedOrigin, credentials: true }))
app.use(express.json({ limit: '10kb' }))
app.use(morgan('dev'))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/', limiter)

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api/auth',          require('./routes/auth'))
app.use('/api/search',        require('./routes/search'))
app.use('/api/itinerary',     require('./routes/itinerary'))
app.use('/api/weather',       require('./routes/weather'))
app.use('/api/booking',       require('./routes/booking'))
app.use('/api/explore',       require('./routes/explore'))
app.use('/api/notifications', require('./routes/notifications'))
app.use('/api/profile',       require('./routes/profile'))
app.use('/api/places',        require('./routes/places'))

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    env: process.env.NODE_ENV || 'development',
    port: activePort,
    services: {
      groq:     !!process.env.GROQ_API_KEY,
      redis:    !!process.env.UPSTASH_REDIS_REST_URL,
      db:       !!process.env.DB_URL,
      rapidapi: !!process.env.RAPIDAPI_KEY,
    },
  })
})

app.get('/', (req, res) => {
  res.json({ success: true, message: 'TripSage API v2.0', hint: 'Visit /health for system status.' })
})

// 404
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Route not found', attempted: `${req.method} ${req.originalUrl}` })
})

// Error handler
app.use((err, req, res, _next) => {
  console.error('[TripSage Error]', err.message)
  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
  })
})

// ── DB + Seed ──────────────────────────────────────────────────────────────────
const connectDB  = require('../config/database')
const seedDemo   = require('./services/seedService')
connectDB()
  .then(() => seedDemo())
  .catch(err => {
    console.warn('[TripSage] DB connection skipped:', err.message)
    seedDemo() // in-memory fallback
  })

// ── Redis ──────────────────────────────────────────────────────────────────────
const { connectRedis } = require('../config/redis')
connectRedis().catch(err =>
  console.warn('[TripSage] Redis skipped:', err?.message || 'unavailable')
)

// ── Server startup — creates a FRESH server per attempt to avoid dual-listen ──
let activePort = parseInt(process.env.PORT || '4000', 10)
let httpServer  = null
let ioServer    = null

function createAndListen(port) {
  // Create fresh http.Server and Socket.IO instance on each attempt
  const server = http.createServer(app)
  const io = new Server(server, {
    cors: { origin: allowedOrigin, methods: ['GET', 'POST'], credentials: true },
    transports: ['websocket', 'polling'],
  })

  // Socket.IO setup
  require('./services/socketService')(io)

  server.listen(port)

  server.once('listening', () => {
    activePort = port
    httpServer = server
    ioServer   = io
    console.log(`[TripSage] 🚀 Server running on port ${port}`)
    if (port !== parseInt(process.env.PORT || '4000', 10)) {
      console.warn(`[TripSage] ⚠️  Original port was busy — using ${port}. Update PORT in .env if needed.`)
    }
  })

  server.once('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`[TripSage] ⚠️  Port ${port} in use, trying ${port + 1}...`)
      // Close this failed server completely before trying next port
      server.close(() => createAndListen(port + 1))
    } else {
      console.error('[TripSage] 💥 Fatal server error:', err.message)
      process.exit(1)
    }
  })
}

createAndListen(activePort)

// ── Graceful shutdown ──────────────────────────────────────────────────────────
function shutdown(signal) {
  console.log(`\n[TripSage] ${signal} received — shutting down gracefully...`)
  if (ioServer) ioServer.close()
  if (httpServer) {
    httpServer.close(() => {
      console.log('[TripSage] ✅ HTTP server closed.')
      process.exit(0)
    })
    setTimeout(() => {
      console.error('[TripSage] ⏱ Forced shutdown after 5s.')
      process.exit(1)
    }, 5000)
  } else {
    process.exit(0)
  }
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT',  () => shutdown('SIGINT'))

module.exports = { app }
