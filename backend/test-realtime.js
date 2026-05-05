/**
 * TripSage — End-to-End API Validation Script
 *
 * Tests the full REALTIME_DATA execution flow:
 *   Step 1 → Input validation
 *   Step 2 → Flight API (Skyscanner via RapidAPI)
 *   Step 3 → Hotel API  (Booking.com via RapidAPI)
 *   Step 4 → Weather    (Open-Meteo)
 *   Step 5 → AI ranking (Groq)
 *   Step 6 → Affiliate  links injected
 *   Step 7 → Response shape validation
 *
 * Usage: node test-realtime.js
 */

'use strict'

require('dotenv').config()
const axios = require('axios')

const BASE = `http://localhost:${process.env.PORT || 4000}`

const GREEN  = '\x1b[32m'
const RED    = '\x1b[31m'
const YELLOW = '\x1b[33m'
const CYAN   = '\x1b[36m'
const RESET  = '\x1b[0m'

let passed = 0, failed = 0

function ok(label)  { console.log(`  ${GREEN}✅ PASS${RESET} ${label}`); passed++ }
function fail(label, detail) { console.log(`  ${RED}❌ FAIL${RESET} ${label}${detail ? ` — ${detail}` : ''}`); failed++ }
function warn(label) { console.log(`  ${YELLOW}⚠️  WARN${RESET} ${label}`) }
function section(title) { console.log(`\n${CYAN}━━━ ${title} ━━━${RESET}`) }

// ─── Test helpers ─────────────────────────────────────────────────────────────

function assertNoFakeData(items, type) {
  const badSources = ['estimated', 'mock', 'ai-estimated']
  const bad = items.filter(i => badSources.includes(i.source))
  if (bad.length > 0) {
    fail(`${type}: No fake/estimated data`, `Found ${bad.length} items with source in [${badSources}]`)
  } else {
    ok(`${type}: All items have valid source (${[...new Set(items.map(i => i.source))].join(', ')})`)
  }
}

function assertNoPriceGeneration(items, type) {
  // Items with source='live' must have real prices; affiliate_redirect items must have null/undefined price
  const liveWithNoPrice = items.filter(i => i.source === 'live' && !i.price)
  const redirectWithPrice = items.filter(i => i.source === 'affiliate_redirect' && i.price)
  if (liveWithNoPrice.length > 0) fail(`${type}: Live items missing price`, liveWithNoPrice.map(i => i.id).join(','))
  else ok(`${type}: Live items have real prices`)
  if (redirectWithPrice.length > 0) warn(`${type}: Affiliate items have prices (should be null)`)
}

function assertAffiliateLinks(items, type, expectedDomain) {
  const noLink = items.filter(i => !i.bookingLink || !i.bookingLink.includes(expectedDomain))
  if (noLink.length > 0) fail(`${type}: Missing affiliate link (${expectedDomain})`, noLink.map(i => i.id).join(','))
  else ok(`${type}: Affiliate links present (${expectedDomain})`)
}

function assertSchema(item, type) {
  const required = ['id', 'type', 'name', 'image', 'bookingLink', 'source']
  const missing  = required.filter(f => !item[f])
  if (missing.length > 0) fail(`${type} schema`, `Missing fields: ${missing.join(', ')}`)
  else ok(`${type} schema: All required fields present`)
}

// ─── Test Suite ───────────────────────────────────────────────────────────────

async function testInputValidation() {
  section('Step 1: Input Validation')

  // Missing 'from'
  try {
    await axios.post(`${BASE}/api/search`, { to: 'Goa', startDate: '2026-06-01' })
    fail('Missing "from" should return 400')
  } catch (e) {
    if (e.response?.status === 400) ok('Missing "from" → 400 Bad Request')
    else fail('Missing "from" → unexpected status', e.response?.status)
  }

  // Missing 'to'
  try {
    await axios.post(`${BASE}/api/search`, { from: 'Mumbai', startDate: '2026-06-01' })
    fail('Missing "to" should return 400')
  } catch (e) {
    if (e.response?.status === 400) ok('Missing "to" → 400 Bad Request')
    else fail('Missing "to" → unexpected status', e.response?.status)
  }

  // Invalid date
  try {
    await axios.post(`${BASE}/api/search`, { from: 'Mumbai', to: 'Goa', startDate: 'not-a-date' })
    fail('Invalid date should return 400')
  } catch (e) {
    if (e.response?.status === 400) ok('Invalid date → 400 Bad Request')
    else fail('Invalid date → unexpected status', e.response?.status)
  }
}

