const mongoose = require('mongoose')

const memoryCatalog = new Map()

const staticCatalogSchema = new mongoose.Schema({
  type: { type: String, required: true, unique: true }, // e.g., 'facilities', 'categories', 'rooms', 'boards', 'chains', 'destinations', 'countries', 'ratecomments', 'issues'
  items: { type: mongoose.Schema.Types.Mixed, required: true } // Array or Map of static items
}, { timestamps: true })

const StaticCatalog = mongoose.models.StaticCatalog || mongoose.model('StaticCatalog', staticCatalogSchema)

const isMongoConnected = () => mongoose.connection.readyState === 1

const catalogCache = {
  async get(type) {
    if (isMongoConnected()) {
      try {
        const doc = await StaticCatalog.findOne({ type })
        return doc ? doc.items : null
      } catch (err) {
        console.warn(`[Catalog DB] Error reading type ${type}:`, err.message)
      }
    }
    return memoryCatalog.get(type) || null
  },

  async set(type, items) {
    if (isMongoConnected()) {
      try {
        await StaticCatalog.findOneAndUpdate(
          { type },
          { items },
          { upsert: true, new: true }
        )
      } catch (err) {
        console.warn(`[Catalog DB] Error writing type ${type}:`, err.message)
      }
    }
    memoryCatalog.set(type, items)
  }
}

module.exports = { StaticCatalog, catalogCache }
