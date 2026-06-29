const axios  = require('axios')
const crypto = require('crypto')
const { catalogCache } = require('../models/StaticCatalog')
const { hotelCache }   = require('../models/HotelContent')

/**
 * Hotelbeds Content API (hotel-content-api/1.0)
 *
 * Credential isolation:
 *   This module reads ONLY HOTELS_HB_API_KEY and HOTELS_HB_SECRET.
 *   It NEVER touches ACTIVITIES_HB_API_KEY, ACTIVITIES_HB_SECRET, or any activities env var.
 */
const HOTELBEDS_CONTENT_URL = process.env.HOTELS_HB_CONTENT_URL
  || 'https://api.test.hotelbeds.com/hotel-content-api/1.0'

function getSignature() {
  const apiKey    = process.env.HOTELS_HB_API_KEY || ''
  const apiSecret = process.env.HOTELS_HB_SECRET  || ''
  if (!apiKey || !apiSecret || apiKey === 'your_hotelbeds_api_key') return ''
  const timestamp = Math.floor(Date.now() / 1000)
  return crypto.createHash('sha256').update(apiKey + apiSecret + timestamp).digest('hex')
}

function getHeaders() {
  return {
    'Api-key':         process.env.HOTELS_HB_API_KEY || '',
    'X-Signature':     getSignature(),
    'Accept':          'application/json',
    'Accept-Encoding': 'gzip',
  }
}

function logHotelbeds403(err) {
  if (err.response && err.response.status === 403) {
    const reqConfig = err.config || {}
    const cleanHeaders = { ...(reqConfig.headers || {}) }
    delete cleanHeaders['Api-key']
    delete cleanHeaders['X-Signature']
    delete cleanHeaders['api-key']
    delete cleanHeaders['x-signature']

    console.error('--- Hotelbeds 403 Forbidden Response Details ---')
    console.error('Request URL:', reqConfig.url || `${reqConfig.baseURL || ''}${reqConfig.url || ''}`)
    console.error('Request Headers (Excluding secrets):', JSON.stringify(cleanHeaders, null, 2))
    console.error('Response Status:', err.response.status)
    console.error('Response Body:', JSON.stringify(err.response.data, null, 2))
    console.error('------------------------------------------------')
  }
}

function getFallbackFacilityName(facilityCode, facilityGroupCode) {
  const group = String(facilityGroupCode)
  const code = String(facilityCode)
  const groups = {
    '10': 'General Service',
    '20': 'Sports & Recreation',
    '30': 'Dining & Catering',
    '40': 'Business & Events',
    '50': 'Room Amenity',
    '60': 'Room Amenity',
    '70': 'Hotel Facility',
    '71': 'Spa & Wellness',
    '72': 'Sports & Activities',
    '73': 'Entertainment',
    '74': 'Family & Kids',
    '80': 'Health & Wellness',
    '85': 'Guest Information',
    '90': 'Health & Safety'
  }
  const groupName = groups[group] || 'Property Facility'
  return `${groupName} (code: ${group}/${code})`
}

