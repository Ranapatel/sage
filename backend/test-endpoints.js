const axios = require('axios')

const API_BASE = 'http://localhost:5000'

const endpoints = [
  '/api/profile',
  '/api/profile/preferences',
  '/api/profile/stats',
  '/api/profile/saved',
  '/api/profile/memories',
  '/api/profile/wallet',
  '/api/profile/referrals',
  '/api/trips',
]

async function testEndpoints() {
  console.log('=== Testing Backend API Endpoints (Port 5000) ===\n')

  for (const ep of endpoints) {
    try {
      // 1. Unauthenticated test
      const res1 = await axios.get(`${API_BASE}${ep}`, { validateStatus: () => true })
      console.log(`[UNAUTH] GET ${ep} → Status: ${res1.status} | Success: ${res1.data?.success} | Message: ${res1.data?.message || 'N/A'}`)

      // 2. Mock bearer header test
      const res2 = await axios.get(`${API_BASE}${ep}`, {
        headers: { Authorization: 'Bearer mock_token_for_testing' },
        validateStatus: () => true,
      })
      console.log(`[MOCK AUTH] GET ${ep} → Status: ${res2.status} | Success: ${res2.data?.success} | Message: ${res2.data?.message || 'N/A'}`)
      console.log('---')
    } catch (err) {
      console.error(`ERROR testing ${ep}:`, err.message)
    }
  }
}

testEndpoints()
