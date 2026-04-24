const express = require('express')
const router = express.Router()
const { body, validationResult } = require('express-validator')
const { User, memUsers, isMongoConnected } = require('../models/User')
const { signToken, authMiddleware } = require('../middleware/authMiddleware')

// ── Helpers ───────────────────────────────────────────────────────────────────
const validate = (req, res) => {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: errors.array()[0].msg })
    return false
  }
  return true
}

// ── POST /api/auth/signup ─────────────────────────────────────────────────────
router.post('/signup', [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('currency').optional().isIn(['INR', 'USD', 'EUR', 'GBP', 'AED']).withMessage('Invalid currency'),
], async (req, res) => {
  if (!validate(req, res)) return
  const { name, email, password, currency = 'INR', country = 'India' } = req.body
  try {
    if (isMongoConnected()) {
      const existing = await User.findOne({ email })
      if (existing) return res.status(409).json({ success: false, message: 'Email already registered' })
      const user = await User.create({ name, email, password, currency, country })
      const token = signToken({ userId: user._id, email: user.email })
      return res.status(201).json({ success: true, data: { token, user: user.toSafe() } })
    } else {
      // In-memory fallback
      const existing = await memUsers.findByEmail(email)
      if (existing) return res.status(409).json({ success: false, message: 'Email already registered' })
      const user = await memUsers.create({ name, email, password, currency, country })
      const token = signToken({ userId: user.id, email: user.email })
      return res.status(201).json({ success: true, data: { token, user: memUsers.safe(user) } })
    }
  } catch (err) {
    console.error('[Auth] Signup error:', err.message)
    res.status(500).json({ success: false, message: 'Signup failed. Please try again.' })
  }
})

// ── POST /api/auth/login ──────────────────────────────────────────────────────
router.post('/login', [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').notEmpty().withMessage('Password is required'),
], async (req, res) => {
  if (!validate(req, res)) return
  const { email, password } = req.body
  try {
    if (isMongoConnected()) {
      const user = await User.findOne({ email })
      if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' })
      const ok = await user.comparePassword(password)
      if (!ok) return res.status(401).json({ success: false, message: 'Invalid email or password' })
      const token = signToken({ userId: user._id, email: user.email })
      return res.json({ success: true, data: { token, user: user.toSafe() } })
    } else {
      const user = await memUsers.findByEmail(email)
      if (!user) return res.status(401).json({ success: false, message: 'Invalid email or password' })
      const ok = await memUsers.comparePassword(password, user.password)
      if (!ok) return res.status(401).json({ success: false, message: 'Invalid email or password' })
      const token = signToken({ userId: user.id, email: user.email })
      return res.json({ success: true, data: { token, user: memUsers.safe(user) } })
    }
  } catch (err) {
    console.error('[Auth] Login error:', err.message)
    res.status(500).json({ success: false, message: 'Login failed. Please try again.' })
  }
})

// ── GET /api/auth/me ──────────────────────────────────────────────────────────
router.get('/me', authMiddleware, async (req, res) => {
  try {
    const { userId } = req.user
    if (isMongoConnected()) {
      const user = await User.findById(userId).select('-password')
      if (!user) return res.status(404).json({ success: false, message: 'User not found' })
      return res.json({ success: true, data: { user } })
    } else {
      const user = await memUsers.findById(userId)
      if (!user) return res.status(404).json({ success: false, message: 'User not found' })
      return res.json({ success: true, data: { user: memUsers.safe(user) } })
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Failed to fetch profile' })
  }
})

// ── PATCH /api/auth/profile ───────────────────────────────────────────────────
router.patch('/profile', authMiddleware, [
  body('currency').optional().isIn(['INR', 'USD', 'EUR', 'GBP', 'AED']),
  body('name').optional().trim().notEmpty(),
], async (req, res) => {
  if (!validate(req, res)) return
  const { userId } = req.user
  const updates = {}
  if (req.body.name) updates.name = req.body.name
  if (req.body.currency) updates.currency = req.body.currency
  if (req.body.country) updates.country = req.body.country
  if (req.body.preferences) updates.preferences = req.body.preferences
  try {
    if (isMongoConnected()) {
      const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password')
      return res.json({ success: true, data: { user } })
    } else {
      const user = await memUsers.findById(userId)
      if (!user) return res.status(404).json({ success: false, message: 'User not found' })
      Object.assign(user, updates)
      return res.json({ success: true, data: { user: memUsers.safe(user) } })
    }
  } catch (err) {
    res.status(500).json({ success: false, message: 'Profile update failed' })
  }
})

// ── POST /api/auth/logout ─────────────────────────────────────────────────────
router.post('/logout', (_req, res) => {
  // JWT is stateless — client drops the token
  res.json({ success: true, message: 'Logged out successfully' })
})

module.exports = router
