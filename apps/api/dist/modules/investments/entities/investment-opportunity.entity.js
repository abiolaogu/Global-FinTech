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
exports.InvestmentOpportunityEntity = exports.OpportunityStatus = exports.RiskLevel = exports.InvestmentCategory = void 0;
const typeorm_1 = require("typeorm");
const investment_company_entity_1 = require("./investment-company.entity");
const investment_transaction_entity_1 = require("./investment-transaction.entity");
var InvestmentCategory;
(function (InvestmentCategory) {
    InvestmentCategory["STOCKS"] = "stocks";
    InvestmentCategory["BONDS"] = "bonds";
    InvestmentCategory["MUTUAL_FUNDS"] = "mutual_funds";
    InvestmentCategory["ETF"] = "etf";
    InvestmentCategory["REAL_ESTATE"] = "real_estate";
    InvestmentCategory["COMMODITIES"] = "commodities";
    InvestmentCategory["CRYPTOCURRENCY"] = "cryptocurrency";
    InvestmentCategory["PRIVATE_EQUITY"] = "private_equity";
    InvestmentCategory["VENTURE_CAPITAL"] = "venture_capital";
    InvestmentCategory["HEDGE_FUNDS"] = "hedge_funds";
    InvestmentCategory["STRUCTURED_PRODUCTS"] = "structured_products";
    InvestmentCategory["ALTERNATIVE_INVESTMENTS"] = "alternative_investments";
})(InvestmentCategory || (exports.InvestmentCategory = InvestmentCategory = {}));
var RiskLevel;
(function (RiskLevel) {
    RiskLevel["VERY_LOW"] = "very_low";
    RiskLevel["LOW"] = "low";
    RiskLevel["MODERATE"] = "moderate";
    RiskLevel["HIGH"] = "high";
    RiskLevel["VERY_HIGH"] = "very_high";
})(RiskLevel || (exports.RiskLevel = RiskLevel = {}));
var OpportunityStatus;
(function (OpportunityStatus) {
    OpportunityStatus["DRAFT"] = "draft";
    OpportunityStatus["SUBMITTED"] = "submitted";
    OpportunityStatus["UNDER_REVIEW"] = "under_review";
    OpportunityStatus["APPROVED"] = "approved";
    OpportunityStatus["REJECTED"] = "rejected";
    OpportunityStatus["ACTIVE"] = "active";
    OpportunityStatus["PAUSED"] = "paused";
    OpportunityStatus["CLOSED"] = "closed";
    OpportunityStatus["CANCELLED"] = "cancelled";
})(OpportunityStatus || (exports.OpportunityStatus = OpportunityStatus = {}));
let InvestmentOpportunityEntity = class InvestmentOpportunityEntity {
};
exports.InvestmentOpportunityEntity = InvestmentOpportunityEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "opportunityId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "companyId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => investment_company_entity_1.InvestmentCompanyEntity, (company) => company.opportunities),
    (0, typeorm_1.JoinColumn)({ name: 'companyId' }),
    __metadata("design:type", investment_company_entity_1.InvestmentCompanyEntity)
], InvestmentOpportunityEntity.prototype, "company", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, unique: true }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "category", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "riskLevel", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: OpportunityStatus.DRAFT }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 2 }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "minimumInvestment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 2, nullable: true }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "maximumInvestment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 2, nullable: true }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "targetAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 2, default: '0' }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "raisedAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "projectedReturn", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "historicalReturn", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], InvestmentOpportunityEntity.prototype, "investmentTerm", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "liquidityType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: '0' }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "managementFee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: '0' }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "performanceFee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: '0' }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "entryFee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: '0' }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "exitFee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InvestmentOpportunityEntity.prototype, "startDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InvestmentOpportunityEntity.prototype, "endDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InvestmentOpportunityEntity.prototype, "maturityDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "assetClass", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "sector", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], InvestmentOpportunityEntity.prototype, "tags", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], InvestmentOpportunityEntity.prototype, "geographies", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], InvestmentOpportunityEntity.prototype, "prospectusUrls", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], InvestmentOpportunityEntity.prototype, "factSheetUrls", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], InvestmentOpportunityEntity.prototype, "legalDocuments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "thumbnailUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], InvestmentOpportunityEntity.prototype, "imageUrls", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "regulatoryFramework", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], InvestmentOpportunityEntity.prototype, "accreditedInvestorsOnly", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], InvestmentOpportunityEntity.prototype, "complianceCertifications", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], InvestmentOpportunityEntity.prototype, "totalInvestors", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: '0' }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "averageRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], InvestmentOpportunityEntity.prototype, "totalReviews", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], InvestmentOpportunityEntity.prototype, "viewCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], InvestmentOpportunityEntity.prototype, "bookmarkCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], InvestmentOpportunityEntity.prototype, "autoInvestEnabled", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], InvestmentOpportunityEntity.prototype, "dividendReinvestment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "dividendFrequency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "keyHighlights", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], InvestmentOpportunityEntity.prototype, "performanceHistory", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], InvestmentOpportunityEntity.prototype, "allocationBreakdown", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "submittedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InvestmentOpportunityEntity.prototype, "submittedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "reviewedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InvestmentOpportunityEntity.prototype, "reviewedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InvestmentOpportunityEntity.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "launchedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InvestmentOpportunityEntity.prototype, "launchedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], InvestmentOpportunityEntity.prototype, "reviewNotes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => investment_transaction_entity_1.InvestmentTransactionEntity, (transaction) => transaction.opportunity),
    __metadata("design:type", Array)
], InvestmentOpportunityEntity.prototype, "transactions", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], InvestmentOpportunityEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], InvestmentOpportunityEntity.prototype, "updatedAt", void 0);
exports.InvestmentOpportunityEntity = InvestmentOpportunityEntity = __decorate([
    (0, typeorm_1.Entity)('investment_opportunities')
], InvestmentOpportunityEntity);
//# sourceMappingURL=investment-opportunity.entity.js.map