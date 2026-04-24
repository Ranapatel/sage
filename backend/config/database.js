const mongoose = require('mongoose')
const dns = require('dns')

// Set reliable DNS servers (Cloudflare + Google)
dns.setServers(['1.1.1.1', '8.8.8.8'])

// Prefer IPv4 to avoid SRV resolution issues
dns.setDefaultResultOrder('ipv4first')

let isConnected = false

async function connectDB() {
  if (isConnected) return
  const uri = process.env.DB_URL
  if (!uri) throw new Error('DB_URL not set')

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
      maxPoolSize: 10,
    })
    isConnected = true
    console.log('[TripSage] ✅ MongoDB connected')

    mongoose.connection.on('disconnected', () => {
      isConnected = false
      console.warn('[TripSage] MongoDB disconnected')
    })
    mongoose.connection.on('error', (err) => {
      console.warn('[TripSage] MongoDB connection error:', err.message)
    })
  } catch (err) {
    throw new Error(`MongoDB connection failed: ${err.message}`)
  }
}

module.exports = connectDB
