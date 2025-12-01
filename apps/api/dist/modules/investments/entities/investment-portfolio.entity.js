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
exports.InvestmentPortfolioEntity = void 0;
const typeorm_1 = require("typeorm");
let InvestmentPortfolioEntity = class InvestmentPortfolioEntity {
};
exports.InvestmentPortfolioEntity = InvestmentPortfolioEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], InvestmentPortfolioEntity.prototype, "portfolioId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], InvestmentPortfolioEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], InvestmentPortfolioEntity.prototype, "opportunityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 8 }),
    __metadata("design:type", String)
], InvestmentPortfolioEntity.prototype, "shares", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 2 }),
    __metadata("design:type", String)
], InvestmentPortfolioEntity.prototype, "totalInvested", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 2 }),
    __metadata("design:type", String)
], InvestmentPortfolioEntity.prototype, "currentValue", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], InvestmentPortfolioEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 2 }),
    __metadata("design:type", String)
], InvestmentPortfolioEntity.prototype, "averageBuyPrice", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 2, default: '0' }),
    __metadata("design:type", String)
], InvestmentPortfolioEntity.prototype, "unrealizedGainLoss", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: '0' }),
    __metadata("design:type", String)
], InvestmentPortfolioEntity.prototype, "unrealizedGainLossPercent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 2, default: '0' }),
    __metadata("design:type", String)
], InvestmentPortfolioEntity.prototype, "realizedGainLoss", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 2, default: '0' }),
    __metadata("design:type", String)
], InvestmentPortfolioEntity.prototype, "totalDividends", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 2, default: '0' }),
    __metadata("design:type", String)
], InvestmentPortfolioEntity.prototype, "totalFeesPaid", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp' }),
    __metadata("design:type", Date)
], InvestmentPortfolioEntity.prototype, "firstInvestmentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InvestmentPortfolioEntity.prototype, "lastInvestmentDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], InvestmentPortfolioEntity.prototype, "totalTransactions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], InvestmentPortfolioEntity.prototype, "buyTransactions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], InvestmentPortfolioEntity.prototype, "sellTransactions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: '0' }),
    __metadata("design:type", String)
], InvestmentPortfolioEntity.prototype, "portfolioAllocationPercent", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], InvestmentPortfolioEntity.prototype, "riskCategory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], InvestmentPortfolioEntity.prototype, "autoInvestEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 2, nullable: true }),
    __metadata("design:type", String)
], InvestmentPortfolioEntity.prototype, "autoInvestAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], InvestmentPortfolioEntity.prototype, "autoInvestFrequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InvestmentPortfolioEntity.prototype, "nextAutoInvestDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], InvestmentPortfolioEntity.prototype, "dividendReinvestment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InvestmentPortfolioEntity.prototype, "lastDividendDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 2, nullable: true }),
    __metadata("design:type", String)
], InvestmentPortfolioEntity.prototype, "lastDividendAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], InvestmentPortfolioEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InvestmentPortfolioEntity.prototype, "closedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], InvestmentPortfolioEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], InvestmentPortfolioEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], InvestmentPortfolioEntity.prototype, "updatedAt", void 0);
exports.InvestmentPortfolioEntity = InvestmentPortfolioEntity = __decorate([
    (0, typeorm_1.Entity)('investment_portfolios'),
    (0, typeorm_1.Index)(['userId', 'opportunityId'], { unique: true })
], InvestmentPortfolioEntity);
//# sourceMappingURL=investment-portfolio.entity.js.map