# Technical Specifications — Global FinTech Platform (AtlasX)
> Version: 1.0 | Last Updated: 2026-02-18 | Status: Draft
> Classification: Internal | Author: AIDD System

## 1. API Specifications

### 1.1 Wallets API

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/v1/wallets | POST | Create wallet |
| /api/v1/wallets/:id | GET | Get wallet details |
| /api/v1/wallets/:id/balance | GET | Get wallet balance |
| /api/v1/wallets/:id/transactions | GET | List transactions |
| /api/v1/wallets/transfer | POST | Execute transfer |
| /api/v1/wallets/:id/hold | POST | Place hold |
| /api/v1/wallets/:id/release | POST | Release hold |

### 1.2 Payments API

| Endpoint | Method | Description |
|----------|--------|-------------|
| /api/v1/payments/initiate | POST | Initiate payment |
| /api/v1/payments/:id/verify | GET | Verify payment status |
| /api/v1/payments/:id/refund | POST | Refund payment |
| /api/v1/payments/split-configs | POST | Create split configuration |
| /api/v1/payments/gateways | GET | List available gateways |

### 1.3 RegAI API

| Endpoint | Method | Description |
|----------|--------|-------------|
| /v1/decision | POST | Policy decision (ALLOW/DENY/STEP_UP) |
| /v1/screen/sanctions | POST | Sanctions screening |
| /v1/case | POST | Create compliance case |
| /v1/report/sar | POST | Generate SAR narrative |

## 2. Authentication

- OAuth2 + JWT tokens via Keycloak
- Access token TTL: 15 minutes
- Refresh token TTL: 7 days
- API key authentication for partner integrations
- mTLS for inter-service communication

## 3. Rate Limits

| Tier | Rate Limit | Burst |
|------|-----------|-------|
| Free | 100 req/min | 20 |
| Business | 1,000 req/min | 100 |
| Enterprise | 10,000 req/min | 1,000 |
| Internal | Unlimited | - |

## 4. Data Formats

- Request/Response: JSON (Content-Type: application/json)
- Monetary values: String representation to avoid floating-point errors
- Timestamps: ISO 8601 (UTC)
- IDs: UUID v4
- Pagination: Cursor-based with `limit` and `after` parameters
