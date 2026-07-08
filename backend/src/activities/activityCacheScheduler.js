const syncService = require('./activityCacheSyncService')

const DEFAULT_INTERVAL_MS = 6 * 60 * 60 * 1000
let timer = null
let running = false

async function runScheduledSync() {
  if (running) return
  running = true
  const start = Date.now()
  try {
    const result = await syncService.syncAll({ language: process.env.ACTIVITIES_CACHE_SYNC_LANGUAGE || 'en' })
    console.log('[ActivitiesCacheScheduler] Sync completed', {
      total: result.total,
      durationMs: Date.now() - start,
    })
  } catch (err) {
    console.error('[ActivitiesCacheScheduler] Sync failed', { error: err.message })
  } finally {
    running = false
  }
}

function startActivityCacheScheduler() {
  if (process.env.ACTIVITIES_CACHE_SYNC_ENABLED !== 'true') {
    console.log('[ActivitiesCacheScheduler] Skipped - ACTIVITIES_CACHE_SYNC_ENABLED is not true')
    return null
  }
  if (timer) return timer

  const intervalMs = Number(process.env.ACTIVITIES_CACHE_SYNC_INTERVAL_MS || DEFAULT_INTERVAL_MS)
  timer = setInterval(runScheduledSync, intervalMs)
  timer.unref?.()

  if (process.env.ACTIVITIES_CACHE_SYNC_ON_START === 'true') {
    setTimeout(runScheduledSync, 1000).unref?.()
  }

  console.log('[ActivitiesCacheScheduler] Started', { intervalMs })
  return timer
}

function stopActivityCacheScheduler() {
  if (timer) clearInterval(timer)
  timer = null
}

module.exports = { startActivityCacheScheduler, stopActivityCacheScheduler, runScheduledSync }
