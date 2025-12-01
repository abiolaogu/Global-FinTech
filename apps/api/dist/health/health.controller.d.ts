import { HealthCheckService, TypeOrmHealthIndicator, MemoryHealthIndicator, DiskHealthIndicator } from '@nestjs/terminus';
import Redis from 'ioredis';
export declare class HealthController {
    private health;
    private db;
    private memory;
    private disk;
    private readonly redis;
    constructor(health: HealthCheckService, db: TypeOrmHealthIndicator, memory: MemoryHealthIndicator, disk: DiskHealthIndicator, redis: Redis);
    check(): any;
    ready(): any;
    live(): {
        status: string;
        uptime: number;
        timestamp: number;
    };
    private checkRedis;
}
