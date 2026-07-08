const STATES = Object.freeze({
  PRECONFIRMED: 'PRECONFIRMED',
  PAYMENT_PENDING: 'PAYMENT_PENDING',
  PAID: 'PAID',
  RECONFIRMING: 'RECONFIRMING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  EXPIRED: 'EXPIRED',
  FAILED: 'FAILED',
  RECONFIRM_FAILED: 'RECONFIRM_FAILED',
})

const transitions = Object.freeze({
  [STATES.PRECONFIRMED]: new Set([STATES.PAYMENT_PENDING, STATES.PAID, STATES.EXPIRED, STATES.FAILED]),
  [STATES.PAYMENT_PENDING]: new Set([STATES.PAID, STATES.EXPIRED, STATES.FAILED]),
  [STATES.PAID]: new Set([STATES.RECONFIRMING, STATES.RECONFIRM_FAILED]),
  [STATES.RECONFIRMING]: new Set([STATES.CONFIRMED, STATES.RECONFIRM_FAILED]),
  [STATES.RECONFIRM_FAILED]: new Set([STATES.RECONFIRMING, STATES.CONFIRMED, STATES.FAILED]),
  [STATES.CONFIRMED]: new Set([STATES.CANCELLED]),
  [STATES.CANCELLED]: new Set([]),
  [STATES.EXPIRED]: new Set([]),
  [STATES.FAILED]: new Set([]),
})

function canTransition(from, to) {
  return Boolean(transitions[from]?.has(to))
}

function assertTransition(from, to) {
  if (!canTransition(from, to)) {
    throw Object.assign(
      new Error(`Invalid booking status transition from '${from}' to '${to}'.`),
      { statusCode: 409, code: 'INVALID_BOOKING_STATE_TRANSITION' }
    )
  }
}

module.exports = { STATES, canTransition, assertTransition }
