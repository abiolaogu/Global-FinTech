# KYC/AML Compliance -- Global FinTech Platform

## 1. Overview

The Global FinTech platform implements a comprehensive Know Your Customer (KYC) and Anti-Money Laundering (AML) framework that meets regulatory requirements across 15+ jurisdictions. The compliance engine combines automated verification via Onfido and Sumsub, real-time transaction monitoring via the RegAI service, sanctions screening against OFAC/EU/UN lists, and regulatory reporting capabilities.

---

## 2. KYC Verification Framework

### 2.1 Verification Tiers

| Tier | Requirements | Limits | Services |
|------|-------------|--------|----------|
| Tier 0 (Unverified) | Email + phone | View-only, no transactions | Account browsing |
| Tier 1 (Basic) | Government ID + selfie | $500/day, $5,000/month | P2P transfers, deposits |
| Tier 2 (Standard) | Tier 1 + proof of address | $10,000/day, $50,000/month | All payments, card issuance |
| Tier 3 (Enhanced) | Tier 2 + source of funds | $50,000/day, $500,000/month | Investments, high-value transfers |
| Business (KYB) | Registration docs + UBO | Custom limits | Corporate accounts |

### 2.2 Identity Verification Providers

**Onfido Integration:**
- Document verification: passport, national ID, driver's licence (195+ countries)
- Facial similarity check with liveness detection
- Proof of address verification
- SDK integration for client-side document capture
- Webhook-based async result delivery

**Sumsub Integration:**
- Multi-level KYC with configurable flows
- Video verification for enhanced due diligence
- AML screening integrated into verification flow
- Applicant lifecycle management
- Multi-jurisdiction support

### 2.3 Verification Flow

```
User Submits Documents
        |
        v
Generate SDK Token (Onfido/Sumsub)
        |
        v
Client-Side Document Capture + Selfie
        |
        v
Provider Processes Verification
        |
        v
Webhook Received with Result
        |
   +----+----+
   |         |
APPROVED  REJECTED
   |         |
Update KYC  Notify User
Tier Level  (reason + retry option)
   |
Unlock Higher
Transaction Limits
```

### 2.4 Document Types

| Document | Accepted Variants |
|----------|-------------------|
| Identity | Passport, National ID, Driver's Licence, Residence Permit |
| Address | Utility bill (< 3 months), Bank statement, Government letter |
| Source of Funds | Employment letter, Tax returns, Business registration |
| Business | Certificate of incorporation, Articles of association, UBO register |

---

## 3. AML Transaction Monitoring

### 3.1 RegAI Service

The RegAI service (Python FastAPI + OPA) provides real-time regulatory decision-making:

```
Transaction Request
        |
        v
RegAI /v1/decision
        |
   +----+----+----+
   |    |    |    |
ALLOW  DENY  STEP_UP
   |    |    |
Process  Block  Request
Normally Transaction Additional
                     Verification
```

### 3.2 Detection Rules

**Velocity Checks:**
- Maximum transactions per hour/day/week
- Cumulative amount thresholds per period
- Rapid succession detection (structuring indicator)

**Amount Anomaly Detection:**
- Transactions > 3x user average flagged for review
- Large transaction reporting: $10,000+ (CTR filing)
- Just-below-threshold transactions (structuring detection)

**Geographic Risk:**
- Impossible travel detection (transactions from distant locations within short timeframes)
- VPN/proxy usage flagging
- High-risk jurisdiction monitoring

**Behavioural Analysis:**
- Account age and activity patterns
- Dormant account reactivation monitoring
- Sudden change in transaction patterns
- Peer group comparison

### 3.3 Jurisdiction-Specific Detectors

The platform includes detector configurations for specific jurisdictions:

| Detector | Jurisdiction | Purpose |
|----------|-------------|---------|
| hk_structuring_v1 | Hong Kong | Detect transaction structuring patterns |
| au_velocity_v1 | Australia | AUSTRAC velocity monitoring |
| ke_agent_float_anom_v1 | Kenya | Mobile money agent float anomalies |
| ca_velocity_interac_v1 | Canada | Interac e-Transfer velocity checks |

### 3.4 Risk Scoring

```
Risk Score (0-100) = Sum of:
  + Velocity score (0-30)
  + Amount anomaly score (0-20)
  + Geographic risk score (0-25)
  + Device risk score (0-15)
  + Behavioural score (0-10)

Risk Levels:
  0-25:  LOW      -> Auto-approve
  26-50: MEDIUM   -> Auto-approve with monitoring flag
  51-79: HIGH     -> Manual review required
  80-100: CRITICAL -> Auto-block, escalate to compliance
```

---

## 4. Sanctions Screening

### 4.1 Lists Screened

| List | Authority | Update Frequency |
|------|-----------|-----------------|
| SDN List | OFAC (US) | Daily |
| EU Consolidated List | EU Council | Weekly |
| UN Sanctions List | UN Security Council | As published |
| UK Sanctions List | OFSI | Weekly |
| PEP Lists | Commercial providers | Daily |

### 4.2 Screening Points

Sanctions screening occurs at:
1. **Onboarding**: When a user registers (name, date of birth, nationality)
2. **KYC Update**: When user information changes
3. **Transaction**: Real-time screening of counterparties for international transfers
4. **Periodic Review**: Batch re-screening of all users against updated lists (weekly)

