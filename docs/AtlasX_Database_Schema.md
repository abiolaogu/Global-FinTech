# AtlasX Database Schema Design

## Overview

This document defines the core database schema for AtlasX, following PostgreSQL best practices and ensuring data integrity, auditability, and scalability.

**Version:** 1.0
**Date:** 2025-11-14
**Database:** PostgreSQL 15+

---

## 1. Schema Organization

```
atlasx_db/
├── public (default schema - core tables)
├── audit (audit logs and event sourcing)
├── analytics (denormalized views for reporting)
└── partitions (partitioned table data)
```

---

## 2. Core Domain Entities

### 2.1 User / Customer

**Purpose:** Core identity entity representing a platform user.

**Table: `users`**

```sql
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    country_code CHAR(2) NOT NULL,  -- ISO 3166-1 alpha-2
    tier_id UUID REFERENCES tiers(tier_id),
    status VARCHAR(20) NOT NULL DEFAULT 'active',  -- active, suspended, closed
    email_verified BOOLEAN DEFAULT FALSE,
    phone_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT valid_status CHECK (status IN ('active', 'suspended', 'closed', 'pending_verification'))
);

CREATE INDEX idx_users_email ON users(email) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_phone ON users(phone_number) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_status ON users(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_users_created_at ON users(created_at DESC);
```

**Description:**
- Single user can have multiple wallets and KYC profiles
- Soft delete via `deleted_at` for audit trail
- Email and phone unique constraints ignore deleted records

---

### 2.2 KYC Profile

**Purpose:** Compliance record for identity verification per jurisdiction.

**Table: `kyc_profiles`**

```sql
CREATE TABLE kyc_profiles (
    kyc_profile_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    jurisdiction_code CHAR(2) NOT NULL,  -- ISO 3166-1 alpha-2
    verification_level VARCHAR(30) NOT NULL DEFAULT 'unverified',
    -- unverified, basic, enhanced, institutional
    verified_at TIMESTAMP WITH TIME ZONE,
    expiry_date DATE,
    provider VARCHAR(50),  -- Onfido, Jumio, Sumsub
    provider_reference VARCHAR(255),
    provider_response JSONB,  -- Full KYC provider response
    documents JSONB,  -- Array of submitted documents
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- pending, approved, rejected, expired
    rejection_reason TEXT,
    reviewed_by UUID REFERENCES users(user_id),
    reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT valid_verification_level CHECK (verification_level IN ('unverified', 'basic', 'enhanced', 'institutional')),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'approved', 'rejected', 'expired')),
    CONSTRAINT unique_user_jurisdiction UNIQUE (user_id, jurisdiction_code)
);

CREATE INDEX idx_kyc_user_id ON kyc_profiles(user_id);
CREATE INDEX idx_kyc_status ON kyc_profiles(status);
CREATE INDEX idx_kyc_jurisdiction ON kyc_profiles(jurisdiction_code);
CREATE INDEX idx_kyc_provider_ref ON kyc_profiles(provider, provider_reference);
```

---

### 2.3 Currency

**Purpose:** Reference data for supported fiat and crypto currencies.

**Table: `currencies`**

```sql
CREATE TABLE currencies (
    currency_code VARCHAR(10) PRIMARY KEY,  -- USD, EUR, BTC, ETH, etc.
    name VARCHAR(100) NOT NULL,
    symbol VARCHAR(10),  -- $, €, ₿, Ξ
    currency_type VARCHAR(10) NOT NULL,  -- fiat, crypto
    decimal_places SMALLINT NOT NULL DEFAULT 2,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT valid_currency_type CHECK (currency_type IN ('fiat', 'crypto'))
);

CREATE INDEX idx_currencies_active ON currencies(is_active);
CREATE INDEX idx_currencies_type ON currencies(currency_type);

-- Seed data
INSERT INTO currencies (currency_code, name, symbol, currency_type, decimal_places) VALUES
('USD', 'US Dollar', '$', 'fiat', 2),
('EUR', 'Euro', '€', 'fiat', 2),
('GBP', 'British Pound', '£', 'fiat', 2),
('BTC', 'Bitcoin', '₿', 'crypto', 8),
('ETH', 'Ethereum', 'Ξ', 'crypto', 8),
('USDC', 'USD Coin', 'USDC', 'crypto', 6);
```

