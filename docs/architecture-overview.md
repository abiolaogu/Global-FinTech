# Architecture Overview -- Global FinTech Platform

## 1. Introduction

Global FinTech (codename AtlasX) is a Revolut-class multi-currency fintech platform that combines core banking via Apache Fineract 1.9+, payment switching via JPOS/j8583, blockchain attestation via Hyperledger Fabric 2.5+, and modern API services built with NestJS, Go, and Python. This document provides the definitive architectural reference for the entire system.

---

## 2. System Context (C4 Level 1)

```
                          +------------------+
                          |   End Users      |
                          | (Mobile/Web/API) |
                          +--------+---------+
                                   |
                          +--------v---------+
                          |   CDN / WAF      |
                          | (Cloudflare)     |
                          +--------+---------+
                                   |
                          +--------v---------+
                          |   API Gateway    |
                          | (Kong / Nginx)   |
                          +--------+---------+
                                   |
                 +-----------------+-----------------+
                 |                 |                 |
          +------v------+  +------v------+  +------v------+
          | AtlasX API  |  | RegAI       |  | AI Advisor  |
          | (NestJS)    |  | (Python)    |  | (Python)    |
          +------+------+  +------+------+  +------+------+
                 |                 |                 |
          +------v------+  +------v------+         |
          | Fineract    |  | OPA Engine  |         |
          | (Java/      |  | (Policy     |         |
          |  Spring)    |  |  Decisions) |         |
          +------+------+  +-------------+         |
                 |                                  |
          +------v------+                          |
          | JPOS Switch |                          |
          | (ISO-8583)  |                          |
          +------+------+                          |
                 |                                  |
    +------------+------------+                    |
    |            |            |                    |
+---v---+ +-----v----+ +----v-----+  +-----------v-----------+
|Postgre| |  Redis   | | Kafka    |  | Hyperledger Fabric    |
|SQL 15+| |  7+      | | /Redpanda|  | (Audit/Attestation)   |
+-------+ +----------+ +----------+  +------------------------+
```

---

## 3. Container Diagram (C4 Level 2)

### 3.1 AtlasX API (NestJS)

The core API is a modular monolith built with NestJS (TypeScript) that currently exposes three production-active modules behind the `CORE_API_ENABLED` feature flag:

- **WalletsModule**: Multi-currency wallet CRUD, credit/debit, transfers, holds
- **SplitPaymentsModule**: Percentage/fixed/hybrid payment splits, saved configurations
- **PaymentGatewaysModule**: Unified interface to 8+ payment providers (Paystack, Flutterwave, Stripe, Razorpay, PayMongo, Khalti, Mercado Pago, PayU)

Additional modules under development:
- InvestmentsModule: Investment marketplace with company portal
- AIChatModule: Natural language financial assistant
- ROSCAModule: Rotating savings and credit associations
- P2PLendingModule: Peer-to-peer lending platform
- OpenBankingModule: PSD2/CFPB account aggregation
- OAuth2Module: Partner API authentication

### 3.2 RegAI Service (Python FastAPI)

Regulatory intelligence engine that provides:
- `/v1/decision`: OPA-backed policy decisions for transactions (ALLOW/DENY/STEP_UP)
- `/v1/screen/sanctions`: Sanctions screening against OFAC, EU, UN lists
- `/v1/case`: Compliance case management
- `/v1/report/sar`: LLM-assisted SAR/STR narrative drafting

Detector configurations exist for multiple jurisdictions:
- `hk_structuring_v1.yaml` (Hong Kong)
- `au_velocity_v1.yaml` (Australia)
- `ke_agent_float_anom_v1.yaml` (Kenya)
- `ca_velocity_interac_v1.yaml` (Canada/Interac)

### 3.3 AI Advisor Service (Python)

Financial advisory microservice using LLM inference for:
- Portfolio recommendations
- Risk assessment explanations
- Financial literacy guidance
- Configurable model backend (mock/production toggle via `MODEL_TYPE`)

### 3.4 Apache Fineract (Target)

Core banking engine providing:
- Multi-tenant account management
- Loan origination and servicing
- Savings product management
- Real-time double-entry accounting
- REST APIs with OpenAPI documentation
- Java 17+ / Spring Boot 3.x runtime

### 3.5 JPOS Payment Switch (Target)

ISO-8583 compliant payment processing:
- Acquirer module: Card network connections (Visa, Mastercard, local schemes)
- Issuer module: Card issuance, authorization, settlement
- Gateway module: Transaction routing and switching
- QSP module: Query and settlement processing

---

## 4. Data Architecture

### 4.1 Primary Data Store (PostgreSQL 15+)

Active tables in production schema:
- `wallets` -- User wallet accounts with multi-currency support
- `wallet_transactions` -- All wallet credit/debit records
- `wallet_holds` -- Payment authorization holds
- `split_payments` -- Split payment execution records
- `split_configurations` -- Saved split rules
- `virtual_accounts` -- Provider-issued virtual account numbers
- `virtual_account_transactions` -- Inbound payment records
- `payment_gateways` -- Gateway configuration and credentials
- `payment_transactions` -- Payment initiation and verification records
- `payment_links` -- Shareable payment link metadata
- `recurring_payments` -- Subscription and recurring billing records

Database configuration:
- Connection pooling: max 100 connections per pod, 10 minimum
- SSL mode: require (production), disable (development)
- 40+ indexes for optimised query performance
- Pessimistic locking for wallet balance operations
- Time-based partitioning planned for transaction tables

### 4.2 Cache Layer (Redis 7+)

- Wallet balance caching (30s TTL)
- FX rate caching (5m TTL)
- Session management
- Rate limiting counters (token bucket)
- Gateway configuration caching

