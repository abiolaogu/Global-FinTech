# Core Banking Guide -- Global FinTech Platform

## 1. Overview

The core banking layer of the Global FinTech platform is built on Apache Fineract 1.9+ (Java 17, Spring Boot 3.x) as the canonical fiat ledger, with a NestJS-based API layer providing wallet management, payment processing, and split payment capabilities. This document covers the end-to-end banking operations: account management, multi-currency wallets, fund transfers, and double-entry accounting.

---

## 2. Apache Fineract Integration

### 2.1 Architecture

Fineract serves as the source of truth for all fiat balances and accounting. The NestJS API communicates with Fineract via its REST APIs.

```
User Request -> NestJS API -> Ledger Facade -> Fineract REST API -> PostgreSQL
                                   |
                                   +-> Event Bus (wallet.credited, wallet.debited)
                                   +-> Audit Trail (Hyperledger Fabric attestation)
```

### 2.2 Multi-Tenancy

Fineract supports multi-tenancy for regional deployments:
- Each region/country operates as a separate tenant
- Tenant isolation at the database level
- Shared application infrastructure
- Tenant-specific configuration (currencies, limits, regulatory rules)

### 2.3 Key Fineract APIs

| Endpoint | Purpose |
|----------|---------|
| POST /fineract-provider/api/v1/clients | Create customer |
| POST /fineract-provider/api/v1/savingsaccounts | Create savings account |
| POST /fineract-provider/api/v1/savingsaccounts/{id}/transactions | Post transaction |
| GET /fineract-provider/api/v1/glaccounts | Chart of accounts |
| POST /fineract-provider/api/v1/journalentries | Manual journal entries |

---

## 3. Multi-Currency Wallet Management

### 3.1 Wallet Lifecycle

```
Created -> Active -> Frozen -> Active (unfrozen) -> Closed
                  -> Suspended -> Active (reinstated)
```

### 3.2 Supported Currencies

The platform supports 100+ currencies including:
- **Major fiat**: USD, EUR, GBP, JPY, CHF, CAD, AUD
- **African**: NGN, KES, ZAR, GHS, TZS, UGX, XOF, XAF
- **Asian**: INR, PHP, NPR, SGD, HKD, MYR, THB, VND
- **Latin American**: BRL, MXN, COP, CLP, ARS, PEN
- **Middle Eastern**: AED, SAR, QAR, BHD, KWD
- **Crypto (via separate module)**: BTC, ETH, USDC, USDT

### 3.3 Balance Model

Each wallet maintains four balance fields:

| Field | Description |
|-------|-------------|
| `balance` | Total ledger balance (sum of all confirmed transactions) |
| `available_balance` | Spendable balance (balance minus holds) |
| `pending_balance` | Transactions awaiting confirmation |
| `held_balance` | Funds reserved by authorization holds |

Invariant: `balance = available_balance + held_balance`

### 3.4 Concurrency Control

All balance-modifying operations use pessimistic write locks:

```typescript
const wallet = await queryRunner.manager.findOne(WalletEntity, {
  where: { walletId },
  lock: { mode: 'pessimistic_write' },
});
```

This prevents double-spending and ensures ACID guarantees across concurrent requests.

---

## 4. Transaction Processing

### 4.1 Credit Operations

Credits add funds to a wallet. Sources include:
- Bank transfer deposits (via virtual accounts)
- Payment gateway collections
- P2P transfer receipts
- Refunds
- Interest payments
- Promotional credits

Processing flow:
1. Validate wallet exists and is active
2. Acquire pessimistic lock on wallet
3. Calculate new balances
4. Create wallet_transaction record
5. Update wallet balances atomically
6. Emit `wallet.credited` event
7. Release lock

### 4.2 Debit Operations

Debits remove funds from a wallet. Uses include:
- Withdrawals
- P2P transfers (outbound)
- Bill payments
- Subscription fees
- Card transactions

Processing flow:
1. Validate wallet exists and is active
2. Acquire pessimistic lock on wallet
3. Check available balance >= debit amount
4. Calculate new balances
5. Create wallet_transaction record
6. Update wallet balances atomically
7. Emit `wallet.debited` event
8. Release lock

### 4.3 Transfer Operations

Transfers move funds between two wallets:

1. Validate both wallets exist and are active
2. Check currency match (or apply FX conversion)
3. Begin database transaction
4. Acquire pessimistic locks on both wallets (ordered by wallet_id to prevent deadlocks)
5. Check source available balance
6. Debit source wallet
7. Credit destination wallet
8. Create two transaction records (debit + credit)
9. Commit transaction
10. Emit `wallet.transfer_completed` event

### 4.4 Hold and Capture

Authorization holds reserve funds without transferring them:

**Hold creation:**
1. Check available balance >= hold amount
2. Decrease available_balance by hold amount
3. Increase held_balance by hold amount
4. Create wallet_hold record with expiry time

**Capture (settlement):**
1. Find active hold
2. Decrease held_balance by captured amount
3. Decrease balance by captured amount
4. Create debit transaction
5. Mark hold as captured

