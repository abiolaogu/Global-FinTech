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
exports.VirtualAccountEntity = void 0;
const typeorm_1 = require("typeorm");
let VirtualAccountEntity = class VirtualAccountEntity {
};
exports.VirtualAccountEntity = VirtualAccountEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], VirtualAccountEntity.prototype, "virtualAccountId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], VirtualAccountEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid', { nullable: true }),
    __metadata("design:type", String)
], VirtualAccountEntity.prototype, "walletId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, unique: true }),
    __metadata("design:type", String)
], VirtualAccountEntity.prototype, "accountNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], VirtualAccountEntity.prototype, "accountName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], VirtualAccountEntity.prototype, "bankName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], VirtualAccountEntity.prototype, "bankCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], VirtualAccountEntity.prototype, "routingNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], VirtualAccountEntity.prototype, "iban", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], VirtualAccountEntity.prototype, "swiftCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 3 }),
    __metadata("design:type", String)
], VirtualAccountEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ length: 2 }),
    __metadata("design:type", String)
], VirtualAccountEntity.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['active', 'inactive', 'suspended', 'closed'],
        default: 'active',
    }),
    __metadata("design:type", String)
], VirtualAccountEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['dedicated', 'dynamic', 'pooled'],
        default: 'dedicated',
    }),
    __metadata("design:type", String)
], VirtualAccountEntity.prototype, "accountType", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'varchar',
        length: 100,
    }),
    __metadata("design:type", String)
], VirtualAccountEntity.prototype, "provider", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], VirtualAccountEntity.prototype, "providerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], VirtualAccountEntity.prototype, "providerAccountId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], VirtualAccountEntity.prototype, "autoCredit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], VirtualAccountEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], VirtualAccountEntity.prototype, "providerData", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 20, scale: 8, default: 0 }),
    __metadata("design:type", String)
], VirtualAccountEntity.prototype, "totalReceived", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], VirtualAccountEntity.prototype, "transactionCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], VirtualAccountEntity.prototype, "lastTransactionAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], VirtualAccountEntity.prototype, "activatedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], VirtualAccountEntity.prototype, "suspendedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], VirtualAccountEntity.prototype, "suspensionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], VirtualAccountEntity.prototype, "closedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], VirtualAccountEntity.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], VirtualAccountEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], VirtualAccountEntity.prototype, "updatedAt", void 0);
exports.VirtualAccountEntity = VirtualAccountEntity = __decorate([
    (0, typeorm_1.Entity)('virtual_accounts'),
    (0, typeorm_1.Index)(['userId', 'currency']),
    (0, typeorm_1.Index)(['accountNumber'], { unique: true }),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['providerId'])
], VirtualAccountEntity);
//# sourceMappingURL=virtual-account.entity.js.map