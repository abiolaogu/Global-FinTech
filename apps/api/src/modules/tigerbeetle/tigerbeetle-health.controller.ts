import { Controller, Get } from '@nestjs/common';
import { TigerBeetleService } from './tigerbeetle.service';

@Controller('health')
export class TigerBeetleHealthController {
  constructor(private readonly tigerBeetleService: TigerBeetleService) {}

  @Get('tigerbeetle')
  async checkTigerBeetleHealth() {
    const health = await this.tigerBeetleService.healthCheck();

    return {
      service: 'tigerbeetle',
      ...health,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('tigerbeetle/info')
  async getTigerBeetleInfo() {
    return {
      service: 'tigerbeetle',
      cluster_id: process.env.TIGERBEETLE_CLUSTER_ID || '0',
      replica_addresses: process.env.TIGERBEETLE_REPLICA_ADDRESSES,
      version: 'TigerBeetle v0.15.0',
      features: {
        double_entry_accounting: true,
        atomic_transfers: true,
        linked_transfers: true,
        pending_transfers: true,
        high_performance: '1M+ TPS',
      },
    };
  }
}
