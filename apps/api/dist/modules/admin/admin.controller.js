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
exports.AdminController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const admin_service_1 = require("./admin.service");
const jwt_auth_guard_1 = require("../../common/guards/jwt-auth.guard");
const roles_guard_1 = require("../../common/guards/roles.guard");
const roles_decorator_1 = require("../../common/decorators/roles.decorator");
let AdminController = class AdminController {
    constructor(adminService) {
        this.adminService = adminService;
    }
    async getDashboardStats() {
        return this.adminService.getDashboardStats();
    }
    async getBusinessMetrics(period = 'day') {
        return this.adminService.getBusinessMetrics(period);
    }
    async listUsers(status, tier, kycStatus, page = 1, limit = 50) {
        return this.adminService.listUsers({ status, tier, kycStatus, page, limit });
    }
    async getUserDetails(userId) {
        return this.adminService.getUserDetails(userId);
    }
    async updateUserStatus(userId, body) {
        return this.adminService.updateUserStatus(userId, body.status, body.reason);
    }
    async updateUserTier(userId, body) {
        return this.adminService.updateUserTier(userId, body.tier);
    }
    async getPendingKYC(limit = 100) {
        return this.adminService.getPendingKYCVerifications(limit);
    }
    async getKYCDetails(kycId) {
        return this.adminService.getKYCDetails(kycId);
    }
    async approveKYC(kycId, body) {
        return this.adminService.approveKYC(kycId, body.notes);
    }
    async rejectKYC(kycId, body) {
        return this.adminService.rejectKYC(kycId, body.reason, body.notes);
    }
    async listTransactions(status, type, userId, minAmount, page = 1, limit = 100) {
        return this.adminService.listTransactions({
            status,
            type,
            userId,
            minAmount,
            page,
            limit,
        });
    }
    async getFlaggedTransactions(limit = 100) {
        return this.adminService.getFlaggedTransactions(limit);
    }
    async reviewTransaction(transactionId, body) {
        return this.adminService.reviewTransaction(transactionId, body.action, body.notes);
    }
    async getFraudAlerts(limit = 100) {
        return this.adminService.getFraudAlerts(limit);
    }
    async getAMLAlerts(limit = 100) {
        return this.adminService.getAMLAlerts(limit);
    }
    async getSystemHealth() {
        return this.adminService.getSystemHealth();
    }
    async getSystemLogs(level, limit = 1000) {
        return this.adminService.getSystemLogs(level, limit);
    }
    async getRevenueReport(startDate, endDate) {
        return this.adminService.getRevenueReport(new Date(startDate), new Date(endDate));
    }
    async getTransactionReport(startDate, endDate) {
        return this.adminService.getTransactionReport(new Date(startDate), new Date(endDate));
    }
    async getComplianceReport(startDate, endDate) {
        return this.adminService.getComplianceReport(new Date(startDate), new Date(endDate));
    }
};
exports.AdminController = AdminController;
__decorate([
    (0, common_1.Get)('dashboard/stats'),
    (0, roles_decorator_1.Roles)('admin', 'operator'),
    (0, swagger_1.ApiOperation)({ summary: 'Get dashboard statistics' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Dashboard stats retrieved' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getDashboardStats", null);
__decorate([
    (0, common_1.Get)('dashboard/metrics'),
    (0, roles_decorator_1.Roles)('admin', 'operator'),
    (0, swagger_1.ApiOperation)({ summary: 'Get business metrics' }),
    __param(0, (0, common_1.Query)('period')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getBusinessMetrics", null);
__decorate([
    (0, common_1.Get)('users'),
    (0, roles_decorator_1.Roles)('admin', 'operator'),
    (0, swagger_1.ApiOperation)({ summary: 'List all users with filters' }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('tier')),
    __param(2, (0, common_1.Query)('kycStatus')),
    __param(3, (0, common_1.Query)('page')),
    __param(4, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listUsers", null);
__decorate([
    (0, common_1.Get)('users/:userId'),
    (0, roles_decorator_1.Roles)('admin', 'operator'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user details' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getUserDetails", null);
__decorate([
    (0, common_1.Put)('users/:userId/status'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user status' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUserStatus", null);
__decorate([
    (0, common_1.Put)('users/:userId/tier'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Update user tier' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "updateUserTier", null);
__decorate([
    (0, common_1.Get)('kyc/pending'),
    (0, roles_decorator_1.Roles)('admin', 'compliance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get pending KYC verifications' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getPendingKYC", null);
__decorate([
    (0, common_1.Get)('kyc/:kycId'),
    (0, roles_decorator_1.Roles)('admin', 'compliance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get KYC details' }),
    __param(0, (0, common_1.Param)('kycId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getKYCDetails", null);
__decorate([
    (0, common_1.Post)('kyc/:kycId/approve'),
    (0, roles_decorator_1.Roles)('admin', 'compliance'),
    (0, swagger_1.ApiOperation)({ summary: 'Approve KYC verification' }),
    __param(0, (0, common_1.Param)('kycId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "approveKYC", null);
__decorate([
    (0, common_1.Post)('kyc/:kycId/reject'),
    (0, roles_decorator_1.Roles)('admin', 'compliance'),
    (0, swagger_1.ApiOperation)({ summary: 'Reject KYC verification' }),
    __param(0, (0, common_1.Param)('kycId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "rejectKYC", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, roles_decorator_1.Roles)('admin', 'compliance'),
    (0, swagger_1.ApiOperation)({ summary: 'List transactions with filters' }),
    __param(0, (0, common_1.Query)('status')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('userId')),
    __param(3, (0, common_1.Query)('minAmount')),
    __param(4, (0, common_1.Query)('page')),
    __param(5, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Number, Number, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "listTransactions", null);
__decorate([
    (0, common_1.Get)('transactions/flagged'),
    (0, roles_decorator_1.Roles)('admin', 'compliance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get flagged transactions (fraud/AML)' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getFlaggedTransactions", null);
__decorate([
    (0, common_1.Post)('transactions/:transactionId/review'),
    (0, roles_decorator_1.Roles)('admin', 'compliance'),
    (0, swagger_1.ApiOperation)({ summary: 'Review flagged transaction' }),
    __param(0, (0, common_1.Param)('transactionId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "reviewTransaction", null);
__decorate([
    (0, common_1.Get)('fraud/alerts'),
    (0, roles_decorator_1.Roles)('admin', 'compliance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get fraud alerts' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getFraudAlerts", null);
__decorate([
    (0, common_1.Get)('aml/alerts'),
    (0, roles_decorator_1.Roles)('admin', 'compliance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get AML alerts' }),
    __param(0, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getAMLAlerts", null);
__decorate([
    (0, common_1.Get)('system/health'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system health status' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSystemHealth", null);
__decorate([
    (0, common_1.Get)('system/logs'),
    (0, roles_decorator_1.Roles)('admin'),
    (0, swagger_1.ApiOperation)({ summary: 'Get system logs' }),
    __param(0, (0, common_1.Query)('level')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getSystemLogs", null);
__decorate([
    (0, common_1.Get)('reports/revenue'),
    (0, roles_decorator_1.Roles)('admin', 'finance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get revenue report' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getRevenueReport", null);
__decorate([
    (0, common_1.Get)('reports/transactions'),
    (0, roles_decorator_1.Roles)('admin', 'finance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction report' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getTransactionReport", null);
__decorate([
    (0, common_1.Get)('reports/compliance'),
    (0, roles_decorator_1.Roles)('admin', 'compliance'),
    (0, swagger_1.ApiOperation)({ summary: 'Get compliance report' }),
    __param(0, (0, common_1.Query)('startDate')),
    __param(1, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String]),
    __metadata("design:returntype", Promise)
], AdminController.prototype, "getComplianceReport", null);
exports.AdminController = AdminController = __decorate([
    (0, swagger_1.ApiTags)('admin'),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.Controller)('admin'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard, roles_guard_1.RolesGuard),
    __metadata("design:paramtypes", [admin_service_1.AdminService])
], AdminController);
//# sourceMappingURL=admin.controller.js.map