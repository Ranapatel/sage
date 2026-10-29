import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../lib/analytics/service.ts', import.meta.url), 'utf8')
const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8')

test('the measurement id is not hardcoded', () => {
  assert.doesNotMatch(source, /\|\|\s*'G-/)
  assert.match(source, /NEXT_PUBLIC_GA_MEASUREMENT_ID/)
  assert.match(layout, /isGaConfigured/)
})
