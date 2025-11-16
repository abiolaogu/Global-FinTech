import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RealtimePaymentsService } from './realtime-payments.service';
import { RealtimePaymentsController } from './realtime-payments.controller';
import { RealtimePaymentEntity } from './entities/realtime-payment.entity';
import { PaymentRailConnectionEntity } from './entities/payment-rail-connection.entity';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    TypeOrmModule.forFeature([RealtimePaymentEntity, PaymentRailConnectionEntity]),
    EventEmitterModule,
  ],
  controllers: [RealtimePaymentsController],
  providers: [RealtimePaymentsService],
  exports: [RealtimePaymentsService],
})
export class RealtimePaymentsModule {}
