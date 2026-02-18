# TigerBeetle Integration Architecture

## Overview

TigerBeetle is a distributed financial accounting database designed for mission-critical safety and performance. It provides:
- **High Performance**: 1M+ TPS on commodity hardware
- **Double-Entry Accounting**: Native financial primitives
- **ACID Guarantees**: Strong consistency and atomicity
- **Financial Safety**: Built-in safeguards against overdrafts and race conditions
- **Low Latency**: Sub-millisecond transaction processing

## Integration Strategy

### Hybrid Architecture

We'll use a **hybrid storage approach**:
- **TigerBeetle**: Financial data (balances, transactions, ledger entries)
- **PostgreSQL**: Metadata, user info, configuration, audit logs

```
┌─────────────────────────────────────────────────────────┐
│                   Application Layer                      │
├─────────────────────────────────────────────────────────┤
│  TigerBeetle Service  │  PostgreSQL Services            │
│  - Wallet Balances    │  - User Management              │
│  - Transactions       │  - Configuration                │
│  - Credit Lines       │  - Audit Logs                   │
│  - Holds/Reserves     │  - Payment Gateway Metadata     │
└─────────────────────────────────────────────────────────┘
         ↓                           ↓
┌──────────────────┐        ┌──────────────────┐
│   TigerBeetle    │        │   PostgreSQL     │
│  (Financial DB)  │        │  (Metadata DB)   │
└──────────────────┘        └──────────────────┘
```

## TigerBeetle Account Schema

### Account Types (Ledger Codes)

TigerBeetle uses a Chart of Accounts approach. Each account has a ledger code:

```typescript
enum LedgerCode {
  // Asset Accounts (Debits increase, Credits decrease)
  USER_WALLET_USD = 1000,
  USER_WALLET_EUR = 1001,
  USER_WALLET_GBP = 1002,
  USER_WALLET_NGN = 1003,
  // ... other currencies

  // Liability Accounts (Credits increase, Debits decrease)
  PLATFORM_FLOAT_USD = 2000,
  PLATFORM_FLOAT_EUR = 2001,
  // ... other currencies

  // Credit Line Accounts
  USER_CREDIT_LINE = 3000,
  PLATFORM_CREDIT_POOL = 3001,

  // Reserve/Hold Accounts
  PAYMENT_HOLDS_USD = 4000,
  PAYMENT_HOLDS_EUR = 4001,
  // ... other currencies

  // Fee Accounts
  PLATFORM_FEES_USD = 5000,
  PLATFORM_FEES_EUR = 5001,
  // ... other currencies

  // Settlement Accounts
  GATEWAY_SETTLEMENT_PAYSTACK = 6000,
  GATEWAY_SETTLEMENT_FLUTTERWAVE = 6001,
  GATEWAY_SETTLEMENT_STRIPE = 6002,
  // ... other gateways
}
```

### Account ID Structure

TigerBeetle uses 128-bit account IDs. We'll encode:
- **Ledger Code** (32 bits): Account type/currency
- **User/Entity ID** (96 bits): Unique identifier

```
┌─────────────┬──────────────────────────────────────┐
│ Ledger Code │         User/Entity ID               │
│  (32 bits)  │           (96 bits)                  │
└─────────────┴──────────────────────────────────────┘
```

Example:
```typescript
// User wallet USD account
const accountId = createAccountId(
  LedgerCode.USER_WALLET_USD,
  userId // UUID
);

// Platform float USD account
const platformFloatId = createAccountId(
  LedgerCode.PLATFORM_FLOAT_USD,
  PLATFORM_ID
);
```

## Transaction Flows

### 1. Wallet Credit (Deposit)

```
Debit:  Platform Float (2000) - $100
Credit: User Wallet (1000)    + $100
```

TigerBeetle Transfer:
```typescript
{
  id: transfer_id,
  debit_account_id: platform_float_usd,
  credit_account_id: user_wallet_usd,
  amount: 10000, // $100.00 in cents
  ledger: 1,
  code: TransferCode.WALLET_DEPOSIT,
  flags: TransferFlags.NONE,
}
```

### 2. Wallet Debit (Payment)

```
Debit:  User Wallet (1000)     - $50
Credit: Merchant Wallet (1000) + $50
```

### 3. Payment Hold

Two-phase transfer in TigerBeetle:

