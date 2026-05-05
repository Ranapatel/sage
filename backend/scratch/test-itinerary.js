require('dotenv').config();
const { generateItinerary } = require('./src/services/aiService');

async function test() {
  try {
    console.log('Testing generateItinerary...');
    const result = await generateItinerary({
      destination: 'Bali',
      days: 2,
      budget: 10000,
      style: 'adventure',
      preferences: [],
      members: 2,
      startDate: '2026-05-10'
    });
    console.log(JSON.stringify(result, null, 2));
  } catch (err) {
    console.error('ERROR:', err.message);
  }
}

test();
