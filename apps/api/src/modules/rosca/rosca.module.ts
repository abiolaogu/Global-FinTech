import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RoscaService } from './rosca.service';
import { RoscaController } from './rosca.controller';
import { RoscaCircleEntity } from './entities/rosca-circle.entity';
import { RoscaMembershipEntity } from './entities/rosca-membership.entity';
import { RoscaContributionEntity } from './entities/rosca-contribution.entity';
import { RoscaPayoutEntity } from './entities/rosca-payout.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RoscaCircleEntity,
      RoscaMembershipEntity,
      RoscaContributionEntity,
      RoscaPayoutEntity,
    ]),
    EventEmitterModule,
    ScheduleModule.forRoot(),
  ],
  controllers: [RoscaController],
  providers: [RoscaService],
  exports: [RoscaService],
})
export class RoscaModule {}
