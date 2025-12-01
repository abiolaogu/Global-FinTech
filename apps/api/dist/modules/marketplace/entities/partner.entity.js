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
exports.MarketplacePartnerEntity = exports.PartnerStatus = exports.IntegrationType = exports.PartnerCategory = void 0;
const typeorm_1 = require("typeorm");
const product_entity_1 = require("./product.entity");
const partner_transaction_entity_1 = require("./partner-transaction.entity");
var PartnerCategory;
(function (PartnerCategory) {
    PartnerCategory["FINANCIAL_SERVICES"] = "financial_services";
    PartnerCategory["ECOMMERCE"] = "ecommerce";
    PartnerCategory["TRAVEL"] = "travel";
    PartnerCategory["UTILITIES"] = "utilities";
    PartnerCategory["BUSINESS_SERVICES"] = "business_services";
    PartnerCategory["HEALTH"] = "health";
    PartnerCategory["EDUCATION"] = "education";
    PartnerCategory["LIFESTYLE"] = "lifestyle";
    PartnerCategory["CRYPTO"] = "crypto";
    PartnerCategory["REMITTANCE"] = "remittance";
})(PartnerCategory || (exports.PartnerCategory = PartnerCategory = {}));
var IntegrationType;
(function (IntegrationType) {
    IntegrationType["API"] = "api";
    IntegrationType["REDIRECT"] = "redirect";
    IntegrationType["AFFILIATE"] = "affiliate";
    IntegrationType["WHITE_LABEL"] = "white_label";
    IntegrationType["EMBEDDED"] = "embedded";
})(IntegrationType || (exports.IntegrationType = IntegrationType = {}));
var PartnerStatus;
(function (PartnerStatus) {
    PartnerStatus["PENDING"] = "pending";
    PartnerStatus["ACTIVE"] = "active";
    PartnerStatus["PAUSED"] = "paused";
    PartnerStatus["SUSPENDED"] = "suspended";
    PartnerStatus["INACTIVE"] = "inactive";
})(PartnerStatus || (exports.PartnerStatus = PartnerStatus = {}));
let MarketplacePartnerEntity = class MarketplacePartnerEntity {
};
exports.MarketplacePartnerEntity = MarketplacePartnerEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MarketplacePartnerEntity.prototype, "partner_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], MarketplacePartnerEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, unique: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], MarketplacePartnerEntity.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MarketplacePartnerEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], MarketplacePartnerEntity.prototype, "logo_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], MarketplacePartnerEntity.prototype, "banner_url", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PartnerCategory,
    }),
    __metadata("design:type", String)
], MarketplacePartnerEntity.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], MarketplacePartnerEntity.prototype, "sub_categories", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: IntegrationType,
    }),
    __metadata("design:type", String)
], MarketplacePartnerEntity.prototype, "integration_type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: PartnerStatus,
        default: PartnerStatus.PENDING,
    }),
    __metadata("design:type", String)
], MarketplacePartnerEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array' }),
    __metadata("design:type", Array)
], MarketplacePartnerEntity.prototype, "countries", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], MarketplacePartnerEntity.prototype, "contact_email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], MarketplacePartnerEntity.prototype, "contact_phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], MarketplacePartnerEntity.prototype, "website_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], MarketplacePartnerEntity.prototype, "legal_entity_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], MarketplacePartnerEntity.prototype, "registration_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], MarketplacePartnerEntity.prototype, "api_base_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], MarketplacePartnerEntity.prototype, "api_key", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], MarketplacePartnerEntity.prototype, "api_secret", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], MarketplacePartnerEntity.prototype, "webhook_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MarketplacePartnerEntity.prototype, "redirect_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MarketplacePartnerEntity.prototype, "callback_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], MarketplacePartnerEntity.prototype, "commission_percentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], MarketplacePartnerEntity.prototype, "fixed_commission", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'revenue_share' }),
    __metadata("design:type", String)
], MarketplacePartnerEntity.prototype, "commission_model", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'monthly' }),
    __metadata("design:type", String)
], MarketplacePartnerEntity.prototype, "settlement_frequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 7 }),
    __metadata("design:type", Number)
], MarketplacePartnerEntity.prototype, "settlement_delay_days", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], MarketplacePartnerEntity.prototype, "pending_settlement_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], MarketplacePartnerEntity.prototype, "last_settlement_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], MarketplacePartnerEntity.prototype, "total_transactions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], MarketplacePartnerEntity.prototype, "total_volume", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], MarketplacePartnerEntity.prototype, "total_commission_earned", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], MarketplacePartnerEntity.prototype, "average_rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], MarketplacePartnerEntity.prototype, "total_reviews", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], MarketplacePartnerEntity.prototype, "is_featured", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], MarketplacePartnerEntity.prototype, "is_promoted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], MarketplacePartnerEntity.prototype, "display_order", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], MarketplacePartnerEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], MarketplacePartnerEntity.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MarketplacePartnerEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], MarketplacePartnerEntity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], MarketplacePartnerEntity.prototype, "activated_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], MarketplacePartnerEntity.prototype, "suspended_at", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => product_entity_1.MarketplaceProductEntity, (product) => product.partner),
    __metadata("design:type", Array)
], MarketplacePartnerEntity.prototype, "products", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => partner_transaction_entity_1.PartnerTransactionEntity, (transaction) => transaction.partner),
    __metadata("design:type", Array)
], MarketplacePartnerEntity.prototype, "transactions", void 0);
exports.MarketplacePartnerEntity = MarketplacePartnerEntity = __decorate([
    (0, typeorm_1.Entity)('marketplace_partners'),
    (0, typeorm_1.Index)(['status', 'category']),
    (0, typeorm_1.Index)(['country'])
], MarketplacePartnerEntity);
//# sourceMappingURL=partner.entity.js.map