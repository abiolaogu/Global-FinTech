# AtlasX API Contracts

## Overview

This document defines the RESTful API contracts for AtlasX core services. All APIs follow REST conventions, use JSON for request/response payloads, and are documented using OpenAPI 3.1 specification principles.

**Version:** 1.0
**Date:** 2025-11-14
**Base URL:** `https://api.atlasx.io/v1`

---

## 1. General Conventions

### 1.1 HTTP Methods

- `GET` - Retrieve resource(s)
- `POST` - Create new resource
- `PUT` - Full update of resource
- `PATCH` - Partial update of resource
- `DELETE` - Remove resource

### 1.2 Response Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, PATCH, DELETE |
| 201 | Created | Successful POST |
| 202 | Accepted | Async operation initiated |
| 204 | No Content | Successful DELETE (no response body) |
| 400 | Bad Request | Invalid request payload |
| 401 | Unauthorized | Missing or invalid authentication |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Resource conflict (duplicate, state mismatch) |
| 422 | Unprocessable Entity | Validation error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |
| 503 | Service Unavailable | Temporary outage |

### 1.3 Common Headers

**Request Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
Accept: application/json
X-Request-ID: <uuid>          # For tracing
X-Idempotency-Key: <uuid>     # For idempotent operations
```

**Response Headers:**
```
Content-Type: application/json
X-Request-ID: <uuid>
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1700000000
```

### 1.4 Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20, max: 100)
- `sort` - Sort field (e.g., `created_at`)
- `order` - Sort order: `asc` or `desc` (default: `desc`)

**Response Structure:**
```json
{
  "data": [...],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  },
  "links": {
    "self": "/v1/payments?page=1",
    "next": "/v1/payments?page=2",
    "prev": null,
    "first": "/v1/payments?page=1",
    "last": "/v1/payments?page=8"
  }
}
```

### 1.5 Error Response Format

```json
{
  "error": {
    "code": "INSUFFICIENT_BALANCE",
    "message": "Insufficient balance in wallet",
    "details": {
      "walletId": "uuid",
      "available": "100.00",
      "required": "150.00"
    },
    "requestId": "uuid",
    "timestamp": "2025-11-14T10:30:00Z"
  }
}
```

---

## 2. Authentication & Authorization

### 2.1 Register User

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phoneNumber": "+1234567890",
  "countryCode": "US",
  "dateOfBirth": "1990-01-15",
  "acceptedTerms": true
}
```

**Validations:**
- Email: valid format, unique
- Password: min 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
- Phone: E.164 format
- Age: >= 18 years

**Response:** `201 Created`
```json
{
  "data": {
    "userId": "uuid",
    "email": "user@example.com",
    "status": "pending_verification",
    "createdAt": "2025-11-14T10:30:00Z"
  },
  "tokens": {
    "accessToken": "jwt_token",
    "refreshToken": "jwt_refresh_token",
    "expiresIn": 900
  }
}
```

### 2.2 Login

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "deviceId": "device_uuid",
  "deviceName": "iPhone 14 Pro"
}
```

**Response:** `200 OK`
```json
{
  "tokens": {
    "accessToken": "jwt_token",
    "refreshToken": "jwt_refresh_token",
    "expiresIn": 900
  },
  "user": {
    "userId": "uuid",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "status": "active",
    "kycStatus": "verified"
  }
}
```

### 2.3 Refresh Token

**Endpoint:** `POST /auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "jwt_refresh_token"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "new_jwt_token",
  "expiresIn": 900
}
```

### 2.4 Logout

**Endpoint:** `POST /auth/logout`

**Headers:** `Authorization: Bearer <token>`

**Response:** `204 No Content`

---

## 3. KYC Service

### 3.1 Submit KYC Documents

**Endpoint:** `POST /kyc/submit`

**Headers:** `Authorization: Bearer <token>`

**Request Body (multipart/form-data):**
```
jurisdictionCode: US
documents[0][type]: passport
documents[0][file]: <binary>
documents[1][type]: proof_of_address
documents[1][file]: <binary>
```

**Response:** `202 Accepted`
```json
{
  "data": {
    "kycProfileId": "uuid",
    "userId": "uuid",
    "jurisdictionCode": "US",
    "status": "pending",
    "submittedAt": "2025-11-14T10:30:00Z",
    "estimatedCompletionTime": "2-5 business days"
  }
}
```

### 3.2 Get KYC Status

**Endpoint:** `GET /kyc/status`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "data": {
    "kycProfileId": "uuid",
    "verificationLevel": "basic",
    "status": "approved",
    "jurisdictionCode": "US",
    "verifiedAt": "2025-11-14T12:00:00Z",
    "expiryDate": "2026-11-14"
  }
}
```

