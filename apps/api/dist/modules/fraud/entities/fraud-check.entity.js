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
exports.FraudCheckEntity = void 0;
const typeorm_1 = require("typeorm");
let FraudCheckEntity = class FraudCheckEntity {
};
exports.FraudCheckEntity = FraudCheckEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], FraudCheckEntity.prototype, "checkId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], FraudCheckEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], FraudCheckEntity.prototype, "transactionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 8 }),
    __metadata("design:type", String)
], FraudCheckEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], FraudCheckEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], FraudCheckEntity.prototype, "riskScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], FraudCheckEntity.prototype, "riskLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], FraudCheckEntity.prototype, "shouldBlock", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], FraudCheckEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], FraudCheckEntity.prototype, "createdAt", void 0);
exports.FraudCheckEntity = FraudCheckEntity = __decorate([
    (0, typeorm_1.Entity)('fraud_checks'),
    (0, typeorm_1.Index)(['userId', 'createdAt']),
    (0, typeorm_1.Index)(['riskLevel']),
    (0, typeorm_1.Index)(['shouldBlock'])
], FraudCheckEntity);
//# sourceMappingURL=fraud-check.entity.js.map