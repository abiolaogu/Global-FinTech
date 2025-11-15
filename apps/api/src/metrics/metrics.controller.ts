import { Controller, Get, Header } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiExcludeEndpoint } from '@nestjs/swagger';
import { register, Counter, Histogram, Gauge } from 'prom-client';

@ApiTags('metrics')
@Controller('metrics')
export class MetricsController {
  @Get()
  @Header('Content-Type', register.contentType)
  @ApiExcludeEndpoint()
  @ApiOperation({ summary: 'Prometheus metrics endpoint' })
  async getMetrics() {
    return await register.metrics();
  }
}

// Application metrics
export const httpRequestsTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total number of HTTP requests',
  labelNames: ['method', 'route', 'status'],
});

export const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests in seconds',
  labelNames: ['method', 'route', 'status'],
  buckets: [0.001, 0.005, 0.01, 0.05, 0.1, 0.5, 1, 5, 10],
});

// Business metrics
export const transactionsTotal = new Counter({
  name: 'transactions_total',
  help: 'Total number of financial transactions',
  labelNames: ['type', 'status', 'currency'],
});

export const transactionAmount = new Histogram({
  name: 'transaction_amount',
  help: 'Transaction amounts',
  labelNames: ['type', 'currency'],
  buckets: [10, 50, 100, 500, 1000, 5000, 10000, 50000, 100000],
});

export const activeUsers = new Gauge({
  name: 'active_users_total',
  help: 'Number of active users',
  labelNames: ['tier'],
});

export const walletBalance = new Gauge({
  name: 'wallet_balance_total',
  help: 'Total wallet balance',
  labelNames: ['currency'],
});

export const kycPendingVerifications = new Gauge({
  name: 'kyc_pending_verifications',
  help: 'Number of pending KYC verifications',
});

export const cardTransactions = new Counter({
  name: 'card_transactions_total',
  help: 'Total number of card transactions',
  labelNames: ['status', 'merchant_category'],
});

export const tradeOrders = new Counter({
  name: 'trade_orders_total',
  help: 'Total number of trade orders',
  labelNames: ['asset_type', 'side', 'status'],
});

export const rewardPointsIssued = new Counter({
  name: 'reward_points_issued_total',
  help: 'Total reward points issued',
  labelNames: ['event_type'],
});
