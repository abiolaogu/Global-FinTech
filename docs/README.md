# Documentation Index — Global FinTech Platform (AtlasX)
> Version: 1.0 | Last Updated: 2026-02-18 | Status: Draft
> Classification: Internal | Author: AIDD System

## Overview

This index provides a categorized reference to all documentation for the Global FinTech Platform (AtlasX) — a Revolut-class multi-currency fintech platform combining core banking (Apache Fineract), payment switching (JPOS), blockchain attestation (Hyperledger Fabric), and modern API services (NestJS, FastAPI).

## Quick Links

- [Main README](../README.md) — Platform overview and getting started
- [Interactive Demo](PLATFORM_DEMO.html) — Live preview of all platform features
- [User Manual](USER_MANUAL.md) — Complete end-user guide
- [Training Manual](TRAINING_MANUAL.md) — Comprehensive training program

---

## 1. Strategy & Requirements

| Document | Description |
|----------|-------------|
| [Product Requirements (PRD)](prd.md) | Personas, features, and product specifications |
| [Business Requirements (BRD)](brd.md) | Business context, stakeholder requirements, success criteria |
| [Gap Analysis](gap-analysis.md) | Repository audit and production-readiness assessment |
| [Use Cases](use-cases.md) | End-to-end use case scenarios for all personas |
| [Acceptance Criteria](acceptance-criteria.md) | Pass/fail criteria for feature validation |

## 2. Architecture & Design

| Document | Description |
|----------|-------------|
| [System Architecture](architecture.md) | C4 diagrams, architecture principles, and system context |
| [Software Architecture](software-architecture.md) | Module decomposition, dependency graphs, design patterns |
| [Enterprise Architecture](enterprise-architecture.md) | Capability model, integration landscape, jurisdictions |
| [High-Level Design (HLD)](hld.md) | Subsystem responsibilities, interaction patterns, deployment topology |
| [Low-Level Design (LLD)](lld.md) | Implementation detail: entities, algorithms, configurations |
| [Database Schema](database-schema.md) | PostgreSQL schema definitions and data dictionary |
| [Workflows](workflows.md) | Payment, onboarding, compliance, and trading flows |

## 3. Technical Documentation

| Document | Description |
|----------|-------------|
| [Technical Writeup](technical-writeup.md) | Executive technical summary and key decisions |
| [Technical Specifications](technical-specifications.md) | API specifications, authentication, rate limits |
| [Hardware Requirements](hardware-requirements.md) | Infrastructure sizing for dev, staging, production |
| [Software Requirements](software-requirements.md) | Runtime dependencies and toolchain prerequisites |

## 4. User Manuals

| Document | Description |
|----------|-------------|
| [Admin Manual](user-manual-admin.md) | Platform administration guide |
| [End User Manual](user-manual-enduser.md) | End-user guide for mobile and web |
| [Developer Manual](user-manual-developer.md) | API integration and development guide |

## 5. Training

| Document | Description |
|----------|-------------|
| [Admin Training](training-manual-admin.md) | Administrator training curriculum |
| [End User Training](training-manual-enduser.md) | End-user training modules |
| [Developer Training](training-manual-developer.md) | Developer training curriculum |
| [Video Scripts](training-video-scripts.md) | Training video script outlines |

## 6. Operations

| Document | Description |
|----------|-------------|
| [Deployment Guide](deployment.md) | Kubernetes, Helm, GitOps, and CI/CD deployment |
| [Release Notes](release-notes.md) | Version history and changelog |
| [Testing Requirements](testing-requirements-aidd.md) | AIDD testing strategy and coverage targets |

---

## Additional Documentation

| Document | Description |
|----------|-------------|
| [Architecture Overview](architecture-overview.md) | Detailed C4 architecture reference |
| [Technical Architecture](TECHNICAL_ARCHITECTURE.md) | Comprehensive technical overview |
| [AtlasX API Contracts](AtlasX_API_Contracts.md) | API specifications |
| [AtlasX Database Schema](AtlasX_Database_Schema.md) | Extended schema documentation |
| [Business Plan](Business_Plan.md) | Business strategy and financials |
| [Threat Model](Threat_Model.md) | Security threat analysis |
| [Runbooks](Runbooks.md) | Operational runbooks |

## Feature & Integration Documentation

| Document | Description |
|----------|-------------|
| [TigerBeetle Integration](TIGERBEETLE_INTEGRATION_ARCHITECTURE.md) | Financial ledger integration architecture |
| [TigerBeetle Quick Start](TIGERBEETLE_QUICKSTART.md) | TigerBeetle implementation quick start |
| [TigerBeetle Implementation Steps](TIGERBEETLE_IMPLEMENTATION_STEPS.md) | Step-by-step implementation guide |
| [SMS/USSD Sync Architecture](SMS_USSD_SYNC_ARCHITECTURE.md) | Offline synchronization capabilities |
| [SMS/USSD Implementation Guide](IMPLEMENTATION_GUIDE_SMS_USSD.md) | Offline sync implementation |
| [Airtime/Data Marketplace](AIRTIME_DATA_MARKETPLACE_ARCHITECTURE.md) | Marketplace design and provider integration |
| [Real-Time Payments](REALTIME_PAYMENTS.md) | Payment rails and settlement flows |
| [Global Payment Rails](GLOBAL_PAYMENT_RAILS_EXPANSION.md) | International payment capabilities |
| [Investment Platform](INVESTMENT_PLATFORM.md) | Investment features (planned) |
| [AI Chat Assistant](AI_CHAT_ASSISTANT.md) | AI-powered customer support |
| [AIOps Monitoring](AIOPS_MONITORING.md) | Intelligent operations monitoring |
| [Interactive Demo](PLATFORM_DEMO.html) | Clickable platform feature demo |

## Documentation by User Type

### For End Users
1. [User Manual](USER_MANUAL.md) — How to use the platform
2. [End User Manual (AIDD)](user-manual-enduser.md) — Mobile and web guide
3. [Platform Demo](PLATFORM_DEMO.html) — Interactive feature preview
4. [Training Manual](TRAINING_MANUAL.md) — Self-paced learning

### For Developers
1. [Developer Manual](user-manual-developer.md) — API integration guide
2. [TigerBeetle Quick Start](TIGERBEETLE_QUICKSTART.md) — Get coding fast
3. [Developer Training](training-manual-developer.md) — Training curriculum
4. [Main README](../README.md) — Setup and development

### For Administrators
1. [Admin Manual](user-manual-admin.md) — Platform administration
2. [Admin Training](training-manual-admin.md) — Admin training
3. [AIOps Monitoring](AIOPS_MONITORING.md) — Operations monitoring

### For DevOps/SRE
1. [Deployment Guide](deployment.md) — Kubernetes, Helm, CI/CD
2. [Hardware Requirements](hardware-requirements.md) — Infrastructure sizing
3. [TigerBeetle Implementation](TIGERBEETLE_IMPLEMENTATION_STEPS.md) — Deployment

### Diagrams
Visual representations in the [diagrams](diagrams/) directory.
