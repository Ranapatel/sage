require('dotenv').config()

// ── Production environment guards ─────────────────────────────────────────────
// Refuse to start in production without critical secrets. Auth bypasses
// discovered in the Phase-0 audit (NODE_ENV=development fallbacks) cannot
// be exercised in production if the server refuses to boot.
if (process.env.NODE_ENV === 'production') {
  const PROD_REQUIRED = ['CLERK_SECRET_KEY', 'DATABASE_URL']
  const missing = PROD_REQUIRED.filter((k) => !process.env[k])
  if (missing.length > 0) {
    console.error(
      `[TripSage] ❌ Refusing to start in production: missing required env vars: ${missing.join(', ')}`
    )
    process.exit(1)
  }
}

process.on('uncaughtException', (err) => {
  console.error('[TripSage] 💥 Uncaught Exception:', err.message)
})

process.on('unhandledRejection', (reason) => {
  console.error('[TripSage] 💥 Unhandled Rejection:', reason?.message || reason)
})

// Increase default EventEmitter limit (prevents TLSSocket warning from concurrent axios requests)
require('events').EventEmitter.defaultMaxListeners = 30

const express       = require('express')
const { getCredentialStatus } = require('./middleware/hotelbedsSignature')
const http          = require('http')
const { Server }    = require('socket.io')
const cors          = require('cors')
const helmet        = require('helmet')
const compression   = require('compression')
const morgan        = require('morgan')
const rateLimit     = require('express-rate-limit')

// ── Validate required env vars ────────────────────────────────────────────────
const REQUIRED_ENV = ['GROQ_API_KEY', 'DB_URL', 'RAPIDAPI_KEY', 'GEOAPIFY_API_KEY']
const missing = REQUIRED_ENV.filter(k => !process.env[k])
if (missing.length > 0) {
  console.warn(`[TripSage] ⚠️  Missing env vars: ${missing.join(', ')} — running in DEMO mode`)
}

// ── App & CORS ────────────────────────────────────────────────────────────────
const app = express()

const allowedOrigin = (origin, callback) => {
  if (!origin) return callback(null, true) // curl / Postman / server-side
  if (process.env.NODE_ENV !== 'production') return callback(null, true) // allow all in dev

  const allowed = [
    'http://localhost:3000',
    'http://localhost:3001',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:3001',
    'http://localhost:5000',
    'http://localhost:5001',
    'https://tripsage.in',
    'https://www.tripsage.in',
  ]
  if (process.env.CORS_ORIGIN) allowed.push(process.env.CORS_ORIGIN)

  if (allowed.some(a => origin.startsWith(a))) return callback(null, true)

  // Reject disallowed origins in production
  return callback(new Error('Not allowed by CORS'), false)
}

// ── Middleware ─────────────────────────────────────────────────────────────────
// crossOriginResourcePolicy MUST be "cross-origin": frontend (e.g. :3000) and
// API (:5000) are different origins. Helmet's default "same-origin" CORP causes
// browsers to block the response body → Axios "Network Error" on every API call.
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}))
app.use(compression())
app.use(cors({ origin: allowedOrigin, credentials: true }))
app.use('/api/payments/webhook', express.raw({ type: 'application/json', limit: '10kb' }))
app.use(express.json({
  limit: '5mb',
  verify: (req, res, buf) => {
    req.rawBody = buf.toString();
  }
}))
app.use(express.urlencoded({ limit: '5mb', extended: true }))
app.use(morgan('dev'))

// Rate limiting
const isDev = process.env.NODE_ENV !== 'production'
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: isDev ? 5000 : 1000, // 5000 requests per 15 min in dev, 1000 in prod
  message: { error: 'Too many requests, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
})
app.use('/api/', limiter)

// ── Routes ─────────────────────────────────────────────────────────────────────

app.use('/api/search',        require('./routes/search'))
app.use('/api/itinerary',     require('./routes/itinerary'))
app.use('/api/weather',       require('./routes/weather'))
app.use('/api/booking',       require('./routes/booking'))
app.use('/api/explore',       require('./routes/explore'))
app.use('/api/notifications', require('./routes/notifications'))
// Webhook & TS API Routes
app.use('/api/webhooks/clerk', require('./webhooks/clerk.webhook').handleClerkWebhook)
app.use('/api/users',         require('./routes/users').default)
app.use('/api/trips',         require('./routes/trips').default)

try {
  app.use('/api/profile',       require('./modules/profile/profile.routes').default || require('./routes/profile'))
} catch (e) {
  app.use('/api/profile',       require('./routes/profile'))
}
app.use('/api/places',        require('./routes/places'))
app.use('/api/places',        require('./routes/placesIntegration').default)
app.use('/api/reviews',       require('./routes/reviews'))
app.use('/api/hotels',        require('./routes/hotels'))
app.use('/api/transport',     require('./routes/transport'))
app.use('/api/train',         require('./routes/train'))
app.use('/api/bus',           require('./routes/bus'))

// Travelport Flights Integration (Phase 1)
app.use('/api/travelport/flights', require('./modules/travelport').default)

// Payments route removed (was only used for Activities booking)

// Geocoding
app.use('/api/location',      require('./routes/location.routes').default)

// Travel Photos (Phase 1 — Photo Upload System)
app.use('/api/photos',        require('./modules/photos/photo.routes').default)

// Transport Intelligence Module (Multi-Modal Journey Planning)
app.use('/api/transport-intelligence', require('./modules/transport-intelligence/transportIntelligence.routes').default)

// Contextual Travel Intelligence (8-Phase Engine)
app.use('/api/intelligence',  require('./routes/contextualIntelligence.routes').default)

