const mongoose = require('mongoose')

const memoryHotels = new Map()

const hotelContentSchema = new mongoose.Schema({
  code: { type: String, required: true, unique: true }, // Hotelbeds hotel code as string
  data: { type: mongoose.Schema.Types.Mixed, required: true } // Static hotel details payload
}, { timestamps: true })

const HotelContent = mongoose.models.HotelContent || mongoose.model('HotelContent', hotelContentSchema)

const isMongoConnected = () => mongoose.connection.readyState === 1

const hotelCache = {
  async get(code) {
    const key = String(code)
    if (isMongoConnected()) {
      try {
        const doc = await HotelContent.findOne({ code: key })
        return doc ? doc.data : null
      } catch (err) {
        console.warn(`[Hotel DB] Error reading hotel code ${key}:`, err.message)
      }
    }
    return memoryHotels.get(key) || null
  },

  async set(code, data) {
    const key = String(code)
    if (isMongoConnected()) {
      try {
        await HotelContent.findOneAndUpdate(
          { code: key },
          { data },
          { upsert: true, new: true }
        )
      } catch (err) {
        console.warn(`[Hotel DB] Error writing hotel code ${key}:`, err.message)
      }
    }
    memoryHotels.set(key, data)
  }
}

module.exports = { HotelContent, hotelCache }
