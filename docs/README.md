# Documentation Index

Welcome to the Global FinTech Platform documentation. This index provides an overview of all available documentation to help you get started, understand the architecture, and use the platform effectively.

## Quick Links

- [Main README](../README.md) - Platform overview and getting started
- [Interactive Demo](PLATFORM_DEMO.html) - Live preview of all platform features
- [User Manual](USER_MANUAL.md) - Complete end-user guide
- [Training Manual](TRAINING_MANUAL.md) - Comprehensive training program

## Documentation Structure

### 📚 User Documentation

#### [User Manual](USER_MANUAL.md)
Complete guide for end users covering:
- Getting started and account creation
- KYC verification process
- Wallet management (creating, funding, withdrawing)
- Airtime & data purchase
- Payment operations (send, receive, split payments, payment links)
- Offline features (SMS/USSD sync)
- Security best practices
- Troubleshooting and FAQs

#### [Training Manual](TRAINING_MANUAL.md)
Comprehensive 7-module training program:
- Module 1: Platform Introduction (30 min)
- Module 2: Wallet Management (45 min)
- Module 3: Airtime & Data Purchase (60 min)
- Module 4: Payment Operations (45 min)
- Module 5: Offline Features (30 min)
- Module 6: Admin Functions (60 min)
- Module 7: Security Best Practices (30 min)

Each module includes:
- Learning objectives
- Hands-on exercises
- Quizzes for knowledge validation
- Certification program details

### 🏗️ Architecture Documentation

#### [TigerBeetle Integration Architecture](TIGERBEETLE_INTEGRATION_ARCHITECTURE.md)
Comprehensive architecture document covering:
- Why TigerBeetle for financial ledger
- Performance comparison (200x faster than traditional databases)
- Account structure and ID generation
- Transaction flows (transfers, split payments, holds)
- Migration strategy from PostgreSQL
- Integration patterns
- Performance benchmarks

Key Performance Metrics:
- **1M+ TPS** vs 5K TPS (traditional)
- **<1ms latency** vs 10-50ms (traditional)
- **Lock-free concurrency** vs pessimistic locking
- **Zero downtime** with 3-node cluster

