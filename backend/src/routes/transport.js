const express = require('express');
const router = express.Router();
const axios = require('axios');

// Proxy POST /api/transport/uber to the NestJS transport microservice
router.post('/uber', async (req, res, next) => {
  try {
    const nestUrl = process.env.TRANSPORT_SERVICE_URL || 'http://localhost:4001';

    // Call the NestJS service
    const response = await axios.post(`${nestUrl}/api/transport/uber`, req.body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('[Transport Proxy Error]:', error.message);

    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    return res.status(500).json({
      success: false,
      error: 'Unable to connect to the transport service. Please try again later.',
    });
  }
});

// Proxy POST /api/transport/buses/search or /api/transport/bus/search
router.post(['/buses/search', '/bus/search'], async (req, res, next) => {
  try {
    const nestUrl = process.env.TRANSPORT_SERVICE_URL || 'http://localhost:4001';
    console.log(`[Transport Proxy] Forwarding bus search to ${nestUrl}/api/bus/search`, req.body);

    const response = await axios.post(`${nestUrl}/api/bus/search`, req.body, {
      headers: { 'Content-Type': 'application/json' },
    });
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('[Transport Proxy Bus Error]:', error.message);
    if (error.response) return res.status(error.response.status).json(error.response.data);
    return res.status(500).json({
      success: false,
      error: 'Bus search service is temporarily unavailable.',
    });
  }
});

// Proxy POST /api/transport/trains/search or /api/transport/train/search
router.post(['/trains/search', '/train/search'], async (req, res, next) => {
  try {
    const nestUrl = process.env.TRANSPORT_SERVICE_URL || 'http://localhost:4001';
    console.log(`[Transport Proxy] Forwarding train search to ${nestUrl}/api/train/search`, req.body);

    const response = await axios.post(`${nestUrl}/api/train/search`, req.body, {
      headers: { 'Content-Type': 'application/json' },
    });
    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('[Transport Proxy Train Error]:', error.message);
    if (error.response) return res.status(error.response.status).json(error.response.data);
    return res.status(500).json({
      success: false,
      error: 'Train search service is temporarily unavailable.',
    });
  }
});

module.exports = router;
