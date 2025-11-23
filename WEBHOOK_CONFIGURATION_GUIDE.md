# Webhook Configuration Guide

## Overview

Webhooks allow payment providers to send real-time notifications about payment events (successful payments, failed transactions, etc.) to your application.

## Webhook Endpoints

### Base URL Structure
```
https://your-domain.com/api/v1/{module}/webhook/{provider}
```

### Available Webhook Endpoints

#### 1. Virtual Account Webhooks

**Paystack Virtual Account Webhook**
- URL: `https://your-domain.com/api/v1/virtual-accounts/webhook/paystack`
- Method: POST
- Headers: `x-paystack-signature`

**Flutterwave Virtual Account Webhook**
- URL: `https://your-domain.com/api/v1/virtual-accounts/webhook/flutterwave`
- Method: POST
- Headers: `verif-hash`

**Woven Finance Webhook**
- URL: `https://your-domain.com/api/v1/virtual-accounts/webhook/woven`
- Method: POST

**Budpay Webhook**
- URL: `https://your-domain.com/api/v1/virtual-accounts/webhook/budpay`
- Method: POST

**Monnify Webhook**
- URL: `https://your-domain.com/api/v1/virtual-accounts/webhook/monnify`
- Method: POST

**Korapay Webhook**
- URL: `https://your-domain.com/api/v1/virtual-accounts/webhook/korapay`
- Method: POST

## Provider-Specific Setup

### Paystack

1. **Login to Paystack Dashboard**
   - Go to https://dashboard.paystack.com

2. **Navigate to Settings > Webhooks**

3. **Add Webhook URL**
   - URL: `https://your-domain.com/api/v1/virtual-accounts/webhook/paystack`

4. **Events to Subscribe**
   - `charge.success` (for virtual account payments)
   - `transfer.success` (for payouts)
   - `transfer.failed` (for failed payouts)

5. **Get Secret Hash**
   - Copy the secret hash provided by Paystack
   - This is used to verify webhook signatures

### Flutterwave

1. **Login to Flutterwave Dashboard**
   - Go to https://dashboard.flutterwave.com

2. **Navigate to Settings > Webhooks**

3. **Add Webhook URL**
   - URL: `https://your-domain.com/api/v1/virtual-accounts/webhook/flutterwave`

4. **Events to Subscribe**
   - `charge.completed` (for successful payments)
   - All relevant events for virtual accounts

5. **Get Secret Hash**
   - Copy the secret hash from Flutterwave dashboard
   - Add to your `.env` file

### Stripe

1. **Login to Stripe Dashboard**
   - Go to https://dashboard.stripe.com

2. **Navigate to Developers > Webhooks**

3. **Add Endpoint**
   - URL: `https://your-domain.com/api/v1/payment-gateways/webhook/stripe`

4. **Events to Select**
   - `payment_intent.succeeded`
   - `payment_intent.failed`
   - `charge.succeeded`
   - `charge.failed`

5. **Get Signing Secret**
   - Copy the webhook signing secret
   - Add to `.env` as `STRIPE_WEBHOOK_SECRET`

### Woven Finance

1. **Login to Woven Dashboard**
   - Go to https://app.woven.finance

2. **Navigate to Settings > Webhooks**

3. **Add Webhook URL**
   - URL: `https://your-domain.com/api/v1/virtual-accounts/webhook/woven`

4. **Events**
   - Virtual account credit events

## Testing Webhooks

### Local Development with ngrok

1. **Install ngrok**
   ```bash
   npm install -g ngrok
   # or
   brew install ngrok  # macOS
   ```

2. **Start your application**
   ```bash
   npm run start:dev
   ```

3. **Start ngrok**
   ```bash
   ngrok http 3000
   ```

4. **Use ngrok URL for webhooks**
   - ngrok will provide a public URL like: `https://abc123.ngrok.io`
   - Use this as your webhook base: `https://abc123.ngrok.io/api/v1/virtual-accounts/webhook/paystack`

### Testing with cURL

```bash
# Test Paystack webhook
curl -X POST https://your-domain.com/api/v1/virtual-accounts/webhook/paystack \
  -H "Content-Type: application/json" \
  -H "x-paystack-signature: test_signature" \
  -d '{
    "event": "charge.success",
    "data": {
      "id": 123456,
      "amount": 10000,
      "currency": "NGN",
      "authorization": {
        "receiver_account_number": "1234567890"
      }
    }
  }'
```

## Webhook Security

### Signature Verification

All webhooks are verified using the provider's signature:

```typescript
// Example: Paystack signature verification
const hash = crypto
  .createHmac('sha512', PAYSTACK_SECRET_KEY)
  .update(JSON.stringify(payload))
  .digest('hex');

const isValid = hash === signature;
```

### IP Whitelisting (Optional)

You can restrict webhook requests to specific IP addresses:

**Paystack IPs:**
- 52.31.139.75
- 52.49.173.169
- 52.214.14.220

**Flutterwave IPs:**
- Check Flutterwave documentation for current IPs

## Webhook Retry Logic

If your webhook endpoint fails, providers typically retry:

- **Paystack**: Retries up to 5 times over 24 hours
- **Flutterwave**: Retries up to 3 times
- **Stripe**: Retries for up to 3 days with exponential backoff

## Monitoring Webhooks

### Logs

All webhook events are logged:

```typescript
this.logger.log({
  event: 'webhook.received',
  provider: 'paystack',
  event_type: payload.event,
  timestamp: new Date(),
});
```

### Webhook Dashboard

Monitor webhook health in your provider dashboard:
- Delivery success rate
- Failed webhooks
- Retry attempts

## Environment Variables for Webhooks

Add these to your `.env` file:

```env
# Webhook Base URL (your public domain)
WEBHOOK_BASE_URL=https://your-domain.com

# Provider Secret Keys (for signature verification)
PAYSTACK_SECRET_KEY=sk_live_...
FLUTTERWAVE_SECRET_KEY=FLWSECK-...
STRIPE_WEBHOOK_SECRET=whsec_...
```

## Common Issues

### 1. Webhook Not Receiving Events

**Solution:**
- Check that webhook URL is publicly accessible
- Verify URL is correctly configured in provider dashboard
- Check firewall/security group settings

### 2. Signature Verification Failed

**Solution:**
- Ensure secret key is correct
- Check that payload is not modified before verification
- Verify header name matches provider requirements

### 3. Duplicate Events

**Solution:**
- Implement idempotency using event IDs
- Store processed event IDs to prevent reprocessing

```typescript
// Check if event already processed
const existing = await this.eventRepository.findOne({
  where: { eventId: payload.id }
});

if (existing) {
  return { received: true, message: 'Event already processed' };
}
```

## Production Checklist

- [ ] Webhook URLs configured in all provider dashboards
- [ ] Secret keys added to environment variables
- [ ] Signature verification implemented and tested
- [ ] Error handling and logging in place
- [ ] Retry logic implemented
- [ ] Monitoring and alerts configured
- [ ] IP whitelisting configured (if applicable)
- [ ] SSL certificate valid and configured
- [ ] Rate limiting configured
- [ ] Database indexes for webhook event queries

## Next Steps

1. Set up webhooks in each provider dashboard
2. Test webhooks using provider test modes
3. Monitor webhook delivery in production
4. Set up alerts for failed webhooks
5. Review webhook logs regularly

---

For more information, see:
- [Paystack Webhook Documentation](https://paystack.com/docs/payments/webhooks)
- [Flutterwave Webhook Documentation](https://developer.flutterwave.com/docs/integration-guides/webhooks)
- [Stripe Webhook Documentation](https://stripe.com/docs/webhooks)