---

## 4. Wallet Service

### 4.1 List Wallets

**Endpoint:** `GET /wallets`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `currency` - Filter by currency code (optional)
- `status` - Filter by status (optional)

**Response:** `200 OK`
```json
{
  "data": [
    {
      "walletId": "uuid",
      "userId": "uuid",
      "currencyCode": "USD",
      "walletNumber": "ATX-USD-123456789",
      "balance": "1500.00",
      "availableBalance": "1450.00",
      "reservedBalance": "50.00",
      "status": "active",
      "createdAt": "2025-11-01T10:00:00Z"
    },
    {
      "walletId": "uuid",
      "userId": "uuid",
      "currencyCode": "EUR",
      "walletNumber": "ATX-EUR-987654321",
      "balance": "800.00",
      "availableBalance": "800.00",
      "reservedBalance": "0.00",
      "status": "active",
      "createdAt": "2025-11-01T10:00:00Z"
    }
  ]
}
```

### 4.2 Create Wallet

**Endpoint:** `POST /wallets`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "currencyCode": "GBP"
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "walletId": "uuid",
    "userId": "uuid",
    "currencyCode": "GBP",
    "walletNumber": "ATX-GBP-456789123",
    "balance": "0.00",
    "availableBalance": "0.00",
    "status": "active",
    "createdAt": "2025-11-14T10:30:00Z"
  }
}
```

### 4.3 Get Wallet Details

**Endpoint:** `GET /wallets/:walletId`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "data": {
    "walletId": "uuid",
    "userId": "uuid",
    "currencyCode": "USD",
    "walletNumber": "ATX-USD-123456789",
    "balance": "1500.00",
    "availableBalance": "1450.00",
    "reservedBalance": "50.00",
    "status": "active",
    "createdAt": "2025-11-01T10:00:00Z",
    "updatedAt": "2025-11-14T10:30:00Z"
  }
}
```

### 4.4 Freeze Wallet

**Endpoint:** `POST /wallets/:walletId/freeze`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "reason": "Suspected fraud"
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "walletId": "uuid",
    "status": "frozen",
    "frozenAt": "2025-11-14T10:30:00Z"
  }
}
```

---

## 5. Payment Service

### 5.1 P2P Transfer

**Endpoint:** `POST /payments/p2p`

**Headers:**
```
Authorization: Bearer <token>
X-Idempotency-Key: <uuid>
```

**Request Body:**
```json
{
  "senderWalletId": "uuid",
  "recipientEmail": "recipient@example.com",
  "amount": "100.00",
  "currencyCode": "USD",
  "description": "Lunch payment",
  "metadata": {
    "category": "food"
  }
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "paymentId": "uuid",
    "senderWalletId": "uuid",
    "receiverWalletId": "uuid",
    "amount": "100.00",
    "currencyCode": "USD",
    "status": "completed",
    "createdAt": "2025-11-14T10:30:00Z",
    "completedAt": "2025-11-14T10:30:01Z"
  }
}
```

### 5.2 Initiate Deposit (Bank Transfer)

**Endpoint:** `POST /payments/deposit`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "walletId": "uuid",
  "amount": "1000.00",
  "currencyCode": "USD",
  "paymentMethod": "bank_transfer",
  "bankAccountId": "uuid"
}
```

**Response:** `202 Accepted`
```json
{
  "data": {
    "paymentId": "uuid",
    "walletId": "uuid",
    "amount": "1000.00",
    "currencyCode": "USD",
    "status": "pending",
    "estimatedCompletionTime": "2-3 business days",
    "createdAt": "2025-11-14T10:30:00Z"
  }
}
```

