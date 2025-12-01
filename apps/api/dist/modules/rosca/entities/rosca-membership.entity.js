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
exports.RoscaMembershipEntity = void 0;
const typeorm_1 = require("typeorm");
let RoscaMembershipEntity = class RoscaMembershipEntity {
};
exports.RoscaMembershipEntity = RoscaMembershipEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RoscaMembershipEntity.prototype, "membershipId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], RoscaMembershipEntity.prototype, "circleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], RoscaMembershipEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], RoscaMembershipEntity.prototype, "role", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], RoscaMembershipEntity.prototype, "payoutPosition", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], RoscaMembershipEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], RoscaMembershipEntity.prototype, "hasReceivedPayout", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], RoscaMembershipEntity.prototype, "payoutReceivedDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 8, default: '0' }),
    __metadata("design:type", String)
], RoscaMembershipEntity.prototype, "totalContributed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 8, default: '0' }),
    __metadata("design:type", String)
], RoscaMembershipEntity.prototype, "totalReceived", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], RoscaMembershipEntity.prototype, "missedPayments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], RoscaMembershipEntity.prototype, "latePayments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], RoscaMembershipEntity.prototype, "onTimePayments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: '100' }),
    __metadata("design:type", String)
], RoscaMembershipEntity.prototype, "reliabilityScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], RoscaMembershipEntity.prototype, "joinedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], RoscaMembershipEntity.prototype, "leftAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], RoscaMembershipEntity.prototype, "preferences", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], RoscaMembershipEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], RoscaMembershipEntity.prototype, "updatedAt", void 0);
exports.RoscaMembershipEntity = RoscaMembershipEntity = __decorate([
    (0, typeorm_1.Entity)('rosca_memberships'),
    (0, typeorm_1.Index)(['circleId']),
    (0, typeorm_1.Index)(['userId']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['payoutPosition'])
], RoscaMembershipEntity);
//# sourceMappingURL=rosca-membership.entity.js.map