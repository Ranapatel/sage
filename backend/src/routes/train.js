const express = require('express');
const router = express.Router();
const axios = require('axios');

// Proxy POST /api/train/search to the NestJS transport/train microservice
router.post('/search', async (req, res, next) => {
  try {
    const nestUrl = process.env.TRANSPORT_SERVICE_URL || 'http://localhost:4001';

    console.log(`[Train Proxy] Forwarding search to ${nestUrl}/api/train/search`, req.body);

    const response = await axios.post(`${nestUrl}/api/train/search`, req.body, {
      headers: {
        'Content-Type': 'application/json',
      },
    });

    return res.status(response.status).json(response.data);
  } catch (error) {
    console.error('[Train Proxy Error]:', error.message);

    if (error.response) {
      return res.status(error.response.status).json(error.response.data);
    }

    return res.status(500).json({
      success: false,
      error: 'Train search service is temporarily unavailable. Please try again later.',
    });
  }
});

module.exports = router;
