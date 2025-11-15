import { Injectable, Logger } from '@nestjs/common';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

export interface CacheOptions {
  ttl?: number; // Time to live in seconds
  prefix?: string; // Cache key prefix
}

@Injectable()
export class CacheService {
  private readonly logger = new Logger(CacheService.name);
  private readonly defaultTTL = 3600; // 1 hour
  private readonly defaultPrefix = 'cache';

  constructor(@InjectRedis() private readonly redis: Redis) {}

  /**
   * Get value from cache
   */
  async get<T>(key: string, options?: CacheOptions): Promise<T | null> {
    const fullKey = this.buildKey(key, options?.prefix);

    try {
      const value = await this.redis.get(fullKey);

      if (!value) {
        return null;
      }

      return JSON.parse(value) as T;
    } catch (error) {
      this.logger.error(`Failed to get cache key ${fullKey}: ${error.message}`);
      return null;
    }
  }

  /**
   * Set value in cache
   */
  async set<T>(key: string, value: T, options?: CacheOptions): Promise<void> {
    const fullKey = this.buildKey(key, options?.prefix);
    const ttl = options?.ttl || this.defaultTTL;

    try {
      const serialized = JSON.stringify(value);
      await this.redis.setex(fullKey, ttl, serialized);
    } catch (error) {
      this.logger.error(`Failed to set cache key ${fullKey}: ${error.message}`);
    }
  }

  /**
   * Delete value from cache
   */
  async del(key: string, options?: CacheOptions): Promise<void> {
    const fullKey = this.buildKey(key, options?.prefix);

    try {
      await this.redis.del(fullKey);
    } catch (error) {
      this.logger.error(`Failed to delete cache key ${fullKey}: ${error.message}`);
    }
  }

  /**
   * Check if key exists
   */
  async exists(key: string, options?: CacheOptions): Promise<boolean> {
    const fullKey = this.buildKey(key, options?.prefix);

    try {
      const result = await this.redis.exists(fullKey);
      return result === 1;
    } catch (error) {
      this.logger.error(`Failed to check cache key ${fullKey}: ${error.message}`);
      return false;
    }
  }

  /**
   * Delete keys by pattern
   */
  async delByPattern(pattern: string, options?: CacheOptions): Promise<void> {
    const fullPattern = this.buildKey(pattern, options?.prefix);

    try {
      const keys = await this.redis.keys(fullPattern);

      if (keys.length > 0) {
        await this.redis.del(...keys);
        this.logger.log(`Deleted ${keys.length} keys matching pattern ${fullPattern}`);
      }
    } catch (error) {
      this.logger.error(`Failed to delete keys by pattern ${fullPattern}: ${error.message}`);
    }
  }

  /**
   * Get or set (fetch from cache or compute and cache)
   */
  async getOrSet<T>(
    key: string,
    factory: () => Promise<T>,
    options?: CacheOptions,
  ): Promise<T> {
    // Try to get from cache
    const cached = await this.get<T>(key, options);

    if (cached !== null) {
      return cached;
    }

    // Not in cache, compute value
    const value = await factory();

    // Store in cache
    await this.set(key, value, options);

    return value;
  }

  /**
   * Increment counter
   */
  async incr(key: string, options?: CacheOptions): Promise<number> {
    const fullKey = this.buildKey(key, options?.prefix);

    try {
      return await this.redis.incr(fullKey);
    } catch (error) {
      this.logger.error(`Failed to increment cache key ${fullKey}: ${error.message}`);
      return 0;
    }
  }

  /**
   * Decrement counter
   */
  async decr(key: string, options?: CacheOptions): Promise<number> {
    const fullKey = this.buildKey(key, options?.prefix);

    try {
      return await this.redis.decr(fullKey);
    } catch (error) {
      this.logger.error(`Failed to decrement cache key ${fullKey}: ${error.message}`);
      return 0;
    }
  }

  /**
   * Set with expiry (atomic operation)
   */
  async setex(key: string, value: any, seconds: number, options?: CacheOptions): Promise<void> {
    const fullKey = this.buildKey(key, options?.prefix);

    try {
      const serialized = JSON.stringify(value);
      await this.redis.setex(fullKey, seconds, serialized);
    } catch (error) {
      this.logger.error(`Failed to setex cache key ${fullKey}: ${error.message}`);
    }
  }

  /**
   * Get TTL for key
   */
  async ttl(key: string, options?: CacheOptions): Promise<number> {
    const fullKey = this.buildKey(key, options?.prefix);

    try {
      return await this.redis.ttl(fullKey);
    } catch (error) {
      this.logger.error(`Failed to get TTL for cache key ${fullKey}: ${error.message}`);
      return -1;
    }
  }

  /**
   * Flush entire cache (use with caution!)
   */
  async flushAll(): Promise<void> {
    try {
      await this.redis.flushdb();
      this.logger.warn('Flushed entire Redis cache');
    } catch (error) {
      this.logger.error(`Failed to flush cache: ${error.message}`);
    }
  }

  /**
   * Build full cache key with prefix
   */
  private buildKey(key: string, prefix?: string): string {
    const keyPrefix = prefix || this.defaultPrefix;
    return `${keyPrefix}:${key}`;
  }

  /**
   * Cache user data
   */
  async cacheUser(userId: string, userData: any, ttl: number = 3600): Promise<void> {
    await this.set(`user:${userId}`, userData, { prefix: 'users', ttl });
  }

  /**
   * Get cached user data
   */
  async getCachedUser(userId: string): Promise<any> {
    return this.get(`user:${userId}`, { prefix: 'users' });
  }

  /**
   * Invalidate user cache
   */
  async invalidateUser(userId: string): Promise<void> {
    await this.del(`user:${userId}`, { prefix: 'users' });
  }

  /**
   * Cache FX rates
   */
  async cacheFXRates(rates: Record<string, number>, ttl: number = 300): Promise<void> {
    await this.set('fx_rates', rates, { prefix: 'rates', ttl });
  }

  /**
   * Get cached FX rates
   */
  async getCachedFXRates(): Promise<Record<string, number> | null> {
    return this.get('fx_rates', { prefix: 'rates' });
  }

  /**
   * Cache query result
   */
  async cacheQuery(
    queryKey: string,
    result: any,
    ttl: number = 600,
  ): Promise<void> {
    await this.set(queryKey, result, { prefix: 'query', ttl });
  }

  /**
   * Get cached query result
   */
  async getCachedQuery(queryKey: string): Promise<any> {
    return this.get(queryKey, { prefix: 'query' });
  }
}
