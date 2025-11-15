import { SetMetadata } from '@nestjs/common';

export const RATE_LIMIT_KEY = 'rate_limit';

export interface RateLimitOptions {
  points: number; // Number of requests allowed
  duration: number; // Time window in seconds
  keyPrefix?: string; // Optional prefix for Redis key
}

/**
 * Rate limit decorator
 *
 * @example
 * @RateLimit({ points: 10, duration: 60 }) // 10 requests per minute
 * @RateLimit({ points: 100, duration: 3600, keyPrefix: 'api' }) // 100 requests per hour
 */
export const RateLimit = (options: RateLimitOptions) =>
  SetMetadata(RATE_LIMIT_KEY, options);
