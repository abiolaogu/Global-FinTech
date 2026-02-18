# Database Schema -- Global FinTech Platform

## 1. Overview

The Global FinTech platform uses PostgreSQL 15+ as its primary OLTP data store. The schema supports multi-currency wallets, payment processing, split payments, virtual accounts, recurring billing, investment products, lending, and compliance tracking. All monetary values use `DECIMAL(20,8)` or string representation to avoid floating-point precision errors.

---

## 2. Core Schema: Wallets

### 2.1 wallets

```sql
CREATE TABLE wallets (
    wallet_id       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         VARCHAR(255) NOT NULL,
    currency        VARCHAR(10) NOT NULL,
    label           VARCHAR(255),
    balance         DECIMAL(20,8) NOT NULL DEFAULT 0,
    available_balance DECIMAL(20,8) NOT NULL DEFAULT 0,
    pending_balance DECIMAL(20,8) NOT NULL DEFAULT 0,
    held_balance    DECIMAL(20,8) NOT NULL DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'active',
    metadata        JSONB,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_wallets_user_currency ON wallets(user_id, currency);
CREATE INDEX idx_wallets_status ON wallets(status) WHERE status = 'active';
CREATE INDEX idx_wallets_created ON wallets(created_at DESC);
CREATE UNIQUE INDEX idx_wallets_user_currency_unique ON wallets(user_id, currency);
```

Status values: `active`, `frozen`, `suspended`, `closed`

### 2.2 wallet_transactions

```sql
CREATE TABLE wallet_transactions (
    transaction_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id       UUID NOT NULL REFERENCES wallets(wallet_id),
    user_id         VARCHAR(255) NOT NULL,
    type            VARCHAR(20) NOT NULL,
    category        VARCHAR(50),
    amount          DECIMAL(20,8) NOT NULL,
    balance_before  DECIMAL(20,8) NOT NULL,
    balance_after   DECIMAL(20,8) NOT NULL,
    currency        VARCHAR(10) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'completed',
    description     TEXT,
    reference_id    VARCHAR(255),
    counterparty_wallet_id UUID,
    metadata        JSONB,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_transactions_wallet_date ON wallet_transactions(wallet_id, created_at DESC);
CREATE INDEX idx_transactions_user_date ON wallet_transactions(user_id, created_at DESC);
CREATE INDEX idx_transactions_status ON wallet_transactions(status);
CREATE INDEX idx_transactions_reference ON wallet_transactions(reference_id);
CREATE INDEX idx_transactions_wallet_status_date ON wallet_transactions(wallet_id, status, created_at DESC);
```

Type values: `credit`, `debit`, `transfer_in`, `transfer_out`, `hold`, `release`, `capture`

### 2.3 wallet_holds

```sql
CREATE TABLE wallet_holds (
    hold_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet_id       UUID NOT NULL REFERENCES wallets(wallet_id),
    amount          DECIMAL(20,8) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'active',
    description     TEXT,
    expires_at      TIMESTAMP WITH TIME ZONE NOT NULL,
    captured_amount DECIMAL(20,8),
    captured_at     TIMESTAMP WITH TIME ZONE,
    released_at     TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_active_holds ON wallet_holds(wallet_id, expires_at) WHERE status = 'active';
```

Status values: `active`, `captured`, `released`, `expired`

---

## 3. Payment Processing Schema

### 3.1 payment_gateways

```sql
CREATE TABLE payment_gateways (
    gateway_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider        VARCHAR(50) NOT NULL,
    display_name    VARCHAR(255),
    status          VARCHAR(20) NOT NULL DEFAULT 'active',
    supported_currencies JSONB,
    supported_countries JSONB,
    fee_structure   JSONB,
    config          JSONB,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_gateways_provider ON payment_gateways(provider);
CREATE INDEX idx_gateways_status ON payment_gateways(status);
```

### 3.2 payment_transactions

