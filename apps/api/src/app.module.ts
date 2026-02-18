import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AdminModule } from './modules/admin/admin.module';
import { AIChatModule } from './modules/ai-chat/ai-chat.module';
import { InvestmentsModule } from './modules/investments/investments.module';
import { MarketplaceModule } from './modules/marketplace/marketplace.module';
import { PaymentEngineModule } from './modules/payment-engine/payment-engine.module';
import { PaymentGatewaysModule } from './modules/payment-gateways/payment-gateways.module';
import { PaymentLinksModule } from './modules/payment-links/payment-links.module';
import { RealtimePaymentsModule } from './modules/realtime-payments/realtime-payments.module';
import { RecurringPaymentsModule } from './modules/recurring-payments/recurring-payments.module';
import { RoscaModule } from './modules/rosca/rosca.module';
import { SplitPaymentsModule } from './modules/split-payments/split-payments.module';
import { VirtualAccountsModule } from './modules/virtual-accounts/virtual-accounts.module';
import { WalletsModule } from './modules/wallets/wallets.module';
import { PlatformController } from './platform/platform.controller';

const coreApiEnabled = (process.env.CORE_API_ENABLED ?? 'true').toLowerCase() === 'true';
const databaseSslMode = (process.env.DATABASE_SSL_MODE ?? 'disable').toLowerCase();

const coreImports = coreApiEnabled
  ? [
      TypeOrmModule.forRoot({
        type: 'postgres',
        host: process.env.DATABASE_HOST || '127.0.0.1',
        port: Number(process.env.DATABASE_PORT || 5432),
        username: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'postgres',
        database: process.env.DATABASE_NAME || 'atlasx',
        autoLoadEntities: true,
        synchronize: false,
        ssl:
          databaseSslMode === 'require'
            ? {
                rejectUnauthorized: false,
              }
            : false,
      }),
      EventEmitterModule.forRoot(),
      WalletsModule,
      SplitPaymentsModule,
      PaymentGatewaysModule,
      PaymentLinksModule,
      VirtualAccountsModule,
      RealtimePaymentsModule,
      RecurringPaymentsModule,
      RoscaModule,
      InvestmentsModule,
      MarketplaceModule,
      AIChatModule,
      PaymentEngineModule,
      AdminModule,
    ]
  : [];

@Module({
  imports: coreImports,
  controllers: [PlatformController],
})
export class AppModule {}
