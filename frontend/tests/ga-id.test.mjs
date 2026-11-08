import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = readFileSync(new URL('../lib/analytics/service.ts', import.meta.url), 'utf8')
const layout = readFileSync(new URL('../app/layout.tsx', import.meta.url), 'utf8')

test('the measurement id is not hardcoded', () => {
  assert.doesNotMatch(source, /\|\|\s*'G-/)
  assert.doesNotMatch(source, /G-P4KSB6TZVG/)
  assert.doesNotMatch(layout, /G-P4KSB6TZVG/)
  assert.match(source, /NEXT_PUBLIC_GA_MEASUREMENT_ID/)
  assert.match(layout, /isGaConfigured/)
})

test('a page load sends one explicit page_view and does not reconfigure the tag', () => {
  assert.match(layout, /send_page_view:\s*false/)
  const start = source.indexOf('public pageview')
  const end = source.indexOf('Strongly Typed Domain Methods')
  const pageviewFn = source
    .slice(start, end)
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/^\s*\/\/.*$/gm, '')
  const events = pageviewFn.match(/gtag\(\s*'event'\s*,\s*'page_view'/g) || []
  const configs = pageviewFn.match(/gtag\(\s*'config'/g) || []
  assert.equal(events.length, 1)
  assert.equal(configs.length, 0)
  assert.match(pageviewFn, /page_location:\s*window\.location\.href/)
  assert.match(pageviewFn, /send_to:\s*readGaMeasurementId\(\)/)
})
