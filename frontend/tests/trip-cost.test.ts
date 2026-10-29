import test from 'node:test'
import assert from 'node:assert/strict'
import { allocateBudget, parseSpendAmount, placeSpend, summaryFromBreakdown } from '../lib/planFacts.ts'

test('a rupee amount with a thousands comma is one number', () => {
  assert.equal(parseSpendAmount('₹1,200'), 1200)
  assert.equal(parseSpendAmount('₹1,200 - ₹2,500'), 1850)
  assert.equal(parseSpendAmount('₹500'), 500)
})

test('a numeric stop cost is used instead of a formatted string', () => {
  assert.equal(placeSpend({ estimatedCost: 1200, estimatedSpend: '₹1,200' }), 1200)
})

test('budget lines add up to the budget', () => {
  for (const budget of [0, 1, 33333, 50000, 100000]) {
    const split = allocateBudget(budget)
    assert.equal(split.flights + split.hotels + split.food + split.activities, split.total)
    assert.equal(split.total, Math.max(0, Math.round(budget)))
  }
})

test('a breakdown is kept only when it matches the total', () => {
  assert.equal(summaryFromBreakdown({
    flightsEstimate: 0,
    hotelsEstimate: 20000,
    foodEstimate: 15000,
    activitiesEstimate: 10000,
  }, 1500), null)
  const ok = summaryFromBreakdown({
    flightsEstimate: 0,
    hotelsEstimate: 20000,
    foodEstimate: 15000,
    activitiesEstimate: 10000,
  }, 45000)
  assert.equal(ok?.total, 45000)
})
