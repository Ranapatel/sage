require('dotenv').config({ path: '../.env' });
const axios = require('axios');

async function testSkyscannerApi() {
  const url = 'https://skyscanner-flights-travel-api.p.rapidapi.com/hotels/getSimilarHotels?adults=2&hotelId=hotel-12345&currency=USD&checkOut=2026-08-05&checkIn=2026-08-01';
  const options = {
    method: 'GET',
    headers: {
      'x-rapidapi-key': process.env.RAPIDAPI_KEY,
      'x-rapidapi-host': 'skyscanner-flights-travel-api.p.rapidapi.com',
      'Content-Type': 'application/json'
    }
  };

  try {
    console.log('Testing user provided URL...');
    const response = await axios.get(url, { headers: options.headers });
    console.log('Success! Keys:', Object.keys(response.data));
    console.log('Sample Data:', JSON.stringify(response.data).substring(0, 500));
  } catch (error) {
    console.error('Error:', error.response?.status, error.response?.data || error.message);
  }

  try {
    console.log('\nTesting /flights/search...');
    const res2 = await axios.get('https://skyscanner-flights-travel-api.p.rapidapi.com/flights/search', {
      params: { origin: 'LHR', destination: 'JFK', date: '2026-05-10', adults: 1 },
      headers: options.headers
    });
    console.log('Flights Success!');
  } catch (error) {
    console.error('/flights/search Error:', error.response?.status, error.response?.data || error.message);
  }
}

testSkyscannerApi();
