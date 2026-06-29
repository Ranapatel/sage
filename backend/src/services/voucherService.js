/**
 * TripSage — Voucher Service
 *
 * Generates structured voucher data from booking records.
 * Used by the voucher route and the frontend PDF/print generator.
 * Complies with Hotelbeds certification voucher requirements.
 */

/**
 * Formats cancellation policies from the Hotelbeds API into a human-readable string.
 * @param {object[]} policies - Array of { amount, from } from Hotelbeds API
 * @returns {string}
 */
function formatCancellationPolicies(policies) {
  if (!policies || policies.length === 0) {
    return 'Free cancellation up to 24 hours before check-in. No-show charges may apply.'
  }
  return policies.map(p => {
    const amount = parseFloat(p.amount || 0)
    const date   = p.from
      ? new Date(p.from).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
      : 'arrival'
    if (amount === 0) return `Free cancellation until ${date}.`
    const inr = Math.round(amount * 90)
    return `Cancellation after ${date}: ₹${inr.toLocaleString('en-IN')} charge applies.`
  }).join(' ')
}

/**
 * Generates a complete voucher data object from a stored booking record.
 * Maps all fields required by Hotelbeds certification.
 *
 * @param {object} booking - Booking record from the bookings Map
 * @returns {object} Voucher data object
 */
function generateVoucherData(booking) {
  const ud = booking.userDetails || {}

  return {
    bookingReference:  booking.bookingReference || 'N/A',
    clientReference:   booking.clientReference  || booking.id || 'N/A',
    status:            booking.status           || 'CONFIRMED',
    bookingDate:       booking.createdAt        || new Date().toISOString(),

    hotel: {
      code:         booking.hotelCode    || ud.hotelCode  || '',
      name:         booking.hotelName    || ud.hotelName  || 'Hotel',
      address:      booking.hotelAddress || ud.hotelAddress || '',
      phone:        booking.hotelPhone   || ud.hotelPhone   || '',
      email:        booking.hotelEmail   || '',
      web:          booking.hotelWeb     || '',
      city:         booking.hotelCity    || '',
      checkIn:      booking.checkIn      || ud.checkIn  || '',
      checkOut:     booking.checkOut     || ud.checkOut || '',
      checkInTime:  booking.checkInTime  || '14:00',
      checkOutTime: booking.checkOutTime || '12:00',
    },

    guests: booking.guests && booking.guests.length > 0
      ? booking.guests
      : [{ name: ud.name || 'Guest Traveler', type: 'AD', role: 'Lead' }],

    room: {
      type:      booking.roomType  || ud.roomType  || 'Standard Room',
      boardType: booking.boardType || ud.boardType || 'Room Only',
    },

    cancellationPolicy: formatCancellationPolicies(booking.cancellationPolicies),

    totalPaid: {
      amount:   booking.amount || booking.totalPrice || 0,
      currency: booking.currency || 'INR',
    },

    contact: {
      email: booking.contactEmail || ud.email || '',
      phone: booking.contactPhone || ud.phone || '',
    },

    checkInInstructions: [
      `Check-in time: ${booking.checkInTime  || '14:00'} (early check-in subject to availability)`,
      `Check-out time: ${booking.checkOutTime || '12:00'} (late check-out subject to fees)`,
      'Please present this voucher and a valid photo ID at hotel reception.',
      'A credit/debit card may be required for incidental charges at check-in.',
    ],
    rateComments: booking.rateComments || ud.rateComments || '',
  }
}

module.exports = { generateVoucherData, formatCancellationPolicies }
