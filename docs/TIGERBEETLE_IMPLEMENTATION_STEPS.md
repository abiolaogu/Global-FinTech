# TigerBeetle Implementation Steps

This guide provides step-by-step instructions for integrating TigerBeetle into the Global FinTech platform.

## Prerequisites

- Node.js 18+ installed
- Docker and Docker Compose installed
- Access to the Global FinTech codebase
- Basic understanding of double-entry accounting

## Phase 1: Infrastructure Setup

### Step 1: Install TigerBeetle

**Option A: Using Docker (Recommended for Development)**

See `docker-compose.tigerbeetle.yml` in the project root.

```bash
cd /home/user/Global-FinTech
docker-compose -f docker-compose.tigerbeetle.yml up -d
```

**Option B: Native Installation**

```bash
# Download TigerBeetle binary
curl -L https://github.com/tigerbeetle/tigerbeetle/releases/latest/download/tigerbeetle-x86_64-linux.zip -o tigerbeetle.zip
unzip tigerbeetle.zip
chmod +x tigerbeetle

# Initialize cluster
./tigerbeetle format --cluster=0 --replica=0 --replica-count=1 0_0.tigerbeetle
./tigerbeetle start --addresses=3000 0_0.tigerbeetle
```

### Step 2: Install Node.js Client

```bash
cd apps/api
npm install tigerbeetle-node
```

### Step 3: Configure Environment Variables

Update `.env`:

```bash
# TigerBeetle Configuration
TIGERBEETLE_CLUSTER_ID=0
TIGERBEETLE_REPLICA_ADDRESSES=3000@127.0.0.1:3000

# For production with 3-node cluster:
# TIGERBEETLE_REPLICA_ADDRESSES=3000@node1:3000,3001@node2:3001,3002@node3:3002
```

### Step 4: Verify Installation

```bash
# Test TigerBeetle connection
curl http://localhost:3001/health/tigerbeetle

# Expected response:
# {
#   "service": "tigerbeetle",
#   "status": "healthy",
#   "latency_ms": 2
# }
```

## Phase 2: Code Integration

### Step 5: Register TigerBeetle Module

**File:** `apps/api/src/app.module.ts`

```typescript
import { TigerBeetleModule } from './modules/tigerbeetle/tigerbeetle.module';

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot(/* ... */),
    EventEmitterModule.forRoot(),

    // Add TigerBeetle module
    TigerBeetleModule,

    WalletsModule,
    // ... other modules
  ],
})
export class AppModule {}
```

### Step 6: Update Wallets Module

**File:** `apps/api/src/modules/wallets/wallets.module.ts`

```typescript
import { TigerBeetleService } from '../tigerbeetle/tigerbeetle.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      WalletEntity,
      WalletTransactionEntity,
      // ... other entities
    ]),
  ],
  providers: [
    WalletsService,
    WalletTopupService,
    CreditLineService,
    // TigerBeetleService is already available via @Global() decorator
  ],
  controllers: [/* ... */],
  exports: [/* ... */],
})
export class WalletsModule {}
```

### Step 7: Update WalletsService to Use TigerBeetle

**File:** `apps/api/src/modules/wallets/wallets.service.ts`

Add TigerBeetle integration:

```typescript
import { TigerBeetleService } from '../tigerbeetle/tigerbeetle.service';
import { AccountIdGenerator } from '../tigerbeetle/utils/account-id.generator';
import { TransferCode } from '../tigerbeetle/tigerbeetle.service';

@Injectable()
export class WalletsService {
  constructor(
    @InjectRepository(WalletEntity)
    private walletRepository: Repository<WalletEntity>,
    @InjectRepository(WalletTransactionEntity)
    private transactionRepository: Repository<WalletTransactionEntity>,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
    // Inject TigerBeetle service
    private tigerBeetleService: TigerBeetleService,
  ) {}

  /**
   * Create wallet - creates both PostgreSQL record and TigerBeetle account
   */
  async createWallet(dto: CreateWalletDto): Promise<WalletEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 1. Create TigerBeetle account
      const accountId = AccountIdGenerator.createWalletAccountId(
        dto.userId,
        dto.currency,
      );

      await this.tigerBeetleService.createAccount({
        id: accountId,
        ledger: 1,
        code: AccountIdGenerator.getCurrencyWalletCode(dto.currency),
        flags: AccountFlags.DEBITS_MUST_NOT_EXCEED_CREDITS,
      });

      // 2. Create PostgreSQL wallet record
      const wallet = new WalletEntity();
      wallet.walletId = dto.walletId || uuidv4();
      wallet.userId = dto.userId;
      wallet.currency = dto.currency;
      wallet.tigerBeetleAccountId = accountId.toString(); // Store TigerBeetle account ID
      wallet.balance = '0';
      wallet.availableBalance = '0';
      wallet.status = 'active';

      const saved = await queryRunner.manager.save(wallet);

      await queryRunner.commitTransaction();

      this.eventEmitter.emit('wallet.created', {
        walletId: saved.walletId,
        userId: dto.userId,
        currency: dto.currency,
        tigerBeetleAccountId: accountId.toString(),
      });

      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Credit wallet using TigerBeetle
   */
  async creditWallet(dto: CreditWalletDto): Promise<WalletTransactionEntity> {
    // 1. Get wallet
    const wallet = await this.walletRepository.findOne({
      where: { walletId: dto.walletId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    // 2. Create transfer in TigerBeetle
    const walletAccountId = BigInt(wallet.tigerBeetleAccountId);
    const platformFloatId = AccountIdGenerator.createPlatformFloatAccountId(wallet.currency);

    const amount = this.tigerBeetleService.toTigerBeetleAmount(dto.amount);

    const transfer = await this.tigerBeetleService.createTransfer({
      debit_account_id: platformFloatId,
      credit_account_id: walletAccountId,
      amount,
      ledger: 1,
      code: TransferCode.WALLET_DEPOSIT,
    });

    // 3. Sync balance from TigerBeetle
    const balance = await this.tigerBeetleService.getAccountBalance(walletAccountId);
    wallet.balance = this.tigerBeetleService.fromTigerBeetleAmount(balance.total_balance);
    wallet.availableBalance = this.tigerBeetleService.fromTigerBeetleAmount(balance.available_balance);
    wallet.lifetimeReceived = new Decimal(wallet.lifetimeReceived)
      .plus(dto.amount)
      .toFixed(8);
    wallet.transactionCount += 1;
    wallet.lastTransactionAt = new Date();

    await this.walletRepository.save(wallet);

    // 4. Create transaction record in PostgreSQL
    const transaction = new WalletTransactionEntity();
    transaction.transactionId = dto.transactionId || uuidv4();
    transaction.walletId = dto.walletId;
    transaction.userId = wallet.userId;
    transaction.type = 'credit';
    transaction.amount = dto.amount;
    transaction.balanceBefore = new Decimal(wallet.balance).minus(dto.amount).toFixed(8);
    transaction.balanceAfter = wallet.balance;
    transaction.category = dto.category;
    transaction.description = dto.description;
    transaction.reference = dto.reference;
    transaction.status = 'completed';
    transaction.tigerBeetleTransferId = transfer.id.toString();
    transaction.metadata = dto.metadata;

    const savedTxn = await this.transactionRepository.save(transaction);

    this.eventEmitter.emit('wallet.credited', {
      walletId: wallet.walletId,
      userId: wallet.userId,
      amount: dto.amount,
      transactionId: savedTxn.transactionId,
    });

    return savedTxn;
  }

  /**
   * Debit wallet using TigerBeetle
   */
  async debitWallet(dto: DebitWalletDto): Promise<WalletTransactionEntity> {
    const wallet = await this.walletRepository.findOne({
      where: { walletId: dto.walletId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    const walletAccountId = BigInt(wallet.tigerBeetleAccountId);
    const platformFloatId = AccountIdGenerator.createPlatformFloatAccountId(wallet.currency);

    const amount = this.tigerBeetleService.toTigerBeetleAmount(dto.amount);

    // Create transfer in TigerBeetle (will fail if insufficient funds)
    const transfer = await this.tigerBeetleService.createTransfer({
      debit_account_id: walletAccountId,
      credit_account_id: platformFloatId,
      amount,
      ledger: 1,
      code: TransferCode.WALLET_WITHDRAWAL,
    });

    // Sync balance from TigerBeetle
    const balance = await this.tigerBeetleService.getAccountBalance(walletAccountId);
    wallet.balance = this.tigerBeetleService.fromTigerBeetleAmount(balance.total_balance);
    wallet.availableBalance = this.tigerBeetleService.fromTigerBeetleAmount(balance.available_balance);
    wallet.lifetimeSent = new Decimal(wallet.lifetimeSent).plus(dto.amount).toFixed(8);
    wallet.transactionCount += 1;
    wallet.lastTransactionAt = new Date();

    await this.walletRepository.save(wallet);

    // Create transaction record
    const transaction = new WalletTransactionEntity();
    transaction.transactionId = dto.transactionId || uuidv4();
    transaction.walletId = dto.walletId;
    transaction.userId = wallet.userId;
    transaction.type = 'debit';
    transaction.amount = dto.amount;
    transaction.balanceBefore = new Decimal(wallet.balance).plus(dto.amount).toFixed(8);
    transaction.balanceAfter = wallet.balance;
    transaction.category = dto.category;
    transaction.description = dto.description;
    transaction.reference = dto.reference;
    transaction.status = 'completed';
    transaction.tigerBeetleTransferId = transfer.id.toString();
    transaction.metadata = dto.metadata;

    const savedTxn = await this.transactionRepository.save(transaction);

    this.eventEmitter.emit('wallet.debited', {
      walletId: wallet.walletId,
      userId: wallet.userId,
      amount: dto.amount,
      transactionId: savedTxn.transactionId,
    });

    return savedTxn;
  }

  /**
   * Transfer between wallets using TigerBeetle
   */
  async transferBetweenWallets(dto: TransferBetweenWalletsDto): Promise<any> {
    const fromWallet = await this.walletRepository.findOne({
      where: { walletId: dto.fromWalletId },
    });

    const toWallet = await this.walletRepository.findOne({
      where: { walletId: dto.toWalletId },
    });

    if (!fromWallet || !toWallet) {
      throw new NotFoundException('Wallet not found');
    }

    if (fromWallet.currency !== toWallet.currency) {
      throw new BadRequestException('Cannot transfer between different currencies');
    }

    const fromAccountId = BigInt(fromWallet.tigerBeetleAccountId);
    const toAccountId = BigInt(toWallet.tigerBeetleAccountId);
    const amount = this.tigerBeetleService.toTigerBeetleAmount(dto.amount);

    // Create transfer in TigerBeetle
    const transfer = await this.tigerBeetleService.createTransfer({
      debit_account_id: fromAccountId,
      credit_account_id: toAccountId,
      amount,
      ledger: 1,
      code: TransferCode.TRANSFER_WALLET,
    });

    // Sync balances for both wallets
    await this.syncWalletBalanceFromTigerBeetle(dto.fromWalletId);
    await this.syncWalletBalanceFromTigerBeetle(dto.toWalletId);

    // Create transaction records for both wallets
    // ... (implementation continues)

    return { transfer, fromWallet, toWallet };
  }

  /**
   * Sync wallet balance from TigerBeetle
   */
  async syncWalletBalanceFromTigerBeetle(walletId: string): Promise<void> {
    const wallet = await this.walletRepository.findOne({
      where: { walletId },
    });

    if (!wallet || !wallet.tigerBeetleAccountId) {
      throw new NotFoundException('Wallet not found');
    }

    const accountId = BigInt(wallet.tigerBeetleAccountId);
    const balance = await this.tigerBeetleService.getAccountBalance(accountId);

    wallet.balance = this.tigerBeetleService.fromTigerBeetleAmount(balance.total_balance);
    wallet.availableBalance = this.tigerBeetleService.fromTigerBeetleAmount(balance.available_balance);

    await this.walletRepository.save(wallet);
  }
}
```

