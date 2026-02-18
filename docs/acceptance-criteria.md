# Acceptance Criteria — Global FinTech Platform (AtlasX)
> Version: 1.0 | Last Updated: 2026-02-18 | Status: Draft
> Classification: Internal | Author: AIDD System

## 1. User Onboarding

| ID | Criterion | Pass/Fail |
|----|-----------|-----------|
| AC-01 | User can register with email or phone within 5 minutes | |
| AC-02 | KYC verification completes within 24 hours | |
| AC-03 | Sanctions screening runs automatically on registration | |
| AC-04 | Default currency wallet created on account activation | |

## 2. Wallet Operations

| ID | Criterion | Pass/Fail |
|----|-----------|-----------|
| AC-05 | User can create wallets in 50+ currencies | |
| AC-06 | Wallet balance updates are atomic (no partial states) | |
| AC-07 | P2P transfer settles within 30 seconds | |
| AC-08 | Hold/release operations correctly update available balance | |

## 3. Payment Processing

| ID | Criterion | Pass/Fail |
|----|-----------|-----------|
| AC-09 | Payment initiates successfully via all 8 gateway providers | |
| AC-10 | Failed payments trigger automatic retry with fallback provider | |
| AC-11 | Split payments distribute funds per configured rules | |
| AC-12 | Webhook notifications delivered within 5 seconds of event | |

## 4. Compliance

| ID | Criterion | Pass/Fail |
|----|-----------|-----------|
| AC-13 | RegAI returns ALLOW/DENY/STEP_UP within 200ms | |
| AC-14 | Sanctions screening checks OFAC, EU, and UN lists | |
| AC-15 | Compliance cases can be created and tracked to resolution | |
| AC-16 | SAR narratives generated with accurate transaction details | |

## 5. Security

| ID | Criterion | Pass/Fail |
|----|-----------|-----------|
| AC-17 | All API endpoints require authentication | |
| AC-18 | Sensitive data encrypted at rest (AES-256-GCM) | |
| AC-19 | TLS 1.3 enforced for all external communications | |
| AC-20 | Rate limiting enforced per tier configuration | |

## 6. Performance

| ID | Criterion | Pass/Fail |
|----|-----------|-----------|
| AC-21 | API P95 latency < 100ms under normal load | |
| AC-22 | System handles 10K TPS without degradation | |
| AC-23 | Database failover completes within 30 seconds | |
| AC-24 | Zero-downtime deployment via rolling updates | |
