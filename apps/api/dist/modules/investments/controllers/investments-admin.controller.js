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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CompanyPortalController = exports.InvestmentsAdminController = void 0;
const common_1 = require("@nestjs/common");
const investments_service_1 = require("../services/investments.service");
const investment_company_entity_1 = require("../entities/investment-company.entity");
const investment_opportunity_entity_1 = require("../entities/investment-opportunity.entity");
class RegisterCompanyDto {
}
class ReviewCompanyDto {
}
class ReviewOpportunityDto {
}
let InvestmentsAdminController = class InvestmentsAdminController {
    constructor(investmentsService) {
        this.investmentsService = investmentsService;
    }
    async getCompanies(status) {
        return { message: 'Get companies - to be implemented' };
    }
    async getCompany(companyId) {
        return this.investmentsService.getCompany(companyId);
    }
    async reviewCompany(companyId, req, dto) {
        var _a;
        const adminId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || 'admin_demo';
        return this.investmentsService.reviewCompany(companyId, adminId, dto.approved, dto.reason);
    }
    async getOpportunities(status, companyId) {
        return this.investmentsService.searchOpportunities({
            status,
            limit: 100,
        });
    }
    async reviewOpportunity(opportunityId, req, dto) {
        var _a;
        const adminId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || 'admin_demo';
        return this.investmentsService.reviewOpportunity(opportunityId, adminId, dto.action, dto.notes);
    }
    async launchOpportunity(opportunityId, req) {
        var _a;
        const adminId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || 'admin_demo';
        return this.investmentsService.launchOpportunity(opportunityId, adminId);
    }
    async toggleOpportunity(opportunityId, action) {
        return { message: `Opportunity ${action}d successfully` };
    }
    async getStats() {
        return {
            totalCompanies: 0,
            approvedCompanies: 0,
            pendingCompanies: 0,
            totalOpportunities: 0,
            activeOpportunities: 0,
            pendingReview: 0,
            totalInvested: '0',
            totalInvestors: 0,
        };
    }
};
exports.InvestmentsAdminController = InvestmentsAdminController;
__decorate([
    (0, common_1.Get)('companies'),
    __param(0, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvestmentsAdminController.prototype, "getCompanies", null);
__decorate([
    (0, common_1.Get)('companies/:companyId'),
    __param(0, (0, common_1.Param)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvestmentsAdminController.prototype, "getCompany", null);
__decorate([
    (0, common_1.Post)('companies/:companyId/review'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, ReviewCompanyDto]),
    __metadata("design:returntype", Promise)
], InvestmentsAdminController.prototype, "reviewCompany", null);
__decorate([
    (0, common_1.Get)('opportunities'),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InvestmentsAdminController.prototype, "getOpportunities", null);
__decorate([
    (0, common_1.Post)('opportunities/:opportunityId/review'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('opportunityId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, ReviewOpportunityDto]),
    __metadata("design:returntype", Promise)
], InvestmentsAdminController.prototype, "reviewOpportunity", null);
__decorate([
    (0, common_1.Post)('opportunities/:opportunityId/launch'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('opportunityId')),
    __param(1, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InvestmentsAdminController.prototype, "launchOpportunity", null);
__decorate([
    (0, common_1.Post)('opportunities/:opportunityId/:action(pause|unpause)'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    __param(0, (0, common_1.Param)('opportunityId')),
    __param(1, (0, common_1.Param)('action')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], InvestmentsAdminController.prototype, "toggleOpportunity", null);
__decorate([
    (0, common_1.Get)('stats'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], InvestmentsAdminController.prototype, "getStats", null);
exports.InvestmentsAdminController = InvestmentsAdminController = __decorate([
    (0, common_1.Controller)('admin/investments'),
    __metadata("design:paramtypes", [investments_service_1.InvestmentsService])
], InvestmentsAdminController);
let CompanyPortalController = class CompanyPortalController {
    constructor(investmentsService) {
        this.investmentsService = investmentsService;
    }
    async register(dto) {
        return this.investmentsService.registerCompany(dto);
    }
    async getDashboard(req) {
        var _a;
        const companyId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.companyId) || 'comp_demo';
        const company = await this.investmentsService.getCompany(companyId);
        return {
            company,
            stats: {
                totalOpportunities: company.totalOpportunities,
                activeOpportunities: company.activeOpportunities,
                totalRaised: company.totalRaised,
                totalInvestors: company.totalInvestors,
                averageRating: company.averageRating,
            },
        };
    }
    async updateProfile(req, data) {
        var _a;
        const companyId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.companyId) || 'comp_demo';
        return this.investmentsService.updateCompany(companyId, data);
    }
    async getMyOpportunities(req, status) {
        var _a;
        const companyId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.companyId) || 'comp_demo';
        const company = await this.investmentsService.getCompany(companyId);
        return { opportunities: company.opportunities };
    }
};
exports.CompanyPortalController = CompanyPortalController;
__decorate([
    (0, common_1.Post)('register'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [RegisterCompanyDto]),
    __metadata("design:returntype", Promise)
], CompanyPortalController.prototype, "register", null);
__decorate([
    (0, common_1.Get)('dashboard'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], CompanyPortalController.prototype, "getDashboard", null);
__decorate([
    (0, common_1.Put)('profile'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], CompanyPortalController.prototype, "updateProfile", null);
__decorate([
    (0, common_1.Get)('opportunities'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('status')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], CompanyPortalController.prototype, "getMyOpportunities", null);
exports.CompanyPortalController = CompanyPortalController = __decorate([
    (0, common_1.Controller)('company-portal'),
    __metadata("design:paramtypes", [investments_service_1.InvestmentsService])
], CompanyPortalController);
//# sourceMappingURL=investments-admin.controller.js.map