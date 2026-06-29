/**
 * Payment Model
 *
 * Records Razorpay payment lifecycle:
 * CREATED → CAPTURED | FAILED → REFUNDED
 *
 * Implements idempotency via idempotencyKey.
 * Webhook payloads stored for debugging (no card data — Razorpay is PCI-compliant).
 */

const mongoose = require('mongoose')

const paymentSchema = new mongoose.Schema({
  // Client-generated idempotency key (UUID)
  idempotencyKey: { type: String, required: true, unique: true },

  // Booking reference
  bookingId: { type: String, required: true, index: true },

  // Razorpay identifiers
  razorpayOrderId:   { type: String, required: true, unique: true },
  razorpayPaymentId: { type: String, default: null },
  razorpaySignature: { type: String, default: null },

  // Amount (in smallest currency unit for Razorpay — paise for INR)
  amount:          { type: Number, required: true },    // paise (e.g. 450000 = ₹4500)
  currency:        { type: String, default: 'INR' },
  amountDisplay:   { type: Number, default: null },     // ₹ value for display

  // Status
  status: {
    type:    String,
    enum:    ['CREATED', 'CAPTURED', 'FAILED', 'REFUNDED'],
    default: 'CREATED',
    index:   true,
  },

  // Verification metadata
  verifiedAt: { type: Date, default: null },
  failedAt:   { type: Date, default: null },
  failReason: { type: String, default: null },

  // Webhook data (sanitized — no raw card info, Razorpay never sends it)
  webhookEventId: { type: String, default: null },
  webhookEvent:   { type: String, default: null },

  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
}, { versionKey: false })

paymentSchema.pre('save', function (next) {
  this.updatedAt = new Date()
  next()
})

paymentSchema.pre('findOneAndUpdate', function (next) {
  this.set({ updatedAt: new Date() })
  next()
})

const Payment = mongoose.models.Payment || mongoose.model('Payment', paymentSchema)

// In-memory fallback
const memoryPayments = new Map()
const isMongoConnected = () => mongoose.connection.readyState === 1

const paymentStore = {
  async create(data) {
    if (isMongoConnected()) {
      try {
        const doc = await Payment.create(data)
        return doc.toObject()
      } catch (err) {
        if (err.code === 11000) {
          // Idempotency: return existing
          const existing = await Payment.findOne({ idempotencyKey: data.idempotencyKey }).lean()
          if (existing) return existing
        }
        console.warn('[PaymentStore] Create error:', err.message)
      }
    }
    const record = { ...data, createdAt: new Date(), updatedAt: new Date() }
    memoryPayments.set(data.idempotencyKey, record)
    return record
  },

  async findByOrderId(razorpayOrderId) {
    if (isMongoConnected()) {
      try {
        return await Payment.findOne({ razorpayOrderId }).lean()
      } catch (err) {
        console.warn('[PaymentStore] FindByOrderId error:', err.message)
      }
    }
    for (const p of memoryPayments.values()) {
      if (p.razorpayOrderId === razorpayOrderId) return p
    }
    return null
  },

  async findByBookingId(bookingId) {
    if (isMongoConnected()) {
      try {
        return await Payment.findOne({ bookingId, status: 'CAPTURED' }).lean()
      } catch (err) {
        console.warn('[PaymentStore] FindByBookingId error:', err.message)
      }
    }
    for (const p of memoryPayments.values()) {
      if (p.bookingId === bookingId && p.status === 'CAPTURED') return p
    }
    return null
  },

  async update(razorpayOrderId, updates) {
    if (isMongoConnected()) {
      try {
        return await Payment.findOneAndUpdate(
          { razorpayOrderId },
          { $set: { ...updates, updatedAt: new Date() } },
          { new: true }
        ).lean()
      } catch (err) {
        console.warn('[PaymentStore] Update error:', err.message)
      }
    }
    for (const [key, p] of memoryPayments.entries()) {
      if (p.razorpayOrderId === razorpayOrderId) {
        const updated = { ...p, ...updates, updatedAt: new Date() }
        memoryPayments.set(key, updated)
        return updated
      }
    }
    return null
  },
}

module.exports = { Payment, paymentStore }
