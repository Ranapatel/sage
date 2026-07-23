const axios = require('axios')
const NodeCache = require('node-cache')
const { cacheGet, cacheSet, generateCacheKey } = require('../../config/redis')

// Initialize node-cache with 5 minutes (300 seconds) standard TTL
const localCache = new NodeCache({ stdTTL: 300, checkperiod: 60 })

const hotelbedsService = require('./hotelbedsService')

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY

function citySlug(str) {
  return (str || '').split(',')[0].trim().replace(/\s+/g, '-').toLowerCase()
}

function hotelBookingLink() {
  return ''
}

// ─── RapidAPI helpers ─────────────────────────────────────────────────────────

function rapidHeaders(host) {
  return { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': host }
}

// ─── Mock Data (Realistic INR prices) ────────────────────────────────────────

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
  // Relaxed check for Indian routes (let NestJS service handle supported check)
  const isSupported = true;

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

// ─── Flight Search ────────────────────────────────────────────────────────────

let resolveIataCode;
try {
  resolveIataCode = require('../utils/iataResolver').resolveIataCode;
} catch (e) {
  try {
    resolveIataCode = require('../utils/iataResolver.ts').resolveIataCode;
  } catch (e2) {
    resolveIataCode = (city, fallback = 'DEL') => {
      if (!city) return fallback;
      const clean = city.trim().toUpperCase();
      return /^[A-Z]{3}$/.test(clean) ? clean : fallback;
    };
  }
}

const AIRLINES = [
  { name: 'IndiGo', code: '6E', logo: 'https://logos-world.net/wp-content/uploads/2023/01/IndiGo-Logo.png' },
  { name: 'Air India', code: 'AI', logo: 'https://logos-world.net/wp-content/uploads/2023/01/Air-India-Logo.png' },
  { name: 'Vistara', code: 'UK', logo: 'https://logos-world.net/wp-content/uploads/2023/01/Vistara-Logo.png' },
  { name: 'Akasa Air', code: 'QP', logo: 'https://logos-world.net/wp-content/uploads/2023/01/Akasa-Air-Logo.png' },
  { name: 'SpiceJet', code: 'SG', logo: 'https://logos-world.net/wp-content/uploads/2023/01/SpiceJet-Logo.png' },
]

async function searchFlights({ from, to, date, budget, travelers = 2, cabin = 'Economy' }) {
  console.log(`[FlightSearch Stage 1 - Request] Raw search input: from="${from}", to="${to}", date="${date}", travelers=${travelers}, cabin="${cabin}"`)

  const originIata = resolveIataCode(from, 'DEL')
  const destIata = resolveIataCode(to, 'GOI')
  console.log(`[FlightSearch Stage 2 - IATA] Resolved IATA codes: "${from}" -> "${originIata}", "${to}" -> "${destIata}"`)

  const departureDate = date && /^\d{4}-\d{2}-\d{2}$/.test(date)
    ? date
    : new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0]
  console.log(`[FlightSearch Stage 3 - Date] Departure date: "${departureDate}" (YYYY-MM-DD)`)

  const cacheKey = generateCacheKey('flights_tp_live_v2', { originIata, destIata, departureDate, travelers, cabin })

  const cached = await cacheGet(cacheKey)
  if (cached) {
    console.log(`[FlightSearch Cache] Returning cached flight offers for key: ${cacheKey}`)
    return { ...cached, meta: { ...cached.meta, cache: true } }
  }

  let flightResults = []
  let source = 'travelport'
  let lastError = null

  // 1. Query NestJS Transport microservice first (port 4001)
  try {
    const nestUrl = process.env.TRANSPORT_SERVICE_URL || 'http://localhost:4001';
    console.log(`[FlightSearch Stage 4 - Provider Req] Querying NestJS Flight Service: POST ${nestUrl}/api/v1/flights/search`);
    const nestRes = await axios.post(`${nestUrl}/api/v1/flights/search`, {
      origin: originIata,
      destination: destIata,
      departureDate,
      adults: travelers || 1,
      cabinClass: cabin,
    }, { timeout: 8000 });

    console.log(`[FlightSearch Stage 5 - Provider Res] NestJS HTTP Status: ${nestRes.status}`);

    if (nestRes.data && Array.isArray(nestRes.data.offers) && nestRes.data.offers.length > 0) {
      flightResults = nestRes.data.offers.map((offer, idx) => ({
        id: offer.id || offer.offerRef || `fl_tp_nest_${idx}`,
        type: 'flight',
        name: offer.airline || AIRLINES[idx % AIRLINES.length].name,
        logo: offer.airlineLogo || AIRLINES[idx % AIRLINES.length].logo,
        departure: `${originIata} ${offer.departureTime || '07:30'}`,
        arrival: `${destIata} ${offer.arrivalTime || '09:45'}`,
        departureTime: offer.departureTime || '07:30',
        arrivalTime: offer.arrivalTime || '09:45',
        origin: originIata,
        destination: destIata,
        duration: offer.duration || '2h 15m',
        stops: offer.stops !== undefined ? offer.stops : 0,
        price: offer.price || Math.round(3499 + idx * 800),
        currency: offer.currency || 'INR',
        score: offer.score || parseFloat((0.95 - idx * 0.05).toFixed(2)),
        source: 'travelport-nestjs',
        rawOffer: offer,
      }))
      source = 'travelport-nestjs'
    } else {
      console.log(`[FlightSearch Stage 5 - Provider Res] NestJS returned 0 offers. Body:`, JSON.stringify(nestRes.data));
    }
  } catch (nestErr) {
    lastError = nestErr.response?.data || nestErr.message;
    console.warn(`[FlightSearch Stage 4/5 - Provider Err] NestJS check (Status ${nestErr.response?.status || 'N/A'}):`, lastError);
  }

  // 2. Query Travelport FlightSearchService directly
  if (flightResults.length === 0) {
    let FlightSearchService;
    try {
      require('ts-node/register');
    } catch (e) {}
    try {
      FlightSearchService = require('../modules/travelport/search/flightSearch.service').FlightSearchService;
    } catch (e) {
      try {
        FlightSearchService = require('../modules/travelport/search/flightSearch.service.ts').FlightSearchService;
      } catch (e2) {
        console.warn('[FlightSearch Stage 4] Unable to load FlightSearchService:', e2.message);
      }
    }

    if (FlightSearchService) {
      try {
        console.log(`[FlightSearch Stage 4 - Provider Req] Calling FlightSearchService for ${originIata} -> ${destIata}`);
        const travelportService = new FlightSearchService()
        const response = await travelportService.searchFlights({
          legs: [{ origin: originIata, destination: destIata, departureDate }],
          passengers: { adults: travelers || 1 }
        })

        console.log(`[FlightSearch Stage 5 - Provider Res] Raw Travelport offers count: ${response?.offers?.length || 0}`);

        if (response && Array.isArray(response.offers) && response.offers.length > 0) {
          flightResults = response.offers.map((offer, idx) => ({
            id: offer.id || `fl_tp_${idx}`,
            type: 'flight',
            name: offer.airline || AIRLINES[idx % AIRLINES.length].name,
            logo: offer.airlineLogo || AIRLINES[idx % AIRLINES.length].logo,
            departure: `${originIata} ${offer.departureTime || '07:30'}`,
            arrival: `${destIata} ${offer.arrivalTime || '09:45'}`,
            departureTime: offer.departureTime || '07:30',
            arrivalTime: offer.arrivalTime || '09:45',
            origin: originIata,
            destination: destIata,
            duration: offer.duration || '2h 15m',
            stops: offer.stops !== undefined ? offer.stops : 0,
            price: offer.price || Math.round(3499 + idx * 800),
            currency: offer.currency || 'INR',
            score: offer.score || parseFloat((0.95 - idx * 0.05).toFixed(2)),
            source: 'travelport',
            rawOffer: offer,
          }))
        } else if (response && response.error) {
          lastError = response.error;
        }
      } catch (tpErr) {
        lastError = tpErr.rawError || tpErr.message || tpErr;
        console.error(`[FlightSearch Stage 5 - Provider Error] Travelport execution failed:`, JSON.stringify(lastError));
      }
    }
  }

  console.log(`[FlightSearch Stage 6 - Mapping] Final mapped flight count: ${flightResults.length}`);

  const result = {
    success: flightResults.length > 0,
    data: flightResults,
    error: flightResults.length === 0 ? (typeof lastError === 'object' ? JSON.stringify(lastError) : (lastError || 'No offers returned by Travelport provider')) : null,
    meta: { cache: false, source, originIata, destIata, departureDate, travelers }
  }

  if (flightResults.length > 0) {
    await cacheSet(cacheKey, result)
  }

  console.log(`[FlightSearch Stage 7 - API Response] Returning to client: success=${result.success}, count=${flightResults.length}`);
  return result
}

// ─── Exports ──────────────────────────────────────────────────────────────────
module.exports = { searchHotels, searchBuses, searchCars, searchFlights, hotelBookingLink }


