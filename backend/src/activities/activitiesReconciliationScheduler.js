const reconciliationService = require('./activitiesReconciliationService')

const DEFAULT_INTERVAL_MS = 15 * 60 * 1000 // 15 minutes
let timer = null
let running = false

async function runScheduledReconciliation() {
  if (running) return
  running = true
  try {
    const result = await reconciliationService.reconcileStrandedBookings()
    if (result.reconciledCount > 0) {
      console.log('[ActivitiesReconciliationScheduler] Stranded bookings reconciled:', result)
    }
  } catch (err) {
    console.error('[ActivitiesReconciliationScheduler] Stranded reconciliation failed:', err.message)
  } finally {
    running = false
  }
}

function startReconciliationScheduler() {
  if (timer) return timer

  timer = setInterval(runScheduledReconciliation, DEFAULT_INTERVAL_MS)
  timer.unref?.()

  // Run on startup shortly after boot
  setTimeout(runScheduledReconciliation, 10000).unref?.()

  console.log('[ActivitiesReconciliationScheduler] Started with 15m interval')
  return timer
}

function stopReconciliationScheduler() {
  if (timer) clearInterval(timer)
  timer = null
}

module.exports = { startReconciliationScheduler, stopReconciliationScheduler, runScheduledReconciliation }