// ── Mock catalogs for local fallback ──────────────────────────────────────────
const MOCK_CATALOGS = {
  facilities: [
    { code: '10', name: 'Air conditioning in public areas', groupCode: '10' },
    { code: '20', name: '24-hour reception', groupCode: '10' },
    { code: '30', name: 'Wireless internet connection', groupCode: '10' },
    { code: '40', name: 'Car park / Garage', groupCode: '10' },
    { code: '50', name: 'Outdoor freshwater pool', groupCode: '20' },
    { code: '60', name: 'Gym / Fitness facilities', groupCode: '20' },
    { code: '70', name: 'Spa treatments / Sauna', groupCode: '20' },
    { code: '80', name: 'Restaurant / Bar', groupCode: '30' }
  ],
  categories: [
    { code: '1EST', name: '1 STAR' },
    { code: '2EST', name: '2 STARS' },
    { code: '3EST', name: '3 STARS' },
    { code: '4EST', name: '4 STARS' },
    { code: '5EST', name: '5 STARS' },
    { code: 'APTS', name: 'APARTMENT' }
  ],
  rooms: [
    { code: 'DBL.ST', name: 'Double Standard Room' },
    { code: 'TWN.ST', name: 'Twin Standard Room' },
    { code: 'SUI.EX', name: 'Executive Suite Room' },
    { code: 'FAM.ST', name: 'Family Room Standard' }
  ],
  boards: [
    { code: 'RO', name: 'ROOM ONLY' },
    { code: 'BB', name: 'BED AND BREAKFAST' },
    { code: 'HB', name: 'HALF BOARD' },
    { code: 'FB', name: 'FULL BOARD' },
    { code: 'AI', name: 'ALL INCLUSIVE' }
  ],
  chains: [
    { code: 'MARR', name: 'Marriott International' },
    { code: 'HILT', name: 'Hilton Worldwide' },
    { code: 'ACC', name: 'Accor Hotels' },
    { code: 'IND', name: 'Independent Hotel' }
  ],
  destinations: [
    { code: 'GOA', name: 'Goa', countryCode: 'IN' },
    { code: 'BOM', name: 'Mumbai', countryCode: 'IN' },
    { code: 'DEL', name: 'Delhi', countryCode: 'IN' },
    { code: 'LON', name: 'London', countryCode: 'GB' },
    { code: 'PAR', name: 'Paris', countryCode: 'FR' }
  ],
  countries: [
    { code: 'IN', name: 'India' },
    { code: 'GB', name: 'United Kingdom' },
    { code: 'FR', name: 'France' },
    { code: 'US', name: 'United States' }
  ],
  ratecomments: [
    { code: '24524', incoming: 256, name: 'Standard Rate comments: Key collection at reception. Guests must present a photo ID and credit card at check-in. Minimum check-in age is 18.' },
    { code: '25612', incoming: 256, name: 'Special Promotion comments: Includes welcome drink upon check-in. Optional gym usage charges apply.' }
  ],
  issues: [
    { code: 'POOL_CLOSE', name: 'The outdoor swimming pool will undergo annual maintenance and be closed from June 15 to July 10.' },
    { code: 'ELEV_MAINT', name: 'One of the guest elevators will be down for servicing. Alternate stairways are available.' }
  ]
}

function getMockCatalog(type, params = {}) {
  const base = MOCK_CATALOGS[type] || []
  if (type === 'ratecomments' && params.code) {
    const matched = base.find(rc => rc.code === String(params.code))
    return { rateComments: matched ? [matched] : [{ code: String(params.code), incoming: 256, name: `Mock Rate Comment details for code ${params.code}: Standard reservation terms apply.` }] }
  }
  
  // Return wrapper format matching Hotelbeds Content API responses
  const wrapperMap = {
    facilities: 'facilities',
    categories: 'categories',
    rooms: 'rooms',
    boards: 'boards',
    chains: 'chains',
    destinations: 'destinations',
    countries: 'countries',
    ratecomments: 'rateComments',
    issues: 'issues'
  }
  const key = wrapperMap[type] || 'items'
  return { [key]: base }
}

async function fetchCatalogFromApi(type, params = {}) {
  const apiKey = process.env.HOTELS_HB_API_KEY
  const isConfigured = apiKey && apiKey !== 'your_hotelbeds_api_key'

  if (!isConfigured) {
    return getMockCatalog(type, params)
  }

  const endpointMap = {
    facilities: '/types/facilities',
    categories: '/types/categories',
    rooms: '/types/rooms',
    boards: '/types/boards',
    chains: '/types/chains',
    destinations: '/locations/destinations',
    countries: '/locations/countries',
    ratecomments: '/types/ratecomments',
    issues: '/types/issues'
  }

  const path = endpointMap[type]
  if (!path) throw new Error(`Unknown catalog type: ${type}`)

  try {
    const response = await axios.get(`${HOTELBEDS_CONTENT_URL}${path}`, {
      headers: getHeaders(),
      params,
      timeout: 15000
    })
    return response.data
  } catch (err) {
    console.error(`[Content API] Failed to fetch catalog ${type}:`, err.response?.data || err.message)
    logHotelbeds403(err)
    return getMockCatalog(type, params)
  }
}

