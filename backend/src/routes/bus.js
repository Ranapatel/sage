const express = require('express');
const router = express.Router();
const axios = require('axios');
const { cacheGet, cacheSet, generateCacheKey } = require('../config/redis');

// Proxy POST /api/bus/search to the NestJS transport microservice
router.post('/search', async (req, res) => {
  try {
    const departureCity = req.body.departureCity || req.body.from || req.body.origin || '';
    const destinationCity = req.body.destinationCity || req.body.to || req.body.destination || '';
    const departureDate = req.body.departureDate || req.body.date || req.body.travelDate || new Date().toISOString().split('T')[0];

    if (!departureCity || !destinationCity) {
      return res.status(400).json({
        success: false,
        error: 'departureCity and destinationCity are required',
      });
    }

    // 1. Check cache
    const cacheKey = generateCacheKey('bus_proxy_v2', { departureCity, destinationCity, departureDate });
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json({ ...cached, cacheHit: true });
    }

    const nestUrl = process.env.TRANSPORT_SERVICE_URL || 'http://localhost:4001';

    const payload = {
      departureCity: departureCity.split(',')[0].trim(),
      destinationCity: destinationCity.split(',')[0].trim(),
      departureDate,
    };

    console.log(`[Bus Proxy] Forwarding search to ${nestUrl}/api/bus/search`, payload);

    const response = await axios.post(`${nestUrl}/api/bus/search`, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });

    const data = response.data || { results: [] };
    await cacheSet(cacheKey, data, 300); // 5 min TTL
    return res.status(200).json(data);
  } catch (error) {
    console.error('[Bus Proxy Error]:', error.message);

    // Fallback search URL
    const fromSlug = (req.body.departureCity || req.body.from || 'delhi').split(',')[0].trim().toLowerCase().replace(/\s+/g, '-');
    const toSlug = (req.body.destinationCity || req.body.to || 'manali').split(',')[0].trim().toLowerCase().replace(/\s+/g, '-');
    const fallbackSearchUrl = `https://www.makemytrip.com/bus-tickets/${fromSlug}-to-${toSlug}/`;

    return res.status(200).json({
      success: true,
      provider: 'MakeMyTrip',
      results: [],
      searchUrl: fallbackSearchUrl,
      message: 'Bus schedules are currently loading or unavailable. Use the booking link to check live availability.',
    });
  }
});

module.exports = router;
