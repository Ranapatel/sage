const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })
const axios = require('axios')
const crypto = require('crypto')

const HOTELBEDS_CONTENT_URL = process.env.HOTELBEDS_CONTENT_URL || 'https://api.test.hotelbeds.com/hotel-content-api/1.0'

function getSignature() {
  const apiKey = process.env.HOTELBEDS_API_KEY
  const apiSecret = process.env.HOTELBEDS_API_SECRET
  const timestamp = Math.floor(Date.now() / 1000)
  const hash = crypto.createHash('sha256')
  hash.update(apiKey + apiSecret + timestamp)
  return hash.digest('hex')
}

function getHeaders() {
  return {
    'Api-key': process.env.HOTELBEDS_API_KEY || '',
    'X-Signature': getSignature(),
    'Accept': 'application/json'
  }
}

async function run() {
  try {
    console.log('Testing bulk facilities catalog fetch...')
    const resBulk = await axios.get(`${HOTELBEDS_CONTENT_URL}/types/facilities`, {
      headers: getHeaders(),
      params: { from: 1, to: 100 },
      timeout: 10000
    })
    console.log('Bulk response status:', resBulk.status)
    console.log('Bulk facilities count:', resBulk.data?.facilities?.length)
  } catch (err) {
    console.error('Bulk fetch failed:', err.response?.status, err.response?.data || err.message)
  }

  try {
    console.log('\nTesting specific facility query...')
    const resSpecific = await axios.get(`${HOTELBEDS_CONTENT_URL}/types/facilities`, {
      headers: getHeaders(),
      params: {
        facilityGroupCode: '70',
        facilityCode: '567',
        fields: 'all',
        language: 'ENG',
        from: 1,
        to: 10
      },
      timeout: 10000
    })
    console.log('Specific query response status:', resSpecific.status)
    console.log('Specific facility:', JSON.stringify(resSpecific.data?.facilities, null, 2))
  } catch (err) {
    console.error('Specific query failed:', err.response?.status, err.response?.data || err.message)
  }
}

run()
