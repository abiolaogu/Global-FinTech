# AtlasX Architecture Overview

## Executive Summary

AtlasX is a global financial operating system designed to provide comprehensive fintech services including multi-currency accounts, foreign exchange, payment cards, trading capabilities, cryptocurrency services, and marketplace features. This document outlines the high-level architecture, domain model, and technical design decisions.

**Version:** 1.0
**Date:** 2025-11-14
**Status:** Initial Design

---

## 1. Architectural Approach: Hybrid Model

### 1.1 Strategy

**Choice: Hybrid – Modular Monolith Core + Strategic Microservices**

#### Justification

- **Modular Monolith Core** for tightly-coupled financial primitives (Customer, KYC, Accounts, Ledger, Payments) ensures ACID transactional integrity, simpler deployment at MVP stage, and faster development velocity with shared domain models.

- **Microservices** for domains with distinct scaling profiles, external dependencies, or regulatory isolation requirements (Trading, Crypto, Marketplace, Cards) allow independent deployment, technology flexibility, and failure isolation.

- **Benefits:**
  - Reduces operational complexity vs. full microservices
  - Avoids distributed transaction overhead for core accounting
  - Preserves autonomy for high-risk or high-growth domains
  - Supports incremental decomposition as the platform matures

### 1.2 Technology Stack

**Backend:**
- Runtime: Node.js 20+ LTS
- Framework: NestJS (TypeScript-first, enterprise-grade)
- API Style: REST with OpenAPI 3.1 documentation
- Validation: class-validator, class-transformer

**Data Layer:**
- Primary DB: PostgreSQL 15+ (ACID compliance)
- Cache: Redis 7+ (sessions, rate limiting, pub/sub)
- Message Queue: Redis Pub/Sub (MVP), migrate to Kafka/RabbitMQ for scale

**Frontend:**
- Mobile: Flutter 3+ (single codebase for iOS, Android, Web)
- Admin Portal: Next.js + TypeScript (if needed)

**Infrastructure:**
- Local: Docker Compose
- Staging/Prod: Kubernetes with Helm charts
- CI/CD: GitHub Actions
- IaC: Terraform (optional for cloud resources)

**Security:**
- Authentication: JWT (access + refresh tokens)
- Authorization: RBAC with role-based guards
- Input Validation: DTO validation at API boundary
- Rate Limiting: Token bucket algorithm via Redis
- Dependency Scanning: Snyk, Dependabot
- Container Scanning: Trivy

---

## 2. Domain Breakdown

### 2.1 Core Financial Monolith

The core monolith is a single NestJS application structured into domain modules with clear boundaries. Each module owns its database tables and exposes well-defined interfaces.

#### 2.1.1 Customer & KYC Domain

**Responsibilities:**
- User identity and profile management
- Multi-jurisdiction KYC workflows
- Document verification and compliance
- User lifecycle management (pending → verified → suspended → closed)

**Key Integrations:**
- Third-party KYC providers (Onfido, Jumio, Sumsub)
- Sanctions screening APIs (Chainalysis, ComplyAdvantage)

**Events Published:**
- `UserRegistered`
- `KYCSubmitted`
- `KYCApproved`
- `KYCRejected`
- `UserSuspended`

#### 2.1.2 Accounts & Ledger Domain

**Responsibilities:**
- Multi-currency account management
- Double-entry bookkeeping for all financial movements
- Balance calculations and history
- Immutability guarantees for audit trails
- Cross-currency account linking

**Design Principles:**
- Every financial movement creates paired debit/credit entries
- Entries are immutable (insert-only)
- Running balance snapshots for performance
- Idempotency via transaction references

**Events Published:**
- `AccountCreated`
- `AccountFrozen`
- `BalanceUpdated`
- `LedgerEntryRecorded`

#### 2.1.3 Payments Domain

**Responsibilities:**
- Orchestrate P2P transfers, bill payments, wallet top-ups
- Integration with payment rails (SWIFT, SEPA, ACH, mobile money)
- Settlement workflows and reconciliation
- Idempotency and retry logic
- Fee calculation and application

**Payment Flow:**
1. Validate payment request (balance, limits, compliance)
2. Reserve funds (create pending ledger entries)
3. Submit to payment rail
4. Handle webhook/callback
5. Finalize ledger entries (complete or reverse)

