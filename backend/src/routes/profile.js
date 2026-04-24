const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')

const profiles = new Map()

router.post('/', [
  body('budget').optional().isFloat({ min: 0, max: 100000 }),
  body('currency').optional().isLength({ max: 5 }),
  body('travelStyle').optional().isIn(['adventure', 'luxury', 'budget', 'family', 'romantic', 'cultural', 'business']),
  body('members').optional().isInt({ min: 1, max: 20 }),
], async (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) return res.status(400).json({ success: false, error: 'Invalid input' })

  const sessionId = req.headers['x-session-id'] || 'anonymous'
  const profile = { ...req.body, updatedAt: new Date().toISOString() }
  profiles.set(sessionId, profile)

  res.json({ success: true, data: profile })
})

router.get('/', (req, res) => {
  const sessionId = req.headers['x-session-id'] || 'anonymous'
  const profile = profiles.get(sessionId) || {}
  res.json({ success: true, data: profile })
})

module.exports = router
