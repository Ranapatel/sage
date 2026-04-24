const axios = require('axios')
const { cacheGet, cacheSet, generateCacheKey } = require('../../config/redis')
const { estimateFlightPrices } = require('./aiService')

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY
const RAPIDAPI_HOSTS = {
  flights: 'sky-scrapper.p.rapidapi.com',
  hotels: 'booking-com15.p.rapidapi.com',
}

// ─── Booking Links ────────────────────────────────────────────────────────────
// Use reliable deep-links to Skyscanner and Booking.com. No affiliate URLs.

function citySlug(str) {
  return (str || '').split(',')[0].trim().replace(/\s+/g, '-').toLowerCase()
}

function flightBookingLink(from, to, date) {
  const f = encodeURIComponent(citySlug(from).replace(/\s+/g, '-').toLowerCase())
  const t = encodeURIComponent(citySlug(to).replace(/\s+/g, '-').toLowerCase())
  const d = (date || '').replace(/-/g, '')
  const base = (f && t && d)
    ? `https://www.skyscanner.net/transport/flights/${f}/${t}/${d}/`
    : (f && t ? `https://www.skyscanner.net/transport/flights/${f}/${t}/` : 'https://www.skyscanner.net')
  return `${base}?adults=1&cabinclass=economy&ref=home&rtn=0`
}

function hotelBookingLink(destination, checkin, checkout, members) {
  // Use Agoda with affiliate cid=1962536 and destination search
  const dest = encodeURIComponent(citySlug(destination))
  let url = `https://www.agoda.com/search?city=${dest}&adults=${members || 2}&rooms=1&cid=1962536`
  if (checkin) url += `&checkIn=${checkin}`
  if (checkout) url += `&checkOut=${checkout}`
  return url
}

// ─── RapidAPI helpers ─────────────────────────────────────────────────────────

