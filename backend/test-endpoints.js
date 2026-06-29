const axios = require('axios');

async function test() {
  try {
    console.log('Testing /api/search...');
    const searchRes = await axios.post('http://localhost:5000/api/search', {
      from: 'Delhi',
      to: 'Goa',
      startDate: '2026-05-01',
      endDate: '2026-05-10',
      budget: 100000,
      travelers: 2,
      style: 'adventure'
    });
    console.log('/api/search OK');
    const hotels = searchRes.data?.data?.hotels || [];
    console.log(`Found ${hotels.length} hotels.`);
    if (hotels.length > 0) {
      const firstHotel = hotels[0];
      console.log('First Hotel:', firstHotel.name, 'Price:', firstHotel.price, 'Source:', firstHotel.source, 'RateKey:', firstHotel.rateKey);
      
      console.log('Testing /api/booking/init for Hotelbeds...');
      const bookingRes = await axios.post('http://localhost:5000/api/booking/init', {
        type: 'hotel',
        itemId: firstHotel.id,
        userDetails: {
          name: 'Jane Doe',
          email: 'jane@example.com',
          rateKey: firstHotel.rateKey
        }
      });
      console.log('/api/booking/init OK:', bookingRes.data);
    }
  } catch (err) {
    console.error('ERROR:', err.response?.data || err.message);
  }
}

test();
