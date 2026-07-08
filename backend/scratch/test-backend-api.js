const axios = require('axios');

async function testBackend() {
  try {
    console.log('Sending request to http://localhost:5000/api/places/autocomplete?query=delhi ...');
    const response = await axios.get('http://localhost:5000/api/places/autocomplete?query=delhi', {
      timeout: 5000
    });
    console.log('✅ Response status:', response.status);
    console.log('Data:', JSON.stringify(response.data, null, 2));
  } catch (err) {
    console.error('❌ Request failed:', err.message);
    if (err.response) {
      console.error('Response data:', err.response.data);
    }
  }
}

testBackend();
