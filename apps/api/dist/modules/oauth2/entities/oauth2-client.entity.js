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
exports.OAuth2ClientEntity = void 0;
const typeorm_1 = require("typeorm");
let OAuth2ClientEntity = class OAuth2ClientEntity {
};
exports.OAuth2ClientEntity = OAuth2ClientEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], OAuth2ClientEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, unique: true }),
    __metadata("design:type", String)
], OAuth2ClientEntity.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], OAuth2ClientEntity.prototype, "clientSecretHash", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], OAuth2ClientEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], OAuth2ClientEntity.prototype, "partnerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Array)
], OAuth2ClientEntity.prototype, "redirectUris", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Array)
], OAuth2ClientEntity.prototype, "scopes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], OAuth2ClientEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], OAuth2ClientEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], OAuth2ClientEntity.prototype, "updatedAt", void 0);
exports.OAuth2ClientEntity = OAuth2ClientEntity = __decorate([
    (0, typeorm_1.Entity)('oauth2_clients'),
    (0, typeorm_1.Index)(['partnerId']),
    (0, typeorm_1.Index)(['clientId'], { unique: true })
], OAuth2ClientEntity);
//# sourceMappingURL=oauth2-client.entity.js.map