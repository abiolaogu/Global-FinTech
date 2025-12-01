"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateLimitGuard = exports.RateLimitConfig = void 0;
const common_1 = require("@nestjs/common");
const core_1 = require("@nestjs/core");
const nestjs_redis_1 = require("@liaoliaots/nestjs-redis");
const ioredis_1 = require("ioredis");
exports.RateLimitConfig = core_1.Reflector.createDecorator();
let RateLimitGuard = class RateLimitGuard {
    constructor(reflector, redis) {
        this.reflector = reflector;
        this.redis = redis;
    }
    async canActivate(context) {
        var _a;
        const rateLimitConfig = this.reflector.get(exports.RateLimitConfig, context.getHandler());
        if (!rateLimitConfig) {
            return true;
        }
        const request = context.switchToHttp().getRequest();
        const userId = (_a = request.user) === null || _a === void 0 ? void 0 : _a.userId;
        const ipAddress = request.ip || request.connection.remoteAddress;
        const identifier = userId || ipAddress;
        const keyPrefix = rateLimitConfig.keyPrefix || 'rate-limit';
        const key = `${keyPrefix}:${identifier}`;
        const { points, duration } = rateLimitConfig;
        try {
            const current = await this.redis.incr(key);
            if (current === 1) {
                await this.redis.expire(key, duration);
            }
            if (current > points) {
                const ttl = await this.redis.ttl(key);
                throw new common_1.HttpException({
                    statusCode: common_1.HttpStatus.TOO_MANY_REQUESTS,
                    message: 'Too many requests',
                    error: 'Rate limit exceeded',
                    retryAfter: ttl,
                }, common_1.HttpStatus.TOO_MANY_REQUESTS);
            }
            const response = context.switchToHttp().getResponse();
            response.setHeader('X-RateLimit-Limit', points);
            response.setHeader('X-RateLimit-Remaining', Math.max(0, points - current));
            response.setHeader('X-RateLimit-Reset', Date.now() + (await this.redis.ttl(key)) * 1000);
            return true;
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            return true;
        }
    }
};
exports.RateLimitGuard = RateLimitGuard;
exports.RateLimitGuard = RateLimitGuard = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, nestjs_redis_1.InjectRedis)()),
    __metadata("design:paramtypes", [core_1.Reflector, typeof (_a = typeof ioredis_1.default !== "undefined" && ioredis_1.default) === "function" ? _a : Object])
], RateLimitGuard);
//# sourceMappingURL=rate-limit.guard.js.map