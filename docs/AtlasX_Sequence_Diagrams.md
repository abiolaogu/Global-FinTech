# AtlasX Sequence Diagrams

## Overview

This document contains Mermaid sequence diagrams for key user flows in AtlasX. These diagrams can be rendered in any Mermaid-compatible tool or directly in GitHub/GitLab markdown files.

**Version:** 1.0
**Date:** 2025-11-14

---

## 1. User Sign-Up + Basic KYC Submission

```mermaid
sequenceDiagram
    actor User
    participant MobileApp
    participant APIGateway
    participant AuthService
    participant CustomerService
    participant KYCService
    participant ThirdPartyKYC
    participant EventBus

    User->>MobileApp: Enter email, password, phone
    MobileApp->>APIGateway: POST /auth/register
    APIGateway->>AuthService: Create user account
    AuthService->>CustomerService: Create customer profile
    CustomerService->>CustomerService: Generate user_id, hash password
    CustomerService-->>AuthService: User created
    AuthService->>AuthService: Generate JWT token
    AuthService-->>APIGateway: Return JWT + user_id
    APIGateway-->>MobileApp: 201 Created + auth token
    MobileApp-->>User: Registration successful

    User->>MobileApp: Upload ID documents
    MobileApp->>APIGateway: POST /kyc/submit (JWT)
    APIGateway->>KYCService: Process KYC submission
    KYCService->>ThirdPartyKYC: Submit documents (Onfido/Jumio)
    ThirdPartyKYC-->>KYCService: Verification pending
    KYCService->>KYCService: Create KYC profile (status: pending)
    KYCService-->>APIGateway: KYC submitted
    APIGateway-->>MobileApp: 202 Accepted
    MobileApp-->>User: Verification in progress

    ThirdPartyKYC->>KYCService: Webhook: Verification complete
    KYCService->>KYCService: Update KYC status: verified
    KYCService->>EventBus: Publish KYCApproved event
    EventBus->>CustomerService: Handle KYCApproved
    CustomerService->>CustomerService: Enable account features
    KYCService->>MobileApp: Push notification: KYC approved
    MobileApp-->>User: Account verified!
```

**Description:**
- User registers with email/password
- AuthService generates JWT token for authentication
- User uploads KYC documents (ID, proof of address)
- KYCService integrates with third-party provider (Onfido, Jumio)
- Asynchronous verification via webhook
- Event-driven account activation

---

## 2. Funding a Wallet and FX Conversion

```mermaid
sequenceDiagram
    actor User
    participant MobileApp
    participant APIGateway
    participant PaymentService
    participant WalletService
    participant LedgerService
    participant BankingPartner
    participant FXService
    participant EventBus

    User->>MobileApp: Initiate bank transfer (USD 1000)
    MobileApp->>APIGateway: POST /payments/deposit (JWT)
    APIGateway->>PaymentService: Process deposit
    PaymentService->>PaymentService: Create payment transaction (pending)
    PaymentService->>BankingPartner: Initiate ACH/wire transfer
    BankingPartner-->>PaymentService: Transfer initiated
    PaymentService-->>APIGateway: Payment pending
    APIGateway-->>MobileApp: 202 Accepted + payment_id
    MobileApp-->>User: Deposit pending (2-3 days)

    BankingPartner->>PaymentService: Webhook: Funds settled
    PaymentService->>PaymentService: Update status: completed
    PaymentService->>WalletService: Credit wallet (USD)
    WalletService->>LedgerService: Create ledger entries (debit: external, credit: wallet)
    LedgerService->>LedgerService: Write double-entry records
    LedgerService-->>WalletService: Balance updated
    WalletService->>EventBus: Publish WalletFunded event
    EventBus->>MobileApp: Push: USD 1000 received

    User->>MobileApp: Convert USD 500 to EUR
    MobileApp->>APIGateway: POST /fx/convert
    APIGateway->>FXService: Request FX conversion
    FXService->>FXService: Fetch current USD/EUR rate
    FXService->>WalletService: Reserve USD 500 from wallet
    WalletService->>LedgerService: Create reservation entry
    FXService->>FXService: Calculate EUR amount (minus fees)
    FXService->>WalletService: Debit USD wallet, Credit EUR wallet
    WalletService->>LedgerService: Write FX transaction entries
    LedgerService-->>WalletService: Balances updated
    WalletService-->>FXService: Conversion complete
    FXService-->>APIGateway: FX transaction successful
    APIGateway-->>MobileApp: 200 OK + new balances
    MobileApp-->>User: Conversion complete (EUR 455 received)
```

