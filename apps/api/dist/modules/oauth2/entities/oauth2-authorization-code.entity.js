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
exports.OAuth2AuthorizationCodeEntity = void 0;
const typeorm_1 = require("typeorm");
let OAuth2AuthorizationCodeEntity = class OAuth2AuthorizationCodeEntity {
};
exports.OAuth2AuthorizationCodeEntity = OAuth2AuthorizationCodeEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], OAuth2AuthorizationCodeEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, unique: true }),
    __metadata("design:type", String)
], OAuth2AuthorizationCodeEntity.prototype, "code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], OAuth2AuthorizationCodeEntity.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], OAuth2AuthorizationCodeEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], OAuth2AuthorizationCodeEntity.prototype, "redirectUri", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], OAuth2AuthorizationCodeEntity.prototype, "scope", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], OAuth2AuthorizationCodeEntity.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], OAuth2AuthorizationCodeEntity.prototype, "used", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], OAuth2AuthorizationCodeEntity.prototype, "createdAt", void 0);
exports.OAuth2AuthorizationCodeEntity = OAuth2AuthorizationCodeEntity = __decorate([
    (0, typeorm_1.Entity)('oauth2_authorization_codes'),
    (0, typeorm_1.Index)(['code'], { unique: true }),
    (0, typeorm_1.Index)(['clientId', 'userId'])
], OAuth2AuthorizationCodeEntity);
//# sourceMappingURL=oauth2-authorization-code.entity.js.map