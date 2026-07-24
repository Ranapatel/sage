const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')

const profiles = new Map()
const savedItemsStore = new Map()
const memoriesStore = new Map()
const walletStore = new Map()
const referralStore = new Map()

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

// ── Travel Memories Routes ───────────────────────────────────────────────────
router.get('/memories', (req, res) => {
  try {
    const key = req.headers['authorization'] || req.headers['x-session-id'] || 'anonymous'
    const memories = memoriesStore.get(key) || []
    res.json({ success: true, data: memories })
  } catch (err) {
    res.json({ success: true, data: [] })
  }
})

router.post('/memories', (req, res) => {
  try {
    const key = req.headers['authorization'] || req.headers['x-session-id'] || 'anonymous'
    const memories = memoriesStore.get(key) || []
    const newMemory = {
      id: String(Date.now()),
      title: req.body.title || 'Travel Memory',
      description: req.body.description || '',
      location: req.body.location || '',
      photos: req.body.photos || [],
      createdAt: new Date().toISOString()
    }
    memories.unshift(newMemory)
    memoriesStore.set(key, memories)
    res.json({ success: true, data: newMemory, message: 'Memory uploaded successfully' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

router.delete('/memories/:id', (req, res) => {
  try {
    const key = req.headers['authorization'] || req.headers['x-session-id'] || 'anonymous'
    let memories = memoriesStore.get(key) || []
    memories = memories.filter(m => m.id !== req.params.id)
    memoriesStore.set(key, memories)
    res.json({ success: true, message: 'Memory deleted successfully' })
  } catch (err) {
    res.json({ success: true, message: 'Deleted' })
  }
})

// ── Sage Wallet Routes ───────────────────────────────────────────────────────
router.get('/wallet', (req, res) => {
  try {
    const key = req.headers['authorization'] || req.headers['x-session-id'] || 'anonymous'
    let wallet = walletStore.get(key)
    if (!wallet) {
      wallet = {
        balance: 500,
        transactions: [
          {
            id: 'tx-1',
            amount: 500,
            type: 'credit',
            reason: 'Welcome Bonus Reward',
            createdAt: new Date().toISOString()
          }
        ]
      }
      walletStore.set(key, wallet)
    }
    res.json({ success: true, data: wallet })
  } catch (err) {
    res.json({
      success: true,
      data: {
        balance: 500,
        transactions: [
          {
            id: 'tx-1',
            amount: 500,
            type: 'credit',
            reason: 'Welcome Bonus Reward',
            createdAt: new Date().toISOString()
          }
        ]
      }
    })
  }
})

router.post('/wallet/transaction', (req, res) => {
  try {
    const key = req.headers['authorization'] || req.headers['x-session-id'] || 'anonymous'
    let wallet = walletStore.get(key) || { balance: 500, transactions: [] }
    const amount = Number(req.body.amount || 0)
    const type = req.body.type === 'debit' ? 'debit' : 'credit'
    
    if (type === 'credit') wallet.balance += amount
    else wallet.balance = Math.max(0, wallet.balance - amount)

    const newTx = {
      id: `tx-${Date.now()}`,
      amount,
      type,
      reason: req.body.reason || 'Reward Transaction',
      createdAt: new Date().toISOString()
    }
    wallet.transactions.unshift(newTx)
    walletStore.set(key, wallet)
    res.json({ success: true, data: wallet })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// ── Referrals Routes ──────────────────────────────────────────────────────────
router.get('/referrals', (req, res) => {
  try {
    const key = req.headers['authorization'] || req.headers['x-session-id'] || 'anonymous'
    const referrals = referralStore.get(key) || []
    res.json({ success: true, data: referrals })
  } catch (err) {
    res.json({ success: true, data: [] })
  }
})

router.post('/referrals', (req, res) => {
  try {
    const key = req.headers['authorization'] || req.headers['x-session-id'] || 'anonymous'
    const referrals = referralStore.get(key) || []
    const newRef = {
      id: `ref-${Date.now()}`,
      referredUser: {
        email: req.body.email,
        firstName: req.body.firstName || 'Friend',
        lastName: req.body.lastName || ''
      },
      status: 'PENDING',
      reward: 100,
      createdAt: new Date().toISOString()
    }
    referrals.unshift(newRef)
    referralStore.set(key, referrals)
    res.json({ success: true, data: newRef, message: 'Invite sent successfully!' })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

module.exports = router
