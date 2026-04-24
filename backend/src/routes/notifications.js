const express = require('express')
const router = express.Router()

// In-memory store
const notificationStore = new Map()

router.get('/:sessionId', (req, res) => {
  const notifs = notificationStore.get(req.params.sessionId) || []
  res.json({ success: true, data: notifs })
})

router.post('/:sessionId/read/:id', (req, res) => {
  const notifs = notificationStore.get(req.params.sessionId) || []
  const updated = notifs.map(n => n.id === req.params.id ? { ...n, read: true } : n)
  notificationStore.set(req.params.sessionId, updated)
  res.json({ success: true })
})

module.exports = router
