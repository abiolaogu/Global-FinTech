# Low-Level Design — Global FinTech Platform (AtlasX)
> Version: 1.0 | Last Updated: 2026-02-18 | Status: Draft
> Classification: Internal | Author: AIDD System

## 1. Wallet Service Implementation

### 1.1 Data Model
```typescript
// wallets.entity.ts
@Entity('wallets')
export class Wallet {
  @PrimaryGeneratedColumn('uuid') wallet_id: string;
  @Column() user_id: string;
  @Column({ length: 10 }) currency: string;
  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 }) balance: number;
  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 }) available_balance: number;
  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 }) pending_balance: number;
  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 }) held_balance: number;
  @Column({ default: 'active' }) status: WalletStatus;
  @Column({ type: 'jsonb', nullable: true }) metadata: Record<string, any>;
}
```

### 1.2 Transfer Operation (Atomic)
```typescript
async transfer(fromWalletId: string, toWalletId: string, amount: number): Promise<TransferResult> {
  return this.dataSource.transaction(async (manager) => {
    const from = await manager.findOne(Wallet, { where: { wallet_id: fromWalletId }, lock: { mode: 'pessimistic_write' } });
    const to = await manager.findOne(Wallet, { where: { wallet_id: toWalletId }, lock: { mode: 'pessimistic_write' } });
    // Validate sufficient balance
    if (from.available_balance < amount) throw new InsufficientFundsException();
    // Execute double-entry
    from.balance -= amount; from.available_balance -= amount;
    to.balance += amount; to.available_balance += amount;
    await manager.save([from, to]);
    // Record transactions (debit + credit)
    // Publish Kafka event
    // Record Fabric attestation
  });
}
```

## 2. Payment Gateway Strategy

### 2.1 Provider Interface
```typescript
interface PaymentProvider {
  name: string;
  supportedCurrencies: string[];
  initiate(request: PaymentRequest): Promise<PaymentResponse>;
  verify(reference: string): Promise<VerificationResult>;
  refund(transactionId: string, amount?: number): Promise<RefundResult>;
}
```

### 2.2 Provider Selection Logic
```
1. Filter providers by currency support
2. Filter by transaction amount limits
3. Sort by success rate (rolling 24h window)
4. Apply cost optimization (lowest fee)
5. Circuit breaker check (exclude providers with > 5% failure rate)
6. Select top candidate
```

## 3. RegAI Decision Engine

### 3.1 Decision Flow
```python
@router.post("/v1/decision")
async def evaluate(request: DecisionRequest):
    # 1. Load jurisdiction-specific detectors
    detectors = load_detectors(request.jurisdiction)
    # 2. Run OPA policy evaluation
    opa_result = await opa_client.evaluate(request.to_opa_input())
    # 3. Apply detector rules
    for detector in detectors:
        detector.evaluate(request.transaction)
    # 4. Aggregate results → ALLOW | DENY | STEP_UP
    return aggregate_decision(opa_result, detector_results)
```

## 4. Split Payment Engine

### 4.1 Configuration Schema
```json
{
  "split_config_id": "uuid",
  "merchant_id": "uuid",
  "rules": [
    { "recipient_wallet_id": "uuid", "type": "percentage", "value": 70 },
    { "recipient_wallet_id": "uuid", "type": "fixed", "value": 500, "currency": "NGN" },
    { "recipient_wallet_id": "uuid", "type": "remainder" }
  ]
}
```

## 5. Configuration Reference

| Config | Default | Description |
|--------|---------|-------------|
| CORE_API_ENABLED | true | Enable core API modules |
| DB_HOST | localhost | PostgreSQL host |
| REDIS_URL | redis://localhost:6379 | Redis connection |
| KAFKA_BROKERS | localhost:9092 | Kafka broker list |
| OPA_URL | http://opa:8181 | OPA engine endpoint |
| MODEL_TYPE | mock | AI model backend (mock/production) |
| SANCTIONS_UPDATE_INTERVAL | 6h | Sanctions list refresh interval |
