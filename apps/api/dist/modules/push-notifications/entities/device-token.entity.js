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
exports.DeviceTokenEntity = void 0;
const typeorm_1 = require("typeorm");
let DeviceTokenEntity = class DeviceTokenEntity {
};
exports.DeviceTokenEntity = DeviceTokenEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], DeviceTokenEntity.prototype, "id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], DeviceTokenEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', unique: true }),
    __metadata("design:type", String)
], DeviceTokenEntity.prototype, "token", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], DeviceTokenEntity.prototype, "platform", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], DeviceTokenEntity.prototype, "deviceId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], DeviceTokenEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], DeviceTokenEntity.prototype, "lastUsedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], DeviceTokenEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], DeviceTokenEntity.prototype, "updatedAt", void 0);
exports.DeviceTokenEntity = DeviceTokenEntity = __decorate([
    (0, typeorm_1.Entity)('device_tokens'),
    (0, typeorm_1.Index)(['userId']),
    (0, typeorm_1.Index)(['token'], { unique: true })
], DeviceTokenEntity);
//# sourceMappingURL=device-token.entity.js.map