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
exports.InvestmentCompanyEntity = exports.CompanyType = exports.CompanyStatus = void 0;
const typeorm_1 = require("typeorm");
const investment_opportunity_entity_1 = require("./investment-opportunity.entity");
var CompanyStatus;
(function (CompanyStatus) {
    CompanyStatus["PENDING"] = "pending";
    CompanyStatus["APPROVED"] = "approved";
    CompanyStatus["REJECTED"] = "rejected";
    CompanyStatus["SUSPENDED"] = "suspended";
})(CompanyStatus || (exports.CompanyStatus = CompanyStatus = {}));
var CompanyType;
(function (CompanyType) {
    CompanyType["ASSET_MANAGER"] = "asset_manager";
    CompanyType["VENTURE_CAPITAL"] = "venture_capital";
    CompanyType["PRIVATE_EQUITY"] = "private_equity";
    CompanyType["HEDGE_FUND"] = "hedge_fund";
    CompanyType["REAL_ESTATE"] = "real_estate";
    CompanyType["CROWDFUNDING"] = "crowdfunding";
    CompanyType["BROKER_DEALER"] = "broker_dealer";
})(CompanyType || (exports.CompanyType = CompanyType = {}));
let InvestmentCompanyEntity = class InvestmentCompanyEntity {
};
exports.InvestmentCompanyEntity = InvestmentCompanyEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], InvestmentCompanyEntity.prototype, "companyId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], InvestmentCompanyEntity.prototype, "companyName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, unique: true }),
    __metadata("design:type", String)
], InvestmentCompanyEntity.prototype, "legalName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], InvestmentCompanyEntity.prototype, "registrationNumber", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], InvestmentCompanyEntity.prototype, "companyType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: CompanyStatus.PENDING }),
    __metadata("design:type", String)
], InvestmentCompanyEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], InvestmentCompanyEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], InvestmentCompanyEntity.prototype, "country", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InvestmentCompanyEntity.prototype, "state", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 200 }),
    __metadata("design:type", String)
], InvestmentCompanyEntity.prototype, "address", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], InvestmentCompanyEntity.prototype, "email", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], InvestmentCompanyEntity.prototype, "phone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], InvestmentCompanyEntity.prototype, "website", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InvestmentCompanyEntity.prototype, "secRegistration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InvestmentCompanyEntity.prototype, "finraRegistration", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], InvestmentCompanyEntity.prototype, "licenses", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], InvestmentCompanyEntity.prototype, "regulatoryApprovals", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 2, nullable: true }),
    __metadata("design:type", String)
], InvestmentCompanyEntity.prototype, "assetsUnderManagement", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", String)
], InvestmentCompanyEntity.prototype, "aumCurrency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], InvestmentCompanyEntity.prototype, "yearEstablished", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], InvestmentCompanyEntity.prototype, "totalInvestors", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], InvestmentCompanyEntity.prototype, "complianceDocuments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], InvestmentCompanyEntity.prototype, "logoUrl", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], InvestmentCompanyEntity.prototype, "contactPersonName", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], InvestmentCompanyEntity.prototype, "contactPersonEmail", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], InvestmentCompanyEntity.prototype, "contactPersonPhone", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InvestmentCompanyEntity.prototype, "contactPersonTitle", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], InvestmentCompanyEntity.prototype, "totalOpportunities", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], InvestmentCompanyEntity.prototype, "activeOpportunities", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 2, default: '0' }),
    __metadata("design:type", String)
], InvestmentCompanyEntity.prototype, "totalRaised", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, default: '0' }),
    __metadata("design:type", String)
], InvestmentCompanyEntity.prototype, "averageRating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], InvestmentCompanyEntity.prototype, "totalReviews", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], InvestmentCompanyEntity.prototype, "approvedBy", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InvestmentCompanyEntity.prototype, "approvedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], InvestmentCompanyEntity.prototype, "rejectionReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], InvestmentCompanyEntity.prototype, "internalNotes", void 0);
__decorate([
    (0, typeorm_1.OneToMany)(() => investment_opportunity_entity_1.InvestmentOpportunityEntity, (opportunity) => opportunity.company),
    __metadata("design:type", Array)
], InvestmentCompanyEntity.prototype, "opportunities", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], InvestmentCompanyEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], InvestmentCompanyEntity.prototype, "updatedAt", void 0);
exports.InvestmentCompanyEntity = InvestmentCompanyEntity = __decorate([
    (0, typeorm_1.Entity)('investment_companies')
], InvestmentCompanyEntity);
//# sourceMappingURL=investment-company.entity.js.map