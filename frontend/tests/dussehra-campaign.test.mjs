import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(__dirname, '..')

test('Dussehra Campaign: /dussehra page exists and exports complete SEO metadata', () => {
  const pagePath = path.join(frontendRoot, 'app', 'dussehra', 'page.tsx')
  assert.ok(fs.existsSync(pagePath), 'app/dussehra/page.tsx must exist')

  const content = fs.readFileSync(pagePath, 'utf8')

  // Check canonical URL
  assert.match(content, /canonical:\s*['"]https:\/\/tripsage\.in\/dussehra['"]/, 'Page must specify canonical URL')

  // Check title & description
  assert.match(content, /title:\s*['"]TripSage Dussehra Escape \| Plan Your Next Trip['"]/, 'Page must have unique title')
  assert.match(content, /description:\s*['"]Plan your next getaway with TripSage/, 'Page must have unique description')

  // Check robots indexability
  assert.match(content, /robots:\s*\{[^}]*index:\s*true/s, 'Campaign page must be indexable (index: true)')
  assert.match(content, /robots:\s*\{[^}]*follow:\s*true/s, 'Campaign page must allow following links (follow: true)')

  // Check schema markup
  assert.match(content, /'@type':\s*'BreadcrumbList'/, 'Page must include BreadcrumbList schema')
  assert.match(content, /'@type':\s*'FAQPage'/, 'Page must include FAQPage schema')
})

test('Dussehra Campaign: route is included in sitemap.ts', () => {
  const sitemapPath = path.join(frontendRoot, 'app', 'sitemap.ts')
  assert.ok(fs.existsSync(sitemapPath), 'app/sitemap.ts must exist')

  const content = fs.readFileSync(sitemapPath, 'utf8')
  assert.match(content, /url:\s*`?\$\{baseUrl\}\/dussehra['"`]/, '/dussehra must be present in sitemap.ts')
})

test('Dussehra Campaign Config: verified dates, destinations, and FAQs', async () => {
  const configPath = path.join(frontendRoot, 'lib', 'dussehraConfig.ts')
  assert.ok(fs.existsSync(configPath), 'lib/dussehraConfig.ts must exist')

  const content = fs.readFileSync(configPath, 'utf8')

  // Verified campaign ID
  assert.match(content, /id:\s*['"]dussehra-2026['"]/, 'Campaign ID must be dussehra-2026')

  // Verified 4 popular destinations
  const destinations = ['Goa', 'Manali', 'Kerala', 'Pondicherry']
  for (const dest of destinations) {
    assert.match(content, new RegExp(`name:\\s*['"]${dest}['"]`), `Destination ${dest} must be configured`)
  }

  // Verified 5 mandated FAQ questions
  const faqs = [
    'Is TripSage free to use\\?',
    'Does TripSage book flights and hotels directly\\?',
    'Are the prices accurate\\?',
    'Do I need to sign up before planning\\?',
    'Can TripSage help me plan within my budget\\?',
  ]
  for (const q of faqs) {
    assert.match(content, new RegExp(q), `FAQ question "${q}" must be present`)
  }

  // Verified dynamic post-festival fallback
  assert.match(content, /function getContextualCopy/, 'getContextualCopy must exist')
  assert.match(content, /post_festival/, 'post_festival status must be supported')
})

test('Dussehra Components: all required campaign sections exist', () => {
  const components = [
    'DussehraPlannerForm.tsx',
    'DussehraProblemSection.tsx',
    'DussehraHowItWorks.tsx',
    'DussehraProductPreview.tsx',
    'DussehraDestinations.tsx',
    'DussehraBanner.tsx',
    'DussehraFAQTrust.tsx',
    'DussehraFinalCTA.tsx',
  ]

  for (const comp of components) {
    const compPath = path.join(frontendRoot, 'components', 'campaign', comp)
    assert.ok(fs.existsSync(compPath), `components/campaign/${comp} must exist`)
  }
})
