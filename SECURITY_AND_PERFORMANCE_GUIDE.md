# Security and Performance Optimization Guide

## Security Best Practices

### 1. Data Encryption

#### At Rest
```typescript
// AES-256-GCM Encryption Implementation
private encryptSensitiveData(data: string): string {
  const algorithm = 'aes-256-gcm';
  const key = Buffer.from(process.env.ENCRYPTION_KEY, 'hex'); // 64 hex chars = 256 bits
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
}
```

**What to Encrypt**:
- API keys and secrets
- Payment method tokens
- Bank account details
- Personal identifiable information (PII)
- Credit card tokens

#### In Transit
- All API communications use HTTPS/TLS 1.3
- Webhook signatures for authentication
- Request signing for high-value transactions

### 2. SQL Injection Prevention

```typescript
// ✅ CORRECT - Using TypeORM parameterized queries
const user = await this.userRepository.findOne({
  where: { email: userEmail },
});

// ❌ WRONG - Never construct queries manually
const query = `SELECT * FROM users WHERE email = '${userEmail}'`;
```

### 3. Access Control

```typescript
// Row-Level Security Example
@BeforeInsert()
@BeforeUpdate()
validateOwnership() {
  if (this.userId !== currentUser.id && !currentUser.isAdmin) {
    throw new ForbiddenException('Access denied');
  }
}
```

### 4. Rate Limiting

```typescript
// Apply rate limiting to sensitive endpoints
@UseGuards(RateLimitGuard)
@RateLimit({ points: 10, duration: 60 }) // 10 requests per minute
@Post('payment/initiate')
async initiatePayment(@Body() dto: InitiatePaymentDto) {
  // ...
}
```

### 5. Input Validation

```typescript
// Use class-validator for DTOs
import { IsNotEmpty, IsNumber, IsPositive, IsUUID, Min, Max } from 'class-validator';

export class TransferDto {
  @IsUUID()
  @IsNotEmpty()
  fromWalletId: string;

  @IsUUID()
  @IsNotEmpty()
  toWalletId: string;

  @IsNumber({ maxDecimalPlaces: 8 })
  @IsPositive()
  @Min(0.01)
  @Max(1000000)
  amount: number;
}
```

### 6. Webhook Security

```typescript
// Verify webhook signatures
private verifyWebhookSignature(payload: any, signature: string, secret: string): boolean {
  const hash = crypto
    .createHmac('sha512', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  // Constant-time comparison to prevent timing attacks
  return crypto.timingSafeEqual(
    Buffer.from(hash),
    Buffer.from(signature)
  );
}
```

### 7. Audit Logging

```typescript
// Log all sensitive operations
@Injectable()
export class AuditLogger {
  async logTransaction(data: {
    userId: string;
    action: string;
    resource: string;
    metadata: Record<string, any>;
    ipAddress?: string;
    userAgent?: string;
  }) {
    await this.auditLogRepository.save({
      ...data,
      timestamp: new Date(),
    });
  }
}
```

### 8. Secrets Management

**Best Practices**:
- Use environment variables for secrets
- Rotate secrets regularly (every 90 days)
- Use secret management services (AWS Secrets Manager, HashiCorp Vault)
- Never commit secrets to version control
- Use different secrets for different environments

```bash
# .env.example (commit this)
PAYSTACK_SECRET_KEY=sk_test_...
PAYSTACK_PUBLIC_KEY=pk_test_...

# .env (NEVER commit this)
PAYSTACK_SECRET_KEY=sk_live_actual_secret_here
PAYSTACK_PUBLIC_KEY=pk_live_actual_key_here
```

### 9. Fraud Prevention

```typescript
@Injectable()
export class FraudDetectionService {
  async checkTransaction(transaction: PaymentTransactionEntity): Promise<{
    riskScore: number;
    flags: string[];
    shouldBlock: boolean;
  }> {
    const flags: string[] = [];
    let riskScore = 0;

    // Velocity check
    const recentTransactions = await this.getRecentTransactions(
      transaction.userId,
      60 * 60 * 1000, // Last hour
    );
    if (recentTransactions.length > 10) {
      flags.push('HIGH_VELOCITY');
      riskScore += 30;
    }

    // Amount check
    if (parseFloat(transaction.amount) > 10000) {
      flags.push('HIGH_AMOUNT');
      riskScore += 20;
    }

    // Geo-location check
    if (transaction.ipAddress && await this.isVPN(transaction.ipAddress)) {
      flags.push('VPN_DETECTED');
      riskScore += 25;
    }

    // Device fingerprint check
    const newDevice = await this.isNewDevice(transaction.userId, transaction.userAgent);
    if (newDevice) {
      flags.push('NEW_DEVICE');
      riskScore += 15;
    }

    return {
      riskScore,
      flags,
      shouldBlock: riskScore >= 70,
    };
  }
}
```

## Performance Optimization

### 1. Database Optimization

#### Indexing Strategy