**Description:**
- User initiates bank deposit via ACH/wire
- Asynchronous settlement (2-3 days typical)
- Webhook notification when funds arrive
- Double-entry ledger records for audit trail
- FX conversion with real-time rates
- Multi-currency wallet support

---

## 3. Card Payment (Happy Path)

```mermaid
sequenceDiagram
    actor User
    participant Merchant
    participant CardNetwork
    participant CardProcessor
    participant APIGateway
    participant CardService
    participant WalletService
    participant LedgerService
    participant FraudEngine
    participant EventBus

    User->>Merchant: Tap/swipe AtlasX card (USD 50)
    Merchant->>CardNetwork: Authorization request
    CardNetwork->>CardProcessor: Route to AtlasX (Marqeta/Stripe)
    CardProcessor->>APIGateway: POST /cards/authorize
    APIGateway->>CardService: Process authorization
    CardService->>CardService: Validate card status (active)
    CardService->>FraudEngine: Check transaction risk
    FraudEngine-->>CardService: Risk: LOW
    CardService->>WalletService: Check balance + daily limit
    WalletService-->>CardService: Sufficient funds
    CardService->>WalletService: Reserve funds (USD 50)
    WalletService->>LedgerService: Create pending authorization entry
    LedgerService-->>WalletService: Reserved
    CardService-->>APIGateway: Authorization approved
    APIGateway-->>CardProcessor: 200 OK (approved)
    CardProcessor-->>CardNetwork: Approved
    CardNetwork-->>Merchant: Payment authorized
    Merchant-->>User: Payment successful

    CardProcessor->>APIGateway: POST /cards/settlement (T+1)
    APIGateway->>CardService: Settle transaction
    CardService->>WalletService: Convert reservation to final charge
    WalletService->>LedgerService: Complete ledger entry (debit wallet)
    LedgerService-->>WalletService: Settled
    CardService->>EventBus: Publish CardTransactionCompleted
    EventBus->>MobileApp: Push: USD 50 spent at Merchant
    MobileApp-->>User: Transaction notification
```

**Description:**
- Real-time card authorization flow
- Fraud check integration
- Fund reservation during authorization
- Settlement typically T+1 (next day)
- Double-entry ledger for both authorization and settlement
- Push notification to user

---

## 4. Placing a Simple Market Trade (Buy BTC)

