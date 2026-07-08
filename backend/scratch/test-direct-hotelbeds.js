const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../.env') })
const hotelbedsService = require('../src/services/hotelbedsService')

async function run() {
  console.log('API Key:', process.env.HOTELBEDS_API_KEY)
  console.log('API Secret:', process.env.HOTELBEDS_API_SECRET)
  
  try {
    const result = await hotelbedsService.searchHotels({
      destination: 'Goa',
      checkin: '2026-09-25',
      checkout: '2026-09-28',
      members: 2,
      rooms: 1,
      adults: 2,
      children: 0
    })
    console.log('Result Success:', result.success)
    console.log('Meta:', result.meta)
    if (result.data) {
      console.log('Number of hotels:', result.data.length)
      if (result.data.length > 0) {
        console.log('Sample hotel rooms:', JSON.stringify(result.data[0].rooms, null, 2))
      }
    }
  } catch (err) {
    console.error('Direct Test Error:', err)
  }
}

run()
