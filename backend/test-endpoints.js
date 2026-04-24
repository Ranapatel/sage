const axios = require('axios');

async function test() {
  try {
    console.log('Testing /api/search...');
    await axios.post('http://localhost:4000/api/search', {
      from: 'JFK',
      to: 'LHR',
      startDate: '2026-05-01',
      endDate: '2026-05-10',
      budget: 1000,
      travelers: 1,
      style: 'adventure'
    });
    console.log('/api/search OK');
  } catch (err) {
    console.error('/api/search ERROR:', err.response?.data || err.message);
  }

  try {
    console.log('Testing /api/itinerary/generate...');
    await axios.post('http://localhost:4000/api/itinerary/generate', {
      destination: 'London',
      days: 3,
      budget: 1000,
      style: 'adventure',
      members: 1,
      preferences: []
    });
    console.log('/api/itinerary/generate OK');
  } catch (err) {
    console.error('/api/itinerary/generate ERROR:', err.response?.data || err.message);
  }
}

test();
