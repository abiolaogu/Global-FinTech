import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentGatewaysService } from './payment-gateways.service';
import { PaymentGatewaysController } from './payment-gateways.controller';
import { PaymentGatewayEntity } from './entities/payment-gateway.entity';
import { PaymentTransactionEntity } from './entities/payment-transaction.entity';
import { WalletsModule } from '../wallets/wallets.module';
import { SplitPaymentsModule } from '../split-payments/split-payments.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PaymentGatewayEntity,
      PaymentTransactionEntity,
    ]),
    WalletsModule,
    SplitPaymentsModule,
  ],
  controllers: [PaymentGatewaysController],
  providers: [PaymentGatewaysService],
  exports: [PaymentGatewaysService],
})
export class PaymentGatewaysModule {}