function normalizeCatalog(type, rawData) {
  if (!rawData) return []
  if (type === 'facilities') {
    // Hotelbeds /types/facilities returns items with facilityGroupCode + facilityCode structure.
    // We store with a composite key "groupCode:facilityCode" to avoid collisions between groups.
    return (rawData.facilities || []).map(f => ({
      code: String(f.facilityCode),              // numeric facility code (e.g. "320")
      groupCode: String(f.facilityGroupCode),    // group (e.g. "70")
      compositeKey: `${f.facilityGroupCode}:${f.facilityCode}`,
      name: f.description?.content || ''
    }))
  }
  if (type === 'categories') {
    return (rawData.categories || []).map(c => ({
      code: String(c.code),
      name: c.description?.content || ''
    }))
  }
  if (type === 'rooms') {
    return (rawData.rooms || []).map(r => ({
      code: String(r.code),
      name: r.description || ''
    }))
  }
  if (type === 'boards') {
    return (rawData.boards || []).map(b => ({
      code: String(b.code),
      name: b.description?.content || ''
    }))
  }
  if (type === 'chains') {
    return (rawData.chains || []).map(c => ({
      code: String(c.code),
      name: c.description?.content || ''
    }))
  }
  if (type === 'destinations') {
    return (rawData.destinations || []).map(d => ({
      code: String(d.code),
      name: d.name?.content || '',
      countryCode: d.countryCode
    }))
  }
  if (type === 'countries') {
    return (rawData.countries || []).map(c => ({
      code: String(c.code),
      name: c.description?.content || ''
    }))
  }
  if (type === 'ratecomments') {
    return (rawData.rateComments || []).map(rc => ({
      code: String(rc.code),
      incoming: rc.incoming,
      name: rc.description || ''
    }))
  }
  if (type === 'issues') {
    return (rawData.issues || []).map(i => ({
      code: String(i.code),
      name: i.description?.content || ''
    }))
  }
  return []
}

// ── Public Cache Interfaces ───────────────────────────────────────────────────

/**
 * Gets a specific record from a static catalog cache.
 * Misses trigger a full lazy seed of that catalog.
 */
async function getCatalogItem(type, code, groupCode) {
  const key = String(code)
  let cached = await catalogCache.get(type)
  if (!cached) {
    console.log(`[Catalog Cache] Miss for static '${type}'. Querying live content catalog...`)
    const raw = await fetchCatalogFromApi(type)
    const normalized = normalizeCatalog(type, raw)
    await catalogCache.set(type, normalized)
    cached = normalized
  }
  // For facilities: try composite key first (groupCode:facilityCode), then facilityCode alone
  if (type === 'facilities' && groupCode) {
    const composite = cached.find(item => item.compositeKey === `${groupCode}:${code}`)
    if (composite) return composite
  }
  return cached.find(item => item.code === key) || null
}

/**
 * Resolves a facility name locally from the static catalog cache to avoid individual API calls.
 * If not found, generates and caches a friendly fallback name to break the retry storm.
 */
async function fetchFacilityName(facilityCode, facilityGroupCode) {
  const cacheKey = `${facilityGroupCode}:${facilityCode}`
  try {
    // 1. Resolve locally from catalog item
    const catItem = await getCatalogItem('facilities', facilityCode, facilityGroupCode)
    if (catItem && catItem.name) {
      return catItem.name
    }
  } catch (err) {
    console.warn(`[Facilities] Failed to resolve name from catalog cache for ${cacheKey}:`, err.message)
  }

  // 2. Generate fallback name if missing
  const fallbackName = getFallbackFacilityName(facilityCode, facilityGroupCode)

  // 3. Cache the fallback name in static catalog to prevent future calls/lookups
  try {
    let cached = await catalogCache.get('facilities') || []
    if (!cached.find(i => i.compositeKey === cacheKey)) {
      cached.push({
        code: String(facilityCode),
        groupCode: String(facilityGroupCode),
        compositeKey: cacheKey,
        name: fallbackName
      })
      await catalogCache.set('facilities', cached)
    }
  } catch (cacheErr) {
    console.error(`[Facilities] Failed to write fallback name to cache:`, cacheErr.message)
  }

  return fallbackName
}

/**
 * Generates mock/fallback hotel content data.
 */