---

### 2.4 Wallet

**Purpose:** Multi-currency account container owned by a user.

**Table: `wallets`**

```sql
CREATE TABLE wallets (
    wallet_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    currency_code VARCHAR(10) NOT NULL REFERENCES currencies(currency_code),
    wallet_number VARCHAR(30) UNIQUE NOT NULL,  -- Human-readable ID
    balance DECIMAL(24, 8) NOT NULL DEFAULT 0,  -- Cached snapshot
    available_balance DECIMAL(24, 8) NOT NULL DEFAULT 0,  -- Excludes reserved
    reserved_balance DECIMAL(24, 8) NOT NULL DEFAULT 0,  -- Pending transactions
    status VARCHAR(20) NOT NULL DEFAULT 'active',  -- active, frozen, closed
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT valid_status CHECK (status IN ('active', 'frozen', 'closed')),
    CONSTRAINT balance_non_negative CHECK (balance >= 0),
    CONSTRAINT available_non_negative CHECK (available_balance >= 0),
    CONSTRAINT reserved_non_negative CHECK (reserved_balance >= 0),
    CONSTRAINT balance_integrity CHECK (balance = available_balance + reserved_balance),
    CONSTRAINT unique_user_currency UNIQUE (user_id, currency_code)
);

CREATE INDEX idx_wallets_user_id ON wallets(user_id);
CREATE INDEX idx_wallets_currency ON wallets(currency_code);
CREATE INDEX idx_wallets_number ON wallets(wallet_number);
CREATE INDEX idx_wallets_status ON wallets(status);
```

**Notes:**
- One wallet per currency per user
- `balance` is materialized view of ledger entries
- `available_balance` = balance - reserved (for pending transactions)
- Constraints ensure data integrity

---

### 2.5 Ledger Entry

**Purpose:** Immutable double-entry bookkeeping record.

**Table: `ledger_entries`**

```sql
CREATE TABLE ledger_entries (
    entry_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id UUID NOT NULL REFERENCES wallets(wallet_id),
    transaction_id UUID NOT NULL,  -- References payment, trade, card_tx, etc.
    transaction_type VARCHAR(50) NOT NULL,
    -- payment, trade, card_auth, card_settlement, reward, fee, fx_conversion
    entry_type VARCHAR(10) NOT NULL,  -- debit, credit
    amount DECIMAL(24, 8) NOT NULL,
    balance_after DECIMAL(24, 8) NOT NULL,  -- Running balance snapshot
    description TEXT,
    metadata JSONB,  -- Flexible additional data
    idempotency_key VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT valid_entry_type CHECK (entry_type IN ('debit', 'credit')),
    CONSTRAINT amount_positive CHECK (amount > 0)
);

-- Partitioning by created_at (monthly)
CREATE TABLE ledger_entries_2025_11 PARTITION OF ledger_entries
    FOR VALUES FROM ('2025-11-01') TO ('2025-12-01');

CREATE INDEX idx_ledger_wallet_created ON ledger_entries(wallet_id, created_at DESC);
CREATE INDEX idx_ledger_transaction_id ON ledger_entries(transaction_id);
CREATE INDEX idx_ledger_type ON ledger_entries(transaction_type);
CREATE INDEX idx_ledger_idempotency ON ledger_entries(idempotency_key) WHERE idempotency_key IS NOT NULL;
CREATE INDEX idx_ledger_created_at ON ledger_entries(created_at DESC);
```

**Notes:**
- Immutable: no updates or deletes allowed (except via retention policy)
- Partition by month for performance
- `balance_after` is a running balance snapshot
- `metadata` stores additional context (partner_id, external_ref, etc.)

---

