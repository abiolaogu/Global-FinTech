# Testing Requirements (AIDD) — Global FinTech Platform (AtlasX)
> Version: 1.0 | Last Updated: 2026-02-18 | Status: Draft
> Classification: Internal | Author: AIDD System

## 1. Testing Strategy

### 1.1 Test Pyramid

| Level | Coverage Target | Tools |
|-------|----------------|-------|
| Unit Tests | > 80% | Jest (TS), pytest (Python), JUnit (Java) |
| Integration Tests | > 60% | Jest + Testcontainers, pytest + Docker |
| E2E Tests | Critical paths | Playwright (Web), Detox (Mobile) |
| Contract Tests | All APIs | Pact |
| Load Tests | Production sizing | k6, Artillery |

### 1.2 AIDD Guardrail Checks
The CI pipeline runs `scripts/aidd-guardrail.sh` which validates:
- **Architecture**: Module boundaries and dependency rules
- **Integrity**: Schema migrations, configuration consistency
- **Defense**: Security scanning (Trivy/Snyk), SBOM generation
- **Delivery**: Build success, test passage, deployment readiness

## 2. Test Environments

| Environment | Purpose | Data |
|-------------|---------|------|
| Local (Docker Compose) | Developer testing | Seeded fixtures |
| CI (GitHub Actions) | Automated pipeline | Ephemeral |
| Staging (GKE) | Pre-production validation | Anonymized production data |
| Production | Smoke tests only | Live data |

## 3. Critical Test Scenarios

### 3.1 Payment Processing
- TC-01: Successful payment via each of 8 providers
- TC-02: Payment failure with automatic provider fallback
- TC-03: Split payment distribution accuracy
- TC-04: Concurrent transfer atomicity (no double-spend)

### 3.2 Compliance
- TC-05: RegAI ALLOW for clean transaction
- TC-06: RegAI DENY for sanctions-listed party
- TC-07: RegAI STEP_UP for threshold-exceeding amount
- TC-08: SAR generation with complete transaction details

### 3.3 Wallet Operations
- TC-09: Create, credit, debit, transfer lifecycle
- TC-10: Hold/capture/release flow
- TC-11: Concurrent balance operations (pessimistic locking)
- TC-12: Multi-currency transfer with FX conversion

## 4. Performance Baselines

| Scenario | Metric | Target |
|----------|--------|--------|
| Wallet balance query | P95 latency | < 50ms |
| Payment initiation | P95 latency | < 500ms |
| RegAI decision | P95 latency | < 200ms |
| Sustained load | Throughput | 10K TPS |
| Spike test (10x) | Error rate | < 1% |
