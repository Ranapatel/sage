/**
 * TripSage — Booking API Route
 *
 * Endpoints:
 *   POST /api/booking/init          — Create flight or hotel booking
 *   POST /api/booking/:id/confirm   — Confirm a pending booking
 *   GET  /api/booking/:id           — Get booking by ID
 *   GET  /api/booking/:id/voucher   — Get voucher data for a confirmed booking
 *
 * Hotel booking implements the full Hotelbeds certification flow:
 *   1. Accepts lead guest + additional guests (pax data)
 *   2. Applies CheckRate gate for RECHECK rates before submitting to Booking API
 *   3. Stores complete booking record (hotelCode, roomType, boardType, guests, etc.)
 */

const express = require('express')
const router  = express.Router()
const { body, param, validationResult } = require('express-validator')
const { v4: uuidv4 } = require('uuid')
const hotelbedsService = require('../services/hotelbedsService')
const { generateVoucherData } = require('../services/voucherService')

// In-memory booking store (replace with MongoDB in production)
const bookings = new Map()

// ─── POST /api/booking/init ───────────────────────────────────────────────────
/**
 * Creates a new booking.
 *
 * For hotels, accepts full guest data per Hotelbeds certification:
 * {
 *   type: 'hotel',
 *   itemId: 'hbd_12345',
 *   userDetails: {
 *     rateKey: '...',
 *     name: 'John Doe',
 *     email: 'john@example.com',
 *     phone: '+91-9876543210',
 *     hotelName: '...',
 *     checkIn: '2026-07-15',
 *     checkOut: '2026-07-18',
 *     roomType: '...',
 *     boardType: '...',
 *     totalPrice: 4500
 *   },
 *   holder: { firstName: 'John', lastName: 'Doe' },
 *   guests: [{ firstName: 'Jane', lastName: 'Doe' }],
 *   contact: { email: 'john@example.com', phone: '+91-9876543210' }
 * }
 */
