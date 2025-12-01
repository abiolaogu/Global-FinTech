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
exports.PaymentLinksController = void 0;
const common_1 = require("@nestjs/common");
const payment_links_service_1 = require("./payment-links.service");
const swagger_1 = require("@nestjs/swagger");
let PaymentLinksController = class PaymentLinksController {
    constructor(paymentLinksService) {
        this.paymentLinksService = paymentLinksService;
    }
    async createPaymentLink(dto) {
        return this.paymentLinksService.createPaymentLink(dto);
    }
    async getPaymentLinkByCode(code) {
        return this.paymentLinksService.getPaymentLinkByCode(code);
    }
    async getPaymentLink(linkId) {
        return this.paymentLinksService.getPaymentLink(linkId);
    }
    async getUserPaymentLinks(userId) {
        return this.paymentLinksService.getUserPaymentLinks(userId);
    }
    async updatePaymentLink(linkId, updates) {
        return this.paymentLinksService.updatePaymentLink(linkId, updates);
    }
    async deactivatePaymentLink(linkId) {
        return this.paymentLinksService.deactivatePaymentLink(linkId);
    }
    async activatePaymentLink(linkId) {
        return this.paymentLinksService.activatePaymentLink(linkId);
    }
    async recordPayment(linkId, dto) {
        return this.paymentLinksService.recordPayment(linkId, dto.amount);
    }
};
exports.PaymentLinksController = PaymentLinksController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a payment link' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Payment link created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentLinksController.prototype, "createPaymentLink", null);
__decorate([
    (0, common_1.Get)('code/:code'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment link by code' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment link found' }),
    __param(0, (0, common_1.Param)('code')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentLinksController.prototype, "getPaymentLinkByCode", null);
__decorate([
    (0, common_1.Get)(':linkId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment link by ID' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment link found' }),
    __param(0, (0, common_1.Param)('linkId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentLinksController.prototype, "getPaymentLink", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user payment links' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment links retrieved' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentLinksController.prototype, "getUserPaymentLinks", null);
__decorate([
    (0, common_1.Put)(':linkId'),
    (0, swagger_1.ApiOperation)({ summary: 'Update payment link' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment link updated successfully' }),
    __param(0, (0, common_1.Param)('linkId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentLinksController.prototype, "updatePaymentLink", null);
__decorate([
    (0, common_1.Post)(':linkId/deactivate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Deactivate payment link' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment link deactivated' }),
    __param(0, (0, common_1.Param)('linkId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentLinksController.prototype, "deactivatePaymentLink", null);
__decorate([
    (0, common_1.Post)(':linkId/activate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Activate payment link' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment link activated' }),
    __param(0, (0, common_1.Param)('linkId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentLinksController.prototype, "activatePaymentLink", null);
__decorate([
    (0, common_1.Post)(':linkId/payment'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Record a payment for link' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment recorded' }),
    __param(0, (0, common_1.Param)('linkId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], PaymentLinksController.prototype, "recordPayment", null);
exports.PaymentLinksController = PaymentLinksController = __decorate([
    (0, swagger_1.ApiTags)('Payment Links'),
    (0, common_1.Controller)('payment-links'),
    __metadata("design:paramtypes", [payment_links_service_1.PaymentLinksService])
], PaymentLinksController);
//# sourceMappingURL=payment-links.controller.js.map