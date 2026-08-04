/**
 * Contextual Consistency Test Suite — TripSage
 *
 * Validates that the DestinationResolverService and DestinationValidationGuard
 * correctly resolve, validate, and filter destinations.
 * 
 * Run: npx ts-node src/tests/contextualConsistency.test.ts
 */

import { DestinationResolverService, CanonicalDestinationContext } from '../services/destinationResolver.service'
import {
  haversineDistanceKm,
  isValidDestinationItem,
  validateAndSanitizeActivities,
  validateAndSanitizeRestaurants,
  validateAndSanitizeItinerary,
} from '../middleware/destinationValidationGuard'

// ── Test Utilities ──────────────────────────────────────────────────────────

let passed = 0
let failed = 0

function assert(condition: boolean, message: string): void {
  if (condition) {
    passed++
    console.log(`  ✅ PASS: ${message}`)
  } else {
    failed++
    console.error(`  ❌ FAIL: ${message}`)
  }
}

// ── Test 1: Haversine Distance ──────────────────────────────────────────────

console.log('\n══════════════════════════════════════════════════════════════')
console.log('TEST 1: Haversine Distance Calculations')
console.log('══════════════════════════════════════════════════════════════')

// Kochi (9.931, 76.267) to Delhi (28.614, 77.209) should be ~2100km
const kochiToDelhi = haversineDistanceKm(9.931, 76.267, 28.614, 77.209)
assert(kochiToDelhi > 2000 && kochiToDelhi < 2300, `Kochi to Delhi distance = ${kochiToDelhi.toFixed(1)}km (expected ~2100km)`)

// Kochi (9.931, 76.267) to Fort Kochi (9.964, 76.243) should be < 5km
const kochiToFortKochi = haversineDistanceKm(9.931, 76.267, 9.964, 76.243)
assert(kochiToFortKochi < 5, `Kochi to Fort Kochi distance = ${kochiToFortKochi.toFixed(1)}km (expected < 5km)`)

// ── Test 2: Destination Item Validation ─────────────────────────────────────

console.log('\n══════════════════════════════════════════════════════════════')
console.log('TEST 2: Destination Item Validation')
console.log('══════════════════════════════════════════════════════════════')

const kochiContext: CanonicalDestinationContext = {
  city: 'Kochi',
  state: 'Kerala',
  country: 'India',
  normalizedName: 'Kochi, Kerala, India',
  latitude: 9.931,
  longitude: 76.267,
  timezone: 'Asia/Kolkata',
  radiusKm: 35,
  keywords: ['kochi', 'cochin', 'ernakulam', 'kerala', 'india'],
}

// Valid: Fort Kochi (within radius)
const fortKochi = isValidDestinationItem(
  { name: 'Fort Kochi', latitude: 9.964, longitude: 76.243, address: 'Fort Kochi, Kochi' },
  kochiContext
)
assert(fortKochi.valid === true, 'Fort Kochi (9.964, 76.243) is VALID for Kochi destination')

// Valid: Marine Drive Kochi (within radius)
const marineDrive = isValidDestinationItem(
  { name: 'Marine Drive', latitude: 9.981, longitude: 76.275, address: 'Marine Drive, Kochi' },
  kochiContext
)
assert(marineDrive.valid === true, 'Marine Drive Kochi is VALID for Kochi destination')

// INVALID: India Gate Delhi (far from Kochi)
const indiaGate = isValidDestinationItem(
  { name: 'India Gate', latitude: 28.613, longitude: 77.230, address: 'India Gate, New Delhi' },
  kochiContext
)
assert(indiaGate.valid === false, 'India Gate Delhi (28.613, 77.230) is REJECTED for Kochi destination')

// INVALID: Baga Beach Goa (far from Kochi)
const bagaBeach = isValidDestinationItem(
  { name: 'Baga Beach', latitude: 15.555, longitude: 73.755, address: 'Baga Beach, North Goa' },
  kochiContext
)
assert(bagaBeach.valid === false, 'Baga Beach Goa (15.555, 73.755) is REJECTED for Kochi destination')

