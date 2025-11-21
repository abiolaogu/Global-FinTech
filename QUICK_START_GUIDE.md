# Quick Start Guide - Payment System

## Overview

This guide will help you get the payment system up and running in under 10 minutes.

## Prerequisites

- Node.js 18+ installed
- PostgreSQL 15+ installed and running
- Git installed

## Quick Setup (Development)

### 1. Clone and Install (2 minutes)

```bash
# Clone the repository (if not already done)
git clone https://github.com/abiolaogu/Global-FinTech.git
cd Global-FinTech

# Install dependencies
npm install

# Make scripts executable
chmod +x scripts/*.sh
```

### 2. Configure Environment (3 minutes)

```bash
# Create .env file and generate encryption key
./scripts/setup-env.sh

# Edit .env file and add at least one payment gateway
nano .env

# Required: Add Paystack test keys (for testing)
# Get test keys from: https://dashboard.paystack.com/#/settings/developer
PAYSTACK_SECRET_KEY=sk_test_your_test_key_here
PAYSTACK_PUBLIC_KEY=pk_test_your_test_key_here

# Save and exit (Ctrl+X, then Y, then Enter)
```

### 3. Set Up Database (2 minutes)

```bash
# Create database
createdb global_fintech

# Or using psql
psql -U postgres -c "CREATE DATABASE global_fintech;"

# Run migrations
npm run migration:run
```

### 4. Start Application (1 minute)

```bash
# Start in development mode
npm run start:dev

# Application will be running on http://localhost:3000
```

### 5. Verify Installation (2 minutes)

```bash
# Check health
curl http://localhost:3000/health

# Create a test wallet
curl -X POST http://localhost:3000/api/v1/wallets \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "test-user-1",
    "currency": "USD"
  }'

# You should get a response with walletId
```

## What's Available Out of the Box

Once running, you have access to:

### 1. **Wallet System**
```bash
# Create wallet
POST /api/v1/wallets

# Get wallet
GET /api/v1/wallets/:walletId

# Transfer funds
POST /api/v1/wallets/transfer
```

### 2. **Payment Gateways**
```bash
# Initiate payment
POST /api/v1/payment-gateways/payments/initiate

# Verify payment
POST /api/v1/payment-gateways/payments/verify
```

### 3. **Virtual Accounts**
```bash
# Create virtual account
POST /api/v1/virtual-accounts

# Get virtual account
GET /api/v1/virtual-accounts/:id
```

### 4. **Split Payments**
```bash
# Process split payment
POST /api/v1/split-payments

# Create split configuration
POST /api/v1/split-payments/configurations
```

### 5. **Payment Links**
```bash
# Create payment link
POST /api/v1/payment-links

# Get payment link
GET /api/v1/payment-links/code/:code
```

### 6. **Recurring Payments**
```bash
# Create recurring payment
POST /api/v1/recurring-payments

# Pause/resume/cancel
POST /api/v1/recurring-payments/:id/pause
```

## Testing the System

### Manual Testing

```bash
# 1. Create a wallet
WALLET_RESPONSE=$(curl -X POST http://localhost:3000/api/v1/wallets \
  -H "Content-Type: application/json" \
  -d '{"userId":"user-1","currency":"NGN"}')

WALLET_ID=$(echo $WALLET_RESPONSE | jq -r '.walletId')

# 2. Credit the wallet
curl -X POST http://localhost:3000/api/v1/wallets/$WALLET_ID/credit \
  -H "Content-Type: application/json" \
  -d '{
    "amount": "10000",
    "category": "deposit",
    "description": "Test credit"
  }'

# 3. Check balance
curl http://localhost:3000/api/v1/wallets/$WALLET_ID/balance

# 4. Create a payment link
curl -X POST http://localhost:3000/api/v1/payment-links \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "user-1",
    "title": "Test Payment",
    "amountType": "fixed",
    "amount": "5000",
    "currency": "NGN"
  }'
```

### Run Unit Tests

```bash
npm test
```

### Run Load Tests

```bash
# Install Artillery (if not installed)
npm install -g artillery

# Run load tests
artillery run testing/load-tests/artillery.yml
```

