const axios = require('axios')
const { cacheGet, cacheSet, generateCacheKey } = require('../../config/redis')
const { estimateFlightPrices, estimateBusPrices } = require('./aiService')

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY
const RAPIDAPI_HOSTS = {
  flights: 'sky-scrapper.p.rapidapi.com',
  hotels: 'booking-com15.p.rapidapi.com',
}

// ─── Booking Links ────────────────────────────────────────────────────────────
// Use configured affiliate links if available, else fallback to generic deep-links.

function citySlug(str) {
  return (str || '').split(',')[0].trim().replace(/\s+/g, '-').toLowerCase()
}

function flightBookingLink(from, to, date) {
  const affiliateLink = process.env.AFFILIATE_ID_FLIGHTS;
  if (affiliateLink) {
    const origin = encodeURIComponent((from || '').split(',')[0].trim())
    const dest = encodeURIComponent((to || '').split(',')[0].trim())
    const separator = affiliateLink.includes('?') ? '&' : '?'
    return `${affiliateLink}${separator}origin=${origin}&destination=${dest}&source=tripsage`
  }

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

// ─── Airline Data with verified logo CDN URLs ─────────────────────────────────
const AIRLINES = [
  {
    name: 'IndiGo', iata: '6E',
    logo: 'https://www.gstatic.com/flights/airline_logos/70px/6E.png',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80',
    color: '#1a1abb'
  },
  {
    name: 'Air India', iata: 'AI',
    logo: 'https://www.gstatic.com/flights/airline_logos/70px/AI.png',
    image: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=600&q=80',
    color: '#c8102e'
  },
  {
    name: 'SpiceJet', iata: 'SG',
    logo: 'https://www.gstatic.com/flights/airline_logos/70px/SG.png',
    image: 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=600&q=80',
    color: '#e8312f'
  },
  {
    name: 'Akasa Air', iata: 'QP',
    logo: 'https://www.gstatic.com/flights/airline_logos/70px/QP.png',
    image: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=600&q=80',
    color: '#ff6900'
  },
  {
    name: 'Air Asia India', iata: 'I5',
    logo: 'https://www.gstatic.com/flights/airline_logos/70px/FD.png',
    image: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80',
    color: '#e31837'
  },
  {
    name: 'Emirates', iata: 'EK',
    logo: 'https://www.gstatic.com/flights/airline_logos/70px/EK.png',
    image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=600&q=80',
    color: '#c8102e'
  },
  {
    name: 'Qatar Airways', iata: 'QR',
    logo: 'https://www.gstatic.com/flights/airline_logos/70px/QR.png',
    image: 'https://images.unsplash.com/photo-1503146695848-73da81c33c3a?w=600&q=80',
    color: '#5c0632'
  },
  {
    name: 'Singapore Airlines', iata: 'SQ',
    logo: 'https://www.gstatic.com/flights/airline_logos/70px/SQ.png',
    image: 'https://images.unsplash.com/photo-1457296898342-cdd24585d095?w=600&q=80',
    color: '#001489'
  },
  {
    name: 'Thai Airways', iata: 'TG',
    logo: 'https://www.gstatic.com/flights/airline_logos/70px/TG.png',
    image: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?w=600&q=80',
    color: '#4b0082'
  },
  {
    name: 'Malaysia Airlines', iata: 'MH',
    logo: 'https://www.gstatic.com/flights/airline_logos/70px/MH.png',
    image: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=600&q=80',
    color: '#003087'
  },
]

const FLIGHT_IMAGES = [
  'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80',
  'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=600&q=80',
  'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=600&q=80',
  'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=600&q=80',
  'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80',
]

const HOTEL_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
  'https://images.unsplash.com/photo-1551882547-ff40c0d51928?w=600&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80',
  'https://images.unsplash.com/photo-1455587734955-081b22074882?w=600&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80',
]

function seededRandom(seed) {
  let h = 0
  for (let i = 0; i < seed.length; i++) { h = ((h << 5) - h) + seed.charCodeAt(i); h |= 0 }
  return Math.abs(h) / 2147483647
}

