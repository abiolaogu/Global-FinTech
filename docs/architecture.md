# System Architecture — Global FinTech Platform (AtlasX)
> Version: 1.0 | Last Updated: 2026-02-18 | Status: Draft
> Classification: Internal | Author: AIDD System

## 1. Architecture Overview

AtlasX employs a modular monolith architecture with microservice extraction capability, built on NestJS (TypeScript) for the core API, Python (FastAPI) for AI/regulatory services, and Apache Fineract (Java/Spring) for core banking.

## 2. Architecture Principles

1. **Modular Monolith First**: Start unified, extract services at scale boundaries
2. **Event-Driven Backbone**: Kafka/Redpanda for async communication and audit trails
3. **Defense in Depth**: WAF → API Gateway → Service Mesh → Application → Database
4. **Regulatory by Design**: Compliance checks embedded in transaction pipelines
5. **Multi-Tenancy**: Tenant isolation at database schema and network policy levels

## 3. System Context (C4 Level 1)

```
End Users (Mobile/Web/API) → CDN/WAF (Cloudflare) → API Gateway (Kong/Nginx)
    → AtlasX API (NestJS) → Fineract (Core Banking) → JPOS (Payment Switch)
    → RegAI (Python/OPA) → AI Advisor (Python/LLM)
    → PostgreSQL 15+ | Redis 7+ | Kafka/Redpanda | Hyperledger Fabric
```

## 4. Container Diagram (C4 Level 2)

### 4.1 AtlasX Core API (NestJS)
- WalletsModule: Multi-currency wallet CRUD, credit/debit, transfers, holds
- SplitPaymentsModule: Percentage/fixed/hybrid payment splits
- PaymentGatewaysModule: 8+ providers (Paystack, Flutterwave, Stripe, Razorpay, PayMongo, Khalti, Mercado Pago, PayU)
- InvestmentsModule, AIChatModule, ROSCAModule, P2PLendingModule, OpenBankingModule

### 4.2 RegAI Service (Python FastAPI)
- OPA-backed policy decisions (ALLOW/DENY/STEP_UP)
- Sanctions screening (OFAC, EU, UN)
- Compliance case management
- LLM-assisted SAR/STR narrative drafting

### 4.3 AI Advisor Service (Python)
- Portfolio recommendations, risk assessment, financial literacy
- Configurable model backend (mock/production)

### 4.4 Apache Fineract (Core Banking)
- Multi-tenant account management, loan origination, savings products

### 4.5 JPOS (Payment Switch)
- ISO 8583 compliant, PCI-DSS certified
- Acquirer, issuer, gateway, and switch modules

### 4.6 Hyperledger Fabric (Blockchain)
- Settlement attestation and audit trail
- Cross-border payment recording
- Permissioned channels per jurisdiction

## 5. Data Layer

| Store | Purpose | Technology |
|-------|---------|-----------|
| Primary OLTP | Wallets, transactions, users | PostgreSQL 15+ |
| Cache | Sessions, rate limiting, hot data | Redis 7+ |
| Document Store | Logs, audit trails | MongoDB |
| Search | Transaction search, analytics | Elasticsearch |
| Event Bus | Async messaging, CDC | Kafka/Redpanda |
| Blockchain | Settlement attestation | Hyperledger Fabric 2.5+ |

## 6. Infrastructure

- **Compute**: GKE (Google Kubernetes Engine) via Terraform
- **Helm Charts**: Production chart with PostgreSQL/Redis sub-charts
- **GitOps**: Rancher Fleet (staging/production), ArgoCD
- **Self-Hosted PaaS**: Coolify/Docker Compose option
- **Monitoring**: Prometheus + Grafana + Loki
- **CI/CD**: GitHub Actions + Jenkinsfile
