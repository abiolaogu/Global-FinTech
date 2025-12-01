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
exports.OpenBankingConnectionEntity = void 0;
const typeorm_1 = require("typeorm");
let OpenBankingConnectionEntity = class OpenBankingConnectionEntity {
};
exports.OpenBankingConnectionEntity = OpenBankingConnectionEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], OpenBankingConnectionEntity.prototype, "connectionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], OpenBankingConnectionEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], OpenBankingConnectionEntity.prototype, "institutionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], OpenBankingConnectionEntity.prototype, "accessTokenHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], OpenBankingConnectionEntity.prototype, "itemId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], OpenBankingConnectionEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], OpenBankingConnectionEntity.prototype, "consentExpiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], OpenBankingConnectionEntity.prototype, "disconnectedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], OpenBankingConnectionEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], OpenBankingConnectionEntity.prototype, "updatedAt", void 0);
exports.OpenBankingConnectionEntity = OpenBankingConnectionEntity = __decorate([
    (0, typeorm_1.Entity)('open_banking_connections'),
    (0, typeorm_1.Index)(['userId']),
    (0, typeorm_1.Index)(['status'])
], OpenBankingConnectionEntity);
//# sourceMappingURL=open-banking-connection.entity.js.map