**Events Published:**
- `PaymentInitiated`
- `PaymentCompleted`
- `PaymentFailed`
- `PaymentReversed`

---

### 2.2 Strategic Microservices

#### 2.2.1 Cards Service

**Responsibilities:**
- Issue and manage physical/virtual payment cards
- Card lifecycle (pending, active, frozen, cancelled)
- Spending limits and controls
- Tokenization and PCI compliance
- Authorization callbacks from processors

**Key Integrations:**
- Card processors (Marqeta, Stripe Issuing, Adyen)
- Card networks (Visa, Mastercard)

**Technology:**
- NestJS microservice
- PostgreSQL for card metadata
- Redis for real-time authorization caching

**Events Published:**
- `CardIssued`
- `CardActivated`
- `CardTransactionAuthorized`
- `CardTransactionSettled`
- `CardFrozen`

#### 2.2.2 Trading Service

**Responsibilities:**
- Execute buy/sell orders for stocks, FX, and crypto
- Order routing and execution
- Portfolio position management
- Market data integration
- Support for future copy-trading and managed portfolios

**Key Integrations:**
- Brokers (Alpaca, Interactive Brokers, DriveWealth)
- Market data providers (Polygon.io, Alpha Vantage)
- Price feeds (Twelve Data, Yahoo Finance)

**Technology:**
- NestJS microservice
- PostgreSQL for orders and positions
- Redis for market data caching
- WebSocket for real-time price feeds

**Events Published:**
- `OrderPlaced`
- `OrderExecuted`
- `OrderCancelled`
- `PositionUpdated`

#### 2.2.3 Crypto Service

**Responsibilities:**
- Cryptocurrency wallet management (custodial/non-custodial)
- On/off-ramp via exchanges
- Blockchain transaction monitoring
- Multi-chain support (BTC, ETH, stablecoins)
- Regulatory compliance and address screening

**Key Integrations:**
- Custody providers (Fireblocks, BitGo, Copper)
- Exchanges (Circle, Coinbase, Binance)
- Blockchain nodes (Infura, Alchemy, QuickNode)

**Technology:**
- NestJS microservice
- PostgreSQL for wallet metadata
- Redis for transaction caching
- External blockchain indexers

**Security:**
- HSM/KMS for key management
- Multi-sig wallets
- Withdrawal allowlisting
- Address screening (Chainalysis, Elliptic)

**Events Published:**
- `CryptoWalletCreated`
- `CryptoDepositDetected`
- `CryptoWithdrawalInitiated`
- `CryptoWithdrawalCompleted`

#### 2.2.4 Marketplace Service

**Responsibilities:**
- Merchant directory and product catalogs
- Travel bookings (flights, hotels, car rentals)
- Insurance products
- Affiliate commission tracking
- Purchase processing and fulfillment

**Key Integrations:**
- Travel APIs (Amadeus, Skyscanner, Booking.com)
- Insurance providers (Cover Genius, Qover)
- Merchant aggregators

**Technology:**
- NestJS microservice
- PostgreSQL for catalog and orders
- Redis for search caching

**Events Published:**
- `ProductPurchased`
- `BookingConfirmed`
- `InsurancePolicyIssued`

#### 2.2.5 Rewards & Loyalty Service

**Responsibilities:**
- Track user activity and reward-eligible events
- Calculate reward points and multipliers
- Manage redemption catalogs
- Tiered benefits and qualification logic
- Gamification and referral programs

**Events Consumed:**
- `PaymentCompleted`
- `CardTransactionSettled`
- `TradeExecuted`
- `UserReferred`

**Events Published:**
- `RewardPointsAccrued`
- `RewardPointsRedeemed`
- `TierUpgraded`
- `TierDowngraded`

**Technology:**
- NestJS microservice
- PostgreSQL for points and tiers
- Redis for leaderboards

---

### 2.3 Platform & Future-Aware Services

#### 2.3.1 AI & Analytics Engine

**MVP Scope (Lightweight):**
- Aggregate user financial data for insights
- Spending pattern analysis
- Basic savings recommendations

**Future Capabilities:**
- AI copilot for budgeting and financial advice
- Anomaly detection for fraud prevention
- ML models for credit/risk scoring
- Personalized product recommendations