**Phase 1: Create Hold (Pending)**
```typescript
{
  id: transfer_id,
  debit_account_id: user_wallet_usd,
  credit_account_id: payment_hold_usd,
  amount: 5000, // $50.00
  ledger: 1,
  code: TransferCode.PAYMENT_HOLD,
  flags: TransferFlags.PENDING,
  timeout: 3600, // 1 hour
}
```

**Phase 2a: Capture Hold (Complete)**
```typescript
{
  id: capture_transfer_id,
  debit_account_id: payment_hold_usd,
  credit_account_id: merchant_wallet_usd,
  amount: 5000,
  ledger: 1,
  code: TransferCode.PAYMENT_CAPTURE,
  flags: TransferFlags.POST_PENDING_TRANSFER,
  pending_id: transfer_id, // References the pending transfer
}
```

**Phase 2b: Void Hold (Cancel)**
```typescript
{
  id: void_transfer_id,
  debit_account_id: payment_hold_usd,
  credit_account_id: user_wallet_usd,
  amount: 5000,
  ledger: 1,
  code: TransferCode.PAYMENT_VOID,
  flags: TransferFlags.VOID_PENDING_TRANSFER,
  pending_id: transfer_id,
}
```

### 4. Credit Line Usage

```
Debit:  Platform Credit Pool (3001) - $200
Credit: User Wallet (1000)          + $200
```

Record user credit usage in separate transfer:
```
Debit:  User Credit Line (3000)     + $200
Credit: Platform Credit Pool (3001) - $200
```

### 5. Split Payment

Example: $100 payment split 70/30 between two merchants

```typescript
// Transfer 1: User → Merchant A (70%)
{
  debit_account_id: user_wallet_usd,
  credit_account_id: merchant_a_wallet_usd,
  amount: 7000, // $70.00
  code: TransferCode.SPLIT_PAYMENT,
  flags: TransferFlags.LINKED, // Part of batch
}

// Transfer 2: User → Merchant B (30%)
{
  debit_account_id: user_wallet_usd,
  credit_account_id: merchant_b_wallet_usd,
  amount: 3000, // $30.00
  code: TransferCode.SPLIT_PAYMENT,
  flags: TransferFlags.LINKED, // Part of batch
}
```

## TigerBeetle Account Configuration

### Account Flags

```typescript
enum AccountFlags {
  NONE = 0,
  LINKED = 1 << 0,              // Part of a linked chain
  DEBITS_MUST_NOT_EXCEED_CREDITS = 1 << 1,  // Prevent overdrafts
  CREDITS_MUST_NOT_EXCEED_DEBITS = 1 << 2,  // For certain account types
}
```

### User Wallet Account
```typescript
{
  id: account_id,
  debits_pending: 0,
  debits_posted: 0,
  credits_pending: 0,
  credits_posted: 0,
  user_data_128: user_uuid_as_u128,
  user_data_64: 0,
  user_data_32: 0,
  ledger: 1,
  code: LedgerCode.USER_WALLET_USD,
  flags: AccountFlags.DEBITS_MUST_NOT_EXCEED_CREDITS, // Prevent overdrafts
  timestamp: 0,
}
```

### Credit Line Account
```typescript
{
  id: account_id,
  ledger: 1,
  code: LedgerCode.USER_CREDIT_LINE,
  flags: AccountFlags.DEBITS_MUST_NOT_EXCEED_CREDITS, // Prevent over-borrowing
  // Set debits_posted to credit limit initially
  // As user uses credit, credits_posted increases
}
```

## Transfer Codes

```typescript
enum TransferCode {
  WALLET_DEPOSIT = 1,           // Top-up from external source
  WALLET_WITHDRAWAL = 2,        // Cash out to external
  PAYMENT_SEND = 3,             // P2P payment
  PAYMENT_RECEIVE = 4,          // Receive payment
  PAYMENT_HOLD = 5,             // Create hold
  PAYMENT_CAPTURE = 6,          // Capture held funds
  PAYMENT_VOID = 7,             // Void/cancel hold
  SPLIT_PAYMENT = 8,            // Split payment transaction
  CREDIT_ADVANCE = 9,           // Use credit line
  CREDIT_REPAYMENT = 10,        // Repay credit
  FEE_CHARGE = 11,              // Platform fee
  REFUND = 12,                  // Refund transaction
  TRANSFER_WALLET = 13,         // Transfer between own wallets
  SMS_SYNC_CREDIT = 14,         // Credit from SMS sync
  USSD_SYNC_CREDIT = 15,        // Credit from USSD sync
}
```

## Data Mapping Strategy

### PostgreSQL → TigerBeetle Mapping

