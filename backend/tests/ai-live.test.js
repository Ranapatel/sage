const assert = require('assert')
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') })
const { generateItinerary } = require('../src/services/aiService')

async function testAIGeneration() {
  console.log('=== Testing Live Groq AI Itinerary Generation ===\n')

  const res = await generateItinerary({
    destination: 'Goa',
    from: 'Mumbai',
    days: 3,
    budget: 25000,
    currency: 'INR',
    style: 'balanced',
    preferences: ['beaches', 'seafood'],
    members: 2,
    startDate: '2026-12-01'
  })

  console.log('Result Success:', res.success)
  console.log('Result Meta:', JSON.stringify(res.meta))

  assert.strictEqual(res.success, true, 'AI generation must succeed')
  assert.ok(res.data, 'AI data must exist')
  assert.ok(Array.isArray(res.data.itinerary), 'Itinerary must be an array')
  assert.strictEqual(res.data.itinerary.length, 3, 'Must have 3 days for a 3-day trip')
  assert.strictEqual(res.meta?.fallback, false, 'Must be live AI generation, NOT fallback mock!')

  console.log(`Day 1 places count: ${res.data.itinerary[0]?.places?.length}`)
  console.log(`Day 1 sample place: ${res.data.itinerary[0]?.places[0]?.name}`)
  console.log('\n🎉 LIVE GROQ AI ITINERARY GENERATION PASSED 100% (LIVE RESULT, NO MOCK)!')
}

testAIGeneration().catch(err => {
  console.error('AI Generation Test Failed:', err)
  process.exit(1)
})

