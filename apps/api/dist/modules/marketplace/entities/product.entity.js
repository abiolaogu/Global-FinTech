"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceProductEntity = exports.ProductStatus = exports.PricingModel = exports.ProductType = void 0;
const typeorm_1 = require("typeorm");
const partner_entity_1 = require("./partner.entity");
const partner_transaction_entity_1 = require("./partner-transaction.entity");
var ProductType;
(function (ProductType) {
    ProductType["PHYSICAL"] = "physical";
    ProductType["DIGITAL"] = "digital";
    ProductType["SERVICE"] = "service";
    ProductType["SUBSCRIPTION"] = "subscription";
    ProductType["UTILITY"] = "utility";
    ProductType["BOOKING"] = "booking";
})(ProductType || (exports.ProductType = ProductType = {}));
var PricingModel;
(function (PricingModel) {
    PricingModel["FIXED"] = "fixed";
    PricingModel["VARIABLE"] = "variable";
    PricingModel["TIERED"] = "tiered";
    PricingModel["PERCENTAGE"] = "percentage";
    PricingModel["FREE"] = "free";
})(PricingModel || (exports.PricingModel = PricingModel = {}));
var ProductStatus;
(function (ProductStatus) {
    ProductStatus["DRAFT"] = "draft";
    ProductStatus["ACTIVE"] = "active";
    ProductStatus["OUT_OF_STOCK"] = "out_of_stock";
    ProductStatus["DISCONTINUED"] = "discontinued";
    ProductStatus["SUSPENDED"] = "suspended";
})(ProductStatus || (exports.ProductStatus = ProductStatus = {}));
let MarketplaceProductEntity = class MarketplaceProductEntity {
};
exports.MarketplaceProductEntity = MarketplaceProductEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MarketplaceProductEntity.prototype, "product_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], MarketplaceProductEntity.prototype, "partner_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], MarketplaceProductEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], MarketplaceProductEntity.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MarketplaceProductEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MarketplaceProductEntity.prototype, "long_description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ProductType,
    }),
    __metadata("design:type", String)
], MarketplaceProductEntity.prototype, "product_type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PricingModel,
        default: PricingModel.FIXED,
    }),
    __metadata("design:type", String)
], MarketplaceProductEntity.prototype, "pricing_model", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], MarketplaceProductEntity.prototype, "price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 3, default: 'USD' }),
    __metadata("design:type", String)
], MarketplaceProductEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], MarketplaceProductEntity.prototype, "min_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], MarketplaceProductEntity.prototype, "max_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], MarketplaceProductEntity.prototype, "discount_price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], MarketplaceProductEntity.prototype, "discount_ends_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], MarketplaceProductEntity.prototype, "pricing_tiers", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], MarketplaceProductEntity.prototype, "image_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], MarketplaceProductEntity.prototype, "gallery_urls", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], MarketplaceProductEntity.prototype, "video_url", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ProductStatus,
        default: ProductStatus.ACTIVE,
    }),
    __metadata("design:type", String)
], MarketplaceProductEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array' }),
    __metadata("design:type", Array)
], MarketplaceProductEntity.prototype, "countries", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], MarketplaceProductEntity.prototype, "stock_quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], MarketplaceProductEntity.prototype, "sold_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], MarketplaceProductEntity.prototype, "features", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], MarketplaceProductEntity.prototype, "specifications", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MarketplaceProductEntity.prototype, "terms_and_conditions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], MarketplaceProductEntity.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], MarketplaceProductEntity.prototype, "subcategory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], MarketplaceProductEntity.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], MarketplaceProductEntity.prototype, "meta_title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MarketplaceProductEntity.prototype, "meta_description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], MarketplaceProductEntity.prototype, "meta_keywords", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], MarketplaceProductEntity.prototype, "external_product_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], MarketplaceProductEntity.prototype, "api_endpoint", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], MarketplaceProductEntity.prototype, "api_params", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], MarketplaceProductEntity.prototype, "view_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], MarketplaceProductEntity.prototype, "average_rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], MarketplaceProductEntity.prototype, "total_reviews", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], MarketplaceProductEntity.prototype, "total_revenue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], MarketplaceProductEntity.prototype, "is_featured", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], MarketplaceProductEntity.prototype, "is_visible", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], MarketplaceProductEntity.prototype, "display_order", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], MarketplaceProductEntity.prototype, "badges", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], MarketplaceProductEntity.prototype, "estimated_delivery_days", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", Number)
], MarketplaceProductEntity.prototype, "shipping_cost", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], MarketplaceProductEntity.prototype, "requires_kyc", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], MarketplaceProductEntity.prototype, "min_purchase_quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], MarketplaceProductEntity.prototype, "max_purchase_quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], MarketplaceProductEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MarketplaceProductEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], MarketplaceProductEntity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], MarketplaceProductEntity.prototype, "published_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => partner_entity_1.MarketplacePartnerEntity, (partner) => partner.products),
    (0, typeorm_1.JoinColumn)({ name: 'partner_id' }),
    __metadata("design:type", partner_entity_1.MarketplacePartnerEntity)
], MarketplaceProductEntity.prototype, "partner", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => partner_transaction_entity_1.PartnerTransactionEntity, (transaction) => transaction.product),
    __metadata("design:type", Array)
], MarketplaceProductEntity.prototype, "transactions", void 0);
exports.MarketplaceProductEntity = MarketplaceProductEntity = __decorate([
    (0, typeorm_1.Entity)('marketplace_products'),
    (0, typeorm_1.Index)(['partner_id', 'status']),
    (0, typeorm_1.Index)(['status', 'is_featured'])
], MarketplaceProductEntity);
//# sourceMappingURL=product.entity.js.map