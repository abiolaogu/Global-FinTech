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
exports.WalletEntity = void 0;
const typeorm_1 = require("typeorm");
let WalletEntity = class WalletEntity {
};
exports.WalletEntity = WalletEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], WalletEntity.prototype, "walletId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], WalletEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3 }),
    __metadata("design:type", String)
], WalletEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 20, scale: 8, default: 0 }),
    __metadata("design:type", String)
], WalletEntity.prototype, "balance", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 20, scale: 8, default: 0 }),
    __metadata("design:type", String)
], WalletEntity.prototype, "availableBalance", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 20, scale: 8, default: 0 }),
    __metadata("design:type", String)
], WalletEntity.prototype, "pendingBalance", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 20, scale: 8, default: 0 }),
    __metadata("design:type", String)
], WalletEntity.prototype, "heldBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['active', 'frozen', 'closed', 'restricted'],
        default: 'active',
    }),
    __metadata("design:type", String)
], WalletEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], WalletEntity.prototype, "isPrimary", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], WalletEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], WalletEntity.prototype, "limits", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 20, scale: 8, default: 0 }),
    __metadata("design:type", String)
], WalletEntity.prototype, "lifetimeReceived", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 20, scale: 8, default: 0 }),
    __metadata("design:type", String)
], WalletEntity.prototype, "lifetimeSent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], WalletEntity.prototype, "transactionCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], WalletEntity.prototype, "lastTransactionAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], WalletEntity.prototype, "frozenAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], WalletEntity.prototype, "frozenReason", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], WalletEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], WalletEntity.prototype, "updatedAt", void 0);
exports.WalletEntity = WalletEntity = __decorate([
    (0, typeorm_1.Entity)('wallets'),
    (0, typeorm_1.Index)(['userId', 'currency'], { unique: true }),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['createdAt'])
], WalletEntity);
//# sourceMappingURL=wallet.entity.js.map