/**
 * TripSage — Structured JSON Logger Middleware
 * - All errors and warnings are JSON with timestamp
 * - Slow API calls (>3s) are flagged with [SLOW]
 * - Never crashes the server
 */

'use strict'

const LOG_LEVELS = { error: 0, warn: 1, info: 2, debug: 3 }
const ENV_LEVEL = LOG_LEVELS[process.env.LOG_LEVEL] ?? (process.env.NODE_ENV === 'production' ? 1 : 2)

function log(level, message, meta = {}) {
  if (LOG_LEVELS[level] > ENV_LEVEL) return
  const entry = {
    ts: new Date().toISOString(),
    level: level.toUpperCase(),
    msg: message,
    ...meta,
  }
  const line = JSON.stringify(entry)
  if (level === 'error') return process.stderr.write(line + '\n')
  process.stdout.write(line + '\n')
}

const logger = {
  info:  (msg, meta) => log('info',  msg, meta),
  warn:  (msg, meta) => log('warn',  msg, meta),
  error: (msg, meta) => log('error', msg, meta),
  debug: (msg, meta) => log('debug', msg, meta),
}

/** Express request logger with slow-API detection */
function requestLogger(req, res, next) {
  const start = Date.now()
  res.on('finish', () => {
    const ms = Date.now() - start
    const entry = {
      method: req.method,
      path: req.path,
      status: res.statusCode,
      ms,
      ip: req.ip,
    }
    if (ms > 3000) {
      logger.warn(`[SLOW] ${req.method} ${req.path} took ${ms}ms`, entry)
    } else {
      logger.info(`${req.method} ${req.path} ${res.statusCode} ${ms}ms`, entry)
    }
  })
  next()
}

module.exports = { logger, requestLogger }
