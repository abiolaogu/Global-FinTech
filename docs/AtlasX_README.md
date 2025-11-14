# AtlasX Architecture Documentation

## Overview

Welcome to the **AtlasX** architecture documentation. AtlasX is a global financial operating system designed to provide comprehensive fintech services including multi-currency accounts, foreign exchange, payment cards, trading capabilities, cryptocurrency services, and marketplace features.

This documentation suite provides a complete blueprint for implementing AtlasX from initial design through production deployment.

---

## Quick Navigation

### Core Architecture Documents

1. **[Architecture Overview](./AtlasX_Architecture_Overview.md)**
   - High-level architecture (HLD)
   - Hybrid modular monolith + microservices approach
   - Domain breakdown and service boundaries
   - Inter-service communication patterns
   - Cross-cutting concerns (security, observability, compliance)
   - Technology stack and design decisions

2. **[Database Schema](./AtlasX_Database_Schema.md)**
   - Complete PostgreSQL schema design
   - Core domain entities (User, Wallet, Ledger, Payment, Card, Trade, etc.)
   - Indexes, constraints, and optimization strategies
   - Audit and event tables
   - Data retention and archival policies

3. **[Sequence Diagrams](./AtlasX_Sequence_Diagrams.md)**
   - User sign-up and KYC flow
   - Wallet funding and FX conversion
   - Card payment authorization and settlement
   - Trading order placement and execution
   - P2P transfers
   - Reward redemption
   - Multi-currency swaps

4. **[API Contracts](./AtlasX_API_Contracts.md)**
   - RESTful API specifications (OpenAPI-style)
   - Authentication and authorization endpoints
   - Core service APIs (Wallets, Payments, FX, Cards, Trading, Rewards)
   - Error handling and response formats
   - Rate limiting and webhooks

5. **[Implementation Guide](./AtlasX_Implementation_Guide.md)**
   - Development environment setup
   - NestJS project structure
   - Module templates and examples
   - Database migration strategies
   - Testing (unit, integration, e2e)
   - Docker and CI/CD setup
   - 16-week implementation roadmap

---

## System Architecture Summary

### Architectural Approach

AtlasX uses a **hybrid architecture**:

- **Core Financial Monolith:** Tightly-coupled domains (Customer, KYC, Accounts, Ledger, Payments) in a single NestJS application for ACID transaction integrity
- **Strategic Microservices:** Independent services for Cards, Trading, Crypto, Marketplace, and Rewards with distinct scaling and regulatory requirements

### Technology Stack

**Backend:**
- TypeScript + NestJS
- PostgreSQL 15+ (ACID compliance)
- Redis 7+ (caching, pub/sub)
- REST APIs with OpenAPI 3.1

**Frontend:**
- Flutter 3+ (iOS, Android, Web from single codebase)

**Infrastructure:**
- Docker + Docker Compose (local)
- Kubernetes + Helm (staging/prod)
- GitHub Actions (CI/CD)

**Security:**
- JWT authentication
- RBAC authorization
- Input validation (DTO-based)
- Rate limiting (token bucket)
- Dependency/container scanning

---

## Domain Model

### Core Entities

| Entity | Description |
|--------|-------------|
| **User** | Core identity entity with email, phone, KYC status, tier |
| **KYC Profile** | Compliance record per jurisdiction with verification level |
| **Wallet** | Multi-currency account with balance, available, and reserved funds |
| **Currency** | Reference data for fiat and crypto currencies |
| **Ledger Entry** | Immutable double-entry bookkeeping record |
| **Payment** | P2P transfers, deposits, withdrawals orchestration |
| **Card** | Physical/virtual payment cards with spending limits |
| **Trade Order** | Stock, crypto, FX order execution |
| **Position** | Investment holdings with cost basis tracking |
| **Reward Points** | Loyalty balance with expiration and redemption |
| **Tier** | Membership levels (Free, Silver, Gold, Platinum) |

---

## Key Features

### MVP Phase (Months 1-4)

✅ User registration and authentication
✅ Multi-jurisdiction KYC verification
✅ Multi-currency wallet management
✅ P2P transfers
✅ Bank deposits and withdrawals
✅ FX conversion
✅ Double-entry ledger for audit trail

