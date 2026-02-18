# Technical Writeup — Global FinTech Platform (AtlasX)
> Version: 1.0 | Last Updated: 2026-02-18 | Status: Draft
> Classification: Internal | Author: AIDD System

## 1. Executive Technical Summary

AtlasX is a multi-currency fintech platform built on a modular monolith architecture that combines proven open-source financial infrastructure (Apache Fineract, JPOS) with modern API services (NestJS, FastAPI) and blockchain attestation (Hyperledger Fabric). The platform targets a Revolut-class experience with regulatory compliance across 12+ jurisdictions.

## 2. Key Technical Decisions

### 2.1 Modular Monolith over Microservices
The core API uses NestJS modules with clear boundaries rather than separate microservices. This reduces operational complexity while maintaining the ability to extract services at scale boundaries. Each module (Wallets, Payments, Investments) can be independently deployed when traffic justifies separation.

### 2.2 Apache Fineract for Core Banking
Rather than building core banking from scratch, AtlasX leverages Fineract 1.9+ for account management, loan servicing, and savings products. This provides regulatory-tested double-entry accounting out of the box.

### 2.3 JPOS for Payment Switching
ISO 8583 compliance is non-negotiable for card processing. JPOS provides a mature, PCI-DSS compliant switch with acquirer, issuer, and gateway modules.

### 2.4 OPA/Rego for Compliance Policy
Regulatory rules are encoded as OPA policies (Rego language), enabling version-controlled, testable compliance logic that adapts per jurisdiction without code changes.

### 2.5 Hyperledger Fabric for Audit
A permissioned blockchain provides immutable transaction attestation for regulatory audit trails without the overhead of public chain consensus.

## 3. Performance Architecture

| Metric | Target | Approach |
|--------|--------|----------|
| API P95 latency | < 100ms | Redis caching, connection pooling |
| Payment processing | < 2s end-to-end | Async Kafka pipeline, provider failover |
| Concurrent users | 100K+ | HPA, read replicas, CDN |
| Transaction throughput | 10K TPS | Kafka partitioning, PostgreSQL optimization |

## 4. Security Posture

- PCI-DSS Level 1 compliance for card data
- AES-256-GCM encryption at rest
- TLS 1.3 for all transit
- HSM integration via HashiCorp Vault
- OPA policy-based authorization
- Automated vulnerability scanning (Trivy/Snyk)
- SBOM generation for supply chain security
