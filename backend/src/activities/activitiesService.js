/**
 * Activities Service
 *
 * Business logic for:
 *  1. searchActivities   — Search with destination / GPS / hotel code / keyword
 *  2. getActivityDetails — Fetch details, extract & store rateKey (TTL 30 min)
 *
 * Response mapping normalises Hotelbeds raw payloads to TripSage DTOs.
 */

const client = require('./hotelbedsActivitiesClient')
const repo   = require('./activitiesRepository')

const EUR_TO_INR = 90
const USD_TO_INR = 83

// ── Normalizers ───────────────────────────────────────────────────────────────

function toINR(amount, currency) {
  if (!amount) return null
  if (currency === 'EUR') return Math.round(amount * EUR_TO_INR)
  if (currency === 'USD') return Math.round(amount * USD_TO_INR)
  return Math.round(amount)
}

/**
 * Normalise a single Hotelbeds activity object into TripSage DTO.
 */
function normalizeActivity(raw) {
  if (!raw) return null

  const firstModality = (raw.modalities || [])[0] || {}
  const amountsFrom   = raw.amountsFrom || {}

  return {
    activityCode:  raw.code           || raw.activityCode,
    activityName:  raw.name?.content  || raw.name || '',
    description:   raw.description?.content || raw.description || '',
    image:         buildImageUrl(raw.images),
    images:        buildGallery(raw.images),
    destination: {
      code:    raw.destinationCode || null,
      name:    raw.destinationName?.content || raw.destinationName || null,
      country: raw.country?.content || null,
      coordinates: {
        latitude:  raw.coordinates?.latitude  || null,
        longitude: raw.coordinates?.longitude || null,
      },
    },
    type:     raw.type || null,
    currency: amountsFrom.currency || 'EUR',
    amountsFrom: {
      amount:    amountsFrom.amount    || null,
      currency:  amountsFrom.currency  || 'EUR',
      amountINR: toINR(amountsFrom.amount, amountsFrom.currency),
    },
    modality: {
      code:      firstModality.code     || null,
      name:      firstModality.name     || null,
      duration:  firstModality.duration || null,
      languages: (firstModality.languages || []).map(l => l.code || l),
    },
    modalities:    normalizeModalities(raw.modalities),
    averageRating: raw.averageRating || null,
    reviewCount:   raw.numComments   || 0,
  }
}

function buildImageUrl(images) {
  if (!images || !images.length) return null
  const first = images[0]
  if (typeof first === 'string') return first
  return first.url || first.path || null
}

function buildGallery(images) {
  if (!images || !images.length) return []
  return images.slice(0, 10).map(img =>
    typeof img === 'string' ? img : (img.url || img.path)
  ).filter(Boolean)
}

function normalizeModalities(modalities = []) {
  return modalities.map(m => ({
    code:      m.code      || null,
    name:      m.name      || null,
    duration:  m.duration  || null,
    languages: (m.languages || []).map(l => ({
      code: l.code || l,
      name: l.name || l.code || l,
    })),
    sessions: (m.sessions || []).map(s => ({
      code:        s.code        || null,
      name:        s.name        || null,
      startTime:   s.startTime   || null,
      endTime:     s.endTime     || null,
    })),
    amountsFrom: m.amountsFrom || null,
    cancellationPolicies: (m.cancellationPolicies || []).map(cp => ({
      amount:   cp.amount      || 0,
      currency: cp.currency    || 'EUR',
      from:     cp.dateFrom    || cp.from || null,
    })),
    rateKey: m.rateKey || null,
  }))
}

// ── Public service methods ─────────────────────────────────────────────────────

/**
 * Search for activities.
 *
 * @param {object} validatedInput — output from activitySearchSchema.parse()
 */
async function searchActivities(validatedInput) {
  const payload = buildSearchPayload(validatedInput)
  const raw     = await client.searchActivities(payload)

  const activities = (raw.activities || []).map(normalizeActivity).filter(Boolean)

  // Cache all results
  await repo.cacheActivities(activities)

  return {
    activities,
    total:    raw.totalItems || activities.length,
    from:     validatedInput.from,
    to:       validatedInput.to,
    language: validatedInput.language,
  }
}

function buildSearchPayload(input) {
  const payload = {
    language: input.language || 'en',
    from:     input.from    || 1,
    to:       input.to      || 20,
    filter: {
      dateFrom: input.fromDate,
      dateTo:   input.toDate,
      paxes:    input.paxes || [],
    },
  }

  if (input.destinationCode) {
    payload.filter.destinationCode = input.destinationCode
  }
  if (input.hotelCode) {
    payload.filter.hotelCode = input.hotelCode
  }
  if (input.coordinates) {
    payload.filter.geolocation = {
      latitude:  input.coordinates.latitude,
      longitude: input.coordinates.longitude,
      radio:     input.coordinates.radius || 50,
      unit:      input.coordinates.unit   || 'km',
    }
  }
  if (input.keyword) {
    payload.filter.keyword = input.keyword
  }
  if (input.activityType) {
    payload.filter.type = input.activityType
  }
  if (input.minPrice !== undefined || input.maxPrice !== undefined) {
    payload.filter.price = {}
    if (input.minPrice !== undefined) payload.filter.price.from = input.minPrice
    if (input.maxPrice !== undefined) payload.filter.price.to   = input.maxPrice
  }

  return payload
}

/**
 * Get activity details with rateKey extraction and Redis storage.
 *
 * @param {string} bookingId     — client booking UUID (used for rateKey namespacing)
 * @param {object} validatedInput — output from activityDetailsSchema.parse()
 * @returns {{ activity, rateKey, modalities, cancellationPolicies, sessions }}
 */
async function getActivityDetails(bookingId, validatedInput) {
  const payload = {
    language:     validatedInput.language || 'en',
    activityCode: validatedInput.activityCode,
    fromDate:     validatedInput.fromDate,
    toDate:       validatedInput.toDate,
    paxes:        validatedInput.paxes,
  }

  const raw = await client.getActivityDetails(payload)

  const activity   = normalizeActivity(raw.activity || raw)
  const modalities = activity.modalities || []

  // Extract best/first rateKey from modalities
  let bestRateKey = null
  let bestAmount  = null
  let bestCurrency = 'EUR'

  for (const modality of modalities) {
    if (modality.rateKey) {
      const amount = modality.amountsFrom?.amount || 0
      if (!bestRateKey || amount < bestAmount) {
        bestRateKey  = modality.rateKey
        bestAmount   = amount
        bestCurrency = modality.amountsFrom?.currency || 'EUR'
      }
    }
  }

  if (!bestRateKey) {
    throw new Error('No rateKey available for this activity on the selected dates. Please try different dates.')
  }

  // Store rateKey in Redis with 30-minute TTL
  await repo.storeRateKey(bookingId, bestRateKey, {
    activityCode: validatedInput.activityCode,
    amount:       bestAmount,
    currency:     bestCurrency,
    amountINR:    toINR(bestAmount, bestCurrency),
    fromDate:     validatedInput.fromDate,
    toDate:       validatedInput.toDate,
  })

  // Update activity cache with full details
  if (activity.activityCode) {
    await repo.cacheActivities([activity])
  }

  return {
    activity,
    rateKey:              bestRateKey,
    modalities,
    cancellationPolicies: modalities[0]?.cancellationPolicies || [],
    sessions:             modalities[0]?.sessions             || [],
    amount:               bestAmount,
    amountINR:            toINR(bestAmount, bestCurrency),
    currency:             bestCurrency,
  }
}

module.exports = { searchActivities, getActivityDetails, normalizeActivity }
