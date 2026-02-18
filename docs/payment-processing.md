# Payment Processing -- Global FinTech Platform

## 1. Overview

The payment processing layer handles all inbound and outbound money movement across 8+ payment providers spanning Africa, Asia, Latin America, and Europe. The architecture uses a unified gateway abstraction that routes payments to the optimal provider based on currency, country, fee, and availability.

---

## 2. Payment Gateway Architecture

### 2.1 Unified Interface

All payment providers implement a common interface:

```typescript
interface PaymentGateway {
  initiate(params: InitiateParams): Promise<InitiateResult>;
  verify(reference: string): Promise<VerifyResult>;
  refund(reference: string, amount?: number): Promise<RefundResult>;
  getTransaction(reference: string): Promise<TransactionDetail>;
  handleWebhook(payload: any, signature: string): Promise<WebhookResult>;
}
```

### 2.2 Provider Registry

| Provider | Region | Currencies | Payment Methods | Fee |
|----------|--------|-----------|-----------------|-----|
| Paystack | Africa | NGN, GHS, ZAR, KES | Card, Bank Transfer, USSD, QR, Mobile Money | 1.5% (capped NGN 2,000) |
| Flutterwave | Africa | 10+ currencies | Card, Account, USSD, Mobile Money, Bank Transfer | 1.4% |
| Korapay | Africa | Pan-African | Multiple methods | Variable |
| Stripe | Global | 135+ currencies | Card, Apple Pay, Google Pay, SEPA, Bank Transfer | 2.9% + $0.30 |
| Razorpay | India | INR | Card, UPI, Netbanking, Wallets, EMI | 2.0% |
| PayMongo | Philippines | PHP | Card, GCash, GrabPay, PayMaya | 2.9% + PHP 15 |
| Khalti | Nepal | NPR | Khalti wallet, E-banking, Mobile banking | 2.5% |
| Mercado Pago | LATAM | BRL, ARS, MXN, CLP, COP | Credit card, Pix, Bank transfer | 3.99% |
| PayU | Europe | EUR, PLN, CZK | Card, Bank transfer, Installments | 1.9% |

### 2.3 Routing Logic

Payment routing selects the optimal provider:

1. Filter providers supporting the requested currency and country
2. Filter providers that are active and healthy
3. Sort by: fee (ascending), success rate (descending), latency (ascending)
4. Select top provider
5. Failover to next provider if primary fails

```typescript
async selectProvider(currency: string, country: string): Promise<Gateway> {
  const eligible = this.gateways.filter(g =>
    g.supportsCurrency(currency) &&
    g.supportsCountry(country) &&
    g.isHealthy()
  );

  return eligible.sort((a, b) => {
    const feeA = a.calculateFee(amount, currency);
    const feeB = b.calculateFee(amount, currency);
    return feeA - feeB;
  })[0];
}
```

---

## 3. Payment Flows

### 3.1 Inbound Collection (Deposit)

```
User -> AtlasX API -> Select Gateway -> Initiate Payment
                                             |
                                     Provider Checkout Page
                                             |
                                     User Completes Payment
                                             |
                                     Provider Webhook -> AtlasX API
                                             |
                                     Verify Payment -> Credit Wallet
                                             |
                                     Emit payment.completed Event
```

### 3.2 Virtual Account Collection

```
Sender -> Bank Transfer -> Provider Virtual Account
                                    |
                           Provider Webhook -> AtlasX API
                                    |
                           Verify Signature -> Match Virtual Account
                                    |
                           Auto-Credit User Wallet
                                    |
                           Emit virtual_account.payment_received
```

### 3.3 Outbound Disbursement (Payout)

```
AtlasX API -> Validate Balance -> Debit Wallet
                                       |
                              Select Payout Provider
                                       |
                              Initiate Transfer to Bank Account
                                       |
                              Provider Processes Transfer
                                       |
                              Webhook -> Update Status
```

### 3.4 Split Payment

```
Payment Received -> Apply Split Configuration
                          |
                +---------+---------+
                |         |         |
           Merchant    Platform   Referrer
           (70%)       (25%)     (5%)
                |         |         |
           Credit     Credit    Credit
           Wallet     Wallet    Wallet
```

---

## 4. Virtual Account System

### 4.1 Supported Providers

| Provider | Country | Account Type | Auto-Credit |
|----------|---------|-------------|-------------|
| Paystack | Nigeria, Ghana, SA, Kenya | Dedicated | Yes |
| Flutterwave | 10+ African countries | Dedicated, Dynamic | Yes |
| Woven Finance | Nigeria | Dedicated | Yes |
| Budpay | Nigeria | Dedicated | Yes |
| Monnify | Nigeria | Dedicated, Dynamic | Yes |
| Korapay | Pan-African | Dedicated | Yes |

