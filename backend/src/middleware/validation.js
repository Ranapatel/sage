/**
 * TripSage — Input Validation & Sanitization Middleware
 * - Validates and sanitizes all common trip search inputs
 * - Prevents injection attacks and malformed data
 * - Returns structured error responses
 */

'use strict'

const { body, param, query, validationResult } = require('express-validator')

/** Strip HTML/script tags from a string */
function sanitizeString(str) {
  if (typeof str !== 'string') return ''
  return str
    .replace(/<[^>]*>/g, '')      // strip HTML tags
    .replace(/['"`;\\]/g, '')     // strip common injection chars
    .trim()
    .slice(0, 200)                // hard cap
}

/** Common trip search field validators */
const tripSearchValidation = [
  body('from')
    .trim().notEmpty().withMessage('Origin city is required')
    .isLength({ max: 150 }).withMessage('Origin too long')
    .escape(),
  body('to')
    .trim().notEmpty().withMessage('Destination city is required')
    .isLength({ max: 150 }).withMessage('Destination too long')
    .escape(),
  body('startDate')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('startDate must be YYYY-MM-DD'),
  body('endDate')
    .optional({ checkFalsy: true })
    .isISO8601().withMessage('endDate must be YYYY-MM-DD'),
  body('budget')
    .optional({ checkFalsy: true })
    .isFloat({ min: 0, max: 10000000 }).toFloat()
    .withMessage('budget must be a positive number'),
  body('travelers')
    .optional({ checkFalsy: true })
    .isInt({ min: 1, max: 30 }).toInt()
    .withMessage('travelers must be between 1 and 30'),
  body('style')
    .optional({ checkFalsy: true })
    .trim().isLength({ max: 50 }).escape(),
]

/** Validate city query param */
const cityQueryValidation = [
  query('q')
    .trim().notEmpty().withMessage('Query is required')
    .isLength({ max: 150 }).withMessage('Query too long')
    .escape(),
]

/** Destination path param */
const destinationParamValidation = [
  param('destination')
    .trim().notEmpty().withMessage('Destination is required')
    .isLength({ max: 150 }).withMessage('Destination too long')
    .escape(),
]

/** Middleware to handle validation errors */
function handleValidationErrors(req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Invalid input',
      errors: errors.array().map(e => ({ field: e.path, msg: e.msg })),
    })
  }
  // Sanitize body strings as a secondary pass
  if (req.body && typeof req.body === 'object') {
    for (const key of Object.keys(req.body)) {
      if (typeof req.body[key] === 'string') {
        req.body[key] = sanitizeString(req.body[key])
      }
    }
  }
  next()
}

/** Sanitize socket event data (no express-validator available for sockets) */
function sanitizeSocketData(data) {
  if (!data || typeof data !== 'object') return {}
  const clean = {}
  for (const [k, v] of Object.entries(data)) {
    if (typeof v === 'string') {
      clean[k] = sanitizeString(v)
    } else if (typeof v === 'number') {
      clean[k] = isFinite(v) ? v : 0
    } else if (typeof v === 'boolean') {
      clean[k] = v
    } else if (Array.isArray(v)) {
      // Preserve arrays of primitives (e.g. preferences: ['adventure', 'cultural'])
      clean[k] = v.slice(0, 50).map(item =>
        typeof item === 'string' ? sanitizeString(item) :
        typeof item === 'number' ? item : String(item)
      )
    } else if (v === null || v === undefined) {
      clean[k] = v
    } else {
      // Objects pass through
      clean[k] = v
    }
  }
  return clean
}

module.exports = {
  tripSearchValidation,
  cityQueryValidation,
  destinationParamValidation,
  handleValidationErrors,
  sanitizeSocketData,
}
