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
exports.RealtimePaymentEntity = void 0;
const typeorm_1 = require("typeorm");
let RealtimePaymentEntity = class RealtimePaymentEntity {
};
exports.RealtimePaymentEntity = RealtimePaymentEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RealtimePaymentEntity.prototype, "paymentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], RealtimePaymentEntity.prototype, "senderUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], RealtimePaymentEntity.prototype, "receiverUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], RealtimePaymentEntity.prototype, "railType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], RealtimePaymentEntity.prototype, "connectionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 8 }),
    __metadata("design:type", String)
], RealtimePaymentEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], RealtimePaymentEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], RealtimePaymentEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], RealtimePaymentEntity.prototype, "reference", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], RealtimePaymentEntity.prototype, "externalTransactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], RealtimePaymentEntity.prototype, "senderRailId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], RealtimePaymentEntity.prototype, "receiverRailId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], RealtimePaymentEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], RealtimePaymentEntity.prototype, "errorCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], RealtimePaymentEntity.prototype, "errorMessage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, default: '0' }),
    __metadata("design:type", String)
], RealtimePaymentEntity.prototype, "feeAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], RealtimePaymentEntity.prototype, "initiatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], RealtimePaymentEntity.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], RealtimePaymentEntity.prototype, "failedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', nullable: true }),
    __metadata("design:type", Number)
], RealtimePaymentEntity.prototype, "processingTimeMs", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], RealtimePaymentEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], RealtimePaymentEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], RealtimePaymentEntity.prototype, "updatedAt", void 0);
exports.RealtimePaymentEntity = RealtimePaymentEntity = __decorate([
    (0, typeorm_1.Entity)('realtime_payments'),
    (0, typeorm_1.Index)(['senderUserId']),
    (0, typeorm_1.Index)(['receiverUserId']),
    (0, typeorm_1.Index)(['railType']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['externalTransactionId']),
    (0, typeorm_1.Index)(['createdAt'])
], RealtimePaymentEntity);
//# sourceMappingURL=realtime-payment.entity.js.map