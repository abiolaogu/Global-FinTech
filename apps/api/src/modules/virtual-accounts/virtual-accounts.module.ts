import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VirtualAccountsService } from './virtual-accounts.service';
import { VirtualAccountsController } from './virtual-accounts.controller';
import { VirtualAccountEntity } from './entities/virtual-account.entity';
import { VirtualAccountTransactionEntity } from './entities/virtual-account-transaction.entity';
import { WalletsModule } from '../wallets/wallets.module';
import { EventEmitterModule } from '@nestjs/event-emitter';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      VirtualAccountEntity,
      VirtualAccountTransactionEntity,
    ]),
    WalletsModule,
    EventEmitterModule.forRoot(),
  ],
  controllers: [VirtualAccountsController],
  providers: [VirtualAccountsService],
  exports: [VirtualAccountsService],
})
export class VirtualAccountsModule {}