```sql
CREATE TABLE payment_transactions (
    transaction_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         VARCHAR(255) NOT NULL,
    gateway_id      UUID REFERENCES payment_gateways(gateway_id),
    provider        VARCHAR(50) NOT NULL,
    amount          DECIMAL(20,8) NOT NULL,
    currency        VARCHAR(10) NOT NULL,
    fee             DECIMAL(20,8) DEFAULT 0,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    provider_reference VARCHAR(255),
    authorization_url TEXT,
    callback_url    TEXT,
    ip_address      VARCHAR(45),
    user_agent      TEXT,
    metadata        JSONB,
    verified_at     TIMESTAMP WITH TIME ZONE,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_pay_txn_user ON payment_transactions(user_id, created_at DESC);
CREATE INDEX idx_pay_txn_provider_ref ON payment_transactions(provider, provider_reference);
CREATE INDEX idx_pay_txn_status ON payment_transactions(status);
```

Status values: `pending`, `completed`, `failed`, `refunded`, `disputed`

---

## 4. Split Payments Schema

### 4.1 split_payments

```sql
CREATE TABLE split_payments (
    split_id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source_wallet_id UUID NOT NULL REFERENCES wallets(wallet_id),
    total_amount    DECIMAL(20,8) NOT NULL,
    currency        VARCHAR(10) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'pending',
    recipient_wallet_id UUID REFERENCES wallets(wallet_id),
    split_type      VARCHAR(20) NOT NULL,
    split_value     DECIMAL(20,8) NOT NULL,
    calculated_amount DECIMAL(20,8),
    parent_split_id UUID,
    configuration_id UUID,
    metadata        JSONB,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_split_source ON split_payments(source_wallet_id);
CREATE INDEX idx_split_parent ON split_payments(parent_split_id);
```

### 4.2 split_configurations

```sql
CREATE TABLE split_configurations (
    configuration_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         VARCHAR(255) NOT NULL,
    name            VARCHAR(255) NOT NULL,
    description     TEXT,
    rules           JSONB NOT NULL,
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_split_config_user ON split_configurations(user_id);
```

---

## 5. Virtual Accounts Schema

### 5.1 virtual_accounts

```sql
CREATE TABLE virtual_accounts (
    virtual_account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         VARCHAR(255) NOT NULL,
    wallet_id       UUID REFERENCES wallets(wallet_id),
    provider        VARCHAR(50) NOT NULL,
    account_number  VARCHAR(50),
    bank_name       VARCHAR(255),
    account_name    VARCHAR(255),
    currency        VARCHAR(10) NOT NULL,
    account_type    VARCHAR(20) NOT NULL DEFAULT 'dedicated',
    status          VARCHAR(20) NOT NULL DEFAULT 'active',
    provider_reference VARCHAR(255),
    metadata        JSONB,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_va_user ON virtual_accounts(user_id);
CREATE INDEX idx_va_account ON virtual_accounts(account_number);
CREATE INDEX idx_va_provider ON virtual_accounts(provider, provider_reference);
```

### 5.2 virtual_account_transactions

```sql
CREATE TABLE virtual_account_transactions (
    transaction_id  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    virtual_account_id UUID NOT NULL REFERENCES virtual_accounts(virtual_account_id),
    amount          DECIMAL(20,8) NOT NULL,
    currency        VARCHAR(10) NOT NULL,
    sender_name     VARCHAR(255),
    sender_account  VARCHAR(50),
    sender_bank     VARCHAR(255),
    reference       VARCHAR(255),
    narration       TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'completed',
    provider_reference VARCHAR(255),
    wallet_transaction_id UUID REFERENCES wallet_transactions(transaction_id),
    metadata        JSONB,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_va_txn_account ON virtual_account_transactions(virtual_account_id, created_at DESC);
```

---

## 6. Recurring Payments Schema

### 6.1 recurring_payments

```sql
CREATE TABLE recurring_payments (
    recurring_payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         VARCHAR(255) NOT NULL,
    wallet_id       UUID REFERENCES wallets(wallet_id),
    amount          DECIMAL(20,8) NOT NULL,
    currency        VARCHAR(10) NOT NULL,
    frequency       VARCHAR(20) NOT NULL,
    description     TEXT,
    status          VARCHAR(20) NOT NULL DEFAULT 'active',
    payment_method_token VARCHAR(255),
    next_payment_date TIMESTAMP WITH TIME ZONE,
    last_payment_date TIMESTAMP WITH TIME ZONE,
    total_payments  INTEGER DEFAULT 0,
    failed_payments INTEGER DEFAULT 0,
    max_retries     INTEGER DEFAULT 3,
    start_date      TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date        TIMESTAMP WITH TIME ZONE,
    metadata        JSONB,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_recurring_user ON recurring_payments(user_id);
CREATE INDEX idx_recurring_status ON recurring_payments(status);
CREATE INDEX idx_recurring_next ON recurring_payments(next_payment_date) WHERE status = 'active';
```

