# Use Cases — Global FinTech Platform (AtlasX)
> Version: 1.0 | Last Updated: 2026-02-18 | Status: Draft
> Classification: Internal | Author: AIDD System

## 1. Retail Banking Use Cases

### UC-01: Multi-Currency Account Opening
- **Actor**: Retail customer
- **Precondition**: User has valid ID document
- **Flow**: Register → KYC verification → Risk scoring → Account creation → Wallet provisioning
- **Postcondition**: User has active account with default currency wallet

### UC-02: Peer-to-Peer Transfer
- **Actor**: Retail customer
- **Precondition**: Sender has sufficient wallet balance
- **Flow**: Select recipient → Enter amount → RegAI check → Execute transfer → Notify both parties
- **Postcondition**: Funds debited from sender, credited to recipient within 30 seconds

### UC-03: Cross-Border Remittance
- **Actor**: Diaspora customer
- **Precondition**: Sender KYC complete, recipient details verified
- **Flow**: Initiate transfer → FX quote → Compliance check → Rail selection → Execute → Confirm
- **Postcondition**: Funds delivered via optimal rail (SWIFT/SEPA/M-Pesa)

### UC-04: Cryptocurrency Purchase
- **Actor**: Crypto-interested customer
- **Precondition**: User has fiat wallet balance, crypto module enabled
- **Flow**: Select crypto asset → View real-time price → Confirm purchase → Fiat debit → Crypto credit
- **Postcondition**: Crypto balance updated, Fabric attestation recorded

## 2. Business Use Cases

### UC-05: Business Onboarding (KYB)
- **Actor**: Business owner
- **Flow**: Submit business documents → Automated KYB → Risk assessment → Account activation → Card issuance

### UC-06: Split Payment Configuration
- **Actor**: Merchant
- **Flow**: Define split rules → Set recipients → Configure percentages/fixed amounts → Activate

### UC-07: Corporate Card Management
- **Actor**: Finance team
- **Flow**: Request cards → Set spending limits → Assign to employees → Monitor transactions

## 3. Compliance Use Cases

### UC-08: Suspicious Activity Investigation
- **Actor**: Compliance analyst
- **Flow**: Alert triggered → Case created → Transaction review → LLM-assisted SAR draft → Submit

### UC-09: Sanctions Screening
- **Actor**: System (automated)
- **Flow**: Transaction initiated → Screen parties → Match found → Block + escalate → Analyst review

## 4. Platform Administration Use Cases

### UC-10: System Health Monitoring
- **Actor**: Platform admin
- **Flow**: Dashboard review → Metric analysis → Alert triage → Incident response if needed
