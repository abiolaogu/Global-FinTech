import Redis from 'ioredis';
export interface CacheOptions {
    ttl?: number;
    prefix?: string;
}
export declare class CacheService {
    private readonly redis;
    private readonly logger;
    private readonly defaultTTL;
    private readonly defaultPrefix;
    constructor(redis: Redis);
    get<T>(key: string, options?: CacheOptions): Promise<T | null>;
    set<T>(key: string, value: T, options?: CacheOptions): Promise<void>;
    del(key: string, options?: CacheOptions): Promise<void>;
    exists(key: string, options?: CacheOptions): Promise<boolean>;
    delByPattern(pattern: string, options?: CacheOptions): Promise<void>;
    getOrSet<T>(key: string, factory: () => Promise<T>, options?: CacheOptions): Promise<T>;
    incr(key: string, options?: CacheOptions): Promise<number>;
    decr(key: string, options?: CacheOptions): Promise<number>;
    setex(key: string, value: any, seconds: number, options?: CacheOptions): Promise<void>;
    ttl(key: string, options?: CacheOptions): Promise<number>;
    flushAll(): Promise<void>;
    private buildKey;
    cacheUser(userId: string, userData: any, ttl?: number): Promise<void>;
    getCachedUser(userId: string): Promise<any>;
    invalidateUser(userId: string): Promise<void>;
    cacheFXRates(rates: Record<string, number>, ttl?: number): Promise<void>;
    getCachedFXRates(): Promise<Record<string, number> | null>;
    cacheQuery(queryKey: string, result: any, ttl?: number): Promise<void>;
    getCachedQuery(queryKey: string): Promise<any>;
}
