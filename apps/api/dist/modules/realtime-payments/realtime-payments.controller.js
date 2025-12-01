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
exports.RealtimePaymentsController = void 0;
const common_1 = require("@nestjs/common");
const realtime_payments_service_1 = require("./realtime-payments.service");
let RealtimePaymentsController = class RealtimePaymentsController {
    constructor(realtimePaymentsService) {
        this.realtimePaymentsService = realtimePaymentsService;
    }
    async registerConnection(dto) {
        return this.realtimePaymentsService.registerRailConnection(dto);
    }
    async testConnection(connectionId) {
        const isHealthy = await this.realtimePaymentsService.testConnection(connectionId);
        return {
            connectionId,
            healthy: isHealthy,
            message: isHealthy ? 'Connection is healthy' : 'Connection test failed',
        };
    }
    async initiatePayment(dto) {
        return this.realtimePaymentsService.initiatePayment(dto);
    }
    async getPayment(paymentId) {
        return this.realtimePaymentsService.getPayment(paymentId);
    }
    async getUserPayments(userId, type, limit) {
        return this.realtimePaymentsService.getUserPayments(userId, type || 'all', limit ? parseInt(limit, 10) : 50);
    }
    async getStats(railType, startDate, endDate) {
        return this.realtimePaymentsService.getPaymentStats(railType, startDate ? new Date(startDate) : undefined, endDate ? new Date(endDate) : undefined);
    }
};
exports.RealtimePaymentsController = RealtimePaymentsController;
__decorate([
    (0, common_1.Post)('connections'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RealtimePaymentsController.prototype, "registerConnection", null);
__decorate([
    (0, common_1.Post)('connections/:connectionId/test'),
    __param(0, (0, common_1.Param)('connectionId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RealtimePaymentsController.prototype, "testConnection", null);
__decorate([
    (0, common_1.Post)('pay'),
    (0, common_1.HttpCode)(common_1.HttpStatus.CREATED),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], RealtimePaymentsController.prototype, "initiatePayment", null);
__decorate([
    (0, common_1.Get)(':paymentId'),
    __param(0, (0, common_1.Param)('paymentId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], RealtimePaymentsController.prototype, "getPayment", null);
__decorate([
    (0, common_1.Get)('user/:userId'),
    __param(0, (0, common_1.Param)('userId')),
    __param(1, (0, common_1.Query)('type')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], RealtimePaymentsController.prototype, "getUserPayments", null);
__decorate([
    (0, common_1.Get)('stats/summary'),
    __param(0, (0, common_1.Query)('railType')),
    __param(1, (0, common_1.Query)('startDate')),
    __param(2, (0, common_1.Query)('endDate')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, String]),
    __metadata("design:returntype", Promise)
], RealtimePaymentsController.prototype, "getStats", null);
exports.RealtimePaymentsController = RealtimePaymentsController = __decorate([
    (0, common_1.Controller)('realtime-payments'),
    __metadata("design:paramtypes", [realtime_payments_service_1.RealtimePaymentsService])
], RealtimePaymentsController);
//# sourceMappingURL=realtime-payments.controller.js.map