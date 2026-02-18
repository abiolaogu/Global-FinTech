# Airtime & Data Vending Marketplace Architecture

## Overview

The Global FinTech platform now includes a comprehensive airtime and data vending marketplace that enables users to purchase mobile airtime and data bundles globally. The system integrates with multiple telecom providers and aggregators to provide seamless access to mobile services.

## User Categories

### 1. End Users (Customers)
- Purchase airtime for self or others
- Buy data bundles
- View transaction history
- Manage beneficiaries
- Set up auto-recharge

### 2. Merchants/Agents
- Resell airtime and data
- Earn commissions
- Manage inventory
- View sales reports
- Bulk operations

### 3. Administrators
- Manage provider integrations
- Configure pricing and commissions
- Monitor transactions
- Handle disputes
- Generate reports
- Manage users and merchants

### 4. Super Admins
- System configuration
- Platform-wide settings
- Financial reconciliation
- Provider management
- Security settings

## Core Features

### Airtime Vending
- **Instant Top-up**: Real-time airtime purchase
- **Multiple Networks**: Support for 100+ mobile networks globally
- **Multiple Currencies**: Pay in local currency
- **Recipient Options**: Self or third-party top-up
- **Amount Flexibility**: Fixed amounts or custom values
- **History Tracking**: Complete transaction logs

### Data Bundle Vending
- **Bundle Plans**: Daily, weekly, monthly plans
- **Multiple Sizes**: From 100MB to unlimited
- **Special Plans**: Night data, social media bundles, etc.
- **Auto-renewal**: Recurring subscriptions
- **Gift Data**: Send data to others

### Commission System
- **Multi-tier Commissions**: Different rates for merchants
- **Real-time Calculation**: Automatic commission computation
- **Flexible Structures**: Flat, percentage, or hybrid
- **Performance Bonuses**: Volume-based incentives
- **Instant Payout**: Commissions credited immediately

## System Architecture

```
┌────────────────────────────────────────────────────────┐
│                   Frontend Layer                        │
├──────────────────┬──────────────────┬──────────────────┤
│  Web Dashboard   │  Mobile App      │  Admin Panel     │
│  (React/Next.js) │  (Flutter)       │  (React)         │
└────────┬─────────┴──────────┬───────┴────────┬─────────┘
         │                    │                 │
         └────────────────────┼─────────────────┘
                              │
         ┌────────────────────▼────────────────────┐
         │           API Gateway (NestJS)          │
         │  - Authentication & Authorization       │
         │  - Rate Limiting                        │
         │  - Request Validation                   │
         └────────────┬────────────────────────────┘
                      │
    ┌─────────────────┼─────────────────────┐
    │                 │                     │
┌───▼────────┐  ┌────▼─────────┐  ┌────────▼──────┐
│  Airtime   │  │ Commission   │  │   Reporting   │
│  Service   │  │  Service     │  │   Service     │
└───┬────────┘  └────┬─────────┘  └────────┬──────┘
    │                │                      │
    └────────────────┼──────────────────────┘
                     │
         ┌───────────▼──────────────┐
         │   Provider Aggregators    │
         ├───────────────────────────┤
         │  - Reloadly              │
         │  - DingConnect           │
         │  - Africa's Talking      │
         │  - DTOne                 │
         │  - ValueTopup            │
         └──────────────────────────┘
```

## Database Schema