// INVALID: Gateway of India Mumbai (far from Kochi)
const gatewayOfIndia = isValidDestinationItem(
  { name: 'Gateway of India', latitude: 18.922, longitude: 72.835, address: 'Gateway of India, Mumbai' },
  kochiContext
)
assert(gatewayOfIndia.valid === false, 'Gateway of India Mumbai (18.922, 72.835) is REJECTED for Kochi destination')

// Valid by keyword: Address mentions Kochi but no coordinates
const keywordMatch = isValidDestinationItem(
  { name: 'Local Restaurant', address: 'MG Road, Ernakulam, Kochi' },
  kochiContext
)
assert(keywordMatch.valid === true, 'Address mentioning "Kochi" or "Ernakulam" is VALID by keyword match')

// ── Test 3: Activities Batch Validation ─────────────────────────────────────

console.log('\n══════════════════════════════════════════════════════════════')
console.log('TEST 3: Activities Batch Validation (Kochi destination)')
console.log('══════════════════════════════════════════════════════════════')

const mixedActivities = [
  { name: 'Chinese Fishing Nets', latitude: 9.966, longitude: 76.229, address: 'Fort Kochi' },
  { name: 'Mattancherry Palace', latitude: 9.958, longitude: 76.259, address: 'Mattancherry, Kochi' },
  { name: 'India Gate', latitude: 28.613, longitude: 77.230, address: 'New Delhi' },
  { name: 'Cherai Beach', latitude: 10.140, longitude: 76.179, address: 'Cherai, Kochi' },
  { name: 'Basilica of Bom Jesus', latitude: 15.500, longitude: 73.912, address: 'Old Goa, Goa' },
  { name: 'Backwater Cruise', latitude: 9.905, longitude: 76.266, address: 'Kochi Backwaters' },
]

const { validActivities, rejectedCount } = validateAndSanitizeActivities(mixedActivities, kochiContext)
assert(validActivities.length === 4, `4 valid Kochi activities retained (got ${validActivities.length})`)
assert(rejectedCount === 2, `2 cross-city activities rejected (got ${rejectedCount})`)
assert(
  validActivities.every(a => a.name !== 'India Gate' && a.name !== 'Basilica of Bom Jesus'),
  'India Gate (Delhi) and Basilica of Bom Jesus (Goa) are both rejected'
)

// ── Test 4: Restaurants Batch Validation ────────────────────────────────────

console.log('\n══════════════════════════════════════════════════════════════')
console.log('TEST 4: Restaurants Batch Validation (Kochi destination)')
console.log('══════════════════════════════════════════════════════════════')

const mixedRestaurants = [
  { name: 'Kayees Biryani', latitude: 9.982, longitude: 76.282, address: 'Mattancherry, Kochi' },
  { name: 'Olive Bar & Kitchen', latitude: 28.567, longitude: 77.213, address: 'Mehrauli, New Delhi' },
  { name: 'Fort House Restaurant', latitude: 9.963, longitude: 76.241, address: 'Fort Kochi' },
  { name: "Mum's Kitchen", latitude: 15.495, longitude: 73.815, address: 'Panaji, Goa' },
]

const restResult = validateAndSanitizeRestaurants(mixedRestaurants, kochiContext)
assert(restResult.validRestaurants.length === 2, `2 valid Kochi restaurants retained (got ${restResult.validRestaurants.length})`)
assert(restResult.rejectedCount === 2, `2 cross-city restaurants rejected (got ${restResult.rejectedCount})`)

// ── Test 5: Itinerary Validation ────────────────────────────────────────────

console.log('\n══════════════════════════════════════════════════════════════')
console.log('TEST 5: Itinerary Day-by-Day Validation (Kochi destination)')
console.log('══════════════════════════════════════════════════════════════')

const mockItinerary = {
  destination: 'Kochi, India',
  itinerary: [
    {
      day: 1,
      activities: [
        { name: 'Fort Kochi Walk', latitude: 9.964, longitude: 76.243 },
        { name: 'India Gate Delhi', latitude: 28.613, longitude: 77.230 },
        { name: 'Mattancherry Palace', latitude: 9.958, longitude: 76.259 },
      ],
    },
    {
      day: 2,
      activities: [
        { name: 'Marine Drive Kochi', latitude: 9.981, longitude: 76.275 },
        { name: 'Baga Beach Goa', latitude: 15.555, longitude: 73.755 },
      ],
    },
  ],
}

