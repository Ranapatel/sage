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
  categories:{ type: [String], default: [] },
  segments:  { type: [String], default: [] },
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
  operationalDates: { type: mongoose.Schema.Types.Mixed, default: [] },

  // Ratings
  averageRating: { type: Number, default: null },
  reviewCount:   { type: Number, default: 0 },

  // Cache metadata
  source:       { type: String, enum: ['booking', 'cache', 'content'], default: 'booking', index: true },
  isActive:     { type: Boolean, default: true, index: true },
  lastSyncedAt: { type: Date, default: null, index: true },
  cacheExpiresAt: { type: Date, default: null, index: true },
  cachedAt:     { type: Date, default: Date.now },
}, { versionKey: false })

// Auto-purge cache after 24 hours
activitySchema.index({ cachedAt: 1 }, { expireAfterSeconds: 24 * 3600 })
activitySchema.index({ activityName: 'text', description: 'text', 'destination.name': 'text' })
activitySchema.index({ 'destination.code': 1, isActive: 1, cacheExpiresAt: 1 })
activitySchema.index({ categories: 1, segments: 1, isActive: 1 })

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

  async search(filters = {}) {
    const {
      destinationCode,
      keyword,
      category,
      segment,
      minPrice,
      maxPrice,
      page = 1,
      limit = 20,
    } = filters

    const now = new Date()
    const query = {
      isActive: { $ne: false },
      $or: [{ cacheExpiresAt: null }, { cacheExpiresAt: { $gt: now } }],
    }
    if (destinationCode) query['destination.code'] = destinationCode
    if (category) query.categories = category
    if (segment) query.segments = segment
    if (minPrice !== undefined || maxPrice !== undefined) {
      query['amountsFrom.amount'] = {}
      if (minPrice !== undefined) query['amountsFrom.amount'].$gte = minPrice
      if (maxPrice !== undefined) query['amountsFrom.amount'].$lte = maxPrice
    }
    if (keyword) query.$text = { $search: keyword }

    const skip = (page - 1) * limit
    if (isMongoConnected()) {
      try {
        const sort = keyword ? { score: { $meta: 'textScore' } } : { activityName: 1 }
        const projection = keyword ? { score: { $meta: 'textScore' } } : {}
        const [docs, total] = await Promise.all([
          Activity.find(query, projection).sort(sort).skip(skip).limit(limit).lean(),
          Activity.countDocuments(query),
        ])
        return { activities: docs, total, page, limit, source: 'mongo' }
      } catch (err) {
        console.warn('[Activity Model] Search error:', err.message)
      }
    }

    const all = [...memoryActivities.values()]
    const filtered = all.filter(activity => {
      if (activity.isActive === false) return false
      if (activity.cacheExpiresAt && new Date(activity.cacheExpiresAt) <= now) return false
      if (destinationCode && activity.destination?.code !== destinationCode) return false
      if (category && !(activity.categories || []).includes(category)) return false
      if (segment && !(activity.segments || []).includes(segment)) return false
      const price = activity.amountsFrom?.amount
      if (minPrice !== undefined && !(price >= minPrice)) return false
      if (maxPrice !== undefined && !(price <= maxPrice)) return false
      if (keyword) {
        const haystack = `${activity.activityName || ''} ${activity.description || ''} ${activity.destination?.name || ''}`.toLowerCase()
        if (!haystack.includes(String(keyword).toLowerCase())) return false
      }
      return true
    })
    return {
      activities: filtered.slice(skip, skip + limit),
      total: filtered.length,
      page,
      limit,
      source: 'memory',
    }
  },
}

module.exports = { Activity, activityCache }
