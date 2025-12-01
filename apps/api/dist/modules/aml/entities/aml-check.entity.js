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
exports.AMLCheckEntity = void 0;
const typeorm_1 = require("typeorm");
let AMLCheckEntity = class AMLCheckEntity {
};
exports.AMLCheckEntity = AMLCheckEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], AMLCheckEntity.prototype, "checkId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], AMLCheckEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], AMLCheckEntity.prototype, "transactionType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 8 }),
    __metadata("design:type", String)
], AMLCheckEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], AMLCheckEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean' }),
    __metadata("design:type", Boolean)
], AMLCheckEntity.prototype, "passed", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Array)
], AMLCheckEntity.prototype, "flags", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], AMLCheckEntity.prototype, "sanctionsMatch", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], AMLCheckEntity.prototype, "pepMatch", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], AMLCheckEntity.prototype, "riskRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], AMLCheckEntity.prototype, "requiresReview", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], AMLCheckEntity.prototype, "counterpartyId", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], AMLCheckEntity.prototype, "createdAt", void 0);
exports.AMLCheckEntity = AMLCheckEntity = __decorate([
    (0, typeorm_1.Entity)('aml_checks'),
    (0, typeorm_1.Index)(['userId', 'createdAt']),
    (0, typeorm_1.Index)(['requiresReview']),
    (0, typeorm_1.Index)(['sanctionsMatch']),
    (0, typeorm_1.Index)(['pepMatch'])
], AMLCheckEntity);
//# sourceMappingURL=aml-check.entity.js.map