```sql
-- Wallet indexes
CREATE INDEX idx_wallets_user_currency ON wallets(user_id, currency);
CREATE INDEX idx_wallets_status ON wallets(status) WHERE status = 'active';
CREATE INDEX idx_wallets_created ON wallets(created_at DESC);

-- Transaction indexes
CREATE INDEX idx_transactions_wallet_date ON wallet_transactions(wallet_id, created_at DESC);
CREATE INDEX idx_transactions_user_date ON wallet_transactions(user_id, created_at DESC);
CREATE INDEX idx_transactions_status ON wallet_transactions(status);
CREATE INDEX idx_transactions_reference ON wallet_transactions(reference_id);

-- Composite indexes for common queries
CREATE INDEX idx_transactions_wallet_status_date ON wallet_transactions(wallet_id, status, created_at DESC);

-- Partial indexes for specific conditions
CREATE INDEX idx_active_holds ON wallet_holds(wallet_id, expires_at) WHERE status = 'active';
```

#### Query Optimization

```typescript
// ✅ EFFICIENT - Use select to fetch only needed columns
const wallets = await this.walletRepository
  .createQueryBuilder('wallet')
  .select(['wallet.walletId', 'wallet.balance', 'wallet.currency'])
  .where('wallet.userId = :userId', { userId })
  .getMany();

// ✅ EFFICIENT - Use pagination
const transactions = await this.transactionRepository
  .createQueryBuilder('tx')
  .where('tx.walletId = :walletId', { walletId })
  .orderBy('tx.createdAt', 'DESC')
  .skip(offset)
  .take(limit)
  .getMany();

// ✅ EFFICIENT - Use pessimistic locking only when needed
const wallet = await queryRunner.manager.findOne(WalletEntity, {
  where: { walletId },
  lock: { mode: 'pessimistic_write' },
});
```

### 2. Caching Strategy

```typescript
@Injectable()
export class CachedWalletService {
  constructor(
    private readonly walletsService: WalletsService,
    private readonly cacheManager: Cache,
  ) {}

  async getWalletBalance(walletId: string) {
    const cacheKey = `wallet:balance:${walletId}`;

    // Try cache first
    const cached = await this.cacheManager.get(cacheKey);
    if (cached) {
      return cached;
    }

    // Fetch from database
    const balance = await this.walletsService.getBalance(walletId);

    // Cache for 30 seconds
    await this.cacheManager.set(cacheKey, balance, { ttl: 30 });

    return balance;
  }

  async invalidateBalanceCache(walletId: string) {
    await this.cacheManager.del(`wallet:balance:${walletId}`);
  }
}
```

### 3. Connection Pooling

```typescript
// Database configuration
TypeOrmModule.forRoot({
  type: 'postgres',
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT),
  username: process.env.DB_USERNAME,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,

  // Connection pool settings
  extra: {
    max: 100, // Maximum pool size
    min: 10,  // Minimum pool size
    idleTimeoutMillis: 30000, // Close idle connections after 30s
    connectionTimeoutMillis: 2000, // Timeout for acquiring connection
  },

  // Performance settings
  logging: false, // Disable in production
  cache: {
    duration: 30000, // Cache query results for 30s
  },
})
```

### 4. Async Processing

```typescript
// Use event-driven architecture for non-critical operations
@Injectable()
export class WalletsService {
  async creditWallet(dto: CreditWalletDto) {
    // Critical: Update wallet balance (sync)
    const transaction = await this.updateWalletBalance(dto);

    // Non-critical: Send notification (async via events)
    this.eventEmitter.emit('wallet.credited', {
      walletId: dto.walletId,
      amount: dto.amount,
    });

    return transaction;
  }
}

// Event listener processes asynchronously
@OnEvent('wallet.credited', { async: true })
async handleWalletCredited(payload: any) {
  await this.notificationService.sendNotification({
    userId: payload.userId,
    message: `Your wallet was credited with ${payload.amount}`,
  });
}
```

### 5. Batch Operations

```typescript
// ✅ EFFICIENT - Batch inserts
async recordMultipleTransactions(transactions: WalletTransactionEntity[]) {
  return this.transactionRepository
    .createQueryBuilder()
    .insert()
    .values(transactions)
    .execute();
}

// ✅ EFFICIENT - Batch updates
async updateMultipleWallets(updates: Array<{ walletId: string; balance: string }>) {
  const promises = updates.map(({ walletId, balance }) =>
    this.walletRepository.update({ walletId }, { balance })
  );
  return Promise.all(promises);
}
```

### 6. Response Optimization

```typescript
// Use streaming for large datasets
@Get('transactions/export')
async exportTransactions(@Res() res: Response) {
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=transactions.csv');

  const stream = await this.transactionRepository
    .createQueryBuilder('tx')
    .where('tx.createdAt >= :date', { date: startDate })
    .stream();

  stream.on('data', (row) => {
    res.write(`${row.id},${row.amount},${row.createdAt}\n`);
  });

  stream.on('end', () => {
    res.end();
  });
}
```

### 7. Memory Management

