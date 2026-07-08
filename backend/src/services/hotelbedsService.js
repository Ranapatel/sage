/**
 * Hotelbeds Hotels API Service
 *
 * Credential isolation:
 *   This module reads ONLY HOTELS_HB_API_KEY and HOTELS_HB_SECRET.
 *   It NEVER touches ACTIVITIES_HB_API_KEY, ACTIVITIES_HB_SECRET, or any activities credential.
 */

const axios  = require('axios')
const crypto = require('crypto')
const { getHotelContentDetails, resolveRateComments, warmHotelCache } = require('./contentCacheService')
const { withRetry } = require('./retryService')

function logHotelbeds403(err) {
  if (err.response && err.response.status === 403) {
    const reqConfig = err.config || {}
    const cleanHeaders = { ...(reqConfig.headers || {}) }
    delete cleanHeaders['Api-key']
    delete cleanHeaders['X-Signature']
    delete cleanHeaders['api-key']
    delete cleanHeaders['x-signature']

    console.error('--- Hotelbeds Hotels API 403 Forbidden ---')
    console.error('Request URL:', reqConfig.url || `${reqConfig.baseURL || ''}${reqConfig.url || ''}`)
    console.error('Request Headers (Excluding secrets):', JSON.stringify(cleanHeaders, null, 2))
    console.error('Response Status:', err.response.status)
    console.error('Response Body:', JSON.stringify(err.response.data, null, 2))
    console.error('------------------------------------------')
  }
}

// ── Hotels-only credential selectors ─────────────────────────────────────────
// These are the ONLY env vars this service is permitted to read for credentials.
// NEVER use ACTIVITIES_HB_* vars here.
const HOTELBEDS_API_URL     = process.env.HOTELS_HB_BASE_URL    || 'https://api.test.hotelbeds.com/hotel-api/1.0'
const HOTELBEDS_CONTENT_URL = process.env.HOTELS_HB_CONTENT_URL || 'https://api.test.hotelbeds.com/hotel-content-api/1.0'

const getApiKey    = () => process.env.HOTELS_HB_API_KEY || ''
const getApiSecret = () => process.env.HOTELS_HB_SECRET  || ''

const HOTEL_IMAGES = [
  'https://photos.hotelbeds.com/giata/00/004200/004200a_hb_ro_006.jpg',
  'https://photos.hotelbeds.com/giata/00/004200/004200a_hb_ro_001.jpg',
  'https://photos.hotelbeds.com/giata/00/004200/004200a_hb_ro_002.jpg',
  'https://photos.hotelbeds.com/giata/00/004200/004200a_hb_ro_003.jpg',
  'https://photos.hotelbeds.com/giata/00/004200/004200a_hb_ro_004.jpg',
]

// Built-in coordinates mapping to avoid external API dependencies where possible
const CITIES = [
  { name: 'mumbai', lat: 19.076, lon: 72.877 },
  { name: 'delhi', lat: 28.614, lon: 77.209 },
  { name: 'bengaluru', lat: 12.972, lon: 77.594 },
  { name: 'bangalore', lat: 12.972, lon: 77.594 },
  { name: 'hyderabad', lat: 17.385, lon: 78.487 },
  { name: 'chennai', lat: 13.083, lon: 80.270 },
  { name: 'kolkata', lat: 22.573, lon: 88.364 },
  { name: 'ahmedabad', lat: 23.033, lon: 72.620 },
  { name: 'pune', lat: 18.520, lon: 73.856 },
  { name: 'goa', lat: 15.300, lon: 74.124 },
  { name: 'jaipur', lat: 26.912, lon: 75.789 },
  { name: 'manali', lat: 32.241, lon: 77.186 },
  { name: 'shimla', lat: 31.105, lon: 77.173 },
  { name: 'london', lat: 51.507, lon: -0.128 },
  { name: 'paris', lat: 48.857, lon: 2.352 },
  { name: 'barcelona', lat: 41.385, lon: 2.173 },
  { name: 'rome', lat: 41.902, lon: 12.496 },
  { name: 'new york', lat: 40.713, lon: -74.006 },
  { name: 'tokyo', lat: 35.689, lon: 139.692 },
  { name: 'singapore', lat: 1.352, lon: 103.820 },
  { name: 'dubai', lat: 25.205, lon: 55.271 },
]

/**
 * Resolves latitude and longitude for a city name.
 */
async function getCoordinates(destination) {
  const q = (destination || '').toLowerCase().trim()
  
  // 1. Check built-in list first (fastest)
  const matched = CITIES.find(c => q.includes(c.name))
  if (matched) return { latitude: matched.lat, longitude: matched.lon }

  // 2. Call OSM Nominatim geocoder
  try {
    const response = await axios.get('https://nominatim.openstreetmap.org/search', {
      params: { q: destination.split(',')[0].trim(), format: 'json', limit: 1 },
      headers: { 'User-Agent': 'TripSage/2.0 (booking engine integration; contact: engineering@tripsage.ai)' },
      timeout: 4000
    })
    if (response.data && response.data.length > 0) {
      return {
        latitude: parseFloat(response.data[0].lat),
        longitude: parseFloat(response.data[0].lon)
      }
    }
  } catch (err) {
    console.warn('[Hotelbeds] Geocoding service failed, using fallback coordinates:', err.message)
  }

  // 3. Fallback to default (Delhi center)
  return { latitude: 28.6139, longitude: 77.2090 }
}

