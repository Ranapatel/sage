const axios = require('axios')

async function testValidMemory() {
  try {
    const res = await axios.post(`http://localhost:5000/api/profile/memories`, {
      title: 'Scuba Diving in Goa',
      description: 'Crystal clear waters and marine life',
      location: 'Grand Island, Goa',
      photos: ['https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800'],
      tripId: null
    }, {
      headers: { Authorization: 'Bearer dev.test.token' },
      validateStatus: () => true,
    })
    console.log(`POST /api/profile/memories → Status: ${res.status} | Success: ${res.data?.success}`)
    console.log('Response body:', JSON.stringify(res.data, null, 2))
  } catch (err) {
    console.error('Error:', err.message)
  }
}

testValidMemory()
