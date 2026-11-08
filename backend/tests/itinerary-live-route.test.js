const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const axios = require('axios');

// Register ts-node
require('ts-node').register({
  project: path.join(__dirname, '../tsconfig.json'),
  transpileOnly: true,
  compilerOptions: {
    module: 'CommonJS',
    moduleResolution: 'node',
  }
});

const app = express();
app.use(express.json());
const itineraryRoutes = require('../src/routes/itinerary');
app.use('/api/itinerary', itineraryRoutes);

async function runTest() {
  console.log('=== Testing POST /api/itinerary/generate End-to-End ===');

  const server = await new Promise((resolve) => {
    const s = app.listen(0, '127.0.0.1', () => resolve(s));
  });
  const port = server.address().port;
  console.log(`Test server running on port ${port}`);

  try {
    const payload = {
      destination: 'Goa',
      from: 'Delhi',
      days: 3,
      budget: 50000,
      currency: 'INR',
      style: 'balanced',
      members: 2,
      preferences: ['beach', 'relaxation'],
      startDate: '2026-11-20',
    };

    const start = Date.now();
    const res = await axios.post(`http://127.0.0.1:${port}/api/itinerary/generate`, payload, {
      timeout: 60000,
    });

    const duration = (Date.now() - start) / 1000;
    console.log(`Response received in ${duration.toFixed(1)}s with status:`, res.status);

    const { success, data, meta } = res.data;
    console.log('Success:', success);
    console.log('meta.aiStatus:', meta.aiStatus);
    console.log('meta.fallback:', meta.fallback);
    console.log('Days generated:', data.itinerary ? data.itinerary.length : 0);

    if (!success) throw new Error('Expected success to be true');
    if (!['live', 'partial'].includes(meta.aiStatus)) throw new Error(`Expected aiStatus to be 'live' or 'partial', got ${meta.aiStatus}`);
    if (!Array.isArray(data.itinerary) || data.itinerary.length < 3) throw new Error('Expected at least 3 days in itinerary');

    console.log('Day 1 Date:', data.itinerary[0].date);
    console.log('Day 1 Slots:', data.itinerary[0].slots ? Object.keys(data.itinerary[0].slots) : 'no slots');

    console.log('🎉 LIVE ITINERARY GENERATION TEST PASSED 100%!');
  } finally {
    server.close();
  }
}

runTest().catch((err) => {
  console.error('TEST EXCEPTION:', err.response ? err.response.data : err.message);
  process.exit(1);
});
