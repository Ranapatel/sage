// weather.js
const express = require('express')
const router = express.Router()
const { getWeather } = require('../services/weatherService')
const { param } = require('express-validator')

router.get('/:destination', [
  param('destination').trim().notEmpty().isLength({ max: 100 }).escape()
], async (req, res) => {
  try {
    const result = await getWeather(decodeURIComponent(req.params.destination))
    res.json({ ...result, meta: { timestamp: new Date().toISOString() } })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Weather service error' })
  }
})

module.exports = router
