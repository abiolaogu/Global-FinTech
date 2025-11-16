# AtlasX End-to-End Testing Suite

Comprehensive E2E tests for the AtlasX Global Fintech Platform covering all major features and integration scenarios.

## Overview

This test suite validates the entire AtlasX platform from a user's perspective, including:

- **User Registration & Authentication**: KYC verification, biometric auth, OAuth2 flows
- **P2P Lending**: Loan listings, investments, fractional lending, repayments
- **Open Banking**: Account aggregation, transaction history, Plaid integration
- **Partner API**: OAuth2 authorization, API key management, webhook delivery
- **Platform Integration**: Cross-feature workflows and complete user journeys

## Test Coverage

### 1. P2P Lending (`p2p-lending.e2e.test.ts`)

**Tests**: 25+ test cases

**Covers**:
- Loan listing creation with risk-based pricing
- Interest rate validation by credit tier
- Monthly payment calculations
- Fractional lending from multiple lenders
- Investment tracking and portfolio management
- Proportional repayment distribution
- Overdue payment detection
- Marketplace filtering by risk tier

**Key Scenarios**:
```typescript
// Create loan listing
POST /p2p-lending/listings
{
  borrowerId: "uuid",
  amount: "10000.00",
  interestRate: 12.5,
  term: 24,
  creditScore: 720
}

// Invest in loan
POST /p2p-lending/investments
{
  lenderId: "uuid",
  loanListingId: "uuid",
  amount: "2000.00"
}

// Process repayment
POST /p2p-lending/repayments
{
  loanListingId: "uuid",
  amount: "600.00",
  paymentMethod: "bank_transfer"
}
```

### 2. Open Banking (`open-banking.e2e.test.ts`)

**Tests**: 20+ test cases

**Covers**:
- Plaid link token creation
- Public token exchange for access tokens
- Account aggregation and balance retrieval
- Transaction history retrieval
- Identity verification
- Connection management (refresh, disconnect)
- AES-256-GCM encryption verification
- Consent expiration tracking (90 days)

**Key Scenarios**:
```typescript
// Create link token
POST /open-banking/create-link-token
{
  userId: "uuid",
  products: ["auth", "transactions", "identity"]
}

// Exchange public token
POST /open-banking/exchange-public-token
{
  userId: "uuid",
  publicToken: "public-token",
  institutionId: "ins_123"
}

// Get accounts
GET /open-banking/connections/{connectionId}/accounts

// Get transactions
GET /open-banking/connections/{connectionId}/transactions?startDate=2024-01-01&endDate=2024-01-31
```

### 3. OAuth2 & Partner API (`oauth2-partner-api.e2e.test.ts`)

**Tests**: 18+ test cases

**Covers**:
- API key generation (format: `atx_live_XXXXXXXX...`)
- SHA-256 key hashing
- IP whitelist enforcement
- Key rotation with grace period
- OAuth2 authorization code flow
- Access token and refresh token exchange
- Scope-based permissions
- Rate limiting (100 requests/minute)
- Partner API operations (user creation, wallet management, payments)

**Key Scenarios**:
```typescript
// Create API key
POST /api-keys
{
  partnerId: "uuid",
  name: "Production Key",
  permissions: ["users:read", "payments:create"]
}

// OAuth2 authorization
POST /oauth2/authorize
{
  clientId: "client_id",
  userId: "uuid",
  redirectUri: "https://partner.com/callback",
  scope: "users:read wallets:read"
}

// Exchange authorization code
POST /oauth2/token
{
  grantType: "authorization_code",
  code: "auth_code",
  clientId: "client_id",
  clientSecret: "secret"
}

// Use Partner API
POST /partner/users
Headers: { "X-API-Key": "atx_live_..." }
{
  email: "user@example.com",
  firstName: "John",
  lastName: "Doe"
}
```

### 4. Webhooks (`webhooks.e2e.test.ts`)

**Tests**: 15+ test cases

**Covers**:
- Webhook endpoint registration
- HMAC-SHA256 signature generation and verification
- Event subscriptions and filtering
- Exponential backoff retry (30s, 60s, 300s, 900s, 3600s)
- Delivery tracking and failure handling
- Endpoint enable/disable/delete
- Concurrent delivery handling

