const express = require('express');
const router = express.Router();
const axios = require('axios');

// Proxy POST /api/bus/search to the NestJS transport microservice
router.post('/search', async (req, res, next) => {
  try {
    const nestUrl = process.env.TRANSPORT_SERVICE_URL || 'http://localhost:4001';

    console.log(`[Bus Proxy] Forwarding search to ${nestUrl}/api/bus/search`, req.body);

    const response = await axios.post(`${nestUrl}/api/bus/search`, req.body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('[Bus Proxy Error]:', error.message);

    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    return res.status(500).json({
      success: false,
      error: 'Bus search service is temporarily unavailable. Please try again later.',
    });
  }
});

module.exports = router;
