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
exports.LoanListingEntity = void 0;
const typeorm_1 = require("typeorm");
let LoanListingEntity = class LoanListingEntity {
};
exports.LoanListingEntity = LoanListingEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LoanListingEntity.prototype, "loanListingId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], LoanListingEntity.prototype, "borrowerId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 8 }),
    __metadata("design:type", String)
], LoanListingEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], LoanListingEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 8, default: '0' }),
    __metadata("design:type", String)
], LoanListingEntity.prototype, "fundedAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], LoanListingEntity.prototype, "interestRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], LoanListingEntity.prototype, "term", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 8 }),
    __metadata("design:type", String)
], LoanListingEntity.prototype, "monthlyPayment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 8 }),
    __metadata("design:type", String)
], LoanListingEntity.prototype, "totalInterest", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 8, nullable: true }),
    __metadata("design:type", String)
], LoanListingEntity.prototype, "outstandingBalance", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], LoanListingEntity.prototype, "purpose", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], LoanListingEntity.prototype, "creditScore", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], LoanListingEntity.prototype, "employmentStatus", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 2, nullable: true }),
    __metadata("design:type", String)
], LoanListingEntity.prototype, "annualIncome", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], LoanListingEntity.prototype, "riskTier", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], LoanListingEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], LoanListingEntity.prototype, "expiresAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], LoanListingEntity.prototype, "fundedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], LoanListingEntity.prototype, "disbursedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], LoanListingEntity.prototype, "firstPaymentDue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], LoanListingEntity.prototype, "repaidAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], LoanListingEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], LoanListingEntity.prototype, "updatedAt", void 0);
exports.LoanListingEntity = LoanListingEntity = __decorate([
    (0, typeorm_1.Entity)('loan_listings'),
    (0, typeorm_1.Index)(['borrowerId']),
    (0, typeorm_1.Index)(['status']),
    (0, typeorm_1.Index)(['riskTier'])
], LoanListingEntity);
//# sourceMappingURL=loan-listing.entity.js.map