function rapidHeaders(host) {
  return { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': host }
}

// ─── Mock Data (Realistic INR prices) ────────────────────────────────────────

// ─── Airline Data with correct logos ─────────────────────────────────────────
const AIRLINES = [
  {
    name: 'IndiGo',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2a/IndiGo_Airlines_logo.svg/200px-IndiGo_Airlines_logo.svg.png',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80',
    color: '#1a1abb'
  },
  {
    name: 'Air India',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/9/9a/Air_India_Logo.svg/200px-Air_India_Logo.svg.png',
    image: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=600&q=80',
    color: '#c8102e'
  },
  {
    name: 'SpiceJet',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/3/3e/SpiceJet_logo.svg/200px-SpiceJet_logo.svg.png',
    image: 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=600&q=80',
    color: '#e8312f'
  },
  {
    name: 'Akasa Air',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/14/Akasa_Air_logo.svg/200px-Akasa_Air_logo.svg.png',
    image: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=600&q=80',
    color: '#ff6900'
  },
  {
    name: 'Vistara',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/1/16/Vistara_Logo.png/200px-Vistara_Logo.png',
    image: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80',
    color: '#6e2d8a'
  },
  // International carriers
  {
    name: 'Emirates',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/d0/Emirates_logo.svg/200px-Emirates_logo.svg.png',
    image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=600&q=80',
    color: '#c8102e'
  },
  {
    name: 'Qatar Airways',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/Qatar_Airways_Logo.svg/200px-Qatar_Airways_Logo.svg.png',
    image: 'https://images.unsplash.com/photo-1503146695848-73da81c33c3a?w=600&q=80',
    color: '#5c0632'
  },
  {
    name: 'Singapore Airlines',
    logo: 'https://upload.wikimedia.org/wikipedia/en/thumb/6/6b/Singapore_Airlines_Logo_2.svg/200px-Singapore_Airlines_Logo_2.svg.png',
    image: 'https://images.unsplash.com/photo-1457296898342-cdd24585d095?w=600&q=80',
    color: '#001489'
  },
]

const FLIGHT_IMAGES = [
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80',
  'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=600&q=80',
  'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=600&q=80',
  'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=600&q=80',
  'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80',
]

function seededRandom(seed) {
  let h = 0
  for (let i = 0; i < seed.length; i++) { h = ((h << 5) - h) + seed.charCodeAt(i); h |= 0 }
  return Math.abs(h) / 2147483647
}

function generateMockFlights(from, to, date, budget, aiFlights = null) {
  // Use a stable seed (city names only, not date) so prices don't change randomly
  const stableFrom = (from || 'any').split(',')[0].toLowerCase().trim()
  const stableTo = (to || 'any').split(',')[0].toLowerCase().trim()
  const seed = `${stableFrom}-${stableTo}`

  // If AI provided prices, use them as the base
  if (aiFlights && aiFlights.length > 0) {
    return aiFlights.map((af, i) => {
      const airline = AIRLINES.find(a => a.name.toLowerCase().includes(af.airline.toLowerCase())) || AIRLINES[i % AIRLINES.length]
      return {
        id: `fl_ai_${i}`,
        type: 'flight',
        name: `${af.airline} — ${(from || '').split(',')[0]} → ${(to || '').split(',')[0]}`,
        price: Math.max(1000, af.price),
        rating: parseFloat((3.8 + seededRandom(seed + i + 'r') * 1.2).toFixed(1)),
        duration: af.duration || '2h 30m',
        departure: af.departure || '08:00',
        arrival: af.arrival || '10:30',
        image: airline.image || FLIGHT_IMAGES[i % FLIGHT_IMAGES.length],
        logo: airline.logo,
        airlineColor: airline.color || '#00c27c',
        bookingLink: flightBookingLink(from, to, date),
        score: parseFloat((0.6 + seededRandom(seed + i + 's') * 0.4).toFixed(2)),
        liveStatus: i === 0 ? 'On Time' : 'Available',
        offers: i === 0 ? ['AI Estimated Price', 'Best Deal'] : [],
        source: 'ai-estimated',
        stops: af.stops || 0,
      }
    }).sort((a, b) => a.price - b.price)
  }

  // Realistic domestic INR prices: ₹2,500–₹12,000 | international: ₹15,000–₹55,000
  const isInternational = !(stableFrom.includes('india') || stableTo.includes('india') ||
    ['delhi','mumbai','bangalore','hyderabad','chennai','kolkata','pune','goa',
     'jaipur','ahmedabad','kochi','bali','bangkok','dubai'].some(c => stableFrom.includes(c) && stableTo.includes(c)))
  const priceMin = isInternational ? 14000 : 2500
  const priceRange = isInternational ? 40000 : 9000
  const maxPrice = budget ? Math.min(budget * 0.55, isInternational ? 80000 : 15000) : (isInternational ? 60000 : 12000)
  const basePrice = Math.max(priceMin, Math.round((seededRandom(seed) * priceRange + priceMin) / 100) * 100)

  return AIRLINES.map((airline, i) => {
    const r = seededRandom(seed + i)
    const price = Math.min(basePrice + Math.round((r * 4000 - 500) / 100) * 100, maxPrice)
    const depHour = 5 + Math.floor(r * 15)
    const durHr = isInternational ? 4 + Math.floor(seededRandom(seed + i + 'dur') * 8) : 1 + Math.floor(seededRandom(seed + i + 'dur') * 4)
    const durMin = Math.floor(seededRandom(seed + i + 'min') * 60)
    return {
      id: `fl_mock_${i}`,
      type: 'flight',
      name: `${airline.name} — ${(from || '').split(',')[0]} → ${(to || '').split(',')[0]}`,
      price: Math.max(price, priceMin),
      rating: parseFloat((3.5 + seededRandom(seed + i + 'r') * 1.5).toFixed(1)),
      duration: `${durHr}h ${durMin}m`,
      departure: `${String(depHour).padStart(2, '0')}:${String(Math.floor(r * 60)).padStart(2, '0')}`,
      arrival: `${String((depHour + durHr) % 24).padStart(2, '0')}:${String(durMin).padStart(2, '0')}`,
      image: FLIGHT_IMAGES[i % FLIGHT_IMAGES.length],
      logo: airline.logo,
      bookingLink: flightBookingLink(from, to, date),
      score: parseFloat((0.5 + seededRandom(seed + i + 's') * 0.5).toFixed(2)),
      liveStatus: i === 0 ? 'On Time' : 'Available',
      offers: i === 0 ? ['Best Price', 'Free Meal'] : [],
      source: 'estimated',
    }
  }).sort((a, b) => a.price - b.price)
}

const HOTEL_PREFIXES = ['The Grand', 'Royal', 'Paradise', 'Comfort', 'Heritage', 'Golden', 'Mountain', 'Sunrise']
const HOTEL_SUFFIXES = ['Hotel', 'Resort', 'Inn', 'Suites', 'Palace', 'Retreat', 'Lodge', 'Residency']
const AMENITIES_POOL = ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Room Service', 'Parking', 'Breakfast']

function generateMockHotels(destination, checkin, checkout, members, budget) {
  // Use stable seed (destination only) so hotel prices don't change on every search
  const seed = (destination || 'dest').split(',')[0].toLowerCase().trim()
  const destLabel = (destination || 'destination').split(',')[0]
  // Realistic per-night prices: ₹800–₹6,000
  const maxPerNight = budget ? Math.min(budget * 0.35, 7000) : 5500
  const basePrice = Math.max(700, Math.round((seededRandom(seed) * 2500 + 800) / 100) * 100)

  return Array.from({ length: 6 }, (_, i) => {
    const r = seededRandom(seed + i)
    const prefix = HOTEL_PREFIXES[Math.floor(r * HOTEL_PREFIXES.length)]
    const suffix = HOTEL_SUFFIXES[Math.floor(seededRandom(seed + i + 'sfx') * HOTEL_SUFFIXES.length)]
    const price = Math.min(basePrice + Math.round((seededRandom(seed + i + 'p') * 3500) / 100) * 100, maxPerNight)
    const amenStart = Math.floor(seededRandom(seed + i + 'as') * 4)
    const amenities = AMENITIES_POOL.slice(amenStart, amenStart + 4)
    return {
      id: `ht_mock_${i}`,
      type: 'hotel',
      name: `${prefix} ${destLabel} ${suffix}`,
      price: Math.max(price, 700),
      rating: parseFloat((3.5 + seededRandom(seed + i + 'r') * 1.5).toFixed(1)),
      image: HOTEL_IMAGES[i % HOTEL_IMAGES.length],
      location: `${destLabel} City Centre`,
      bookingLink: hotelBookingLink(destination, checkin, checkout, members),
      score: parseFloat((0.5 + seededRandom(seed + i + 's') * 0.5).toFixed(2)),
      liveStatus: i < 2 ? '2 rooms left' : 'Available',
      amenities,
      offers: i === 0 ? ['Free Cancellation', 'Breakfast Included'] : [],
      source: 'estimated',
    }
  }).sort((a, b) => a.price - b.price)
}

// ─── Airport Resolution ───────────────────────────────────────────────────────

async function resolveAirport(query) {
  try {
    const res = await axios.get(`https://${RAPIDAPI_HOSTS.flights}/api/v1/flights/searchAirport`, {
      params: { query, locale: 'en-US' },
      headers: rapidHeaders(RAPIDAPI_HOSTS.flights),
      timeout: 6000,
    })
    const data = res.data?.data || []
    if (data.length > 0) {
      const first = data[0]
      return {
        skyId: first.skyId || first.navigation?.relevantFlightParams?.skyId,
        entityId: first.entityId || first.navigation?.relevantFlightParams?.entityId,
      }
    }
  } catch (err) {
    console.warn(`[Skyscanner] Airport resolve failed for "${query}":`, err.response?.status || err.message)
  }
  return null
}

// ─── Flight Search ────────────────────────────────────────────────────────────

async function searchFlights({ from, to, date, returnDate, travelers = 1, budget }) {
  const cacheKey = generateCacheKey('flights_v3', { from, to, date, travelers, budget })
  const cached = await cacheGet(cacheKey)
  if (cached) return { ...cached, meta: { ...cached.meta, cache: true } }

  if (RAPIDAPI_KEY) {
    try {
      const [origin, dest] = await Promise.all([resolveAirport(from), resolveAirport(to)])
      if (origin && dest) {
        const response = await axios.get(`https://${RAPIDAPI_HOSTS.flights}/api/v1/flights/searchFlights`, {
          params: {
            originSkyId: origin.skyId,
            originEntityId: origin.entityId,
            destinationSkyId: dest.skyId,
            destinationEntityId: dest.entityId,
            date: date || new Date().toISOString().split('T')[0],
            cabinClass: 'economy',
            adults: String(travelers),
            sortBy: 'price',
            currency: 'INR',
            market: 'en-IN',
            countryCode: 'IN',
          },
          headers: rapidHeaders(RAPIDAPI_HOSTS.flights),
          timeout: 10000,
        })

        let liveFlights = normalizeSkyscannerFlights(response.data, from, to, date)
        if (budget && liveFlights.length > 0) {
          const filtered = liveFlights.filter(f => f.price <= budget * 0.6)
          liveFlights = filtered.length > 0 ? filtered : liveFlights.slice(0, 3) // show cheapest 3 if all over budget
        }

        if (liveFlights.length > 0) {
          console.log(`[Skyscanner] ✅ ${liveFlights.length} live flights`)
          const result = { success: true, data: liveFlights, meta: { cache: false, source: 'live' } }
          await cacheSet(cacheKey, result)
          return result
        }
      }
    } catch (err) {
      console.warn('[Skyscanner] Live search failed:', err.response?.status || err.message)
    }
  }

  // Fallback 2: AI-estimated prices via Groq
  try {
    const aiFlights = await estimateFlightPrices({ from, to, date, travelers, budget })
    if (aiFlights && aiFlights.length > 0) {
      const mocks = generateMockFlights(from, to, date, budget, aiFlights)
      const result = { success: true, data: mocks, meta: { cache: false, source: 'ai-estimated' } }
      await cacheSet(cacheKey, result)
      return result
    }
  } catch (err) {
    console.warn('[Flights] AI estimation failed:', err.message)
  }

  // Fallback 3: Stable seed-based mock data
  console.log(`[Flights] Using estimated data for ${from} → ${to}`)
  const mocks = generateMockFlights(from, to, date, budget)
  const result = { success: true, data: mocks, meta: { cache: false, source: 'estimated' } }
  await cacheSet(cacheKey, result)
  return result
}

function normalizeSkyscannerFlights(rawData, from, to, date) {
  const itineraries =
    rawData?.data?.itineraries ||
    rawData?.itineraries ||
    rawData?.data?.flights ||
    []

  return itineraries
    .map((item, i) => {
      const rawPrice = item.price?.raw || item.price?.amount
      if (!rawPrice) return null

      let price = typeof rawPrice === 'number' ? rawPrice : parseFloat(rawPrice)

      // Smart paise/paisa detection for INR:
      // Economy one-way flights rarely exceed ₹1,20,000. Anything above is likely paise.
      if (price > 120000) price = Math.round(price / 100)
      // Still unreasonably high? Cap it.
      if (price > 120000) price = Math.round(price / 10)
      // Minimum sanity check
      if (price < 500) price = price * 100 // was in USD cents maybe

      // Hard cap at ₹1,20,000 for economy one-way
      price = Math.min(price, 120000)

      const leg = item.legs?.[0] || {}
      const carrier = leg.carriers?.marketing?.[0] || leg.carriers?.[0] || {}
      return {
        id: item.id || `fl_live_${i}`,
        type: 'flight',
        name: carrier.name || `Flight ${from.split(',')[0]} → ${to.split(',')[0]}`,
        price,
        rating: 4.0,
        duration: leg.durationInMinutes
          ? `${Math.floor(leg.durationInMinutes / 60)}h ${leg.durationInMinutes % 60}m`
          : 'N/A',
        departure: leg.departure?.split('T')[1]?.substring(0, 5) || '--:--',
        arrival: leg.arrival?.split('T')[1]?.substring(0, 5) || '--:--',
        image: carrier.logoUrl || FLIGHT_IMAGES[0],
        logo: carrier.logoUrl,
        bookingLink: flightBookingLink(from, to, date),
        score: Math.max(0, 1 - price / 120000),
        liveStatus: 'Live',
        offers: [],
        source: 'live',
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.price - b.price)
    .slice(0, 6)
}

// ─── Hotel Search ─────────────────────────────────────────────────────────────

async function searchHotels({ destination, checkin, checkout, members = 2, budget }) {
  const cacheKey = generateCacheKey('hotels_v3', { destination, checkin, checkout, members, budget })
  const cached = await cacheGet(cacheKey)
  if (cached) return { ...cached, meta: { ...cached.meta, cache: true } }

  if (RAPIDAPI_KEY) {
    try {
      const locRes = await axios.get(`https://${RAPIDAPI_HOSTS.hotels}/api/v1/hotels/searchDestination`, {
        params: { query: destination.split(',')[0].trim() },
        headers: rapidHeaders(RAPIDAPI_HOSTS.hotels),
        timeout: 8000,
      })

      const locData = locRes.data?.data || []
      const firstLoc = Array.isArray(locData)
        ? (locData.find(l => l.dest_type === 'city' || l.dest_type === 'district') || locData[0])
        : null

      if (firstLoc) {
        const today = new Date().toISOString().split('T')[0]
        const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0]

        const propsRes = await axios.get(`https://${RAPIDAPI_HOSTS.hotels}/api/v1/hotels/searchHotels`, {
          params: {
            dest_id: firstLoc.dest_id || firstLoc.id,
            search_type: firstLoc.dest_type || 'city',
            arrival_date: checkin || today,
            departure_date: checkout || tomorrow,
            adults: String(members),
            room_qty: 1,
            page_number: 1,
            languagecode: 'en-us',
            currency_code: 'INR',
          },
          headers: rapidHeaders(RAPIDAPI_HOSTS.hotels),
          timeout: 12000,
        })

        let liveHotels = normalizeBookingCom(propsRes.data, destination, checkin, checkout, members)

        if (budget && liveHotels.length > 0) {
          const perNightBudget = budget * 0.35
          const filtered = liveHotels.filter(h => h.price <= perNightBudget)
          liveHotels = filtered.length > 0 ? filtered : liveHotels.slice(0, 3)
        }

        if (liveHotels.length > 0) {
          console.log(`[Hotels] ✅ ${liveHotels.length} live hotels`)
          const result = { success: true, data: liveHotels, meta: { cache: false, source: 'live' } }
          await cacheSet(cacheKey, result)
          return result
        }
      }
    } catch (err) {
      console.warn('[Hotels] Live search failed:', err.response?.status || err.message)
    }
  }

  // Always fall back to smart mock data
  console.log(`[Hotels] Using estimated data for ${destination}`)
  const mocks = generateMockHotels(destination, checkin, checkout, members, budget)
  const result = { success: true, data: mocks, meta: { cache: false, source: 'estimated' } }
  await cacheSet(cacheKey, result)
  return result
}

function normalizeBookingCom(rawData, destination, checkin, checkout, members) {
  const hotels = rawData?.data?.hotels || rawData?.result || rawData?.data || []
  if (!Array.isArray(hotels) || hotels.length === 0) return []

  return hotels
    .map((item, i) => {
      const prop = item.property || item
      const priceInfo =
        prop.priceBreakdown?.grossPrice ||
        item.min_total_price ||
        prop.priceBreakdown?.strikethroughPrice

      const rawPrice = priceInfo?.value || priceInfo?.amount || priceInfo
      let numPrice = typeof rawPrice === 'number' ? rawPrice : parseFloat(String(rawPrice || '0').replace(/[^0-9.]/g, ''))

      if (!numPrice || numPrice <= 0) return null

      // Paise detection: hotel per-night rates rarely exceed ₹50,000
      if (numPrice > 50000) numPrice = Math.round(numPrice / 100)
      // Still high? Cap at ₹25,000/night (luxury cap)
      numPrice = Math.min(Math.round(numPrice), 25000)
      // Minimum floor
      if (numPrice < 300) numPrice = numPrice * 100

      return {
        id: (prop.id || item.hotel_id || `ht_live_${i}`).toString(),
        type: 'hotel',
        name: prop.name || item.hotel_name || `Hotel in ${destination.split(',')[0]}`,
        price: numPrice,
        rating: parseFloat(String(prop.reviewScore || prop.review_score || item.review_score || 4.0)),
        image: (prop.photoUrls || [])[0] || item.max_photo_url || HOTEL_IMAGES[i % HOTEL_IMAGES.length],
        location: prop.wishlistName || prop.countryCode || destination.split(',')[0],
        bookingLink: hotelBookingLink(destination, checkin, checkout, members),
        score: prop.reviewScore ? prop.reviewScore / 10 : 0.7,
        liveStatus: 'Live',
        amenities: [],
        offers: [],
        source: 'live',
      }
    })
    .filter(Boolean)
    .sort((a, b) => a.price - b.price)
    .slice(0, 6)
}

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = { searchFlights, searchHotels, flightBookingLink, hotelBookingLink }
