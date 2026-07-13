import { cacheGet, cacheSet } from '../../../config/redis'

interface KeyUsage {
  key: string
  requestsToday: number
  creditsUsed: number
  lastRequestTimestamp: number
  failuresToday: number
}

interface KeyManagerStats {
  [keyName: string]: KeyUsage
}

export class GeoapifyKeyManager {
  private static KEY_USAGE_REDIS_KEY = 'geoapify:matrix:key_usage'
  private static CREDIT_LIMIT = 2900 // Leave some buffer under 3000 daily limit

  static getKeys(): { key1: string; key2: string } {
    return {
      key1: process.env.GEOAPIFY_MATRIX_KEY_1 || process.env.GEOAPIFY_API_KEY || '',
      key2: process.env.GEOAPIFY_MATRIX_KEY_2 || process.env.GEOAPIFY_API_KEY || '',
    }
  }

  static async getAvailableKey(): Promise<string> {
    const { key1, key2 } = this.getKeys()
    const stats = await this.getStats()

    // 1. Check Key 1 usage
    const usage1 = stats[key1] || this.initUsage(key1)
    if (usage1.creditsUsed < this.CREDIT_LIMIT && usage1.failuresToday < 5) {
      return key1
    }

    // 2. Check Key 2 usage
    const usage2 = stats[key2] || this.initUsage(key2)
    if (usage2.creditsUsed < this.CREDIT_LIMIT && usage2.failuresToday < 5) {
      return key2
    }

    console.warn('[GeoapifyKeyManager] Both Route Matrix API keys exceed limits or show failures. Defaulting to Key 1.')
    return key1
  }

  static async trackRequest(key: string, creditsUsed: number): Promise<void> {
    const stats = await this.getStats()
    if (!stats[key]) {
      stats[key] = this.initUsage(key)
    }

    stats[key].requestsToday += 1
    stats[key].creditsUsed += creditsUsed
    stats[key].lastRequestTimestamp = Date.now()

    await this.saveStats(stats)
  }

  static async trackFailure(key: string): Promise<void> {
    const stats = await this.getStats()
    if (!stats[key]) {
      stats[key] = this.initUsage(key)
    }

    stats[key].failuresToday += 1
    stats[key].lastRequestTimestamp = Date.now()

    await this.saveStats(stats)
  }

  private static initUsage(key: string): KeyUsage {
    const maskedKey = key && key.length > 8 
      ? `${key.substring(0, 4)}...${key.substring(key.length - 4)}` 
      : 'UNKNOWN'
    return {
      key: maskedKey,
      requestsToday: 0,
      creditsUsed: 0,
      lastRequestTimestamp: 0,
      failuresToday: 0
    }
  }

  private static async getStats(): Promise<KeyManagerStats> {
    try {
      const raw = await cacheGet(this.KEY_USAGE_REDIS_KEY)
      if (raw) {
        return typeof raw === 'string' ? JSON.parse(raw) : raw
      }
    } catch (e: any) {
      console.warn('[GeoapifyKeyManager] Redis getStats error:', e.message)
    }
    return {}
  }

  private static async saveStats(stats: KeyManagerStats): Promise<void> {
    try {
      await cacheSet(this.KEY_USAGE_REDIS_KEY, JSON.stringify(stats), 86400)
    } catch (e: any) {
      console.warn('[GeoapifyKeyManager] Redis saveStats error:', e.message)
    }
  }

  /**
   * Get the current daily credit usage as a percentage of the limit.
   * Considers total credits across all keys.
   */
  static async getUsagePercentage(): Promise<number> {
    const stats = await this.getStats()
    const { key1, key2 } = this.getKeys()

    const usage1 = stats[key1]?.creditsUsed || 0
    const usage2 = stats[key2]?.creditsUsed || 0

    // Total limit across both keys
    const totalLimit = this.CREDIT_LIMIT * 2
    const totalUsed = usage1 + usage2

    return totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0
  }

  /**
   * Check if daily usage is above the throttle threshold (80%).
   */
  static async isThrottled(): Promise<boolean> {
    const pct = await this.getUsagePercentage()
    return pct > 80
  }

  /**
   * Get a structured summary of current usage for monitoring/admin endpoints.
   */
  static async getUsageSummary(): Promise<{
    keys: { keyMask: string; requestsToday: number; creditsUsed: number; failuresToday: number }[]
    totalCreditsUsed: number
    totalCreditLimit: number
    usagePercent: number
    isThrottled: boolean
  }> {
    const stats = await this.getStats()
    const { key1, key2 } = this.getKeys()

    const u1 = stats[key1] || this.initUsage(key1)
    const u2 = stats[key2] || this.initUsage(key2)

    const totalUsed = u1.creditsUsed + u2.creditsUsed
    const totalLimit = this.CREDIT_LIMIT * 2
    const pct = totalLimit > 0 ? (totalUsed / totalLimit) * 100 : 0

    return {
      keys: [
        { keyMask: u1.key, requestsToday: u1.requestsToday, creditsUsed: u1.creditsUsed, failuresToday: u1.failuresToday },
        { keyMask: u2.key, requestsToday: u2.requestsToday, creditsUsed: u2.creditsUsed, failuresToday: u2.failuresToday }
      ],
      totalCreditsUsed: totalUsed,
      totalCreditLimit: totalLimit,
      usagePercent: Math.round(pct * 10) / 10,
      isThrottled: pct > 80
    }
  }
}
