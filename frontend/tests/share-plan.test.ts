import test from 'node:test'
import assert from 'node:assert/strict'
import { buildSharePayload, decodePlan, planFromTrip } from '../lib/sharePlan.ts'

test('a shared link round-trips the generated days', () => {
  const plan = planFromTrip({
    destination: 'Rishikesh',
    startDate: '2026-11-21',
    endDate: '2026-11-23',
    itinerary: [
      {
        day: 1,
        date: '2026-11-21',
        places: [{ name: 'Triveni Ghat', time: '09:00', estimatedSpend: '₹100' }],
      },
    ],
  })
  assert.ok(plan)
  const payload = buildSharePayload(plan!, 'https://www.tripsage.in')
  assert.match(payload.text, /Triveni Ghat/)
  assert.match(payload.text, /2026-11-21/)
  const encoded = new URL(payload.url).searchParams.get('trip')
  const restored = decodePlan(encoded || '')
  assert.equal(restored?.destination, 'Rishikesh')
  assert.equal(restored?.days[0].stops[0].name, 'Triveni Ghat')
  assert.equal(restored?.startDate, '2026-11-21')
})
