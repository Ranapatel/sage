const { recommendHotels } = require('../src/services/hotelRecommendationService');
require('dotenv').config();
const mongoose = require('mongoose');

async function testDirect() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/tripsage');
    console.log('Connected to MongoDB');

    const result = await recommendHotels({
      destination: 'Goa',
      checkin: '2026-07-15',
      checkout: '2026-07-18',
      members: 2,
      budget: 80000,
      rooms: 1,
      adults: 2,
      children: 0
    });

    console.log('Result Success:', result.success);
    console.log('Result Meta:', result.meta);
    console.log(`Received ${result.data?.length} hotels.`);
    if (result.data && result.data.length > 0) {
      console.log('Sample Hotel 1:', result.data[0]);
    }
  } catch (err) {
    console.error('Direct Recommend Error:', err);
  } finally {
    await mongoose.disconnect();
  }
}

testDirect();
