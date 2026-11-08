/**
 * TripSage — HotelBooking Model & Persistent Data Store
 * Backed by MongoDB via Mongoose with filesystem fallback.
 */

const mongoose = require('mongoose')
const fs = require('fs')
const path = require('path')

const BOOKINGS_FILE = path.join(__dirname, '../../../data/bookings.json')

const hotelBookingSchema = new mongoose.Schema({
  id:               { type: String, required: true, unique: true, index: true },
  userId:           { type: String, required: true, index: true },
  userClerkId:      { type: String, index: true },
  type:             { type: String, default: 'hotel' },
  itemId:           { type: String, required: true },
  status:           { type: String, default: 'PENDING', index: true },
  bookingReference: { type: String, index: true },
  clientReference:  { type: String },
  hotelCode:        { type: mongoose.Schema.Types.Mixed },
  hotelName:        { type: String },
  hotelAddress:     { type: String },
  hotelPhone:       { type: String },
  hotelEmail:       { type: String },
  hotelWeb:         { type: String },
  rateComments:     { type: String },
  checkIn:          { type: String },
  checkOut:         { type: String },
  checkInTime:      { type: String },
  checkOutTime:     { type: String },
  roomType:         { type: String },
  boardType:        { type: String },
  amount:           { type: Number },
  totalPrice:       { type: Number },
  currency:         { type: String, default: 'INR' },
  originalCurrency: { type: String },
  originalTotalPrice: { type: Number },
  bookingDate:      { type: String },
  cancellationPolicies: { type: Array, default: [] },
  guests:           { type: Array, default: [] },
  contactEmail:     { type: String },
  confirmedAt:      { type: String },
  cancelledAt:      { type: String },
  createdAt:        { type: Date, default: Date.now },
  updatedAt:        { type: Date, default: Date.now },
})

const HotelBooking = mongoose.models.HotelBooking || mongoose.model('HotelBooking', hotelBookingSchema)

// File/Memory persistence helpers
function loadFileBookings() {
  const map = new Map()
  try {
    if (fs.existsSync(BOOKINGS_FILE)) {
      const raw = fs.readFileSync(BOOKINGS_FILE, 'utf8')
      const data = JSON.parse(raw)
      Object.entries(data).forEach(([id, b]) => map.set(id, b))
    }
  } catch (err) {
    console.warn('[HotelBookingStore] Could not load persisted file bookings:', err.message)
  }
  return map
}

function saveFileBookings(map) {
  try {
    const dir = path.dirname(BOOKINGS_FILE)
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
    const obj = Object.fromEntries(map.entries())
    fs.writeFileSync(BOOKINGS_FILE, JSON.stringify(obj, null, 2), 'utf8')
  } catch (err) {
    console.warn('[HotelBookingStore] Could not persist bookings to file:', err.message)
  }
}

const memoryBookings = loadFileBookings()
const isMongoConnected = () => mongoose.connection.readyState === 1

const hotelBookingStore = {
  async save(booking) {
    memoryBookings.set(booking.id, booking)
    saveFileBookings(memoryBookings)

    if (isMongoConnected()) {
      try {
        await HotelBooking.findOneAndUpdate(
          { id: booking.id },
          { $set: booking },
          { upsert: true, new: true }
        )
      } catch (err) {
        console.warn('[HotelBookingStore] Mongo save notice:', err.message)
      }
    }
    return booking
  },

  async get(id) {
    if (isMongoConnected()) {
      try {
        const doc = await HotelBooking.findOne({ id }).lean()
        if (doc) return doc
      } catch (err) {
        console.warn('[HotelBookingStore] Mongo get notice:', err.message)
      }
    }
    return memoryBookings.get(id) || null
  },

  getAllInMemory() {
    return memoryBookings
  }
}

module.exports = {
  HotelBooking,
  hotelBookingStore
}

