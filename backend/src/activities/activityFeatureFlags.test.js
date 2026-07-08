const assert = require('assert')
const { isFeatureEnabled } = require('./activityFeatureFlags')

process.env.ACTIVITIES_BOOKING_ENABLED = 'true'
process.env.ACTIVITIES_CACHE_SEARCH_ENABLED = 'false'

assert.strictEqual(isFeatureEnabled('ACTIVITIES_BOOKING_ENABLED'), true)
assert.strictEqual(isFeatureEnabled('ACTIVITIES_CACHE_SEARCH_ENABLED'), false)
assert.strictEqual(isFeatureEnabled('UNSET_FLAG', true), true)
assert.strictEqual(isFeatureEnabled('UNSET_FLAG', false), false)

console.log('activityFeatureFlags tests passed')
