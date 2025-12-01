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
exports.InvestmentsController = void 0;
const common_1 = require("@nestjs/common");
const investments_service_1 = require("../services/investments.service");
const investment_transaction_entity_1 = require("../entities/investment-transaction.entity");
class SearchOpportunitiesDto {
}
class InvestDto {
}
class CreateOpportunityDto {
}
let InvestmentsController = class InvestmentsController {
    constructor(investmentsService) {
        this.investmentsService = investmentsService;
    }
    async searchOpportunities(filters) {
        return this.investmentsService.searchOpportunities(filters);
    }
    async getTrending(limit) {
        return this.investmentsService.getTrendingOpportunities(limit);
    }
    async getOpportunity(opportunityId) {
        return this.investmentsService.getOpportunity(opportunityId);
    }
    async invest(req, dto) {
        var _a;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || 'usr_demo';
        return this.investmentsService.invest(userId, dto.opportunityId, dto.amount, dto.currency, dto.paymentMethod);
    }
    async getPortfolio(req) {
        var _a;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || 'usr_demo';
        return this.investmentsService.getUserPortfolio(userId);
    }
    async getTransactions(req, type, status, limit, offset) {
        var _a;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || 'usr_demo';
        return this.investmentsService.getUserTransactions(userId, {
            type,
            status,
            limit,
            offset,
        });
    }
    async createOpportunity(companyId, dto) {
        return this.investmentsService.createOpportunity(companyId, dto);
    }
    async submitOpportunity(opportunityId, req, companyId) {
        var _a;
        const userId = ((_a = req.user) === null || _a === void 0 ? void 0 : _a.userId) || 'usr_demo';
        return this.investmentsService.submitOpportunity(opportunityId, companyId, userId);
    }
    async updateOpportunity(opportunityId, data) {
        return { message: 'Update not implemented in service yet' };
    }
};
exports.InvestmentsController = InvestmentsController;
__decorate([
    (0, common_1.Get)('opportunities/search'),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [SearchOpportunitiesDto]),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "searchOpportunities", null);
__decorate([
    (0, common_1.Get)('opportunities/trending'),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "getTrending", null);
__decorate([
    (0, common_1.Get)('opportunities/:opportunityId'),
    __param(0, (0, common_1.Param)('opportunityId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "getOpportunity", null);
__decorate([
    (0, common_1.Post)('invest'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, InvestDto]),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "invest", null);
__decorate([
    (0, common_1.Get)('portfolio'),
    __param(0, (0, common_1.Request)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "getPortfolio", null);
__decorate([
    (0, common_1.Get)('transactions'),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('status')),
    __param(3, (0, common_1.Query)('limit')),
    __param(4, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Post)('companies/:companyId/opportunities'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Param)('companyId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateOpportunityDto]),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "createOpportunity", null);
__decorate([
    (0, common_1.Post)('opportunities/:opportunityId/submit'),
    __param(0, (0, common_1.Param)('opportunityId')),
    __param(1, (0, common_1.Request)()),
    __param(2, (0, common_1.Body)('companyId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, String]),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "submitOpportunity", null);
__decorate([
    (0, common_1.Put)('opportunities/:opportunityId'),
    __param(0, (0, common_1.Param)('opportunityId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], InvestmentsController.prototype, "updateOpportunity", null);
exports.InvestmentsController = InvestmentsController = __decorate([
    (0, common_1.Controller)('investments'),
    __metadata("design:paramtypes", [investments_service_1.InvestmentsService])
], InvestmentsController);
//# sourceMappingURL=investments.controller.js.map