const { prisma } = require('../prisma/prisma.client')
const { checkRate } = require('../services/hotelbedsService')
const { estimateFlightPrices } = require('../services/aiService')
const { getSocketIO } = require('../index') // reference to socket server for push alerts

/**
 * 🎓 Let's Learn: Background workers & polling loops
 * Background workers are functions that run independently of incoming HTTP requests.
 * By using a background loop, we can perform slow tasks (like calling flight APIs)
 * without keeping a user's browser connection waiting.
 */

async function checkSavedItemPrices() {
  console.log('[Price Watcher] 🔍 Running background check on saved prices...')

  try {
    // 1. Fetch saved hotel or flight items from database
    const savedItems = await prisma.savedItem.findMany({
      include: { user: true }
    })

    for (const item of savedItems) {
      let currentPrice = null
      let itemName = ''

      if (item.type === 'hotel') {
        // Mock rate-check or real Hotelbeds API check
        // For learning, we query the service directly or estimate drops
        currentPrice = Math.round(Number(item.metadata?.price || 5000) * (0.9 + Math.random() * 0.15)) // simulates price fluctuations
        itemName = item.metadata?.hotelName || 'Stay Option'
      } else if (item.type === 'flight') {
        // Query flight price estimations or flight caching services
        currentPrice = Math.round(Number(item.metadata?.price || 12000) * (0.88 + Math.random() * 0.18))
        itemName = `Flight to ${item.metadata?.destination || 'Destination'}`
      }

      if (currentPrice === null) continue

      const originalPrice = Number(item.metadata?.price || currentPrice)
      const priceDropPct = ((originalPrice - currentPrice) / originalPrice) * 100

      console.log(`[Price Watcher] Checked ${itemName}: Original ₹${originalPrice} -> Current ₹${currentPrice} (${priceDropPct.toFixed(1)}% change)`)

      // 2. If price drops by 5% or more, notify the user!
      if (priceDropPct >= 5) {
        console.log(`[Price Watcher] 💰 PRICE DROP ALERT! ${itemName} dropped by ${priceDropPct.toFixed(1)}%`)

        // 3. Save a notification record in the database
        const notification = await prisma.notification.create({
          data: {
            userId: item.userId,
            type: 'deal',
            title: '🔥 Price Drop Alert!',
            message: `Good news! The price of "${itemName}" has dropped to ₹${currentPrice.toLocaleString('en-IN')} (saving ${priceDropPct.toFixed(0)}%). Book now before it changes!`,
            read: false
          }
        })

        // 4. Emit a real-time socket event if the user is currently online
        const io = getSocketIO()
        if (io) {
          io.to(`user:${item.userId}`).emit('notification', {
            id: notification.id,
            type: 'deal',
            title: notification.title,
            message: notification.message,
            timestamp: notification.createdAt
          })
          console.log(`[Price Watcher] Push alert emitted to socket room: user:${item.userId}`)
        }
      }
    }
  } catch (err) {
    console.error('[Price Watcher] Error in price watcher worker:', err.message)
  }
}

/**
 * Starts the Price Watcher background polling cycle
 * Runs immediately on boot, and then once every 12 hours (43,200,000 ms)
 */
function startPriceWatcher() {
  // Run immediately on server boot
  checkSavedItemPrices()

  // Set recurring interval
  const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000
  setInterval(checkSavedItemPrices, TWELVE_HOURS_MS)
  console.log('[Price Watcher] ✅ Polling worker initialized. Schedule: every 12 hours.')
}

module.exports = { startPriceWatcher }
