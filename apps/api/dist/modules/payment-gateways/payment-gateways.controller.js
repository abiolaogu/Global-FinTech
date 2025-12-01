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
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGatewaysController = void 0;
const common_1 = require("@nestjs/common");
const payment_gateways_service_1 = require("./payment-gateways.service");
const swagger_1 = require("@nestjs/swagger");
let PaymentGatewaysController = class PaymentGatewaysController {
    constructor(paymentGatewaysService) {
        this.paymentGatewaysService = paymentGatewaysService;
    }
    async initiatePayment(dto) {
        const { provider } = dto, paymentDto = __rest(dto, ["provider"]);
        return this.paymentGatewaysService.initiatePayment(paymentDto, provider);
    }
    async verifyPayment(dto) {
        return this.paymentGatewaysService.verifyPayment(dto);
    }
    async getTransaction(transactionId) {
        return this.paymentGatewaysService.getTransaction(transactionId);
    }
    async getUserTransactions(userId, limit = 50, offset = 0) {
        return this.paymentGatewaysService.getUserTransactions(userId, limit, offset);
    }
};
exports.PaymentGatewaysController = PaymentGatewaysController;
__decorate([
    (0, common_1.Post)('payments/initiate'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Initiate a payment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment initiated successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentGatewaysController.prototype, "initiatePayment", null);
__decorate([
    (0, common_1.Post)('payments/verify'),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Verify a payment' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Payment verified successfully' }),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], PaymentGatewaysController.prototype, "verifyPayment", null);
__decorate([
    (0, common_1.Get)('payments/:transactionId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get payment transaction' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction found' }),
    __param(0, (0, common_1.Param)('transactionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], PaymentGatewaysController.prototype, "getTransaction", null);
__decorate([
    (0, common_1.Get)('payments/user/:userId'),
    (0, swagger_1.ApiOperation)({ summary: 'Get user payment transactions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transactions retrieved' }),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('limit')),
    __param(2, (0, common_1.Query)('offset')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], PaymentGatewaysController.prototype, "getUserTransactions", null);
exports.PaymentGatewaysController = PaymentGatewaysController = __decorate([
    (0, swagger_1.ApiTags)('Payment Gateways'),
    (0, common_1.Controller)('payment-gateways'),
    __metadata("design:paramtypes", [payment_gateways_service_1.PaymentGatewaysService])
], PaymentGatewaysController);
//# sourceMappingURL=payment-gateways.controller.js.map