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
exports.WalletHoldEntity = void 0;
const typeorm_1 = require("typeorm");
let WalletHoldEntity = class WalletHoldEntity {
};
exports.WalletHoldEntity = WalletHoldEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], WalletHoldEntity.prototype, "holdId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], WalletHoldEntity.prototype, "walletId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    __metadata("design:type", String)
], WalletHoldEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)('decimal', { precision: 20, scale: 8 }),
    __metadata("design:type", String)
], WalletHoldEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3 }),
    __metadata("design:type", String)
], WalletHoldEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['active', 'released', 'captured', 'expired', 'cancelled'],
        default: 'active',
    }),
    __metadata("design:type", String)
], WalletHoldEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['payment_authorization', 'dispute', 'compliance_check', 'manual', 'other'],
    }),
    __metadata("design:type", String)
], WalletHoldEntity.prototype, "reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], WalletHoldEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], WalletHoldEntity.prototype, "referenceTransactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], WalletHoldEntity.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], WalletHoldEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], WalletHoldEntity.prototype, "releasedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], WalletHoldEntity.prototype, "capturedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], WalletHoldEntity.prototype, "capturedTransactionId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], WalletHoldEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], WalletHoldEntity.prototype, "updatedAt", void 0);
exports.WalletHoldEntity = WalletHoldEntity = __decorate([
    (0, typeorm_1.Entity)('wallet_holds'),
    (0, typeorm_1.Index)(['walletId', 'status']),
    (0, typeorm_1.Index)(['expiresAt'])
], WalletHoldEntity);
//# sourceMappingURL=wallet-hold.entity.js.map