/**
 * Generate Hotelbeds API Signature (SHA-256 of APIKey + Secret + Timestamp)
 */
function getSignature(apiKey, apiSecret) {
  const timestamp = Math.floor(Date.now() / 1000)
  const hash = crypto.createHash('sha256')
  hash.update(apiKey + apiSecret + timestamp)
  return hash.digest('hex')
}

/**
 * Generates high-fidelity mock Hotelbeds results.
 */
function generateMockHotelbeds(destination, checkin, checkout, members, budget) {
  const destLabel = (destination || 'Destination').split(',')[0]
  const seed = destLabel.toLowerCase()
  
  // Per night INR rates: ₹1,500 - ₹9,000
  const maxPerNight = budget ? Math.min(budget * 0.40, 9000) : 7000
  
  // Stable random helper
  function seededRandom(s) {
    let h = 0
    for (let i = 0; i < s.length; i++) h = Math.imul(31, h) + s.charCodeAt(i) | 0
    h = Math.imul(h ^ (h >>> 16), 2246822507)
    return (Math.abs(h ^ (h >>> 13)) % 1000) / 1000
  }

  const HOTEL_NAMES = [
    'Hotelbeds Select Grand', 'Direct Bed Premium Resort', 'The OTA Standard Inn',
    'Hotelbeds Signature Suites', 'Global Bed Palace', 'Urban Stay by Hotelbeds'
  ]

  const AMENITIES = ['WiFi', 'Pool', 'Breakfast Included', 'Spa', 'Restaurant', 'Gym']

  return HOTEL_NAMES.map((name, i) => {
    const r = seededRandom(seed + i)
    const pricePerNight = Math.max(1200, Math.round((1500 + r * (maxPerNight - 1500)) / 100) * 100)
    const rating = parseFloat((3.8 + r * 1.2).toFixed(1))
    const code = 10000 + i

    const mockRooms = [
      {
        roomCode: 'DBL.ST',
        roomName: 'DOUBLE STANDARD',
        boardCode: 'BB',
        boardName: 'BED AND BREAKFAST',
        rateKey: `hbd_mock_rk_${code}_0_${checkin}_${checkout}_${members}`,
        rateType: 'BOOKABLE',
        netPrice: '129.39',
        currency: 'EUR',
        price: pricePerNight,
        allotment: 5,
        cancellationPolicy: 'Free cancellation until 11-Jun-2026',
        cancellationPolicies: [],
        adults: 2,
        children: 0,
        paymentType: 'SIMPLE'
      },
      {
        roomCode: 'TWN.ST',
        roomName: 'TWIN STANDARD',
        boardCode: 'RO',
        boardName: 'ROOM ONLY',
        rateKey: `hbd_mock_rk_${code}_1_${checkin}_${checkout}_${members}`,
        rateType: 'RECHECK',
        netPrice: '99.99',
        currency: 'EUR',
        price: Math.round(pricePerNight * 0.8),
        allotment: 0,
        cancellationPolicy: 'Non-refundable rate',
        cancellationPolicies: [],
        adults: 2,
        children: 0,
        paymentType: 'SPECIAL'
      }
    ]

    return {
      id: `hbd_${code}`,
      type: 'hotel',
      name: `${name} ${destLabel}`,
      price: pricePerNight,
      rating,
      image: HOTEL_IMAGES[i % HOTEL_IMAGES.length],
      location: `${destLabel} City Center`,
      bookingLink: '', // Direct OTA flow, no external booking redirects!
      score: parseFloat((0.6 + r * 0.4).toFixed(2)),
      liveStatus: 'Direct Booking Available',
      amenities: AMENITIES.slice(0, 3 + Math.floor(r * 3)),
      offers: i % 2 === 0 ? ['Best Direct Price', 'Free Room Upgrade'] : ['Immediate Confirmation'],
      source: 'hotelbeds',
      rateKey: `hbd_mock_rk_${code}_0_${checkin}_${checkout}_${members}`,
      rateType: 'BOOKABLE',
      rooms: mockRooms,
      image_path: null,
      gallery_paths: []
    }
  }).sort((a, b) => a.price - b.price)
}

/**
 * Calculate number of nights between two dates.
 */
function getNights(checkin, checkout) {
  if (!checkin || !checkout) return 1
  const ci = new Date(checkin)
  const co = new Date(checkout)
  const diff = Math.max(1, Math.round((co - ci) / (1000 * 60 * 60 * 24)))
  return diff
}

/**
 * Build a Hotelbeds image URL from their CDN path.
 * Hotelbeds returns relative paths like "hotel/d/h123/456/image.jpg"
 * Full URL: http://photos.hotelbeds.com/giata/{path}
 */
