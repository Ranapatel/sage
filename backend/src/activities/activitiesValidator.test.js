const assert = require('assert')
const {
  preconfirmSchema,
  bookingListSchema,
} = require('./activitiesValidator')

const validPreconfirm = {
  bookingId: '11111111-1111-4111-8111-111111111111',
  activityCode: 'ACT-1',
  activityName: 'City Walk',
  language: 'en',
  fromDate: '2026-08-01',
  toDate: '2026-08-01',
  passengers: [{ firstName: 'Ada', lastName: 'Lovelace', age: 33, type: 'ADULT' }],
  holder: {
    firstName: 'Ada',
    lastName: 'Lovelace',
    email: 'ada@example.com',
    phone: '+919999999999',
  },
  amount: 50,
  currency: 'EUR',
}

const parsed = preconfirmSchema.safeParse({
  ...validPreconfirm,
  rateKey: 'client-supplied-key',
})

assert.strictEqual(parsed.success, true)
assert.strictEqual(Object.prototype.hasOwnProperty.call(parsed.data, 'rateKey'), false)

assert.strictEqual(bookingListSchema.safeParse({ status: 'RECONFIRM_FAILED' }).success, true)
assert.strictEqual(bookingListSchema.safeParse({ status: 'UNKNOWN' }).success, false)

console.log('activitiesValidator tests passed')
