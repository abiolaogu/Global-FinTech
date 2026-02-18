import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentGatewaysModule } from './modules/payment-gateways/payment-gateways.module';
import { SplitPaymentsModule } from './modules/split-payments/split-payments.module';
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
    ]
  : [];

@Module({
  imports: coreImports,
  controllers: [PlatformController],
})
export class AppModule {}
