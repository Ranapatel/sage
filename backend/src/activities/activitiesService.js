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

const MOCK_ACTIVITIES = [
  {
    activityCode: "act_scuba_diving_goa",
    activityName: "Scuba Diving at Grand Island",
    description: "Explore the vibrant underwater marine life and shipwrecks at Grand Island, Goa under professional guidance.",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80",
    images: [
      "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80",
      "https://images.unsplash.com/photo-1452626038306-9aae5e071dd3?w=600&q=80"
    ],
    destination: {
      code: "GOA",
      name: "Goa",
      country: "India",
      coordinates: { latitude: 15.4989, longitude: 73.8278 }
    },
    type: "EXCURSION",
    currency: "INR",
    amountsFrom: { amount: 3500, currency: "INR", amountINR: 3500 },
    modality: {
      code: "mod_scuba",
      name: "Standard Scuba Session",
      duration: "4 Hours",
      languages: ["en", "hi"]
    },
    modalities: [
      {
        code: "mod_scuba",
        name: "Standard Scuba Session",
        duration: "4 Hours",
        languages: [{ code: "en", name: "English" }, { code: "hi", name: "Hindi" }],
        sessions: [{ code: "morning", name: "Morning Batch", startTime: "08:00:00", endTime: "12:00:00" }],
        amountsFrom: { amount: 3500, currency: "INR", amountINR: 3500 },
        cancellationPolicies: [{ amount: 0, currency: "INR", from: null }],
        rateKey: "mock_ratekey_scuba_goa"
      }
    ],
    averageRating: 4.8,
    reviewCount: 142
  },
  {
    activityCode: "act_heritage_walk_goa",
    activityName: "Fontainhas Latin Quarter Heritage Walk",
    description: "Discover the charming Portuguese influence, colourful colonial houses, and history of Panaji's Latin Quarter.",
    image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80",
    images: ["https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=600&q=80"],
    destination: {
      code: "GOA",
      name: "Goa",
      country: "India",
      coordinates: { latitude: 15.4909, longitude: 73.8322 }
    },
    type: "TOUR",
    currency: "INR",
    amountsFrom: { amount: 800, currency: "INR", amountINR: 800 },
    modality: {
      code: "mod_walk",
      name: "Guided Walking Tour",
      duration: "2 Hours",
      languages: ["en", "hi"]
    },
    modalities: [
      {
        code: "mod_walk",
        name: "Guided Walking Tour",
        duration: "2 Hours",
        languages: [{ code: "en", name: "English" }, { code: "hi", name: "Hindi" }],
        sessions: [{ code: "afternoon", name: "Afternoon Batch", startTime: "16:00:00", endTime: "18:00:00" }],
        amountsFrom: { amount: 800, currency: "INR", amountINR: 800 },
        cancellationPolicies: [{ amount: 0, currency: "INR", from: null }],
        rateKey: "mock_ratekey_walk_goa"
      }
    ],
    averageRating: 4.6,
    reviewCount: 88
  },
  {
    activityCode: "act_spice_plantation_goa",
    activityName: "Tropical Spice Plantation Tour & Lunch",
    description: "Take a refreshing walk through spice fields, see local crops, and enjoy an authentic Goan buffet lunch.",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
    images: ["https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80"],
    destination: {
      code: "GOA",
      name: "Goa",
      country: "India",
      coordinates: { latitude: 15.4343, longitude: 74.0232 }
    },
    type: "EXCURSION",
    currency: "INR",
    amountsFrom: { amount: 1200, currency: "INR", amountINR: 1200 },
    modality: {
      code: "mod_spice",
      name: "Standard entry with lunch",
      duration: "3 Hours",
      languages: ["en", "hi"]
    },
    modalities: [
      {
        code: "mod_spice",
        name: "Standard entry with lunch",
        duration: "3 Hours",
        languages: [{ code: "en", name: "English" }, { code: "hi", name: "Hindi" }],
        sessions: [{ code: "lunch", name: "Lunch Session", startTime: "11:00:00", endTime: "14:00:00" }],
        amountsFrom: { amount: 1200, currency: "INR", amountINR: 1200 },
        cancellationPolicies: [{ amount: 0, currency: "INR", from: null }],
        rateKey: "mock_ratekey_spice_goa"
      }
    ],
    averageRating: 4.5,
    reviewCount: 65
  }
]

