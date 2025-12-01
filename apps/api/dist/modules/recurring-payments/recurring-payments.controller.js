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
exports.RecurringPaymentsController = void 0;
const common_1 = require("@nestjs/common");
const recurring_payments_service_1 = require("./recurring-payments.service");
const swagger_1 = require("@nestjs/swagger");
let RecurringPaymentsController = class RecurringPaymentsController {
    constructor(recurringPaymentsService) {
        this.recurringPaymentsService = recurringPaymentsService;
    }
    async createRecurringPayment(dto) {
        return this.recurringPaymentsService.createRecurringPayment(dto);
    }
    async getRecurringPayment(recurringPaymentId) {
        return this.recurringPaymentsService.getRecurringPayment(recurringPaymentId);
    }
    async getUserRecurringPayments(userId) {
        return this.recurringPaymentsService.getUserRecurringPayments(userId);
    }
    async getMerchantRecurringPayments(merchantId) {
        return this.recurringPaymentsService.getMerchantRecurringPayments(merchantId);
    }
    async pauseRecurringPayment(recurringPaymentId) {
        return this.recurringPaymentsService.pauseRecurringPayment(recurringPaymentId);
    }
    async resumeRecurringPayment(recurringPaymentId) {
        return this.recurringPaymentsService.resumeRecurringPayment(recurringPaymentId);
    }
    async cancelRecurringPayment(recurringPaymentId, dto) {
        return this.recurringPaymentsService.cancelRecurringPayment(recurringPaymentId, dto.reason);
    }
};
exports.RecurringPaymentsController = RecurringPaymentsController;
__decorate([
    (0, common_1.Post)(),
    (0, swagger_1.ApiOperation)({ summary: 'Create a recurring payment' }),
    (0, swagger_1.ApiResponse)({ status: 201, description: 'Recurring payment created successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RecurringPaymentsController.prototype, "createRecurringPayment", null);
__decorate([
    (0, common_1.Get)(':recurringPaymentId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get recurring payment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Recurring payment found' }),
    __param(0, (0, common_1.Param)('recurringPaymentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecurringPaymentsController.prototype, "getRecurringPayment", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user recurring payments' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Recurring payments retrieved' }),
    __param(0, (0, common_1.Param)('userId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecurringPaymentsController.prototype, "getUserRecurringPayments", null);
__decorate([
    (0, common_1.Get)('merchant/:merchantId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get merchant recurring payments' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Recurring payments retrieved' }),
    __param(0, (0, common_1.Param)('merchantId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecurringPaymentsController.prototype, "getMerchantRecurringPayments", null);
__decorate([
    (0, common_1.Post)(':recurringPaymentId/pause'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Pause recurring payment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Recurring payment paused' }),
    __param(0, (0, common_1.Param)('recurringPaymentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecurringPaymentsController.prototype, "pauseRecurringPayment", null);
__decorate([
    (0, common_1.Post)(':recurringPaymentId/resume'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Resume recurring payment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Recurring payment resumed' }),
    __param(0, (0, common_1.Param)('recurringPaymentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RecurringPaymentsController.prototype, "resumeRecurringPayment", null);
__decorate([
    (0, common_1.Post)(':recurringPaymentId/cancel'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Cancel recurring payment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Recurring payment cancelled' }),
    __param(0, (0, common_1.Param)('recurringPaymentId')),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], RecurringPaymentsController.prototype, "cancelRecurringPayment", null);
exports.RecurringPaymentsController = RecurringPaymentsController = __decorate([
    (0, swagger_1.ApiTags)('Recurring Payments'),
    (0, common_1.Controller)('recurring-payments'),
    __metadata("design:paramtypes", [recurring_payments_service_1.RecurringPaymentsService])
], RecurringPaymentsController);
//# sourceMappingURL=recurring-payments.controller.js.map