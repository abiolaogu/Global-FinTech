import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MarketplaceController } from './marketplace.controller';
import { MarketplaceService } from './marketplace.service';
import { MarketplacePartnerEntity } from './entities/partner.entity';
import { MarketplaceProductEntity } from './entities/product.entity';
import { PartnerTransactionEntity } from './entities/partner-transaction.entity';
import { ProductReviewEntity } from './entities/product-review.entity';
import { MarketplaceCategoryEntity } from './entities/marketplace-category.entity';
import { PartnerSettlementEntity } from './entities/partner-settlement.entity';
import { WalletsModule } from '../wallets/wallets.module';
import { NotificationsModule } from '../notifications/notifications.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      MarketplacePartnerEntity,
      MarketplaceProductEntity,
      PartnerTransactionEntity,
      ProductReviewEntity,
      MarketplaceCategoryEntity,
      PartnerSettlementEntity,
    ]),
    WalletsModule,
    NotificationsModule,
  ],
  controllers: [MarketplaceController],
  providers: [MarketplaceService],
  exports: [MarketplaceService],
})
export class MarketplaceModule {}
