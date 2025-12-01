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
exports.VirtualAccountsController = void 0;
const common_1 = require("@nestjs/common");
const virtual_accounts_service_1 = require("./virtual-accounts.service");
const swagger_1 = require("@nestjs/swagger");
let VirtualAccountsController = class VirtualAccountsController {
    constructor(virtualAccountsService) {
        this.virtualAccountsService = virtualAccountsService;
    }
    async createVirtualAccount(dto) {
        return this.virtualAccountsService.createVirtualAccount(dto);
    }
    async processPayment(virtualAccountId, dto) {
        return this.virtualAccountsService.processPayment(Object.assign({ virtualAccountId }, dto));
    }
    async handleWebhook(provider, paystackSignature, flutterwaveSignature, payload) {
        const signature = paystackSignature || flutterwaveSignature || '';
        return this.virtualAccountsService.handleWebhook(provider, payload, signature);
    }
    async getVirtualAccount(virtualAccountId) {
        return this.virtualAccountsService.getVirtualAccount(virtualAccountId);
    }
    async getTransactions(virtualAccountId, limit = 50, offset = 0) {
        return this.virtualAccountsService.getVirtualAccountTransactions(virtualAccountId, limit, offset);
    }
    async getUserVirtualAccounts(userId) {
        return this.virtualAccountsService.getUserVirtualAccounts(userId);
    }
    async suspendVirtualAccount(virtualAccountId, dto) {
        return this.virtualAccountsService.suspendVirtualAccount(virtualAccountId, dto.reason);
    }
    async reactivateVirtualAccount(virtualAccountId) {
        return this.virtualAccountsService.reactivateVirtualAccount(virtualAccountId);
    }
};
exports.VirtualAccountsController = VirtualAccountsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a virtual account' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Virtual account created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], VirtualAccountsController.prototype, "createVirtualAccount", null);
__decorate([
    (0, common_1.Post)(':virtualAccountId/payment'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Process a payment to virtual account' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment processed successfully' }),
    __param(0, (0, common_1.Param)('virtualAccountId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VirtualAccountsController.prototype, "processPayment", null);
__decorate([
    (0, common_1.Post)('webhook/:provider'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Handle provider webhook' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Webhook processed' }),
    __param(0, (0, common_1.Param)('provider')),
    __param(1, (0, common_1.Headers)('x-paystack-signature')),
    __param(2, (0, common_1.Headers)('verif-hash')),
    __param(3, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String, Object]),
    __metadata("design:returntype", Promise)
], VirtualAccountsController.prototype, "handleWebhook", null);
__decorate([
    (0, common_1.Get)(':virtualAccountId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get virtual account details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Virtual account found' }),
    __param(0, (0, common_1.Param)('virtualAccountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VirtualAccountsController.prototype, "getVirtualAccount", null);
__decorate([
    (0, common_1.Get)(':virtualAccountId/transactions'),
    (0, swagger_1.ApiOperation)({ summary: 'Get virtual account transactions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transactions retrieved' }),
    __param(0, (0, common_1.Param)('virtualAccountId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], VirtualAccountsController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user virtual accounts' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Virtual accounts retrieved' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VirtualAccountsController.prototype, "getUserVirtualAccounts", null);
__decorate([
    (0, common_1.Post)(':virtualAccountId/suspend'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Suspend a virtual account' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account suspended successfully' }),
    __param(0, (0, common_1.Param)('virtualAccountId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], VirtualAccountsController.prototype, "suspendVirtualAccount", null);
__decorate([
    (0, common_1.Post)(':virtualAccountId/reactivate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Reactivate a virtual account' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Account reactivated successfully' }),
    __param(0, (0, common_1.Param)('virtualAccountId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], VirtualAccountsController.prototype, "reactivateVirtualAccount", null);
exports.VirtualAccountsController = VirtualAccountsController = __decorate([
    (0, swagger_1.ApiTags)('Virtual Accounts'),
    (0, common_1.Controller)('virtual-accounts'),
    __metadata("design:paramtypes", [virtual_accounts_service_1.VirtualAccountsService])
], VirtualAccountsController);
//# sourceMappingURL=virtual-accounts.controller.js.map