### 5.3 Initiate Withdrawal

**Endpoint:** `POST /payments/withdraw`

**Headers:**
```
Authorization: Bearer <token>
X-Idempotency-Key: <uuid>
```

**Request Body:**
```json
{
  "walletId": "uuid",
  "amount": "500.00",
  "currencyCode": "USD",
  "bankAccountId": "uuid",
  "withdrawalMethod": "wire"
}
```

**Response:** `202 Accepted`
```json
{
  "data": {
    "paymentId": "uuid",
    "walletId": "uuid",
    "amount": "500.00",
    "feeAmount": "5.00",
    "netAmount": "495.00",
    "currencyCode": "USD",
    "status": "pending",
    "estimatedCompletionTime": "1-3 business days",
    "createdAt": "2025-11-14T10:30:00Z"
  }
}
```

### 5.4 Get Payment Details

**Endpoint:** `GET /payments/:paymentId`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "data": {
    "paymentId": "uuid",
    "senderWalletId": "uuid",
    "receiverWalletId": "uuid",
    "amount": "100.00",
    "feeAmount": "0.00",
    "currencyCode": "USD",
    "paymentMethod": "wallet",
    "status": "completed",
    "createdAt": "2025-11-14T10:30:00Z",
    "completedAt": "2025-11-14T10:30:01Z",
    "description": "Lunch payment"
  }
}
```

### 5.5 List Payments

**Endpoint:** `GET /payments`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `walletId` - Filter by wallet
- `status` - Filter by status
- `fromDate` - Start date (ISO 8601)
- `toDate` - End date (ISO 8601)
- `page`, `limit` - Pagination

**Response:** `200 OK` (paginated)

---

## 6. FX Service

### 6.1 Get FX Rate

**Endpoint:** `GET /fx/rate`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `fromCurrency` - Source currency code
- `toCurrency` - Target currency code
- `amount` - Amount to convert (optional)

**Response:** `200 OK`
```json
{
  "data": {
    "fromCurrency": "USD",
    "toCurrency": "EUR",
    "rate": "0.91",
    "inverseRate": "1.10",
    "amount": "1000.00",
    "convertedAmount": "910.00",
    "feeAmount": "4.55",
    "feePercentage": "0.5",
    "timestamp": "2025-11-14T10:30:00Z",
    "validUntil": "2025-11-14T10:30:30Z"
  }
}
```

### 6.2 Execute FX Conversion

**Endpoint:** `POST /fx/convert`

**Headers:**
```
Authorization: Bearer <token>
X-Idempotency-Key: <uuid>
```

**Request Body:**
```json
{
  "fromWalletId": "uuid",
  "toWalletId": "uuid",
  "amount": "1000.00",
  "fromCurrency": "USD",
  "toCurrency": "EUR",
  "rateQuoteId": "uuid"
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "conversionId": "uuid",
    "fromWalletId": "uuid",
    "toWalletId": "uuid",
    "fromAmount": "1000.00",
    "toAmount": "910.00",
    "rate": "0.91",
    "feeAmount": "4.55",
    "status": "completed",
    "createdAt": "2025-11-14T10:30:00Z"
  }
}
```

---

## 7. Card Service

### 7.1 Issue Card

**Endpoint:** `POST /cards`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "walletId": "uuid",
  "cardType": "virtual",
  "cardNetwork": "visa",
  "shippingAddress": {
    "line1": "123 Main St",
    "line2": "Apt 4",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US"
  }
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "cardId": "uuid",
    "userId": "uuid",
    "walletId": "uuid",
    "cardType": "virtual",
    "cardNetwork": "visa",
    "last4Digits": "1234",
    "expiryMonth": 12,
    "expiryYear": 2027,
    "status": "pending",
    "createdAt": "2025-11-14T10:30:00Z"
  }
}
```

### 7.2 List Cards

**Endpoint:** `GET /cards`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `status` - Filter by status
- `cardType` - Filter by type

**Response:** `200 OK`
```json
{
  "data": [
    {
      "cardId": "uuid",
      "cardType": "virtual",
      "cardNetwork": "visa",
      "last4Digits": "1234",
      "status": "active",
      "spendingLimitDaily": "1000.00",
      "createdAt": "2025-11-01T10:00:00Z"
    }
  ]
}
```