router.post('/init', [
  body('type').isIn(['flight', 'hotel']),
  body('itemId').trim().notEmpty().isLength({ max: 200 }),
  body('userDetails').isObject(),
  body('holder').optional().isObject(),
  body('guests').optional().isArray(),
  body('contact').optional().isObject(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: 'Invalid input', details: errors.array() })
  }

  const { type, itemId, userDetails, holder, guests = [], contact = {} } = req.body
  const bookingId = uuidv4()

  if (type === 'hotel') {
    // Perform strict schema validation on guest/holder/contact
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    const phoneRegex = /^\+?[\d\s\-().]{6,20}$/
    const nameRegex = /^[A-Za-z\s'-]{2,50}$/

    const isHolderValid = holder &&
      holder.firstName && nameRegex.test(holder.firstName.trim()) &&
      holder.lastName && nameRegex.test(holder.lastName.trim())

    const isContactValid = contact &&
      contact.email && emailRegex.test(contact.email.trim()) &&
      contact.phone && phoneRegex.test(contact.phone.trim())

    let areGuestsValid = true
    if (guests && Array.isArray(guests)) {
      for (const g of guests) {
        if (!g || !g.firstName || !nameRegex.test(g.firstName.trim()) || !g.lastName || !nameRegex.test(g.lastName.trim())) {
          areGuestsValid = false
          break
        }
      }
    }

    if (!isHolderValid || !isContactValid || !areGuestsValid) {
      return res.status(400).json({
        success: false,
        error: 'INVALID_GUEST_DATA',
        message: 'Invalid guest details. First and last names must contain only letters, and email/phone must be valid formats.'
      })
    }

    try {
      const rateKey = userDetails.rateKey || itemId

      // ── CheckRate gate for RECHECK rates ──────────────────────────────────
      // If the caller indicates the rate needs rechecking, validate before booking.
      if (userDetails.requireCheckRate) {
        console.log('[Booking] Running CheckRate gate for RECHECK rate...')
        try {
          const checkResult = await hotelbedsService.checkRate(rateKey)
          if (checkResult.rateType === 'RECHECK') {
            // Price may have changed — return updated pricing to the frontend
            const originalPrice = parseFloat(userDetails.totalPrice || 0)
            const newPrice      = checkResult.netInr || 0
            const priceDiff     = originalPrice > 0
              ? Math.round(((newPrice - originalPrice) / originalPrice) * 100)
              : 0

            if (Math.abs(priceDiff) > 2) {
              return res.status(402).json({
                success:     false,
                error:       'PRICE_CHANGED',
                message:     `Room price has changed by ${priceDiff > 0 ? '+' : ''}${priceDiff}%.`,
                oldPrice:    originalPrice,
                newPrice,
                priceDiff,
                rateKey:     checkResult.rateKey,
                cancellationPolicies: checkResult.cancellationPolicies,
              })
            }
          }
        } catch (crErr) {
          if (crErr.message?.includes('ROOM_UNAVAILABLE') || crErr.message?.includes('expired')) {
            return res.status(409).json({ success: false, error: 'ROOM_UNAVAILABLE', message: 'This room is no longer available. Please select another option.' })
          }
          // CheckRate transient failure — continue to booking (tolerance approach)
          console.warn('[Booking] CheckRate failed, proceeding with tolerance:', crErr.message)
        }
      }

      // ── Call Hotelbeds Booking API ─────────────────────────────────────────
      const result = await hotelbedsService.bookHotel({
        rateKey,
        holder: holder || { name: userDetails.name },
        guests,
        contact: {
          email:  contact.email  || userDetails.email  || '',
          phone:  contact.phone  || userDetails.phone  || '',
          remark: contact.remark || '',
        },
        userDetails,
      })

      if (!result.success) throw new Error('Hotelbeds booking execution failed')

      // Fetch hotel details from content API / cache to extract contact details
      let hotelEmail = ''
      let hotelWeb = ''
      let rateCommentsText = userDetails.rateComments || ''

      try {
        const { getHotelContentDetails, resolveRateComments } = require('../services/contentCacheService')
        const cachedHotel = await getHotelContentDetails(result.hotelCode || userDetails.hotelCode)
        if (cachedHotel) {
          hotelEmail = cachedHotel.email || ''
          hotelWeb = cachedHotel.web || ''
        }

        if (!rateCommentsText) {
          rateCommentsText = await resolveRateComments({
            rateCommentsId: '256|24524|3',
            hotelCode: result.hotelCode || userDetails.hotelCode,
            checkin: result.checkIn || userDetails.checkIn,
            stayTaxes: []
          })
        }
      } catch (cacheErr) {
        console.warn('[Booking Route] Could not retrieve hotel cache details:', cacheErr.message)
      }

      // ── Store complete booking record ──────────────────────────────────────
      const booking = {
        id:               bookingId,
        type,
        itemId,
        status:           result.status || 'CONFIRMED',
        bookingReference: result.bookingReference,
        clientReference:  result.clientReference,
        hotelCode:        result.hotelCode,
        hotelName:        result.hotelName,
        hotelAddress:     result.hotelAddress,
        hotelPhone:       result.hotelPhone,
        hotelEmail,
        hotelWeb,
        rateComments:     rateCommentsText,
        checkIn:          result.checkIn    || userDetails.checkIn,
        checkOut:         result.checkOut   || userDetails.checkOut,
        checkInTime:      result.checkInTime  || '14:00',
        checkOutTime:     result.checkOutTime || '12:00',
        roomType:         result.roomType,
        boardType:        result.boardType,
        amount:           result.totalPrice,
        totalPrice:       result.totalPrice,
        currency:         result.currency   || 'INR',
        originalCurrency: result.originalCurrency,
        originalTotalPrice: result.originalTotalPrice,
        bookingDate:      result.bookingDate || new Date().toISOString(),
        cancellationPolicies: result.cancellationPolicies || [],
        guests:           result.guests || [],
        contactEmail:     contact.email || userDetails.email || '',
        contactPhone:     contact.phone || userDetails.phone || '',
        createdAt:        new Date().toISOString(),
        userDetails:      {
          name:     userDetails.name  || '',
          email:    userDetails.email || '',
          checkIn:  userDetails.checkIn,
          checkOut: userDetails.checkOut,
        },
      }
      bookings.set(bookingId, booking)

      return res.json({
        success: true,
        data: {
          bookingId,
          status:           booking.status,
          bookingReference: booking.bookingReference,
          clientReference:  booking.clientReference,
          hotelName:        booking.hotelName,
          hotelAddress:     booking.hotelAddress,
          checkIn:          booking.checkIn,
          checkOut:         booking.checkOut,
          roomType:         booking.roomType,
          boardType:        booking.boardType,
          totalPrice:       booking.totalPrice,
          currency:         booking.currency,
          guests:           booking.guests,
          cancellationPolicies: booking.cancellationPolicies,
          bookingDate:      booking.bookingDate,
        },
        message: 'Hotel booked successfully via Hotelbeds!',
      })
    } catch (err) {
      console.error('[Booking Route] Hotel booking failed:', err.message)
      // Map error codes to user-friendly messages
      const errorMap = {
        'ROOM_UNAVAILABLE': 'This room is no longer available. Please select another option.',
        'PRICE_CHANGED':    'The room price has changed. Please review the updated price.',
      }
      const userMessage = errorMap[err.message] || err.message || 'Hotel booking failed. Please try again.'
      return res.status(500).json({ success: false, error: err.message, message: userMessage })
    }
  }

  if (type === 'flight') {
    return res.status(400).json({
      success: false,
      error: 'FLIGHT_SEARCH_UNAVAILABLE',
      message: 'Flight search is currently unavailable. Real-time flight booking will be available in a future update.'
    })
  }

  return res.status(400).json({
    success: false,
    error: 'INVALID_BOOKING_TYPE',
    message: 'Unsupported booking type.'
  })
})

