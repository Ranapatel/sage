import { TrainResult, StationInfo } from '../types/trains';

/**
 * Custom lightweight in-memory cache to guarantee zero-dependency fallback.
 */
class InMemoryCache {
  private cache = new Map<string, { value: any; expiry: number }>();

  public get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }
    return entry.value;
  }

  public set(key: string, value: any, ttlSeconds: number): void {
    this.cache.set(key, {
      value,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  public delete(key: string): void {
    this.cache.delete(key);
  }
}

/**
 * Cache service implementing Redis primary cache with zero-dependency memory fallback.
 */
export class TrainCacheService {
  private static memoryCache = new InMemoryCache();
  private static redisClient: any = null;
  private static isRedisConnected = false;

  /**
   * Initializes Redis client if environment variables are provided.
   */
  private static async getRedis(): Promise<any> {
    if (this.redisClient) return this.redisClient;
    if (process.env.REDIS_URL) {
      try {
        // Dynamic import of ioredis to support both Node/ESM and prevent load failures if package is missing
        const { default: Redis } = await import('ioredis');
        this.redisClient = new Redis(process.env.REDIS_URL);
        this.redisClient.on('connect', () => {
          this.isRedisConnected = true;
          console.log('[TrainCacheService] Redis connected.');
        });
        this.redisClient.on('error', (err: any) => {
          this.isRedisConnected = false;
          console.error('[TrainCacheService] Redis error:', err);
        });
        return this.redisClient;
      } catch (e) {
        console.warn('[TrainCacheService] Redis client load failed (ioredis missing). Using memory fallback.');
      }
    }
    return null;
  }

  /**
   * Generates a cache key for train results.
   */
  public static getTrainCacheKey(
    originCode: string,
    destinationCode: string,
    travelDate: string,
    className: string,
  ): string {
    return `trains:${originCode.toUpperCase()}:${destinationCode.toUpperCase()}:${travelDate}:${className.toUpperCase()}`;
  }

  /**
   * Gets cached train results.
   */
  public static async getTrains(key: string): Promise<TrainResult[] | null> {
    // 1. Try Redis
    try {
      const redis = await this.getRedis();
      if (redis && this.isRedisConnected) {
        const cached = await redis.get(key);
        if (cached) {
          return JSON.parse(cached) as TrainResult[];
        }
        return null;
      }
    } catch (e) {
      console.warn('[TrainCacheService] Failed to get from Redis. Falling back to memory.', e);
    }

    // 2. Fallback to memory
    return this.memoryCache.get(key);
  }

  /**
   * Caches train results for 10 minutes.
   */
  public static async setTrains(key: string, results: TrainResult[]): Promise<void> {
    const ttlSeconds = 600; // 10 minutes

    // 1. Set in Redis
    try {
      const redis = await this.getRedis();
      if (redis && this.isRedisConnected) {
        await redis.set(key, JSON.stringify(results), 'EX', ttlSeconds);
        return;
      }
    } catch (e) {
      console.warn('[TrainCacheService] Failed to set in Redis. Using memory.', e);
    }

    // 2. Set in Memory
    this.memoryCache.set(key, results, ttlSeconds);
  }

  /**
   * Gets cached station resolution.
   */
  public static async getStation(query: string): Promise<StationInfo | null> {
    const key = `station:${query.toLowerCase().trim()}`;

    try {
      const redis = await this.getRedis();
      if (redis && this.isRedisConnected) {
        const cached = await redis.get(key);
        if (cached) {
          return JSON.parse(cached) as StationInfo;
        }
        return null;
      }
    } catch (e) {
      console.warn('[TrainCacheService] Failed to get station from Redis.', e);
    }

    return this.memoryCache.get(key);
  }

  /**
   * Caches station resolution for 24 hours.
   */
  public static async setStation(query: string, info: StationInfo): Promise<void> {
    const key = `station:${query.toLowerCase().trim()}`;
    const ttlSeconds = 86400; // 24 hours

    try {
      const redis = await this.getRedis();
      if (redis && this.isRedisConnected) {
        await redis.set(key, JSON.stringify(info), 'EX', ttlSeconds);
        return;
      }
    } catch (e) {
      console.warn('[TrainCacheService] Failed to set station in Redis.', e);
    }

    this.memoryCache.set(key, info, ttlSeconds);
  }
}