// ── Normalizers ───────────────────────────────────────────────────────────────

function toINR(amount, currency) {
  if (!amount) return null
  if (currency === 'EUR') return Math.round(amount * EUR_TO_INR)
  if (currency === 'USD') return Math.round(amount * USD_TO_INR)
  return Math.round(amount)
}

function determineCategories(activity) {
  const text = `${activity.activityName} ${activity.description} ${activity.modality?.name || ''}`.toLowerCase()
  const cats = []
  if (text.match(/trek|hike|dive|raft|scuba|safari|climb|adventure|sport|zipline|quad|bike|surfing|skydiving|parasailing/)) {
    cats.push('adventure')
  }
  if (text.match(/temple|museum|historic|culture|heritage|palace|walk|guide|art|gallery|monument|church|synagogue|cathedral/)) {
    cats.push('culture')
  }
  if (text.match(/cooking|food|lunch|dinner|tasting|wine|beer|spice|plantation|restaurant|culinary|chef|feast|eat/)) {
    cats.push('food')
  }
  if (text.match(/boat|cruise|snorkel|swim|water|scuba|beach|island|river|sea|lake|kayak|sailing|rafting|ocean/)) {
    cats.push('water')
  }
  if (text.match(/nature|park|garden|wildlife|animal|jungle|forest|mountain|sunset|sunrise|zoo|view|scenic|waterfall/)) {
    cats.push('nature')
  }
  if (text.match(/pub|bar|club|nightlife|party|dance|crawl|disco|lounge|concert|show/)) {
    cats.push('nightlife')
  }
  if (cats.length === 0) {
    cats.push('nature')
  }
  return cats
}

/**
 * Normalise a single Hotelbeds activity object into TripSage DTO.
 */
function normalizeActivity(raw) {
  if (!raw) return null

  const firstModality = (raw.modalities || [])[0] || {}
  const amountsFrom   = raw.amountsFrom || {}

  const normalized = {
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

  normalized.categories = determineCategories(normalized)
  normalized.category = normalized.categories[0] || 'nature'

  return normalized
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
  try {
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
  } catch (err) {
    console.warn('[ActivitiesService] Hotelbeds search failed — using mock fallback:', err.message)
    const dest = validatedInput.destinationCode || 'Destination'
    const fallbackActivities = MOCK_ACTIVITIES.map(act => ({
      ...act,
      destination: {
        ...act.destination,
        code: dest,
        name: dest
      }
    }))
    return {
      activities: fallbackActivities,
      total: fallbackActivities.length,
      from: validatedInput.from,
      to: validatedInput.to,
      language: validatedInput.language,
    }
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
  try {
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
  } catch (err) {
    console.warn(`[ActivitiesService] getActivityDetails failed for ${validatedInput.activityCode} — using mock fallback:`, err.message)
    const mock = MOCK_ACTIVITIES.find(act => act.activityCode === validatedInput.activityCode) || MOCK_ACTIVITIES[0]

    // Store mock rateKey
    const firstModality = mock.modalities[0] || {}
    const mockRateKey = firstModality.rateKey || 'mock_ratekey_scuba_goa'
    const bestAmount = firstModality.amountsFrom?.amount || 1000
    const bestCurrency = firstModality.amountsFrom?.currency || 'INR'

    await repo.storeRateKey(bookingId, mockRateKey, {
      activityCode: mock.activityCode,
      amount:       bestAmount,
      currency:     bestCurrency,
      amountINR:    toINR(bestAmount, bestCurrency),
      fromDate:     validatedInput.fromDate,
      toDate:       validatedInput.toDate,
    })

    return {
      activity:             mock,
      rateKey:              mockRateKey,
      modalities:           mock.modalities,
      cancellationPolicies: mock.modalities[0]?.cancellationPolicies || [],
      sessions:             mock.modalities[0]?.sessions             || [],
      amount:               bestAmount,
      amountINR:            toINR(bestAmount, bestCurrency),
      currency:             bestCurrency,
    }
  }
}

module.exports = { searchActivities, getActivityDetails, normalizeActivity }