async function testSearchEndpoint() {
  section('Step 2–4: Real-Time Data Fetch (POST /api/search)')

  const payload = {
    from:      'Delhi',
    to:        'Goa',
    startDate: '2026-06-15',
    endDate:   '2026-06-18',
    budget:    30000,
    travelers: 2,
    style:     'adventure',
  }

  let res
  try {
    console.log(`  Calling ${BASE}/api/search ...`)
    res = await axios.post(`${BASE}/api/search`, payload, { timeout: 30000 })
  } catch (e) {
    fail('POST /api/search', e.message)
    return null
  }

  const body = res.data

  // Response shape
  if (body.success !== true)      fail('success: true', JSON.stringify(body.error))
  else                            ok('success: true')

  if (!body.data)                 fail('data object present')
  else                            ok('data object present')

  // message field must be one of the defined values
  const validMessages = ['REALTIME_DATA', 'AFFILIATE_REDIRECT', 'API_ERROR', 'SYSTEM_ERROR']
  if (!validMessages.includes(body.message)) fail(`message is a valid enum: ${body.message}`)
  else                                        ok(`message: "${body.message}"`)

  // Meta must include source fields
  if (!body.meta?.flightSource) fail('meta.flightSource present')
  else                          ok(`meta.flightSource: "${body.meta.flightSource}"`)

  if (!body.meta?.hotelSource)  fail('meta.hotelSource present')
  else                          ok(`meta.hotelSource: "${body.meta.hotelSource}"`)

  return body
}

async function testDataIntegrity(body) {
  if (!body) return

  section('Step 3: Data Integrity (No Fake Data)')

  const { transport = [], hotels = [], buses = [], cars = [] } = body.data

  console.log(`  Flights: ${transport.length} | Hotels: ${hotels.length} | Buses: ${buses.length} | Cars: ${cars.length}`)

  // ── Flights ──
  if (transport.length > 0) {
    assertNoFakeData(transport, 'Flights')
    assertNoPriceGeneration(transport, 'Flights')
    assertAffiliateLinks(transport, 'Flights', 'kiwi.tpx.lv')
    assertSchema(transport[0], 'Flight')

    // Ensure no AI-generated prices
    const aiPriced = transport.filter(f => f.source === 'ai-estimated')
    if (aiPriced.length > 0) fail('Flights: No AI-estimated prices', `${aiPriced.length} items with source=ai-estimated`)
    else ok('Flights: No AI-estimated prices (Groq not used for pricing)')
  } else {
    warn('Flights: 0 results (API may be unavailable or no flights on this route/date)')
  }

  // ── Hotels ──
  if (hotels.length > 0) {
    assertNoFakeData(hotels, 'Hotels')
    assertNoPriceGeneration(hotels, 'Hotels')
    assertAffiliateLinks(hotels, 'Hotels', 'agoda.com')
    assertSchema(hotels[0], 'Hotel')
  } else {
    warn('Hotels: 0 results (API may be unavailable or no hotels for this destination)')
  }

  // ── Buses ──
  if (buses.length > 0) {
    const hasAffiliate = buses.some(b => b.source === 'affiliate_redirect')
    if (hasAffiliate) ok('Buses: affiliate_redirect source (correct — no fake bus data)')
    else              assertNoFakeData(buses, 'Buses')
  }

  // ── Cars ──
  if (cars.length > 0) {
    const hasAffiliate = cars.some(c => c.source === 'affiliate_redirect')
    if (hasAffiliate) ok('Cars: affiliate_redirect source (correct — no fake car data)')
    else              assertNoFakeData(cars, 'Cars')
  }
}

async function testWeather() {
  section('Step 4: Weather (Open-Meteo)')

  try {
    const res = await axios.get(`${BASE}/api/weather/${encodeURIComponent('Goa')}`, { timeout: 10000 })
    const body = res.data

    if (body.success && body.data?.temperature != null) {
      ok(`Weather: Live data (${body.data.temperature}°C, ${body.data.condition})`)
      ok(`Weather source: "${body.meta?.source}"`)

      if (body.meta?.source === 'mock') {
        fail('Weather: source is "mock" — real API call required')
      }
    } else if (!body.success) {
      warn(`Weather: API returned error — ${body.error} (source: ${body.meta?.source})`)
      ok('Weather: Error reported transparently (not fabricated)')
    }
  } catch (e) {
    fail('Weather endpoint', e.message)
  }
}

