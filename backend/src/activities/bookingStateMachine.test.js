const assert = require('assert')
const { STATES, canTransition, assertTransition } = require('./bookingStateMachine')

assert.strictEqual(canTransition(STATES.PRECONFIRMED, STATES.PAYMENT_PENDING), true)
assert.strictEqual(canTransition(STATES.PAYMENT_PENDING, STATES.PAID), true)
assert.strictEqual(canTransition(STATES.PAID, STATES.RECONFIRMING), true)
assert.strictEqual(canTransition(STATES.RECONFIRMING, STATES.CONFIRMED), true)
assert.strictEqual(canTransition(STATES.CONFIRMED, STATES.CANCELLED), true)

assert.strictEqual(canTransition(STATES.CONFIRMED, STATES.PAID), false)
assert.strictEqual(canTransition(STATES.CANCELLED, STATES.CONFIRMED), false)

assert.doesNotThrow(() => assertTransition(STATES.PAID, STATES.RECONFIRMING))
assert.throws(
  () => assertTransition(STATES.CANCELLED, STATES.CONFIRMED),
  /Invalid booking status transition/
)

console.log('bookingStateMachine tests passed')
