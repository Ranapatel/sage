const mongoose = require('mongoose')
const dns = require('dns')

// Force Google DNS (8.8.8.8) + IPv4-first to resolve MongoDB Atlas SRV records
// This fixes ECONNREFUSED on querySrv when ISP/local DNS blocks Atlas lookups
try {
  dns.setServers(['8.8.8.8', '8.8.4.4', '1.1.1.1'])
  if (dns.setDefaultResultOrder) dns.setDefaultResultOrder('ipv4first')
} catch { /* Node <16 — safe to ignore */ }

let isConnected = false

async function connectDB() {
  if (isConnected) return
  const uri = process.env.DB_URL
  if (!uri) throw new Error('DB_URL not set')

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 15000,  // extended for slow DNS
      connectTimeoutMS: 15000,
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      family: 4,                        // force IPv4 — avoids IPv6 SRV issues
    })
    isConnected = true
    console.log('[TripSage] ✅ MongoDB connected')

    mongoose.connection.on('disconnected', () => {
      isConnected = false
      console.warn('[TripSage] MongoDB disconnected')
    })
    mongoose.connection.on('error', (err) => {
      console.warn('[TripSage] MongoDB error:', err.message)
    })
  } catch (err) {
    throw new Error(`MongoDB connection failed: ${err.message}`)
  }
}

module.exports = connectDB
