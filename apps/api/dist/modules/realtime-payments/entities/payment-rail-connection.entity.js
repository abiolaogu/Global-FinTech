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
exports.PaymentRailConnectionEntity = void 0;
const typeorm_1 = require("typeorm");
let PaymentRailConnectionEntity = class PaymentRailConnectionEntity {
};
exports.PaymentRailConnectionEntity = PaymentRailConnectionEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PaymentRailConnectionEntity.prototype, "connectionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], PaymentRailConnectionEntity.prototype, "partnerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], PaymentRailConnectionEntity.prototype, "railType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], PaymentRailConnectionEntity.prototype, "railName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], PaymentRailConnectionEntity.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PaymentRailConnectionEntity.prototype, "credentialsEncrypted", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], PaymentRailConnectionEntity.prototype, "apiEndpoint", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PaymentRailConnectionEntity.prototype, "configuration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], PaymentRailConnectionEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], PaymentRailConnectionEntity.prototype, "isLive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], PaymentRailConnectionEntity.prototype, "lastHealthCheck", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20, nullable: true }),
    __metadata("design:type", String)
], PaymentRailConnectionEntity.prototype, "healthStatus", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], PaymentRailConnectionEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], PaymentRailConnectionEntity.prototype, "updatedAt", void 0);
exports.PaymentRailConnectionEntity = PaymentRailConnectionEntity = __decorate([
    (0, typeorm_1.Entity)('payment_rail_connections'),
    (0, typeorm_1.Index)(['partnerId']),
    (0, typeorm_1.Index)(['railType']),
    (0, typeorm_1.Index)(['status'])
], PaymentRailConnectionEntity);
//# sourceMappingURL=payment-rail-connection.entity.js.map