| PostgreSQL Table | TigerBeetle Representation | Relationship |
|-----------------|---------------------------|--------------|
| `wallets` | Accounts (Ledger-based) | 1:1 - Each wallet = 1 TigerBeetle account |
| `wallet_transactions` | Transfers | 1:1 - Each transaction = 1+ transfers |
| `credit_lines` | Accounts (Special ledger) | 1:1 - Credit line = 1 account |
| `payment_holds` | Pending Transfers | 1:1 - Hold = pending transfer |
| `split_payments` | Linked Transfers | 1:N - Split = N linked transfers |

### Dual-Write Strategy

To maintain consistency between TigerBeetle and PostgreSQL:

```typescript
async creditWallet(dto: CreditWalletDto) {
  // 1. Create transfer in TigerBeetle (source of truth for balances)
  const transferResult = await tigerBeetleService.createTransfer({
    debit_account_id: platform_float_account,
    credit_account_id: user_wallet_account,
    amount: amountInCents,
    code: TransferCode.WALLET_DEPOSIT,
  });

  // 2. If successful, record metadata in PostgreSQL
  await this.transactionRepository.save({
    transactionId: dto.transactionId,
    walletId: dto.walletId,
    tigerBeetleTransferId: transferResult.id,
    amount: dto.amount,
    category: dto.category,
    metadata: dto.metadata,
    // Balance fields synced from TigerBeetle
  });

  // 3. Update PostgreSQL wallet record (cache of TigerBeetle balance)
  const balance = await tigerBeetleService.getAccountBalance(user_wallet_account);
  await this.walletRepository.update(dto.walletId, {
    balance: balance.credits_posted - balance.debits_posted,
    lastTransactionAt: new Date(),
  });
}
```

## Performance Benefits

### Current System (PostgreSQL Only)
- **Throughput**: ~1,000-5,000 TPS
- **Latency**: 10-50ms per transaction
- **Locking**: Row-level pessimistic locking needed
- **Scalability**: Vertical scaling limited

### With TigerBeetle
- **Throughput**: 1,000,000+ TPS
- **Latency**: <1ms per transaction
- **Locking**: Lock-free, optimistic concurrency
- **Scalability**: Horizontal scaling with replication

### Expected Improvements
- **100-1000x** faster transaction processing
- **No race conditions** - TigerBeetle handles concurrency natively
- **Guaranteed consistency** - Double-entry accounting enforced
- **Better auditability** - Immutable transaction log

## Account Design

### 1. User Wallet Accounts

For each user currency combination:
```
Account ID: Hash(USER_ID + CURRENCY + LEDGER_CODE)
Ledger: 1
Code: 1000-1999 (based on currency)
Flags: DEBITS_MUST_NOT_EXCEED_CREDITS
```

Balance calculation:
```
Available Balance = credits_posted - debits_posted - debits_pending
```

### 2. Credit Line Accounts

For each user with credit:
```
Account ID: Hash(USER_ID + "CREDIT_LINE")
Ledger: 1
Code: 3000
Initial Setup:
  - debits_posted = credit_limit (e.g., $5,000)
  - credits_posted = 0

As user uses credit:
  - credits_posted increases

Available Credit = debits_posted - credits_posted
```

### 3. Platform Float Accounts

Platform liquidity per currency:
```
Account ID: Hash("PLATFORM" + CURRENCY)
Ledger: 1
Code: 2000-2999
```

### 4. Hold Accounts

Temporary holding per currency:
```
Account ID: Hash("HOLDS" + CURRENCY)
Ledger: 1
Code: 4000-4999
```

## Implementation Components

### 1. TigerBeetle Client Service

**File:** `apps/api/src/modules/tigerbeetle/tigerbeetle.service.ts`

```typescript
@Injectable()
export class TigerBeetleService {
  private client: Client;

  async createAccount(dto: CreateAccountDto): Promise<Account>
  async getAccount(accountId: bigint): Promise<Account>
  async getAccountBalance(accountId: bigint): Promise<AccountBalance>
  async createTransfer(dto: CreateTransferDto): Promise<Transfer>
  async createPendingTransfer(dto: CreateTransferDto): Promise<Transfer>
  async postPendingTransfer(pendingId: bigint): Promise<Transfer>
  async voidPendingTransfer(pendingId: bigint): Promise<Transfer>
  async getAccountHistory(accountId: bigint): Promise<Transfer[]>
  async createLinkedTransfers(transfers: Transfer[]): Promise<TransferResult[]>
}
```

### 2. Account ID Generator