**Technology:**
- Python FastAPI for ML services
- PostgreSQL for feature store
- ClickHouse for analytics (optional)
- OpenAI API, Anthropic Claude API for LLM features

#### 2.3.2 API Gateway & Developer Platform

**Responsibilities:**
- Expose public REST APIs for partners
- OAuth2 authentication for third-party apps
- Rate limiting and quota management
- Usage analytics and billing
- Webhook management
- Sandbox environments for testing

**Features:**
- API key management
- OpenAPI documentation portal
- SDK generation (TypeScript, Python, Java)
- Developer onboarding and self-service

**Technology:**
- Kong Gateway or NestJS custom gateway
- Redis for rate limiting
- PostgreSQL for API keys and usage logs

---

## 3. Inter-Service Communication

### 3.1 Synchronous Communication (REST)

**Use Cases:**
- Frontend ↔ API Gateway: All client requests
- Gateway ↔ Services: Read-heavy operations (balance queries, transaction history)
- Core Monolith Internal: In-process function calls (leverages DB transactions)

**Protocols:**
- REST over HTTPS/TLS 1.3
- JSON payloads
- OpenAPI 3.1 specifications

**Patterns:**
- Request/Response
- Circuit breakers (Resilience4j patterns in NestJS)
- Timeouts and retries
- Correlation IDs for tracing

### 3.2 Asynchronous Communication (Event-Driven)

**Use Cases:**
- Cross-service workflows (KYC → Account activation)
- Eventual consistency (Trading → Ledger)
- Analytics and audit trails
- Notifications and side effects

**Event Bus:**
- MVP: Redis Pub/Sub
- Scale: Kafka or RabbitMQ

**Event Schema:**
```typescript
interface DomainEvent {
  eventId: string;           // UUID
  eventType: string;         // e.g., "PaymentCompleted"
  aggregateId: string;       // Entity ID
  aggregateType: string;     // e.g., "Payment"
  payload: object;           // Event-specific data
  metadata: {
    userId?: string;
    timestamp: Date;
    correlationId: string;
    causationId?: string;
  };
}
```

**Patterns:**
- Publish/Subscribe
- Event Sourcing (optional for critical domains)
- Saga Pattern for distributed transactions
- Idempotency keys to prevent duplicate processing

### 3.3 Data Consistency Strategy

**Strong Consistency:**
- Core monolith uses PostgreSQL transactions
- ACID guarantees for ledger and account operations

**Eventual Consistency:**
- Microservices sync via events
- Idempotency keys prevent duplicates
- Compensating transactions for failures
- Saga orchestration for multi-step workflows

**Example Saga: Card Issuance**
1. Reserve fees from wallet (Ledger)
2. Call card processor API (Cards Service)
3. On success: finalize ledger entry
4. On failure: reverse ledger entry (compensation)

---

## 4. Cross-Cutting Concerns

### 4.1 Authentication & Authorization

**Authentication:**
- JWT access tokens (short-lived, 15 min)
- JWT refresh tokens (long-lived, 7 days, stored in httpOnly cookies)
- Token rotation on refresh
- Device fingerprinting for fraud detection

**Authorization:**
- Role-based access control (RBAC)
- Roles: User, Admin, Compliance, Support, Partner
- Guards and decorators in NestJS (`@Roles()`, `@RequireKYC()`)

**Multi-Factor Authentication:**
- TOTP (Authenticator apps)
- SMS OTP (fallback)
- Email verification
- Biometrics (mobile-native)

### 4.2 Observability

**Logging:**
- Structured logging (JSON format)
- Centralized: ELK Stack (Elasticsearch, Logstash, Kibana) or Loki
- Correlation IDs across requests

**Metrics:**
- Prometheus for time-series metrics
- Grafana dashboards (business + technical metrics)
- RED metrics (Rate, Errors, Duration)
- Business metrics (signups, transactions, revenue)

**Tracing:**
- OpenTelemetry instrumentation
- Jaeger or Tempo for distributed tracing

**Alerting:**
- AlertManager + PagerDuty
- SLO/SLI monitoring
- Error budget tracking

### 4.3 Data Residency & Compliance

**Data Residency:**
- PostgreSQL schemas partitioned by region
- Data replication strategies for multi-region
- GDPR compliance (right to erasure, data portability)

