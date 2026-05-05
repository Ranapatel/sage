/**
 * TripSage — Global Error Handler Middleware
 * - Catches all Express errors including async unhandled ones
 * - Never exposes stack traces in production
 * - Always returns structured JSON
 */

'use strict'

const { logger } = require('./logger')

/** Global 404 handler */
function notFoundHandler(req, res) {
  logger.warn('404 Not Found', { method: req.method, path: req.originalUrl, ip: req.ip })
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: `${req.method} ${req.originalUrl}`,
    hint: 'GET /health for available routes',
  })
}

/** Global error handler — must have 4 args so Express treats it as error middleware */
function globalErrorHandler(err, req, res, next) { // eslint-disable-line no-unused-vars
  const status = err.status || err.statusCode || 500
  const isProd = process.env.NODE_ENV === 'production'

  logger.error('Unhandled error', {
    status,
    msg: err.message,
    path: req?.originalUrl,
    stack: isProd ? undefined : err.stack,
  })

  // CORS error
  if (err.message?.startsWith('CORS:')) {
    return res.status(403).json({ success: false, message: 'CORS policy violation' })
  }

  // Rate-limit error (express-rate-limit passes its own JSON via message object)
  if (err.type === 'entity.too.large') {
    return res.status(413).json({ success: false, message: 'Request body too large' })
  }

  return res.status(status).json({
    success: false,
    message: isProd ? 'Temporary service issue, please try again' : err.message,
    ...(isProd ? {} : { stack: err.stack }),
  })
}

module.exports = { notFoundHandler, globalErrorHandler }
