const { cacheGet, cacheSet } = require('../config/redis');

// Fallback in-memory LRU-style cache if Redis is unconfigured or unreachable
const inMemoryCache = new Map();
const DEFAULT_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * ImageCache Service
 * Key format: images:{type}:{slug} (TTL: 7 days)
 */
class ImageCache {
  /**
   * Retrieves cached ImageSearchResponse by key.
   */
  static async get(key) {
    try {
      // 1. Try Redis cache
      const cached = await cacheGet(key);
      if (cached) {
        return {
          ...cached,
          cached: true,
          source: 'cache',
        };
      }
    } catch (err) {
      console.warn(`[ImageCache] Redis GET error for "${key}":`, err.message);
    }

    // 2. Try In-Memory Fallback
    const local = inMemoryCache.get(key);
    if (local) {
      if (Date.now() < local.expiresAt) {
        return {
          ...local.value,
          cached: true,
          source: 'cache',
        };
      } else {
        inMemoryCache.delete(key);
      }
    }

    return null;
  }

  /**
   * Stores ImageSearchResponse in Redis and in-memory cache with 7-day TTL.
   */
  static async set(
    key,
    value,
    ttlSeconds = DEFAULT_TTL_SECONDS
  ) {
    const responseToCache = {
      ...value,
      cached: true,
      source: 'cache',
    };

    // 1. Store in-memory
    inMemoryCache.set(key, {
      value: responseToCache,
      expiresAt: Date.now() + ttlSeconds * 1000,
    });

    // 2. Store in Redis
    try {
      await cacheSet(key, responseToCache, ttlSeconds);
    } catch (err) {
      console.warn(`[ImageCache] Redis SET error for "${key}":`, err.message);
    }
  }

  /**
   * Clear in-memory cache (mainly for testing)
   */
  static clearLocalMemory() {
    inMemoryCache.clear();
  }
}

module.exports = { ImageCache }
module.exports.ImageCache = ImageCache

