/**
 * TripSage Production Readiness & API Verification Test Suite
 * Natively executable test runner for Prisma PostgreSQL architecture.
 */

import assert from 'assert'
import { prisma } from '../src/prisma/prisma.client'

async function runProductionTests() {
  console.log('--- TripSage Production Integration Tests ---')

  try {
    // 1. Verify Database Connection
    console.log('[Test 1] Testing Prisma PostgreSQL Connection...')
    await prisma.$connect()
    const result = await prisma.$queryRaw<any[]>`SELECT 1 as alive`
    assert.strictEqual(Array.isArray(result), true, 'PostgreSQL query result should be an array')
    console.log('✅ [Test 1 Passed] PostgreSQL Prisma Connection is Active!')

    // 2. Verify Reviews Model
    console.log('[Test 2] Testing Reviews Model CRUD (Prisma PostgreSQL)...')
    const testReview = await prisma.review.create({
      data: {
        name: 'Test Traveler',
        location: 'Paris, France',
        rating: 5,
        reviewText: 'Exceptional AI-planned itinerary! Highly recommended.',
      },
    })
    assert.ok(testReview.id, 'Review ID should be defined')
    assert.strictEqual(testReview.name, 'Test Traveler', 'Review name should match')
    assert.strictEqual(testReview.rating, 5, 'Review rating should be 5')

    const reviews = await prisma.review.findMany({
      where: { id: testReview.id },
    })
    assert.strictEqual(reviews.length, 1, 'Should find inserted review')

    await prisma.review.delete({
      where: { id: testReview.id },
    })
    console.log('✅ [Test 2 Passed] Reviews Model CRUD verified cleanly!')

    // 3. Verify User & SavedItem Relations
    console.log('[Test 3] Testing User & SavedItem Prisma Schema Relations...')
    const uniqueEmail = `test.traveler.${Date.now()}@tripsage.in`
    const clerkId = `clerk_test_${Date.now()}`

    const user = await prisma.user.create({
      data: {
        clerkUserId: clerkId,
        email: uniqueEmail,
        firstName: 'Test',
        lastName: 'User',
      },
    })
    assert.ok(user.id, 'User ID should be generated')

    const savedItem = await prisma.savedItem.create({
      data: {
        userId: user.id,
        itemType: 'hotel',
        type: 'hotel',
        title: 'Grand Paris Hotel',
        details: { price: 250, currency: 'EUR' },
      },
    })
    assert.ok(savedItem.id, 'SavedItem ID should be generated')

    await prisma.savedItem.delete({ where: { id: savedItem.id } })
    await prisma.user.delete({ where: { id: user.id } })
    console.log('✅ [Test 3 Passed] User & SavedItem Schema Relations verified cleanly!')

    console.log('🎉 ALL PRODUCTION READINESS INTEGRATION TESTS PASSED 100%!')
  } catch (err: any) {
    console.error('❌ [Test Failure]:', err.message || err)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

runProductionTests()