**File:** `apps/api/src/modules/tigerbeetle/utils/account-id.generator.ts`

```typescript
export class AccountIdGenerator {
  static createWalletAccountId(userId: string, currency: string): bigint {
    const ledgerCode = this.getCurrencyLedgerCode(currency);
    return this.combine(ledgerCode, userId);
  }

  static createCreditLineAccountId(userId: string): bigint {
    return this.combine(LedgerCode.USER_CREDIT_LINE, userId);
  }

  private static combine(ledgerCode: number, userId: string): bigint {
    // Encode ledger code in upper 32 bits, user ID hash in lower 96 bits
  }
}
```

### 3. Wallet Service Updates

**File:** `apps/api/src/modules/wallets/wallets.service.ts`

Update all wallet operations to use TigerBeetle:

```typescript
async creditWallet(dto: CreditWalletDto): Promise<WalletTransactionEntity> {
  // 1. Create transfer in TigerBeetle
  const accountId = AccountIdGenerator.createWalletAccountId(
    dto.userId,
    wallet.currency
  );

  const transfer = await this.tigerBeetle.createTransfer({
    debit_account_id: platformFloatAccount,
    credit_account_id: accountId,
    amount: this.toTigerBeetleAmount(dto.amount),
    ledger: 1,
    code: TransferCode.WALLET_DEPOSIT,
  });

  // 2. Record transaction metadata in PostgreSQL
  const transaction = await this.recordTransaction({
    ...dto,
    tigerBeetleTransferId: transfer.id,
  });

  // 3. Sync balance from TigerBeetle to PostgreSQL cache
  await this.syncWalletBalance(dto.walletId);

  return transaction;
}
```

### 4. Credit Line Integration

**File:** `apps/api/src/modules/wallets/services/credit-line.service.ts`

```typescript
async allocateCreditLine(dto: AllocateCreditLineDto): Promise<CreditLineEntity> {
  // 1. Create TigerBeetle account for user's credit line
  const creditAccountId = AccountIdGenerator.createCreditLineAccountId(dto.userId);

  await this.tigerBeetle.createAccount({
    id: creditAccountId,
    ledger: 1,
    code: LedgerCode.USER_CREDIT_LINE,
    debits_posted: this.toTigerBeetleAmount(dto.creditLimit),
    credits_posted: 0,
    flags: AccountFlags.DEBITS_MUST_NOT_EXCEED_CREDITS,
  });

  // 2. Record credit line metadata in PostgreSQL
  const creditLine = await this.creditLineRepository.save({
    userId: dto.userId,
    creditLimit: dto.creditLimit,
    tigerBeetleAccountId: creditAccountId.toString(),
  });

  return creditLine;
}

async useCredit(dto: UseCreditDto): Promise<any> {
  // 1. Transfer from credit pool to user wallet in TigerBeetle
  const creditAccountId = AccountIdGenerator.createCreditLineAccountId(dto.userId);
  const walletAccountId = AccountIdGenerator.createWalletAccountId(
    dto.userId,
    wallet.currency
  );

  // Two linked transfers (atomic)
  const transfers = await this.tigerBeetle.createLinkedTransfers([
    {
      // Draw from credit line
      debit_account_id: creditAccountId,
      credit_account_id: platformCreditPool,
      amount: amountInCents,
      code: TransferCode.CREDIT_ADVANCE,
      flags: TransferFlags.LINKED,
    },
    {
      // Credit user wallet
      debit_account_id: platformCreditPool,
      credit_account_id: walletAccountId,
      amount: amountInCents,
      code: TransferCode.CREDIT_ADVANCE,
      flags: TransferFlags.LINKED,
    },
  ]);

  // 2. Update PostgreSQL metadata
  await this.recordCreditUsage(dto, transfers);
}
```

### 5. Split Payment with TigerBeetle

**File:** `apps/api/src/modules/split-payments/split-payments.service.ts`

```typescript
async executeSplitPayment(dto: ExecuteSplitPaymentDto): Promise<any> {
  const splits = this.calculateSplits(dto.amount, dto.splitConfig);

  // Create linked transfers for atomic execution
  const transfers = splits.map((split, index) => ({
    id: generateTransferId(dto.paymentId, index),
    debit_account_id: payerWalletAccount,
    credit_account_id: split.recipientWalletAccount,
    amount: this.toTigerBeetleAmount(split.amount),
    ledger: 1,
    code: TransferCode.SPLIT_PAYMENT,
    flags: TransferFlags.LINKED, // All succeed or all fail
    user_data_128: split.recipientId,
  }));

  // Execute all transfers atomically
  const results = await this.tigerBeetle.createLinkedTransfers(transfers);

  // Record in PostgreSQL
  await this.recordSplitPaymentMetadata(dto, results);

  return results;
}
```