### 4.3 Event Backbone (Kafka/Redpanda -- Target)

Event topics:
- `wallet.created`, `wallet.credited`, `wallet.debited`, `wallet.transfer_completed`
- `payment.initiated`, `payment.verified`, `payment.failed`
- `split_payment.processed`, `split_payment.completed`
- `virtual_account.created`, `virtual_account.payment_received`
- `recurring_payment.created`, `recurring_payment.processed`

Currently implemented via EventEmitter2 (in-process); migration to Kafka planned for cross-service communication.

---

## 5. Deployment Architecture

### 5.1 Kubernetes (Rancher Fleet)

Production deployment uses Rancher Fleet for GitOps-driven Helm releases:

```
infra/fleet/fleet.yaml
  -> infra/helm/atlasx/  (Helm chart)
  -> values/common.yaml  (shared configuration)
  -> values/production.yaml (production overrides)
  -> values/staging.yaml (staging overrides)
```

Key Helm values:
- `replicaCount: 3` (minimum)
- `autoscaling.maxReplicas: 20`
- `autoscaling.targetCPUUtilizationPercentage: 70`
- `pdb.minAvailable: 2`
- `podSecurityContext.runAsNonRoot: true`
- `securityContext.readOnlyRootFilesystem: true`
- `networkPolicy.enabled: true`

### 5.2 Coolify (Self-Hosted)

Docker Compose stack for Coolify deployment:
- API service (port 3001 -> 3000)
- Web service (port 3000 -> 3000)
- AI Advisor service (port 8000 -> 8000)
- External PostgreSQL and Redis (managed separately)

### 5.3 Terraform (GCP)

Infrastructure as Code for Google Cloud:
- GKE cluster with auto-scaling (n2-standard-4 nodes)
- Cloud SQL PostgreSQL 15 (regional HA, SSD, 100GB)
- Cloud Memorystore Redis 7 (HA, 5GB)
- VPC with private networking
- Workload Identity and Binary Authorization

---

## 6. Security Architecture

### 6.1 Authentication and Authorization

- OAuth2/OIDC via Keycloak (target)
- JWT access tokens + refresh tokens
- Role-based access control (user, admin, partner)
- Device binding and step-up MFA

### 6.2 Encryption

- TLS 1.3 enforced for all transit
- AES-256-GCM for data at rest (PII, API keys, tokens)
- PBKDF2 with 100K iterations for password hashing
- HMAC-SHA512 for webhook signature verification
- Constant-time comparison to prevent timing attacks

### 6.3 Network Security

- Kubernetes NetworkPolicy: API pods can only reach PostgreSQL and Redis
- Ingress restricted to nginx controller namespace
- Monitoring namespace has read-only access
- Pod Security Standards: restricted enforcement

### 6.4 Compliance

- PCI DSS: PAN tokenisation, no card data stored
- GDPR: Data encryption, right to erasure, data portability
- AML/CFT: Transaction monitoring, sanctions screening, SAR filing
- SOC 2 Type II: Security controls (target)
- ISO 27001: Information security management (target)

---

## 7. Observability

### 7.1 Metrics (Prometheus)

- HTTP request rate, duration, status codes
- Business metrics: transactions, wallets, trades, rewards
- Infrastructure: CPU, memory, disk, network
- Database: connections, query performance
- Redis: memory usage, operations per second

### 7.2 Logging (Loki)

- Structured JSON logs with correlation IDs
- DaemonSet collection via Promtail
- 30-day retention
- Log levels: error, warn, info, debug

### 7.3 Dashboards (Grafana)

- System overview
- Application performance (p50, p95, p99)
- Business metrics
- Infrastructure health

### 7.4 Alerting

- High error rate (>5% 5xx responses)
- High latency (p95 > 1 second)
- Pod unavailable > 2 minutes
- Memory usage > 90%
- Database connection pool exhaustion
- Failed transaction spikes
- KYC verification backlog

---

## 8. Performance Targets

| Metric | Target |
|--------|--------|
| API response time (p95) | < 200ms |
| Transaction throughput | 10,000+ TPS |
| System uptime | 99.99% |
| Database connections (pooled) | max 100 per pod |
| Concurrent users | 100,000+ |
| Blockchain confirmation | < 5 seconds |
| Transaction settlement | < 30 seconds |
| Mobile crash rate | < 0.1% |

---

## 9. Technology Stack Summary

| Layer | Technology | Language |
|-------|-----------|----------|
| Core Banking | Apache Fineract 1.9+ | Java 17+ |
| Payment Switch | JPOS / j8583 | Java |
| API Services | NestJS | TypeScript |
| Regulatory AI | FastAPI + OPA | Python + Rego |
| Trading Engine | Custom microservice (target) | Go |
| Blockchain | Hyperledger Fabric 2.5+ | Go / Java |
| Web Frontend | Next.js + React + Tailwind | TypeScript |
| Mobile | Flutter (target) | Dart |
| Database | PostgreSQL 15+ | SQL |
| Cache | Redis 7+ | -- |
| Event Streaming | Kafka / Redpanda (target) | -- |
| GraphQL | Hasura (target) | -- |
| Container Orchestration | Kubernetes + Rancher Fleet | YAML |
| Self-Hosted PaaS | Coolify | Docker Compose |
| IaC | Terraform | HCL |
| CI/CD | GitHub Actions + Jenkins | YAML |
| Identity | Keycloak (target) | Java |
| Secrets | HashiCorp Vault (target) | -- |
| Monitoring | Prometheus + Grafana + Loki | -- |

---

**Version:** 2.0
**Last Updated:** 2026-02-17
**Maintained By:** Platform Architecture Team