**Compliance:**
- AML/CFT transaction monitoring
- Sanctions screening (OFAC, EU, UN lists)
- Audit trails for all sensitive operations
- Regulatory reporting (FINTRAC, FCA, MAS, etc.)

### 4.4 Failure Handling

**Patterns:**
- Circuit breakers for external APIs
- Retry with exponential backoff
- Fallback strategies
- Dead-letter queues for failed events
- Health checks (liveness, readiness)

**Disaster Recovery:**
- Database backups (daily full, hourly incremental)
- Point-in-time recovery (PITR)
- Multi-region failover
- RTO: 4 hours, RPO: 1 hour

---

## 5. Security Architecture

### 5.1 Application Security

**Input Validation:**
- DTO validation at API boundary
- Whitelist approach (reject unknown fields)
- Sanitization for SQL injection, XSS

**Output Encoding:**
- Context-aware encoding (HTML, JSON, URL)

**Sensitive Data:**
- PII encryption at rest (database-level)
- PAN tokenization (card numbers)
- PII masking in logs

### 5.2 Network Security

**API Gateway:**
- Rate limiting (per user, per IP)
- CORS policies
- DDoS protection (Cloudflare, AWS Shield)
- WAF rules (OWASP Top 10)

**Service-to-Service:**
- mTLS for service mesh (optional: Istio, Linkerd)
- API keys for internal services
- Network policies (Kubernetes)

### 5.3 Secrets Management

**Tools:**
- HashiCorp Vault or AWS Secrets Manager
- Kubernetes Secrets (encrypted at rest)

**Practices:**
- Rotate secrets regularly
- Least privilege access
- Audit secret usage

### 5.4 Vulnerability Management

**Dependency Scanning:**
- Snyk, npm audit
- Automated PRs for updates

**Container Scanning:**
- Trivy, Clair
- Base image hardening (distroless, Alpine)

**Penetration Testing:**
- Annual external pentests
- Bug bounty program (HackerOne, Bugcrowd)

---

## 6. Deployment Architecture

### 6.1 Local Development

**Docker Compose:**
- PostgreSQL
- Redis
- All services (monolith + microservices)
- Mock external APIs
- Seeded demo data

### 6.2 Staging Environment

**Kubernetes Cluster:**
- Namespace isolation per environment
- Helm charts for deployments
- ConfigMaps and Secrets
- Ingress controller (NGINX, Traefik)

**External Services:**
- Staging payment processors
- Sandbox KYC providers
- Test card networks

### 6.3 Production Environment

**Multi-Region Setup:**
- Primary: us-east-1 (AWS) or europe-west1 (GCP)
- Secondary: eu-west-1 or asia-southeast1
- Active-active or active-passive

**High Availability:**
- Multiple replicas per service
- Load balancing (ALB, NGINX)
- Database read replicas
- Redis Cluster

**Scaling:**
- Horizontal Pod Autoscaling (HPA)
- Vertical Pod Autoscaling (VPA)
- Cluster Autoscaler

### 6.4 CI/CD Pipeline

**Stages:**
1. **Build:** TypeScript compilation, linting
2. **Test:** Unit, integration, e2e tests
3. **Security:** Dependency scan, SAST, container scan
4. **Package:** Docker image build + sign (Cosign)
5. **Deploy:** Helm chart update, ArgoCD sync (GitOps)
6. **Verify:** Smoke tests, health checks

**Deployment Strategy:**
- Canary deployments (10% → 50% → 100%)
- Blue-green for databases
- Automated rollback on error rate spike

---

## 7. Data Architecture

### 7.1 Database Schema Principles

**Normalization:**
- 3NF for transactional data
- Denormalization for read-heavy tables (with sync via events)

**Indexing:**
- B-tree indexes for equality/range queries
- Partial indexes for filtered queries
- Covering indexes for query optimization

**Partitioning:**
- Range partitioning by date (for ledger_entries, payments)
- Hash partitioning by user_id (for scaling)

**Soft Deletes:**
- `deleted_at` timestamp for audit trail
- Exclude in default queries via scope

### 7.2 Caching Strategy

**Cache Layers:**
1. **Application Cache:** In-memory (Node.js Map, LRU)
2. **Distributed Cache:** Redis (shared across instances)
3. **CDN Cache:** CloudFront, Fastly (for static assets, API responses)

