const express = require('express')
const router = express.Router()
const { body, param, validationResult } = require('express-validator')
const { v4: uuidv4 } = require('uuid')

// In-memory booking store (use MongoDB in production)
const bookings = new Map()

// POST /api/booking/init
router.post('/init', [
  body('type').isIn(['flight', 'hotel']),
  body('itemId').trim().notEmpty().isLength({ max: 100 }),
  body('userDetails').isObject(),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: 'Invalid input' })
  }

  const { type, itemId, userDetails } = req.body
  const bookingId = uuidv4()

  const booking = {
    id: bookingId,
    type,
    itemId,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    userDetails: {
      name: userDetails.name || 'Guest',
      email: userDetails.email || '',
    },
  }

  bookings.set(bookingId, booking)

  // Simulate processing delay
  setTimeout(() => {
    const b = bookings.get(bookingId)
    if (b) { b.status = 'CONFIRMED'; bookings.set(bookingId, b) }
  }, 2000)

  res.json({
    success: true,
    data: { bookingId, status: 'PENDING' },
    message: 'Booking initiated. Redirecting to partner site...',
  })
})

// POST /api/booking/:id/confirm
router.post('/:id/confirm', [
  param('id').isUUID(),
], async (req, res) => {
  const booking = bookings.get(req.params.id)
  if (!booking) {
    return res.status(404).json({ success: false, error: 'Booking not found' })
  }
  booking.status = 'CONFIRMED'
  booking.confirmedAt = new Date().toISOString()
  bookings.set(req.params.id, booking)

  res.json({ success: true, data: booking, message: 'Booking confirmed!' })
})

// GET /api/booking/:id
router.get('/:id', [param('id').isUUID()], async (req, res) => {
  const booking = bookings.get(req.params.id)
  if (!booking) return res.status(404).json({ success: false, error: 'Booking not found' })
  res.json({ success: true, data: booking })
})

module.exports = router