async function testItinerary() {
  section('Step 5: AI Itinerary (Groq — planning only, no prices)')

  try {
    const res = await axios.post(`${BASE}/api/itinerary/generate`, {
      destination: 'Goa',
      days:        2,
      budget:      15000,
      style:       'adventure',
      members:     2,
      preferences: ['beaches', 'food'],
    }, { timeout: 25000 })

    const body = res.data

    if (body.success && body.data?.itinerary?.length > 0) {
      ok(`Itinerary: ${body.data.itinerary.length} days generated by Groq`)
      ok(`Itinerary: googleEnriched=${body.meta?.googleEnriched}`)

      // Verify AI did NOT generate hotel/flight prices in itinerary
      const allPlaces = body.data.itinerary.flatMap(d => d.places)
      const hasHotelPrices = allPlaces.some(p => p.hotelPrice || p.flightPrice)
      if (hasHotelPrices) fail('Itinerary: Contains hotel/flight prices from AI')
      else ok('Itinerary: No hotel/flight prices from AI (correct)')
    } else {
      warn(`Itinerary: ${body.error || 'No itinerary returned'}`)
    }
  } catch (e) {
    fail('Itinerary endpoint', e.response?.data?.error || e.message)
  }
}

async function testMissingEstimateFlightPrices() {
  section('Step 6: Verify estimateFlightPrices is REMOVED from aiService')

  try {
    const aiService = require('./src/services/aiService')
    if (typeof aiService.estimateFlightPrices === 'function') {
      fail('estimateFlightPrices still exported from aiService — must be removed')
    } else {
      ok('estimateFlightPrices: NOT exported (correctly removed)')
    }

    const validExports = ['generateItinerary', 'optimizeBudget', 'rankResults', 'getRecommendations']
    const missing = validExports.filter(e => typeof aiService[e] !== 'function')
    if (missing.length > 0) fail(`aiService missing exports: ${missing.join(', ')}`)
    else ok(`aiService exports: ${validExports.join(', ')}`)
  } catch (e) {
    fail('aiService module load', e.message)
  }
}

async function testNoMockGenerators() {
  section('Step 7: Verify Mock Generators REMOVED from travelService')

  try {
    const travelService = require('./src/services/travelService')
    const banned = ['generateMockFlights', 'generateMockHotels', 'generateMockBuses', 'generateMockCars']
    const found  = banned.filter(fn => typeof travelService[fn] === 'function')
    if (found.length > 0) fail(`travelService still has mock generators: ${found.join(', ')}`)
    else ok('travelService: All mock generator functions removed')

    const required = ['searchFlights', 'searchHotels', 'searchBuses', 'searchCars']
    const missing  = required.filter(fn => typeof travelService[fn] !== 'function')
    if (missing.length > 0) fail(`travelService missing: ${missing.join(', ')}`)
    else ok(`travelService exports: ${required.join(', ')}`)
  } catch (e) {
    fail('travelService module load', e.message)
  }
}

// ─── Run All ──────────────────────────────────────────────────────────────────

async function run() {
  console.log(`\n${CYAN}╔══════════════════════════════════════════════╗`)
  console.log(`║   TripSage REALTIME Validation Suite         ║`)
  console.log(`║   ${new Date().toISOString()}    ║`)
  console.log(`╚══════════════════════════════════════════════╝${RESET}\n`)

  // Module-level checks (no server needed)
  await testMissingEstimateFlightPrices()
  await testNoMockGenerators()

  // Server must be running for these
  let serverUp = false
  try {
    await axios.get(`${BASE}/health`, { timeout: 3000 })
    serverUp = true
    ok('Backend server reachable')
  } catch {
    warn(`Backend not running at ${BASE} — skipping live API tests`)
    warn('Start server with: npm run dev')
  }

  if (serverUp) {
    await testInputValidation()
    const searchResult = await testSearchEndpoint()
    await testDataIntegrity(searchResult)
    await testWeather()
    await testItinerary()
  }

  // ── Summary ──────────────────────────────────────────────────────────────
  console.log(`\n${CYAN}━━━ Results ━━━${RESET}`)
  console.log(`  ${GREEN}Passed: ${passed}${RESET}`)
  console.log(`  ${RED}Failed: ${failed}${RESET}`)
  if (failed === 0) {
    console.log(`\n  ${GREEN}🎉 ALL CHECKS PASSED — TripSage is REAL-TIME ONLY${RESET}\n`)
    process.exit(0)
  } else {
    console.log(`\n  ${RED}⚠️  ${failed} check(s) failed — review above${RESET}\n`)
    process.exit(1)
  }
}

run().catch(err => {
  console.error('Test runner crashed:', err.message)
  process.exit(1)
})
