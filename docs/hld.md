# High-Level Design — Global FinTech Platform (AtlasX)
> Version: 1.0 | Last Updated: 2026-02-18 | Status: Draft
> Classification: Internal | Author: AIDD System

## 1. Subsystem Responsibilities

### 1.1 API Gateway Subsystem
- Rate limiting, authentication, request routing, response caching
- Technology: Kong / Nginx with custom plugins
- Handles API versioning and load balancing

### 1.2 Core API Subsystem (NestJS)
- Business logic for wallets, payments, investments, lending
- Module-based architecture with clear dependency boundaries
- Feature-flagged module activation (CORE_API_ENABLED)

### 1.3 Core Banking Subsystem (Fineract)
- Account management, ledger operations, loan servicing
- Multi-tenant with tenant-per-database isolation
- Java 17+ / Spring Boot 3.x runtime

### 1.4 Payment Switch Subsystem (JPOS)
- ISO 8583 message parsing and routing
- Card authorization, capture, settlement
- PCI-DSS Level 1 compliant processing

### 1.5 Regulatory Intelligence Subsystem (RegAI)
- Policy-as-code (OPA/Rego) decision engine
- Multi-jurisdictional detector configurations
- LLM-powered compliance narrative generation

### 1.6 Blockchain Subsystem (Hyperledger Fabric)
- Transaction attestation and immutable audit trail
- Permissioned channels per product/region
- Settlement finality recording

## 2. Interaction Patterns

| From | To | Pattern | Protocol |
|------|----|---------|----------|
| Client | API Gateway | Request/Response | HTTPS |
| API Gateway | Core API | Proxy | HTTP/gRPC |
| Core API | Fineract | Request/Response | REST |
| Core API | JPOS | Request/Response | ISO 8583 |
| Core API | RegAI | Request/Response | REST |
| Core API | Kafka | Publish | Kafka Protocol |
| RegAI | OPA | Policy Query | REST |
| Core API | Fabric | Submit TX | gRPC |
| Kafka | Consumers | Subscribe | Kafka Protocol |

## 3. Deployment Topology

```
GKE Cluster
├── Namespace: atlasx-prod
│   ├── Deployment: atlasx-api (3 replicas)
│   ├── Deployment: regai-svc (2 replicas)
│   ├── Deployment: ai-advisor-svc (2 replicas)
│   ├── StatefulSet: postgresql (3-node HA)
│   ├── StatefulSet: redis-cluster (6 nodes)
│   ├── StatefulSet: kafka (3 brokers)
│   └── StatefulSet: fabric-peers (3 peers)
├── Namespace: atlasx-monitoring
│   ├── Prometheus, Grafana, Loki
│   └── Alertmanager
└── Namespace: atlasx-ingress
    └── Kong API Gateway
```

## 4. Scalability Strategy

| Component | Scaling Method | Trigger |
|-----------|---------------|---------|
| Core API | Horizontal (HPA) | CPU > 70% or RPS > 5K |
| RegAI | Horizontal (HPA) | Queue depth > 100 |
| PostgreSQL | Read replicas | Read latency > 50ms |
| Redis | Cluster sharding | Memory > 80% |
| Kafka | Partition rebalancing | Consumer lag > 10K |
