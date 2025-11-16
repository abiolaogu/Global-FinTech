import {
  Injectable,
  CanActivate,
  ExecutionContext,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { InjectRedis } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

export const RateLimitConfig = Reflector.createDecorator<{
  points: number;
  duration: number;
  keyPrefix?: string;
}>();

@Injectable()
export class RateLimitGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const rateLimitConfig = this.reflector.get(RateLimitConfig, context.getHandler());

    if (!rateLimitConfig) {
      return true; // No rate limit configured
    }

    const request = context.switchToHttp().getRequest();
    const userId = request.user?.userId;
    const ipAddress = request.ip || request.connection.remoteAddress;

    // Use userId if authenticated, otherwise use IP
    const identifier = userId || ipAddress;
    const keyPrefix = rateLimitConfig.keyPrefix || 'rate-limit';
    const key = `${keyPrefix}:${identifier}`;

    const { points, duration } = rateLimitConfig;

    try {
      // Increment counter
      const current = await this.redis.incr(key);

      // Set expiry on first request
      if (current === 1) {
        await this.redis.expire(key, duration);
      }

      // Check if limit exceeded
      if (current > points) {
        const ttl = await this.redis.ttl(key);

        throw new HttpException(
          {
            statusCode: HttpStatus.TOO_MANY_REQUESTS,
            message: 'Too many requests',
            error: 'Rate limit exceeded',
            retryAfter: ttl,
          },
          HttpStatus.TOO_MANY_REQUESTS,
        );
      }

      // Add rate limit headers to response
      const response = context.switchToHttp().getResponse();
      response.setHeader('X-RateLimit-Limit', points);
      response.setHeader('X-RateLimit-Remaining', Math.max(0, points - current));
      response.setHeader('X-RateLimit-Reset', Date.now() + (await this.redis.ttl(key)) * 1000);

      return true;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      // If Redis fails, allow the request (fail open)
      return true;
    }
  }
}
