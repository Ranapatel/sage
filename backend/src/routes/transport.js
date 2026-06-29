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

module.exports = router;
