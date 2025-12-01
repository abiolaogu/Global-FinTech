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
exports.PaymentTransactionEntity = void 0;
const typeorm_1 = require("typeorm");
let PaymentTransactionEntity = class PaymentTransactionEntity {
};
exports.PaymentTransactionEntity = PaymentTransactionEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], PaymentTransactionEntity.prototype, "transactionId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PaymentTransactionEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PaymentTransactionEntity.prototype, "merchantId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], PaymentTransactionEntity.prototype, "gatewayId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], PaymentTransactionEntity.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 20, scale: 8 }),
    __metadata("design:type", String)
], PaymentTransactionEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3 }),
    __metadata("design:type", String)
], PaymentTransactionEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['pending', 'processing', 'success', 'failed', 'cancelled', 'refunded', 'partially_refunded'],
        default: 'pending',
    }),
    __metadata("design:type", String)
], PaymentTransactionEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, unique: true }),
    __metadata("design:type", String)
], PaymentTransactionEntity.prototype, "reference", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], PaymentTransactionEntity.prototype, "providerReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], PaymentTransactionEntity.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], PaymentTransactionEntity.prototype, "paymentChannel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PaymentTransactionEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PaymentTransactionEntity.prototype, "customer", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PaymentTransactionEntity.prototype, "paymentDetails", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 20, scale: 8, nullable: true }),
    __metadata("design:type", String)
], PaymentTransactionEntity.prototype, "fee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 20, scale: 8, nullable: true }),
    __metadata("design:type", String)
], PaymentTransactionEntity.prototype, "netAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], PaymentTransactionEntity.prototype, "callbackUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], PaymentTransactionEntity.prototype, "redirectUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], PaymentTransactionEntity.prototype, "authorizationUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], PaymentTransactionEntity.prototype, "accessCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], PaymentTransactionEntity.prototype, "splitPaymentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], PaymentTransactionEntity.prototype, "walletTransactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PaymentTransactionEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PaymentTransactionEntity.prototype, "providerResponse", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PaymentTransactionEntity.prototype, "paidAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PaymentTransactionEntity.prototype, "failedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PaymentTransactionEntity.prototype, "failureReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], PaymentTransactionEntity.prototype, "errorCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PaymentTransactionEntity.prototype, "refundedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 20, scale: 8, nullable: true }),
    __metadata("design:type", String)
], PaymentTransactionEntity.prototype, "refundedAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], PaymentTransactionEntity.prototype, "processingTimeMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], PaymentTransactionEntity.prototype, "ipAddress", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PaymentTransactionEntity.prototype, "userAgent", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PaymentTransactionEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PaymentTransactionEntity.prototype, "updatedAt", void 0);
exports.PaymentTransactionEntity = PaymentTransactionEntity = __decorate([
    (0, typeorm_1.Entity)('payment_transactions'),
    (0, typeorm_1.Index)(['userId', 'createdAt']),
    (0, typeorm_1.Index)(['merchantId', 'createdAt']),
    (0, typeorm_1.Index)(['gatewayId']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['reference']),
    (0, typeorm_1.Index)(['providerReference'])
], PaymentTransactionEntity);
//# sourceMappingURL=payment-transaction.entity.js.map