**Signature Verification**:
```typescript
// Webhook signature format: t=timestamp,v1=signature
const [timestampPart, signaturePart] = signature.split(',');
const timestamp = timestampPart.split('=')[1];
const receivedSignature = signaturePart.split('=')[1];

const payload = `${timestamp}.${JSON.stringify(body)}`;
const expectedSignature = crypto
  .createHmac('sha256', secret)
  .update(payload)
  .digest('hex');
```

**Key Scenarios**:
```typescript
// Register webhook
POST /webhooks/endpoints
{
  partnerId: "uuid",
  url: "https://partner.com/webhooks",
  events: ["transaction.created", "loan.disbursed"]
}

// Webhook payload received
Headers: {
  "X-AtlasX-Signature": "t=1234567890,v1=abc123...",
  "X-AtlasX-Delivery-ID": "del_xxx",
  "X-AtlasX-Event-Type": "transaction.created"
}
Body: {
  event: "transaction.created",
  data: { ... }
}
```

### 5. Platform Integration (`platform-integration.e2e.test.ts`)

**Tests**: 15+ test cases

**Covers**:
- Complete user journey: registration → KYC → wallet → lending → premium subscription
- Cross-feature integration (wallet + P2P lending + Open Banking)
- Concurrent operations (simultaneous registrations, investments)
- Transaction history integration
- Payment distribution verification
- Platform performance under load

**Complete User Journey**:
```
1. Register user
2. Complete KYC verification
3. Create USD wallet
4. Connect bank account (Open Banking)
5. Deposit $5,000
6. Send P2P transfer ($250)
7. Browse lending marketplace
8. Invest in P2P loan ($500)
9. Subscribe to Gold tier
10. Enable biometric auth
11. Register for push notifications
```

## Setup

### 1. Install Dependencies

```bash
cd testing/e2e
npm install
```

### 2. Configure Environment

Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Edit `.env` with your configuration:

```env
API_BASE_URL=http://localhost:3000
PLAID_ENV=sandbox
PLAID_CLIENT_ID=your_client_id
PLAID_SECRET=your_secret
```

### 3. Start the API Server

Ensure the AtlasX API is running:

```bash
# From project root
cd apps/api
npm run start:dev
```

### 4. Prepare Test Database

Run migrations and seed test data:

```bash
npm run db:migrate:test
npm run db:seed:test
```

## Running Tests

### Run All Tests

```bash
npm test
```

### Run Specific Test Suite

```bash
# P2P Lending only
npm test -- p2p-lending

# Open Banking only
npm test -- open-banking

# OAuth2 and Partner API
npm test -- oauth2-partner-api

# Webhooks
npm test -- webhooks

# Platform Integration
npm test -- platform-integration
```

### Run Tests in Watch Mode

```bash
npm run test:watch
```

### Run with Coverage

```bash
npm run test:coverage
```

### Run Specific Test Case

```bash
npm run test:specific -- "should create a loan listing"
```

## Test Configuration

### Timeout Settings

Default timeout: 30 seconds per test

Adjust in `jest.config.js`:

```javascript
testTimeout: 30000
```

### Parallel vs Serial Execution

E2E tests run serially by default to avoid conflicts:

```javascript
maxWorkers: 1
```

### Rate Limiting

Tests account for API rate limits:
- 100 requests per minute per API key
- 20 requests per minute per user
- Exponential backoff on failures

## Test Data Management

### Unique Test Data Generation

Helper functions ensure no conflicts:

```typescript
import { generateTestEmail, generateTestPhone } from './helpers/test-setup';

const email = generateTestEmail('prefix'); // prefix-1234567890-5678@atlasx-test.com
const phone = generateTestPhone(); // +15551234567890
```

### Test User Cleanup

Test users are prefixed with `test-` for easy identification and cleanup:

```sql
DELETE FROM users WHERE email LIKE '%@atlasx-test.com';
```

## Debugging Tests

### Enable Verbose Logging

Set `LOG_LEVEL=debug` in `.env`:

```env
LOG_LEVEL=debug
LOG_TESTS=true
```

