/**
 * Comprehensive Contextual Intelligence Layer Integration Test Suite
 */

import { processContext, buildBudgetContext, resolveScoringWeights } from '../src/context/processor.service'
import { generateCacheKey } from '../src/config/redis'
const { getCategoryFallbackImage } = require('../src/data/cuisineFallbacks')

async function runTests() {
  console.log('--- RUNNING CONTEXTUAL INTELLIGENCE LAYER TESTS ---')
  let passed = 0
  let failed = 0

  function assert(condition: boolean, testName: string, detail?: string) {
    if (condition) {
      console.log(`  ✅ [PASS] ${testName}`)
      passed++
    } else {
      console.error(`  ❌ [FAIL] ${testName}${detail ? `: ${detail}` : ''}`)
      failed++
    }
  }

  // ── 1. Test Budget Allocation for Luxury vs Budget Travel Styles ──────────────
  try {
    const mockTrip = {
      id: 'trip_1',
      destination: 'Puri',
      title: 'Beach Trip',
      startDate: '2026-09-01',
      endDate: '2026-09-05',
      budget: 100000,
      travelers: 2,
      status: 'PLANNED',
      daysUntilStart: 25,
      durationDays: 4,
    }

    const budgetContextLuxury = buildBudgetContext(mockTrip, 'INR', {
      travelStyle: 'luxury',
      budgetRange: 'luxury',
      interests: ['fine dining'],
      foodPreference: ['Seafood'],
      tripDuration: '4',
      favoriteCuisines: ['Italian'],
    })

    const budgetContextBudget = buildBudgetContext(mockTrip, 'INR', {
      travelStyle: 'budget',
      budgetRange: 'budget',
      interests: ['backpacking'],
      foodPreference: ['Street food'],
      tripDuration: '4',
      favoriteCuisines: ['Indian'],
    })

    assert(
      budgetContextLuxury !== null && budgetContextLuxury.allocation.accommodation === 0.45,
      'Luxury Travel Style allocates higher percentage (45%) to accommodation'
    )

    assert(
      budgetContextBudget !== null && budgetContextBudget.allocation.accommodation === 0.40,
      'Budget Travel Style allocates balanced percentage (40%) to accommodation'
    )
  } catch (err: any) {
    assert(false, 'Budget allocation calculation', err.message)
  }

  // ── 2. Test Scoring Weights Resolution for Accessibility & Family Personas ───
  try {
    const weightsFamily = resolveScoringWeights({ travelStyle: 'family', budgetRange: 'medium', interests: [], foodPreference: [], tripDuration: '3', favoriteCuisines: [] }, null)
    assert(weightsFamily.familyScore === 0.12, 'Family travel style resolves familyScore weight of 0.12')

    const weightsAccess = resolveScoringWeights({ travelStyle: 'balanced', budgetRange: 'medium', interests: [], foodPreference: [], tripDuration: '3', favoriteCuisines: [] }, 'Wheelchair user')
    assert(weightsAccess.accessibilityScore === 0.25, 'Accessibility notes trigger accessibilityScore weight of 0.25')
  } catch (err: any) {
    assert(false, 'Scoring weights resolution', err.message)
  }

  // ── 3. Test Cache Key Isolation for Dietary & Accessibility Preferences ─────
  try {
    const keyVegetarian = generateCacheKey('itinerary', {
      destination: 'Puri',
      days: 3,
      budget: 50000,
      food: 'Vegetarian',
      access: 'Wheelchair',
      pace: 'Balanced'
    })

    const keyNonVeg = generateCacheKey('itinerary', {
      destination: 'Puri',
      days: 3,
      budget: 50000,
      food: 'Seafood',
      access: 'None',
      pace: 'Balanced'
    })

    assert(
      keyVegetarian !== keyNonVeg,
      'Cache keys differ when dietary or accessibility preferences change (prevents cache leakage across user personas)'
    )
  } catch (err: any) {
    assert(false, 'Cache key isolation test', err.message)
  }

  // ── 4. Test Multi-City Cache Key Isolation ─────────────────────────────────
  try {
    const keySingleCity = generateCacheKey('itinerary', {
      destination: 'Puri',
      days: 4,
      multi: false,
      stops: ''
    })

    const keyMultiCity = generateCacheKey('itinerary', {
      destination: 'Puri',
      days: 4,
      multi: true,
      stops: 'Puri:2|Bhubaneswar:2'
    })

    assert(
      keySingleCity !== keyMultiCity,
      'Cache keys differ between single-city and multi-city itineraries'
    )
  } catch (err: any) {
    assert(false, 'Multi-city cache key isolation test', err.message)
  }

  // ── 5. Test Category Fallback Image Uniqueness ─────────────────────────────
  try {
    const img1 = getCategoryFallbackImage('dining', 'Grand Ocean View Dining', 'rest_1')
    const img2 = getCategoryFallbackImage('dining', 'Spice Temple Bistro', 'rest_2')

    assert(
      typeof img1 === 'string' && typeof img2 === 'string' && img1 !== img2,
      'Fallback library generates distinct, category-matched photos for different places'
    )
  } catch (err: any) {
    assert(false, 'Fallback image uniqueness test', err.message)
  }

  // ── 6. Test ProcessContext Raw to Canonical Object Normalization ───────────
  try {
    const rawCtx: any = {
      user: {
        id: 'u_123',
        clerkUserId: 'clerk_123',
        email: 'traveler@tripsage.ai',
        firstName: 'Anita',
        lastName: 'Sharma',
        homeCity: 'Delhi',
        country: 'India',
        language: 'en',
        currency: 'INR',
        preferredTransport: 'train',
        dietaryRestrictions: ['Vegetarian'],
        accessibilityNotes: 'Wheelchair access required',
        favoriteAirlines: [],
        favoriteHotelChains: [],
        favoriteCuisines: ['Indian', 'Thai'],
      },
      trip: {
        id: 't_456',
        destination: 'Puri',
        title: 'Spiritual Beach Retreat',
        startDate: '2026-10-10',
        endDate: '2026-10-14',
        budget: 60000,
        travelers: 3,
        status: 'PLANNED',
        daysUntilStart: 65,
        durationDays: 4,
      },
      preferences: {
        travelStyle: 'family',
        budgetRange: 'medium',
        interests: ['temples', 'beaches'],
        foodPreference: ['Vegetarian'],
        accommodationPreference: 'resort',
        tripDuration: '4',
        favoriteCuisines: ['Indian'],
      },
      liveData: { weather: { available: true, description: 'Sunny' } },
      itinerary: null,
      history: { totalTrips: 2, totalSearches: 12, recentFeedback: [] },
      errors: [],
    }

    const processed = processContext(rawCtx)

    assert(processed.version === 1, 'Processed context includes canonical version number 1')
    assert(processed.user.email === 'traveler@tripsage.ai', 'Processed context preserves user email')
    assert(processed.user.currency === 'INR', 'Processed context preserves currency')
    assert(processed.preferences.foodPreference.includes('Vegetarian'), 'Processed context preserves dietary preferences')
    assert(processed.scoringWeights.accessibilityScore === 0.25, 'Processed context correctly applies accessibility scoring weight for accessibility notes')
  } catch (err: any) {
    assert(false, 'ProcessContext normalization test', err.message)
  }

  console.log(`\nTEST RESULTS: ${passed} passed, ${failed} failed.`)
  if (failed > 0) {
    process.exit(1)
  } else {
    console.log('✅ ALL CONTEXTUAL INTELLIGENCE TESTS PASSED SUCCESSFULLY!')
  }
}

runTests().catch(err => {
  console.error('Fatal test error:', err)
  process.exit(1)
})
