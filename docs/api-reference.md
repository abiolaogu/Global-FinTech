# API Reference -- Global FinTech Platform

## 1. Overview

The Global FinTech API is a RESTful service built with NestJS (TypeScript). All endpoints are versioned under `/api/v1/` and require authentication unless otherwise noted. The API follows OpenAPI 3.1 conventions and is available at `/api/docs` when the server is running.

Base URL (production): `https://api.global-fintech.example.com/api/v1`
Base URL (development): `http://localhost:3000/api/v1`

---

## 2. Authentication

### 2.1 JWT Bearer Token

All authenticated endpoints require a Bearer token in the Authorization header:

```
Authorization: Bearer <access_token>
```

### 2.2 Token Lifecycle

| Token Type | TTL | Refresh |
|-----------|-----|---------|
| Access Token | 15 minutes | Via refresh endpoint |
| Refresh Token | 7 days | Re-authentication required |

### 2.3 Rate Limiting

Default rate limits per endpoint:
- Standard endpoints: 100 requests per 15 minutes
- Payment endpoints: 10 requests per minute
- Authentication: 5 requests per minute

Rate limit headers returned:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1708214400
```

---

## 3. Health and Platform Endpoints

### GET /health

Returns overall API health status. No authentication required.

**Response 200:**
```json
{
  "status": "ok",
  "uptime": 86400,
  "timestamp": "2026-02-17T12:00:00Z"
}
```

### GET /health/ready

Readiness probe for Kubernetes. Checks database and Redis connectivity.

### GET /health/live

Liveness probe for Kubernetes. Returns 200 if the process is alive.

### GET /metrics

Prometheus-compatible metrics endpoint. Returns text/plain.

---

## 4. Wallets API

### POST /wallets

Create a new wallet for a user.

**Request Body:**
```json
{
  "userId": "usr_abc123",
  "currency": "USD",
  "label": "Main USD Wallet"
}
```

**Response 201:**
```json
{
  "walletId": "wal_def456",
  "userId": "usr_abc123",
  "currency": "USD",
  "balance": "0.00",
  "availableBalance": "0.00",
  "pendingBalance": "0.00",
  "heldBalance": "0.00",
  "status": "active",
  "createdAt": "2026-02-17T12:00:00Z"
}
```

### GET /wallets/:walletId

Retrieve wallet details by ID.

### GET /wallets/:walletId/balance

Get current wallet balance breakdown.

**Response 200:**
```json
{
  "walletId": "wal_def456",
  "currency": "USD",
  "balance": "10000.00",
  "availableBalance": "9500.00",
  "pendingBalance": "300.00",
  "heldBalance": "200.00"
}
```

### GET /wallets/:walletId/transactions

List wallet transactions with pagination.

**Query Parameters:**
- `page` (default: 1)
- `limit` (default: 20, max: 100)
- `type` (optional): credit, debit, transfer
- `status` (optional): completed, pending, failed
- `startDate` (optional): ISO 8601
- `endDate` (optional): ISO 8601

### POST /wallets/:walletId/credit

Credit funds to a wallet.

**Request Body:**
```json
{
  "amount": "1000.00",
  "category": "deposit",
  "description": "Bank transfer deposit",
  "referenceId": "ref_xyz789"
}
```

### POST /wallets/:walletId/debit

Debit funds from a wallet. Enforces available balance check.

### POST /wallets/transfer

Transfer funds between wallets.

**Request Body:**
```json
{
  "fromWalletId": "wal_source",
  "toWalletId": "wal_target",
  "amount": "500.00",
  "description": "P2P transfer",
  "referenceId": "ref_transfer001"
}
```

### POST /wallets/:walletId/hold

Create a hold (authorization) on wallet funds.

**Request Body:**
```json
{
  "amount": "200.00",
  "description": "Card authorization",
  "expiresAt": "2026-02-18T12:00:00Z"
}
```

### POST /wallets/holds/:holdId/release

Release a previously created hold.

### POST /wallets/holds/:holdId/capture

Capture (settle) a previously created hold.

---

## 5. Split Payments API

### POST /split-payments

Process a split payment across multiple recipients.

**Request Body:**
```json
{
  "sourceWalletId": "wal_source",
  "totalAmount": "1000.00",
  "currency": "USD",
  "splits": [
    {
      "walletId": "wal_merchant",
      "type": "percentage",
      "value": 70
    },
    {
      "walletId": "wal_platform",
      "type": "percentage",
      "value": 30
    }
  ]
}
```

### POST /split-payments/configurations

Create a reusable split configuration.

### POST /split-payments/configurations/:id/apply

Apply a saved configuration to a payment.

### GET /split-payments/:id

Get split payment details.

### GET /split-payments/payment/:id

Get all splits for a specific payment.

---

## 6. Payment Gateways API

### POST /payment-gateways/payments/initiate

Initiate a payment through a specific provider.

**Request Body:**
```json
{
  "userId": "usr_abc123",
  "amount": "5000.00",
  "currency": "NGN",
  "provider": "paystack",
  "email": "user@example.com",
  "callbackUrl": "https://app.example.com/payment/callback",
  "metadata": {
    "orderId": "ord_123"
  }
}
```

**Response 200:**
```json
{
  "transactionId": "txn_gw_001",
  "provider": "paystack",
  "authorizationUrl": "https://checkout.paystack.com/abc123",
  "reference": "ref_ps_001",
  "status": "pending"
}
```

### POST /payment-gateways/payments/verify

Verify a payment after provider redirect.

**Request Body:**
```json
{
  "transactionId": "txn_gw_001",
  "provider": "paystack",
  "reference": "ref_ps_001"
}
```

### GET /payment-gateways/payments/:id

Get payment transaction details.

---

## 7. Virtual Accounts API

### POST /virtual-accounts

Create a virtual bank account for receiving payments.

**Request Body:**
```json
{
  "userId": "usr_abc123",
  "provider": "paystack",
  "currency": "NGN",
  "accountType": "dedicated",
  "customerName": "John Doe",
  "customerEmail": "john@example.com"
}
```

### GET /virtual-accounts/:id

Get virtual account details including account number and bank name.

### GET /virtual-accounts/:id/transactions

List all inbound transactions for a virtual account.

### POST /virtual-accounts/webhook/:provider

Webhook endpoint for payment providers. Verifies signature and auto-credits user wallet.

---

## 8. Payment Links API

### POST /payment-links

Create a shareable payment link.

**Request Body:**
```json
{
  "userId": "usr_abc123",
  "title": "Invoice #1234",
  "description": "Payment for consulting services",
  "amountType": "fixed",
  "amount": "25000.00",
  "currency": "NGN",
  "expiresAt": "2026-03-17T00:00:00Z",
  "customFields": [
    {
      "name": "Company Name",
      "type": "text",
      "required": true
    }
  ]
}
```

### GET /payment-links/code/:code

Retrieve a payment link by its short code.

### GET /payment-links/:id

Get payment link by ID.

### PUT /payment-links/:id

Update payment link properties.

### POST /payment-links/:id/activate

Activate a draft payment link.

### POST /payment-links/:id/deactivate

Deactivate an active payment link.

---

## 9. Recurring Payments API

### POST /recurring-payments

Create a recurring payment subscription.

**Request Body:**
```json
{
  "userId": "usr_abc123",
  "walletId": "wal_def456",
  "amount": "9.99",
  "currency": "USD",
  "frequency": "monthly",
  "description": "Premium subscription",
  "startDate": "2026-03-01T00:00:00Z",
  "paymentMethodToken": "tok_card_001"
}
```

### GET /recurring-payments/:id

Get subscription details.

### POST /recurring-payments/:id/pause

Pause a recurring payment.

### POST /recurring-payments/:id/resume

Resume a paused recurring payment.

### POST /recurring-payments/:id/cancel

Cancel a recurring payment permanently.

---

## 10. RegAI API

Base URL: `http://regai:8000`