## Common Issues & Solutions

### Issue 1: Database Connection Error

**Error**: `Error: connect ECONNREFUSED 127.0.0.1:5432`

**Solution**:
```bash
# Start PostgreSQL
sudo service postgresql start

# Or on macOS
brew services start postgresql
```

### Issue 2: Migration Error

**Error**: `Migration failed`

**Solution**:
```bash
# Drop and recreate database
dropdb global_fintech
createdb global_fintech
npm run migration:run
```

### Issue 3: Port Already in Use

**Error**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Find process using port 3000
lsof -i :3000

# Kill the process
kill -9 <PID>

# Or change port in .env
echo "PORT=3001" >> .env
```

### Issue 4: Payment Gateway Error

**Error**: `No active paystack connection found`

**Solution**:
- Ensure API keys are correctly set in `.env`
- Verify you're using test keys for development
- Check that `.env` file exists and is loaded

## Next Steps

Now that you have the system running:

1. **Explore the API**
   - Use the API endpoints listed above
   - Check `PAYMENT_SYSTEM_DOCUMENTATION.md` for full API reference

2. **Set Up Additional Gateways**
   - Add Flutterwave keys for African payments
   - Add Stripe keys for global payments
   - See `.env.example` for all available gateways

3. **Configure Webhooks**
   - Use ngrok for local webhook testing
   - See `WEBHOOK_CONFIGURATION_GUIDE.md`

4. **Run Load Tests**
   - Test performance with Artillery
   - Run K6 tests for advanced scenarios

5. **Security Audit**
   ```bash
   ./scripts/run-security-audit.sh
   ```

6. **Deploy to Staging**
   - Follow `DEPLOYMENT_CHECKLIST.md`
   - Set up monitoring and alerts

## Development Workflow

### Making Changes

```bash
# 1. Create a new branch
git checkout -b feature/my-feature

# 2. Make changes

# 3. Run tests
npm test

# 4. Run security audit
./scripts/run-security-audit.sh

# 5. Commit and push
git add .
git commit -m "feat: Add new feature"
git push origin feature/my-feature
```

### Database Changes

```bash
# 1. Create a new migration
npm run migration:create -- -n MyMigration

# 2. Edit the migration file in apps/api/src/migrations/

# 3. Run migration
npm run migration:run

# 4. To revert
npm run migration:revert
```

## Useful Commands

```bash
# Development
npm run start:dev          # Start in development mode
npm run build              # Build for production
npm run start:prod         # Start in production mode

# Database
npm run migration:run      # Run migrations
npm run migration:revert   # Revert last migration
npm run migration:show     # Show migration status

# Testing
npm test                   # Run unit tests
npm run test:watch         # Run tests in watch mode
npm run test:cov           # Run tests with coverage
npm run test:e2e           # Run end-to-end tests

# Code Quality
npm run lint               # Run linter
npm run format             # Format code

# Load Testing
artillery run testing/load-tests/artillery.yml
k6 run testing/load-tests/k6-test.js

# Security
./scripts/run-security-audit.sh
```

## API Documentation

### OpenAPI/Swagger

Once the application is running, access Swagger docs at:

```
http://localhost:3000/api/docs
```

### Postman Collection

Import the API endpoints into Postman for easy testing.

## Support

- **Documentation**: See `docs/` folder
- **Issues**: Create an issue on GitHub
- **Security**: Email security@global-fintech.com

## Resources

- [Payment System Documentation](./PAYMENT_SYSTEM_DOCUMENTATION.md)
- [Security & Performance Guide](./SECURITY_AND_PERFORMANCE_GUIDE.md)
- [Webhook Configuration](./WEBHOOK_CONFIGURATION_GUIDE.md)
- [Deployment Checklist](./DEPLOYMENT_CHECKLIST.md)
- [Implementation Summary](./PAYMENT_SYSTEM_IMPLEMENTATION_SUMMARY.md)

---

**Need Help?**

If you encounter any issues:
1. Check this guide first
2. Review the error message
3. Check the logs: `tail -f logs/application.log`
4. Search existing issues on GitHub
5. Create a new issue with details

**Happy Coding! 🚀**
