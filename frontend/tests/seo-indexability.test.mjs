import { test } from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const frontendRoot = path.resolve(__dirname, '..')

test('SEO Regression: /plan page outputs noindex, follow robots directive', () => {
  const planPagePath = path.join(frontendRoot, 'app', 'plan', 'page.tsx')
  assert.ok(fs.existsSync(planPagePath), 'app/plan/page.tsx must exist')
  
  const content = fs.readFileSync(planPagePath, 'utf8')
  
  // Verify metadata contains robots object with index: false and follow: true
  assert.match(content, /robots:\s*\{[^}]*index:\s*false/s, '/plan must specify index: false')
  assert.match(content, /robots:\s*\{[^}]*follow:\s*true/s, '/plan must specify follow: true')
})

test('SEO Regression: /plan and app-only utility routes are absent from sitemap.xml', () => {
  const sitemapPath = path.join(frontendRoot, 'app', 'sitemap.ts')
  assert.ok(fs.existsSync(sitemapPath), 'app/sitemap.ts must exist')
  
  const content = fs.readFileSync(sitemapPath, 'utf8')
  
  // Verify /plan is NOT present as a sitemap URL
  assert.doesNotMatch(content, /url:\s*`?\$\{baseUrl\}\/plan['"`]/, '/plan must be absent from sitemap.ts')
  assert.doesNotMatch(content, /url:\s*['"]https:\/\/tripsage\.in\/plan['"]/, '/plan must not be in sitemap.ts')
  
  // Verify app-only routes are also absent from sitemap
  const disallowedRoutes = ['sign-in', 'sign-up', 'dashboard', 'profile', 'my-trips', 'trips']
  for (const route of disallowedRoutes) {
    assert.doesNotMatch(
      content,
      new RegExp(`url:\\s*\`?\\$\\{baseUrl\\}\\/${route}['"\`]`),
      `/${route} must be absent from sitemap.ts`
    )
  }
  
  // Verify core public SEO content pages ARE included in sitemap
  const requiredPublicPages = ['ai-trip-planner', 'destinations', 'visa', 'itineraries', 'budget']
  for (const page of requiredPublicPages) {
    assert.match(
      content,
      new RegExp(`url:\\s*\`?\\$\\{baseUrl\\}\\/${page}['"\`]`),
      `/${page} must be present in sitemap.ts`
    )
  }
})

test('SEO Regression: App-only screens output noindex, follow metadata', () => {
  const appRoutes = [
    { file: path.join(frontendRoot, 'app', 'sign-in', '[[...sign-in]]', 'page.tsx'), name: '/sign-in' },
    { file: path.join(frontendRoot, 'app', 'sign-up', 'layout.tsx'), name: '/sign-up' },
    { file: path.join(frontendRoot, 'app', 'dashboard', 'layout.tsx'), name: '/dashboard' },
    { file: path.join(frontendRoot, 'app', 'profile', 'page.tsx'), name: '/profile' },
    { file: path.join(frontendRoot, 'app', 'my-trips', 'page.tsx'), name: '/my-trips' },
    { file: path.join(frontendRoot, 'app', 'trips', 'layout.tsx'), name: '/trips' },
  ]
  
  for (const route of appRoutes) {
    assert.ok(fs.existsSync(route.file), `${route.name} metadata source file must exist: ${route.file}`)
    const content = fs.readFileSync(route.file, 'utf8')
    assert.match(content, /index:\s*false/, `${route.name} must output index: false`)
    assert.match(content, /follow:\s*true/, `${route.name} must output follow: true`)
  }
})

test('SEO Regression: robots.ts does not block crawlers from reading noindex on /plan', () => {
  const robotsPath = path.join(frontendRoot, 'app', 'robots.ts')
  assert.ok(fs.existsSync(robotsPath), 'app/robots.ts must exist')
  
  const content = fs.readFileSync(robotsPath, 'utf8')
  // Ensure /plan is NOT disallowed in robots.ts so search engines can crawl it and see the noindex tag
  assert.doesNotMatch(content, /'\/plan'/, 'robots.ts must not disallow /plan, enabling search engines to read the noindex directive')
})

test('SEO Regression: duplicate bare root paths are 301 redirected to canonical /seo/* paths', () => {
  const nextConfigPath = path.join(frontendRoot, 'next.config.js')
  assert.ok(fs.existsSync(nextConfigPath), 'next.config.js must exist')
  
  const content = fs.readFileSync(nextConfigPath, 'utf8')
  assert.match(content, /source:\s*['"]\/goa-trip-under-10000['"].*destination:\s*['"]\/seo\/goa-trip-under-10000['"].*permanent:\s*true/s)
  assert.match(content, /source:\s*['"]\/budget-bali-trip['"].*destination:\s*['"]\/seo\/budget-bali-trip['"].*permanent:\s*true/s)
  assert.match(content, /source:\s*['"]\/ai-trip-planner-india['"].*destination:\s*['"]\/seo\/ai-trip-planner-india['"].*permanent:\s*true/s)
})
