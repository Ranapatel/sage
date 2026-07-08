const repo = require('./activitiesRepository')

function rateKeyExpiredError() {
  return Object.assign(
    new Error('rateKey has expired or was not found. Please re-fetch activity details.'),
    { statusCode: 410, code: 'RATE_KEY_EXPIRED' }
  )
}

async function consumeRateKey(bookingId) {
  const storedKey = await getRateKey(bookingId)

  await repo.invalidateRateKey(bookingId)
  return storedKey
}

async function getRateKey(bookingId) {
  const storedKey = await repo.getRateKey(bookingId)
  if (!storedKey) throw rateKeyExpiredError()
  return storedKey
}

async function invalidateRateKey(bookingId) {
  await repo.invalidateRateKey(bookingId)
}

module.exports = { getRateKey, invalidateRateKey, consumeRateKey, rateKeyExpiredError }
