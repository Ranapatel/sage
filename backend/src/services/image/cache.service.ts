import {
  cacheGet,
  cacheSet,
  formatImageCacheKey,
  DEFAULT_TTL_SECONDS,
} from '../../cache/redis'

export class ImageCacheService {
  public static async get<T = any>(provider: string, query: string): Promise<T | null> {
    const key = formatImageCacheKey(provider, query)
    return (await cacheGet(key)) as T | null
  }

  public static async set<T = any>(
    provider: string,
    query: string,
    value: T,
    ttlSeconds: number = DEFAULT_TTL_SECONDS
  ): Promise<void> {
    const key = formatImageCacheKey(provider, query)
    await cacheSet(key, value, ttlSeconds)
  }
}
