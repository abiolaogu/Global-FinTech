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
exports.WalletTransactionEntity = void 0;
const typeorm_1 = require("typeorm");
let WalletTransactionEntity = class WalletTransactionEntity {
};
exports.WalletTransactionEntity = WalletTransactionEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], WalletTransactionEntity.prototype, "transactionId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], WalletTransactionEntity.prototype, "walletId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], WalletTransactionEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [
            'credit',
            'debit',
            'hold',
            'release_hold',
            'reversal',
            'fee',
            'refund',
            'adjustment',
        ],
    }),
    __metadata("design:type", String)
], WalletTransactionEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: [
            'payment_received',
            'payment_sent',
            'deposit',
            'withdrawal',
            'transfer_in',
            'transfer_out',
            'split_payment_received',
            'split_payment_sent',
            'fee_charged',
            'refund_received',
            'refund_sent',
            'chargeback',
            'adjustment',
            'interest_earned',
            'cashback',
            'reward',
        ],
    }),
    __metadata("design:type", String)
], WalletTransactionEntity.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 20, scale: 8 }),
    __metadata("design:type", String)
], WalletTransactionEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3 }),
    __metadata("design:type", String)
], WalletTransactionEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 20, scale: 8 }),
    __metadata("design:type", String)
], WalletTransactionEntity.prototype, "balanceBefore", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 20, scale: 8 }),
    __metadata("design:type", String)
], WalletTransactionEntity.prototype, "balanceAfter", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['pending', 'completed', 'failed', 'reversed', 'cancelled'],
        default: 'pending',
    }),
    __metadata("design:type", String)
], WalletTransactionEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], WalletTransactionEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], WalletTransactionEntity.prototype, "counterpartyWalletId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], WalletTransactionEntity.prototype, "counterpartyUserId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], WalletTransactionEntity.prototype, "externalTransactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], WalletTransactionEntity.prototype, "referenceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], WalletTransactionEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], WalletTransactionEntity.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], WalletTransactionEntity.prototype, "paymentGateway", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], WalletTransactionEntity.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], WalletTransactionEntity.prototype, "failedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], WalletTransactionEntity.prototype, "failureReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], WalletTransactionEntity.prototype, "errorCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], WalletTransactionEntity.prototype, "reversedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], WalletTransactionEntity.prototype, "reversalTransactionId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], WalletTransactionEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], WalletTransactionEntity.prototype, "updatedAt", void 0);
exports.WalletTransactionEntity = WalletTransactionEntity = __decorate([
    (0, typeorm_1.Entity)('wallet_transactions'),
    (0, typeorm_1.Index)(['walletId', 'createdAt']),
    (0, typeorm_1.Index)(['userId', 'createdAt']),
    (0, typeorm_1.Index)(['type']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['referenceId']),
    (0, typeorm_1.Index)(['externalTransactionId'])
], WalletTransactionEntity);
//# sourceMappingURL=wallet-transaction.entity.js.map