### GET /v1/healthz

Health check for RegAI service.

### POST /v1/decision

Request a regulatory policy decision.

**Request Body:**
```json
{
  "actor": {
    "id": "usr_abc123",
    "residency_country": "NG",
    "kyc_level": "tier_2",
    "risk_score": 25.0,
    "pep_flag": false
  },
  "action": {
    "type": "PAYOUT",
    "amount": 5000.00,
    "currency": "USD"
  },
  "context": {
    "jurisdiction_pack": "africa/NG-CBN",
    "cross_border": true
  }
}
```

**Response 200:**
```json
{
  "result": "ALLOW",
  "reasons": [],
  "obligations": ["CTR_FILING"],
  "policy_version": "1.0.0",
  "fingerprint": "a1b2c3d4..."
}
```

### POST /v1/screen/sanctions

Screen a subject against sanctions lists.

### POST /v1/case

Open a compliance case.

### POST /v1/report/sar

Generate a SAR/STR draft narrative.

---

## 11. Error Handling

### Standard Error Response

```json
{
  "statusCode": 400,
  "message": "Insufficient funds",
  "error": "Bad Request",
  "code": "INSUFFICIENT_FUNDS",
  "timestamp": "2026-02-17T12:00:00Z"
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| INSUFFICIENT_FUNDS | 400 | Wallet balance too low |
| WALLET_FROZEN | 403 | Wallet is frozen |
| CURRENCY_MISMATCH | 400 | Currency mismatch in transfer |
| PAYMENT_FAILED | 502 | Payment gateway processing failed |
| GATEWAY_ERROR | 502 | Payment gateway unavailable |
| INVALID_AMOUNT | 400 | Amount is invalid or out of range |
| HOLD_EXPIRED | 410 | Authorization hold has expired |
| RATE_LIMIT_EXCEEDED | 429 | Too many requests |
| UNAUTHORIZED | 401 | Invalid or expired token |
| FORBIDDEN | 403 | Insufficient permissions |

---

## 12. Webhooks

### Outbound Webhook Events

The platform sends webhook notifications to registered URLs for the following events:

| Event | Trigger |
|-------|---------|
| `wallet.credited` | Funds credited to wallet |
| `wallet.debited` | Funds debited from wallet |
| `payment.completed` | Payment successfully processed |
| `payment.failed` | Payment processing failed |
| `kyc.approved` | KYC verification approved |
| `kyc.rejected` | KYC verification rejected |
| `card.transaction` | Card authorization event |

### Webhook Payload

```json
{
  "event": "payment.completed",
  "timestamp": "2026-02-17T12:00:00Z",
  "data": {
    "transactionId": "txn_001",
    "amount": "5000.00",
    "currency": "NGN",
    "status": "completed"
  },
  "signature": "sha256=abc123..."
}
```

---

**Version:** 2.0
**Last Updated:** 2026-02-17
**OpenAPI Spec:** /api/docs
