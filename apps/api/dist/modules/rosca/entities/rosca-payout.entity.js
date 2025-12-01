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
exports.RoscaPayoutEntity = void 0;
const typeorm_1 = require("typeorm");
let RoscaPayoutEntity = class RoscaPayoutEntity {
};
exports.RoscaPayoutEntity = RoscaPayoutEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RoscaPayoutEntity.prototype, "payoutId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], RoscaPayoutEntity.prototype, "circleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], RoscaPayoutEntity.prototype, "recipientUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], RoscaPayoutEntity.prototype, "cycleNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 8 }),
    __metadata("design:type", String)
], RoscaPayoutEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], RoscaPayoutEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 8, default: '0' }),
    __metadata("design:type", String)
], RoscaPayoutEntity.prototype, "organizerFee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 8, default: '0' }),
    __metadata("design:type", String)
], RoscaPayoutEntity.prototype, "platformFee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 8 }),
    __metadata("design:type", String)
], RoscaPayoutEntity.prototype, "netAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], RoscaPayoutEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], RoscaPayoutEntity.prototype, "scheduledDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], RoscaPayoutEntity.prototype, "processedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], RoscaPayoutEntity.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], RoscaPayoutEntity.prototype, "transactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], RoscaPayoutEntity.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], RoscaPayoutEntity.prototype, "contributionBreakdown", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], RoscaPayoutEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], RoscaPayoutEntity.prototype, "updatedAt", void 0);
exports.RoscaPayoutEntity = RoscaPayoutEntity = __decorate([
    (0, typeorm_1.Entity)('rosca_payouts'),
    (0, typeorm_1.Index)(['circleId']),
    (0, typeorm_1.Index)(['recipientUserId']),
    (0, typeorm_1.Index)(['cycleNumber']),
    (0, typeorm_1.Index)(['status'])
], RoscaPayoutEntity);
//# sourceMappingURL=rosca-payout.entity.js.map