### 4.3 Match Handling

```
Screening Result
        |
   +----+----+
   |         |
NO MATCH  POTENTIAL MATCH
   |         |
Continue  Manual Review Queue
Processing      |
           +---+---+
           |       |
      TRUE MATCH  FALSE POSITIVE
           |       |
      Block User  Whitelist +
      File SAR    Document
      Notify      Decision
      Compliance
```

---

## 5. Suspicious Activity Reporting

### 5.1 SAR/STR Filing

The RegAI service assists in generating Suspicious Activity Reports:

| Jurisdiction | Report Type | Authority | Deadline |
|-------------|------------|-----------|----------|
| US | SAR | FinCEN | 30 days |
| UK | SAR | NCA | Immediately (if consent required) |
| EU | STR | National FIU | Varies by country |
| Singapore | STR | STRO (MAS) | Within 1 business day |
| Nigeria | STR | NFIU (CBN) | Within 24 hours |
| Canada | STR | FINTRAC | 30 days |

### 5.2 Report Generation

```
POST /v1/report/sar
{
  "case_id": "case_12345",
  "narrative_hints": [
    "Structured deposits below $10,000 threshold",
    "Multiple accounts used by single individual",
    "Rapid fund movement pattern"
  ]
}
```

The service generates a draft narrative using LLM assistance, which must be reviewed and approved by a human compliance officer before filing.

---

## 6. Politically Exposed Persons (PEP)

### 6.1 PEP Categories

- Heads of state and government officials
- Senior political party officials
- Senior judicial officials
- Military officers of senior rank
- Senior executives of state-owned enterprises
- Family members and close associates of the above

### 6.2 Enhanced Due Diligence

When a PEP is identified:
1. Escalate to senior compliance officer
2. Obtain approval from MLRO (Money Laundering Reporting Officer)
3. Require source of funds documentation
4. Apply enhanced monitoring (lower thresholds, more frequent reviews)
5. Conduct annual relationship review

---

## 7. Country Risk Assessment

### 7.1 Risk Categories

| Category | Countries (Examples) | Action |
|----------|---------------------|--------|
| Sanctioned | North Korea, Iran, Syria, Cuba | Block all transactions |
| High Risk | Afghanistan, Yemen, South Sudan | Enhanced due diligence required |
| Medium Risk | Varies by FATF grey list | Standard due diligence with monitoring |
| Low Risk | EU, US, UK, Singapore, Japan | Standard due diligence |

### 7.2 FATF Grey/Black List Monitoring

The compliance team monitors FATF updates and adjusts country risk ratings:
- Black list: Full blocking of transactions
- Grey list: Enhanced monitoring, additional reporting requirements
- Jurisdiction-specific controls based on bilateral agreements

---

## 8. Record Keeping

### 8.1 Retention Requirements

| Record Type | Retention Period | Jurisdiction |
|------------|-----------------|-------------|
| KYC documents | 5 years after relationship end | All |
| Transaction records | 7 years | US, EU |
| SAR/STR filings | 5 years | All |
| Communication records | 5 years | All |
| AML screening results | 5 years | All |
| Audit logs | 10 years | Platform policy |

### 8.2 Data Protection

- All PII encrypted at rest (AES-256-GCM)
- Access to compliance data restricted to authorised compliance officers
- Right to erasure must be balanced with AML retention requirements
- Data residency enforcement per jurisdiction (GDPR, PDPA)

---

## 9. Compliance Reporting

### 9.1 Regular Reports

| Report | Frequency | Recipient |
|--------|-----------|-----------|
| Transaction monitoring summary | Daily | MLRO |
| Sanctions screening results | Weekly | Compliance team |
| PEP match review | Weekly | Senior compliance |
| KYC verification metrics | Monthly | Management |
| SAR filing summary | Monthly | Board |
| Regulatory compliance dashboard | Real-time | Compliance team |

### 9.2 Regulatory Reporting

| Jurisdiction | Report | Frequency |
|-------------|--------|-----------|
| US | CTR (Currency Transaction Report) | Per transaction > $10,000 |
| US | SAR | Within 30 days of detection |
| EU | STR | As required by national FIU |
| UK | SAR | Immediately if consent needed |
| Singapore | STR | Within 1 business day |
| Canada | LCTR (Large Cash Transaction Report) | Within 15 days |

---

## 10. Training and Awareness

### 10.1 Compliance Training Requirements

- All employees: Annual AML/CFT awareness training
- Customer-facing staff: Quarterly KYC procedure training
- Compliance team: Monthly regulatory update briefings
- Senior management: Semi-annual compliance risk assessment

### 10.2 Red Flag Indicators

Staff are trained to identify:
- Reluctance to provide identification
- Transactions with no apparent economic purpose
- Unusual patterns of deposits followed by immediate withdrawals
- Requests to avoid reporting thresholds
- Transactions involving sanctioned or high-risk jurisdictions

---

**Version:** 2.0
**Last Updated:** 2026-02-17
**Compliance Framework:** FATF Recommendations, PSD2/PSD3, BSA, MAS PS Act