function buildHotelbedsImageUrl(images) {
  if (!images || images.length === 0) return null
  // Prefer GEN (general exterior) then HAB (room) then first available
  const img = images.find(i => i.imageTypeCode === 'GEN') ||
               images.find(i => i.imageTypeCode === 'HAB') ||
               images[0]
  if (img && img.path && img.path !== '00/004200/004200a_hb_ro_006.jpg') {
    return `https://photos.hotelbeds.com/giata/bigger/${img.path}`
  }
  return null
}

function formatDateDDMMMYYYY(dateStr) {
  if (!dateStr) return 'arrival'
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return 'arrival'
  const day = String(date.getDate()).padStart(2, '0')
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

function getFreeCancellationStatement(policies) {
  if (!policies || policies.length === 0) {
    return 'Free cancellation available'
  }
  const freePolicy = policies.find(p => parseFloat(p.amount || 0) > 0)
  if (freePolicy && freePolicy.from) {
    return `Free cancellation until ${formatDateDDMMMYYYY(freePolicy.from)}`
  }
  return 'Free cancellation available'
}

/**
 * Searches hotels via Hotelbeds Availability API.
 * Returns at least 6 hotel options by supplementing with mock data if needed.
 */
async function searchHotels({ destination, checkin, checkout, members = 2, budget, rooms = 1, adults = 2, children = 0 }) {
  const apiKey = getApiKey()
  const apiSecret = getApiSecret()
  const MIN_RESULTS = 6

  const isConfigured = apiKey && apiKey !== 'your_hotelbeds_api_key' && apiSecret && apiSecret !== 'your_hotelbeds_api_secret'

  if (!isConfigured) {
    console.log(`[Hotelbeds] Keys not configured or default placeholders used. Serving mock Hotelbeds data.`)
    const data = generateMockHotelbeds(destination, checkin, checkout, members, budget)
    return { success: true, data, meta: { source: 'hotelbeds-mock' } }
  }

  const nights = getNights(checkin, checkout)
  let liveHotels = []
  let liveSearchError = null

  try {
    const coords = await getCoordinates(destination)
    const sig = getSignature(apiKey, apiSecret)

    console.log(`[Hotelbeds] Querying live availability for "${destination}" at coordinates:`, coords, `(${nights} nights), occupants: rooms=${rooms}, adults=${adults}, children=${children}`)

    const occupancies = []
    const roomsCount = Number(rooms) || 1
    const totalAdults = Number(adults) || 2
    const totalChildren = Number(children) || 0

    // Distribute adults and children evenly across the requested number of rooms
    const baseAdultsPerRoom = Math.floor(totalAdults / roomsCount)
    const extraAdults = totalAdults % roomsCount

    const baseChildrenPerRoom = Math.floor(totalChildren / roomsCount)
    const extraChildren = totalChildren % roomsCount

    for (let r = 0; r < roomsCount; r++) {
      const roomAdults = baseAdultsPerRoom + (r < extraAdults ? 1 : 0)
      const roomChildren = baseChildrenPerRoom + (r < extraChildren ? 1 : 0)

      if (roomAdults > 0) {
        occupancies.push({
          rooms: 1,
          adults: roomAdults,
          children: roomChildren,
          paxes: [
            ...Array.from({ length: roomAdults }, () => ({ type: 'AD' })),
            ...Array.from({ length: roomChildren }, () => ({ type: 'CH', age: 7 }))
          ]
        })
      }
    }

    const response = await withRetry(() => axios.post(`${HOTELBEDS_API_URL}/hotels`, {
      stay: {
        checkIn: checkin,
        checkOut: checkout
      },
      occupancies,
      geolocation: {
        latitude: coords.latitude,
        longitude: coords.longitude,
        radius: 50,
        unit: 'km'
      },
      filter: {
        maxHotels: 20,
        maxRooms: 5
      }
    }, {
      headers: {
        'Api-key':         apiKey,
        'X-Signature':     sig,
        'Accept':          'application/json',
        'Content-Type':    'application/json',
        'Accept-Encoding': 'gzip'
      },
      timeout: 15000
    }), { maxAttempts: 3 })

    const hbdHotelsRaw = response.data?.hotels?.hotels || []
    const seenCodes = new Set()
    const hbdHotels = hbdHotelsRaw.filter(h => {
      if (!h.code) return false
      const codeStr = String(h.code)
      if (seenCodes.has(codeStr)) return false
      seenCodes.add(codeStr)
      return true
    })
    console.log(`[Hotelbeds] Live API returned ${hbdHotels.length} unique hotels (out of ${hbdHotelsRaw.length})`)

    // Warm the hotel content cache in batch to avoid individual content API requests
    const hotelCodes = hbdHotels.map(h => h.code).filter(Boolean)
    await warmHotelCache(hotelCodes).catch(err => {
      console.warn('[Hotelbeds] Failed to warm hotel content cache:', err.message)
    })

    liveHotels = await Promise.all(hbdHotels.map(async (h, i) => {
      // Find all room options and pick cheapest
      let cheapestRate = null
      let cheapestRoom = null
      const allRooms = []
      const parsedRoomsList = []
      
      if (h.rooms && h.rooms.length > 0) {
        h.rooms.forEach(r => {
          if (r.rates && r.rates.length > 0) {
            r.rates.forEach(rt => {
              const rateVal = parseFloat(rt.net)
              // Sanity check: reject rates > 10,000 EUR/USD as corrupted data
              // Hotelbeds test environment occasionally returns malformed large values
              const MAX_SANE_NET = 10000
              if (isNaN(rateVal) || rateVal <= 0 || rateVal > MAX_SANE_NET) {
                console.warn(`[Hotelbeds] Skipping corrupted rate: hotel=${h.code}, room=${r.code}, net=${rt.net} (exceeds ${MAX_SANE_NET} cap)`)
                return
              }
              allRooms.push({ room: r, rate: rt, price: rateVal })
              
              // Debug logging requirement
              console.log(`[Hotelbeds Debug] hotel.code=${h.code}, hotel.name="${h.name}", room.code=${r.code}, room.name="${r.name}", rate.rateKey=${rt.rateKey}, rate.rateType=${rt.rateType}, rate.allotment=${rt.allotment}, rate.net=${rt.net}`)

              let rateTotalPrice = rateVal
              const rateCurrency = rt.currency || 'EUR'
              if (rateCurrency === 'EUR') {
                rateTotalPrice = Math.round(rateTotalPrice * 90)
              } else if (rateCurrency === 'USD') {
                rateTotalPrice = Math.round(rateTotalPrice * 83)
              }
              const ratePricePerNight = Math.round(rateTotalPrice / nights)

              parsedRoomsList.push({
                roomCode: r.code,
                roomName: r.name,
                boardCode: rt.boardCode,
                boardName: rt.boardName,
                rateKey: rt.rateKey,
                rateType: rt.rateType,
                rateCommentsId: rt.rateCommentsId || null,  // Required for rate comments
                netPrice: rt.net,
                currency: rateCurrency,
                price: ratePricePerNight,
                allotment: rt.allotment !== undefined ? rt.allotment : 0,
                cancellationPolicy: getFreeCancellationStatement(rt.cancellationPolicies),
                cancellationPolicies: rt.cancellationPolicies || [],
                adults: rt.adults || 2,
                children: rt.children || 0,
                paymentType: rt.paymentType
              })

              if (!cheapestRate || rateVal < parseFloat(cheapestRate.net)) {
                cheapestRate = rt
                cheapestRoom = r
              }
            })
          }
        })
      }

      // Convert rate to INR. Hotelbeds test API returns total stay price.
      // We compute per-night by dividing by number of nights.
      let totalPrice = cheapestRate ? parseFloat(cheapestRate.net) : 2500
      const currency = cheapestRate?.currency || 'EUR'
      if (currency === 'EUR') {
        totalPrice = Math.round(totalPrice * 90)
      } else if (currency === 'USD') {
        totalPrice = Math.round(totalPrice * 83)
      }
      const pricePerNight = Math.round(totalPrice / nights)

      // Star rating from category
      let starRating = 4.0
      if (h.categoryName) {
        const matches = h.categoryName.match(/\d+/)
        if (matches) starRating = Math.min(5, parseFloat(matches[0]))
      } else if (h.categoryCode) {
        const catNum = parseInt(h.categoryCode)
        if (!isNaN(catNum)) starRating = Math.min(5, catNum)
      }

      // Only use Hotelbeds CDN images. Never use Unsplash or external placeholders.
      const cached = await getHotelContentDetails(h.code).catch(() => null)
      // Build primary image from availability response (h.images) first, then Content API cache
      let hbdImage = buildHotelbedsImageUrl(h.images) ||
        (cached?.images?.[0]?.path && cached.images[0].path !== '00/004200/004200a_hb_ro_006.jpg'
          ? `https://photos.hotelbeds.com/giata/bigger/${cached.images[0].path}`
          : null)

      // Build gallery using Content API images (all valid paths, HTTPS, bigger size)
      let gallery = (cached?.images || []).filter(img =>
        img.path && img.path !== '00/004200/004200a_hb_ro_006.jpg'
      ).map(img => `https://photos.hotelbeds.com/giata/bigger/${img.path}`)

      // Collect amenities from available rooms & cached facilities list
      const amenities = []
      if (cheapestRoom?.name) amenities.push(cheapestRoom.name)
      if (cached?.facilities?.length) {
        cached.facilities.slice(0, 5).forEach(f => {
          if (f.name && !amenities.includes(f.name)) amenities.push(f.name)
        })
      }
      if (h.rooms && h.rooms.length > 1) {
        const otherRooms = h.rooms.filter(r => r !== cheapestRoom).slice(0, 2)
        otherRooms.forEach(r => { if (r.name && !amenities.includes(r.name)) amenities.push(r.name) })
      }

      // Board name (meal plan)
      const offers = []
      if (cheapestRate?.boardName) offers.push(cheapestRate.boardName)
      if (allRooms.length > 3) offers.push(`${allRooms.length} room options`)

      // Image paths — only Hotelbeds Giata relative paths (never external URLs)
      let imagePath = null
      const rawPaths = [
        ...(h.images?.map(img => img.path) || []),
        ...(cached?.images?.map(img => img.path) || [])
      ]
      imagePath = rawPaths.find(p => p && p !== '00/004200/004200a_hb_ro_006.jpg') || null

      let galleryPaths = rawPaths.filter(p => p && p !== '00/004200/004200a_hb_ro_006.jpg')
      // Deduplicate
      galleryPaths = [...new Set(galleryPaths)]

      // If we don't have a valid image from Content API or availability, assign a fallback Hotelbeds image
      if (!hbdImage) {
        let hash = 0
        const str = String(h.code || h.name || i)
        for (let j = 0; j < str.length; j++) {
          hash = str.charCodeAt(j) + ((hash << 5) - hash)
        }
        const fallbackIndex = Math.abs(hash) % 4 + 1 // 1 to 4
        const relPath = `00/004200/004200a_hb_ro_00${fallbackIndex}.jpg`
        hbdImage = `https://photos.hotelbeds.com/giata/bigger/${relPath}`
        imagePath = relPath
        galleryPaths = [relPath]
        gallery = [hbdImage]
      }

      return {
        id: `hbd_${h.code}`,
        type: 'hotel',
        name: h.name,
        price: pricePerNight,
        totalPrice,
        nights,
        rating: starRating,
        // image: HTTPS Hotelbeds CDN URL or null (never Unsplash)
        image: hbdImage || null,
        images: gallery.length > 0 ? gallery : (hbdImage ? [hbdImage] : []),
        image_path: imagePath,
        gallery_paths: galleryPaths,
        location: h.zoneName || h.destinationName || destination.split(',')[0],
        bookingLink: '', // Direct OTA booking via rateKey
        score: Math.min(1, starRating / 5),
        liveStatus: 'Direct Booking Available',
        amenities: amenities.length > 0 ? amenities : ['WiFi', 'Air Conditioning'],
        offers: offers.length > 0 ? offers : ['Room Only'],
        source: 'hotelbeds',
        rateKey: cheapestRate ? cheapestRate.rateKey : null,
        rateType: cheapestRate ? cheapestRate.rateType : 'BOOKABLE',
        currency: currency,
        categoryName: h.categoryName || '',
        rooms: parsedRoomsList   // All rooms from Availability API — no filtering
      }
    }))
    liveHotels = liveHotels.sort((a, b) => a.price - b.price)

  } catch (err) {
    console.error('[Hotelbeds] Live search failed:', err.response?.data || err.message)
    logHotelbeds403(err)
    liveSearchError = err.message
  }

  // If live keys are configured, return exactly the live results (or error if call failed)
  // We do NOT mix in or supplement with mock hotels when keys are present.
  if (isConfigured) {
    if (liveSearchError && liveHotels.length === 0) {
      return {
        success: false,
        data: [],
        error: `Hotelbeds API search failed: ${liveSearchError}`,
        meta: { source: 'hotelbeds-live-error' }
      }
    }
    return {
      success: true,
      data: liveHotels,
      meta: { source: 'hotelbeds-live', liveCount: liveHotels.length }
    }
  }

  // Supplement with mock Hotelbeds-branded results if we got fewer than MIN_RESULTS
  if (liveHotels.length < MIN_RESULTS) {
    const mockCount = MIN_RESULTS - liveHotels.length
    console.log(`[Hotelbeds] Live results: ${liveHotels.length}, supplementing with ${mockCount} mock hotels`)
    const allMocks = generateMockHotelbeds(destination, checkin, checkout, members, budget)
    // Only take what we need and avoid name collisions
    const liveNames = new Set(liveHotels.map(h => h.name.toLowerCase()))
    const supplementMocks = allMocks
      .filter(m => !liveNames.has(m.name.toLowerCase()))
      .slice(0, mockCount)

    const combined = [...liveHotels, ...supplementMocks]
    const source = liveHotels.length > 0 ? 'hotelbeds-live+supplemented' : 'hotelbeds-mock'
    return {
      success: true,
      data: combined,
      meta: {
        source,
        liveCount: liveHotels.length,
        mockCount: supplementMocks.length,
        total: combined.length
      }
    }
  }

  return { success: true, data: liveHotels, meta: { source: 'hotelbeds-live', liveCount: liveHotels.length } }
}

/**
 * Confirms a direct room booking on Hotelbeds.
 * Supports full pax data (holder + additional guests) per Hotelbeds certification requirements.
 *
 * @param {object} params
 * @param {string} params.rateKey        - Hotelbeds rate key
 * @param {object} params.holder         - Lead guest { firstName, lastName } or { name }
 * @param {object[]} [params.guests]     - Additional guests [{ firstName, lastName }]
 * @param {object} [params.contact]      - Contact { email, phone, remark }
 * @param {object} [params.userDetails]  - Legacy fallback
 */
async function bookHotel({ rateKey, holder, guests = [], contact = {}, userDetails }) {
  const apiKey    = getApiKey()
  const apiSecret = getApiSecret()
  const isConfigured = apiKey && apiKey !== 'your_hotelbeds_api_key' && apiSecret && apiSecret !== 'your_hotelbeds_api_secret'
  const clientReference = `TS-${Date.now()}`

  // Resolve lead guest name (supports firstName/lastName or full name fallback)
  const firstName = holder?.firstName || (holder?.name || userDetails?.name || 'Guest').trim().split(/\s+/)[0]
  const lastName  = holder?.lastName  || (() => {
    const parts = (holder?.name || userDetails?.name || 'Guest Traveler').trim().split(/\s+/)
    return parts.slice(1).join(' ') || 'Traveler'
  })()

  // Mock path for unconfigured API or mock rate keys
  if (!isConfigured || String(rateKey).startsWith('hbd_mock_rk')) {
    console.log('[Hotelbeds] Booking using mock fallback.')
    const ref = `HBD-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    return {
      success: true,
      bookingReference: ref,
      clientReference,
      status: 'CONFIRMED',
      holder: { name: firstName, surname: lastName },
      hotelCode: userDetails?.hotelCode || null,
      hotelName: userDetails?.hotelName || 'TripSage Partner Hotel',
      hotelAddress: userDetails?.hotelAddress || '',
      hotelPhone: '',
      checkIn: userDetails?.checkIn || null,
      checkOut: userDetails?.checkOut || null,
      roomType: userDetails?.roomType || 'Standard Room',
      boardType: userDetails?.boardType || 'Room Only',
      totalPrice: userDetails?.totalPrice || 4500,
      currency: 'INR',
      originalCurrency: 'EUR',
      originalTotalPrice: '54.00',
      bookingDate: new Date().toISOString(),
      cancellationPolicies: [
        { amount: '0.00', from: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0] }
      ],
      guests: [
        { name: `${firstName} ${lastName}`, type: 'AD', role: 'Lead' },
        ...guests.filter(g => g?.firstName).map(g => ({ name: `${g.firstName} ${g.lastName || ''}`.trim(), type: 'AD', role: 'Guest' }))
      ],
    }
  }

  try {
    const sig = getSignature(apiKey, apiSecret)
    console.log('[Hotelbeds] Posting live booking for rateKey...')

    // Build rooms payload with lead guest pax + additional guests
    const paxList = [
      { roomId: 1, type: 'AD', name: firstName, surname: lastName },
      ...guests
        .filter(g => g?.firstName && g?.lastName)
        .map((g, i) => ({ roomId: 1, type: 'AD', name: g.firstName.trim(), surname: g.lastName.trim() }))
    ]

    const response = await withRetry(() => axios.post(`${HOTELBEDS_API_URL}/bookings`, {
      holder: { name: firstName, surname: lastName },
      rooms: [{ rateKey, pax: paxList }],
      clientReference,
      remark: contact?.remark || `TripSage booking${contact?.email ? ` - ${contact.email}` : ''}`,
      tolerance: 2,  // Accept up to 2 units price difference (required for RECHECK rates)
    }, {
      headers: {
        'Api-key':         apiKey,
        'X-Signature':     sig,
        'Accept':          'application/json',
        'Content-Type':    'application/json',
        'Accept-Encoding': 'gzip'
      },
      timeout: 15000
    }), { maxAttempts: 3 })

    const booking = response.data?.booking
    if (!booking) throw new Error('Invalid booking response received from Hotelbeds')

    const hotelRoom = booking.hotel?.rooms?.[0]
    const hotelRate = hotelRoom?.rates?.[0]
    const totalEur  = parseFloat(booking.totalNet || booking.totalSellingRate || 0)
    const totalInr  = Math.round(totalEur * 90)

    console.log(`[Hotelbeds] ✅ Booking confirmed: ${booking.reference} status=${booking.status}`)

    return {
      success: true,
      bookingReference: booking.reference,
      clientReference: booking.clientReference,
      status: booking.status || 'CONFIRMED',
      holder: booking.holder,
      hotelCode: booking.hotel?.code,
      hotelName: booking.hotel?.name || 'Hotelbeds Partner Stay',
      hotelAddress: booking.hotel?.address?.content || '',
      hotelPhone: booking.hotel?.phones?.[0]?.phoneNumber || '',
      checkIn: booking.hotel?.checkIn,
      checkOut: booking.hotel?.checkOut,
      roomType: hotelRoom?.name || 'Standard Room',
      boardType: hotelRate?.boardName || 'Room Only',
      totalPrice: totalInr,
      currency: 'INR',
      originalCurrency: booking.currency || 'EUR',
      originalTotalPrice: booking.totalNet || booking.totalSellingRate,
      bookingDate: new Date().toISOString(),
      cancellationPolicies: hotelRate?.cancellationPolicies || [],
      guests: [
        { name: `${firstName} ${lastName}`, type: 'AD', role: 'Lead' },
        ...guests.filter(g => g?.firstName).map(g => ({ name: `${g.firstName} ${g.lastName || ''}`.trim(), type: 'AD', role: 'Guest' }))
      ],
    }
  } catch (err) {
    console.error('[Hotelbeds] Live booking failed:', err.response?.data || err.message)
    logHotelbeds403(err)
    throw new Error(err.response?.data?.error?.message || 'Hotelbeds Booking Service temporarily unavailable.')
  }
}

/**
 * Validates a rate key via the Hotelbeds CheckRate API.
 * REQUIRED for rateType=RECHECK rates before calling the Booking API.
 *
 * @param {string} rateKey - The rate key to validate
 * @returns {Promise<object>} Updated rate with rateType, net, cancellationPolicies
 */
async function checkRate(rateKey, rateType, hotelCode, originalPrice, rateCommentsId) {
  const apiKey    = getApiKey()
  const apiSecret = getApiSecret()
  const isConfigured = apiKey && apiKey !== 'your_hotelbeds_api_key' && apiSecret && apiSecret !== 'your_hotelbeds_api_secret'

  // Mock path for unconfigured API or mock rate keys
  if (!isConfigured || String(rateKey).startsWith('hbd_mock_rk')) {
    console.log('[CheckRate] Using mock response (API not configured or mock rateKey)')
    const mockComments = await resolveRateComments({
      rateCommentsId: rateCommentsId || '256|24524|3',
      hotelCode: hotelCode || '10000',
      checkin: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
      stayTaxes: [{ amount: '15.00', currency: 'EUR', type: 'LOCAL' }]
    })
    return {
      success: true,
      rateType: 'BOOKABLE',
      rateKey,
      net: '150.00',
      currency: 'EUR',
      netInr: 13500,
      sellingRate: '165.00',
      hotelMandatory: false,
      packaging: false,
      boardCode: 'BB',
      boardName: 'BED AND BREAKFAST',
      cancellationPolicies: [
        { amount: '0.00', from: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0] }
      ],
      rateComments: mockComments,
      priceChanged: false,
    }
  }

  try {
    const sig = getSignature(apiKey, apiSecret)
    console.log('[CheckRate] Calling Hotelbeds CheckRate API...')

    const response = await withRetry(() => axios.post(`${HOTELBEDS_API_URL}/checkrates`, {
      rooms: [{ rateKey }]
    }, {
      headers: {
        'Api-key':         apiKey,
        'X-Signature':     sig,
        'Accept':          'application/json',
        'Content-Type':    'application/json',
        'Accept-Encoding': 'gzip'
      },
      timeout: 15000
    }), { maxAttempts: 3 })

    const hotel = response.data?.hotel
    const room  = hotel?.rooms?.[0]
    const rate  = room?.rates?.[0]

    if (!rate) throw new Error('CheckRate response missing rate data')

    const netEur = parseFloat(rate.net || '0')
    const netInr = Math.round(netEur * 90)

    console.log(`[CheckRate] ✅ rateType=${rate.rateType} net=${rate.net} ${hotel?.currency || 'EUR'}`)

    const rateCommentsText = await resolveRateComments({
      rateCommentsId: rate.rateCommentsId || rateCommentsId || null,
      hotelCode: hotel.code,
      checkin: hotel.checkIn,
      stayTaxes: rate.taxes?.taxes || []
    })

    return {
      success: true,
      rateType: rate.rateType || 'BOOKABLE',
      rateKey: rate.rateKey || rateKey,
      net: rate.net,
      currency: hotel?.currency || rate.currency || 'EUR',
      netInr,
      sellingRate: rate.sellingRate,
      hotelMandatory: rate.hotelMandatory || false,
      packaging: rate.packaging || false,
      boardCode: rate.boardCode,
      boardName: rate.boardName,
      cancellationPolicies: rate.cancellationPolicies || [],
      rateComments: rateCommentsText,
      priceChanged: false, // consumer compares with original price
    }
  } catch (err) {
    console.error('[CheckRate] Failed:', err.response?.data || err.message)
    logHotelbeds403(err)
    throw new Error(err.response?.data?.error?.message || 'CheckRate service temporarily unavailable.')
  }
}

/**
 * Fetches hotel content (images, facilities, description) from the Hotelbeds Content API.
 * Images are served from: http://photos.hotelbeds.com/giata/{path}
 *
 * @param {string|string[]} hotelCodes - Hotelbeds hotel code(s)
 * @returns {Promise<object>} Content data including CDN images and facilities
 */
async function getHotelContent(hotelCodes) {
  const apiKey    = getApiKey()
  const apiSecret = getApiSecret()
  const isConfigured = apiKey && apiKey !== 'your_hotelbeds_api_key' && apiSecret && apiSecret !== 'your_hotelbeds_api_secret'

  const codes      = Array.isArray(hotelCodes) ? hotelCodes : [hotelCodes]
  const validCodes = codes.filter(c => c && !String(c).startsWith('hbd_10'))

  if (!isConfigured || validCodes.length === 0) {
    console.log('[HotelContent] API not configured or mock codes — returning empty content')
    return { success: true, data: [] }
  }

  try {
    const sig = getSignature(apiKey, apiSecret)
    console.log(`[HotelContent] Fetching content for: ${validCodes.join(',')}`)

    const response = await withRetry(() => axios.get(`${HOTELBEDS_CONTENT_URL}/hotels`, {
      params: { codes: validCodes.join(','), fields: 'all', language: 'ENG', from: 1, to: validCodes.length, useSecondaryLanguage: false },
      headers: {
        'Api-key':         apiKey,
        'X-Signature':     sig,
        'Accept':          'application/json',
        'Accept-Encoding': 'gzip'
      },
      timeout: 20000
    }), { maxAttempts: 3 })

    const hotels = response.data?.hotels || []
    console.log(`[HotelContent] ✅ Content returned for ${hotels.length} hotel(s)`)

    const normalized = hotels.map(h => ({
      code:          h.code,
      name:          h.name?.content || '',
      description:   h.description?.content || '',
      address:       h.address?.content || '',
      city:          h.city?.content || '',
      postalCode:    h.postalCode || '',
      countryCode:   h.countryCode || '',
      phone:         h.phones?.[0]?.phoneNumber || '',
      email:         h.email || '',
      web:           h.web || '',
      latitude:      h.coordinates?.latitude,
      longitude:     h.coordinates?.longitude,
      checkInTime:   h.checkIn?.minTime || '14:00',
      checkOutTime:  h.checkOut?.maxTime || '12:00',
      categoryCode:  h.categoryCode || '',
      categoryName:  h.categoryName?.content || '',
      images: (h.images || [])
        .filter(img => img.path && img.path !== '00/004200/004200a_hb_ro_006.jpg')
        .map(img => ({
          path: img.path,
          // HTTPS Hotelbeds CDN URLs in 7 sizes
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
        .sort((a, b) => (a.visualOrder || 999) - (b.visualOrder || 999))
        .slice(0, 20),    // Keep up to 20 images for gallery
      facilities: (h.facilities || [])
        .map(f => ({ code: f.facilityCode, groupCode: f.facilityGroupCode, order: f.order, name: f.facilityName?.content || '', hotelMandatory: f.hotelMandatory, voucher: f.voucher }))
        .filter(f => f.name)
        .slice(0, 30),   // More facilities for display
      issues: (h.issues || []).map(iss => ({
        code: iss.issueCode,
        type: iss.issueType,
        dateFrom: iss.dateFrom,
        dateTo: iss.dateTo,
        order: iss.order
      }))
    }))

    return { success: true, data: normalized }
  } catch (err) {
    console.error('[HotelContent] Failed:', err.response?.status, err.message)
    logHotelbeds403(err)
    return { success: false, data: [], error: err.message }
  }
}

/**
 * Retrieves a confirmed booking from the Hotelbeds Booking API.
 *
 * @param {string} reference - Hotelbeds booking reference
 * @returns {Promise<object>}
 */
async function getBookingDetails(reference) {
  const apiKey    = getApiKey()
  const apiSecret = getApiSecret()
  const isConfigured = apiKey && apiKey !== 'your_hotelbeds_api_key' && apiSecret && apiSecret !== 'your_hotelbeds_api_secret'

  if (!isConfigured || !reference || reference.startsWith('HBD-')) {
    return { success: false, error: 'Mock booking reference — live details unavailable' }
  }

  try {
    const sig = getSignature(apiKey, apiSecret)
    const response = await withRetry(() => axios.get(`${HOTELBEDS_API_URL}/bookings/${encodeURIComponent(reference)}`, {
      headers: {
        'Api-key':         apiKey,
        'X-Signature':     sig,
        'Accept':          'application/json',
        'Accept-Encoding': 'gzip'
      },
      timeout: 12000
    }), { maxAttempts: 3 })
    const booking = response.data?.booking
    if (!booking) throw new Error('Invalid booking response')
    return { success: true, data: booking }
  } catch (err) {
    console.error('[BookingDetails] Failed:', err.response?.data || err.message)
    logHotelbeds403(err)
    return { success: false, error: err.message }
  }
}

/**
 * Cancels a confirmed booking via the Hotelbeds Booking API.
 *
 * @param {string} reference - Hotelbeds booking reference
 * @returns {Promise<object>} Cancellation result
 */
async function cancelBooking(reference) {
  const apiKey    = getApiKey()
  const apiSecret = getApiSecret()
  const isConfigured = apiKey && apiKey !== 'your_hotelbeds_api_key' && apiSecret && apiSecret !== 'your_hotelbeds_api_secret'

  if (!isConfigured || !reference || reference.startsWith('HBD-')) {
    console.log(`[Hotelbeds] Cancelling mock booking ${reference}`)
    return { success: true, status: 'CANCELLED', reference }
  }

  try {
    const sig = getSignature(apiKey, apiSecret)
    console.log(`[Hotelbeds] Sending cancel request for reference: ${reference}`)

    const response = await withRetry(() => axios.delete(`${HOTELBEDS_API_URL}/bookings/${encodeURIComponent(reference)}`, {
      params: { cancellationFlag: 'CANCELLATION' },
      headers: {
        'Api-key':         apiKey,
        'X-Signature':     sig,
        'Accept':          'application/json',
        'Accept-Encoding': 'gzip'
      },
      timeout: 15000
    }), { maxAttempts: 3 })

    const booking = response.data?.booking
    return {
      success: true,
      status: booking?.status || 'CANCELLED',
      reference: booking?.reference || reference,
      cancellationAmount: booking?.cancellationAmount || 0
    }
  } catch (err) {
    console.error('[Hotelbeds] Booking cancellation failed:', err.response?.data || err.message)
    logHotelbeds403(err)
    throw new Error(err.response?.data?.error?.message || 'Hotelbeds Cancellation Service temporarily unavailable.')
  }
}

module.exports = {
  searchHotels,
  bookHotel,
  checkRate,
  getHotelContent,
  getBookingDetails,
  cancelBooking,
  getCoordinates,
}
