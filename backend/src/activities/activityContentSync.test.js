const assert = require('assert')
const { normalizeContentActivity } = require('./activityContentSyncService')

const raw = {
  code: 'ACT-C45',
  name: { content: 'Luxury Cruise' },
  description: { content: 'Private catamaran sailing' },
  active: true,
  images: [{ url: 'http://cdn/cat1.jpg' }],
  categories: [{ name: 'Water Sports' }],
  segments: ['Yachting']
}

const normalized = normalizeContentActivity(raw)
assert.strictEqual(normalized.activityCode, 'ACT-C45')
assert.strictEqual(normalized.activityName, 'Luxury Cruise')
assert.strictEqual(normalized.description, 'Private catamaran sailing')
assert.strictEqual(normalized.image, 'http://cdn/cat1.jpg')
assert.deepStrictEqual(normalized.categories, ['Water Sports'])
assert.deepStrictEqual(normalized.segments, ['Yachting'])

console.log('activityContentSync tests passed')