### Step 8: Add TigerBeetle Account ID to Wallet Entity

**File:** `apps/api/src/modules/wallets/entities/wallet.entity.ts`

Add new field:

```typescript
@Entity('wallets')
export class WalletEntity {
  // ... existing fields

  @Column({ type: 'varchar', length: 50, nullable: true })
  tigerBeetleAccountId: string; // Stores TigerBeetle account ID as string

  // ... rest of fields
}
```

### Step 9: Create Database Migration

```bash
npm run migration:generate -- AddTigerBeetleAccountId
```

Or manually create:

**File:** `apps/api/src/migrations/[timestamp]-AddTigerBeetleAccountId.ts`

```typescript
export class AddTigerBeetleAccountId[timestamp] implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'wallets',
      new TableColumn({
        name: 'tigerbeetle_account_id',
        type: 'varchar',
        length: '50',
        isNullable: true,
      }),
    );

    await queryRunner.createIndex(
      'wallets',
      new TableIndex({
        name: 'IDX_wallet_tigerbeetle_account',
        columnNames: ['tigerbeetle_account_id'],
      }),
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('wallets', 'IDX_wallet_tigerbeetle_account');
    await queryRunner.dropColumn('wallets', 'tigerbeetle_account_id');
  }
}
```

### Step 10: Update Wallet Transaction Entity

**File:** `apps/api/src/modules/wallets/entities/wallet-transaction.entity.ts`

