/**
 * TripSage — Rate Limiting Configuration
 * - General API limiter: 100 req / 15 min per IP
 * - Strict limiter for expensive AI endpoints: 10 req / 15 min
 * - Search limiter: 30 req / 15 min
 * - City autocomplete: 200 req / 15 min (light endpoint)
 */

'use strict'

const rateLimit = require('express-rate-limit')
const { logger } = require('./logger')

function onLimitReached(req) {
  logger.warn('Rate limit exceeded', {
    ip: req.ip,
    path: req.originalUrl,
    method: req.method,
  })
}

/** General API limiter */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/health',   // don't rate-limit health checks
  handler: (req, res) => {
    onLimitReached(req)
    res.status(429).json({
      success: false,
      message: 'Too many requests — please wait 15 minutes and try again',
      retryAfter: Math.ceil(15 * 60),
    })
  },
})

/** Strict limiter for AI/heavy processing endpoints */
const aiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    onLimitReached(req)
    res.status(429).json({
      success: false,
      message: 'AI endpoint rate limit reached — please wait before generating more trips',
      retryAfter: Math.ceil(15 * 60),
    })
  },
})

/** Search route limiter */
const searchLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    onLimitReached(req)
    res.status(429).json({
      success: false,
      message: 'Search rate limit reached — please wait a moment',
      retryAfter: Math.ceil(15 * 60),
    })
  },
})

/** City autocomplete — lighter limit since it's frequent */
const cityLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    onLimitReached(req)
    res.status(429).json({
      success: false,
      message: 'City search rate limit reached',
      retryAfter: Math.ceil(15 * 60),
    })
  },
})

/** In-memory socket rate limiter (per socket ID, per event) */
const socketEventCounts = new Map()
const SOCKET_WINDOW_MS = 60 * 1000 // 1 minute window

function socketRateLimiter(socketId, event, maxPerWindow = 5) {
  const key = `${socketId}:${event}`
  const now = Date.now()
  const entry = socketEventCounts.get(key) || { count: 0, resetAt: now + SOCKET_WINDOW_MS }

  if (now > entry.resetAt) {
    entry.count = 0
    entry.resetAt = now + SOCKET_WINDOW_MS
  }

  entry.count++
  socketEventCounts.set(key, entry)

  // Periodically prune old entries to avoid memory leak
  if (socketEventCounts.size > 10000) {
    for (const [k, v] of socketEventCounts.entries()) {
      if (now > v.resetAt) socketEventCounts.delete(k)
    }
  }

  return entry.count <= maxPerWindow
}

module.exports = { apiLimiter, aiLimiter, searchLimiter, cityLimiter, socketRateLimiter }
