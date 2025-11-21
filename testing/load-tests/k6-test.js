import http from 'k6/http';
import { check, sleep } from 'k6';
import { Rate } from 'k6/metrics';

// Custom metrics
const errorRate = new Rate('errors');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 50 },   // Ramp up to 50 users
    { duration: '3m', target: 50 },   // Stay at 50 users
    { duration: '1m', target: 100 },  // Ramp up to 100 users
    { duration: '3m', target: 100 },  // Stay at 100 users
    { duration: '1m', target: 200 },  // Spike to 200 users
    { duration: '2m', target: 200 },  // Stay at 200 users
    { duration: '1m', target: 0 },    // Ramp down to 0 users
  ],
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'], // 95% < 500ms, 99% < 1000ms
    http_req_failed: ['rate<0.01'],                  // Error rate < 1%
    errors: ['rate<0.01'],                           // Custom error rate < 1%
  },
};

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
const API_VERSION = 'v1';

// Helper function to generate random string
function randomString(length = 10) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// Helper function to generate random number
function randomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export default function () {
  const scenario = Math.random();

  if (scenario < 0.4) {
    // Scenario 1: Wallet Operations (40%)
    testWalletOperations();
  } else if (scenario < 0.7) {
    // Scenario 2: Payment Initiation (30%)
    testPaymentInitiation();
  } else if (scenario < 0.9) {
    // Scenario 3: Virtual Account (20%)
    testVirtualAccount();
  } else {
    // Scenario 4: Payment Link (10%)
    testPaymentLink();
  }

  sleep(1);
}