### 2.6 Payment Transaction

**Purpose:** High-level payment orchestration record.

**Table: `payment_transactions`**

```sql
CREATE TABLE payment_transactions (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sender_wallet_id UUID REFERENCES wallets(wallet_id),
    receiver_wallet_id UUID REFERENCES wallets(wallet_id),
    amount DECIMAL(24, 8) NOT NULL,
    currency_code VARCHAR(10) NOT NULL REFERENCES currencies(currency_code),
    fee_amount DECIMAL(24, 8) DEFAULT 0,
    exchange_rate DECIMAL(18, 8),  -- For cross-currency payments
    payment_method VARCHAR(50) NOT NULL,
    -- wallet, bank_transfer, card, crypto
    payment_rail VARCHAR(50),  -- SWIFT, SEPA, ACH, mobile_money
    external_reference VARCHAR(255),  -- SWIFT code, ACH trace, etc.
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- pending, processing, completed, failed, reversed
    failure_reason TEXT,
    idempotency_key VARCHAR(255) UNIQUE NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT valid_status CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'reversed')),
    CONSTRAINT amount_positive CHECK (amount > 0)
);

CREATE INDEX idx_payment_sender ON payment_transactions(sender_wallet_id, created_at DESC);
CREATE INDEX idx_payment_receiver ON payment_transactions(receiver_wallet_id, created_at DESC);
CREATE INDEX idx_payment_status ON payment_transactions(status);
CREATE INDEX idx_payment_idempotency ON payment_transactions(idempotency_key);
CREATE INDEX idx_payment_created_at ON payment_transactions(created_at DESC);
```

---

### 2.7 Card

**Purpose:** Physical or virtual payment card linked to a wallet.

**Table: `cards`**

```sql
CREATE TABLE cards (
    card_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    wallet_id UUID NOT NULL REFERENCES wallets(wallet_id),
    card_type VARCHAR(20) NOT NULL,  -- physical, virtual
    card_network VARCHAR(20) NOT NULL,  -- visa, mastercard
    pan_token VARCHAR(255) NOT NULL,  -- Tokenized PAN from processor
    last_4_digits CHAR(4) NOT NULL,
    expiry_month SMALLINT NOT NULL,
    expiry_year SMALLINT NOT NULL,
    cvv_hash VARCHAR(255),
    processor VARCHAR(50) NOT NULL,  -- marqeta, stripe, adyen
    processor_card_id VARCHAR(255) NOT NULL,
    spending_limit_daily DECIMAL(24, 8),
    spending_limit_monthly DECIMAL(24, 8),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- pending, active, frozen, cancelled, expired
    pin_set BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    activated_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT valid_card_type CHECK (card_type IN ('physical', 'virtual')),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'active', 'frozen', 'cancelled', 'expired')),
    CONSTRAINT valid_expiry_month CHECK (expiry_month BETWEEN 1 AND 12),
    CONSTRAINT valid_expiry_year CHECK (expiry_year >= EXTRACT(YEAR FROM NOW()))
);

CREATE INDEX idx_cards_user_id ON cards(user_id);
CREATE INDEX idx_cards_wallet_id ON cards(wallet_id);
CREATE INDEX idx_cards_processor ON cards(processor, processor_card_id);
CREATE INDEX idx_cards_status ON cards(status);
```

---

### 2.8 Trade Order

**Purpose:** Investment order for stocks, FX, or crypto.

**Table: `trade_orders`**

