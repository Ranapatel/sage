/**
 * ActivityBooking Model
 *
 * Stores the full lifecycle of an activity booking:
 * PRECONFIRMED → CONFIRMED → CANCELLED
 *
 * Passengers, holder, rate key, voucher, and cancellation data
 * are all captured here. The paymentId references the Payment collection.
 */

const mongoose = require('mongoose')

const passengerSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName:  { type: String, required: true },
  age:       { type: Number, required: true },
  type:      { type: String, enum: ['ADULT', 'CHILD', 'INFANT'], default: 'ADULT' },
}, { _id: false })

const activityBookingSchema = new mongoose.Schema({
  // Client-generated UUID (idempotency / reference for frontend)
  bookingId: { type: String, required: true, unique: true },

  // Hotelbeds-assigned reference (filled after preconfirm / reconfirm)
  hotelbedsReference: { type: String, default: null, index: true },

  // Booking status lifecycle
  status: {
    type:    String,
    enum:    ['PRECONFIRMED', 'CONFIRMED', 'CANCELLED', 'EXPIRED', 'FAILED'],
    default: 'PRECONFIRMED',
    index:   true,
  },

  // Activity details
  activityCode: { type: String, required: true, index: true },
  activityName: { type: String, required: true },
  modalityCode: { type: String, default: null },
  modalityName: { type: String, default: null },
  rateKey:      { type: String, required: true },
  language:     { type: String, default: 'en' },

  // Dates
  fromDate: { type: String, required: true },   // YYYY-MM-DD
  toDate:   { type: String, required: true },   // YYYY-MM-DD

  // Passengers
  passengers: { type: [passengerSchema], default: [] },

  // Lead holder / contact
  holder: {
    firstName: { type: String, required: true },
    lastName:  { type: String, required: true },
    email:     { type: String, required: true },
    phone:     { type: String, required: true },
  },

  // Pricing
  amount:   { type: Number, required: true },
  currency: { type: String, default: 'EUR' },
  amountINR:{ type: Number, default: null },

  // Post-confirmation
  voucherUrl:           { type: String, default: null },
  cancellationPolicies: { type: mongoose.Schema.Types.Mixed, default: [] },
  sessionDetails:       { type: mongoose.Schema.Types.Mixed, default: null },

  // Payment reference
  paymentId:         { type: String, default: null, index: true },
  paymentVerifiedAt: { type: Date,   default: null },

  // Preconfirmed bookings expire after 30 minutes
  expiresAt: { type: Date, default: null, index: { expireAfterSeconds: 0 } },

  // Cancellation
  cancelledAt:     { type: Date,   default: null },
  cancellationFee: { type: Number, default: null },
  refundAmount:    { type: Number, default: null },

  // Internal metadata
  rawPreconfirmResponse: { type: mongoose.Schema.Types.Mixed, default: null },
  rawReconfirmResponse:  { type: mongoose.Schema.Types.Mixed, default: null },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { versionKey: false })

activityBookingSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

activityBookingSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() })
  next()
})

const ActivityBooking = mongoose.models.ActivityBooking || mongoose.model('ActivityBooking', activityBookingSchema)

// In-memory fallback
const memoryBookings = new Map()
const isMongoConnected = () => mongoose.connection.readyState === 1

const bookingStore = {
  async create(data) {
    if (isMongoConnected()) {
      try {
        const doc = await ActivityBooking.create(data)
        return doc.toObject()
      } catch (err) {
        console.warn('[BookingStore] Create error:', err.message)
      }
    }
    const record = { ...data, createdAt: new Date(), updatedAt: new Date() }
    memoryBookings.set(data.bookingId, record)
    return record
  },

  async findById(bookingId) {
    if (isMongoConnected()) {
      try {
        const doc = await ActivityBooking.findOne({ bookingId })
        return doc ? doc.toObject() : null
      } catch (err) {
        console.warn('[BookingStore] FindById error:', err.message)
      }
    }
    return memoryBookings.get(bookingId) || null
  },

  async findByReference(hotelbedsReference) {
    if (isMongoConnected()) {
      try {
        const doc = await ActivityBooking.findOne({ hotelbedsReference })
        return doc ? doc.toObject() : null
      } catch (err) {
        console.warn('[BookingStore] FindByReference error:', err.message)
      }
    }
    for (const b of memoryBookings.values()) {
      if (b.hotelbedsReference === hotelbedsReference) return b
    }
    return null
  },

  async update(bookingId, updates) {
    if (isMongoConnected()) {
      try {
        const doc = await ActivityBooking.findOneAndUpdate(
          { bookingId },
          { $set: { ...updates, updatedAt: new Date() } },
          { new: true }
        )
        return doc ? doc.toObject() : null
      } catch (err) {
        console.warn('[BookingStore] Update error:', err.message)
      }
    }
    const existing = memoryBookings.get(bookingId)
    if (existing) {
      const updated = { ...existing, ...updates, updatedAt: new Date() }
      memoryBookings.set(bookingId, updated)
      return updated
    }
    return null
  },

  async list({ status, fromDate, toDate, userId, page = 1, limit = 20 } = {}) {
    const query = {}
    if (status)   query.status   = status
    if (fromDate) query.fromDate = { $gte: fromDate }
    if (toDate)   query.toDate   = { $lte: toDate }
    if (userId)   query['holder.email'] = userId

    const skip = (page - 1) * limit

    if (isMongoConnected()) {
      try {
        const [docs, total] = await Promise.all([
          ActivityBooking.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
          ActivityBooking.countDocuments(query),
        ])
        return { bookings: docs, total, page, limit }
      } catch (err) {
        console.warn('[BookingStore] List error:', err.message)
      }
    }

    const all = [...memoryBookings.values()]
    const filtered = all.filter(b => (!status || b.status === status))
    return {
      bookings: filtered.slice(skip, skip + limit),
      total:    filtered.length,
      page,
      limit,
    }
  },
}

module.exports = { ActivityBooking, bookingStore }
