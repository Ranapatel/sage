/**
 * Activity Model — Cached search results
 *
 * Stores normalised activity records returned from Hotelbeds Activity Search API.
 * Cache TTL: 24 hours (auto-purge via MongoDB TTL index).
 */

const mongoose = require('mongoose')

const activitySchema = new mongoose.Schema({
  // Hotelbeds activity identifier
  activityCode: { type: String, required: true, unique: true },

  activityName: { type: String, required: true },
  description:  { type: String, default: '' },
  image:        { type: String, default: null },      // primary CDN image URL
  images:       { type: [String], default: [] },      // gallery

  destination: {
    code:         { type: String, default: null },
    name:         { type: String, default: null },
    country:      { type: String, default: null },
    coordinates: {
      latitude:  { type: Number, default: null },
      longitude: { type: Number, default: null },
    },
  },

  type:      { type: String, default: null },           // e.g. "EXCURSION", "TOUR"
  currency:  { type: String, default: 'EUR' },

  amountsFrom: {
    amount:   { type: Number, default: null },
    currency: { type: String, default: null },
    amountINR:{ type: Number, default: null },
  },

  // Summary of first/best modality
  modality: {
    code:      { type: String, default: null },
    name:      { type: String, default: null },
    duration:  { type: String, default: null },
    languages: { type: [String], default: [] },
  },

  // Full modalities array for details view
  modalities: { type: mongoose.Schema.Types.Mixed, default: [] },

  // Ratings
  averageRating: { type: Number, default: null },
  reviewCount:   { type: Number, default: 0 },

  // Cache metadata
  cachedAt: { type: Date, default: Date.now },
}, { versionKey: false })

// Auto-purge cache after 24 hours
activitySchema.index({ cachedAt: 1 }, { expireAfterSeconds: 24 * 3600 })

const Activity = mongoose.models.Activity || mongoose.model('Activity', activitySchema)

// In-memory fallback
const memoryActivities = new Map()

const isMongoConnected = () => mongoose.connection.readyState === 1

const activityCache = {
  async get(activityCode) {
    if (isMongoConnected()) {
      try {
        const doc = await Activity.findOne({ activityCode })
        return doc ? doc.toObject() : null
      } catch (err) {
        console.warn(`[Activity Model] Read error for ${activityCode}:`, err.message)
      }
    }
    return memoryActivities.get(activityCode) || null
  },

  async set(activityCode, data) {
    const doc = { ...data, activityCode, cachedAt: new Date() }
    if (isMongoConnected()) {
      try {
        await Activity.findOneAndUpdate(
          { activityCode },
          { $set: doc },
          { upsert: true, new: true }
        )
      } catch (err) {
        console.warn(`[Activity Model] Write error for ${activityCode}:`, err.message)
      }
    }
    memoryActivities.set(activityCode, doc)
  },

  async mset(activities) {
    const ops = activities.map(a => ({
      updateOne: {
        filter: { activityCode: a.activityCode },
        update: { $set: { ...a, cachedAt: new Date() } },
        upsert: true,
      },
    }))
    if (isMongoConnected() && ops.length > 0) {
      try {
        await Activity.bulkWrite(ops)
      } catch (err) {
        console.warn('[Activity Model] Bulk write error:', err.message)
      }
    }
    activities.forEach(a => memoryActivities.set(a.activityCode, a))
  },
}

module.exports = { Activity, activityCache }