// Smart Budget Intelligence (5-Phase Engine)
app.use('/api/budget',        require('./routes/smartBudget.routes').default)

// Smart Itinerary Intelligence (8-Phase Engine)
app.use('/api/itinerary-intelligence', require('./routes/smartItinerary.routes').default)

// Contextual Intelligence Layer (central brain — every feature consumes it)
app.use('/api/context',               require('./context/routes/context.routes').default)

// Multi-Source Image Service (Centralized Google Places, Pexels & Unsplash Orchestrator)
app.use('/api/images',        require('./routes/image.routes').default)
app.use('/api/v1/images',     require('./routes/image.routes').default)

// Health check
app.get('/health', async (req, res) => {
  const checkPortStatus = (port) => new Promise((resolve) => {
    const socket = new (require('net').Socket)()
    socket.setTimeout(800)
    socket.once('connect', () => { socket.destroy(); resolve('healthy'); })
    socket.once('timeout', () => { socket.destroy(); resolve('timeout'); })
    socket.once('error', () => { socket.destroy(); resolve('unreachable'); })
    socket.connect(port, '127.0.0.1')
  })

  let transportStatus = nestServiceStatus
  if (process.env.SPAWN_NEST !== 'false') {
    const portProbe = await checkPortStatus(4001)
    if (portProbe === 'healthy') {
      transportStatus = 'healthy'
    } else {
      // Fall back to process state if port is blocked
      transportStatus = nestServiceStatus === 'starting' ? 'starting' : 'unhealthy'
    }
  }

  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    env: process.env.NODE_ENV || 'development',
    port: activePort,
    services: {
      groq:       !!process.env.GROQ_API_KEY,
      redis:      !!process.env.UPSTASH_REDIS_REST_URL,
      db:         !!process.env.DB_URL,
      rapidapi:   !!process.env.RAPIDAPI_KEY,
      hotelbeds:  getCredentialStatus(),
      razorpay:   !!process.env.RAZORPAY_KEY_ID,
      geoapify:   !!process.env.GEOAPIFY_API_KEY,
      transportMicroservice: transportStatus,
    },
  })
})

app.get('/', (req, res) => {
  res.json({ success: true, message: 'TripSage API v2.0', hint: 'Visit /health for system status.' })
})

app.get('/ping', (req, res) => {
  res.status(200).json({ status: 'ok' })
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

// ── DB + Seed + Prisma Validation ─────────────────────────────────────────────
const connectDB  = require('./config/database')
const seedDemo   = require('./services/seedService')
const { validatePrismaClient } = require('./prisma/prisma.client')

connectDB()
  .then(() => seedDemo())
  .catch(err => {
    console.warn('[TripSage] DB connection skipped:', err.message)
    seedDemo() // in-memory fallback
  })

validatePrismaClient().catch(err => {
  console.warn('[TripSage] Prisma validation warning:', err.message)
})

// ── Redis ──────────────────────────────────────────────────────────────────────
const { connectRedis } = require('./config/redis')
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

  // Phase 7 wiring — let the notification engine broadcast via this io instance.
  try {
    const { setSocketIO } = require('./utils/socketEmitter')
    setSocketIO(io)
  } catch (err) {
    console.warn('[TripSage] ⚠️ Could not register SocketIO with notification engine:', err.message)
  }

  server.listen(port, '0.0.0.0')

  server.once('listening', () => {
    activePort = port
    httpServer = server
    ioServer   = io
    console.log(`[TripSage] 🚀 Server running on port ${port}`)
    
    // Start background price watcher
    try {
      const { startPriceWatcher } = require('./workers/priceWatcher')
      startPriceWatcher()
    } catch (err) {
      console.warn('[TripSage] ⚠️ Could not start Price Watcher:', err.message)
    }

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

// ── NestJS Transport Microservice Spawner ─────────────────────────────────────
const { spawn } = require('child_process');
const path = require('path');
let nestProcess = null;
let nestServiceStatus = process.env.SPAWN_NEST === 'false' ? 'disabled' : 'starting';

function startNestService() {
  if (process.env.SPAWN_NEST === 'false') {
    console.log('[TripSage] ℹ️ NestJS transport microservice spawn skipped (disabled via SPAWN_NEST=false).');
    return;
  }
  const isProd = process.env.NODE_ENV === 'production';
  console.log(`[TripSage] 🚀 Starting NestJS transport microservice (${isProd ? 'production' : 'development'})...`);

  const isWindows = process.platform === 'win32';
  const cmd = 'npm';
  const args = isProd ? ['run', 'start:prod'] : ['run', 'start:dev'];
  const childEnv = { ...process.env, PORT: '4001' };

  nestProcess = spawn(cmd, args, {
    cwd: path.join(__dirname, '../transport'),
    shell: isWindows,
    stdio: 'inherit',
    env: childEnv,
  });

  nestProcess.on('error', (err) => {
    nestServiceStatus = 'failed_to_start';
    console.error('[TripSage] 💥 Failed to start NestJS transport service:', err.message);
  });

  nestProcess.on('exit', (code, signal) => {
    nestServiceStatus = code === 0 ? 'stopped' : 'crashed';
    console.warn(`[TripSage] ⚠️  NestJS transport microservice exited with code: ${code}, signal: ${signal}`);
  });
}

startNestService();

createAndListen(activePort)


// ── Graceful shutdown ──────────────────────────────────────────────────────────
function shutdown(signal) {
  console.log(`\n[TripSage] ${signal} received — shutting down gracefully...`)
  if (nestProcess) {
    console.log('[TripSage] 🛑 Stopping NestJS transport service...');
    nestProcess.kill('SIGINT');
  }
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

function getSocketIO() {
  return ioServer
}

module.exports = { app, getSocketIO }
