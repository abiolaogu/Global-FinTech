"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const marketplace_controller_1 = require("./marketplace.controller");
const marketplace_service_1 = require("./marketplace.service");
const partner_entity_1 = require("./entities/partner.entity");
const product_entity_1 = require("./entities/product.entity");
const partner_transaction_entity_1 = require("./entities/partner-transaction.entity");
const product_review_entity_1 = require("./entities/product-review.entity");
const marketplace_category_entity_1 = require("./entities/marketplace-category.entity");
const partner_settlement_entity_1 = require("./entities/partner-settlement.entity");
const wallets_module_1 = require("../wallets/wallets.module");
const notifications_module_1 = require("../notifications/notifications.module");
let MarketplaceModule = class MarketplaceModule {
};
exports.MarketplaceModule = MarketplaceModule;
exports.MarketplaceModule = MarketplaceModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                partner_entity_1.MarketplacePartnerEntity,
                product_entity_1.MarketplaceProductEntity,
                partner_transaction_entity_1.PartnerTransactionEntity,
                product_review_entity_1.ProductReviewEntity,
                marketplace_category_entity_1.MarketplaceCategoryEntity,
                partner_settlement_entity_1.PartnerSettlementEntity,
            ]),
            wallets_module_1.WalletsModule,
            notifications_module_1.NotificationsModule,
        ],
        controllers: [marketplace_controller_1.MarketplaceController],
        providers: [marketplace_service_1.MarketplaceService],
        exports: [marketplace_service_1.MarketplaceService],
    })
], MarketplaceModule);
//# sourceMappingURL=marketplace.module.js.map