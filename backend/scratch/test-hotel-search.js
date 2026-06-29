const axios = require('axios')

async function test() {
  try {
    // Use the EXACT same params the user's frontend uses
    console.log('Testing hotel search (same params as frontend): Hyderabad -> Goa, Jun 21...')
    const r = await axios.post('http://localhost:5000/api/search', {
      from: 'Hyderabad, India',
      to: 'Goa, India',
      startDate: '2026-06-21',
      endDate: '2026-06-25',
      budget: 50000,
      travelers: 2
    })

    const hotels = r.data?.data?.hotels || []
    console.log('\n=== Hotels returned:', hotels.length, '===')
    hotels.forEach((h, i) => {
      const liveTag = String(h.rateKey || '').startsWith('hbd_mock_rk') ? '[MOCK]' : '[LIVE]'
      console.log(`  ${i + 1}. ${liveTag} ${h.name}`)
      console.log(`     ₹${h.price}/night | Total: ₹${h.totalPrice || 'N/A'} for ${h.nights || '?'} nights`)
      console.log(`     Location: ${h.location} | Rating: ${h.rating}★`)
      console.log(`     Rooms: ${(h.amenities || []).join(', ')}`)
      console.log(`     Board: ${(h.offers || []).join(', ')}`)
      console.log()
    })

    console.log('Meta:', JSON.stringify(r.data?.meta, null, 2))
  } catch (e) {
    console.error('Error:', e.response?.data || e.message)
  }
}

test()
