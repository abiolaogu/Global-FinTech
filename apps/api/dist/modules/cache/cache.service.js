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
var CacheService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CacheService = void 0;
const common_1 = require("@nestjs/common");
const nestjs_redis_1 = require("@liaoliaots/nestjs-redis");
const ioredis_1 = require("ioredis");
let CacheService = CacheService_1 = class CacheService {
    constructor(redis) {
        this.redis = redis;
        this.logger = new common_1.Logger(CacheService_1.name);
        this.defaultTTL = 3600;
        this.defaultPrefix = 'cache';
    }
    async get(key, options) {
        const fullKey = this.buildKey(key, options === null || options === void 0 ? void 0 : options.prefix);
        try {
            const value = await this.redis.get(fullKey);
            if (!value) {
                return null;
            }
            return JSON.parse(value);
        }
        catch (error) {
            this.logger.error(`Failed to get cache key ${fullKey}: ${error.message}`);
            return null;
        }
    }
    async set(key, value, options) {
        const fullKey = this.buildKey(key, options === null || options === void 0 ? void 0 : options.prefix);
        const ttl = (options === null || options === void 0 ? void 0 : options.ttl) || this.defaultTTL;
        try {
            const serialized = JSON.stringify(value);
            await this.redis.setex(fullKey, ttl, serialized);
        }
        catch (error) {
            this.logger.error(`Failed to set cache key ${fullKey}: ${error.message}`);
        }
    }
    async del(key, options) {
        const fullKey = this.buildKey(key, options === null || options === void 0 ? void 0 : options.prefix);
        try {
            await this.redis.del(fullKey);
        }
        catch (error) {
            this.logger.error(`Failed to delete cache key ${fullKey}: ${error.message}`);
        }
    }
    async exists(key, options) {
        const fullKey = this.buildKey(key, options === null || options === void 0 ? void 0 : options.prefix);
        try {
            const result = await this.redis.exists(fullKey);
            return result === 1;
        }
        catch (error) {
            this.logger.error(`Failed to check cache key ${fullKey}: ${error.message}`);
            return false;
        }
    }
    async delByPattern(pattern, options) {
        const fullPattern = this.buildKey(pattern, options === null || options === void 0 ? void 0 : options.prefix);
        try {
            const keys = await this.redis.keys(fullPattern);
            if (keys.length > 0) {
                await this.redis.del(...keys);
                this.logger.log(`Deleted ${keys.length} keys matching pattern ${fullPattern}`);
            }
        }
        catch (error) {
            this.logger.error(`Failed to delete keys by pattern ${fullPattern}: ${error.message}`);
        }
    }
    async getOrSet(key, factory, options) {
        const cached = await this.get(key, options);
        if (cached !== null) {
            return cached;
        }
        const value = await factory();
        await this.set(key, value, options);
        return value;
    }
    async incr(key, options) {
        const fullKey = this.buildKey(key, options === null || options === void 0 ? void 0 : options.prefix);
        try {
            return await this.redis.incr(fullKey);
        }
        catch (error) {
            this.logger.error(`Failed to increment cache key ${fullKey}: ${error.message}`);
            return 0;
        }
    }
    async decr(key, options) {
        const fullKey = this.buildKey(key, options === null || options === void 0 ? void 0 : options.prefix);
        try {
            return await this.redis.decr(fullKey);
        }
        catch (error) {
            this.logger.error(`Failed to decrement cache key ${fullKey}: ${error.message}`);
            return 0;
        }
    }
    async setex(key, value, seconds, options) {
        const fullKey = this.buildKey(key, options === null || options === void 0 ? void 0 : options.prefix);
        try {
            const serialized = JSON.stringify(value);
            await this.redis.setex(fullKey, seconds, serialized);
        }
        catch (error) {
            this.logger.error(`Failed to setex cache key ${fullKey}: ${error.message}`);
        }
    }
    async ttl(key, options) {
        const fullKey = this.buildKey(key, options === null || options === void 0 ? void 0 : options.prefix);
        try {
            return await this.redis.ttl(fullKey);
        }
        catch (error) {
            this.logger.error(`Failed to get TTL for cache key ${fullKey}: ${error.message}`);
            return -1;
        }
    }
    async flushAll() {
        try {
            await this.redis.flushdb();
            this.logger.warn('Flushed entire Redis cache');
        }
        catch (error) {
            this.logger.error(`Failed to flush cache: ${error.message}`);
        }
    }
    buildKey(key, prefix) {
        const keyPrefix = prefix || this.defaultPrefix;
        return `${keyPrefix}:${key}`;
    }
    async cacheUser(userId, userData, ttl = 3600) {
        await this.set(`user:${userId}`, userData, { prefix: 'users', ttl });
    }
    async getCachedUser(userId) {
        return this.get(`user:${userId}`, { prefix: 'users' });
    }
    async invalidateUser(userId) {
        await this.del(`user:${userId}`, { prefix: 'users' });
    }
    async cacheFXRates(rates, ttl = 300) {
        await this.set('fx_rates', rates, { prefix: 'rates', ttl });
    }
    async getCachedFXRates() {
        return this.get('fx_rates', { prefix: 'rates' });
    }
    async cacheQuery(queryKey, result, ttl = 600) {
        await this.set(queryKey, result, { prefix: 'query', ttl });
    }
    async getCachedQuery(queryKey) {
        return this.get(queryKey, { prefix: 'query' });
    }
};
exports.CacheService = CacheService;
exports.CacheService = CacheService = CacheService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, nestjs_redis_1.InjectRedis)()),
    __metadata("design:paramtypes", [typeof (_a = typeof ioredis_1.default !== "undefined" && ioredis_1.default) === "function" ? _a : Object])
], CacheService);
//# sourceMappingURL=cache.service.js.map