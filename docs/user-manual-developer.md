# User Manual — Developer — Global FinTech Platform (AtlasX)
> Version: 1.0 | Last Updated: 2026-02-18 | Status: Draft
> Classification: Internal | Author: AIDD System

## 1. Quick Start

### 1.1 Prerequisites
- Node.js 20+, Python 3.11+, Docker, Docker Compose
- PostgreSQL 15+, Redis 7+

### 1.2 Local Setup
```bash
git clone https://github.com/abiolaogu/Global-FinTech.git
cd Global-FinTech
cp .env.example .env
docker-compose up -d  # PostgreSQL, Redis, Kafka
cd apps/api && pnpm install && pnpm run start:dev
```

### 1.3 RegAI Service
```bash
cd regai && pip install -r requirements.txt
uvicorn app.main:app --reload --port 8001
```

## 2. API Integration Guide

### 2.1 Authentication
```bash
# Obtain JWT token
POST /auth/token
Content-Type: application/json
{"email": "dev@example.com", "password": "..."}

# Use in requests
Authorization: Bearer <jwt_token>
```

### 2.2 Create a Wallet
```bash
POST /api/v1/wallets
{"currency": "USD", "label": "My USD Wallet"}
```

### 2.3 Initiate Payment
```bash
POST /api/v1/payments/initiate
{"amount": "100.00", "currency": "USD", "provider": "stripe", "metadata": {...}}
```

## 3. Webhook Integration

### 3.1 Registering Webhooks
```bash
POST /api/v1/webhooks
{"url": "https://your-server.com/webhook", "events": ["payment.completed", "payment.failed"]}
```

### 3.2 Verifying Signatures
All webhooks include an `X-AtlasX-Signature` header. Verify using HMAC-SHA256 with your webhook secret.

## 4. Development Workflow

1. Create feature branch from `main`
2. Implement changes with tests
3. Run `pnpm test` for unit tests
4. Run `pnpm test:e2e` for integration tests
5. Submit PR — CI runs AIDD guardrails + tests
6. Merge after review approval

## 5. SDK References

- **TypeScript SDK**: `@atlasx/sdk` (npm)
- **Python SDK**: `atlasx-python` (PyPI)
- **GraphQL Playground**: Available at `/graphql` in development mode
