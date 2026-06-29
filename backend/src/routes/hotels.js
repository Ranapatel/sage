/**
 * TripSage — Hotels API Route
 *
 * Endpoints:
 *   POST /api/hotels/recommend        — Ranked recommendations
 *   POST /api/hotels/checkrate        — CheckRate API (BOOKABLE/RECHECK validation)
 *   GET  /api/hotels/content/:code    — Hotel Content API (images, facilities)
 *   GET  /api/hotels/content          — Batch hotel content (?codes=1234,5678)
 *
 * All prices, images, and ratings come exclusively from the Hotelbeds API.
 */

const express = require('express')
const router  = express.Router()
const { body, param, query, validationResult } = require('express-validator')
const { recommendHotels }              = require('../services/hotelRecommendationService')
const { checkRate, getHotelContent }                    = require('../services/hotelbedsService')
const { getHotelContentDetails }       = require('../services/contentCacheService')

// ─── POST /api/hotels/recommend ───────────────────────────────────────────────
const recommendValidation = [
  body('destination').trim().notEmpty().withMessage('destination is required').isLength({ max: 120 }),
  body('checkin').notEmpty().isISO8601().withMessage('checkin must be YYYY-MM-DD'),
  body('checkout').notEmpty().isISO8601().withMessage('checkout must be YYYY-MM-DD'),
  body('members').optional({ checkFalsy: true }).isInt({ min: 1, max: 20 }).toInt(),
  body('budget').optional({ checkFalsy: true }).isFloat({ min: 0, max: 100000000 }).toFloat(),
]

router.post('/recommend', recommendValidation, async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: 'Invalid request parameters', details: errors.array().map(e => ({ field: e.path, message: e.msg })) })
  }
  const { destination, checkin, checkout, members = 2, budget, rooms = 1, adults = 2, children = 0 } = req.body
  if (new Date(checkout) <= new Date(checkin)) {
    return res.status(400).json({ success: false, error: 'checkout date must be after checkin date' })
  }
  try {
    const result = await recommendHotels({ destination, checkin, checkout, members, budget, rooms, adults, children })
    return res.json(result)
  } catch (err) {
    console.error('[Hotels Route] recommendHotels failed:', err.message)
    return res.status(500).json({ success: false, error: 'Hotel recommendation service temporarily unavailable', detail: process.env.NODE_ENV !== 'production' ? err.message : undefined })
  }
})

// ─── POST /api/hotels/checkrate ───────────────────────────────────────────────
/**
 * Validates a rate key before booking (Hotelbeds CheckRate API).
 * Required for rateType=RECHECK rates per Hotelbeds certification requirements.
 *
 * Body:   { rateKey: string, originalPrice?: number }
 * Returns: { rateType, netInr, priceChanged, priceDiff, cancellationPolicies }
 */
router.post('/checkrate', [
  body('rateKey').trim().notEmpty().withMessage('rateKey is required').isLength({ max: 500 }),
  body('originalPrice').optional().isFloat({ min: 0 }).toFloat(),
  body('rateType').optional().trim(),
  body('hotelCode').optional().trim(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: 'Invalid request', details: errors.array() })
  }

  const { rateKey, originalPrice, rateType, hotelCode } = req.body

  try {
    const result = await checkRate(rateKey, rateType, hotelCode, originalPrice)

    // Detect price change vs what user saw at search time
    let priceChanged = false
    let priceDiff    = 0
    if (originalPrice && originalPrice > 0 && result.netInr > 0) {
      priceDiff    = Math.round(((result.netInr - originalPrice) / originalPrice) * 100)
      priceChanged = Math.abs(priceDiff) > 2  // >2% considered significant
    }

    return res.json({
      success:              true,
      rateType:             result.rateType,
      rateKey:              result.rateKey,
      netInr:               result.netInr,
      net:                  result.net,
      currency:             result.currency,
      boardCode:            result.boardCode,
      boardName:            result.boardName,
      cancellationPolicies: result.cancellationPolicies,
      rateComments:         result.rateComments,
      priceChanged,
      priceDiff,
    })
  } catch (err) {
    console.error('[Hotels/CheckRate]', err.message)
    // Differentiate: room unavailable vs transient error
    if (err.message?.includes('unavailable') || err.message?.includes('expired')) {
      return res.status(409).json({ success: false, error: 'ROOM_UNAVAILABLE', message: 'This room is no longer available. Please select another.' })
    }
    return res.status(503).json({ success: false, error: 'CHECKRATE_FAILED', message: err.message || 'Rate validation service unavailable. Please try again.' })
  }
})

// ─── GET /api/hotels/content/:code ────────────────────────────────────────────
/**
 * Returns hotel content from the Hotelbeds Content API.
 * Includes CDN images (http://photos.hotelbeds.com/giata/...), facilities, description.
 */
router.get('/content/:code', [
  param('code').trim().notEmpty(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ success: false, error: 'Invalid hotel code' })

  try {
    const hotel = await getHotelContentDetails(req.params.code)
    return res.json({ success: true, data: hotel })
  } catch (err) {
    console.error('[Hotels/Content]', err.message)
    return res.status(503).json({ success: false, data: null, error: 'Content service unavailable' })
  }
})

// ─── GET /api/hotels/content?codes=1234,5678 ─────────────────────────────────
/**
 * Batch hotel content fetch for multiple hotel codes.
 */
router.get('/content', [
  query('codes').trim().notEmpty().withMessage('codes query param required'),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ success: false, error: 'codes param required' })

  const codes = (req.query.codes || '').split(',').map(c => c.trim()).filter(Boolean).slice(0, 20)
  try {
    const result = await getHotelContent(codes)
    return res.json({ success: true, data: result.data })
  } catch (err) {
    console.error('[Hotels/Content Batch]', err.message)
    return res.status(503).json({ success: false, data: [], error: 'Content service unavailable' })
  }
})

module.exports = router
