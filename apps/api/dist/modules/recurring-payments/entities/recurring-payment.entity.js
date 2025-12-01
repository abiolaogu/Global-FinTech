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
exports.RecurringPaymentEntity = void 0;
const typeorm_1 = require("typeorm");
let RecurringPaymentEntity = class RecurringPaymentEntity {
};
exports.RecurringPaymentEntity = RecurringPaymentEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], RecurringPaymentEntity.prototype, "recurringPaymentId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], RecurringPaymentEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], RecurringPaymentEntity.prototype, "merchantId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], RecurringPaymentEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], RecurringPaymentEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 20, scale: 8 }),
    __metadata("design:type", String)
], RecurringPaymentEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3 }),
    __metadata("design:type", String)
], RecurringPaymentEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'],
    }),
    __metadata("design:type", String)
], RecurringPaymentEntity.prototype, "frequency", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['active', 'paused', 'cancelled', 'expired', 'failed'],
        default: 'active',
    }),
    __metadata("design:type", String)
], RecurringPaymentEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], RecurringPaymentEntity.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date', nullable: true }),
    __metadata("design:type", Date)
], RecurringPaymentEntity.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], RecurringPaymentEntity.prototype, "nextPaymentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], RecurringPaymentEntity.prototype, "maxPayments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], RecurringPaymentEntity.prototype, "paymentsMade", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], RecurringPaymentEntity.prototype, "failedPayments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], RecurringPaymentEntity.prototype, "successfulPayments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], RecurringPaymentEntity.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], RecurringPaymentEntity.prototype, "paymentMethodEncrypted", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], RecurringPaymentEntity.prototype, "gatewayId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], RecurringPaymentEntity.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], RecurringPaymentEntity.prototype, "authorizationCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], RecurringPaymentEntity.prototype, "retryAttempts", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 3 }),
    __metadata("design:type", Number)
], RecurringPaymentEntity.prototype, "maxRetryAttempts", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 20, scale: 8, default: 0 }),
    __metadata("design:type", String)
], RecurringPaymentEntity.prototype, "totalCollected", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], RecurringPaymentEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], RecurringPaymentEntity.prototype, "lastPaymentAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], RecurringPaymentEntity.prototype, "lastFailureAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], RecurringPaymentEntity.prototype, "lastFailureReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], RecurringPaymentEntity.prototype, "pausedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], RecurringPaymentEntity.prototype, "cancelledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], RecurringPaymentEntity.prototype, "cancellationReason", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], RecurringPaymentEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], RecurringPaymentEntity.prototype, "updatedAt", void 0);
exports.RecurringPaymentEntity = RecurringPaymentEntity = __decorate([
    (0, typeorm_1.Entity)('recurring_payments'),
    (0, typeorm_1.Index)(['userId']),
    (0, typeorm_1.Index)(['merchantId']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['nextPaymentDate'])
], RecurringPaymentEntity);
//# sourceMappingURL=recurring-payment.entity.js.map