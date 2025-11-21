import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RecurringPaymentsService } from './recurring-payments.service';
import { RecurringPaymentsController } from './recurring-payments.controller';
import { RecurringPaymentEntity } from './entities/recurring-payment.entity';
import { PaymentGatewaysModule } from '../payment-gateways/payment-gateways.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    TypeOrmModule.forFeature([RecurringPaymentEntity]),
    PaymentGatewaysModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [RecurringPaymentsController],
  providers: [RecurringPaymentsService],
  exports: [RecurringPaymentsService],
})
export class RecurringPaymentsModule {}