```mermaid
sequenceDiagram
    actor User
    participant MobileApp
    participant APIGateway
    participant TradingService
    participant WalletService
    participant LedgerService
    participant BrokerAPI
    participant PositionService
    participant EventBus

    User->>MobileApp: Buy 0.01 BTC (market order)
    MobileApp->>APIGateway: POST /trades/orders (JWT)
    APIGateway->>TradingService: Create trade order
    TradingService->>TradingService: Validate order (market, buy, 0.01 BTC)
    TradingService->>TradingService: Fetch current BTC price (USD 45,000)
    TradingService->>TradingService: Calculate required funds (USD 450 + fees)
    TradingService->>WalletService: Reserve USD 460 from wallet
    WalletService->>LedgerService: Create fund reservation
    LedgerService-->>WalletService: Reserved
    WalletService-->>TradingService: Funds reserved
    TradingService->>TradingService: Create order record (status: pending)
    TradingService-->>APIGateway: Order created
    APIGateway-->>MobileApp: 201 Created + order_id
    MobileApp-->>User: Order submitted

    TradingService->>BrokerAPI: Submit market order (Alpaca/exchange)
    BrokerAPI->>BrokerAPI: Execute order on market
    BrokerAPI-->>TradingService: Order filled (avg: USD 45,020)
    TradingService->>TradingService: Update order status: filled
    TradingService->>WalletService: Finalize USD debit (USD 450.20 + $9.80 fee)
    WalletService->>LedgerService: Write final ledger entries
    LedgerService-->>WalletService: USD debited
    TradingService->>PositionService: Create/update BTC position (+0.01 BTC)
    PositionService->>PositionService: Calculate cost basis (USD 45,020)
    PositionService-->>TradingService: Position updated
    TradingService->>EventBus: Publish TradeExecuted event
    EventBus->>MobileApp: Push: BTC purchase complete
    MobileApp-->>User: 0.01 BTC added to portfolio
```

**Description:**
- User places market order for crypto/stock
- Fund reservation before broker submission
- Integration with third-party broker (Alpaca, Interactive Brokers)
- Position management with cost basis tracking
- Ledger entries for audit trail
- Real-time notification on trade execution

---

## 5. Withdrawal Flow (Wallet to Bank)

```mermaid
sequenceDiagram
    actor User
    participant MobileApp
    participant APIGateway
    participant PaymentService
    participant WalletService
    participant LedgerService
    participant ComplianceService
    participant BankingPartner
    participant EventBus

    User->>MobileApp: Request withdrawal (USD 1000)
    MobileApp->>APIGateway: POST /payments/withdraw (JWT)
    APIGateway->>PaymentService: Process withdrawal
    PaymentService->>ComplianceService: AML/fraud check
    ComplianceService-->>PaymentService: Approved
    PaymentService->>WalletService: Check balance + daily limit
    WalletService-->>PaymentService: Sufficient funds
    PaymentService->>WalletService: Reserve USD 1000 + fees
    WalletService->>LedgerService: Create reservation
    LedgerService-->>WalletService: Reserved
    PaymentService->>BankingPartner: Initiate wire/ACH
    BankingPartner-->>PaymentService: Transfer initiated
    PaymentService-->>APIGateway: Withdrawal pending
    APIGateway-->>MobileApp: 202 Accepted + payment_id
    MobileApp-->>User: Withdrawal in progress (1-3 days)

    BankingPartner->>PaymentService: Webhook: Transfer completed
    PaymentService->>PaymentService: Update status: completed
    PaymentService->>WalletService: Finalize debit
    WalletService->>LedgerService: Complete ledger entry
    LedgerService-->>WalletService: Balance updated
    PaymentService->>EventBus: Publish WithdrawalCompleted
    EventBus->>MobileApp: Push: Funds sent to bank
    MobileApp-->>User: Withdrawal complete
```

**Description:**
- Compliance check before withdrawal
- Fund reservation during processing
- Integration with banking partner
- Asynchronous settlement
- Audit trail via ledger

---

## 6. P2P Transfer (User to User)

```mermaid
sequenceDiagram
    actor Sender
    participant MobileApp
    participant APIGateway
    participant PaymentService
    participant WalletService
    participant LedgerService
    participant RewardService
    participant EventBus

    Sender->>MobileApp: Send USD 100 to @recipient
    MobileApp->>APIGateway: POST /payments/p2p (JWT)
    APIGateway->>PaymentService: Process P2P transfer
    PaymentService->>WalletService: Check sender balance
    WalletService-->>PaymentService: Sufficient funds
    PaymentService->>WalletService: Reserve USD 100 from sender
    WalletService->>LedgerService: Create reservation
    LedgerService-->>WalletService: Reserved
    PaymentService->>PaymentService: Validate recipient exists
    PaymentService->>WalletService: Execute transfer (atomic)
    WalletService->>LedgerService: Debit sender, Credit recipient
    LedgerService-->>WalletService: Balances updated
    PaymentService->>PaymentService: Update status: completed
    PaymentService->>EventBus: Publish PaymentCompleted
    EventBus->>RewardService: Handle PaymentCompleted
    RewardService->>RewardService: Accrue reward points
    EventBus->>MobileApp: Push to sender: Sent USD 100
    EventBus->>MobileApp: Push to recipient: Received USD 100
    MobileApp-->>Sender: Transfer successful
```