// ─── POST /api/booking/:id/confirm ───────────────────────────────────────────
router.post('/:id/confirm', [
  param('id').isUUID(),
], async (req, res) => {
  const booking = bookings.get(req.params.id)
  if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' })
  booking.status     = 'CONFIRMED'
  booking.confirmedAt = new Date().toISOString()
  bookings.set(req.params.id, booking)
  res.json({ success: true, data: booking, message: 'Booking confirmed!' })
})

// ─── GET /api/booking/:id/voucher ─────────────────────────────────────────────
/**
 * Returns structured voucher data for a confirmed booking.
 * Includes all fields required by Hotelbeds voucher certification.
 */
router.get('/:id/voucher', [
  param('id').isUUID(),
], async (req, res) => {
  const booking = bookings.get(req.params.id)
  if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' })
  if (booking.type !== 'hotel') return res.status(400).json({ success: false, error: 'Voucher only available for hotel bookings' })

  const voucherData = generateVoucherData(booking)
  return res.json({ success: true, data: voucherData })
})

// ─── POST /api/booking/:id/cancel ─────────────────────────────────────────────
/**
 * Cancels a confirmed hotel booking.
 */
router.post('/:id/cancel', [
  param('id').isUUID(),
], async (req, res) => {
  const booking = bookings.get(req.params.id)
  if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' })
  if (booking.type !== 'hotel') return res.status(400).json({ success: false, error: 'Cancellation only available for hotel bookings' })
  if (booking.status === 'CANCELLED') return res.status(400).json({ success: false, error: 'Booking is already cancelled' })

  try {
    const cancelResult = await hotelbedsService.cancelBooking(booking.bookingReference)
    if (cancelResult.success) {
      booking.status = 'CANCELLED'
      booking.cancelledAt = new Date().toISOString()
      bookings.set(req.params.id, booking)
      return res.json({ success: true, message: 'Booking cancelled successfully', data: booking })
    } else {
      throw new Error('Hotelbeds cancellation rejected')
    }
  } catch (err) {
    console.error('[Booking Cancel Route] Failed:', err.message)
    return res.status(500).json({ success: false, error: err.message, message: 'Failed to cancel booking. Please contact support.' })
  }
})

// ─── GET /api/booking/:id ─────────────────────────────────────────────────────
router.get('/:id', [param('id').isUUID()], async (req, res) => {
  const booking = bookings.get(req.params.id)
  if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' })
  res.json({ success: true, data: booking })
})

module.exports = router