### 7.3 Get Card Details

**Endpoint:** `GET /cards/:cardId`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "data": {
    "cardId": "uuid",
    "userId": "uuid",
    "walletId": "uuid",
    "cardType": "virtual",
    "cardNetwork": "visa",
    "last4Digits": "1234",
    "expiryMonth": 12,
    "expiryYear": 2027,
    "status": "active",
    "spendingLimitDaily": "1000.00",
    "spendingLimitMonthly": "10000.00",
    "pinSet": true,
    "createdAt": "2025-11-01T10:00:00Z",
    "activatedAt": "2025-11-01T10:05:00Z"
  }
}
```

### 7.4 Freeze/Unfreeze Card

**Endpoint:** `POST /cards/:cardId/freeze`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "data": {
    "cardId": "uuid",
    "status": "frozen",
    "frozenAt": "2025-11-14T10:30:00Z"
  }
}
```

**Endpoint:** `POST /cards/:cardId/unfreeze`

### 7.5 Get Card Transactions

**Endpoint:** `GET /cards/:cardId/transactions`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:** Pagination + date filters

**Response:** `200 OK` (paginated)
```json
{
  "data": [
    {
      "transactionId": "uuid",
      "cardId": "uuid",
      "amount": "50.00",
      "currencyCode": "USD",
      "merchantName": "Starbucks",
      "merchantCategory": "Food & Drink",
      "status": "settled",
      "authorizedAt": "2025-11-14T10:00:00Z",
      "settledAt": "2025-11-15T10:00:00Z"
    }
  ],
  "meta": { ... }
}
```

---

## 8. Trading Service

### 8.1 Get Market Quote

**Endpoint:** `GET /trading/quote`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:**
- `assetSymbol` - Asset symbol (AAPL, BTC, etc.)
- `assetType` - Asset type (stock, crypto, fx)

**Response:** `200 OK`
```json
{
  "data": {
    "assetSymbol": "AAPL",
    "assetType": "stock",
    "bidPrice": "175.50",
    "askPrice": "175.52",
    "lastPrice": "175.51",
    "volume": "5000000",
    "timestamp": "2025-11-14T10:30:00Z",
    "marketOpen": true
  }
}
```

### 8.2 Place Order

**Endpoint:** `POST /trading/orders`

**Headers:**
```
Authorization: Bearer <token>
X-Idempotency-Key: <uuid>
```

**Request Body:**
```json
{
  "settlementWalletId": "uuid",
  "assetSymbol": "BTC",
  "assetType": "crypto",
  "orderType": "market",
  "side": "buy",
  "quantity": "0.01"
}
```

**Response:** `201 Created`
```json
{
  "data": {
    "orderId": "uuid",
    "userId": "uuid",
    "assetSymbol": "BTC",
    "orderType": "market",
    "side": "buy",
    "quantity": "0.01",
    "status": "pending",
    "estimatedCost": "450.00",
    "createdAt": "2025-11-14T10:30:00Z"
  }
}
```

### 8.3 Get Order Status

**Endpoint:** `GET /trading/orders/:orderId`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "data": {
    "orderId": "uuid",
    "userId": "uuid",
    "assetSymbol": "BTC",
    "orderType": "market",
    "side": "buy",
    "quantity": "0.01",
    "executedQuantity": "0.01",
    "averageFillPrice": "45020.00",
    "status": "filled",
    "createdAt": "2025-11-14T10:30:00Z",
    "executedAt": "2025-11-14T10:30:05Z"
  }
}
```

### 8.4 List Orders

**Endpoint:** `GET /trading/orders`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:** Pagination + filters (status, assetType, fromDate, toDate)

**Response:** `200 OK` (paginated)

### 8.5 Get Portfolio

**Endpoint:** `GET /trading/portfolio`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "data": {
    "positions": [
      {
        "positionId": "uuid",
        "assetSymbol": "BTC",
        "assetType": "crypto",
        "quantity": "0.05",
        "averageCostBasis": "44500.00",
        "currentMarketValue": "2250.00",
        "unrealizedPnl": "25.00",
        "unrealizedPnlPercentage": "1.12"
      }
    ],
    "totalValue": "2250.00",
    "totalCost": "2225.00",
    "totalPnl": "25.00"
  }
}
```