function generateMockFlights(from, to, date, budget, aiFlights = null) {
  // Use a stable seed including date so prices change for different dates
  const stableFrom = (from || 'any').split(',')[0].toLowerCase().trim()
  const stableTo = (to || 'any').split(',')[0].toLowerCase().trim()
  const seed = `${stableFrom}-${stableTo}-${date}`

  // If AI provided prices, use them as the base
  if (aiFlights && aiFlights.length > 0) {
    return aiFlights.map((af, i) => {
      const airline = AIRLINES.find(a => a.name.toLowerCase().includes(af.airline.toLowerCase())) || AIRLINES[i % AIRLINES.length]
      return {
        id: `fl_ai_${i}`,
        type: 'flight',
        name: `${af.airline} — ${(from || '').split(',')[0]} → ${(to || '').split(',')[0]}`,
        price: Math.max(1000, af.price),
        rating: parseFloat((3.8 + seededRandom(`${i}r|${seed}`) * 1.2).toFixed(1)),
        duration: af.duration || '2h 30m',
        departure: af.departure || '08:00',
        arrival: af.arrival || '10:30',
        image: airline.image || FLIGHT_IMAGES[i % FLIGHT_IMAGES.length],
        logo: airline.logo,
        airlineColor: airline.color || '#00c27c',
        bookingLink: flightBookingLink(from, to, date),
        score: parseFloat((0.6 + seededRandom(`${i}s|${seed}`) * 0.4).toFixed(2)),
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
    const r = seededRandom(`${i}|${seed}`)
    const price = Math.min(basePrice + Math.round((r * 4000 - 500) / 100) * 100, maxPrice)
    const depHour = 5 + Math.floor(r * 15)
    const durHr = isInternational ? 4 + Math.floor(seededRandom(`${i}dur|${seed}`) * 8) : 1 + Math.floor(seededRandom(`${i}dur|${seed}`) * 4)
    const durMin = Math.floor(seededRandom(`${i}min|${seed}`) * 60)
    return {
      id: `fl_mock_${i}`,
      type: 'flight',
      name: `${airline.name} — ${(from || '').split(',')[0]} → ${(to || '').split(',')[0]}`,
      price: Math.max(price, priceMin),
      rating: parseFloat((3.5 + seededRandom(`${i}r|${seed}`) * 1.5).toFixed(1)),
      duration: `${durHr}h ${String(durMin).padStart(2,'0')}m`,
      departure: `${String(depHour).padStart(2, '0')}:${String(Math.floor(r * 60)).padStart(2, '0')}`,
      arrival: `${String((depHour + durHr) % 24).padStart(2, '0')}:${String(durMin).padStart(2, '0')}`,
      image: airline.image || `https://source.unsplash.com/600x400/?airplane,${encodeURIComponent((to || '').split(',')[0])}`,
      logo: airline.logo,
      bookingLink: flightBookingLink(from, to, date),
      score: parseFloat((0.5 + seededRandom(`${i}s|${seed}`) * 0.5).toFixed(2)),
      liveStatus: i === 0 ? 'On Time' : 'Available',
      offers: i === 0 ? ['Best Price', 'Free Meal'] : [],
      source: 'estimated',
    }
  }).sort((a, b) => a.price - b.price)
}

const HOTEL_PREFIXES = ['The Grand', 'Royal', 'Paradise', 'Comfort', 'Heritage', 'Golden', 'Mountain', 'Sunrise']
const HOTEL_SUFFIXES = ['Hotel', 'Resort', 'Inn', 'Suites', 'Palace', 'Retreat', 'Lodge', 'Residency']
const AMENITIES_POOL = ['WiFi', 'Pool', 'Spa', 'Gym', 'Restaurant', 'Room Service', 'Parking', 'Breakfast']

async function getUnsplashHotelImages(destination) {
  const key = process.env.UNSPLASH_ACCESS_KEY
  if (!key) return null
  try {
    const destLabel = (destination || '').split(',')[0].trim()
    const q = encodeURIComponent(`Hotel ${destLabel}`)
    const res = await axios.get(`https://api.unsplash.com/search/photos?query=${q}&per_page=6&client_id=${key}`, { timeout: 5000 })
    if (res.data?.results?.length > 0) {
      return res.data.results.map(img => img.urls.regular)
    }
  } catch (e) {
    console.warn('[Hotels/Unsplash] Failed:', e.message)
  }
  return null
}

async function generateMockHotels(destination, checkin, checkout, members, budget) {
  // Use stable seed including date so hotel prices change for different dates
  const seed = (destination || 'dest').split(',')[0].toLowerCase().trim() + '-' + (checkin || '')
  const destLabel = (destination || 'destination').split(',')[0]
  // Realistic per-night prices: ₹800–₹6,000
  const maxPerNight = budget ? Math.min(budget * 0.35, 7000) : 5500
  const basePrice = Math.max(700, Math.round((seededRandom(seed) * 2500 + 800) / 100) * 100)
  
  const realImages = await getUnsplashHotelImages(destination)

  return Array.from({ length: 6 }, (_, i) => {
    const r = seededRandom(`${i}|${seed}`)
    const prefix = HOTEL_PREFIXES[Math.floor(r * HOTEL_PREFIXES.length)]
    const suffix = HOTEL_SUFFIXES[Math.floor(seededRandom(`${i}sfx|${seed}`) * HOTEL_SUFFIXES.length)]
    const price = Math.min(basePrice + Math.round((seededRandom(`${i}p|${seed}`) * 3500) / 100) * 100, maxPerNight)
    const amenStart = Math.floor(seededRandom(`${i}as|${seed}`) * (AMENITIES_POOL.length - 3))
    const amenities = AMENITIES_POOL.slice(amenStart, amenStart + 4)
    
    // Fallback to distinct curated images to ensure variety if API fails
    const imgUrl = realImages && realImages[i % realImages.length] 
      ? realImages[i % realImages.length] 
      : HOTEL_IMAGES[i % HOTEL_IMAGES.length]

    return {
      id: `ht_mock_${i}`,
      type: 'hotel',
      name: `${prefix} ${destLabel} ${suffix}`,
      price: Math.max(price, 700),
      rating: parseFloat((3.5 + seededRandom(`${i}r|${seed}`) * 1.5).toFixed(1)),
      image: imgUrl,
      location: `${destLabel} City Centre`,
      bookingLink: hotelBookingLink(destination, checkin, checkout, members),
      score: parseFloat((0.5 + seededRandom(`${i}s|${seed}`) * 0.5).toFixed(2)),
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

async function searchFlights({ from, to, date, returnDate, travelers = 1, budget, noCache = false }) {
  const cacheKey = generateCacheKey('flights_v3', { from, to, date, travelers })
  if (!noCache) {
    const cached = await cacheGet(cacheKey)
    if (cached) return { ...cached, meta: { ...cached.meta, cache: true } }
  }

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

async function searchHotels({ destination, checkin, checkout, members = 2, budget, noCache = false }) {
  const cacheKey = generateCacheKey('hotels_v3', { destination, checkin, checkout, members })
  if (!noCache) {
    const cached = await cacheGet(cacheKey)
    if (cached) return { ...cached, meta: { ...cached.meta, cache: true } }
  }

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
  const mocks = await generateMockHotels(destination, checkin, checkout, members, budget)
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

// ─── Buses Search ─────────────────────────────────────────────────────────────

const BUS_OPERATORS = [
  { name: 'IntrCity SmartBus', rating: 4.5, type: 'AC Sleeper (2+1)', color: '#e74c3c' },
  { name: 'Zingbus', rating: 4.2, type: 'Volvo Multi-Axle I-Shift', color: '#3498db' },
  { name: 'VRL Travels', rating: 4.0, type: 'AC Semi Sleeper (2+2)', color: '#f39c12' },
  { name: 'SRS Travels', rating: 3.9, type: 'Non-AC Sleeper (2+1)', color: '#27ae60' },
  { name: 'Orange Tours', rating: 4.1, type: 'Scania Multi-Axle', color: '#e67e22' },
]

function generateMockBuses(from, to, date, budget, aiBuses = null) {
  const stableFrom = (from || 'a').split(',')[0].toLowerCase().trim()
  const stableTo = (to || 'b').split(',')[0].toLowerCase().trim()
  const seed = `${stableFrom}-${stableTo}-${date}`

  // If AI provided estimates, use them directly
  if (aiBuses && aiBuses.length > 0) {
    const affiliateUrl = `https://www.redbus.in/search?fromCityName=${encodeURIComponent(from)}&toCityName=${encodeURIComponent(to)}&source=tripsage&medium=web&campaign_id=bus_tab`
    return aiBuses.map((ab, i) => {
      const op = BUS_OPERATORS.find(o => o.name.toLowerCase().includes(ab.operator.toLowerCase().split(' ')[0])) || BUS_OPERATORS[i % BUS_OPERATORS.length]
      // Parse duration string like "10h 30m" into arrival
      const depParts = (ab.departure || '20:00').split(':')
      const depHour = parseInt(depParts[0]) || 20
      const depMin = parseInt(depParts[1]) || 0
      const durMatch = (ab.duration || '10h 0m').match(/(\d+)h\s*(\d*)m?/)
      const durHr = durMatch ? parseInt(durMatch[1]) : 10
      const durMin2 = durMatch ? parseInt(durMatch[2] || '0') : 0
      const arrHour = (depHour + durHr + Math.floor((depMin + durMin2) / 60)) % 24
      const arrMin = (depMin + durMin2) % 60
      return {
        id: `bs_ai_${i}`,
        type: 'bus',
        name: ab.operator,
        busType: ab.busType || op.type,
        price: Math.max(ab.price, 200),
        rating: parseFloat((op.rating - 0.3 + seededRandom(`${i}r|${seed}`) * 0.6).toFixed(1)),
        duration: ab.duration || '10h 0m',
        departure: ab.departure || '20:00',
        arrival: `${String(arrHour).padStart(2, '0')}:${String(arrMin).padStart(2, '0')}`,
        image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80',
        logo: '',
        color: op.color,
        bookingLink: affiliateUrl,
        score: parseFloat((0.55 + seededRandom(`${i}s|${seed}`) * 0.45).toFixed(2)),
        liveStatus: i === 0 ? 'Filling Fast' : 'Available',
        offers: i === 1 ? ['Early Bird Deal'] : [],
        stops: ab.stops || 0,
        source: 'ai-estimated',
      }
    }).sort((a, b) => a.price - b.price)
  }

  // ── Seeded fallback (no AI) ────────────────────────────────────────────────
  const isDomesticIndia = ['delhi','mumbai','bangalore','hyderabad','chennai','kolkata','pune','goa',
     'jaipur','ahmedabad','kochi','agra','varanasi','rishikesh','manali','shimla','chandigarh']
     .some(c => stableFrom.includes(c)) &&
     ['delhi','mumbai','bangalore','hyderabad','chennai','kolkata','pune','goa',
     'jaipur','ahmedabad','kochi','agra','varanasi','rishikesh','manali','shimla','chandigarh']
     .some(c => stableTo.includes(c))

  if (!isDomesticIndia && !((from || '').toLowerCase().includes('india') && (to || '').toLowerCase().includes('india'))) {
    return []
  }

  const basePrice = Math.max(400, Math.round((seededRandom(seed) * 1500 + 350) / 100) * 100)
  const affiliateUrl = `https://www.redbus.in/search?fromCityName=${encodeURIComponent(from)}&toCityName=${encodeURIComponent(to)}&source=tripsage&medium=web&campaign_id=bus_tab`

  return BUS_OPERATORS.map((op, i) => {
    const r = seededRandom(`${i}|${seed}`)
    const price = Math.max(basePrice + Math.round((r * 900 - 150) / 100) * 100, 250)
    const depHour = 17 + Math.floor(r * 6) // Night buses mostly
    const depMin = Math.floor(seededRandom(`${i}dm|${seed}`) * 60)
    const durHr = 6 + Math.floor(seededRandom(`${i}dur|${seed}`) * 8)
    const durMin = Math.floor(seededRandom(`${i}min|${seed}`) * 60)
    const arrHour = (depHour + durHr + Math.floor((depMin + durMin) / 60)) % 24
    const arrMin = (depMin + durMin) % 60
    return {
      id: `bs_mock_${i}`,
      type: 'bus',
      name: op.name,
      busType: op.type,
      price,
      rating: parseFloat((op.rating - 0.3 + seededRandom(`${i}r|${seed}`) * 0.6).toFixed(1)),
      duration: `${durHr}h ${String(durMin).padStart(2,'0')}m`,
      departure: `${String(depHour % 24).padStart(2, '0')}:${String(depMin).padStart(2,'0')}`,
      arrival: `${String(arrHour).padStart(2, '0')}:${String(arrMin).padStart(2, '0')}`,
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80',
      logo: '',
      color: op.color,
      bookingLink: affiliateUrl,
      score: parseFloat((0.55 + seededRandom(`${i}s|${seed}`) * 0.45).toFixed(2)),
      liveStatus: i === 0 ? 'Filling Fast' : 'Available',
      offers: i === 1 ? ['Early Bird Deal'] : [],
      stops: Math.floor(seededRandom(`${i}st|${seed}`) * 3),
      source: 'estimated',
    }
  }).sort((a, b) => a.price - b.price)
}

async function searchBuses({ from, to, date, budget, noCache = false }) {
  const cacheKey = generateCacheKey('buses_v2', { from, to, date })
  if (!noCache) {
    const cached = await cacheGet(cacheKey)
    if (cached) return { ...cached, meta: { ...cached.meta, cache: true } }
  }

  // Try AI-estimated prices first (route-specific, realistic)
  try {
    const aiResult = await estimateBusPrices({ from, to, date, budget })
    if (aiResult && aiResult.buses && aiResult.buses.length > 0) {
      const buses = generateMockBuses(from, to, date, budget, aiResult.buses)
      const result = {
        success: true,
        data: buses,
        meta: { cache: false, source: 'ai-estimated', routeNote: aiResult.routeNote, distanceKm: aiResult.distanceKm },
      }
      await cacheSet(cacheKey, result, 3600) // cache 1 hour
      return result
    }
  } catch (err) {
    console.warn('[Buses] AI estimation failed:', err.message)
  }

  // Seeded fallback
  console.log(`[Buses] Using seeded fallback for ${from} → ${to}`)
  const mocks = generateMockBuses(from, to, date, budget)
  const result = { success: true, data: mocks, meta: { cache: false, source: 'estimated' } }
  await cacheSet(cacheKey, result, 900)
  return result
}

// ─── Rental Cars Search ───────────────────────────────────────────────────────

const CAR_PROVIDERS = [
  { name: 'DiscoverCars', type: 'SUV • Automatic', capacity: '5 Seats', color: '#16a085' },
  { name: 'Rentalcars.com', type: 'Sedan • Manual', capacity: '4 Seats', color: '#2980b9' },
  { name: 'Hertz', type: 'Compact • Automatic', capacity: '4 Seats', color: '#f1c40f' },
  { name: 'Avis', type: 'Luxury • Automatic', capacity: '5 Seats', color: '#c0392b' },
]

function generateMockCars(destination, date, budget) {
  const seed = (destination || 'dest').split(',')[0].toLowerCase().trim()
  const basePrice = Math.max(1500, Math.round((seededRandom(seed) * 2000 + 1000) / 100) * 100)
  
  return CAR_PROVIDERS.map((op, i) => {
    const r = seededRandom(seed + i)
    const price = Math.max(basePrice + Math.round((r * 1500) / 100) * 100, 1000)
    
    // Affiliate link
    const dest = encodeURIComponent(destination)
    const affiliateUrl = `https://naiawork.com/g/wqjhitsyjqbd777ee50d5ea594bb46/?dest=${dest}&source=tripsage&medium=web`

    return {
      id: `cr_mock_${i}`,
      type: 'car',
      name: op.name,
      carType: op.type,
      capacity: op.capacity,
      price: price, // price per day
      rating: parseFloat((4.0 + seededRandom(seed + i + 'r') * 1.0).toFixed(1)),
      image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=600&q=80',
      logo: '',
      color: op.color,
      bookingLink: affiliateUrl,
      score: parseFloat((0.6 + seededRandom(seed + i + 's') * 0.4).toFixed(2)),
      liveStatus: i === 0 ? 'Limited Availability' : 'Available',
      offers: i === 0 ? ['Free Cancellation'] : [],
      source: 'estimated',
    }
  }).sort((a, b) => a.price - b.price)
}

async function searchCars({ destination, date, budget }) {
  const cacheKey = generateCacheKey('cars_v1', { destination, date, budget })
  const cached = await cacheGet(cacheKey)
  if (cached) return { ...cached, meta: { ...cached.meta, cache: true } }

  console.log(`[Cars] Using estimated data for ${destination}`)
  const mocks = generateMockCars(destination, date, budget)
  const result = { success: true, data: mocks, meta: { cache: false, source: 'estimated' } }
  await cacheSet(cacheKey, result)
  return result
}

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = { searchFlights, searchHotels, searchBuses, searchCars, flightBookingLink, hotelBookingLink }