**Description:**
- Instant P2P transfer within platform
- Atomic ledger update (both debit and credit)
- Reward points accrued for transaction
- Real-time notifications to both parties
- No external payment rail involved

---

## 7. Reward Points Redemption

```mermaid
sequenceDiagram
    actor User
    participant MobileApp
    participant APIGateway
    participant RewardService
    participant WalletService
    participant LedgerService
    participant EventBus

    User->>MobileApp: Redeem 10,000 points for USD 100
    MobileApp->>APIGateway: POST /rewards/redeem (JWT)
    APIGateway->>RewardService: Process redemption
    RewardService->>RewardService: Check points balance
    RewardService->>RewardService: Validate redemption rules
    RewardService->>RewardService: Mark points as redeemed
    RewardService->>WalletService: Credit wallet (USD 100)
    WalletService->>LedgerService: Create ledger entry (reward redemption)
    LedgerService-->>WalletService: Balance updated
    RewardService->>EventBus: Publish RewardPointsRedeemed
    EventBus->>MobileApp: Push: Reward redeemed
    RewardService-->>APIGateway: Redemption successful
    APIGateway-->>MobileApp: 200 OK + new balances
    MobileApp-->>User: USD 100 credited to wallet
```

**Description:**
- User redeems accumulated points
- Validation of points balance and redemption rules
- Wallet credit via ledger entry
- Event-driven analytics tracking

---

## 8. Multi-Currency FX Swap

```mermaid
sequenceDiagram
    actor User
    participant MobileApp
    participant APIGateway
    participant FXService
    participant WalletService
    participant LedgerService
    participant ExternalFXProvider
    participant EventBus

    User->>MobileApp: Swap USD 1000 for GBP
    MobileApp->>APIGateway: POST /fx/swap (JWT)
    APIGateway->>FXService: Process FX swap
    FXService->>ExternalFXProvider: Get USD/GBP rate
    ExternalFXProvider-->>FXService: Rate: 1.27
    FXService->>FXService: Calculate amounts (fee inclusive)
    FXService->>WalletService: Reserve USD 1000
    WalletService->>LedgerService: Create reservation
    LedgerService-->>WalletService: Reserved
    FXService->>WalletService: Execute swap (atomic)
    WalletService->>LedgerService: Debit USD 1000, Credit GBP 787.40
    LedgerService->>LedgerService: Record fee entry (USD 12.60)
    LedgerService-->>WalletService: Balances updated
    FXService->>EventBus: Publish FXSwapCompleted
    EventBus->>MobileApp: Push: FX swap complete
    FXService-->>APIGateway: Swap successful
    APIGateway-->>MobileApp: 200 OK + new balances
    MobileApp-->>User: Received GBP 787.40
```

**Description:**
- Real-time FX rate from provider
- Fee calculation and display
- Atomic multi-currency wallet update
- Audit trail with separate fee entry

---

## Usage

**Rendering these diagrams:**

1. **GitHub/GitLab:** Diagrams render automatically in markdown files
2. **Mermaid Live Editor:** https://mermaid.live/
3. **VS Code:** Install "Markdown Preview Mermaid Support" extension
4. **Documentation sites:** Docusaurus, MkDocs support Mermaid natively

**Customization:**
- Add/remove participants as services evolve
- Adjust granularity based on audience (exec summary vs. technical deep-dive)
- Include error paths for comprehensive documentation

---

**Document End**
