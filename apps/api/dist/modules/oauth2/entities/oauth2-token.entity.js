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
exports.OAuth2TokenEntity = void 0;
const typeorm_1 = require("typeorm");
let OAuth2TokenEntity = class OAuth2TokenEntity {
};
exports.OAuth2TokenEntity = OAuth2TokenEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], OAuth2TokenEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], OAuth2TokenEntity.prototype, "accessToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], OAuth2TokenEntity.prototype, "refreshToken", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], OAuth2TokenEntity.prototype, "clientId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], OAuth2TokenEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], OAuth2TokenEntity.prototype, "scope", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], OAuth2TokenEntity.prototype, "accessTokenExpiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], OAuth2TokenEntity.prototype, "refreshTokenExpiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], OAuth2TokenEntity.prototype, "revoked", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], OAuth2TokenEntity.prototype, "createdAt", void 0);
exports.OAuth2TokenEntity = OAuth2TokenEntity = __decorate([
    (0, typeorm_1.Entity)('oauth2_tokens'),
    (0, typeorm_1.Index)(['clientId', 'userId']),
    (0, typeorm_1.Index)(['accessToken']),
    (0, typeorm_1.Index)(['refreshToken'])
], OAuth2TokenEntity);
//# sourceMappingURL=oauth2-token.entity.js.map