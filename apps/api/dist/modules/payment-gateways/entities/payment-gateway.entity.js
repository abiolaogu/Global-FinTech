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
exports.PaymentGatewayEntity = void 0;
const typeorm_1 = require("typeorm");
let PaymentGatewayEntity = class PaymentGatewayEntity {
};
exports.PaymentGatewayEntity = PaymentGatewayEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], PaymentGatewayEntity.prototype, "gatewayId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PaymentGatewayEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 100,
    }),
    __metadata("design:type", String)
], PaymentGatewayEntity.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], PaymentGatewayEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PaymentGatewayEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], PaymentGatewayEntity.prototype, "credentialsEncrypted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], PaymentGatewayEntity.prototype, "isLive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], PaymentGatewayEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], PaymentGatewayEntity.prototype, "supportedCurrencies", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], PaymentGatewayEntity.prototype, "supportedCountries", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], PaymentGatewayEntity.prototype, "supportedPaymentMethods", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PaymentGatewayEntity.prototype, "configuration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PaymentGatewayEntity.prototype, "feeConfiguration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 20, scale: 8, default: 0 }),
    __metadata("design:type", String)
], PaymentGatewayEntity.prototype, "totalProcessed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], PaymentGatewayEntity.prototype, "transactionCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PaymentGatewayEntity.prototype, "lastTransactionAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PaymentGatewayEntity.prototype, "lastHealthCheck", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: 'healthy' }),
    __metadata("design:type", String)
], PaymentGatewayEntity.prototype, "healthStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PaymentGatewayEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PaymentGatewayEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PaymentGatewayEntity.prototype, "updatedAt", void 0);
exports.PaymentGatewayEntity = PaymentGatewayEntity = __decorate([
    (0, typeorm_1.Entity)('payment_gateways'),
    (0, typeorm_1.Index)(['userId', 'provider']),
    (0, typeorm_1.Index)(['isActive'])
], PaymentGatewayEntity);
//# sourceMappingURL=payment-gateway.entity.js.map