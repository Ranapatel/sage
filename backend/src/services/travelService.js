const axios = require('axios')
const NodeCache = require('node-cache')
const { cacheGet, cacheSet, generateCacheKey } = require('../../config/redis')
const { estimateFlightPrices } = require('./aiService')

// Initialize node-cache with 5 minutes (300 seconds) standard TTL
const localCache = new NodeCache({ stdTTL: 300, checkperiod: 60 })

const hotelbedsService = require('./hotelbedsService')

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY
const RAPIDAPI_HOSTS = {
  flights: process.env.RAPIDAPI_HOST_FLIGHTS || 'sky-scrapper.p.rapidapi.com',
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

function hotelBookingLink() {
  return ''
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
    logo: 'https://images.kiwi.com/airlines/64/6E.png',
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?w=600&q=80',
    color: '#1a1abb'
  },
  {
    name: 'Air India',
    logo: 'https://images.kiwi.com/airlines/64/AI.png',
    image: 'https://images.unsplash.com/photo-1556388158-158ea5ccacbd?w=600&q=80',
    color: '#c8102e'
  },
  {
    name: 'SpiceJet',
    logo: 'https://images.kiwi.com/airlines/64/SG.png',
    image: 'https://images.unsplash.com/photo-1474302770737-173ee21bab63?w=600&q=80',
    color: '#e8312f'
  },
  {
    name: 'Akasa Air',
    logo: 'https://images.kiwi.com/airlines/64/QP.png',
    image: 'https://images.unsplash.com/photo-1464037866556-6812c9d1c72e?w=600&q=80',
    color: '#ff6900'
  },
  {
    name: 'Vistara',
    logo: 'https://images.kiwi.com/airlines/64/UK.png',
    image: 'https://images.unsplash.com/photo-1488085061387-422e29b40080?w=600&q=80',
    color: '#6e2d8a'
  },
  // International carriers
  {
    name: 'Emirates',
    logo: 'https://images.kiwi.com/airlines/64/EK.png',
    image: 'https://images.unsplash.com/photo-1540962351504-03099e0a754b?w=600&q=80',
    color: '#c8102e'
  },
  {
    name: 'Qatar Airways',
    logo: 'https://images.kiwi.com/airlines/64/QR.png',
    image: 'https://images.unsplash.com/photo-1503146695848-73da81c33c3a?w=600&q=80',
    color: '#5c0632'
  },
  {
    name: 'Singapore Airlines',
    logo: 'https://images.kiwi.com/airlines/64/SQ.png',
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

const HOTEL_IMAGES = [
  'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80',
  'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=600&q=80',
  'https://images.unsplash.com/photo-1455587734955-081b22074882?w=600&q=80',
  'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80',
]

function seededRandom(seed) {
  let h = 0
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(31, h) + seed.charCodeAt(i) | 0
  }
  // Bitwise mixing step (Mulberry32/Murmur-inspired) to distribute hash keys evenly
  h = Math.imul(h ^ (h >>> 16), 2246822507)
  h = Math.imul(h ^ (h >>> 13), 3266489909)
  return (Math.abs(h ^ (h >>> 16)) % 1000000) / 1000000
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
  // Cap at 40% of budget for flights (down from 55%)
  const maxPrice = budget ? Math.min(budget * 0.40, isInternational ? 80000 : 15000) : (isInternational ? 60000 : 12000)
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


function generateMockHotels(destination, checkin, checkout, members, budget) {
  // Use stable seed (destination only) so hotel prices don't change on every search
  const seed = (destination || 'dest').split(',')[0].toLowerCase().trim()
  const destLabel = (destination || 'destination').split(',')[0]
  // Realistic per-night prices: ₹800–₹6,000. Cap at 35% of budget per night.
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
    // We use flights-sky for airport resolution as it efficiently returns IATA codes for free
    // which the Kiwi API requires.
    const res = await axios.get(`https://flights-sky.p.rapidapi.com/web/flights/auto-complete`, {
      params: { query },
      headers: rapidHeaders('flights-sky.p.rapidapi.com'),
      timeout: 6000,
    })
    const data = res.data?.data || []
    if (data.length > 0) {
      return {
        iata: data[0].PlaceId || data[0].IataCode || null,
        name: data[0].PlaceName
      }
    }
  } catch (err) {
    console.warn(`[Flights] Airport resolve failed for "${query}":`, err.response?.status || err.message)
  }
  return null
}

// ─── Flight Search ────────────────────────────────────────────────────────────

async function searchFlights({ from, to, date, returnDate, travelers = 1, budget }) {
  const cacheKey = generateCacheKey('flights_v4', { from, to, date, travelers, budget })
  
  // Check node-cache first
  const localCached = localCache.get(cacheKey)
  if (localCached) return { ...localCached, meta: { ...localCached.meta, cache: true, type: 'local' } }

  const cached = await cacheGet(cacheKey)
  if (cached) return { ...cached, meta: { ...cached.meta, cache: true } }

  // Flight budget: 40% of total budget
  const flightBudgetLimit = budget ? budget * 0.40 : null

  if (RAPIDAPI_KEY) {
    try {
      const [origin, dest] = await Promise.all([resolveAirport(from), resolveAirport(to)])
      if (origin?.iata && dest?.iata) {
        const isRoundTrip = !!returnDate;
        const endpoint = isRoundTrip ? '/round-trip' : '/one-way';
        const params = {
          origin: origin.iata,
          destination: dest.iata,
          adults: String(travelers),
          currency: 'INR',
        };
        
        if (isRoundTrip) {
          params.departDate = date || new Date().toISOString().split('T')[0];
          params.returnDate = returnDate;
        } else {
          params.date = date || new Date().toISOString().split('T')[0];
        }

        const response = await axios.get(`https://${RAPIDAPI_HOSTS.flights}${endpoint}`, {
          params,
          headers: rapidHeaders(RAPIDAPI_HOSTS.flights),
          timeout: 10000,
        })

        let liveFlights = normalizeKiwiFlights(response.data, from, to, date)
        if (flightBudgetLimit && liveFlights.length > 0) {
          const filtered = liveFlights.filter(f => f.price <= flightBudgetLimit)
          // If all flights exceed budget, show cheapest 3 with overBudget flag
          liveFlights = filtered.length > 0 ? filtered : liveFlights.slice(0, 3).map(f => ({ ...f, overBudget: true }))
        }

        if (liveFlights.length > 0) {
          console.log(`[Flights] ✅ ${liveFlights.length} live flights (Kiwi)`)
          const result = { success: true, data: liveFlights, meta: { cache: false, source: 'live', budgetLimit: flightBudgetLimit } }
          await cacheSet(cacheKey, result)
          localCache.set(cacheKey, result)
          return result
        }
      }
    } catch (err) {
      console.warn('[Flights] Live search failed:', err.response?.status || err.message)
    }
  }

  // Fallback 2: AI-estimated prices via Groq
  try {
    const aiFlights = await estimateFlightPrices({ from, to, date, travelers, budget })
    if (aiFlights && aiFlights.length > 0) {
      let mocks = generateMockFlights(from, to, date, budget, aiFlights)
      if (flightBudgetLimit) {
        const filtered = mocks.filter(f => f.price <= flightBudgetLimit)
        mocks = filtered.length > 0 ? filtered : mocks.slice(0, 3).map(f => ({ ...f, overBudget: true }))
      }
      const result = { success: true, data: mocks, meta: { cache: false, source: 'ai-estimated', budgetLimit: flightBudgetLimit } }
      await cacheSet(cacheKey, result)
      localCache.set(cacheKey, result)
      return result
    }
  } catch (err) {
    console.warn('[Flights] AI estimation failed:', err.message)
  }

  // Fallback 3: Stable seed-based mock data
  console.log(`[Flights] Using estimated data for ${from} → ${to}`)
  let mocks = generateMockFlights(from, to, date, budget)
  if (flightBudgetLimit) {
    const filtered = mocks.filter(f => f.price <= flightBudgetLimit)
    mocks = filtered.length > 0 ? filtered : mocks.slice(0, 3).map(f => ({ ...f, overBudget: true }))
  }
  const result = { success: true, data: mocks, meta: { cache: false, source: 'estimated', budgetLimit: flightBudgetLimit } }
  await cacheSet(cacheKey, result)
  localCache.set(cacheKey, result)
  return result
}

function normalizeKiwiFlights(rawData, from, to, date) {
  const itineraries = rawData?.itineraries || [];

  return itineraries
    .map((item, i) => {
      const rawPrice = item.price?.amount;
      if (!rawPrice) return null;

      let price = typeof rawPrice === 'number' ? rawPrice : parseFloat(rawPrice);

      // Smart paise/paisa detection for INR:
      // Economy flights rarely exceed ₹1,20,000. Anything above is likely paise.
      if (price > 120000) price = Math.round(price / 100);
      // Hard cap at ₹1,20,000 for economy
      price = Math.min(price, 120000);

      const sector = item.sector || item.sectors?.[0] || {};
      const leg = sector.sectorSegments?.[0]?.segment || {};
      const carrier = leg.carrier || {};
      
      const durationSeconds = leg.duration || sector.duration || 0;
      const durationMinutes = Math.floor(durationSeconds / 60);

      // Airline logos mapping
      let logoUrl = FLIGHT_IMAGES[0];
      if (carrier.code) {
         logoUrl = `https://images.kiwi.com/airlines/64/${carrier.code}.png`;
      }

      return {
        id: item.id || `fl_live_${i}`,
        type: 'flight',
        name: carrier.name || `Flight ${from.split(',')[0]} → ${to.split(',')[0]}`,
        price,
        rating: parseFloat((4.0 + Math.random() * 0.9).toFixed(1)), // fake rating as kiwi doesn't provide
        duration: durationMinutes > 0
          ? `${Math.floor(durationMinutes / 60)}h ${durationMinutes % 60}m`
          : 'N/A',
        departure: leg.source?.localTime?.split('T')[1]?.substring(0, 5) || '--:--',
        arrival: leg.destination?.localTime?.split('T')[1]?.substring(0, 5) || '--:--',
        image: logoUrl,
        logo: logoUrl,
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

async function searchHotels({ destination, checkin, checkout, members = 2, budget, rooms = 1, adults = 2, children = 0 }) {
  const cacheKey = generateCacheKey('hotels_hbd_v4', { destination, checkin, checkout, members, budget, rooms, adults, children })
  
  // Check node-cache first
  const localCached = localCache.get(cacheKey)
  if (localCached) return { ...localCached, meta: { ...localCached.meta, cache: true, type: 'local' } }

  const cached = await cacheGet(cacheKey)
  if (cached) return { ...cached, meta: { ...cached.meta, cache: true } }

  const result = await hotelbedsService.searchHotels({ destination, checkin, checkout, members, budget, rooms, adults, children })

  if (result && result.success) {
    await cacheSet(cacheKey, result)
    localCache.set(cacheKey, result)
  }
  
  return result
}

// ─── Buses Search ─────────────────────────────────────────────────────────────

const BUS_OPERATORS = [
  { name: 'IntrCity SmartBus', rating: 4.5, type: 'AC Sleeper (2+1)', color: '#e74c3c' },
  { name: 'Zingbus', rating: 4.2, type: 'Volvo Multi-Axle I-Shift', color: '#3498db' },
  { name: 'VRL Travels', rating: 4.0, type: 'AC Semi Sleeper (2+2)', color: '#f39c12' },
  { name: 'SRS Travels', rating: 3.9, type: 'Non-AC Sleeper (2+1)', color: '#27ae60' },
  { name: 'Orange Tours', rating: 4.1, type: 'Scania Multi-Axle', color: '#e67e22' },
]

function generateMockBuses(from, to, date, budget) {
  const seed = `${(from || 'a').split(',')[0]}-${(to || 'b').split(',')[0]}`.toLowerCase().trim()
  const basePrice = Math.max(500, Math.round((seededRandom(seed) * 1500 + 400) / 100) * 100)
  
  return BUS_OPERATORS.map((op, i) => {
    const r = seededRandom(seed + i)
    const price = Math.max(basePrice + Math.round((r * 1000 - 200) / 100) * 100, 300)
    const depHour = 18 + Math.floor(r * 5) // Night buses mostly
    const durHr = 6 + Math.floor(seededRandom(seed + i + 'dur') * 8)
    const durMin = Math.floor(seededRandom(seed + i + 'min') * 60)
    
    // Affiliate link format for Redbus with tracking parameters
    const affiliateUrl = `https://www.redbus.in/search?fromCityName=${encodeURIComponent(from)}&toCityName=${encodeURIComponent(to)}&source=tripsage&medium=web&campaign_id=bus_tab`

    return {
      id: `bs_mock_${i}`,
      type: 'bus',
      name: op.name,
      busType: op.type,
      price: price,
      rating: parseFloat((op.rating - 0.5 + seededRandom(seed + i + 'r')).toFixed(1)),
      duration: `${durHr}h ${durMin}m`,
      departure: `${String(depHour % 24).padStart(2, '0')}:${String(Math.floor(r * 60)).padStart(2, '0')}`,
      arrival: `${String((depHour + durHr) % 24).padStart(2, '0')}:${String(durMin).padStart(2, '0')}`,
      image: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?w=600&q=80',
      logo: '',
      color: op.color,
      bookingLink: affiliateUrl,
      score: parseFloat((0.6 + seededRandom(seed + i + 's') * 0.4).toFixed(2)),
      liveStatus: i === 0 ? 'Filling Fast' : 'Available',
      offers: i === 1 ? ['Early Bird Deal'] : [],
      source: 'estimated',
    }
  }).sort((a, b) => a.price - b.price)
}

async function searchBuses({ from, to, date }) {
  // Only support Indian routes for the bus integration
  const isSupported = (from || '').toLowerCase().includes('india') && (to || '').toLowerCase().includes('india')
  
  if (!isSupported) {
    console.log(`[Buses] Route ${from} → ${to} not supported. Returning empty inventory.`)
    return { success: true, results: [], searchUrl: '', meta: { cache: false, source: 'unsupported' } }
  }

  const cacheKey = generateCacheKey('buses_v3', { from, to, date })
  const cached = await cacheGet(cacheKey)
  if (cached) return { ...cached, meta: { ...cached.meta, cache: true } }

  try {
    const nestUrl = process.env.TRANSPORT_SERVICE_URL || 'http://localhost:4001';
    console.log(`[Buses] Querying NestJS bus search: ${nestUrl}/api/bus/search`);
    const response = await axios.post(`${nestUrl}/api/bus/search`, {
      departureCity: from.split(',')[0].trim(),
      destinationCity: to.split(',')[0].trim(),
      departureDate: date
    });
    
    const result = {
      success: true,
      results: response.data?.results || [],
      searchUrl: response.data?.searchUrl || '',
      meta: { cache: false, source: 'nestjs-mmt' }
    };
    await cacheSet(cacheKey, result);
    return result;
  } catch (err) {
    console.error('[travelService.js] searchBuses failed:', err.message);
    
    let fallbackSearchUrl = '';
    if (err.response?.data?.searchUrl) {
      fallbackSearchUrl = err.response.data.searchUrl;
    } else {
      const originSlug = (from || '').split(',')[0].trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '').toLowerCase();
      const destSlug = (to || '').split(',')[0].trim().replace(/\s+/g, '-').replace(/[^\w-]/g, '').toLowerCase();
      const dateParts = (date || '').split('-');
      if (dateParts.length === 3) {
        fallbackSearchUrl = `https://www.makemytrip.com/bus-tickets/${originSlug}-to-${destSlug}/?dd=${dateParts[2]}&mm=${dateParts[1]}&yy=${dateParts[0]}`;
      }
    }
    
    return {
      success: false,
      results: [],
      searchUrl: fallbackSearchUrl,
      meta: { cache: false, source: 'error' }
    };
  }
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
  const cacheKey = generateCacheKey('cars_v2', { destination, date, budget })
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

