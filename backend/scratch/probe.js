require('dotenv').config({ path: '../.env' });
const axios = require('axios');

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;

async function probe() {
  console.log('Probing Kiwi (Flights)...');
  try {
    const res = await axios.get(`https://${process.env.RAPIDAPI_HOST_FLIGHTS}/search`, {
      params: { fly_from: 'LHR', fly_to: 'JFK', date_from: '10/05/2026', date_to: '10/05/2026', limit: 1 },
      headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': process.env.RAPIDAPI_HOST_FLIGHTS }
    });
    console.log('Kiwi success!');
    console.log(Object.keys(res.data));
  } catch (e) {
    console.log('Kiwi failed:', e.response?.status, e.response?.data);
  }

  console.log('\nProbing Agoda (Hotels)...');
  try {
    const res = await axios.get(`https://${process.env.RAPIDAPI_HOST_HOTELS}/properties/v2/list`, {
      params: { destination: 'Paris' },
      headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': process.env.RAPIDAPI_HOST_HOTELS }
    });
    console.log('Agoda /properties/v2/list success!');
  } catch (e) {
    console.log('Agoda /properties/v2/list failed:', e.response?.status, e.response?.data);
  }

  try {
    const res = await axios.get(`https://${process.env.RAPIDAPI_HOST_HOTELS}/locations/v2/search`, {
      params: { query: 'Paris' },
      headers: { 'x-rapidapi-key': RAPIDAPI_KEY, 'x-rapidapi-host': process.env.RAPIDAPI_HOST_HOTELS }
    });
    console.log('Agoda /locations/v2/search success!');
  } catch (e) {
    console.log('Agoda /locations/v2/search failed:', e.response?.status, e.response?.data);
  }
}

probe();
