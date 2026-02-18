# Software Requirements — Global FinTech Platform (AtlasX)
> Version: 1.0 | Last Updated: 2026-02-18 | Status: Draft
> Classification: Internal | Author: AIDD System

## 1. Runtime Dependencies

### 1.1 Core API (NestJS)
| Dependency | Version | Purpose |
|-----------|---------|---------|
| Node.js | 20 LTS+ | Runtime |
| TypeScript | 5.x | Language |
| NestJS | 10.x | Framework |
| TypeORM | 0.3.x | ORM |
| PostgreSQL Driver | pg 8.x | Database |
| Redis (ioredis) | 5.x | Caching |
| KafkaJS | 2.x | Event streaming |

### 1.2 RegAI Service (Python)
| Dependency | Version | Purpose |
|-----------|---------|---------|
| Python | 3.11+ | Runtime |
| FastAPI | 0.100+ | Framework |
| OPA Client | Latest | Policy engine |
| httpx | 0.24+ | HTTP client |
| SQLAlchemy | 2.x | ORM (if needed) |

### 1.3 Core Banking (Fineract)
| Dependency | Version | Purpose |
|-----------|---------|---------|
| Java | 17+ | Runtime |
| Spring Boot | 3.x | Framework |
| PostgreSQL | 15+ | Database |

### 1.4 Payment Switch (JPOS)
| Dependency | Version | Purpose |
|-----------|---------|---------|
| Java | 17+ | Runtime |
| JPOS | 2.x | ISO 8583 |

## 2. Infrastructure Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Docker | 24+ | Containerization |
| Kubernetes | 1.28+ | Orchestration |
| Helm | 3.x | Package management |
| Terraform | 1.5+ | Infrastructure provisioning |
| ArgoCD | 2.x | GitOps |
| Rancher Fleet | 0.9+ | Multi-cluster GitOps |

## 3. Development Tools

| Tool | Version | Purpose |
|------|---------|---------|
| Git | 2.40+ | Version control |
| pnpm | 8+ | Node package manager |
| Docker Compose | 2.x | Local development |
| k9s | Latest | Kubernetes TUI |
| psql | 15+ | Database CLI |
