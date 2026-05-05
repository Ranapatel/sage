const express = require('express');
const axios = require('axios');
const router = express.Router();
const { cacheGet, cacheSet } = require('../../config/redis');

const GOOGLE_PLACES_API_KEY = process.env.GOOGLE_PLACES_API_KEY;

// Fallback cities
const FALLBACK_CITIES = [
  { name: 'Goa, India', place_id: 'fallback_1' },
  { name: 'Mumbai, India', place_id: 'fallback_2' },
  { name: 'Delhi, India', place_id: 'fallback_3' },
  { name: 'Bangalore, India', place_id: 'fallback_4' },
  { name: 'Dubai, United Arab Emirates', place_id: 'fallback_5' },
  { name: 'Bali, Indonesia', place_id: 'fallback_6' },
  { name: 'Paris, France', place_id: 'fallback_7' },
  { name: 'London, UK', place_id: 'fallback_8' }
];

router.get('/', async (req, res) => {
  const query = req.query.q?.trim();
  if (!query || query.length < 2) {
    return res.json([]);
  }

  const cacheKey = `city:${query.toLowerCase()}`;
  
  try {
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.json(cached);
    }
  } catch (err) {
    // Redis error, ignore and proceed
  }

  try {
    let results = [];
    
    // 1. Google Places Autocomplete (Preferred & Fastest)
    if (GOOGLE_PLACES_API_KEY && GOOGLE_PLACES_API_KEY !== 'your_google_places_key') {
      try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/place/autocomplete/json', {
          params: {
            input: query,
            types: '(cities)',
            key: GOOGLE_PLACES_API_KEY,
          },
          timeout: 2500
        });

        if (response.data?.status === 'OK' && response.data?.predictions) {
          results = response.data.predictions.slice(0, 8).map(p => ({
            name: p.description,
            place_id: p.place_id
          }));
        }
      } catch (err) {
        console.warn('[Cities Autocomplete] Google API failed, falling back to Nominatim');
      }
    }

    // 2. Nominatim (OpenStreetMap) Fallback if Google failed or key missing
    if (results.length === 0) {
      try {
        const response = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: {
            q: query,
            format: 'json',
            addressdetails: 1,
            limit: 8,
            featuretype: 'city',
          },
          headers: { 'User-Agent': 'TripSage/2.0' },
          timeout: 4000
        });
        
        const raw = response.data || [];
        const seen = new Set();
        results = raw.map(r => {
          const addr = r.address || {};
          const cityName = addr.city || addr.town || addr.village || addr.municipality || r.name || r.display_name.split(',')[0];
          const country = addr.country || '';
          const fullName = `${cityName}${country && cityName !== country ? ', ' + country : ''}`;
          return {
            name: fullName,
            place_id: r.place_id?.toString() || `nom_${Math.random()}`
          };
        }).filter(item => {
          if (!item.name || seen.has(item.name.toLowerCase())) return false;
          seen.add(item.name.toLowerCase());
          return true;
        }).slice(0, 8);
      } catch (err) {
        console.warn('[Cities Autocomplete] Nominatim failed:', err.message);
      }
    }

    // 3. Fallback to predefined list if API returned 0 results
    if (results.length === 0) {
      results = FALLBACK_CITIES.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
      if (results.length === 0) results = FALLBACK_CITIES.slice(0, 5);
    }

    // 4. Cache and return
    try {
      await cacheSet(cacheKey, results, 86400); // 24 hours TTL
    } catch (e) {
      console.warn('[Redis] Failed to cache city suggestions');
    }

    return res.json(results);
  } catch (err) {
    console.warn('[Cities Autocomplete] API Error:', err.message);
    const fallbacks = FALLBACK_CITIES.filter(c => c.name.toLowerCase().includes(query.toLowerCase())).slice(0, 5);
    return res.json(fallbacks.length ? fallbacks : FALLBACK_CITIES.slice(0, 5));
  }
});

module.exports = router;