## Migration Strategy

### Phase 1: Parallel Run (Recommended)
1. Deploy TigerBeetle alongside PostgreSQL
2. Write to both systems simultaneously
3. Read from TigerBeetle for balances, PostgreSQL for metadata
4. Compare results for N days to ensure consistency
5. Once validated, make TigerBeetle primary

### Phase 2: Data Migration
```typescript
async migrateToPigerbeetle() {
  // 1. Create all accounts in TigerBeetle
  const wallets = await this.walletRepository.find();

  for (const wallet of wallets) {
    const accountId = AccountIdGenerator.createWalletAccountId(
      wallet.userId,
      wallet.currency
    );

    await this.tigerBeetle.createAccount({
      id: accountId,
      ledger: 1,
      code: this.getCurrencyLedgerCode(wallet.currency),
      // Set current balance
      credits_posted: this.toTigerBeetleAmount(wallet.balance),
      debits_posted: 0,
      flags: AccountFlags.DEBITS_MUST_NOT_EXCEED_CREDITS,
    });
  }

  // 2. Optionally replay historical transactions for audit trail
  // ...
}
```

### Phase 3: Cutover
1. Enable read-only mode on old system
2. Final sync from PostgreSQL to TigerBeetle
3. Verify balances match 100%
4. Switch application to TigerBeetle-primary mode
5. Monitor for issues
6. After stability period, deprecate old balance system

## Consistency Guarantees

### TigerBeetle Guarantees
- **Atomicity**: All transfers in a batch succeed or all fail
- **Isolation**: Serializable isolation level
- **Durability**: Replicated to multiple nodes before acknowledgment
- **No Lost Updates**: Impossible due to event sourcing

### Maintaining Sync Between Systems

**Option 1: TigerBeetle as Source of Truth (Recommended)**
```typescript
// Always query TigerBeetle for real-time balance
async getWalletBalance(walletId: string): Promise<string> {
  const account = await this.tigerBeetle.getAccount(accountId);
  const balance = account.credits_posted - account.debits_posted;
  return this.fromTigerBeetleAmount(balance);
}

// PostgreSQL stores only metadata and cached balance
```

**Option 2: Event Sourcing**
```typescript
// Subscribe to TigerBeetle events
this.tigerBeetle.on('transfer.created', async (transfer) => {
  await this.syncBalanceFromTigerBeetle(transfer.credit_account_id);
  await this.syncBalanceFromTigerBeetle(transfer.debit_account_id);
});
```

## Deployment Architecture

### TigerBeetle Cluster Setup

```
Production Setup (Minimum 3 nodes for HA):

┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│ TigerBeetle  │    │ TigerBeetle  │    │ TigerBeetle  │
│   Node 1     │◄──►│   Node 2     │◄──►│   Node 3     │
│  (Primary)   │    │  (Replica)   │    │  (Replica)   │
└──────────────┘    └──────────────┘    └──────────────┘
       ▲                   ▲                   ▲
       │                   │                   │
       └───────────────────┴───────────────────┘
                          │
                 ┌────────┴────────┐
                 │   API Cluster   │
                 │  (Load Balanced)│
                 └─────────────────┘
```

### Configuration

**Environment Variables:**
```bash
# TigerBeetle Cluster
TIGERBEETLE_CLUSTER_ID=0
TIGERBEETLE_REPLICA_ADDRESSES=3000@127.0.0.1:3000,3001@127.0.0.1:3001,3002@127.0.0.1:3002

# TigerBeetle Client
TIGERBEETLE_CLIENT_CONCURRENCY=32
TIGERBEETLE_CLIENT_MAX_MESSAGE_SIZE=1048576
```

### Docker Compose

```yaml
version: '3.8'

services:
  tigerbeetle-0:
    image: ghcr.io/tigerbeetle/tigerbeetle:latest
    command: start --addresses=0.0.0.0:3000
    ports:
      - "3000:3000"
    volumes:
      - tigerbeetle-0-data:/var/lib/tigerbeetle

  tigerbeetle-1:
    image: ghcr.io/tigerbeetle/tigerbeetle:latest
    command: start --addresses=0.0.0.0:3001
    ports:
      - "3001:3001"
    volumes:
      - tigerbeetle-1-data:/var/lib/tigerbeetle

  tigerbeetle-2:
    image: ghcr.io/tigerbeetle/tigerbeetle:latest
    command: start --addresses=0.0.0.0:3002
    ports:
      - "3002:3002"
    volumes:
      - tigerbeetle-2-data:/var/lib/tigerbeetle

volumes:
  tigerbeetle-0-data:
  tigerbeetle-1-data:
  tigerbeetle-2-data:
```

