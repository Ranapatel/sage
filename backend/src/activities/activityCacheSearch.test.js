const assert = require('assert')
const { normalizeSearchInput } = require('./activityCacheSearchService')

const input = {
  destinationCode: 'MAD',
  keyword: 'tour',
  activityType: 'EXCURSION',
  minPrice: 10,
  maxPrice: 100,
  page: '2',
  limit: '15'
}

const normalized = normalizeSearchInput(input)
assert.strictEqual(normalized.destinationCode, 'MAD')
assert.strictEqual(normalized.keyword, 'tour')
assert.strictEqual(normalized.category, 'EXCURSION')
assert.strictEqual(normalized.minPrice, 10)
assert.strictEqual(normalized.maxPrice, 100)
assert.strictEqual(normalized.page, 2)
assert.strictEqual(normalized.limit, 15)

console.log('activityCacheSearch tests passed')