---

## 9. Rewards Service

### 9.1 Get Rewards Balance

**Endpoint:** `GET /rewards/balance`

**Headers:** `Authorization: Bearer <token>`

**Response:** `200 OK`
```json
{
  "data": {
    "userId": "uuid",
    "totalPoints": "15000",
    "availablePoints": "12000",
    "redeemedPoints": "3000",
    "expiringPoints": "500",
    "expiryDate": "2025-12-31",
    "tier": {
      "name": "Gold",
      "rewardMultiplier": "1.5"
    }
  }
}
```

### 9.2 Get Rewards History

**Endpoint:** `GET /rewards/history`

**Headers:** `Authorization: Bearer <token>`

**Query Parameters:** Pagination

**Response:** `200 OK` (paginated)
```json
{
  "data": [
    {
      "rewardId": "uuid",
      "points": "100",
      "transactionType": "payment",
      "description": "P2P transfer reward",
      "createdAt": "2025-11-14T10:30:00Z",
      "expiresAt": "2026-11-14"
    }
  ],
  "meta": { ... }
}
```

### 9.3 Redeem Rewards

**Endpoint:** `POST /rewards/redeem`

**Headers:** `Authorization: Bearer <token>`

**Request Body:**
```json
{
  "points": "10000",
  "redemptionType": "cashback",
  "walletId": "uuid"
}
```

**Response:** `200 OK`
```json
{
  "data": {
    "redemptionId": "uuid",
    "points": "10000",
    "cashbackAmount": "100.00",
    "currencyCode": "USD",
    "walletId": "uuid",
    "status": "completed",
    "redeemedAt": "2025-11-14T10:30:00Z"
  }
}
```

---

## 10. Webhooks

AtlasX can send webhook events to registered endpoints for real-time notifications.

### 10.1 Webhook Event Structure

```json
{
  "eventId": "uuid",
  "eventType": "payment.completed",
  "eventVersion": "1.0",
  "timestamp": "2025-11-14T10:30:00Z",
  "data": {
    "paymentId": "uuid",
    "amount": "100.00",
    "status": "completed"
  },
  "metadata": {
    "userId": "uuid",
    "environment": "production"
  }
}
```

### 10.2 Event Types

- `user.registered`
- `kyc.approved`
- `kyc.rejected`
- `wallet.funded`
- `payment.completed`
- `payment.failed`
- `card.issued`
- `card.transaction.authorized`
- `card.transaction.settled`
- `trade.executed`
- `reward.accrued`
- `tier.upgraded`

### 10.3 Webhook Signature Verification

```
X-AtlasX-Signature: <HMAC-SHA256 signature>
X-AtlasX-Timestamp: <unix_timestamp>
```

**Verification:**
```typescript
const signature = hmacSHA256(
  `${timestamp}.${JSON.stringify(payload)}`,
  webhookSecret
);
```

---

## 11. Rate Limiting

**Limits:**
- Authenticated: 1000 requests/hour
- Unauthenticated: 100 requests/hour
- Payment operations: 60 requests/hour (higher limits for verified users)

**Headers:**
```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 995
X-RateLimit-Reset: 1700000000
```

**Exceeded Response:** `429 Too Many Requests`
```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Rate limit exceeded. Try again in 30 minutes.",
    "retryAfter": 1800
  }
}
```

---

## 12. Idempotency

All state-changing operations (POST, PUT, PATCH) support idempotency via `X-Idempotency-Key` header.

**Behavior:**
- Same key within 24 hours returns cached response
- Different payload with same key returns `409 Conflict`

---

## 13. Versioning

**API Versioning:**
- URL-based: `/v1`, `/v2`
- Breaking changes increment major version
- Backward-compatible changes within same version
- Deprecated versions supported for 12 months

**Deprecation Header:**
```
X-API-Deprecation: true
X-API-Sunset: 2026-11-14
```

---

**Document End**
