require('dotenv').config({ path: '../.env' });
const axios = require('axios');

async function testAgodaApi() {
  const options = {
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      'x-rapidapi-host': 'agoda-com.p.rapidapi.com',
      'Content-Type': 'application/json'
    }
  };

  try {
    console.log('Testing user provided URL (Search Overnight)...');
    const url = 'https://agoda-com.p.rapidapi.com/hotels/search-overnight?id=1_318&checkinDate=2026-04-22&checkoutDate=2026-05-20';
    const response = await axios.get(url, { headers: options.headers });
    console.log('Success! Keys:', Object.keys(response.data));
    console.log('Sample Data:', JSON.stringify(response.data).substring(0, 300));
  } catch (error) {
    console.error('Search Overnight Error:', error.response?.status, error.response?.data || error.message);
  }

  try {
    console.log('\nTesting /locations/search (To get the ID)...');
    const res2 = await axios.get('https://agoda-com.p.rapidapi.com/locations/search', {
      params: { query: 'Paris' },
      headers: options.headers
    });
    console.log('Locations Success!');
    console.log('Sample Data:', JSON.stringify(res2.data).substring(0, 300));
  } catch (error) {
    console.error('Locations Error:', error.response?.status, error.response?.data || error.message);
  }
}

testAgodaApi();