function getFallbackHotelData(codeStr) {
  const hotelData = {
    code:          codeStr,
    name:          'TripSage Premium Stay',
    description:   'Located in the heart of the tourist center. Offers luxurious amenities, premium direct bedding, and direct beach access.',
    address:       '123 Beach Front Boulevard',
    city:          'Goa',
    postalCode:    '403001',
    countryCode:   'IN',
    phone:         '+91 99999 88888',
    email:         'stay@tripsagepartner.com',
    web:           'www.tripsagepartner.com',
    latitude:      15.4989,
    longitude:     73.8278,
    checkInTime:   '14:00',
    checkOutTime:  '11:00',
    categoryCode:  '4EST',
    categoryName:  '4 STARS',
    images: [],
    facilities: [
      { code: '10', groupCode: '10', name: 'Air conditioning in public areas', hotelMandatory: true, voucher: true },
      { code: '30', groupCode: '10', name: 'Wireless internet connection', hotelMandatory: false, voucher: false }
    ],
    issues: [
      { code: 'POOL_CLOSE', dateFrom: '2026-06-15', dateTo: '2026-07-10' }
    ]
  }

  let hash = 0
  const str = String(hotelData.code || hotelData.name)
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  const fallbackIndex = Math.abs(hash) % 4 + 1
  const relPath = `00/004200/004200a_hb_ro_00${fallbackIndex}.jpg`
  
  hotelData.images = [{
    path: relPath,
    url: `https://photos.hotelbeds.com/giata/${relPath}`,
    urlSmall: `https://photos.hotelbeds.com/giata/small/${relPath}`,
    urlMedium: `https://photos.hotelbeds.com/giata/medium/${relPath}`,
    urlBigger: `https://photos.hotelbeds.com/giata/bigger/${relPath}`,
    urlXl: `https://photos.hotelbeds.com/giata/xl/${relPath}`,
    urlXxl: `https://photos.hotelbeds.com/giata/xxl/${relPath}`,
    urlOriginal: `https://photos.hotelbeds.com/giata/original/${relPath}`,
    order: 1,
    visualOrder: 1,
    type: 'GEN'
  }]

  return hotelData
}

/**
 * Gets a specific hotel's details from local cache.
 * Misses query Content API and store locally.
 */
async function getHotelContentDetails(hotelCode) {
  const codeStr = String(hotelCode)
  let cached = await hotelCache.get(codeStr)
  if (cached) {
    if (cached.images && Array.isArray(cached.images)) {
      cached.images = cached.images.filter(img => img.path !== '00/004200/004200a_hb_ro_006.jpg')
    }
    // Lazy resolve missing facility names for cached hotels
    if (cached.facilities && Array.isArray(cached.facilities)) {
      let modified = false
      for (const f of cached.facilities) {
        // Re-resolve if name is empty OR still has old "Facility #code" placeholder from stale cache
        const needsResolve = !f.name || f.name.startsWith('Facility #')
        if (needsResolve) {
          try {
            const catItem = await getCatalogItem('facilities', f.code, f.groupCode)
            if (catItem && catItem.name) {
              f.name = catItem.name
              modified = true
            } else {
              // Direct API fetch with both group + facility codes
              const fetched = await fetchFacilityName(f.code, f.groupCode)
              if (fetched) {
                f.name = fetched
                modified = true
              }
            }
          } catch (e) {}
        }
      }
      if (modified) {
        await hotelCache.set(codeStr, cached)
      }
    }
    return cached
  }

  console.log(`[Hotel Cache] Miss for hotel: ${codeStr}. Fetching live content...`)
  const isConfigured = process.env.HOTELS_HB_API_KEY && process.env.HOTELS_HB_API_KEY !== 'your_hotelbeds_api_key'
  
  let hotelData = null
  if (isConfigured) {
    try {
      const sig = getSignature()
      const response = await axios.get(`${HOTELBEDS_CONTENT_URL}/hotels`, {
        params: { codes: codeStr, fields: 'all', language: 'ENG', from: 1, to: 1 },
        headers: getHeaders(),
        timeout: 15000
      })
      const hotels = response.data?.hotels || []
      const rawHotel = hotels[0]
      if (rawHotel) {
        // Resolve facility names — prefer facilityName.content from hotel response,
        // then fetch specifically from /types/facilities with groupCode+code params
        const facilities = await Promise.all((rawHotel.facilities || []).map(async f => {
          let name = f.facilityName?.content || ''
          if (!name) {
            try {
              // Try catalog with composite key first
              const catItem = await getCatalogItem('facilities', f.facilityCode, f.facilityGroupCode)
              if (catItem && catItem.name) {
                name = catItem.name
              } else {
                // Direct API fetch with both codes as params (most accurate)
                const fetched = await fetchFacilityName(f.facilityCode, f.facilityGroupCode)
                name = fetched || ''
              }
            } catch (err) {
              console.warn(`[Facilities] Name lookup failed for ${f.facilityGroupCode}:${f.facilityCode}:`, err.message)
            }
          }
          return {
            code: String(f.facilityCode),
            groupCode: String(f.facilityGroupCode),
            name,   // may be empty string — will be filtered out when displaying
            hotelMandatory: f.hotelMandatory || false,
            voucher: f.voucher || false
          }
        }))

        hotelData = {
          code:          rawHotel.code,
          name:          rawHotel.name?.content || '',
          description:   rawHotel.description?.content || '',
          address:       rawHotel.address?.content || '',
          city:          rawHotel.city?.content || '',
          postalCode:    rawHotel.postalCode || '',
          countryCode:   rawHotel.countryCode || '',
          phone:         rawHotel.phones?.[0]?.phoneNumber || '',
          email:         rawHotel.email || '',
          web:           rawHotel.web || '',
          latitude:      rawHotel.coordinates?.latitude,
          longitude:     rawHotel.coordinates?.longitude,
          checkInTime:   rawHotel.checkIn?.minTime || '14:00',
          checkOutTime:  rawHotel.checkOut?.maxTime || '12:00',
          categoryCode:  rawHotel.categoryCode || '',
          categoryName:  rawHotel.categoryName?.content || '',
          images: (rawHotel.images || [])
            .map(img => ({
              path: img.path,
              url:         `https://photos.hotelbeds.com/giata/${img.path}`,
              urlSmall:    `https://photos.hotelbeds.com/giata/small/${img.path}`,
              urlMedium:   `https://photos.hotelbeds.com/giata/medium/${img.path}`,
              urlBigger:   `https://photos.hotelbeds.com/giata/bigger/${img.path}`,
              urlXl:       `https://photos.hotelbeds.com/giata/xl/${img.path}`,
              urlXxl:      `https://photos.hotelbeds.com/giata/xxl/${img.path}`,
              urlOriginal: `https://photos.hotelbeds.com/giata/original/${img.path}`,
              order: img.order,
              visualOrder: img.visualOrder,
              type: img.imageTypeCode
            }))
            .sort((a, b) => (a.visualOrder || 999) - (b.visualOrder || 999)),
          facilities,
          issues: (rawHotel.issues || [])
            .map(i => ({ code: String(i.issueCode), dateFrom: i.dateFrom, dateTo: i.dateTo }))
        }
      }
    } catch (err) {
      console.warn(`[Content API] Failed to fetch hotel details ${codeStr}:`, err.message)
      logHotelbeds403(err)
    }
  }

  // If no live content was found/configured, return mock
  if (!hotelData) {
    hotelData = getFallbackHotelData(codeStr)
  }

  await hotelCache.set(codeStr, hotelData)
  return hotelData
}

