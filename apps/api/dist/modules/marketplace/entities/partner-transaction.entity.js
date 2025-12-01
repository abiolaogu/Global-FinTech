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
exports.PartnerTransactionEntity = exports.FulfillmentStatus = exports.TransactionStatus = void 0;
const typeorm_1 = require("typeorm");
const partner_entity_1 = require("./partner.entity");
const product_entity_1 = require("./product.entity");
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "pending";
    TransactionStatus["PROCESSING"] = "processing";
    TransactionStatus["COMPLETED"] = "completed";
    TransactionStatus["FAILED"] = "failed";
    TransactionStatus["CANCELLED"] = "cancelled";
    TransactionStatus["REFUNDED"] = "refunded";
    TransactionStatus["DISPUTED"] = "disputed";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
var FulfillmentStatus;
(function (FulfillmentStatus) {
    FulfillmentStatus["PENDING"] = "pending";
    FulfillmentStatus["PROCESSING"] = "processing";
    FulfillmentStatus["SHIPPED"] = "shipped";
    FulfillmentStatus["DELIVERED"] = "delivered";
    FulfillmentStatus["FAILED"] = "failed";
    FulfillmentStatus["CANCELLED"] = "cancelled";
})(FulfillmentStatus || (exports.FulfillmentStatus = FulfillmentStatus = {}));
let PartnerTransactionEntity = class PartnerTransactionEntity {
};
exports.PartnerTransactionEntity = PartnerTransactionEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PartnerTransactionEntity.prototype, "transaction_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, unique: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PartnerTransactionEntity.prototype, "reference", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PartnerTransactionEntity.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PartnerTransactionEntity.prototype, "partner_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PartnerTransactionEntity.prototype, "product_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], PartnerTransactionEntity.prototype, "product_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], PartnerTransactionEntity.prototype, "quantity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], PartnerTransactionEntity.prototype, "unit_price", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], PartnerTransactionEntity.prototype, "subtotal", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PartnerTransactionEntity.prototype, "discount_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PartnerTransactionEntity.prototype, "tax_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PartnerTransactionEntity.prototype, "shipping_cost", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2 }),
    __metadata("design:type", Number)
], PartnerTransactionEntity.prototype, "total_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 3, default: 'USD' }),
    __metadata("design:type", String)
], PartnerTransactionEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PartnerTransactionEntity.prototype, "commission_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PartnerTransactionEntity.prototype, "commission_percentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PartnerTransactionEntity.prototype, "partner_payout", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PartnerTransactionEntity.prototype, "platform_revenue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], PartnerTransactionEntity.prototype, "payment_transaction_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], PartnerTransactionEntity.prototype, "payment_method", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], PartnerTransactionEntity.prototype, "payment_status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: TransactionStatus,
        default: TransactionStatus.PENDING,
    }),
    __metadata("design:type", String)
], PartnerTransactionEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: FulfillmentStatus,
        default: FulfillmentStatus.PENDING,
    }),
    __metadata("design:type", String)
], PartnerTransactionEntity.prototype, "fulfillment_status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], PartnerTransactionEntity.prototype, "external_transaction_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PartnerTransactionEntity.prototype, "external_reference", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PartnerTransactionEntity.prototype, "api_request", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PartnerTransactionEntity.prototype, "api_response", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], PartnerTransactionEntity.prototype, "customer_email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], PartnerTransactionEntity.prototype, "customer_phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PartnerTransactionEntity.prototype, "customer_details", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PartnerTransactionEntity.prototype, "shipping_address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], PartnerTransactionEntity.prototype, "tracking_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], PartnerTransactionEntity.prototype, "courier_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PartnerTransactionEntity.prototype, "shipped_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PartnerTransactionEntity.prototype, "delivered_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PartnerTransactionEntity.prototype, "estimated_delivery_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PartnerTransactionEntity.prototype, "product_data", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PartnerTransactionEntity.prototype, "customer_notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PartnerTransactionEntity.prototype, "internal_notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PartnerTransactionEntity.prototype, "is_refunded", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 12, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PartnerTransactionEntity.prototype, "refund_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PartnerTransactionEntity.prototype, "refund_reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PartnerTransactionEntity.prototype, "refunded_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PartnerTransactionEntity.prototype, "is_reviewed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], PartnerTransactionEntity.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PartnerTransactionEntity.prototype, "review_comment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PartnerTransactionEntity.prototype, "reviewed_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PartnerTransactionEntity.prototype, "is_settled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], PartnerTransactionEntity.prototype, "settlement_batch_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PartnerTransactionEntity.prototype, "settled_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], PartnerTransactionEntity.prototype, "retry_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PartnerTransactionEntity.prototype, "error_message", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PartnerTransactionEntity.prototype, "error_details", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PartnerTransactionEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], PartnerTransactionEntity.prototype, "source", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], PartnerTransactionEntity.prototype, "user_agent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], PartnerTransactionEntity.prototype, "ip_address", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PartnerTransactionEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PartnerTransactionEntity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PartnerTransactionEntity.prototype, "completed_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PartnerTransactionEntity.prototype, "failed_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PartnerTransactionEntity.prototype, "cancelled_at", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => partner_entity_1.MarketplacePartnerEntity, (partner) => partner.transactions),
    (0, typeorm_1.JoinColumn)({ name: 'partner_id' }),
    __metadata("design:type", partner_entity_1.MarketplacePartnerEntity)
], PartnerTransactionEntity.prototype, "partner", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => product_entity_1.MarketplaceProductEntity, (product) => product.transactions, {
        nullable: true,
    }),
    (0, typeorm_1.JoinColumn)({ name: 'product_id' }),
    __metadata("design:type", product_entity_1.MarketplaceProductEntity)
], PartnerTransactionEntity.prototype, "product", void 0);
exports.PartnerTransactionEntity = PartnerTransactionEntity = __decorate([
    (0, typeorm_1.Entity)('partner_transactions'),
    (0, typeorm_1.Index)(['user_id', 'status']),
    (0, typeorm_1.Index)(['partner_id', 'status']),
    (0, typeorm_1.Index)(['created_at']),
    (0, typeorm_1.Index)(['reference'])
], PartnerTransactionEntity);
//# sourceMappingURL=partner-transaction.entity.js.map