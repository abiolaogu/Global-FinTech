import { Module, Global } from '@nestjs/common';
import { TigerBeetleService } from './tigerbeetle.service';
import { TigerBeetleHealthController } from './tigerbeetle-health.controller';

@Global()
@Module({
  providers: [TigerBeetleService],
  controllers: [TigerBeetleHealthController],
  exports: [TigerBeetleService],
})
export class TigerBeetleModule {}
