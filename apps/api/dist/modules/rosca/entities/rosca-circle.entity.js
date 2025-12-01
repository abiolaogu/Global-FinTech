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
exports.RoscaCircleEntity = void 0;
const typeorm_1 = require("typeorm");
let RoscaCircleEntity = class RoscaCircleEntity {
};
exports.RoscaCircleEntity = RoscaCircleEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RoscaCircleEntity.prototype, "circleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], RoscaCircleEntity.prototype, "organizerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], RoscaCircleEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], RoscaCircleEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], RoscaCircleEntity.prototype, "circleType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 8 }),
    __metadata("design:type", String)
], RoscaCircleEntity.prototype, "contributionAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], RoscaCircleEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], RoscaCircleEntity.prototype, "maxMembers", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], RoscaCircleEntity.prototype, "currentMembers", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], RoscaCircleEntity.prototype, "frequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], RoscaCircleEntity.prototype, "cycleDurationDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], RoscaCircleEntity.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], RoscaCircleEntity.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], RoscaCircleEntity.prototype, "nextPayoutDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 1 }),
    __metadata("design:type", Number)
], RoscaCircleEntity.prototype, "currentCycle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], RoscaCircleEntity.prototype, "totalCycles", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], RoscaCircleEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], RoscaCircleEntity.prototype, "allowLateFees", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 10, scale: 2, nullable: true }),
    __metadata("design:type", String)
], RoscaCircleEntity.prototype, "lateFeePercentage", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], RoscaCircleEntity.prototype, "requireKyc", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], RoscaCircleEntity.prototype, "allowPartialPayments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 3 }),
    __metadata("design:type", Number)
], RoscaCircleEntity.prototype, "gracePeriodDays", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], RoscaCircleEntity.prototype, "autoRemindContributions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], RoscaCircleEntity.prototype, "isPrivate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], RoscaCircleEntity.prototype, "inviteCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 8, default: '0' }),
    __metadata("design:type", String)
], RoscaCircleEntity.prototype, "totalContributed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 8, default: '0' }),
    __metadata("design:type", String)
], RoscaCircleEntity.prototype, "totalPaidOut", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 8, default: '0' }),
    __metadata("design:type", String)
], RoscaCircleEntity.prototype, "pendingContributions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], RoscaCircleEntity.prototype, "defaultCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: '100' }),
    __metadata("design:type", String)
], RoscaCircleEntity.prototype, "trustScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], RoscaCircleEntity.prototype, "rules", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], RoscaCircleEntity.prototype, "payoutOrder", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], RoscaCircleEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], RoscaCircleEntity.prototype, "updatedAt", void 0);
exports.RoscaCircleEntity = RoscaCircleEntity = __decorate([
    (0, typeorm_1.Entity)('rosca_circles'),
    (0, typeorm_1.Index)(['organizerId']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['nextPayoutDate']),
    (0, typeorm_1.Index)(['circleType'])
], RoscaCircleEntity);
//# sourceMappingURL=rosca-circle.entity.js.map