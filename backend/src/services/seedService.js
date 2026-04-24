/**
 * Seeds a demo user on startup so the demo credentials always work,
 * even without a real MongoDB connection.
 */
const { memUsers, isMongoConnected, User } = require('../models/User')
const bcrypt = require('bcryptjs')

const DEMO = {
  name: 'Demo Traveler',
  email: 'demo@tripsage.ai',
  password: 'demo123456',
  currency: 'INR',
  country: 'India',
}

async function seedDemo() {
  try {
    if (isMongoConnected()) {
      const existing = await User.findOne({ email: DEMO.email })
      if (!existing) {
        await User.create(DEMO)
        console.log('[TripSage] ✅ Demo user seeded in MongoDB')
      }
    } else {
      const existing = await memUsers.findByEmail(DEMO.email)
      if (!existing) {
        await memUsers.create(DEMO)
        console.log('[TripSage] ✅ Demo user seeded in memory')
      }
    }
  } catch (err) {
    console.warn('[TripSage] Demo seed skipped:', err.message)
  }
}

module.exports = seedDemo
