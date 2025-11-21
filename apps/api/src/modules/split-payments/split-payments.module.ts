import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SplitPaymentsService } from './split-payments.service';
import { SplitPaymentsController } from './split-payments.controller';
import { SplitPaymentEntity } from './entities/split-payment.entity';
import { SplitConfigurationEntity } from './entities/split-configuration.entity';
import { WalletsModule } from '../wallets/wallets.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      SplitPaymentEntity,
      SplitConfigurationEntity,
    ]),
    WalletsModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [SplitPaymentsController],
  providers: [SplitPaymentsService],
  exports: [SplitPaymentsService],
})
export class SplitPaymentsModule {}