### Airtime Products Table
```sql
CREATE TABLE airtime_products (
  product_id UUID PRIMARY KEY,
  provider_id UUID NOT NULL,
  country_code VARCHAR(3) NOT NULL,
  operator_code VARCHAR(50) NOT NULL,
  operator_name VARCHAR(255) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  min_amount DECIMAL(10,2),
  max_amount DECIMAL(10,2),
  denomination_type VARCHAR(20), -- 'fixed', 'range'
  fixed_amounts JSONB, -- Array of fixed amounts
  commission_rate DECIMAL(5,2),
  is_active BOOLEAN DEFAULT true,
  logo_url VARCHAR(500),
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Data Bundles Table
```sql
CREATE TABLE data_bundles (
  bundle_id UUID PRIMARY KEY,
  provider_id UUID NOT NULL,
  country_code VARCHAR(3) NOT NULL,
  operator_code VARCHAR(50) NOT NULL,
  bundle_name VARCHAR(255) NOT NULL,
  data_amount VARCHAR(50), -- '1GB', '5GB', etc.
  validity_period VARCHAR(50), -- '7 days', '30 days'
  price DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  commission_rate DECIMAL(5,2),
  bundle_type VARCHAR(50), -- 'standard', 'night', 'social'
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  metadata JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Airtime Transactions Table
```sql
CREATE TABLE airtime_transactions (
  transaction_id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  product_id UUID REFERENCES airtime_products(product_id),
  recipient_phone VARCHAR(20) NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency VARCHAR(3) NOT NULL,
  commission_amount DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  status VARCHAR(50), -- 'pending', 'processing', 'completed', 'failed'
  provider_reference VARCHAR(255),
  provider_response JSONB,
  error_message TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  processed_at TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_created_at (created_at)
);
```

### Provider Integrations Table
```sql
CREATE TABLE provider_integrations (
  provider_id UUID PRIMARY KEY,
  provider_name VARCHAR(255) NOT NULL,
  provider_type VARCHAR(50), -- 'aggregator', 'direct'
  api_endpoint VARCHAR(500),
  api_key_encrypted TEXT,
  api_secret_encrypted TEXT,
  is_active BOOLEAN DEFAULT true,
  supported_countries JSONB,
  supported_operators JSONB,
  rate_limit_per_minute INTEGER,
  webhook_url VARCHAR(500),
  configuration JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## API Endpoints

### Public Endpoints

#### Get Available Countries
```
GET /api/v1/airtime/countries
Response: [{ code: "US", name: "United States", flag: "🇺🇸" }]
```

#### Get Operators by Country
```
GET /api/v1/airtime/operators?country=NG
Response: [
  {
    operator_code: "MTN_NG",
    operator_name: "MTN Nigeria",
    logo_url: "...",
    min_amount: 50,
    max_amount: 50000,
    currency: "NGN"
  }
]
```

#### Get Data Bundles
```
GET /api/v1/data/bundles?country=NG&operator=MTN_NG
Response: [
  {
    bundle_id: "uuid",
    name: "1GB Daily",
    data_amount: "1GB",
    validity: "24 hours",
    price: 500,
    currency: "NGN"
  }
]
```

### Authenticated Endpoints

#### Purchase Airtime
```
POST /api/v1/airtime/purchase
Body: {
  product_id: "uuid",
  recipient_phone: "+2348012345678",
  amount: 1000,
  currency: "NGN"
}
Response: {
  transaction_id: "uuid",
  status: "processing",
  amount: 1000,
  commission: 50,
  total_cost: 1000
}
```

#### Purchase Data Bundle
```
POST /api/v1/data/purchase
Body: {
  bundle_id: "uuid",
  recipient_phone: "+2348012345678"
}
Response: {
  transaction_id: "uuid",
  status: "processing",
  bundle_name: "1GB Daily",
  price: 500
}
```

#### Get Transaction History
```
GET /api/v1/transactions/airtime?limit=20&offset=0
Response: {
  transactions: [...],
  total: 100,
  page: 1,
  pages: 5
}
```

### Admin Endpoints

#### Add Provider
```
POST /api/v1/admin/providers
Body: {
  provider_name: "Reloadly",
  api_endpoint: "https://api.reloadly.com",
  api_key: "...",
  supported_countries: ["NG", "GH", "KE"]
}
```

#### Sync Products
```
POST /api/v1/admin/providers/{providerId}/sync
Response: {
  synced_products: 150,
  new_products: 25,
  updated_products: 125
}
```

## Provider Integration

### Supported Providers

#### 1. Reloadly
- **Coverage**: 150+ countries
- **Networks**: 900+ mobile operators
- **Features**: Airtime & data bundles
- **API**: RESTful, OAuth2
- **Rate**: 600 requests/minute

#### 2. DingConnect
- **Coverage**: 140+ countries
- **Networks**: 500+ operators
- **Features**: Airtime top-up
- **API**: RESTful, API key
- **Rate**: 300 requests/minute

#### 3. Africa's Talking
- **Coverage**: Africa (20+ countries)
- **Networks**: 100+ operators
- **Features**: Airtime, SMS, USSD
- **API**: RESTful, API key
- **Rate**: 1000 requests/minute

#### 4. DTOne
- **Coverage**: Global
- **Networks**: 600+ operators
- **Features**: Airtime, data, bundles
- **API**: RESTful, OAuth2
- **Rate**: 500 requests/minute

### Provider Abstraction Layer

```typescript
interface AirtimeProvider {
  getOperators(countryCode: string): Promise<Operator[]>;
  getBundles(operatorCode: string): Promise<DataBundle[]>;
  purchaseAirtime(request: AirtimePurchaseRequest): Promise<TransactionResult>;
  purchaseData(request: DataPurchaseRequest): Promise<TransactionResult>;
  checkTransactionStatus(reference: string): Promise<TransactionStatus>;
  getBalance(): Promise<ProviderBalance>;
}
```

## Commission Structure

### User Types & Rates

| User Type | Airtime Commission | Data Commission |
|-----------|-------------------|-----------------|
| End User | 0% | 0% |
| Agent | 2-3% | 3-5% |
| Merchant | 3-5% | 5-7% |
| Super Agent | 5-8% | 7-10% |

### Commission Calculation

```typescript
function calculateCommission(
  amount: number,
  userType: UserType,
  productType: 'airtime' | 'data'
): number {
  const rate = getCommissionRate(userType, productType);
  return amount * (rate / 100);
}
```

## Payment Flow

1. **User Initiates Purchase**
   - Select country and operator
   - Choose amount/bundle
   - Enter recipient number
   - Confirm purchase

2. **System Validation**
   - Check wallet balance
   - Validate phone number
   - Verify operator availability
   - Calculate total cost

3. **Debit Wallet**
   - Lock funds (TigerBeetle pending transfer)
   - Record transaction as 'processing'

4. **Provider API Call**
   - Send request to provider
   - Handle rate limiting
   - Implement retry logic

5. **Process Response**
   - Update transaction status
   - Post pending transfer (complete)
   - Credit commission (if applicable)
   - Send notification

6. **Handle Failure**
   - Void pending transfer (refund)
   - Update transaction status
   - Notify user
   - Log for reconciliation

## Security Measures

### API Security
- **Authentication**: JWT tokens
- **Rate Limiting**: Per user, per IP
- **Encryption**: HTTPS/TLS 1.3
- **API Keys**: Encrypted storage
- **Webhooks**: Signature verification

### Fraud Prevention
- **Phone Validation**: Format and network check
- **Velocity Checks**: Max transactions per day
- **Amount Limits**: Min/max per transaction
- **Blacklist**: Suspicious phone numbers
- **Device Fingerprinting**: Detect multiple accounts

### Data Protection
- **PII Encryption**: Phone numbers encrypted
- **Audit Logs**: All transactions logged
- **Access Control**: Role-based permissions
- **Data Retention**: 7 years for compliance

## Monitoring & Alerts

### Key Metrics
- Transaction success rate
- Average processing time
- Provider uptime
- Commission totals
- Revenue by country/operator

### Alerts
- High failure rate (>5%)
- Provider downtime
- Low provider balance
- Suspicious activity
- API errors

## User Experience

### Web Dashboard
- Responsive design
- Quick top-up (recent numbers)
- Beneficiary management
- Transaction history with filters
- Auto-recharge setup

### Mobile App
- Fingerprint/Face ID login
- QR code scanning for numbers
- Offline bundle browsing
- Push notifications
- In-app support chat

### Admin Panel
- Real-time dashboard
- Transaction monitoring
- Provider management
- Commission reports
- User management
- Dispute resolution

## Compliance & Regulations

### KYC Requirements
- **Tier 1** (No KYC): Max $100/day
- **Tier 2** (Basic KYC): Max $1,000/day
- **Tier 3** (Full KYC): Unlimited

### AML Monitoring
- Transaction pattern analysis
- Large transaction reporting
- Suspicious activity detection

### Licensing
- Money transfer license (where required)
- Telecom aggregator license
- Data protection compliance

## Scalability

### Horizontal Scaling
- Stateless API servers
- Load balancing
- Multiple provider endpoints
- Database read replicas

### Caching Strategy
- Operator lists (24 hours)
- Bundle prices (1 hour)
- Country flags (7 days)
- User preferences (session)

### Queue Management
- Bull queue for async processing
- Retry logic for failed transactions
- Dead letter queue for manual review

## Disaster Recovery

### Backup Strategy
- Database backups (hourly)
- Transaction logs (real-time)
- Provider credentials (encrypted vault)

### Failover
- Multiple provider fallback
- Automatic provider switching
- Circuit breaker pattern

## Future Enhancements

1. **Bill Payments**: Electricity, water, cable TV
2. **Gift Cards**: iTunes, Google Play, Amazon
3. **International Remittance**: Cross-border transfers
4. **Bulk Operations**: CSV upload for agents
5. **API Access**: Third-party integrations
6. **Loyalty Program**: Rewards for regular users
7. **Referral System**: Earn by inviting friends
8. **Multi-language Support**: 20+ languages
9. **Voice Top-up**: Call to purchase airtime
10. **Crypto Payments**: Pay with Bitcoin/USDC

## Cost Structure

### Provider Costs
- Reloadly: 2-4% margin
- DingConnect: 3-5% margin
- Africa's Talking: 1-3% margin
- DTOne: 2-4% margin

### Platform Revenue
- Markup: 1-2% on all transactions
- Merchant fees: Annual subscription
- API access: Per transaction fee

## Success Metrics

### User Metrics
- Daily active users
- Transactions per user
- Average transaction value
- User retention rate

### Business Metrics
- Monthly recurring revenue
- Gross merchandise value
- Profit margin
- Customer acquisition cost

### Technical Metrics
- API response time (<500ms)
- Success rate (>98%)
- Uptime (99.9%)
- Error rate (<1%)

## References

- Reloadly API Docs: https://docs.reloadly.com
- DingConnect API: https://www.ding.com/api
- Africa's Talking: https://africastalking.com/airtime
- DTOne API: https://dtone.com/api-docs