**Cache Invalidation:**
- Time-based (TTL)
- Event-based (publish cache invalidation events)
- Versioned keys (avoid stale reads)

### 7.3 Data Migration

**Schema Migrations:**
- TypeORM or Prisma migrations
- Versioned migration files
- Blue-green deployment for zero downtime

**Data Backfills:**
- Batch processing (avoid locking)
- Incremental with checkpoints

---

## 8. Testing Strategy

### 8.1 Test Pyramid

**Unit Tests (70%):**
- Pure functions, business logic
- Mocked dependencies
- Fast execution (<1s per test)

**Integration Tests (20%):**
- Database interactions
- External API mocks (MSW, WireMock)
- In-memory test databases (PostgreSQL testcontainers)

**End-to-End Tests (10%):**
- Critical user flows
- Full stack (frontend + backend)
- Cypress, Playwright for web
- Detox, Maestro for mobile

### 8.2 Test Data Management

**Factories:**
- faker.js for realistic data
- Factory pattern (UserFactory, PaymentFactory)

**Fixtures:**
- Seed data for known scenarios
- Reset database state between tests

### 8.3 Performance Testing

**Load Testing:**
- k6, Artillery, Gatling
- Simulate realistic traffic patterns
- Identify bottlenecks (database, API)

**Stress Testing:**
- Push beyond capacity
- Measure graceful degradation

---

## 9. Monitoring & SLOs

### 9.1 Service Level Objectives

**Availability:**
- 99.9% uptime for core services (43 min downtime/month)
- 99.5% for non-critical services

**Latency:**
- p50: <100ms
- p95: <300ms
- p99: <1000ms

**Error Rate:**
- <0.1% for critical endpoints
- <1% for non-critical endpoints

### 9.2 Key Metrics

**Business Metrics:**
- Daily active users (DAU)
- Transaction volume and value
- Revenue (by product line)
- Customer acquisition cost (CAC)

**Technical Metrics:**
- Request rate (req/s)
- Error rate (%)
- Response time (ms)
- Database query time
- Cache hit rate

**Operational Metrics:**
- CPU and memory usage
- Disk I/O
- Network throughput
- Pod restart count

---

## 10. Future Enhancements

### 10.1 Copy Trading

**Design:**
- Leader/follower model
- Real-time position mirroring
- Proportional allocation based on follower balance
- Risk management (max loss, max exposure)

### 10.2 Managed Portfolios

**Design:**
- Pre-configured asset allocations (conservative, balanced, aggressive)
- Automatic rebalancing
- Tax-loss harvesting
- Goal-based investing

### 10.3 AI Money Copilot

**Features:**
- Conversational interface (chatbot)
- Spending insights and recommendations
- Bill negotiation
- Savings optimization
- Investment advice

### 10.4 Global Expansion

**Regional Considerations:**
- Localization (language, currency, payment methods)
- Regulatory compliance per jurisdiction
- Local payment rails (Pix, UPI, Alipay)
- Cultural customization (UI/UX)

---

## 11. Appendix

### 11.1 Technology Decisions

| Decision | Rationale |
|----------|-----------|
| NestJS | TypeScript-first, modular, enterprise-ready, large ecosystem |
| PostgreSQL | ACID compliance, mature, feature-rich, JSON support |
| Redis | Fast, versatile (cache, pub/sub, sessions), proven at scale |
| Flutter | Single codebase, native performance, strong ecosystem |
| Docker + K8s | Industry standard, portability, scalability |

### 11.2 Glossary

- **ACID:** Atomicity, Consistency, Isolation, Durability
- **RBAC:** Role-Based Access Control
- **SLO/SLI:** Service Level Objective/Indicator
- **RTO/RPO:** Recovery Time/Point Objective
- **DTO:** Data Transfer Object
- **JWT:** JSON Web Token
- **KYC:** Know Your Customer
- **AML/CFT:** Anti-Money Laundering / Combating Financing of Terrorism

### 11.3 References

- NestJS Documentation: https://docs.nestjs.com
- PostgreSQL Documentation: https://www.postgresql.org/docs/
- OpenAPI Specification: https://swagger.io/specification/
- Twelve-Factor App: https://12factor.net/
- Domain-Driven Design (DDD): Eric Evans
- Building Microservices: Sam Newman

---

**Document End**