#### [SMS/USSD Sync Architecture](SMS_USSD_SYNC_ARCHITECTURE.md)
Offline synchronization capabilities:
- #GFT# SMS protocol specification
- AES-256-GCM encryption for SMS payloads
- USSD menu system (*789#) with PIN authentication
- Message formats and commands
- Security measures and checksums
- Database schema for sync logs
- Implementation guidelines

#### [Airtime/Data Marketplace Architecture](AIRTIME_DATA_MARKETPLACE_ARCHITECTURE.md)
Complete marketplace design:
- User categories (End Users, Merchants, Agents, Admins)
- Product catalog structure
- Provider integration (Reloadly, DingConnect, Africa's Talking, DTOne)
- Commission system (multi-tier rates)
- Purchase flow (7-step process)
- API endpoints specifications
- Database schema
- Security and compliance

### 🚀 Implementation Guides

#### [TigerBeetle Quick Start](TIGERBEETLE_QUICKSTART.md)
Get up and running quickly:
- Installation (Docker, binary, source)
- Configuration (cluster setup, environment variables)
- Basic operations (create account, transfer, query balance)
- Code examples (TypeScript/Node.js)
- Common patterns (split payments, holds, refunds)
- Troubleshooting tips

#### [TigerBeetle Implementation Steps](TIGERBEETLE_IMPLEMENTATION_STEPS.md)
Step-by-step implementation guide:
- **Phase 1**: Infrastructure Setup (Docker, Kubernetes)
- **Phase 2**: Code Integration (service layer, account ID generation)
- **Phase 3**: Data Migration (strategy, validation, cutover)
- **Phase 4**: Testing (unit, integration, load testing)
- **Phase 5**: Deployment (blue-green, monitoring)
- **Phase 6**: Post-Deployment (optimization, analytics)

Timeline: 4-6 weeks end-to-end

#### [SMS/USSD Implementation Guide](IMPLEMENTATION_GUIDE_SMS_USSD.md)
Implementing offline sync:
- Gateway provider setup
- Backend service implementation
- Mobile app integration
- Security configuration
- Testing procedures
- Deployment checklist

### 🎨 Interactive Demo

#### [Platform Demo](PLATFORM_DEMO.html)
Interactive HTML demonstration featuring:
- **Dashboard**: Overview with wallet balances and recent transactions
- **Wallet Management**: Multi-currency wallets, top-up, credit lines
- **Airtime & Data**: Purchase flows for airtime and data bundles
- **Payment Operations**: Send money, split payments, payment links
- **Mobile App Preview**: Flutter app simulation
- **Architecture Diagrams**: System design visualization
- **API Documentation**: Endpoint specifications
- **Technology Stack**: Complete tech overview

Open in browser for clickable, interactive experience.

### 📊 Feature Documentation

#### [Real-Time Payments](REALTIME_PAYMENTS.md)
Real-time payment processing:
- Payment rails integration
- Settlement flows
- Instant transfer mechanisms
- Webhook notifications

#### [Global Payment Rails Expansion](GLOBAL_PAYMENT_RAILS_EXPANSION.md)
International payment capabilities:
- Regional payment methods
- Currency conversion
- Cross-border transfers
- Compliance considerations

#### [Investment Platform](INVESTMENT_PLATFORM.md)
Investment features (planned):
- Stock trading
- ETF investments
- Portfolio management
- Market data integration

#### [AI Chat Assistant](AI_CHAT_ASSISTANT.md)
AI-powered customer support:
- Natural language processing
- Intent recognition
- Automated responses
- Escalation to human agents

#### [AI Ops Monitoring](AIOPS_MONITORING.md)
Intelligent operations monitoring:
- Anomaly detection
- Predictive alerting
- Root cause analysis
- Automated remediation

### 📐 Diagrams

Visual representations in the [diagrams](diagrams/) directory:
- **C4 Level 1**: System context diagram
- **C4 Level 2**: Container diagram
- **C4 Level 3**: Component diagrams
- Sequence diagrams
- Data flow diagrams

## Documentation by User Type

### For End Users
1. [User Manual](USER_MANUAL.md) - How to use the platform
2. [Platform Demo](PLATFORM_DEMO.html) - Interactive feature preview
3. [Training Manual](TRAINING_MANUAL.md) - Self-paced learning

### For Developers
1. [TigerBeetle Quick Start](TIGERBEETLE_QUICKSTART.md) - Get coding fast
2. [TigerBeetle Integration Architecture](TIGERBEETLE_INTEGRATION_ARCHITECTURE.md) - Deep dive
3. [TigerBeetle Implementation Steps](TIGERBEETLE_IMPLEMENTATION_STEPS.md) - Full implementation
4. [SMS/USSD Implementation Guide](IMPLEMENTATION_GUIDE_SMS_USSD.md) - Offline sync
5. [Main README](../README.md) - Setup and development

### For DevOps/SRE
1. [TigerBeetle Implementation Steps](TIGERBEETLE_IMPLEMENTATION_STEPS.md) - Deployment
2. [AI Ops Monitoring](AIOPS_MONITORING.md) - Operations monitoring
3. [Docker Compose files](../docker-compose.tigerbeetle.yml) - Infrastructure

### For Product/Business
1. [Airtime/Data Marketplace Architecture](AIRTIME_DATA_MARKETPLACE_ARCHITECTURE.md) - Business model
2. [Training Manual](TRAINING_MANUAL.md) - Customer onboarding
3. [Platform Demo](PLATFORM_DEMO.html) - Feature showcase

### For Admins
1. [Training Manual - Module 6](TRAINING_MANUAL.md#module-6-admin-functions-for-admins--super-admins) - Admin functions
2. [User Manual - Admin Section](USER_MANUAL.md) - Admin operations
3. [Platform Demo - Admin Features](PLATFORM_DEMO.html#demo) - Admin UI preview

## Getting Help

- **General Questions**: See [User Manual FAQs](USER_MANUAL.md#faqs)
- **Technical Issues**: [Main README - Support](../README.md#support)
- **Training**: [Training Manual](TRAINING_MANUAL.md)
- **Bug Reports**: [GitHub Issues](https://github.com/yourusername/Global-FinTech/issues)

## Contributing to Documentation

We welcome documentation improvements! Please:
1. Fork the repository
2. Make your changes
3. Submit a pull request with clear description
4. Follow the existing markdown style

## Documentation Standards

- Use clear, concise language
- Include code examples where applicable
- Add diagrams for complex concepts
- Keep documentation up-to-date with code
- Include troubleshooting sections
- Add cross-references to related docs

---

**Last Updated**: November 26, 2025

For the latest updates, visit the [main repository](https://github.com/yourusername/Global-FinTech).