```sql
CREATE TABLE trade_orders (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    settlement_wallet_id UUID NOT NULL REFERENCES wallets(wallet_id),
    asset_type VARCHAR(20) NOT NULL,  -- stock, crypto, fx
    asset_symbol VARCHAR(20) NOT NULL,  -- AAPL, BTC, USD/EUR
    order_type VARCHAR(20) NOT NULL,  -- market, limit, stop
    side VARCHAR(10) NOT NULL,  -- buy, sell
    quantity DECIMAL(24, 8) NOT NULL,
    limit_price DECIMAL(24, 8),
    executed_quantity DECIMAL(24, 8) DEFAULT 0,
    average_fill_price DECIMAL(24, 8),
    broker VARCHAR(50),  -- alpaca, interactive_brokers
    broker_order_id VARCHAR(255),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    -- pending, submitted, partial, filled, cancelled, failed
    failure_reason TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    executed_at TIMESTAMP WITH TIME ZONE,

    CONSTRAINT valid_asset_type CHECK (asset_type IN ('stock', 'crypto', 'fx')),
    CONSTRAINT valid_order_type CHECK (order_type IN ('market', 'limit', 'stop')),
    CONSTRAINT valid_side CHECK (side IN ('buy', 'sell')),
    CONSTRAINT valid_status CHECK (status IN ('pending', 'submitted', 'partial', 'filled', 'cancelled', 'failed')),
    CONSTRAINT quantity_positive CHECK (quantity > 0)
);

CREATE INDEX idx_orders_user_created ON trade_orders(user_id, created_at DESC);
CREATE INDEX idx_orders_status ON trade_orders(status);
CREATE INDEX idx_orders_broker ON trade_orders(broker, broker_order_id);
CREATE INDEX idx_orders_asset ON trade_orders(asset_type, asset_symbol);
```

---

### 2.9 Position (Holding)

**Purpose:** Current investment holdings per user and asset.

**Table: `positions`**

```sql
CREATE TABLE positions (
    position_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    asset_type VARCHAR(20) NOT NULL,  -- stock, crypto, fx
    asset_symbol VARCHAR(20) NOT NULL,
    quantity DECIMAL(24, 8) NOT NULL,
    average_cost_basis DECIMAL(24, 8) NOT NULL,
    current_market_value DECIMAL(24, 8),
    unrealized_pnl DECIMAL(24, 8),  -- Calculated field
    realized_pnl DECIMAL(24, 8) DEFAULT 0,
    last_updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT valid_asset_type CHECK (asset_type IN ('stock', 'crypto', 'fx')),
    CONSTRAINT quantity_non_negative CHECK (quantity >= 0),
    CONSTRAINT unique_user_asset UNIQUE (user_id, asset_symbol)
);

CREATE INDEX idx_positions_user ON positions(user_id);
CREATE INDEX idx_positions_asset ON positions(asset_symbol);
```

---

### 2.10 Reward Points

**Purpose:** User loyalty balance tracking.

**Table: `reward_points`**

```sql
CREATE TABLE reward_points (
    reward_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(user_id),
    points DECIMAL(12, 2) NOT NULL,
    transaction_type VARCHAR(50) NOT NULL,
    -- payment, trade, referral, signup_bonus, manual_adjustment
    source_transaction_id UUID,  -- FK to payment, trade, etc.
    description TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    redeemed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    CONSTRAINT points_not_zero CHECK (points != 0)
);

CREATE INDEX idx_rewards_user_expiry ON reward_points(user_id, expires_at) WHERE redeemed_at IS NULL;
CREATE INDEX idx_rewards_user_created ON reward_points(user_id, created_at DESC);
CREATE INDEX idx_rewards_source ON reward_points(source_transaction_id) WHERE source_transaction_id IS NOT NULL;
```

---

### 2.11 Tier

**Purpose:** Membership level configuration.

**Table: `tiers`**

```sql
CREATE TABLE tiers (
    tier_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) UNIQUE NOT NULL,  -- Free, Silver, Gold, Platinum
    level INTEGER UNIQUE NOT NULL,  -- 0, 1, 2, 3 (for ordering)
    min_balance_requirement DECIMAL(24, 8) DEFAULT 0,
    min_monthly_volume DECIMAL(24, 8) DEFAULT 0,
    fx_fee_discount_pct DECIMAL(5, 2) DEFAULT 0,
    reward_multiplier DECIMAL(5, 2) DEFAULT 1.0,
    monthly_card_limit DECIMAL(24, 8),
    daily_withdrawal_limit DECIMAL(24, 8),
    benefits_json JSONB,  -- Flexible tier benefits
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_tiers_level ON tiers(level);

-- Seed data
INSERT INTO tiers (name, level, min_balance_requirement, fx_fee_discount_pct, reward_multiplier) VALUES
('Free', 0, 0, 0, 1.0),
('Silver', 1, 1000, 10, 1.2),
('Gold', 2, 10000, 20, 1.5),
('Platinum', 3, 100000, 50, 2.0);
```

