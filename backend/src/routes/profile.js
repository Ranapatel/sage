const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')

const profiles = new Map()
const savedItemsStore = new Map()

router.post('/', [
  body('budget').optional().isFloat({ min: 0, max: 100000 }),
  body('currency').optional().isLength({ max: 5 }),
  body('travelStyle').optional().isIn(['adventure', 'luxury', 'budget', 'family', 'romantic', 'cultural', 'business', 'honeymoon']),
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

// ── Saved Items Routes ────────────────────────────────────────────────────────
router.get('/saved', (req, res) => {
  try {
    const key = req.headers['authorization'] || req.headers['x-session-id'] || 'anonymous'
    const items = savedItemsStore.get(key) || []
    res.json({ success: true, data: items })
  } catch (err) {
    res.json({ success: true, data: [] })
  }
})

router.post('/saved', (req, res) => {
  try {
    const key = req.headers['authorization'] || req.headers['x-session-id'] || 'anonymous'
    const items = savedItemsStore.get(key) || []
    const newItem = { id: String(Date.now()), ...req.body, createdAt: new Date().toISOString() }
    items.push(newItem)
    savedItemsStore.set(key, items)
    res.json({ success: true, data: newItem, message: 'Saved successfully' })
  } catch (err) {
    res.json({ success: true, data: req.body })
  }
})

router.delete('/saved/:id', (req, res) => {
  try {
    const key = req.headers['authorization'] || req.headers['x-session-id'] || 'anonymous'
    let items = savedItemsStore.get(key) || []
    items = items.filter(item => item.id !== req.params.id)
    savedItemsStore.set(key, items)
    res.json({ success: true, message: 'Deleted successfully' })
  } catch (err) {
    res.json({ success: true, message: 'Deleted' })
  }
})

module.exports = router
