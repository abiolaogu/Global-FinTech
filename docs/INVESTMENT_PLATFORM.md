# AtlasX Investment Platform

## Overview

The AtlasX Investment Platform enables users to invest in a wide variety of investment opportunities while providing a backend portal for investment companies to submit and manage their offerings. The platform includes a comprehensive approval workflow managed by the AtlasX team.

## Architecture

### Components

1. **Investment Companies** - Organizations that provide investment opportunities
2. **Investment Opportunities** - Specific investment products (stocks, bonds, funds, etc.)
3. **Investment Portfolio** - User's holdings across multiple investments
4. **Investment Transactions** - Buy/sell records for investments
5. **Approval Workflow** - AtlasX team review and launch process

### Investment Categories

The platform supports all major investment categories:

- **Stocks** - Individual company shares
- **Bonds** - Government and corporate debt securities
- **Mutual Funds** - Professionally managed investment pools
- **ETFs** - Exchange-traded funds
- **Real Estate** - REITs and property investments
- **Commodities** - Gold, silver, oil, agricultural products
- **Cryptocurrency** - Digital assets and tokens
- **Private Equity** - Non-public company investments
- **Venture Capital** - Early-stage startup investments
- **Hedge Funds** - Alternative investment strategies
- **Structured Products** - Complex derivative instruments
- **Alternative Investments** - Art, collectibles, other assets

### Risk Levels

All opportunities are classified by risk:

- **Very Low** - Government bonds, money market funds
- **Low** - Blue-chip stocks, high-grade corporate bonds
- **Moderate** - Diversified mutual funds, balanced portfolios
- **High** - Growth stocks, emerging markets, commodities
- **Very High** - Startups, crypto, speculative ventures

## For Investment Companies

### Registration Process

Investment companies must register and get approved before submitting opportunities:

```typescript
POST /company-portal/register

{
  "companyName": "Global Asset Managers",
  "legalName": "Global Asset Managers Inc.",
  "registrationNumber": "SEC-123456",
  "companyType": "asset_manager",
  "country": "USA",
  "address": "123 Wall Street, New York, NY 10005",
  "email": "compliance@globalasset.com",
  "phone": "+1-212-555-0100",
  "secRegistration": "801-12345",
  "licenses": ["RIA", "BD"],
  "assetsUnderManagement": "5000000000",
  "aumCurrency": "USD",
  "yearEstablished": 2010,
  "contactPersonName": "John Smith",
  "contactPersonEmail": "john.smith@globalasset.com",
  "contactPersonPhone": "+1-212-555-0101"
}
```

**Required Documents:**
- Business registration certificate
- Regulatory licenses (SEC, FINRA, etc.)
- Compliance certifications
- Audited financial statements
- Insurance certificates

### Company Status Flow

```
PENDING → APPROVED/REJECTED → (if approved) ACTIVE
         ↓
      SUSPENDED (if violations occur)
```

### Creating Investment Opportunities

Once approved, companies can create investment opportunities:

```typescript
POST /investments/companies/:companyId/opportunities

{
  "title": "Global Tech Growth Fund",
  "description": "Diversified portfolio of high-growth technology companies...",
  "category": "mutual_funds",
  "riskLevel": "moderate",
  "minimumInvestment": "1000.00",
  "maximumInvestment": "100000.00",
  "currency": "USD",
  "targetAmount": "50000000.00",
  "projectedReturn": "12.5",
  "investmentTerm": 60,
  "liquidityType": "monthly",
  "managementFee": "1.5",
  "performanceFee": "15.0",
  "entryFee": "0.5",
  "exitFee": "0.0",
  "sector": "technology",
  "geographies": ["USA", "Europe", "Asia"],
  "prospectusUrls": ["https://docs.example.com/prospectus.pdf"],
  "factSheetUrls": ["https://docs.example.com/factsheet.pdf"],
  "regulatoryFramework": "Reg D 506(c)",
  "accreditedInvestorsOnly": false
}
```

### Opportunity Submission Workflow

```
1. DRAFT → Company creates opportunity
2. SUBMITTED → Company submits for review
3. UNDER_REVIEW → AtlasX team reviews
4. APPROVED/REJECTED → Review decision
5. ACTIVE → AtlasX team launches (if approved)
```

**Review Criteria:**
- Complete and accurate information
- Proper regulatory compliance
- Adequate risk disclosures
- Valid prospectus and legal documents
- Fee structure transparency
- Company track record

### Company Portal Dashboard

```typescript
GET /company-portal/dashboard

Response:
{
  "company": {
    "companyId": "comp_abc123",
    "companyName": "Global Asset Managers",
    "status": "approved",
    "totalOpportunities": 15,
    "activeOpportunities": 12,
    "totalRaised": "125000000.00",
    "totalInvestors": 5420,
    "averageRating": "4.6"
  },
  "stats": {
    "totalOpportunities": 15,
    "activeOpportunities": 12,
    "totalRaised": "125000000.00",
    "totalInvestors": 5420,
    "averageRating": "4.6"
  }
}
```

## For AtlasX Team (Admin)

### Review Company Applications

```typescript
POST /admin/investments/companies/:companyId/review

{
  "approved": true,
  "reason": "All documents verified, licenses valid"
}
```

### Review Opportunities

```typescript
POST /admin/investments/opportunities/:opportunityId/review

{
  "action": "approve",  // or "reject", "request_changes"
  "notes": "Approved - all compliance requirements met"
}
```

### Launch Opportunities

After approval, launch to make visible to users:

```typescript
POST /admin/investments/opportunities/:opportunityId/launch
```

### Admin Dashboard

