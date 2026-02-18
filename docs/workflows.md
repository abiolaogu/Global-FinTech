# Workflows — Global FinTech Platform (AtlasX)
> Version: 1.0 | Last Updated: 2026-02-18 | Status: Draft
> Classification: Internal | Author: AIDD System

## 1. User Onboarding Flow

```
1. User registers (email/phone)
2. Identity verification (KYC)
   a. Document upload (passport/ID)
   b. Liveness check (selfie)
   c. Onfido/Jumio verification
3. Sanctions screening (RegAI → OFAC/EU/UN)
4. Risk scoring (ML model)
5. Account creation (Fineract)
6. Multi-currency wallet provisioning
7. Welcome notification (SendGrid/Twilio)
```

## 2. Payment Processing Flow

```
1. User initiates payment
2. Wallet balance check
3. RegAI policy decision (ALLOW/DENY/STEP_UP)
4. If STEP_UP → 2FA verification
5. Payment gateway selection (strategy pattern)
6. Provider API call (Paystack/Stripe/Flutterwave/etc.)
7. Kafka event published
8. Wallet balance updated (debit source, credit destination)
9. Hyperledger Fabric attestation recorded
10. Transaction notification sent
```

## 3. Split Payment Flow

```
1. Merchant configures split rules (percentage/fixed/hybrid)
2. Customer initiates payment
3. Payment processed via gateway
4. Split engine calculates distributions
5. Individual wallet credits executed
6. Settlement reports generated
```

## 4. Cross-Border Payment Flow

```
1. User initiates international transfer
2. FX rate lookup (real-time interbank + margin)
3. RegAI compliance check (source + destination jurisdiction)
4. Sanctions screening (both parties)
5. Source wallet debited (original currency)
6. FX conversion executed
7. Payment rail selection (SWIFT/SEPA/ACH/M-Pesa)
8. Destination credit
9. Blockchain attestation
10. Confirmation notifications
```

## 5. Crypto Trading Flow

```
1. User selects crypto pair (e.g., NGN → BTC)
2. Real-time price from Chainlink oracle
3. Fiat wallet balance check
4. Fiat debit + crypto credit
5. Cross-chain bridge if needed (Polygon/Stellar/Ripple)
6. Fabric ledger attestation
7. Portfolio update
```

## 6. Compliance Investigation Flow

```
1. Transaction monitoring alert triggered
2. RegAI case creation
3. Analyst review in compliance dashboard
4. LLM-assisted SAR narrative draft
5. Supervisor approval
6. SAR/STR filing to relevant authority
7. Case closure and archival
```
