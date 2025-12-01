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
exports.SplitPaymentsController = void 0;
const common_1 = require("@nestjs/common");
const split_payments_service_1 = require("./split-payments.service");
const swagger_1 = require("@nestjs/swagger");
let SplitPaymentsController = class SplitPaymentsController {
    constructor(splitPaymentsService) {
        this.splitPaymentsService = splitPaymentsService;
    }
    async processSplitPayment(dto) {
        return this.splitPaymentsService.processSplitPayment(dto);
    }
    async createConfiguration(dto) {
        return this.splitPaymentsService.createConfiguration(dto);
    }
    async applySplitConfiguration(configurationId, dto) {
        return this.splitPaymentsService.applySplitConfiguration(configurationId, dto.paymentId, dto.userId, dto.totalAmount, dto.currency);
    }
    async getSplitPayment(splitPaymentId) {
        return this.splitPaymentsService.getSplitPayment(splitPaymentId);
    }
    async getPaymentSplits(paymentId) {
        return this.splitPaymentsService.getPaymentSplits(paymentId);
    }
    async getUserConfigurations(userId) {
        return this.splitPaymentsService.getUserConfigurations(userId);
    }
};
exports.SplitPaymentsController = SplitPaymentsController;
__decorate([
    (0, common_1.Post)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Process a split payment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Split payment processed successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SplitPaymentsController.prototype, "processSplitPayment", null);
__decorate([
    (0, common_1.Post)('configurations'),
    (0, swagger_1.ApiOperation)({ summary: 'Create a split configuration' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Configuration created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], SplitPaymentsController.prototype, "createConfiguration", null);
__decorate([
    (0, common_1.Post)('configurations/:configurationId/apply'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Apply a split configuration to a payment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configuration applied successfully' }),
    __param(0, (0, common_1.Param)('configurationId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], SplitPaymentsController.prototype, "applySplitConfiguration", null);
__decorate([
    (0, common_1.Get)(':splitPaymentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get split payment details' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Split payment found' }),
    __param(0, (0, common_1.Param)('splitPaymentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SplitPaymentsController.prototype, "getSplitPayment", null);
__decorate([
    (0, common_1.Get)('payment/:paymentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get splits for a payment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment splits retrieved' }),
    __param(0, (0, common_1.Param)('paymentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SplitPaymentsController.prototype, "getPaymentSplits", null);
__decorate([
    (0, common_1.Get)('user/:userId/configurations'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user split configurations' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Configurations retrieved' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], SplitPaymentsController.prototype, "getUserConfigurations", null);
exports.SplitPaymentsController = SplitPaymentsController = __decorate([
    (0, swagger_1.ApiTags)('Split Payments'),
    (0, common_1.Controller)('split-payments'),
    __metadata("design:paramtypes", [split_payments_service_1.SplitPaymentsService])
], SplitPaymentsController);
//# sourceMappingURL=split-payments.controller.js.map