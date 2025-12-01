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
exports.RoscaContributionEntity = void 0;
const typeorm_1 = require("typeorm");
let RoscaContributionEntity = class RoscaContributionEntity {
};
exports.RoscaContributionEntity = RoscaContributionEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], RoscaContributionEntity.prototype, "contributionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], RoscaContributionEntity.prototype, "circleId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], RoscaContributionEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], RoscaContributionEntity.prototype, "cycleNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 8 }),
    __metadata("design:type", String)
], RoscaContributionEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], RoscaContributionEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 8, default: '0' }),
    __metadata("design:type", String)
], RoscaContributionEntity.prototype, "lateFee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], RoscaContributionEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], RoscaContributionEntity.prototype, "dueDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], RoscaContributionEntity.prototype, "paidDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], RoscaContributionEntity.prototype, "daysLate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200, nullable: true }),
    __metadata("design:type", String)
], RoscaContributionEntity.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], RoscaContributionEntity.prototype, "transactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], RoscaContributionEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], RoscaContributionEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], RoscaContributionEntity.prototype, "updatedAt", void 0);
exports.RoscaContributionEntity = RoscaContributionEntity = __decorate([
    (0, typeorm_1.Entity)('rosca_contributions'),
    (0, typeorm_1.Index)(['circleId']),
    (0, typeorm_1.Index)(['userId']),
    (0, typeorm_1.Index)(['cycleNumber']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['dueDate'])
], RoscaContributionEntity);
//# sourceMappingURL=rosca-contribution.entity.js.map