```typescript
// Use generators for large datasets
async *getTransactionsGenerator(walletId: string): AsyncGenerator<WalletTransactionEntity> {
  const batchSize = 1000;
  let offset = 0;

  while (true) {
    const transactions = await this.transactionRepository.find({
      where: { walletId },
      skip: offset,
      take: batchSize,
      order: { createdAt: 'DESC' },
    });

    if (transactions.length === 0) break;

    for (const tx of transactions) {
      yield tx;
    }

    offset += batchSize;
  }
}
```

### 8. Monitoring and Profiling

```typescript
@Injectable()
export class PerformanceMonitor {
  private readonly logger = new Logger(PerformanceMonitor.name);

  async measurePerformance<T>(
    operation: string,
    fn: () => Promise<T>,
  ): Promise<T> {
    const startTime = Date.now();
    const startMemory = process.memoryUsage().heapUsed;

    try {
      const result = await fn();
      const duration = Date.now() - startTime;
      const memoryUsed = process.memoryUsage().heapUsed - startMemory;

      this.logger.log({
        operation,
        duration: `${duration}ms`,
        memory: `${(memoryUsed / 1024 / 1024).toFixed(2)}MB`,
      });

      // Alert if slow
      if (duration > 1000) {
        this.logger.warn(`Slow operation detected: ${operation} took ${duration}ms`);
      }

      return result;
    } catch (error) {
      this.logger.error(`Operation failed: ${operation}`, error);
      throw error;
    }
  }
}
```

## Load Testing

### Artillery Configuration

```yaml
# artillery.yml
config:
  target: "http://localhost:3000"
  phases:
    - duration: 60
      arrivalRate: 10
      name: "Warm up"
    - duration: 120
      arrivalRate: 50
      name: "Sustained load"
    - duration: 60
      arrivalRate: 100
      name: "Peak load"

scenarios:
  - name: "Create and transfer"
    flow:
      - post:
          url: "/wallets"
          json:
            userId: "{{ $randomString() }}"
            currency: "USD"
      - think: 1
      - post:
          url: "/wallets/transfer"
          json:
            fromWalletId: "{{ walletId1 }}"
            toWalletId: "{{ walletId2 }}"
            amount: "100"
```

### K6 Load Test

```javascript
// k6-test.js
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 100 },
    { duration: '3m', target: 100 },
    { duration: '1m', target: 200 },
    { duration: '3m', target: 200 },
    { duration: '1m', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests under 500ms
    http_req_failed: ['rate<0.01'],   // Less than 1% errors
  },
};

export default function () {
  const payload = JSON.stringify({
    userId: `user-${__VU}`,
    currency: 'USD',
  });

  const res = http.post('http://localhost:3000/wallets', payload, {
    headers: { 'Content-Type': 'application/json' },
  });

  check(res, {
    'status is 201': (r) => r.status === 201,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);
}
```

## Scalability Considerations

### Horizontal Scaling

1. **Stateless Services**: All services are stateless and can scale horizontally
2. **Load Balancing**: Use NGINX or AWS ALB for load distribution
3. **Session Management**: Use Redis for distributed sessions
4. **File Storage**: Use S3 or equivalent for file storage

### Database Scaling

1. **Read Replicas**: For read-heavy workloads
2. **Partitioning**: Time-based partitioning for transaction tables
3. **Sharding**: User-based sharding for horizontal scaling
4. **Connection Pooling**: PgBouncer for connection management

### Caching Layers

1. **Application Cache**: In-memory cache with Redis
2. **CDN**: CloudFront or Cloudflare for static assets
3. **Query Cache**: PostgreSQL query result caching
4. **API Gateway Cache**: Cache at API Gateway level

## Disaster Recovery

### Backup Strategy

```bash
# Daily backups
pg_dump -Fc dbname > backup_$(date +%Y%m%d).dump

# Point-in-time recovery
# Enable WAL archiving in postgresql.conf
wal_level = replica
archive_mode = on
archive_command = 'cp %p /mnt/backup/wal/%f'
```

### High Availability

1. **Database**: PostgreSQL with streaming replication
2. **Application**: Multi-AZ deployment
3. **Load Balancer**: Health checks and automatic failover
4. **Monitoring**: 24/7 monitoring with alerts

## Checklist

### Before Deployment

- [ ] All secrets in environment variables
- [ ] Database migrations tested
- [ ] Indexes created
- [ ] Connection pooling configured
- [ ] Rate limiting enabled
- [ ] Logging configured
- [ ] Monitoring dashboards set up
- [ ] Alerts configured
- [ ] Backup strategy in place
- [ ] Load tests passed
- [ ] Security audit completed
- [ ] Performance benchmarks met

### Post-Deployment

- [ ] Monitor error rates
- [ ] Check response times
- [ ] Verify database performance
- [ ] Review logs for anomalies
- [ ] Test critical user flows
- [ ] Verify webhook delivery
- [ ] Check payment gateway health
- [ ] Monitor cache hit rates

## Support

For questions or issues:
- Create an issue in the repository
- Contact the platform team
- Check the documentation

---

**Last Updated**: 2025-11-21
**Version**: 1.0.0
