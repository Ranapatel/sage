const test = require('node:test')
const assert = require('node:assert/strict')
const { dateForDay, stampItineraryDates, reconcileTripCost, originCity } = require('../src/services/itineraryFacts')
const { generateCacheKey } = require('../src/config/redis')

test('a 21 Nov start stays on 21 Nov instead of the day the plan was generated', () => {
  const stamped = stampItineraryDates({
    itinerary: [
      { day: 1, date: '2026-10-29' },
      { day: 2, date: '2026-10-30' },
      { day: 3, date: '2026-10-31' },
    ],
  }, '2026-11-21')

  assert.deepEqual(stamped.itinerary.map(d => d.date), [
    '2026-11-21',
    '2026-11-22',
    '2026-11-23',
  ])
})

test('calendar addition does not shift a date-only string across UTC', () => {
  assert.equal(dateForDay('2026-11-21', 1), '2026-11-21')
  assert.equal(dateForDay('2026-11-21T00:00:00.000Z', 1), '2026-11-21')
  assert.equal(dateForDay('2026-01-31', 2), '2026-02-01')
})

test('trip total equals the sum of the cost breakdown', () => {
  const reconciled = reconcileTripCost({
    totalEstimatedCost: 1500,
    itinerary: [
      {
        slots: {
          morning: { estimatedCost: 100 },
          afternoon: { estimatedCost: 250 },
          evening: { estimatedCost: 150 },
          night: { estimatedCost: 350 },
        },
      },
    ],
    budgetBreakdown: {
      flightsEstimate: 0,
      hotelsEstimate: 20000,
      foodEstimate: 15000,
      activitiesEstimate: 10000,
      remainingBudget: 5000,
    },
  }, { budget: 50000 })

  const bb = reconciled.budgetBreakdown
  const sum = bb.flightsEstimate + bb.hotelsEstimate + bb.foodEstimate + bb.activitiesEstimate
  assert.equal(reconciled.totalEstimatedCost, sum)
  assert.equal(bb.activitiesEstimate, 850)
  assert.equal(bb.remainingBudget, 50000 - sum)
  assert.ok(sum <= 50000)
})

test('two origins do not share an itinerary cache key', () => {
  assert.equal(originCity('Delhi, India'), 'delhi')
  assert.equal(originCity('  Mumbai '), 'mumbai')
  assert.equal(originCity(''), '')
  const shared = { destination: 'Goa', days: 3, budgetBand: 50000, style: 'adventure', members: 2, preferences: '' }
  const delhi = generateCacheKey('itinerary_v8', { ...shared, from: originCity('Delhi') })
  const mumbai = generateCacheKey('itinerary_v8', { ...shared, from: originCity('Mumbai') })
  const unnamed = generateCacheKey('itinerary_v8', { ...shared, from: originCity(undefined) })
  assert.notEqual(delhi, mumbai)
  assert.notEqual(delhi, unnamed)
})

test('a second reconcile does not change a total that already matches', () => {
  const once = reconcileTripCost({
    itinerary: [{ places: [{ estimatedCost: 400 }, { estimatedCost: 600 }] }],
    budgetBreakdown: { hotelsEstimate: 1000, foodEstimate: 500, flightsEstimate: 0 },
  }, { budget: 5000 })
  const twice = reconcileTripCost(once, { budget: 5000 })
  assert.deepEqual(twice.budgetBreakdown, once.budgetBreakdown)
  assert.equal(twice.totalEstimatedCost, once.totalEstimatedCost)
})
