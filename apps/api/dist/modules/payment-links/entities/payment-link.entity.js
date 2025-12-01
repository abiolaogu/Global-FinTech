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
exports.PaymentLinkEntity = void 0;
const typeorm_1 = require("typeorm");
let PaymentLinkEntity = class PaymentLinkEntity {
};
exports.PaymentLinkEntity = PaymentLinkEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], PaymentLinkEntity.prototype, "linkId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PaymentLinkEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, unique: true }),
    __metadata("design:type", String)
], PaymentLinkEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], PaymentLinkEntity.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PaymentLinkEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['fixed', 'flexible', 'minimum'],
        default: 'fixed',
    }),
    __metadata("design:type", String)
], PaymentLinkEntity.prototype, "amountType", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 20, scale: 8, nullable: true }),
    __metadata("design:type", String)
], PaymentLinkEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3 }),
    __metadata("design:type", String)
], PaymentLinkEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], PaymentLinkEntity.prototype, "active", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['active', 'inactive', 'expired', 'completed'],
        default: 'active',
    }),
    __metadata("design:type", String)
], PaymentLinkEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], PaymentLinkEntity.prototype, "allowedPaymentMethods", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], PaymentLinkEntity.prototype, "redirectUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], PaymentLinkEntity.prototype, "collectCustomerInfo", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], PaymentLinkEntity.prototype, "customFields", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], PaymentLinkEntity.prototype, "logoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], PaymentLinkEntity.prototype, "brandColor", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], PaymentLinkEntity.prototype, "maxPayments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], PaymentLinkEntity.prototype, "paymentCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 20, scale: 8, default: 0 }),
    __metadata("design:type", String)
], PaymentLinkEntity.prototype, "totalCollected", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PaymentLinkEntity.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], PaymentLinkEntity.prototype, "splitConfigurationId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PaymentLinkEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PaymentLinkEntity.prototype, "lastPaymentAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], PaymentLinkEntity.prototype, "viewCount", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PaymentLinkEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PaymentLinkEntity.prototype, "updatedAt", void 0);
exports.PaymentLinkEntity = PaymentLinkEntity = __decorate([
    (0, typeorm_1.Entity)('payment_links'),
    (0, typeorm_1.Index)(['userId']),
    (0, typeorm_1.Index)(['code'], { unique: true }),
    (0, typeorm_1.Index)(['status'])
], PaymentLinkEntity);
//# sourceMappingURL=payment-link.entity.js.map