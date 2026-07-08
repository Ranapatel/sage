import { Injectable, OnModuleInit } from '@nestjs/common';
import NodeCache from 'node-cache';

@Injectable()
export class TransportCacheService implements OnModuleInit {
  private localCache!: NodeCache;
  private redisUrl: string = '';
  private redisToken: string = '';
  private isRedisConfigured: boolean = false;

  onModuleInit() {
    // Fallback in-process cache (10 minutes default TTL = 600 seconds)
    this.localCache = new NodeCache({ stdTTL: 600, checkperiod: 60 });

    this.redisUrl = (process.env.UPSTASH_REDIS_REST_URL || '').replace(
      /\/$/,
      '',
    );
    this.redisToken = process.env.UPSTASH_REDIS_REST_TOKEN || '';

    if (this.redisUrl && this.redisToken) {
      this.isRedisConfigured = true;
      console.log(
        '[TransportCacheService] Upstash Redis REST credentials detected. Caching enabled.',
      );
    } else {
      console.warn(
        '[TransportCacheService] Upstash Redis REST credentials not set. Falling back entirely to NodeCache.',
      );
    }
  }

  /**
   * Generates cache key following: mmtp:{type}:{origin}:{dest}:{date}
   */
  generateKey(
    type: 'train' | 'bus',
    origin: string,
    dest: string,
    date: string,
  ): string {
    return `mmtp:${type}:${origin.trim().toUpperCase()}:${dest.trim().toUpperCase()}:${date.trim()}`;
  }

  /**
   * Retrieves a cached value
   */
  async get<T>(key: string): Promise<T | null> {
    // 1. Try Redis if configured
    if (this.isRedisConfigured) {
      try {
        const response = await fetch(
          `${this.redisUrl}/get/${encodeURIComponent(key)}`,
          {
            headers: {
              Authorization: `Bearer ${this.redisToken}`,
            },
            // 2-second timeout to prevent slowing down responses
            signal: AbortSignal.timeout(2000),
          },
        );

        if (response.ok) {
          const data = (await response.json()) as { result: string | null };
          if (data && data.result) {
            return JSON.parse(data.result) as T;
          }
        }
      } catch (err) {
        const error = err as Error;
        console.warn(
          `[TransportCacheService] Redis GET failed (${error.message}). Using local cache fallback.`,
        );
      }
    }

    // 2. Fallback to local NodeCache
    const localVal = this.localCache.get<T>(key);
    return localVal !== undefined ? localVal : null;
  }

  /**
   * Caches a value with a default TTL of 10 minutes (600 seconds)
   */
  async set<T>(key: string, value: T, ttlSeconds: number = 600): Promise<void> {
    // 1. Try setting in local cache first
    this.localCache.set(key, value, ttlSeconds);

    // 2. Try Redis if configured
    if (this.isRedisConfigured) {
      try {
        const encodedKey = encodeURIComponent(key);
        const encodedVal = encodeURIComponent(JSON.stringify(value));
        const url = `${this.redisUrl}/set/${encodedKey}/${encodedVal}?ex=${ttlSeconds}`;

        const response = await fetch(url, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${this.redisToken}`,
          },
          signal: AbortSignal.timeout(2000),
        });

        if (!response.ok) {
          console.warn(
            `[TransportCacheService] Redis SET returned status: ${response.status}`,
          );
        }
      } catch (err) {
        const error = err as Error;
        console.warn(
          `[TransportCacheService] Redis SET failed (${error.message}). Cached only in memory.`,
        );
      }
    }
  }
}