**Release:**
1. Find active hold
2. Decrease held_balance by hold amount
3. Increase available_balance by hold amount
4. Mark hold as released

---

## 5. Financial Calculations

### 5.1 Precision

All monetary calculations use Decimal.js to avoid floating-point errors:

```typescript
import Decimal from 'decimal.js';

const amount = new Decimal('1000.50');
const fee = amount.mul('0.015'); // 1.5% fee = 15.0075
const feeRounded = fee.toDecimalPlaces(2, Decimal.ROUND_HALF_UP); // 15.01
const net = amount.sub(feeRounded); // 985.49
```

### 5.2 FX Conversion

Currency conversion follows mid-market rates plus configurable spread:

```
converted_amount = source_amount * fx_rate * (1 + spread)
```

Spread by tier:
| Tier | FX Spread |
|------|-----------|
| Free | 1.5% |
| Silver | 1.0% |
| Gold | 0.5% |
| Platinum | 0.0% |

### 5.3 Fee Structure

| Transaction Type | Fee | Cap |
|-----------------|-----|-----|
| Domestic P2P transfer | Free | -- |
| International transfer | 0.5% - 2% + flat fee | Varies by corridor |
| Card transaction | 0% (debit) | -- |
| ATM withdrawal (tier-dependent) | $0 - $2 | -- |
| Crypto trading | 0.5% - 2% | -- |
| Virtual account deposit | Free | -- |

---

## 6. Double-Entry Accounting

### 6.1 Chart of Accounts

| Account Code | Account Name | Type |
|-------------|-------------|------|
| 1000 | Customer Deposits | Liability |
| 1100 | Safeguarding Account | Asset |
| 2000 | Revenue - Transaction Fees | Revenue |
| 2100 | Revenue - FX Spread | Revenue |
| 2200 | Revenue - Subscription | Revenue |
| 3000 | Operating Expenses | Expense |
| 4000 | Settlement Suspense | Liability |

### 6.2 Journal Entry Examples

**Customer Deposit (via bank transfer):**
```
DR 1100 Safeguarding Account     NGN 10,000
CR 1000 Customer Deposits        NGN 10,000
```

**P2P Transfer with fee:**
```
DR 1000 Customer Deposits (Sender)    USD 100.50
CR 1000 Customer Deposits (Receiver)  USD 100.00
CR 2000 Revenue - Transaction Fees    USD 0.50
```

**FX Conversion:**
```
DR 1000 Customer Deposits (USD)       USD 1,000
CR 1000 Customer Deposits (EUR)       EUR 920
CR 2100 Revenue - FX Spread           USD 15
```

---

## 7. Reconciliation

### 7.1 Daily Reconciliation Process

1. Sum all wallet balances by currency
2. Compare against Fineract general ledger
3. Compare against safeguarding bank account statements
4. Identify and investigate discrepancies > $0.01
5. Generate reconciliation report
6. Escalate unresolved differences

### 7.2 Gateway Reconciliation

Each payment gateway reconciliation:
1. Fetch settlement reports from provider API
2. Match against platform payment_transactions
3. Flag missing or mismatched transactions
4. Auto-resolve known patterns (timing differences)
5. Manual review queue for unresolved items

---

## 8. Limits and Controls

### 8.1 Transaction Limits by Tier

| Limit | Free | Silver | Gold | Platinum |
|-------|------|--------|------|----------|
| Daily transfer | $500 | $2,000 | $10,000 | $50,000 |
| Monthly transfer | $5,000 | $20,000 | $100,000 | $500,000 |
| Single transaction | $500 | $2,000 | $10,000 | $50,000 |
| Card daily spend | $500 | $2,000 | $10,000 | $50,000 |
| ATM daily withdrawal | $200 | $500 | $2,000 | $5,000 |

### 8.2 Velocity Controls

- Maximum 50 transactions per hour per user
- Maximum 200 transactions per day per user
- Amount anomaly detection: flag transactions > 3x user average
- Geographic velocity: flag transactions from different countries within 1 hour

---

## 9. Audit Trail

Every financial operation creates an immutable audit record:

```json
{
  "auditId": "aud_001",
  "userId": "usr_abc",
  "action": "WALLET_CREDIT",
  "resource": "wallet",
  "resourceId": "wal_def",
  "amount": "10000.00",
  "currency": "NGN",
  "ipAddress": "41.58.144.0",
  "userAgent": "AtlasX-Mobile/2.0",
  "timestamp": "2026-02-17T12:00:00Z",
  "metadata": {
    "source": "virtual_account",
    "provider": "paystack",
    "reference": "ref_001"
  }
}
```

Audit records are:
- Append-only (no updates or deletes)
- Attested to Hyperledger Fabric (hash anchoring)
- Retained for 10 years minimum
- Available for regulatory reporting

---

**Version:** 2.0
**Last Updated:** 2026-02-17
**Core Banking Engine:** Apache Fineract 1.9+