## Error Handling

### TigerBeetle Error Codes

```typescript
enum TigerBeetleError {
  OK = 0,
  LINKED_EVENT_FAILED = 1,
  DEBITS_EXCEED_CREDITS = 2,
  CREDITS_EXCEED_DEBITS = 3,
  RESERVED = 4,
  PENDING_TRANSFER_EXPIRED = 5,
  ACCOUNT_NOT_FOUND = 6,
  ACCOUNT_EXISTS = 7,
  TRANSFER_EXISTS = 8,
  // ... more error codes
}
```

### Error Mapping

```typescript
function mapTigerBeetleError(error: TigerBeetleError): HttpException {
  switch (error) {
    case TigerBeetleError.DEBITS_EXCEED_CREDITS:
      return new BadRequestException('Insufficient funds');

    case TigerBeetleError.ACCOUNT_NOT_FOUND:
      return new NotFoundException('Wallet not found');

    case TigerBeetleError.PENDING_TRANSFER_EXPIRED:
      return new BadRequestException('Payment hold expired');

    default:
      return new InternalServerErrorException('Transaction failed');
  }
}
```

## Monitoring & Observability

### Metrics to Track

1. **TigerBeetle Performance**
   - Transfer latency (p50, p95, p99)
   - Throughput (TPS)
   - Batch size
   - Error rate

2. **Consistency Metrics**
   - PostgreSQL vs TigerBeetle balance drift
   - Sync lag
   - Failed sync count

3. **Business Metrics**
   - Total value locked in TigerBeetle
   - Active accounts
   - Transfer volume by code
   - Credit line utilization

### Health Checks

```typescript
@Get('health/tigerbeetle')
async checkTigerBeetleHealth(): Promise<any> {
  const start = Date.now();

  // Create test account and transfer
  const testAccountId = generateTestAccountId();
  await this.tigerBeetle.createAccount({ id: testAccountId });

  const latency = Date.now() - start;

  return {
    status: 'healthy',
    latency_ms: latency,
    cluster_size: 3,
  };
}
```

## Advantages for This Platform

### 1. Wallet Operations
- **Before**: Pessimistic locking, ~10ms latency, risk of deadlocks
- **After**: Lock-free, <1ms latency, zero deadlocks

### 2. Split Payments
- **Before**: Sequential updates, potential inconsistency
- **After**: Atomic linked transfers, guaranteed consistency

### 3. Credit Lines
- **Before**: Manual balance tracking, potential overdraft bugs
- **After**: Native account limits, impossible to over-borrow

### 4. Payment Holds
- **Before**: Manual hold tracking, risk of double-capture
- **After**: Native pending transfers with timeout

### 5. SMS/USSD Sync
- **Before**: High latency on sync
- **After**: Sub-second balance queries, instant sync

### 6. Scalability
- **Before**: Limited to ~5K TPS, vertical scaling only
- **After**: 1M+ TPS, horizontal scaling with replication

## Cost Considerations

### Infrastructure Costs
- **TigerBeetle**: Lightweight, ~2GB RAM per node
- **Replication**: 3 nodes minimum for HA
- **Storage**: Efficient append-only log

### Operational Costs
- **Reduced database costs**: Move financial data off expensive PostgreSQL
- **Better resource utilization**: Higher throughput per server
- **Simpler operations**: No complex locking or isolation tuning

## Next Steps

See `TIGERBEETLE_IMPLEMENTATION_STEPS.md` for detailed implementation checklist.

1. Set up TigerBeetle cluster (Docker/Kubernetes)
2. Implement TigerBeetle service layer
3. Create account ID generators
4. Update wallet services to use TigerBeetle
5. Implement dual-write strategy
6. Create balance sync mechanism
7. Migration from PostgreSQL balances
8. Testing and validation
9. Gradual rollout with feature flags
10. Monitor and optimize

## References

- TigerBeetle Docs: https://docs.tigerbeetle.com
- TigerBeetle GitHub: https://github.com/tigerbeetle/tigerbeetle
- Node.js Client: https://github.com/tigerbeetle/tigerbeetle-node