function testWalletOperations() {
  const userId = `user-${randomString()}`;

  // Create wallet
  let res = http.post(
    `${BASE_URL}/api/${API_VERSION}/wallets`,
    JSON.stringify({
      userId: userId,
      currency: 'USD',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  const createSuccess = check(res, {
    'wallet created': (r) => r.status === 201,
    'has walletId': (r) => r.json('walletId') !== undefined,
  });

  errorRate.add(!createSuccess);

  if (!createSuccess) return;

  const walletId = res.json('walletId');

  sleep(0.5);

  // Get wallet
  res = http.get(`${BASE_URL}/api/${API_VERSION}/wallets/${walletId}`);

  const getSuccess = check(res, {
    'wallet retrieved': (r) => r.status === 200,
  });

  errorRate.add(!getSuccess);

  sleep(0.5);

  // Get balance
  res = http.get(`${BASE_URL}/api/${API_VERSION}/wallets/${walletId}/balance`);

  const balanceSuccess = check(res, {
    'balance retrieved': (r) => r.status === 200,
    'has balance': (r) => r.json('balance') !== undefined,
  });

  errorRate.add(!balanceSuccess);
}

function testPaymentInitiation() {
  const userId = `user-${randomString()}`;
  const amount = randomNumber(100, 10000);

  // Initiate payment
  let res = http.post(
    `${BASE_URL}/api/${API_VERSION}/payment-gateways/payments/initiate`,
    JSON.stringify({
      userId: userId,
      merchantId: 'merchant-123',
      amount: amount.toString(),
      currency: 'NGN',
      provider: 'paystack',
      customer: {
        email: `test${randomNumber(1, 100000)}@example.com`,
        name: 'Test User',
      },
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  const initiateSuccess = check(res, {
    'payment initiated': (r) => r.status === 200,
    'has reference': (r) => r.json('reference') !== undefined,
  });

  errorRate.add(!initiateSuccess);

  if (!initiateSuccess) return;

  const reference = res.json('reference');

  sleep(1);

  // Verify payment
  res = http.post(
    `${BASE_URL}/api/${API_VERSION}/payment-gateways/payments/verify`,
    JSON.stringify({
      reference: reference,
      provider: 'paystack',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  const verifySuccess = check(res, {
    'payment verified': (r) => r.status === 200,
  });

  errorRate.add(!verifySuccess);
}

function testVirtualAccount() {
  const userId = `user-${randomString()}`;

  // Create virtual account
  let res = http.post(
    `${BASE_URL}/api/${API_VERSION}/virtual-accounts`,
    JSON.stringify({
      userId: userId,
      currency: 'NGN',
      country: 'NG',
      provider: 'paystack',
      accountName: `Test User ${randomString()}`,
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  const createSuccess = check(res, {
    'virtual account created': (r) => r.status === 201,
    'has virtualAccountId': (r) => r.json('virtualAccountId') !== undefined,
  });

  errorRate.add(!createSuccess);

  if (!createSuccess) return;

  const virtualAccountId = res.json('virtualAccountId');

  sleep(0.5);

  // Get virtual account
  res = http.get(`${BASE_URL}/api/${API_VERSION}/virtual-accounts/${virtualAccountId}`);

  const getSuccess = check(res, {
    'virtual account retrieved': (r) => r.status === 200,
  });

  errorRate.add(!getSuccess);
}

function testPaymentLink() {
  const userId = `user-${randomString()}`;
  const amount = randomNumber(1000, 50000);

  // Create payment link
  let res = http.post(
    `${BASE_URL}/api/${API_VERSION}/payment-links`,
    JSON.stringify({
      userId: userId,
      title: 'Test Payment Link',
      amountType: 'fixed',
      amount: amount.toString(),
      currency: 'NGN',
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  const createSuccess = check(res, {
    'payment link created': (r) => r.status === 201,
    'has linkId': (r) => r.json('linkId') !== undefined,
    'has code': (r) => r.json('code') !== undefined,
  });

  errorRate.add(!createSuccess);

  if (!createSuccess) return;

  const code = res.json('code');

  sleep(0.5);

  // Get payment link by code
  res = http.get(`${BASE_URL}/api/${API_VERSION}/payment-links/code/${code}`);

  const getSuccess = check(res, {
    'payment link retrieved': (r) => r.status === 200,
  });

  errorRate.add(!getSuccess);
}

// Summary handler
export function handleSummary(data) {
  return {
    'stdout': textSummary(data, { indent: ' ', enableColors: true }),
    'summary.json': JSON.stringify(data),
  };
}

// Text summary helper
function textSummary(data, options) {
  const { indent = '', enableColors = false } = options || {};
  const { metrics, root_group } = data;

  let output = '';

  output += `${indent}✓ checks.........................: ${(metrics.checks.values.passes / metrics.checks.values.count * 100).toFixed(2)}% ✓ ${metrics.checks.values.passes} ✗ ${metrics.checks.values.fails}\n`;
  output += `${indent}  data_received..................: ${(metrics.data_received.values.count / 1024 / 1024).toFixed(2)} MB\n`;
  output += `${indent}  data_sent......................: ${(metrics.data_sent.values.count / 1024 / 1024).toFixed(2)} MB\n`;
  output += `${indent}  http_req_duration..............: avg=${metrics.http_req_duration.values.avg.toFixed(2)}ms min=${metrics.http_req_duration.values.min.toFixed(2)}ms med=${metrics.http_req_duration.values.med.toFixed(2)}ms max=${metrics.http_req_duration.values.max.toFixed(2)}ms p(90)=${metrics.http_req_duration.values['p(90)'].toFixed(2)}ms p(95)=${metrics.http_req_duration.values['p(95)'].toFixed(2)}ms\n`;
  output += `${indent}  http_req_failed................: ${(metrics.http_req_failed.values.passes / (metrics.http_req_failed.values.passes + metrics.http_req_failed.values.fails) * 100).toFixed(2)}%\n`;
  output += `${indent}  http_reqs......................: ${metrics.http_reqs.values.count} ${(metrics.http_reqs.values.rate).toFixed(2)}/s\n`;
  output += `${indent}  iteration_duration.............: avg=${metrics.iteration_duration.values.avg.toFixed(2)}ms\n`;
  output += `${indent}  iterations.....................: ${metrics.iterations.values.count}\n`;
  output += `${indent}  vus............................: ${metrics.vus.values.value} min=${metrics.vus.values.min} max=${metrics.vus.values.max}\n`;

  return output;
}
