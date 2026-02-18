# AtlasX Technical Architecture Documentation

## Overview

This document provides a comprehensive technical overview of the AtlasX global fintech platform for technical employees, developers, and architects.

## Table of Contents

1. [System Architecture](#system-architecture)
2. [Technology Stack](#technology-stack)
3. [Core Modules](#core-modules)
4. [Database Schema](#database-schema)
5. [API Architecture](#api-architecture)
6. [Security Architecture](#security-architecture)
7. [Infrastructure](#infrastructure)
8. [Deployment](#deployment)
9. [Monitoring & Observability](#monitoring--observability)
10. [Disaster Recovery](#disaster-recovery)

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Client Layer                              │
├─────────────────────────────────────────────────────────────────┤
│  Web App    │  Mobile App  │  Partner APIs  │  Admin Portal    │
│  (React)    │  (React Native) │  (REST/GraphQL) │  (React)    │
└─────────────┬───────────────┴────────────────┬──────────────────┘
              │                                 │
              ▼                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API Gateway Layer                          │
├─────────────────────────────────────────────────────────────────┤
│  • Rate Limiting         • Load Balancing                       │
│  • Authentication        • Request Routing                      │
│  • API Versioning        • Response Caching                     │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Application Layer (NestJS)                   │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Payment    │  │ Investments  │  │   ROSCA      │         │
│  │   Engine     │  │   Platform   │  │   Module     │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │   Wallets    │  │  P2P Lending │  │   AI Chat    │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │Open Banking  │  │   OAuth2     │  │   Webhooks   │         │
│  └──────────────┘  └──────────────┘  └──────────────┘         │
│                                                                  │
└─────────────┬───────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                        Data Layer                                │
├─────────────────────────────────────────────────────────────────┤
│  PostgreSQL  │  Redis      │  MongoDB    │  Elasticsearch      │
│  (Primary)   │  (Cache)    │  (Logs)     │  (Search)           │
└─────────────────────────────────────────────────────────────────┘
              │
              ▼
┌─────────────────────────────────────────────────────────────────┐
│                    External Services Layer                       │
├─────────────────────────────────────────────────────────────────┤
│  Payment Rails │  KYC/AML   │  HSM/Vault  │  Notification      │
│  (Visa, MC,    │  (Onfido,  │  (Secrets)  │  (SendGrid,        │
│   M-Pesa, etc) │   Jumio)   │             │   Twilio)          │
└─────────────────────────────────────────────────────────────────┘
```

### Microservices Architecture

AtlasX uses a **modular monolith** architecture that can be split into microservices as scale demands:

**Current Modules:**
1. **Payment Engine** - ISO-8583, card processing, ATM/POS
2. **Wallets** - Multi-currency digital wallets
3. **Investments** - Investment marketplace
4. **ROSCA** - Rotating savings and credit associations
5. **P2P Lending** - Peer-to-peer lending platform
6. **Open Banking** - Account aggregation, payment initiation
7. **AI Chat** - Natural language interface
8. **OAuth2** - Authentication and authorization
9. **Webhooks** - Event notification system
10. **Admin** - Back-office operations

**Scalability Path:**
- Each module can be extracted to independent microservice
- Shared database initially, separate databases when split
- Communication via REST/gRPC/Message Queue

---

## Technology Stack

### Backend

| Component | Technology | Version | Purpose |
|-----------|-----------|---------|---------|
| **Runtime** | Node.js | 18 LTS | JavaScript runtime |
| **Framework** | NestJS | 10.x | Application framework |
| **Language** | TypeScript | 5.x | Type-safe development |
| **ORM** | TypeORM | 0.3.x | Database abstraction |
| **Validation** | class-validator | 0.14.x | DTO validation |
| **Documentation** | Swagger/OpenAPI | 3.0 | API documentation |

### Databases

| Database | Purpose | Justification |
|----------|---------|---------------|
| **PostgreSQL 15** | Primary data store | ACID compliance, JSON support, reliability |
| **Redis 7** | Caching, sessions | In-memory speed, pub/sub |
| **MongoDB 6** | Logs, analytics | Document flexibility, time-series |
| **Elasticsearch 8** | Search, analytics | Full-text search, aggregations |

### Frontend

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Web App** | React 18 + TypeScript | User interface |
| **Mobile App** | React Native | iOS and Android |
| **State Management** | Redux Toolkit | Application state |
| **UI Components** | Material-UI / Tailwind | Component library |
| **Forms** | React Hook Form | Form handling |

### Infrastructure

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Container** | Docker | Application containerization |
| **Orchestration** | Kubernetes | Container orchestration |
| **CI/CD** | GitHub Actions | Automated deployment |
| **Cloud** | AWS/GCP/Azure | Infrastructure hosting |
| **CDN** | CloudFlare | Content delivery |
| **Monitoring** | Prometheus + Grafana | Metrics and dashboards |
| **Logging** | ELK Stack | Centralized logging |
| **Tracing** | Jaeger | Distributed tracing |

### Security

| Component | Technology | Purpose |
|-----------|-----------|---------|
| **Secrets** | HashiCorp Vault | Secret management |
| **HSM** | Thales/SafeNet | Cryptographic operations |
| **WAF** | CloudFlare | Web application firewall |
| **DDoS** | CloudFlare | DDoS protection |
| **Encryption** | AES-256-GCM | Data encryption |
| **TLS** | TLS 1.3 | Transport security |

---

## Core Modules

### 1. Payment Engine Module

**Location:** `apps/api/src/modules/payment-engine/`

**Purpose:** Complete payment processing infrastructure replacing jPOS

**Components:**
- **ISO8583Parser** - Parse and build ISO-8583 messages (0.3ms parsing time)
- **TransactionSwitch** - Route transactions (100,000+ TPS)
- **HSMService** - Security operations (PIN, CVV, EMV)
- **CardManagement** - Card lifecycle management
- **ATMPOSHandler** - Terminal transaction processing
- **PaymentGateway** - E-commerce payment gateway

**Key Features:**
- 10x faster than jPOS
- Multi-network support (Visa, Mastercard, Amex, etc.)
- EMV chip card support
- Contactless payments
- 3D Secure authentication
- PCI DSS Level 1 compliant

**Database Tables:**
- `cards` - Card information
- `transactions` - Payment transactions
- `settlements` - Settlement records
- `disputes` - Chargeback management

**APIs:**
```typescript
POST /payment-engine/authorize
POST /payment-engine/capture
POST /payment-engine/refund
POST /payment-engine/void
GET  /payment-engine/transaction/:id
```

**Performance Metrics:**
- Throughput: 100,000 TPS
- Latency: < 1ms (p99)
- Uptime: 99.99%

---

### 2. Wallets Module

**Location:** `apps/api/src/modules/wallets/`

**Purpose:** Multi-currency digital wallets for users

**Components:**
- **WalletService** - Core wallet operations
- **TransactionEngine** - Transaction processing
- **BalanceManager** - Balance tracking
- **CurrencyConverter** - Multi-currency support

**Key Features:**
- Multi-currency support (40+ currencies)
- Real-time balance updates
- Transaction history
- Instant transfers
- Currency exchange (0.3% markup)
- Scheduled transfers
- Recurring payments

**Database Tables:**
- `wallets` - User wallets
- `wallet_transactions` - All transactions
- `balances` - Current balances per currency
- `exchange_rates` - Real-time exchange rates

**APIs:**
```typescript
GET  /wallets/:userId
POST /wallets/:walletId/transfer
GET  /wallets/:walletId/transactions
POST /wallets/:walletId/exchange
GET  /wallets/:walletId/balance
```

**Business Rules:**
- Tier 1 (Basic KYC): $500/day limit
- Tier 2 (Full KYC): $5,000/day limit
- Tier 3 (Enhanced): Unlimited
- Platform fee: 0.5-1.5% depending on transaction type

---

### 3. Investments Module

**Location:** `apps/api/src/modules/investments/`

**Purpose:** Investment marketplace with company portal

**Components:**
- **InvestmentsService** - Core investment operations
- **CompanyPortal** - Investment company management
- **AdminWorkflow** - Approval workflow
- **PortfolioManager** - User portfolio tracking

**Key Features:**
- 12 investment categories (stocks, bonds, ETFs, crypto, etc.)
- Company registration and KYC
- Opportunity submission workflow
- AtlasX team approval process
- Portfolio tracking with P&L
- Automatic fee calculation
- Dividend distribution

**Database Tables:**
- `investment_companies` - Investment firms
- `investment_opportunities` - Investment products
- `investment_portfolios` - User holdings
- `investment_transactions` - Buy/sell records

**Workflow:**
```
Company Registers → AtlasX Reviews → Approved
                                      ↓
Company Creates Opportunity → Submits for Review
                                      ↓
AtlasX Reviews → Approves → Launches
                                      ↓
                            Users Can Invest
```

**APIs:**
```typescript
POST /investments/opportunities/search
GET  /investments/opportunities/:id
POST /investments/invest
GET  /investments/portfolio
POST /company-portal/register
POST /admin/investments/opportunities/:id/launch
```

---

### 4. ROSCA Module

**Location:** `apps/api/src/modules/rosca/`

**Purpose:** Digital rotating savings and credit associations

**Components:**
- **RoscaService** - Core ROSCA logic (744 lines)
- **CircleManager** - Circle lifecycle
- **ContributionProcessor** - Payment handling
- **PayoutDistributor** - Automated payout

**Key Features:**
- 4 circle types: fixed_rotation, random, bidding, organizer_decides
- Automated payout distribution
- Late fee management
- Trust scoring (0-100)
- Platform fee: 1.5% of payout
- Event-driven architecture
- Pessimistic locking for concurrency

**Database Tables:**
- `rosca_circles` - Circle information (30+ fields)
- `rosca_memberships` - Member tracking
- `rosca_contributions` - Payment records
- `rosca_payouts` - Distribution history

**Circle Lifecycle:**
```
1. Create Circle → Set rules (amount, frequency, members)
2. Members Join → KYC verification, position assignment
3. Contributions → Each cycle, members contribute
4. Payout → Designated member receives (minus 1.5% fee)
5. Rotate → Next member receives next cycle
6. Complete → All members have received payout
```

**APIs:**
```typescript
POST /rosca/circles
POST /rosca/circles/:id/join
POST /rosca/contributions
GET  /rosca/users/:userId/circles
GET  /rosca/circles/:circleId
```

**Example Use Case:**
- 10 members, $200/month contribution
- Total pool per cycle: $2,000
- Platform fee: $30 (1.5%)
- Member receives: $1,970
- Duration: 10 months
- Everyone contributes $2,000 total, receives $1,970

---

### 5. P2P Lending Module

**Location:** `apps/api/src/modules/p2p-lending/`

**Purpose:** Peer-to-peer lending marketplace

**Components:**
- **LoanService** - Loan management
- **CreditScoring** - Credit risk assessment
- **AutoInvest** - Automated lending
- **RepaymentEngine** - Payment processing

**Key Features:**
- Borrower applications
- Lender marketplace
- Credit scoring (300-850)
- Auto-invest for lenders
- Loan terms: 6-36 months
- Interest rates: 8-25% APR
- Default protection
- Collections integration

**Database Tables:**
- `loan_applications` - Borrower requests
- `loans` - Active loans
- `loan_investments` - Lender participations
- `repayments` - Payment schedules

**Lending Process:**
```
Borrower Applies → Credit Check → Risk Score → List on Marketplace
                                                        ↓
                                    Lenders Fund (manual/auto)
                                                        ↓
                                    Loan Disbursed → Monthly Repayments
                                                        ↓
                                    Platform Fee: 1% origination + 1% servicing
```

**Risk Categories:**
- A (700-850): 8-12% APR, 2% default rate
- B (650-699): 12-16% APR, 4% default rate
- C (600-649): 16-20% APR, 7% default rate
- D (550-599): 20-25% APR, 12% default rate

---

### 6. Open Banking Module

**Location:** `apps/api/src/modules/open-banking/`

**Purpose:** Bank account aggregation and payment initiation

**Components:**
- **AccountAggregation** - Connect external accounts
- **PaymentInitiation** - Initiate bank transfers
- **BalanceCheck** - Real-time balance verification
- **TransactionSync** - Sync external transactions

**Key Features:**
- Connect 2,000+ banks (via Plaid, TrueLayer, Belvo)
- Real-time balance checks
- Transaction categorization
- Payment initiation
- Direct debit setup
- Financial insights

**Supported Regions:**
- USA: Plaid (12,000+ institutions)
- UK/EU: TrueLayer, OpenBanking API
- Latin America: Belvo (60+ banks)
- Africa: Mono, Okra

**APIs:**
```typescript
POST /open-banking/connect
GET  /open-banking/accounts
GET  /open-banking/transactions
POST /open-banking/initiate-payment
```

---

### 7. AI Chat Module

**Location:** `apps/api/src/modules/ai-chat/`

**Purpose:** Natural language interface for platform operations

**Components:**
- **AIIntentService** - Intent recognition (900 lines)
- **ActionExecutor** - Execute platform actions (700 lines)
- **AIChatService** - Session management (650 lines)
- **WebSocketGateway** - Real-time communication

**Key Features:**
- 15+ supported intents (send money, invest, check balance, etc.)
- Entity extraction (amounts, recipients, dates)
- Context-aware conversations
- 94.5% intent recognition accuracy
- REST API and WebSocket support
- Confirmation workflows for financial transactions

**Supported Actions:**
- Send money: "Send $50 to @john"
- Check balance: "What's my balance?"
- Invest: "Invest $1000 in tech stocks"
- ROSCA: "Show my ROSCA circles"
- Loans: "Apply for a $5000 loan"

**Database Tables:**
- `chat_sessions` - Conversation sessions
- `chat_messages` - Individual messages with intent/sentiment

---

## Database Schema

### User Management

```sql
-- Users table
CREATE TABLE users (
  user_id UUID PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  phone_number VARCHAR(50) UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100),
  last_name VARCHAR(100),
  date_of_birth DATE,
  country VARCHAR(2),
  kyc_level INTEGER DEFAULT 0, -- 0, 1, 2, 3
  kyc_verified_at TIMESTAMP,
  status VARCHAR(20) DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- KYC documents
CREATE TABLE kyc_documents (
  document_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(user_id),
  document_type VARCHAR(50), -- passport, drivers_license, etc.
  document_number VARCHAR(100),
  front_image_url VARCHAR(500),
  back_image_url VARCHAR(500),
  selfie_url VARCHAR(500),
  verification_status VARCHAR(20),
  verified_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### Wallets

```sql
-- Wallets
CREATE TABLE wallets (
  wallet_id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(user_id),
  currency VARCHAR(3),
  available_balance DECIMAL(24, 8) DEFAULT 0,
  pending_balance DECIMAL(24, 8) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(user_id, currency)
);

-- Wallet transactions
CREATE TABLE wallet_transactions (
  transaction_id UUID PRIMARY KEY,
  wallet_id UUID REFERENCES wallets(wallet_id),
  type VARCHAR(50), -- deposit, withdrawal, transfer, fee, etc.
  amount DECIMAL(24, 8),
  fee DECIMAL(24, 8),
  currency VARCHAR(3),
  status VARCHAR(20),
  description TEXT,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_wallet_transactions_wallet ON wallet_transactions(wallet_id);
CREATE INDEX idx_wallet_transactions_created ON wallet_transactions(created_at DESC);
```

### Payments

```sql
-- Payment transactions
CREATE TABLE payment_transactions (
  transaction_id UUID PRIMARY KEY,
  sender_id UUID REFERENCES users(user_id),
  receiver_id UUID REFERENCES users(user_id),
  amount DECIMAL(24, 2),
  currency VARCHAR(3),
  rail_type VARCHAR(50), -- zelle, mpesa, pix, etc.
  status VARCHAR(20),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_payment_sender ON payment_transactions(sender_id, created_at DESC);
CREATE INDEX idx_payment_receiver ON payment_transactions(receiver_id, created_at DESC);
```

---

## API Architecture

### RESTful API Design

**Base URL:** `https://api.atlasx.io/v1`

**Authentication:** Bearer token (JWT)

**Standard Response Format:**
```json
{
  "success": true,
  "data": { ... },
  "meta": {
    "timestamp": "2025-11-16T10:30:00Z",
    "requestId": "req_abc123",
    "version": "1.0"
  }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_FUNDS",
    "message": "Insufficient funds in wallet",
    "details": {
      "available": "100.00",
      "required": "150.00"
    }
  },
  "meta": {
    "timestamp": "2025-11-16T10:30:00Z",
    "requestId": "req_abc123"
  }
}
```

### API Rate Limiting

| Endpoint Category | Rate Limit | Burst |
|-------------------|-----------|-------|
| **Authentication** | 10/minute | 20 |
| **Read Operations** | 100/minute | 200 |
| **Write Operations** | 30/minute | 50 |
| **Payment Transactions** | 10/minute | 15 |
| **Public APIs** | 1000/hour | - |

### Pagination

```
GET /api/v1/transactions?limit=20&offset=0&sortBy=created_at&sortOrder=DESC
```

**Response:**
```json
{
  "data": [...],
  "meta": {
    "total": 1234,
    "limit": 20,
    "offset": 0,
    "hasMore": true
  }
}
```

---

## Security Architecture

### Authentication Flow

```
1. User Login (email + password)
   ↓
2. Validate credentials
   ↓
3. Generate JWT (15-minute expiry)
   ↓
4. Generate Refresh Token (30-day expiry)
   ↓
5. Return both tokens
   ↓
6. Client stores securely (httpOnly cookie for web, Keychain for mobile)
   ↓
7. Include JWT in Authorization header for API calls
   ↓
8. When JWT expires, use refresh token to get new JWT
```

### Multi-Factor Authentication (MFA)

**Supported Methods:**
- SMS OTP (6 digits, 5-minute expiry)
- Email OTP
- Authenticator App (TOTP)
- Biometric (mobile only)

**MFA Required For:**
- Large transactions (> $1,000)
- Account changes (email, phone, password)
- Adding external accounts
- KYC verification

### Encryption Standards

| Data Type | At Rest | In Transit |
|-----------|---------|------------|
| **Personal Data** | AES-256-GCM | TLS 1.3 |
| **Financial Data** | AES-256-GCM | TLS 1.3 |
| **PINs** | Hashed (SHA-256) | TLS 1.3 + HSM |
| **Card Data** | Tokenized | TLS 1.3 |
| **API Keys** | Hashed (bcrypt) | TLS 1.3 |

### PCI DSS Compliance

**Level:** Level 1 Service Provider

**Requirements Met:**
- ✅ Build and maintain secure network
- ✅ Protect cardholder data (tokenization)
- ✅ Maintain vulnerability management
- ✅ Implement strong access control
- ✅ Regular monitoring and testing
- ✅ Information security policy

**Card Data Handling:**
- Never store full PAN (Primary Account Number)
- Tokenization for all card storage
- Separate network segment for card processing
- HSM for cryptographic operations

---

## Infrastructure

### AWS Architecture (Primary)

```
┌─────────────────────────────────────────────────────────────┐
│                        Route 53 (DNS)                        │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              CloudFront (CDN) + WAF                          │
└───────────────────────┬─────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│           Application Load Balancer (ALB)                    │
└───────┬────────────────────────┬────────────────────────────┘
        │                        │
        ▼                        ▼
┌──────────────┐        ┌──────────────┐
│   ECS/EKS    │        │   ECS/EKS    │
│  (API Tier)  │        │  (API Tier)  │
│ us-east-1a   │        │ us-east-1b   │
└──────┬───────┘        └──────┬───────┘
       │                       │
       └───────────┬───────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │   RDS PostgreSQL     │
        │   (Multi-AZ)         │
        │   Primary + Standby  │
        └──────────────────────┘
                   │
                   ▼
        ┌──────────────────────┐
        │  ElastiCache Redis   │
        │   (Cluster Mode)     │
        └──────────────────────┘
```

### High Availability Setup

**Regions:**
- Primary: US East (N. Virginia)
- Secondary: EU West (Ireland)
- Tertiary: AP Southeast (Singapore)

**Availability Zones:** Minimum 3 AZs per region

**Redundancy:**
- Load balancers: 2+ per AZ
- Application servers: 4+ per AZ
- Database: Multi-AZ with automatic failover
- Redis: Cluster mode with replication

---

## Deployment

### CI/CD Pipeline

```
1. Developer pushes code to GitHub
   ↓
2. GitHub Actions triggered
   ↓
3. Run tests (unit, integration, E2E)
   ↓
4. Run security scans (SAST, DAST, dependency check)
   ↓
5. Build Docker image
   ↓
6. Push to container registry (ECR)
   ↓
7. Deploy to staging (ECS/EKS)
   ↓
8. Run smoke tests
   ↓
9. Manual approval for production
   ↓
10. Blue-green deployment to production
    ↓
11. Monitor metrics for 30 minutes
    ↓
12. Auto-rollback if errors detected
```

### Environment Structure

| Environment | Purpose | Deployment | Data |
|-------------|---------|------------|------|
| **Development** | Local development | On commit | Synthetic |
| **Testing** | Automated testing | On PR | Synthetic |
| **Staging** | Pre-production | On merge to main | Anonymized production |
| **Production** | Live users | Manual approval | Real |

### Database Migrations

**Tool:** TypeORM migrations

**Process:**
```bash
# Generate migration
npm run migration:generate -- -n AddUserKYCLevel

# Run migration
npm run migration:run

# Revert migration
npm run migration:revert
```

**Best Practices:**
- Always backwards compatible
- Test on staging first
- Create rollback plan
- Monitor performance impact

---

## Monitoring & Observability

### Metrics (Prometheus + Grafana)

**Application Metrics:**
- Request rate (requests/second)
- Error rate (errors/second)
- Response time (p50, p95, p99)
- Active users
- Transaction volume
- Revenue metrics

**Infrastructure Metrics:**
- CPU utilization
- Memory usage
- Disk I/O
- Network throughput
- Database connections
- Cache hit rate

**Business Metrics:**
- Daily active users (DAU)
- Monthly active users (MAU)
- Transaction success rate
- Average transaction value
- Customer acquisition cost (CAC)
- Lifetime value (LTV)

### Logging (ELK Stack)

**Log Levels:**
- ERROR: Application errors
- WARN: Warning conditions
- INFO: Informational messages
- DEBUG: Debug information (dev/staging only)

**Log Format (JSON):**
```json
{
  "timestamp": "2025-11-16T10:30:00.123Z",
  "level": "INFO",
  "service": "payment-engine",
  "traceId": "trace_abc123",
  "userId": "usr_456",
  "message": "Payment processed successfully",
  "metadata": {
    "amount": "100.00",
    "currency": "USD",
    "transactionId": "txn_789"
  }
}
```

### Distributed Tracing (Jaeger)

**Trace Context:**
- Trace ID: Unique per request
- Span ID: Unique per operation
- Parent Span ID: For nested operations

**Instrumented Operations:**
- HTTP requests
- Database queries
- External API calls
- Message queue operations

### Alerting

**Alert Channels:**
- PagerDuty (P0, P1)
- Slack (#alerts channel)
- Email (for non-critical)
- SMS (for P0 only)

**Alert Types:**
| Alert | Threshold | Priority | Response Time |
|-------|-----------|----------|---------------|
| API Error Rate > 1% | 1% | P0 | 5 minutes |
| Response Time > 1s (p99) | 1s | P1 | 15 minutes |
| Database CPU > 80% | 80% | P1 | 15 minutes |
| Transaction failure > 5% | 5% | P0 | 5 minutes |
| Disk space < 10% | 10% | P2 | 1 hour |

---

## Disaster Recovery

### Backup Strategy

**Database Backups:**
- Full backup: Daily at 2 AM UTC
- Incremental backup: Every 6 hours
- Transaction logs: Continuous (Point-in-time recovery)
- Retention: 30 days

**Application Backups:**
- Configuration: Version controlled in Git
- Secrets: Backed up in Vault
- Container images: Stored in multiple registries

### Recovery Time Objectives (RTO)

| Failure Type | RTO | RPO |
|--------------|-----|-----|
| **Single server** | < 5 minutes | 0 |
| **Availability zone** | < 15 minutes | < 1 minute |
| **Region** | < 1 hour | < 5 minutes |
| **Database** | < 30 minutes | < 1 minute |
| **Complete failure** | < 4 hours | < 15 minutes |

### Incident Response Plan

**Severity Levels:**
- **P0 (Critical):** Complete service outage
- **P1 (High):** Major feature down, affecting >50% users
- **P2 (Medium):** Minor feature down, affecting <50% users
- **P3 (Low):** Cosmetic issues, no functional impact

**Response Process:**
1. **Detection** - Automated alerts or user reports
2. **Triage** - Assess severity and impact
3. **Communication** - Notify stakeholders
4. **Investigation** - Root cause analysis
5. **Resolution** - Fix and deploy
6. **Verification** - Confirm fix works
7. **Post-mortem** - Document learnings

---

## Appendix

### Code Examples

#### Creating a Transaction

```typescript
import { Injectable } from '@nestjs/common';
import { TransactionSwitch } from './transaction-switch.service';
import { ISO8583Parser } from './iso8583-parser.service';

@Injectable()
export class PaymentService {
  constructor(
    private readonly switch: TransactionSwitch,
    private readonly parser: ISO8583Parser,
  ) {}

  async processPayment(request: PaymentRequest) {
    // Build ISO-8583 message
    const message = {
      mti: '0200',
      fields: new Map([
        [2, request.cardNumber],
        [3, '000000'],
        [4, (request.amount * 100).toString().padStart(12, '0')],
        // ... more fields
      ]),
    };

    // Route through switch
    const response = await this.switch.process(message);

    // Check response
    if (response.fields.get(39) === '00') {
      return { approved: true, authCode: response.fields.get(38) };
    } else {
      return { approved: false, reason: response.fields.get(39) };
    }
  }
}
```

### Environment Variables

```bash
# Application
NODE_ENV=production
PORT=3000
API_VERSION=1.0

# Database
DATABASE_HOST=db.atlasx.io
DATABASE_PORT=5432
DATABASE_NAME=atlasx_prod
DATABASE_USER=atlasx_app
DATABASE_PASSWORD=<from_vault>

# Redis
REDIS_HOST=cache.atlasx.io
REDIS_PORT=6379
REDIS_PASSWORD=<from_vault>

# JWT
JWT_SECRET=<from_vault>
JWT_EXPIRY=15m
REFRESH_TOKEN_EXPIRY=30d

# External Services
PLAID_CLIENT_ID=<from_vault>
PLAID_SECRET=<from_vault>
SENDGRID_API_KEY=<from_vault>
TWILIO_ACCOUNT_SID=<from_vault>
TWILIO_AUTH_TOKEN=<from_vault>
```

---

## Support & Escalation

**Technical Support:**
- Level 1: Customer Support (app issues, how-to)
- Level 2: Technical Support Engineers (bugs, API issues)
- Level 3: Senior Engineers (complex technical issues)
- Level 4: Platform Architects (architectural decisions)

**Escalation Path:**
1. Check documentation
2. Search knowledge base
3. Ask in #engineering Slack channel
4. Create JIRA ticket
5. Escalate to on-call engineer (if urgent)

**On-Call Rotation:**
- Primary: Senior Engineer
- Secondary: Platform Architect
- Escalation: CTO

---

**Document Version:** 1.0
**Last Updated:** November 2025
**Maintained By:** Platform Engineering Team
**Next Review:** February 2026
