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
exports.VirtualAccountTransactionEntity = void 0;
const typeorm_1 = require("typeorm");
let VirtualAccountTransactionEntity = class VirtualAccountTransactionEntity {
};
exports.VirtualAccountTransactionEntity = VirtualAccountTransactionEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], VirtualAccountTransactionEntity.prototype, "transactionId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], VirtualAccountTransactionEntity.prototype, "virtualAccountId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], VirtualAccountTransactionEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], VirtualAccountTransactionEntity.prototype, "walletId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], VirtualAccountTransactionEntity.prototype, "walletTransactionId", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 20, scale: 8 }),
    __metadata("design:type", String)
], VirtualAccountTransactionEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3 }),
    __metadata("design:type", String)
], VirtualAccountTransactionEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['pending', 'completed', 'failed', 'reversed'],
        default: 'pending',
    }),
    __metadata("design:type", String)
], VirtualAccountTransactionEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], VirtualAccountTransactionEntity.prototype, "senderAccountNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], VirtualAccountTransactionEntity.prototype, "senderAccountName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], VirtualAccountTransactionEntity.prototype, "senderBankName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], VirtualAccountTransactionEntity.prototype, "senderBankCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], VirtualAccountTransactionEntity.prototype, "reference", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], VirtualAccountTransactionEntity.prototype, "sessionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], VirtualAccountTransactionEntity.prototype, "narration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], VirtualAccountTransactionEntity.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], VirtualAccountTransactionEntity.prototype, "providerTransactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], VirtualAccountTransactionEntity.prototype, "providerData", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 20, scale: 8, nullable: true }),
    __metadata("design:type", String)
], VirtualAccountTransactionEntity.prototype, "fee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], VirtualAccountTransactionEntity.prototype, "autoCredited", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], VirtualAccountTransactionEntity.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], VirtualAccountTransactionEntity.prototype, "failedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], VirtualAccountTransactionEntity.prototype, "failureReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], VirtualAccountTransactionEntity.prototype, "reversedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], VirtualAccountTransactionEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], VirtualAccountTransactionEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], VirtualAccountTransactionEntity.prototype, "updatedAt", void 0);
exports.VirtualAccountTransactionEntity = VirtualAccountTransactionEntity = __decorate([
    (0, typeorm_1.Entity)('virtual_account_transactions'),
    (0, typeorm_1.Index)(['virtualAccountId', 'createdAt']),
    (0, typeorm_1.Index)(['userId']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['providerTransactionId']),
    (0, typeorm_1.Index)(['sessionId'])
], VirtualAccountTransactionEntity);
//# sourceMappingURL=virtual-account-transaction.entity.js.map