```typescript
GET /admin/investments/stats

Response:
{
  "totalCompanies": 156,
  "approvedCompanies": 142,
  "pendingCompanies": 14,
  "totalOpportunities": 1245,
  "activeOpportunities": 987,
  "pendingReview": 23,
  "totalInvested": "2450000000.00",
  "totalInvestors": 125000
}
```

## For Users/Investors

### Search Investment Opportunities

```typescript
GET /investments/opportunities/search?category=mutual_funds&riskLevel=moderate&minInvestment=1000

Response:
{
  "opportunities": [
    {
      "opportunityId": "inv_001",
      "title": "Global Tech Growth Fund",
      "category": "mutual_funds",
      "riskLevel": "moderate",
      "minimumInvestment": "1000.00",
      "projectedReturn": "12.5",
      "totalInvestors": 1250,
      "raisedAmount": "15000000.00",
      "averageRating": "4.5"
    }
  ],
  "total": 45
}
```

**Search Filters:**
- `category` - Investment category
- `riskLevel` - Risk classification
- `minInvestment` - Minimum investment amount
- `maxInvestment` - Maximum investment amount
- `search` - Text search in title/description
- `limit` - Results per page (default: 20)
- `offset` - Pagination offset

### View Opportunity Details

```typescript
GET /investments/opportunities/:opportunityId

Response:
{
  "opportunityId": "inv_001",
  "title": "Global Tech Growth Fund",
  "description": "...",
  "category": "mutual_funds",
  "riskLevel": "moderate",
  "minimumInvestment": "1000.00",
  "projectedReturn": "12.5",
  "managementFee": "1.5",
  "performanceFee": "15.0",
  "company": {
    "companyName": "Global Asset Managers",
    "assetsUnderManagement": "5000000000",
    "yearEstablished": 2010
  },
  "performanceHistory": {...},
  "prospectusUrls": [...]
}
```

### Invest in Opportunity

```typescript
POST /investments/invest

{
  "opportunityId": "inv_001",
  "amount": "5000.00",
  "currency": "USD",
  "paymentMethod": "wallet"
}

Response:
{
  "transactionId": "txn_abc123",
  "status": "completed",
  "shares": "475.00",
  "pricePerShare": "10.53",
  "amount": "5000.00",
  "totalFees": "25.00",
  "netAmount": "4975.00"
}
```

### View Portfolio

```typescript
GET /investments/portfolio

Response:
{
  "summary": {
    "totalInvested": "25000.00",
    "totalValue": "28450.00",
    "totalGainLoss": "3450.00",
    "totalGainLossPercent": "13.8",
    "totalHoldings": 5
  },
  "holdings": [
    {
      "opportunityId": "inv_001",
      "title": "Global Tech Growth Fund",
      "shares": "475.00",
      "totalInvested": "5000.00",
      "currentValue": "5690.00",
      "unrealizedGainLoss": "690.00",
      "unrealizedGainLossPercent": "13.8"
    }
  ]
}
```

### View Transactions

```typescript
GET /investments/transactions?limit=20

Response: [
  {
    "transactionId": "txn_abc123",
    "type": "buy",
    "opportunityTitle": "Global Tech Growth Fund",
    "amount": "5000.00",
    "shares": "475.00",
    "status": "completed",
    "createdAt": "2025-11-15T10:30:00Z"
  }
]
```

## Fees Structure

### Platform Fees

- **Management Fee**: 1.5% annually (charged by investment companies)
- **Performance Fee**: 15% of profits above benchmark (charged by companies)
- **Entry Fee**: 0-2% (varies by opportunity)
- **Exit Fee**: 0-2% (varies by opportunity)
- **AtlasX Platform Fee**: 0.5% transaction fee (included in entry fee)

### Fee Calculation Example

Investment: $10,000
- Entry Fee (0.5%): $50
- Net Investment: $9,950
- Shares Purchased: 945 @ $10.53/share
- Annual Management Fee: $149.25 (1.5% of $9,950)

## Regulatory Compliance

### KYC Requirements

**Tier 1** (up to $500/day):
- Phone + Email verification
- Not sufficient for investments

**Tier 2** (up to $5,000/day):
- Government ID
- Selfie verification
- Minimum for most investments

**Tier 3** (Unlimited):
- Address proof
- Enhanced due diligence
- Required for accredited investor status

### Accredited Investor Verification

For opportunities marked `accreditedInvestorsOnly: true`, users must prove:
- Annual income > $200K (individual) or $300K (joint)
- Net worth > $1M (excluding primary residence)
- Professional certifications (Series 7, 65, 82)

### Tax Reporting

- **Form 1099-DIV**: Dividend income
- **Form 1099-INT**: Interest income
- **Form 1099-B**: Capital gains/losses
- **Form 5498**: IRA contributions (if applicable)

## Risk Disclosures

All investments carry risk:
- **Market Risk**: Value may fluctuate
- **Liquidity Risk**: May not be able to sell quickly
- **Credit Risk**: Issuer may default
- **Currency Risk**: Exchange rate fluctuations
- **Interest Rate Risk**: Bond values inverse to rates
- **Inflation Risk**: Real returns may be negative

**Past performance does not guarantee future results.**

## API Rate Limits

- **Search**: 100 requests/minute
- **Invest**: 10 requests/minute
- **View Portfolio**: 60 requests/minute
- **Company Portal**: 120 requests/minute

## Support

For investment companies:
- Email: partners@atlasx.io
- Phone: +1-800-ATLASX-BIZ

For investors:
- Email: support@atlasx.io
- Phone: +1-800-ATLASX-INV
- AI Chat: Available 24/7 in app

## Technical Integration

See [API Documentation](./API_REFERENCE.md) for:
- Authentication (OAuth 2.0)
- Webhooks for transaction updates
- WebSocket for real-time portfolio updates
- SDK libraries (JavaScript, Python, Java, Go)
