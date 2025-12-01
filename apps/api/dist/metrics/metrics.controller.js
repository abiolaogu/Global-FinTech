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
exports.rewardPointsIssued = exports.tradeOrders = exports.cardTransactions = exports.kycPendingVerifications = exports.walletBalance = exports.activeUsers = exports.transactionAmount = exports.transactionsTotal = exports.httpRequestDuration = exports.httpRequestsTotal = exports.MetricsController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const prom_client_1 = require("prom-client");
let MetricsController = class MetricsController {
    async getMetrics() {
        return await prom_client_1.register.metrics();
    }
};
exports.MetricsController = MetricsController;
__decorate([
    (0, common_1.Get)(),
    (0, common_1.Header)('Content-Type', prom_client_1.register.contentType),
    (0, swagger_1.ApiExcludeEndpoint)(),
    (0, swagger_1.ApiOperation)({ summary: 'Prometheus metrics endpoint' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MetricsController.prototype, "getMetrics", null);
exports.MetricsController = MetricsController = __decorate([
    (0, swagger_1.ApiTags)('metrics'),
    (0, common_1.Controller)('metrics')
], MetricsController);
exports.httpRequestsTotal = new prom_client_1.Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests',
    labelNames: ['method', 'route', 'status'],
});
exports.httpRequestDuration = new prom_client_1.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status'],
    buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5, 10],
});
exports.transactionsTotal = new prom_client_1.Counter({
    name: 'transactions_total',
    help: 'Total number of financial transactions',
    labelNames: ['type', 'status', 'currency'],
});
exports.transactionAmount = new prom_client_1.Histogram({
    name: 'transaction_amount',
    help: 'Transaction amounts',
    labelNames: ['type', 'currency'],
    buckets: [10, 50, 100, 500, 1000, 5000, 10000, 50000, 100000],
});
exports.activeUsers = new prom_client_1.Gauge({
    name: 'active_users_total',
    help: 'Number of active users',
    labelNames: ['tier'],
});
exports.walletBalance = new prom_client_1.Gauge({
    name: 'wallet_balance_total',
    help: 'Total wallet balance',
    labelNames: ['currency'],
});
exports.kycPendingVerifications = new prom_client_1.Gauge({
    name: 'kyc_pending_verifications',
    help: 'Number of pending KYC verifications',
});
exports.cardTransactions = new prom_client_1.Counter({
    name: 'card_transactions_total',
    help: 'Total number of card transactions',
    labelNames: ['status', 'merchant_category'],
});
exports.tradeOrders = new prom_client_1.Counter({
    name: 'trade_orders_total',
    help: 'Total number of trade orders',
    labelNames: ['asset_type', 'side', 'status'],
});
exports.rewardPointsIssued = new prom_client_1.Counter({
    name: 'reward_points_issued_total',
    help: 'Total reward points issued',
    labelNames: ['event_type'],
});
//# sourceMappingURL=metrics.controller.js.map