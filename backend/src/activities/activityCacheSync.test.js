const assert = require('assert')
const { normalizeCacheActivity } = require('./activityCacheSyncService')

const raw = {
  code: 'ACT-123',
  name: { content: 'Test Cache Activity' },
  shortDescription: { content: 'A short desc' },
  active: true,
  destinationCode: 'MAD',
  type: 'EXCURSION',
  priceFrom: { amount: '45.50', currency: 'EUR' },
  images: [{ url: 'http://example.com/img.jpg' }],
  categories: [{ code: 'CAT-A' }],
  segments: ['SEG-B']
}

const normalized = normalizeCacheActivity(raw)
assert.strictEqual(normalized.activityCode, 'ACT-123')
assert.strictEqual(normalized.activityName, 'Test Cache Activity')
assert.strictEqual(normalized.description, 'A short desc')
assert.strictEqual(normalized.amountsFrom.amount, 45.5)
assert.strictEqual(normalized.amountsFrom.currency, 'EUR')
assert.strictEqual(normalized.image, 'http://example.com/img.jpg')
assert.deepStrictEqual(normalized.categories, ['CAT-A'])
assert.deepStrictEqual(normalized.segments, ['SEG-B'])

console.log('activityCacheSync tests passed')