### 4.2 Account Types

- **Dedicated**: Permanent account number assigned to a single user
- **Dynamic**: Temporary account number that expires after a set period or payment count
- **Pooled**: Shared account with unique reference codes for identification

### 4.3 Auto-Credit Flow

When a payment is received on a virtual account:
1. Provider sends webhook notification
2. Verify webhook signature (HMAC-SHA512)
3. Match virtual account by account number
4. Find associated user wallet
5. Credit wallet with received amount
6. Record virtual_account_transaction
7. Emit event for notification service

---

## 5. Recurring Payments

### 5.1 Frequencies

| Frequency | Interval |
|-----------|----------|
| Daily | Every 24 hours |
| Weekly | Every 7 days |
| Biweekly | Every 14 days |
| Monthly | Same day each month |
| Quarterly | Every 3 months |
| Yearly | Every 12 months |

### 5.2 Processing

A scheduled job runs at configurable intervals to process due recurring payments:

1. Query recurring_payments where `next_payment_date <= NOW()` and `status = 'active'`
2. For each payment:
   a. Attempt charge using tokenised payment method
   b. On success: update `last_payment_date`, calculate `next_payment_date`, increment `total_payments`
   c. On failure: increment `failed_payments`, schedule retry (exponential backoff, max 3 retries)
   d. If max retries exceeded: mark as `failed`, emit event for manual review

### 5.3 Lifecycle

```
Created -> Active -> Paused -> Resumed -> Active -> Cancelled
                  -> Failed (max retries) -> Manual Review
                  -> Completed (end date reached)
```

---

## 6. Payment Links

### 6.1 Types

| Type | Description |
|------|-------------|
| Fixed | Exact amount required |
| Flexible | Customer chooses amount |
| Minimum | Minimum amount required, customer can pay more |

### 6.2 Features

- Custom branding: logo URL, primary/secondary colours
- Custom fields: collect additional customer data
- Expiry date: automatic deactivation
- Usage limits: maximum payment count
- Split configuration: auto-apply splits to received payments
- Analytics: view count, payment count, total collected

---

## 7. Webhook Security

### 7.1 Signature Verification

Each provider uses a different signature mechanism:

**Paystack:**
```typescript
const hash = crypto
  .createHmac('sha512', PAYSTACK_SECRET_KEY)
  .update(JSON.stringify(payload))
  .digest('hex');
const isValid = crypto.timingSafeEqual(
  Buffer.from(hash), Buffer.from(signature)
);
```

**Stripe:**
```typescript
const event = stripe.webhooks.constructEvent(
  rawBody, signature, STRIPE_WEBHOOK_SECRET
);
```

### 7.2 Idempotency

Webhook processors implement idempotency to handle duplicate deliveries:

```typescript
const existing = await this.eventRepo.findOne({
  where: { providerEventId: payload.id }
});
if (existing) return { status: 'already_processed' };
```

### 7.3 Retry Behaviour

| Provider | Max Retries | Retry Period | Backoff |
|----------|------------|-------------|---------|
| Paystack | 5 | 24 hours | Exponential |
| Flutterwave | 3 | 12 hours | Linear |
| Stripe | Unlimited | 3 days | Exponential |

---

## 8. Error Handling

### 8.1 Retry Strategy

| Error Type | Action |
|-----------|--------|
| Network timeout | Retry 3 times with exponential backoff |
| Provider 5xx | Retry 3 times, then failover to alternate provider |
| Provider 4xx | Do not retry; return error to caller |
| Insufficient funds | Do not retry; return error to caller |
| Signature mismatch | Log security alert; reject webhook |

### 8.2 Dead Letter Queue

Failed webhook deliveries and unprocessable payments are routed to a dead letter queue for manual investigation. Each entry includes:
- Original payload
- Error message and stack trace
- Number of retry attempts
- Timestamp of first and last attempt

---

## 9. Monitoring

### 9.1 Key Metrics

- Transaction volume and value by provider
- Success rate by provider and payment method
- Average response time by provider
- Fee revenue by provider
- Webhook delivery success rate
- Virtual account utilisation

### 9.2 Alerts

- Provider error rate > 5%
- Provider response time > 5 seconds
- Webhook delivery failures > 3 consecutive
- Balance discrepancy detected
- Unusual transaction volume spike

---

**Version:** 2.0
**Last Updated:** 2026-02-17
**Supported Providers:** 8+
