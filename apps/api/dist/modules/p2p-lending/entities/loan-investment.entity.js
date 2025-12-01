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
exports.LoanInvestmentEntity = void 0;
const typeorm_1 = require("typeorm");
let LoanInvestmentEntity = class LoanInvestmentEntity {
};
exports.LoanInvestmentEntity = LoanInvestmentEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], LoanInvestmentEntity.prototype, "investmentId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], LoanInvestmentEntity.prototype, "loanListingId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], LoanInvestmentEntity.prototype, "lenderId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 8 }),
    __metadata("design:type", String)
], LoanInvestmentEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2 }),
    __metadata("design:type", Number)
], LoanInvestmentEntity.prototype, "interestRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 8, default: '0' }),
    __metadata("design:type", String)
], LoanInvestmentEntity.prototype, "totalReturns", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], LoanInvestmentEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], LoanInvestmentEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], LoanInvestmentEntity.prototype, "updatedAt", void 0);
exports.LoanInvestmentEntity = LoanInvestmentEntity = __decorate([
    (0, typeorm_1.Entity)('loan_investments'),
    (0, typeorm_1.Index)(['loanListingId']),
    (0, typeorm_1.Index)(['lenderId']),
    (0, typeorm_1.Index)(['status'])
], LoanInvestmentEntity);
//# sourceMappingURL=loan-investment.entity.js.map