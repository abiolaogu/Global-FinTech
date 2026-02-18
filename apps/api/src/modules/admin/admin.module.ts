import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { UserEntity } from '../users/entities/user.entity';
import { PaymentEntity } from '../payments/entities/payment.entity';
import { FraudCheckEntity } from '../fraud/entities/fraud-check.entity';
import { AMLCheckEntity } from '../aml/entities/aml-check.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      PaymentEntity,
      FraudCheckEntity,
      AMLCheckEntity,
    ]),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