### Phase 2 (Months 5-8)

✅ Payment cards (virtual/physical)
✅ Card authorization and settlement
✅ Trading (stocks, crypto, FX)
✅ Portfolio management
✅ Rewards and loyalty points
✅ Tiered benefits

### Phase 3 (Months 9-12)

✅ Cryptocurrency custody
✅ Crypto on/off-ramp
✅ Marketplace (travel, insurance)
✅ API platform for partners
✅ OAuth2 for third-party integrations
✅ Webhooks and real-time notifications

### Future Enhancements

🔮 Copy trading
🔮 Managed portfolios
🔮 AI money copilot
🔮 Global expansion (multi-region compliance)
🔮 Advanced analytics and insights

---

## Development Workflow

### Quick Start

```bash
# Clone repository
git clone https://github.com/your-org/atlasx.git
cd atlasx

# Install dependencies
npm install

# Setup environment
cp .env.example .env

# Start local infrastructure
docker-compose up -d

# Run migrations
npm run migration:run

# Seed data
npm run seed

# Start development server
npm run start:dev
```

### Project Structure

```
Global-FinTech/
├── apps/
│   ├── core-monolith/          # Main NestJS application
│   ├── microservices/
│   │   ├── card-service/
│   │   ├── trading-service/
│   │   ├── crypto-service/
│   │   └── rewards-service/
│   └── mobile/                 # Flutter app
├── docs/                       # Architecture documentation (you are here)
├── services/                   # Legacy/existing services
├── infra/                      # Infrastructure as code
└── testing/                    # Test suites
```

---

## API Overview

### Base URL

```
https://api.atlasx.io/v1
```

### Authentication

All authenticated endpoints require a JWT bearer token:

```
Authorization: Bearer <access_token>
```

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/auth/register` | POST | Create new user account |
| `/auth/login` | POST | Authenticate and get tokens |
| `/kyc/submit` | POST | Submit KYC documents |
| `/wallets` | GET/POST | Manage multi-currency wallets |
| `/payments/p2p` | POST | Peer-to-peer transfer |
| `/payments/deposit` | POST | Initiate bank deposit |
| `/payments/withdraw` | POST | Initiate withdrawal |
| `/fx/convert` | POST | Execute currency conversion |
| `/cards` | GET/POST | Manage payment cards |
| `/trading/orders` | POST | Place trade order |
| `/trading/portfolio` | GET | View positions |
| `/rewards/balance` | GET | Check reward points |

### Response Format

```json
{
  "data": {
    // Response data
  },
  "meta": {
    // Pagination, timestamps, etc.
  },
  "links": {
    // HATEOAS links (for collections)
  }
}
```

---

## Testing Strategy

### Test Pyramid

- **Unit Tests (70%):** Pure business logic, service methods
- **Integration Tests (20%):** Database interactions, external API mocks
- **End-to-End Tests (10%):** Critical user flows

### Coverage Requirements

- Minimum: 80% overall
- Critical paths (payments, ledger): 95%+

### Running Tests

```bash
# Unit tests
npm run test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Coverage report
npm run test:cov
```

---

## Security Considerations

### Authentication & Authorization

- JWT access tokens (15 min expiry)
- Refresh tokens (7 day expiry)
- Role-based access control (RBAC)
- Multi-factor authentication (TOTP, SMS)

### Data Protection

- TLS 1.3 for data in transit
- Transparent Data Encryption (TDE) for data at rest
- PII encryption (database-level)
- PAN tokenization (never store plain card numbers)
- Secrets management (HashiCorp Vault)

### Compliance

- AML/CFT transaction monitoring
- Sanctions screening (OFAC, EU, UN)
- KYC verification (Onfido, Jumio, Sumsub)
- GDPR compliance (right to erasure, data portability)
- Audit trails (immutable ledger entries)

---

## Deployment

### Environments

1. **Local:** Docker Compose
2. **Development:** Kubernetes cluster (shared)
3. **Staging:** Kubernetes cluster (production-like)
4. **Production:** Multi-region Kubernetes (HA setup)

### CI/CD Pipeline

```
Code Push → Lint → Test → Security Scan → Build → Deploy → Verify
```

**GitHub Actions Workflow:**
- Run on every PR and push to main/develop
- Automated tests (unit, integration, e2e)
- Security scanning (Snyk, Trivy)
- Docker image build and push
- Deployment to staging/production
- Smoke tests and health checks

---

## Monitoring & Observability

### Metrics (Prometheus + Grafana)

- Request rate, error rate, latency (RED metrics)
- Business metrics (signups, transactions, revenue)
- Infrastructure metrics (CPU, memory, disk)

### Logging (ELK or Loki)

- Structured JSON logs
- Correlation IDs for request tracing
- Centralized log aggregation

### Tracing (Jaeger)

- Distributed tracing across services
- Performance bottleneck identification
- Request flow visualization

### Alerting (AlertManager + PagerDuty)

- Error rate thresholds
- Latency SLO violations
- Infrastructure health
- Business anomalies

---

## Implementation Timeline

### MVP to Production: 16 Weeks

**Weeks 1-4:** Foundation
- Core modules (Auth, Users, KYC, Wallets, Ledger, Payments)
- Database schema and migrations
- CI/CD pipeline

**Weeks 5-8:** Core Features
- Deposits/withdrawals
- Card service
- Trading service
- Rewards service

**Weeks 9-12:** Advanced Features
- Crypto service
- Marketplace
- API platform
- Performance optimization

**Weeks 13-16:** Mobile & Launch
- Flutter app development
- End-to-end testing
- Production deployment
- Soft launch

---

## Next Steps

### For Developers

1. Read the [Architecture Overview](./AtlasX_Architecture_Overview.md) for system design
2. Review the [Database Schema](./AtlasX_Database_Schema.md) to understand data models
3. Follow the [Implementation Guide](./AtlasX_Implementation_Guide.md) to start coding
4. Reference [API Contracts](./AtlasX_API_Contracts.md) for endpoint specifications

### For Product Managers

1. Review [Sequence Diagrams](./AtlasX_Sequence_Diagrams.md) for user flows
2. Understand feature breakdown in [Architecture Overview](./AtlasX_Architecture_Overview.md)
3. Check implementation timeline in [Implementation Guide](./AtlasX_Implementation_Guide.md)

### For DevOps Engineers

1. Study infrastructure requirements in [Architecture Overview](./AtlasX_Architecture_Overview.md)
2. Review Docker and Kubernetes setup in [Implementation Guide](./AtlasX_Implementation_Guide.md)
3. Plan deployment strategy based on CI/CD pipeline specs

### For Compliance/Legal

1. Review security architecture in [Architecture Overview](./AtlasX_Architecture_Overview.md)
2. Understand KYC/AML workflows in [Sequence Diagrams](./AtlasX_Sequence_Diagrams.md)
3. Check data retention policies in [Database Schema](./AtlasX_Database_Schema.md)

---

## Contributing

### Updating Documentation

When making changes to the architecture:

1. Update relevant documentation files
2. Increment version numbers
3. Update this README if adding new sections
4. Submit PR with clear description

### Questions & Feedback

- Technical questions: Create GitHub issue
- Architecture discussions: Schedule design review
- Documentation feedback: Submit PR with suggestions

---

## Additional Resources

### Related Documentation

- [Product Requirements Document (PRD)](./PRD.md)
- [Business Plan](./Business_Plan.md)
- [GTM Strategy](./GTM_Strategy.md)
- [Regulatory Memos](./Regulatory_Memos.md)
- [Country Rollout Plan](./Country_Rollout_Plan.md)

### External References

- NestJS Documentation: https://docs.nestjs.com
- PostgreSQL Docs: https://www.postgresql.org/docs/
- TypeORM: https://typeorm.io
- Flutter: https://flutter.dev
- OpenAPI Spec: https://swagger.io/specification/

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0 | 2025-11-14 | Initial architecture design and documentation |

---

## License

**Proprietary and Confidential**

This documentation is the property of AtlasX and contains confidential information. Unauthorized distribution, copying, or disclosure is strictly prohibited.

---

**For questions or support, contact the Architecture Team.**
