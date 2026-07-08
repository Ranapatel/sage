const client = require('./hotelbedsContentClient')
const { activityCache } = require('../models/Activity')

function text(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.content || value.name || value.value || ''
}

function normalizeContentActivity(raw) {
  if (!raw) return null
  const code = raw.code || raw.activityCode
  if (!code) return null

  const images = (raw.images || [])
    .map(img => typeof img === 'string' ? img : (img.url || img.path || img.visualizationOrder?.url))
    .filter(Boolean)

  const categories = (raw.categories || []).map(c => c.code || c.name || c).filter(Boolean)
  const segments = (raw.segments || []).map(s => s.code || s.name || s).filter(Boolean)

  return {
    activityCode: code,
    activityName: text(raw.name) || code,
    description: text(raw.description) || text(raw.shortDescription),
    image: images[0] || null,
    images,
    destination: {
      code: raw.destinationCode || raw.destination?.code || null,
      name: text(raw.destinationName) || text(raw.destination?.name) || null,
      country: text(raw.country) || text(raw.destination?.country) || null,
      coordinates: {
        latitude: raw.coordinates?.latitude || null,
        longitude: raw.coordinates?.longitude || null,
      },
    },
    type: raw.type || null,
    categories,
    segments,
    currency: raw.currency || 'EUR',
    amountsFrom: {
      amount: raw.amountsFrom?.amount || raw.priceFrom || null,
      currency: raw.currency || 'EUR',
      amountINR: null,
    },
    source: 'content',
    isActive: raw.active !== false,
    lastSyncedAt: new Date(),
  }
}

async function syncCatalog(params = {}) {
  const raw = await client.getActivities(params)
  const activitiesList = raw.activities || raw.items || []
  const normalized = activitiesList.map(normalizeContentActivity).filter(Boolean)

  if (normalized.length > 0) {
    await activityCache.mset(normalized)
  }

  return {
    endpoint: 'content-activities',
    count: normalized.length,
    languages: params.language || 'en',
  }
}

module.exports = {
  normalizeContentActivity,
  syncCatalog,
}