Frequency values: `daily`, `weekly`, `biweekly`, `monthly`, `quarterly`, `yearly`
Status values: `active`, `paused`, `cancelled`, `completed`, `failed`

---

## 7. Payment Links Schema

### 7.1 payment_links

```sql
CREATE TABLE payment_links (
    link_id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         VARCHAR(255) NOT NULL,
    code            VARCHAR(20) NOT NULL UNIQUE,
    title           VARCHAR(255) NOT NULL,
    description     TEXT,
    amount_type     VARCHAR(20) NOT NULL,
    amount          DECIMAL(20,8),
    minimum_amount  DECIMAL(20,8),
    currency        VARCHAR(10) NOT NULL,
    status          VARCHAR(20) NOT NULL DEFAULT 'draft',
    custom_branding JSONB,
    custom_fields   JSONB,
    split_configuration_id UUID,
    max_payments    INTEGER,
    payment_count   INTEGER DEFAULT 0,
    total_collected DECIMAL(20,8) DEFAULT 0,
    view_count      INTEGER DEFAULT 0,
    expires_at      TIMESTAMP WITH TIME ZONE,
    metadata        JSONB,
    created_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at      TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_link_code ON payment_links(code);
CREATE INDEX idx_link_user ON payment_links(user_id);
CREATE INDEX idx_link_status ON payment_links(status);
```

---

## 8. Indexing Strategy

### 8.1 Design Principles

1. **Composite indexes** on columns frequently queried together (e.g., `user_id + created_at DESC`)
2. **Partial indexes** for filtered queries (e.g., `WHERE status = 'active'`)
3. **Covering indexes** for hot paths to avoid table lookups
4. **Unique constraints** enforced at the database level for data integrity
5. **No over-indexing**: every index has a corresponding query pattern

### 8.2 Total Index Count

- Wallets: 4 indexes
- Wallet Transactions: 5 indexes
- Wallet Holds: 1 partial index
- Payment Gateways: 2 indexes
- Payment Transactions: 3 indexes
- Split Payments: 2 indexes
- Split Configurations: 1 index
- Virtual Accounts: 3 indexes
- Virtual Account Transactions: 1 index
- Recurring Payments: 3 indexes
- Payment Links: 3 indexes

**Total: 28+ indexes**

---

## 9. Data Retention and Partitioning

### 9.1 Retention Policy

| Table | Retention | Archive Strategy |
|-------|-----------|-----------------|
| wallet_transactions | 7 years | Partition by month, archive to cold storage after 2 years |
| payment_transactions | 7 years | Same as above |
| virtual_account_transactions | 7 years | Same as above |
| audit_logs | 10 years | Immutable, append-only |
| wallet_holds | 90 days active, 1 year archive | Purge expired holds after 1 year |

### 9.2 Partitioning Plan

```sql
-- Time-based partitioning for wallet_transactions
CREATE TABLE wallet_transactions (
    -- columns as above
) PARTITION BY RANGE (created_at);

CREATE TABLE wallet_transactions_2026_01 PARTITION OF wallet_transactions
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');

CREATE TABLE wallet_transactions_2026_02 PARTITION OF wallet_transactions
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
```

---

## 10. Backup and Recovery

### 10.1 Backup Strategy

- **Cloud SQL (GCP)**: Automated daily backups at 02:00 UTC, 30-day retention
- **Point-in-time recovery**: Enabled with 7-day WAL retention
- **Manual backup**: `pg_dump -Fc atlasx > backup_$(date +%Y%m%d).dump`

### 10.2 Recovery Targets

| Metric | Target |
|--------|--------|
| RPO (Recovery Point Objective) | 5 minutes |
| RTO (Recovery Time Objective) | 30 minutes |

---

**Version:** 2.0
**Last Updated:** 2026-02-17
**Database Engine:** PostgreSQL 15+
