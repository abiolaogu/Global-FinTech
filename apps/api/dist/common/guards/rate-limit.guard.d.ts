import { CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import Redis from 'ioredis';
export declare const RateLimitConfig: import("@nestjs/core").ReflectableDecorator<{
    points: number;
    duration: number;
    keyPrefix?: string;
}, {
    points: number;
    duration: number;
    keyPrefix?: string;
}>;
export declare class RateLimitGuard implements CanActivate {
    private reflector;
    private readonly redis;
    constructor(reflector: Reflector, redis: Redis);
    canActivate(context: ExecutionContext): Promise<boolean>;
}