---

## 3. Audit & Event Tables

### 3.1 Audit Log

**Table: `audit.audit_log`**

```sql
CREATE SCHEMA IF NOT EXISTS audit;

CREATE TABLE audit.audit_log (
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(user_id),
    action VARCHAR(100) NOT NULL,  -- login, payment_created, kyc_approved
    entity_type VARCHAR(50),  -- user, payment, wallet
    entity_id UUID,
    ip_address INET,
    user_agent TEXT,
    request_id VARCHAR(255),
    changes JSONB,  -- Before/after values
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_audit_user_created ON audit.audit_log(user_id, created_at DESC);
CREATE INDEX idx_audit_entity ON audit.audit_log(entity_type, entity_id);
CREATE INDEX idx_audit_action ON audit.audit_log(action);
```

---

### 3.2 Domain Events

**Table: `audit.domain_events`**

```sql
CREATE TABLE audit.domain_events (
    event_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    aggregate_id UUID NOT NULL,
    aggregate_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_events_type ON audit.domain_events(event_type);
CREATE INDEX idx_events_aggregate ON audit.domain_events(aggregate_type, aggregate_id);
CREATE INDEX idx_events_created ON audit.domain_events(created_at DESC);
```

---

## 4. Indexes Summary

**Critical Indexes:**
1. Foreign key indexes on all FK columns
2. Composite indexes for common query patterns (user_id + created_at)
3. Partial indexes for filtered queries (WHERE deleted_at IS NULL)
4. Unique indexes for idempotency keys

**Index Maintenance:**
- Monitor index usage: `pg_stat_user_indexes`
- Remove unused indexes
- Rebuild bloated indexes: `REINDEX`
- Use `EXPLAIN ANALYZE` for query optimization

---

## 5. Data Retention & Archival

**Retention Policies:**
- Ledger entries: 7 years (regulatory requirement)
- Audit logs: 7 years
- User data: Until account deletion + 30 days
- KYC documents: 5 years after account closure

**Archival Strategy:**
- Move old ledger entries to cold storage (S3 Glacier)
- Partition pruning for old data
- Compressed backups

---

## 6. Security Considerations

**Encryption:**
- TLS 1.3 for data in transit
- Transparent Data Encryption (TDE) for data at rest
- Application-level encryption for PII (using pgcrypto)

**Access Control:**
- Role-based access (RBAC) via PostgreSQL roles
- Principle of least privilege
- Read-only replicas for analytics

**PII Protection:**
- Hash sensitive fields (password, CVV)
- Tokenize card numbers (never store plain PAN)
- Mask PII in logs

---

## 7. Performance Optimization

**Query Optimization:**
- Use EXPLAIN ANALYZE for slow queries
- Avoid SELECT *; specify columns
- Use indexes for WHERE, JOIN, ORDER BY clauses
- Batch inserts/updates

**Connection Pooling:**
- PgBouncer or application-level pooling (TypeORM)
- Max connections: 100 (adjust based on load)

**Read Replicas:**
- Route read-heavy queries to replicas
- Eventual consistency acceptable for reports

---

## 8. Migration Strategy

**TypeORM Migrations:**

```typescript
// Example migration
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUsersTable1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE users (
        user_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email VARCHAR(255) UNIQUE NOT NULL,
        ...
      );
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE users;`);
  }
}
```

**Best Practices:**
- Version control all migrations
- Test migrations on staging first
- Blue-green deployment for zero downtime
- Rollback plan for each migration

---

**Document End**