### Run Single Test with Debugging

```bash
node --inspect-brk node_modules/.bin/jest p2p-lending.e2e.test.ts
```

### View HTTP Requests

Tests use `axios` - enable request logging:

```typescript
axios.interceptors.request.use(request => {
  console.log('Starting Request', request);
  return request;
});
```

## CI/CD Integration

### GitHub Actions

```yaml
name: E2E Tests

on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest

    services:
      postgres:
        image: postgres:15
        env:
          POSTGRES_DB: atlasx_test
          POSTGRES_PASSWORD: postgres
        ports:
          - 5432:5432

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'

      - name: Install dependencies
        run: |
          cd testing/e2e
          npm install

      - name: Start API server
        run: |
          cd apps/api
          npm run start:dev &
          sleep 10

      - name: Run E2E tests
        run: |
          cd testing/e2e
          npm test
        env:
          API_BASE_URL: http://localhost:3000
          DB_HOST: localhost
          DB_PORT: 5432

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./testing/e2e/coverage/lcov.info
```

## Test Helpers

### TestClient

HTTP client wrapper with authentication:

```typescript
import { TestClient } from './helpers/test-setup';

const client = new TestClient();

// Set auth token
client.setAuthToken(token);

// Make requests
const response = await client.post('/endpoint', data);
const response = await client.get('/endpoint', params);

// Clear auth
client.clearAuthToken();
```

### Utility Functions

```typescript
// Wait for async operations
await sleep(1000); // 1 second

// Wait for condition
const success = await waitFor(
  async () => someCondition(),
  timeout: 10000,
  interval: 500
);

// Retry with exponential backoff
const result = await retryOperation(
  async () => unstableOperation(),
  maxRetries: 3,
  initialDelay: 1000
);
```

## Known Issues and Limitations

### Plaid Sandbox Limitations

- Sandbox tokens may not work for all institutions
- Transaction history limited to 24 months
- Some identity fields may be mock data

### Webhook Testing

- Webhooks require accessible HTTP endpoints
- Tests use local mock servers (localhost)
- May not work behind strict firewalls

### Concurrent Testing

- Database isolation required for parallel test execution
- Current setup runs tests serially to avoid conflicts
- Use separate test databases for true parallel execution

## Performance Benchmarks

Target performance for E2E tests:

| Test Suite | Test Count | Avg Duration | Max Duration |
|-----------|-----------|--------------|--------------|
| P2P Lending | 25 | 45s | 60s |
| Open Banking | 20 | 35s | 50s |
| OAuth2 & Partner API | 18 | 40s | 55s |
| Webhooks | 15 | 50s | 70s |
| Platform Integration | 15 | 60s | 90s |
| **Total** | **93** | **230s** | **325s** |

## Contributing

### Adding New Tests

1. Create test file: `tests/feature-name.e2e.test.ts`
2. Import test helpers: `import { TestClient } from './helpers/test-setup'`
3. Follow naming convention: `describe('Feature E2E Tests', () => {...})`
4. Use `beforeAll`, `beforeEach` for setup
5. Clean up resources in `afterAll`, `afterEach`

### Test Best Practices

- **Isolation**: Each test should be independent
- **Idempotency**: Tests should produce same results on reruns
- **Cleanup**: Always clean up test data
- **Assertions**: Use specific assertions, avoid generic `toBeTruthy()`
- **Error Messages**: Include context in expect messages

### Example Test Structure

```typescript
describe('Feature E2E Tests', () => {
  let client: TestClient;
  let userId: string;

  beforeAll(async () => {
    client = new TestClient();
    // Global setup
  });

  afterAll(async () => {
    // Global cleanup
  });

  describe('Scenario Group', () => {
    beforeEach(async () => {
      // Setup for each test
    });

    it('should perform specific action', async () => {
      // Arrange
      const data = { ... };

      // Act
      const response = await client.post('/endpoint', data);

      // Assert
      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('id');
    });
  });
});
```

## Support

For issues or questions:

- **Documentation**: Check `/docs` directory
- **Issues**: GitHub Issues
- **Slack**: #atlasx-testing channel

## License

Copyright © 2024 AtlasX Global Fintech Platform