Add field to store TigerBeetle transfer ID:

```typescript
@Entity('wallet_transactions')
export class WalletTransactionEntity {
  // ... existing fields

  @Column({ type: 'varchar', length: 50, nullable: true })
  tigerBeetleTransferId: string;

  // ... rest of fields
}
```

## Phase 3: Data Migration

### Step 11: Create Migration Script

**File:** `apps/api/src/scripts/migrate-to-tigerbeetle.ts`

```typescript
import { AccountIdGenerator } from '../modules/tigerbeetle/utils/account-id.generator';
import { TigerBeetleService } from '../modules/tigerbeetle/tigerbeetle.service';
import { AccountFlags } from '../modules/tigerbeetle/tigerbeetle.service';

export class MigrateToTigerBeetle {
  constructor(
    private tigerBeetleService: TigerBeetleService,
    private walletRepository: Repository<WalletEntity>,
  ) {}

  async migrate() {
    console.log('Starting migration to TigerBeetle...');

    // 1. Get all wallets from PostgreSQL
    const wallets = await this.walletRepository.find();
    console.log(`Found ${wallets.length} wallets to migrate`);

    let migrated = 0;
    let failed = 0;

    for (const wallet of wallets) {
      try {
        // 2. Create TigerBeetle account for each wallet
        const accountId = AccountIdGenerator.createWalletAccountId(
          wallet.userId,
          wallet.currency,
        );

        // 3. Set initial balance
        const balanceAmount = this.tigerBeetleService.toTigerBeetleAmount(wallet.balance);

        await this.tigerBeetleService.createAccount({
          id: accountId,
          ledger: 1,
          code: AccountIdGenerator.getCurrencyWalletCode(wallet.currency),
          flags: AccountFlags.DEBITS_MUST_NOT_EXCEED_CREDITS,
          credits_posted: balanceAmount > 0n ? balanceAmount : 0n,
          debits_posted: 0n,
        });

        // 4. Update PostgreSQL wallet with TigerBeetle account ID
        wallet.tigerBeetleAccountId = accountId.toString();
        await this.walletRepository.save(wallet);

        migrated++;
        console.log(`Migrated wallet ${wallet.walletId} (${migrated}/${wallets.length})`);
      } catch (error) {
        failed++;
        console.error(`Failed to migrate wallet ${wallet.walletId}:`, error.message);
      }
    }

    console.log(`Migration complete: ${migrated} succeeded, ${failed} failed`);
  }

  async verify() {
    console.log('Verifying migration...');

    const wallets = await this.walletRepository.find({
      where: { tigerBeetleAccountId: Not(IsNull()) },
    });

    let verified = 0;
    let mismatched = 0;

    for (const wallet of wallets) {
      const accountId = BigInt(wallet.tigerBeetleAccountId);
      const balance = await this.tigerBeetleService.getAccountBalance(accountId);

      const pgBalance = parseFloat(wallet.balance);
      const tbBalance = parseFloat(this.tigerBeetleService.fromTigerBeetleAmount(balance.total_balance));

      if (Math.abs(pgBalance - tbBalance) < 0.01) {
        verified++;
      } else {
        mismatched++;
        console.warn(
          `Balance mismatch for wallet ${wallet.walletId}: ` +
          `PG=${pgBalance}, TB=${tbBalance}`,
        );
      }
    }

    console.log(`Verification complete: ${verified} matched, ${mismatched} mismatched`);
  }
}
```

### Step 12: Run Migration

```bash
npm run migration:run
npm run migrate:tigerbeetle
npm run verify:tigerbeetle
```

## Phase 4: Testing

### Step 13: Create Unit Tests

**File:** `apps/api/src/modules/tigerbeetle/tigerbeetle.service.spec.ts`

```typescript
describe('TigerBeetleService', () => {
  let service: TigerBeetleService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        TigerBeetleService,
        {
          provide: EventEmitter2,
          useValue: { emit: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<TigerBeetleService>(TigerBeetleService);
    await service.onModuleInit();
  });

  it('should create account', async () => {
    const accountId = service.generateAccountId('test-account');

    const account = await service.createAccount({
      id: accountId,
      ledger: 1,
      code: 1000,
      flags: AccountFlags.DEBITS_MUST_NOT_EXCEED_CREDITS,
    });

    expect(account).toBeDefined();
    expect(account.id).toBe(accountId);
  });

  it('should create transfer', async () => {
    // Create two test accounts
    const account1 = await service.createAccount({...});
    const account2 = await service.createAccount({...});

    // Create transfer
    const transfer = await service.createTransfer({
      debit_account_id: account1.id,
      credit_account_id: account2.id,
      amount: 10000n, // $100.00
      code: TransferCode.PAYMENT_SEND,
    });

    expect(transfer).toBeDefined();

    // Verify balances
    const balance1 = await service.getAccountBalance(account1.id);
    const balance2 = await service.getAccountBalance(account2.id);

    expect(balance1.total_balance).toBe(-10000n);
    expect(balance2.total_balance).toBe(10000n);
  });

  // More tests...
});
```

