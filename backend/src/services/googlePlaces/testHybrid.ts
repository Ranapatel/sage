/**
 * Test Script — Hybrid Itinerary Engine End-to-End Test
 * Run: npx ts-node src/services/googlePlaces/testHybrid.ts
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load environment variables from backend root
config({ path: resolve(__dirname, '../../../.env') })

import { HybridItineraryService } from './hybridItinerary.service'
import { connectRedis } from '../../../config/redis'

async function run() {
  console.log('--- Hybrid Itinerary Engine End-to-End Verification Test ---')
  console.log('API Key configured:', !!process.env.GOOGLE_PLACES_API_KEY)
  console.log('Groq Key configured:', !!process.env.GROQ_API_KEY)

  // Initialize cache
  await connectRedis()

  try {
    const start = Date.now()
    const itinerary = await HybridItineraryService.generate({
      destination: 'Manali, India',
      days: 2,
      budget: 15000,
      style: 'cultural',
      members: 2,
      preferences: ['history', 'photography', 'palaces', 'street food'],
      startDate: '2026-10-15',
    })

    const duration = ((Date.now() - start) / 1000).toFixed(2)
    console.log(`\n✅ Itinerary generated successfully in ${duration}s!`)
    console.log('Destination City:', itinerary.destination)
    console.log('Trip Days:', itinerary.days)
    console.log('Total Cost:', itinerary.totalEstimatedCost)
    console.log('Budget Breakdown:', JSON.stringify(itinerary.budgetBreakdown, null, 2))
    console.log('Tips Count:', itinerary.tips.length)

    const day1 = itinerary.itinerary[0]
    console.log(`\n--- Day 1 Slots ---`)
    console.log('Morning:', day1.slots.morning?.name, '-', day1.slots.morning?.activity)
    console.log('Morning Google Maps:', day1.slots.morning?.googleMapsUrl)
    console.log('Morning Rating:', day1.slots.morning?.rating, '(', day1.slots.morning?.reviewsCount, 'reviews)')
    console.log('Morning AI Review Summary:', JSON.stringify(day1.slots.morning?.reviewSummary, null, 2))

    console.log('Afternoon:', day1.slots.afternoon?.name, '-', day1.slots.afternoon?.activity)
    console.log('Evening:', day1.slots.evening?.name, '-', day1.slots.evening?.activity)
    console.log('Night:', day1.slots.night?.name, '-', day1.slots.night?.activity)

    console.log(`\nTransit Time: ${day1.travelTimeMinutes} mins`)
    console.log(`Walking Distance: ${day1.walkingDistanceMeters} meters`)
    console.log(`Indoor alternatives:`, day1.rainyDayAlternatives)

  } catch (err: any) {
    console.error('\n❌ Test execution failed:', err.message)
    if (err.stack) console.error(err.stack)
  }

  process.exit(0)
}

run()