/**
 * Warm hotel content cache for a list of hotel codes in batches to avoid individual content API requests.
 */
async function warmHotelCache(hotelCodes) {
  if (!hotelCodes || !Array.isArray(hotelCodes) || hotelCodes.length === 0) return

  const uniqueCodes = [...new Set(hotelCodes.map(c => String(c).trim()))].filter(Boolean)
  const missingCodes = []

  for (const code of uniqueCodes) {
    try {
      const cached = await hotelCache.get(code)
      if (!cached) {
        missingCodes.push(code)
      }
    } catch (e) {
      missingCodes.push(code)
    }
  }

  if (missingCodes.length === 0) {
    console.log(`[Hotel Cache] Batch check: all ${uniqueCodes.length} hotels are already in cache.`)
    return
  }

  console.log(`[Hotel Cache] Cache miss for ${missingCodes.length} hotels: ${missingCodes.join(', ')}. Warming cache...`)
  const isConfigured = process.env.HOTELS_HB_API_KEY && process.env.HOTELS_HB_API_KEY !== 'your_hotelbeds_api_key'
  
  if (!isConfigured) {
    console.log(`[Hotel Cache] API not configured. Preemptively caching fallback data...`)
    for (const codeStr of missingCodes) {
      try {
        await hotelCache.set(codeStr, getFallbackHotelData(codeStr))
      } catch (cacheErr) {}
    }
    return
  }

  // Fetch in chunks of up to 20 hotels to stay within Hotelbeds URL and payload limits
  const chunkSize = 20
  for (let i = 0; i < missingCodes.length; i += chunkSize) {
    const chunk = missingCodes.slice(i, i + chunkSize)
    try {
      console.log(`[Hotel Cache] Fetching batch from Content API: ${chunk.join(',')}`)
      const response = await axios.get(`${HOTELBEDS_CONTENT_URL}/hotels`, {
        params: {
          codes: chunk.join(','),
          fields: 'all',
          language: 'ENG',
          from: 1,
          to: chunk.length
        },
        headers: getHeaders(),
        timeout: 20000
      })

      const rawHotels = response.data?.hotels || []
      console.log(`[Hotel Cache] Batch retrieved content for ${rawHotels.length} hotel(s) from API.`)

      const rawHotelsMap = new Map(rawHotels.map(h => [String(h.code), h]))

      for (const codeStr of chunk) {
        const rawHotel = rawHotelsMap.get(codeStr)
        let hotelData = null

        if (rawHotel) {
          // Resolve facility names — try catalogCache first to avoid sub-request storm
          const facilities = await Promise.all((rawHotel.facilities || []).map(async f => {
            let name = f.facilityName?.content || ''
            if (!name) {
              try {
                // Try catalog with composite key first
                const catItem = await getCatalogItem('facilities', f.facilityCode, f.facilityGroupCode)
                if (catItem && catItem.name) {
                  name = catItem.name
                } else {
                  // Direct API fetch with both codes as params
                  const fetched = await fetchFacilityName(f.facilityCode, f.facilityGroupCode)
                  name = fetched || ''
                }
              } catch (err) {
                console.warn(`[Facilities] Name lookup failed for ${f.facilityGroupCode}:${f.facilityCode}:`, err.message)
              }
            }
            return {
              code: String(f.facilityCode),
              groupCode: String(f.facilityGroupCode),
              name,
              hotelMandatory: f.hotelMandatory || false,
              voucher: f.voucher || false
            }
          }))

          hotelData = {
            code:          rawHotel.code,
            name:          rawHotel.name?.content || '',
            description:   rawHotel.description?.content || '',
            address:       rawHotel.address?.content || '',
            city:          rawHotel.city?.content || '',
            postalCode:    rawHotel.postalCode || '',
            countryCode:   rawHotel.countryCode || '',
            phone:         rawHotel.phones?.[0]?.phoneNumber || '',
            email:         rawHotel.email || '',
            web:           rawHotel.web || '',
            latitude:      rawHotel.coordinates?.latitude,
            longitude:     rawHotel.coordinates?.longitude,
            checkInTime:   rawHotel.checkIn?.minTime || '14:00',
            checkOutTime:  rawHotel.checkOut?.maxTime || '12:00',
            categoryCode:  rawHotel.categoryCode || '',
            categoryName:  rawHotel.categoryName?.content || '',
            images: (rawHotel.images || [])
              .map(img => ({
                path: img.path,
                url:         `https://photos.hotelbeds.com/giata/${img.path}`,
                urlSmall:    `https://photos.hotelbeds.com/giata/small/${img.path}`,
                urlMedium:   `https://photos.hotelbeds.com/giata/medium/${img.path}`,
                urlBigger:   `https://photos.hotelbeds.com/giata/bigger/${img.path}`,
                urlXl:       `https://photos.hotelbeds.com/giata/xl/${img.path}`,
                urlXxl:      `https://photos.hotelbeds.com/giata/xxl/${img.path}`,
                urlOriginal: `https://photos.hotelbeds.com/giata/original/${img.path}`,
                order: img.order,
                visualOrder: img.visualOrder,
                type: img.imageTypeCode
              }))
              .sort((a, b) => (a.visualOrder || 999) - (b.visualOrder || 999)),
            facilities,
            issues: (rawHotel.issues || [])
              .map(iss => ({ code: String(iss.issueCode), dateFrom: iss.dateFrom, dateTo: iss.dateTo }))
          }
        } else {
          // Preemptively cache fallback data for this missing code
          hotelData = getFallbackHotelData(codeStr)
        }

        if (hotelData) {
          await hotelCache.set(codeStr, hotelData)
        }
      }
    } catch (err) {
      console.warn(`[Hotel Cache] Failed to warm batch ${chunk.join(',')}:`, err.message)
      logHotelbeds403(err)

      // Caching fallback data preemptively for all hotels in this chunk so we avoid further sub-requests
      console.log(`[Hotel Cache] Preemptively caching fallback data for chunk [${chunk.join(',')}] to avoid API storm...`)
      for (const codeStr of chunk) {
        try {
          const fallbackData = getFallbackHotelData(codeStr)
          await hotelCache.set(codeStr, fallbackData)
        } catch (cacheErr) {
          console.warn(`[Hotel Cache] Failed to write preemptive fallback to cache for code ${codeStr}:`, cacheErr.message)
        }
      }
    }
  }
}


