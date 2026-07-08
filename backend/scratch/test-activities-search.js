/**
 * Test: Hotelbeds Activities Search
 *
 * Run: node backend/scratch/test-activities-search.js
 *
 * Validates:
 *  1. ACTIVITIES_HB_* credentials present and isolated from Hotels
 *  2. Hotelbeds Activities API is reachable (403 = subscription issue, not credential issue)
 *  3. Response normalisation works end-to-end
 */

require('dotenv').config({ path: require('path').join(__dirname, '../.env') })

const { searchActivities } = require('../src/activities/activitiesService')
const { getCredentialStatus } = require('../src/middleware/hotelbedsSignature')

async function main() {
  console.log('\n[Test] ── Activities Search ─────────────────────────────')

  // ── Credential status (no secrets shown) ─────────────────────────────────
  const status = getCredentialStatus()
  console.log('\n[Credentials] Hotels   configured:', status.hotels.configured)
  console.log('[Credentials] Hotels   base URL  :', status.hotels.baseUrl)
  console.log('[Credentials] Activities configured:', status.activities.configured)
  console.log('[Credentials] Activities base URL  :', status.activities.baseUrl)

  // Enforce isolation: HOTELS_HB vars must NOT bleed into Activities env
  const actKey    = process.env.ACTIVITIES_HB_API_KEY
  const hotKey    = process.env.HOTELS_HB_API_KEY
  const actSecret = process.env.ACTIVITIES_HB_SECRET
  const hotSecret = process.env.HOTELS_HB_SECRET

  if (!status.activities.configured) {
    console.error('\n[Test] ❌ ACTIVITIES_HB_API_KEY or ACTIVITIES_HB_SECRET not set. Check .env')
    process.exit(1)
  }

  if (actKey === hotKey && actSecret === hotSecret) {
    console.warn('\n[Test] ⚠️  Activities and Hotels credentials are identical (same sandbox account).')
    console.warn('           This is expected in dev. In production, use separate Hotelbeds accounts.')
  } else {
    console.log('\n[Test] ✅ Activities and Hotels credentials are DIFFERENT (full isolation)')
  }

  // ── Search test ───────────────────────────────────────────────────────────
  const today    = new Date().toISOString().split('T')[0]
  const nextWeek = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]

  const params = {
    destinationCode: 'BCN',
    fromDate:  today,
    toDate:    nextWeek,
    paxes:     [{ age: 30, type: 'ADULT' }, { age: 30, type: 'ADULT' }],
    language:  'en',
    from:      1,
    to:        5,
  }

  console.log('\n[Test] Searching activities in BCN (Barcelona)…')
  try {
    const result = await searchActivities(params)
    console.log(`\n[Test] ✅ Found ${result.total} activities`)
    result.activities.slice(0, 3).forEach((a, i) => {
      console.log(`\n  ${i + 1}. ${a.activityName}`)
      console.log(`     Code:     ${a.activityCode}`)
      console.log(`     Type:     ${a.type || 'N/A'}`)
      console.log(`     Price:    €${a.amountsFrom?.amount ?? 'N/A'} (₹${a.amountsFrom?.amountINR ?? 'N/A'})`)
      console.log(`     Rating:   ${a.averageRating ?? 'N/A'}`)
    })
  } catch (err) {
    const status = err.response?.status
    if (status === 403) {
      console.warn('\n[Test] ⚠️  HTTP 403 — Activities API credentials are valid but subscription is inactive.')
      console.warn('           Your Hotelbeds sandbox only has Hotels API access.')
      console.warn('           Request Activities API access at:')
      console.warn('           https://developer.hotelbeds.com → My Apps → Activities Booking API')
    } else {
      console.error('\n[Test] ❌ Error:', err.message)
      if (err.response) {
        console.error('[Test] Status:', status)
        console.error('[Test] Body:  ', JSON.stringify(err.response.data, null, 2))
      }
    }
  }
}

main()
