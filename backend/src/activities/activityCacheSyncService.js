const client = require('./hotelbedsActivityCacheClient')
const { activityCache } = require('../models/Activity')

const DEFAULT_CACHE_TTL_MS = 24 * 60 * 60 * 1000

function unwrapList(payload, keys) {
  if (Array.isArray(payload)) return payload
  for (const key of keys) {
    if (Array.isArray(payload?.[key])) return payload[key]
  }
  return []
}

function text(value) {
  if (!value) return ''
  if (typeof value === 'string') return value
  return value.content || value.name || value.value || ''
}

function normalizeCacheActivity(raw, extras = {}) {
  if (!raw) return null
  const code = raw.code || raw.activityCode || raw.activity?.code
  if (!code) return null

  const amountsFrom = raw.amountsFrom || raw.priceFrom || extras.priceFrom?.amountsFrom || extras.priceFrom || {}
  const destination = raw.destination || {}
  const images = normalizeImages(raw.images || extras.images || [])

  return {
    activityCode: code,
    activityName: text(raw.name) || raw.activityName || code,
    description: text(raw.description) || text(raw.shortDescription),
    image: images[0] || raw.image || null,
    images,
    destination: {
      code: raw.destinationCode || destination.code || extras.destinationCode || null,
      name: text(raw.destinationName) || text(destination.name) || null,
      country: text(raw.country) || text(destination.country) || null,
      coordinates: {
        latitude: raw.coordinates?.latitude || destination.coordinates?.latitude || null,
        longitude: raw.coordinates?.longitude || destination.coordinates?.longitude || null,
      },
    },
    type: raw.type || raw.activityType || null,
    categories: normalizeCodes(raw.categories || extras.categories),
    segments: normalizeCodes(raw.segments || extras.segments),
    currency: amountsFrom.currency || raw.currency || 'EUR',
    amountsFrom: {
      amount: toNumber(amountsFrom.amount || amountsFrom.value || raw.amountFrom),
      currency: amountsFrom.currency || raw.currency || 'EUR',
      amountINR: raw.amountINR || null,
    },
    modality: normalizePrimaryModality(raw.modalities || extras.modalities),
    modalities: raw.modalities || extras.modalities || [],
    operationalDates: raw.operationalDates || extras.operationalDates || [],
    averageRating: toNumber(raw.averageRating),
    reviewCount: toNumber(raw.numComments || raw.reviewCount) || 0,
    source: 'cache',
    isActive: raw.active !== false,
    lastSyncedAt: new Date(),
    cacheExpiresAt: new Date(Date.now() + DEFAULT_CACHE_TTL_MS),
  }
}

function normalizeImages(images) {
  if (!Array.isArray(images)) return []
  return images
    .map(image => typeof image === 'string' ? image : (image.url || image.path || image.visualizationOrder?.url))
    .filter(Boolean)
    .slice(0, 12)
}

function normalizeCodes(values = []) {
  if (!Array.isArray(values)) return []
  return values.map(value => typeof value === 'string' ? value : (value.code || value.name)).filter(Boolean)
}

function normalizePrimaryModality(modalities = []) {
  const first = Array.isArray(modalities) ? modalities[0] : null
  if (!first) {
    return { code: null, name: null, duration: null, languages: [] }
  }
  return {
    code: first.code || null,
    name: text(first.name) || null,
    duration: first.duration || null,
    languages: normalizeCodes(first.languages),
  }
}

function toNumber(value) {
  if (value === null || value === undefined || value === '') return null
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : null
}

async function syncPortfolio(params = {}) {
  const raw = await client.getPortfolio(params)
  const activities = unwrapList(raw, ['activities', 'portfolio', 'items'])
    .map(item => normalizeCacheActivity(item))
    .filter(Boolean)

  await activityCache.mset(activities)
  return { endpoint: 'portfolio', count: activities.length }
}

async function syncBasicInformation(params = {}) {
  const raw = await client.getBasicInformation(params)
  const activities = unwrapList(raw, ['activities', 'basicInformation', 'items'])
    .map(item => normalizeCacheActivity(item))
    .filter(Boolean)

  await activityCache.mset(activities)
  return { endpoint: 'basic-information', count: activities.length }
}

async function syncPriceFrom(params = {}) {
  const raw = await client.getPriceFrom(params)
  const activities = unwrapList(raw, ['activities', 'prices', 'items'])
    .map(item => normalizeCacheActivity(item, { priceFrom: item.priceFrom || item.amountsFrom }))
    .filter(Boolean)

  await activityCache.mset(activities)
  return { endpoint: 'price-from', count: activities.length }
}

async function syncModalities(params = {}) {
  const raw = await client.getModalities(params)
  const activities = unwrapList(raw, ['activities', 'modalities', 'items'])
    .map(item => normalizeCacheActivity(item, { modalities: item.modalities }))
    .filter(Boolean)

  await activityCache.mset(activities)
  return { endpoint: 'modalities', count: activities.length }
}

async function syncOperationalDates(params = {}) {
  const raw = await client.getOperationalDates(params)
  const activities = unwrapList(raw, ['activities', 'operationalDates', 'items'])
    .map(item => normalizeCacheActivity(item, { operationalDates: item.operationalDates }))
    .filter(Boolean)

  await activityCache.mset(activities)
  return { endpoint: 'operational-dates', count: activities.length }
}

async function syncAll(params = {}) {
  const results = []
  results.push(await syncPortfolio(params))
  results.push(await syncBasicInformation(params))
  results.push(await syncPriceFrom(params))
  results.push(await syncModalities(params))
  results.push(await syncOperationalDates(params))
  return {
    syncedAt: new Date().toISOString(),
    results,
    total: results.reduce((sum, result) => sum + result.count, 0),
  }
}

module.exports = {
  normalizeCacheActivity,
  syncPortfolio,
  syncBasicInformation,
  syncPriceFrom,
  syncModalities,
  syncOperationalDates,
  syncAll,
}
