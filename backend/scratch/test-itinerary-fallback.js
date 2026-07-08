const axios = require('axios')

async function run() {
  try {
    console.log('Testing /api/itinerary/generate...')
    const res = await axios.post('http://localhost:5000/api/itinerary/generate', {
      destination: 'Goa',
      days: 3,
      budget: 50000,
      style: 'adventure',
      travelers: 2,
      preferences: ['beach', 'sightseeing']
    })
    console.log('Response status:', res.status)
    console.log('Response success:', res.data?.success)
    console.log('Response meta (checking for fallback info):', res.data?.meta)
    console.log('Itinerary days count:', res.data?.data?.itinerary?.length)
    if (res.data?.data?.itinerary?.length > 0) {
      console.log('First day itinerary details:', JSON.stringify(res.data.data.itinerary[0], null, 2))
    }
  } catch (err) {
    console.error('Itinerary query failed:', err.response?.status, err.response?.data || err.message)
  }
}

run()
