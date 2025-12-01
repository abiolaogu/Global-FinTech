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
exports.SplitPaymentEntity = void 0;
const typeorm_1 = require("typeorm");
let SplitPaymentEntity = class SplitPaymentEntity {
};
exports.SplitPaymentEntity = SplitPaymentEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], SplitPaymentEntity.prototype, "splitPaymentId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], SplitPaymentEntity.prototype, "paymentId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], SplitPaymentEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 20, scale: 8 }),
    __metadata("design:type", String)
], SplitPaymentEntity.prototype, "totalAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3 }),
    __metadata("design:type", String)
], SplitPaymentEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['pending', 'processing', 'completed', 'failed', 'partially_completed'],
        default: 'pending',
    }),
    __metadata("design:type", String)
], SplitPaymentEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['percentage', 'fixed', 'hybrid'],
        default: 'percentage',
    }),
    __metadata("design:type", String)
], SplitPaymentEntity.prototype, "splitType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Array)
], SplitPaymentEntity.prototype, "splitRules", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], SplitPaymentEntity.prototype, "actualSplits", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 20, scale: 8, nullable: true }),
    __metadata("design:type", String)
], SplitPaymentEntity.prototype, "platformFee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], SplitPaymentEntity.prototype, "splitConfigurationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], SplitPaymentEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SplitPaymentEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], SplitPaymentEntity.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], SplitPaymentEntity.prototype, "failedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SplitPaymentEntity.prototype, "failureReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], SplitPaymentEntity.prototype, "completedSplitsCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], SplitPaymentEntity.prototype, "failedSplitsCount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SplitPaymentEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SplitPaymentEntity.prototype, "updatedAt", void 0);
exports.SplitPaymentEntity = SplitPaymentEntity = __decorate([
    (0, typeorm_1.Entity)('split_payments'),
    (0, typeorm_1.Index)(['paymentId']),
    (0, typeorm_1.Index)(['userId']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['createdAt'])
], SplitPaymentEntity);
//# sourceMappingURL=split-payment.entity.js.map