/**
 * Builds complete rate comments text as required by Hotelbeds certification:
 * 1. Retrieve rate comment from Content API (or cache)
 * 2. Retrieve taxes
 * 3. Retrieve issues
 * 4. Retrieve mandatory facilities
 * 5. Concatenate all information
 */
async function resolveRateComments({ rateCommentsId, hotelCode, checkin, stayTaxes = [] }) {
  let comments = []

  // 1. Retrieve rate comment from Content API / cache
  if (rateCommentsId) {
    const parts = String(rateCommentsId).split('|')
    const commentCode = parts[1] // Extract code from 'incomingCode|commentCode|code'
    if (commentCode) {
      // Lazy load specific comment from API/Cache
      let commentRecord = await getCatalogItem('ratecomments', commentCode)
      if (!commentRecord) {
        // Query live specific comment if missing from broad load
        const raw = await fetchCatalogFromApi('ratecomments', { code: commentCode, date: checkin || new Date().toISOString().split('T')[0] })
        const normalized = normalizeCatalog('ratecomments', raw)
        commentRecord = normalized.find(c => c.code === commentCode)
      }
      if (commentRecord && commentRecord.name) {
        comments.push(`📝 Rate Terms:\n${commentRecord.name}`)
      } else {
        comments.push(`📝 Rate Terms:\nStandard booking terms. Non-refundable after cancellation window.`)
      }
    }
  } else {
    comments.push(`📝 Rate Terms:\nStandard reservation. Rates are locked upon successful validation.`)
  }

  // Fetch hotel details to access issues and facilities list
  const hotel = await getHotelContentDetails(hotelCode)

  // 2. Retrieve taxes
  if (stayTaxes && stayTaxes.length > 0) {
    const taxLines = stayTaxes.map(t => `- ${t.amount} ${t.currency} (${t.type || 'Local tax'}) payable directly at check-in`).join('\n')
    comments.push(`💵 Taxes & Local Fees:\n${taxLines}`)
  }

  // 3. Retrieve issues
  if (hotel?.issues && hotel.issues.length > 0) {
    const issueLines = []
    for (const issue of hotel.issues) {
      const issueDetails = await getCatalogItem('issues', issue.code)
      const label = issueDetails ? issueDetails.name : `Service Alert: ${issue.code}`
      issueLines.push(`- ${label} (Active: ${issue.dateFrom} to ${issue.dateTo})`)
    }
    if (issueLines.length > 0) {
      comments.push(`⚠️ Accommodation Alerts:\n${issueLines.join('\n')}`)
    }
  }

  // 4. Retrieve mandatory facilities
  const mandatoryFacs = (hotel?.facilities || []).filter(f => f.hotelMandatory || f.voucher)
  if (mandatoryFacs.length > 0) {
    const facLines = []
    for (const f of mandatoryFacs) {
      let name = f.name && !f.name.startsWith('Facility #') ? f.name : ''
      if (!name) {
        try {
          // Try composite key lookup first
          const catItem = await getCatalogItem('facilities', f.code, f.groupCode)
          if (catItem && catItem.name) {
            name = catItem.name
          } else {
            // Direct API fetch — most reliable method
            const fetched = await fetchFacilityName(f.code, f.groupCode)
            name = fetched || ''
          }
        } catch (catErr) {
          console.warn(`[Facilities] Could not resolve mandatory facility ${f.groupCode}:${f.code}`)
        }
      }
      // Only add if we have a real name (skip unresolved codes)
      if (name && !name.startsWith('Facility #')) {
        facLines.push(`- ${name}`)
      } else if (f.code) {
        // Last resort: show code but formatted nicely
        facLines.push(`- Property Service (code: ${f.groupCode || ''}/${f.code})`)
      }
    }
    if (facLines.length > 0) {
      comments.push(`ℹ️ Mandatory Hotel Services / Policies:\n${facLines.join('\n')}`)
    }
  }

  // 5. Concatenate all information
  return comments.join('\n\n')
}

module.exports = {
  getCatalogItem,
  getHotelContentDetails,
  resolveRateComments,
  warmHotelCache
}
