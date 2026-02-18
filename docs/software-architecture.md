# Software Architecture — Global FinTech Platform (AtlasX)
> Version: 1.0 | Last Updated: 2026-02-18 | Status: Draft
> Classification: Internal | Author: AIDD System

## 1. Module Decomposition

### 1.1 Core API (apps/api — NestJS/TypeScript)

```
apps/api/
├── src/
│   ├── wallets/           # Multi-currency wallet management
│   ├── split-payments/    # Payment distribution engine
│   ├── payment-gateways/  # 8+ provider integrations
│   ├── investments/       # Investment marketplace
│   ├── ai-chat/           # Natural language financial assistant
│   ├── rosca/             # Rotating savings groups
│   ├── p2p-lending/       # Peer-to-peer lending
│   ├── open-banking/      # PSD2/CFPB aggregation
│   └── oauth2/            # Partner API authentication
```

### 1.2 RegAI Service (regai/ — Python FastAPI)

```
regai/
├── app/
│   ├── routers/           # /v1/decision, /v1/screen, /v1/case, /v1/report
│   ├── detectors/         # Jurisdiction-specific AML detectors
│   ├── policies/          # OPA Rego policies
│   └── models/            # LLM integration for SAR drafting
```

### 1.3 AI Advisor Service (services/ai-advisor-svc — Python)

### 1.4 Web Frontend (apps/web — Next.js/React)

### 1.5 Mobile Apps (android/, ios/, flutter/)

## 2. Dependency Graph

```
Web/Mobile → API Gateway → AtlasX API → PostgreSQL
                                      → Redis
                                      → Kafka/Redpanda
                              RegAI → OPA Engine
                                    → Sanctions DB
                           Fineract → PostgreSQL (Core Banking)
                               JPOS → Card Networks (Visa/MC)
                     Hyperledger FB → Peer Network
```

## 3. Design Patterns

| Pattern | Application |
|---------|------------|
| Modular Monolith | NestJS modules with clear boundaries |
| Repository Pattern | TypeORM repositories for data access |
| CQRS | Separate read/write paths for wallets |
| Event Sourcing | Transaction history via Kafka events |
| Circuit Breaker | Payment gateway failover |
| Saga Pattern | Multi-step payment orchestration |
| Strategy Pattern | Payment provider selection |

## 4. API Design

- REST (OpenAPI 3.0) for client-facing APIs
- GraphQL (Hasura-style) for admin/reporting queries
- gRPC for inter-service communication (future)
- ISO 8583 for card network integration via JPOS

## 5. Security Architecture

- OAuth2 + JWT for authentication (Keycloak)
- RBAC with per-module permission guards
- AES-256-GCM for sensitive data encryption at rest
- TLS 1.3 for data in transit
- OPA for policy-based authorization
- HashiCorp Vault for secrets management