const cleanedItinerary = validateAndSanitizeItinerary(mockItinerary, kochiContext)
const day1Acts = cleanedItinerary.itinerary[0].activities
const day2Acts = cleanedItinerary.itinerary[1].activities

assert(day1Acts.length === 2, `Day 1: 2 valid stops retained (got ${day1Acts.length})`)
assert(day2Acts.length === 1, `Day 2: 1 valid stop retained (got ${day2Acts.length})`)
assert(
  day1Acts.every((a: any) => a.name !== 'India Gate Delhi'),
  'India Gate Delhi removed from Day 1'
)
assert(
  day2Acts.every((a: any) => a.name !== 'Baga Beach Goa'),
  'Baga Beach Goa removed from Day 2'
)
assert(
  cleanedItinerary.destinationContext?.city === 'Kochi',
  'Destination context attached to cleaned itinerary'
)

// ── Test 6: Cross-City Route Scenarios ──────────────────────────────────────

console.log('\n══════════════════════════════════════════════════════════════')
console.log('TEST 6: Cross-City Route Validation Scenarios')
console.log('══════════════════════════════════════════════════════════════')

// Scenario: Hyderabad → Kochi
const hydToKochiActs = [
  { name: 'Charminar', latitude: 17.361, longitude: 78.474, address: 'Hyderabad' },
  { name: 'Fort Kochi', latitude: 9.964, longitude: 76.243, address: 'Kochi' },
]
const htkResult = validateAndSanitizeActivities(hydToKochiActs, kochiContext)
assert(htkResult.validActivities.length === 1, 'Hyderabad→Kochi: Only Fort Kochi retained (Charminar rejected)')
assert(htkResult.validActivities[0].name === 'Fort Kochi', 'Hyderabad→Kochi: Fort Kochi is the valid result')

// Scenario: Delhi → Goa — verify Delhi items rejected for Goa context
const goaContext: CanonicalDestinationContext = {
  city: 'Goa',
  state: 'Goa',
  country: 'India',
  normalizedName: 'Goa, Goa, India',
  latitude: 15.300,
  longitude: 74.124,
  timezone: 'Asia/Kolkata',
  radiusKm: 35,
  keywords: ['goa', 'panaji', 'madgaon', 'india'],
}

const delhiToGoaActs = [
  { name: 'India Gate', latitude: 28.613, longitude: 77.230, address: 'New Delhi' },
  { name: 'Red Fort', latitude: 28.656, longitude: 77.241, address: 'Old Delhi' },
  { name: 'Basilica of Bom Jesus', latitude: 15.500, longitude: 73.912, address: 'Old Goa' },
  { name: 'Fort Aguada', latitude: 15.494, longitude: 73.773, address: 'Sinquerim, Goa' },
  { name: 'Baga Beach', latitude: 15.555, longitude: 73.755, address: 'North Goa' },
]
const dtgResult = validateAndSanitizeActivities(delhiToGoaActs, goaContext)
assert(dtgResult.validActivities.length === 3, `Delhi→Goa: 3 Goa activities retained (got ${dtgResult.validActivities.length})`)
assert(dtgResult.rejectedCount === 2, `Delhi→Goa: 2 Delhi items rejected (got ${dtgResult.rejectedCount})`)
assert(
  dtgResult.validActivities.every(a => a.name !== 'India Gate' && a.name !== 'Red Fort'),
  'Delhi→Goa: India Gate and Red Fort are both rejected'
)

// ── Final Summary ───────────────────────────────────────────────────────────

console.log('\n══════════════════════════════════════════════════════════════')
console.log(`RESULTS: ${passed} passed, ${failed} failed (${passed + failed} total)`)
console.log('══════════════════════════════════════════════════════════════')

if (failed > 0) {
  process.exit(1)
} else {
  console.log('\n🎯 ALL TESTS PASSED — 100% contextual destination consistency verified.\n')
  process.exit(0)
}