### Step 14: Integration Tests

Test full wallet operations with TigerBeetle:

```bash
npm run test:e2e -- wallets
```

## Phase 5: Deployment

### Step 15: Production Cluster Setup

For production, deploy a 3-node TigerBeetle cluster:

**Node 1:**
```bash
./tigerbeetle format --cluster=0 --replica=0 --replica-count=3 0_0.tigerbeetle
./tigerbeetle start --addresses=0.0.0.0:3000 --cache-grid=1GB 0_0.tigerbeetle
```

**Node 2:**
```bash
./tigerbeetle format --cluster=0 --replica=1 --replica-count=3 0_1.tigerbeetle
./tigerbeetle start --addresses=0.0.0.0:3001 --cache-grid=1GB 0_1.tigerbeetle
```

**Node 3:**
```bash
./tigerbeetle format --cluster=0 --replica=2 --replica-count=3 0_2.tigerbeetle
./tigerbeetle start --addresses=0.0.0.0:3002 --cache-grid=1GB 0_2.tigerbeetle
```

### Step 16: Update Environment for Production

```bash
TIGERBEETLE_CLUSTER_ID=0
TIGERBEETLE_REPLICA_ADDRESSES=3000@node1.example.com:3000,3001@node2.example.com:3001,3002@node3.example.com:3002
```

### Step 17: Deploy API with TigerBeetle

```bash
# Build API
npm run build

# Deploy with PM2 or Docker
pm2 start dist/main.js --name global-fintech-api

# Or Docker
docker-compose up -d
```

### Step 18: Monitor

Set up monitoring for:
- TigerBeetle cluster health
- Transfer latency
- Error rates
- Balance consistency

## Phase 6: Gradual Rollout

### Step 19: Feature Flag

Use feature flags to gradually enable TigerBeetle:

```typescript
const USE_TIGERBEETLE = process.env.USE_TIGERBEETLE === 'true';

async creditWallet(dto: CreditWalletDto) {
  if (USE_TIGERBEETLE) {
    return this.creditWalletWithTigerBeetle(dto);
  } else {
    return this.creditWalletLegacy(dto);
  }
}
```

### Step 20: Parallel Run

Run both systems in parallel and compare results:

```typescript
async creditWallet(dto: CreditWalletDto) {
  // Run both systems
  const [tigerBeetleResult, legacyResult] = await Promise.all([
    this.creditWalletWithTigerBeetle(dto),
    this.creditWalletLegacy(dto),
  ]);

  // Compare results
  if (tigerBeetleResult.balance !== legacyResult.balance) {
    this.logger.warn('Balance mismatch detected', {
      tigerBeetle: tigerBeetleResult.balance,
      legacy: legacyResult.balance,
    });
  }

  // Return TigerBeetle result
  return tigerBeetleResult;
}
```

## Troubleshooting

### TigerBeetle Connection Issues

```bash
# Check TigerBeetle is running
telnet localhost 3000

# Check logs
docker logs tigerbeetle-0

# Restart cluster
docker-compose -f docker-compose.tigerbeetle.yml restart
```

### Balance Mismatches

```bash
# Run verification script
npm run verify:tigerbeetle

# Sync specific wallet
curl -X POST http://localhost:3000/wallets/{walletId}/sync-balance
```

### Performance Issues

```bash
# Check TigerBeetle metrics
curl http://localhost:3000/health/tigerbeetle

# Increase cache grid size
# In production config: --cache-grid=4GB
```

## Next Steps

1. Complete wallet service integration
2. Update split payment service to use TigerBeetle linked transfers
3. Integrate credit line service with TigerBeetle
4. Update payment hold system to use pending transfers
5. Implement SMS/USSD sync with TigerBeetle
6. Create dashboards for monitoring TigerBeetle metrics
7. Document operational procedures

## References

- TigerBeetle Docs: https://docs.tigerbeetle.com
- Architecture Doc: `TIGERBEETLE_INTEGRATION_ARCHITECTURE.md`
- Node.js Client: https://github.com/tigerbeetle/tigerbeetle-node
