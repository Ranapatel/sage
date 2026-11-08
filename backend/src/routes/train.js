const express = require('express');
const router = express.Router();
const axios = require('axios');
const { cacheGet, cacheSet, generateCacheKey } = require('../config/redis');

// Proxy POST /api/train/search to the NestJS transport/train microservice
router.post('/search', async (req, res) => {
  try {
    const departureCity = req.body.departureCity || req.body.from || req.body.origin || req.body.originStation || '';
    const destinationCity = req.body.destinationCity || req.body.to || req.body.destination || req.body.destinationStation || '';
    const departureDate = req.body.departureDate || req.body.date || req.body.travelDate || new Date().toISOString().split('T')[0];
    const passengers = Number(req.body.passengers || req.body.travelers || 1);
    const travelClass = req.body.travelClass || req.body.preferredClass || 'ALL';

    if (!departureCity || !destinationCity) {
      return res.status(400).json({
        success: false,
        error: 'departureCity and destinationCity are required',
      });
    }

    // 1. Check cache
    const cacheKey = generateCacheKey('train_proxy_v2', { departureCity, destinationCity, departureDate, passengers, travelClass });
    const cached = await cacheGet(cacheKey);
    if (cached) {
      return res.status(200).json({ ...cached, cacheHit: true });
    }

    const nestUrl = process.env.TRANSPORT_SERVICE_URL || 'http://localhost:4001';

    const payload = {
      departureCity: departureCity.split(',')[0].trim(),
      destinationCity: destinationCity.split(',')[0].trim(),
      departureDate,
      passengers,
      travelClass,
    };

    console.log(`[Train Proxy] Forwarding search to ${nestUrl}/api/train/search`, payload);

    const response = await axios.post(`${nestUrl}/api/train/search`, payload, {
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000,
    });

    const data = response.data || { results: [] };
    await cacheSet(cacheKey, data, 300); // 5 min TTL
    return res.status(200).json(data);
  } catch (error) {
    console.error('[Train Proxy Error]:', error.message);

    const fromCode = (req.body.departureCity || req.body.from || 'NDLS').split(',')[0].trim().toUpperCase();
    const toCode = (req.body.destinationCity || req.body.to || 'CSTM').split(',')[0].trim().toUpperCase();
    const fallbackSearchUrl = `https://www.makemytrip.com/railways/listing.html?from=${fromCode}&to=${toCode}`;

    return res.status(200).json({
      success: true,
      provider: 'MakeMyTrip',
      results: [],
      searchUrl: fallbackSearchUrl,
      message: 'Train schedules are currently loading or unavailable. Use the booking link to check live availability.',
    });
  }
});

module.exports = router;
