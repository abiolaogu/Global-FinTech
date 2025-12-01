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
exports.ApiKeyEntity = void 0;
const typeorm_1 = require("typeorm");
let ApiKeyEntity = class ApiKeyEntity {
};
exports.ApiKeyEntity = ApiKeyEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ApiKeyEntity.prototype, "keyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], ApiKeyEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], ApiKeyEntity.prototype, "partnerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], ApiKeyEntity.prototype, "keyPrefix", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], ApiKeyEntity.prototype, "keyHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Array)
], ApiKeyEntity.prototype, "scopes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 100 }),
    __metadata("design:type", Number)
], ApiKeyEntity.prototype, "rateLimit", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', default: [] }),
    __metadata("design:type", Array)
], ApiKeyEntity.prototype, "ipWhitelist", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], ApiKeyEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], ApiKeyEntity.prototype, "lastUsedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], ApiKeyEntity.prototype, "revokedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], ApiKeyEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], ApiKeyEntity.prototype, "updatedAt", void 0);
exports.ApiKeyEntity = ApiKeyEntity = __decorate([
    (0, typeorm_1.Entity)('api_keys'),
    (0, typeorm_1.Index)(['partnerId']),
    (0, typeorm_1.Index)(['keyPrefix', 'keyHash'], { unique: true })
], ApiKeyEntity);
//# sourceMappingURL=api-key.entity.js.map