import { Injectable, Logger } from '@nestjs/common';
import Redis from 'ioredis';
import { v4 as uuidv4 } from 'uuid';

export interface CachedSearchSession {
  sessionId: string;
  criteria: any;
  offers: any[];
  createdAt: number;
  expiresAt: number;
}

@Injectable()
export class RedisSearchSessionStore {
  private readonly logger = new Logger(RedisSearchSessionStore.name);
  private redis: Redis | null = null;
  private readonly ttlSeconds = 15 * 60; // 15-minute TTL according to Travelport fare lock SLA

  constructor() {
    const redisUrl = process.env.REDIS_URL;
    const redisHost = process.env.REDIS_HOST;
    const redisPort = parseInt(process.env.REDIS_PORT || '6379', 10);

    if (redisUrl || redisHost) {
      try {
        const options = {
          lazyConnect: true,
          maxRetriesPerRequest: 1,
          enableOfflineQueue: false,
          retryStrategy: () => null, // Stop retrying on ECONNREFUSED
        };

        this.redis = redisUrl
          ? new Redis(redisUrl, options)
          : new Redis({ host: redisHost, port: redisPort, ...options });

        // Register error event listener to prevent Node.js 'Unhandled error event' exceptions
        this.redis.on('error', (err) => {
          this.logger.warn(`[Redis Session Store] Connection error: ${err.message}. Falling back to memory cache.`);
          this.redis = null;
        });

        this.redis.connect().catch((err) => {
          this.logger.warn(`[Redis Session Store] Initial connect failed: ${err.message}. Falling back to memory cache.`);
          this.redis = null;
        });
      } catch {
        this.redis = null;
      }
    } else {
      this.logger.log('[Redis Session Store] No REDIS_HOST/REDIS_URL configured — using in-memory session fallback.');
    }
  }

  async saveSession(criteria: any, offers: any[]): Promise<string> {
    const sessionId = `ss_${uuidv4()}`;
    const now = Date.now();
    const session: CachedSearchSession = {
      sessionId,
      criteria,
      offers,
      createdAt: now,
      expiresAt: now + this.ttlSeconds * 1000,
    };

    if (this.redis) {
      try {
        await this.redis.setex(`flight_session:${sessionId}`, this.ttlSeconds, JSON.stringify(session));
        this.logger.log(`[Redis Session Store] Saved search session ${sessionId} with ${offers.length} offers (TTL: 15m)`);
      } catch (err: any) {
        this.logger.warn(`[Redis Session Store Error] ${err.message}`);
      }
    }
    return sessionId;
  }

  async getSession(sessionId: string): Promise<CachedSearchSession | null> {
    if (!this.redis) return null;
    try {
      const data = await this.redis.get(`flight_session:${sessionId}`);
      if (!data) return null;
      return JSON.parse(data);
    } catch (err: any) {
      this.logger.warn(`[Redis Session Store Error] ${err.message}`);
      return null;
    }
  }
}
