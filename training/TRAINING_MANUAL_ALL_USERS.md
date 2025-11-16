# AtlasX Platform Training Manual
## Comprehensive Guide for All User Categories

**Version 2.0 - January 2024**

---

## Table of Contents

1. [Individual Users (Consumers)](#individual-users)
2. [ROSCA Circle Organizers](#rosca-organizers)
3. [P2P Lending Borrowers](#p2p-borrowers)
4. [P2P Lending Lenders/Investors](#p2p-lenders)
5. [Business Users & Merchants](#business-users)
6. [Partner Developers & Integrators](#partner-developers)
7. [Platform Administrators](#platform-administrators)
8. [Compliance Officers](#compliance-officers)
9. [Customer Support Agents](#customer-support)
10. [Regional Managers](#regional-managers)

---

<a name="individual-users"></a>
## 1. Individual Users (Consumers)

### 1.1 Getting Started

#### Registration Process

**Step 1: Download the App**
- iOS: App Store → Search "AtlasX"
- Android: Google Play → Search "AtlasX"
- Web: https://app.atlasx.com

**Step 2: Create Account**
```
1. Enter phone number or email
2. Receive verification code (SMS/Email)
3. Enter 6-digit code
4. Create password (min 8 chars, 1 uppercase, 1 number, 1 special)
5. Set up biometric authentication (optional but recommended)
```

**Step 3: Basic KYC (Tier 1)**
- Name
- Date of birth
- Country of residence
- **Limits**: $500/day, $2,000/month

**Step 4: Enhanced KYC (Tier 2)**
- Government ID (Passport, National ID, Driver's License)
- Selfie verification
- Address proof (utility bill, bank statement)
- **Limits**: $5,000/day, $50,000/month

**Step 5: Full KYC (Tier 3)**
- Source of funds declaration
- Tax ID/SSN
- Video verification call
- **Limits**: $50,000/day, unlimited monthly

---

### 1.2 Setting Up Payment Methods

#### Link Bank Account (Open Banking)

```
Navigation: Profile → Payment Methods → Add Bank Account

1. Click "Connect Bank"
2. Select your country
3. Choose your bank from list
4. Authenticate with bank credentials
5. Select accounts to link
6. Confirm connection

Supported countries: UK, EU (36 countries), USA, Kenya, Nigeria, 50+ more
```

#### Add Payment Rail

**For UPI (India)**:
```
1. Go to Payment Methods → Add Payment Method
2. Select "UPI"
3. Enter UPI VPA (e.g., username@okaxis)
4. Verify with small test transaction (₹1)
5. Confirm
```

**For M-Pesa (Kenya)**:
```
1. Select "M-Pesa"
2. Enter registered phone number
3. You'll receive STK push on phone
4. Enter M-Pesa PIN
5. Confirm
```

**For Zelle (USA)**:
```
1. Select "Zelle"
2. Enter email or phone registered with your bank
3. Verify connection
4. Ready to send/receive
```

---

### 1.3 Making Payments

#### Send Money Domestically

```
1. Tap "Send" on home screen
2. Enter recipient:
   - Phone number
   - Email
   - Payment rail ID (UPI VPA, M-Pesa number, etc.)
   - Or select from contacts
3. Enter amount
4. Select payment method
5. Add note/reference (optional)
6. Review details
7. Confirm with biometric/PIN
8. Done! Payment completes in < 1 minute
```

**Example (Nigeria → Nigeria via Paystack)**:
```
From: Your linked bank account
To: recipient@email.com
Amount: ₦10,000
Fee: ₦150 (1.5%)
Total: ₦10,150
Time: ~30 seconds
```

---

#### Send Money Internationally

```
1. Tap "Send International"
2. Select destination country
3. Enter recipient details
4. Enter amount in your currency
5. See real-time FX rate and fees
6. Choose payment rail:
   - Fastest (< 2 min, higher fee)
   - Standard (< 1 hour, lower fee)
   - Economy (24 hours, lowest fee)
7. Confirm
```

**Example (USA → Kenya)**:
```
From: USD bank account
To: +254712345678 (M-Pesa)
Amount: $100 USD
Exchange Rate: 1 USD = 150 KES
Recipient Gets: 14,850 KES
Fee: $0.80 (0.8%)
Total: $100.80
Time: ~1 minute
```

**Supported Corridors** (60+ countries):
- USA → Nigeria, Kenya, Ghana, Philippines, Mexico, India
- UK → Nigeria, Kenya, India, Poland
- Canada → India, Philippines
- [Full list in app]

---

### 1.4 Multi-Currency Wallets

#### Create Additional Wallets

```
1. Go to Wallets tab
2. Tap "+" → Add Currency
3. Select currency (USD, EUR, GBP, NGN, KES, INR, etc.)
4. Wallet created instantly
5. Get local account details for receiving
```

**Holding Multiple Currencies**:
- USD Wallet → Receive from USA employers/clients
- EUR Wallet → Receive from EU clients
- NGN Wallet → Pay local bills in Nigeria
- KES Wallet → M-Pesa integration

**Currency Exchange**:
```
1. Select source wallet
2. Tap "Exchange"
3. Select destination wallet
4. Enter amount
5. See mid-market rate + 0.3% markup
6. Confirm
7. Exchange completes instantly
```

---

### 1.5 Virtual & Physical Cards

#### Request Virtual Card

```
1. Go to Cards tab
2. Tap "Request Virtual Card"
3. Select currency (USD, EUR, GBP)
4. Card generated instantly
5. Add to Apple Pay / Google Pay
6. Start using immediately
```

**Virtual Card Features**:
- Instant generation
- Freeze/unfreeze anytime
- Set spending limits
- Merchant restrictions
- Temporary cards for one-time purchases

#### Request Physical Card

```
1. Go to Cards → Request Physical Card
2. Select card design
3. Enter shipping address
4. Pay card fee ($5-10 depending on country)
5. Card arrives in 7-14 days
6. Activate in app
```

**Card Limits**:
- Free Tier: $500/day
- Silver: $2,000/day
- Gold: $10,000/day
- Platinum: $50,000/day

---

### 1.6 Subscription Tiers

```
┌──────────────────────────────────────────────────────────────┐
│  Feature                │ Free │ Silver │ Gold  │ Platinum  │
├──────────────────────────────────────────────────────────────┤
│  Monthly Fee            │  $0  │  $2.99 │ $9.99 │  $29.99   │
│  Free Transfers/Month   │  3   │   20   │  100  │ Unlimited │
│  FX Markup              │ 0.8% │  0.5%  │ 0.3%  │   0.1%    │
│  ATM Withdrawals        │  2   │   10   │   50  │ Unlimited │
│  Virtual Cards          │  1   │    5   │   20  │ Unlimited │
│  Physical Cards         │  $10 │   $5   │  Free │   Free    │
│  Interest on Balance    │  0%  │   1%   │   3%  │    5%     │
│  Priority Support       │  ✗   │    ✗   │   ✓   │     ✓     │
│  Concierge Service      │  ✗   │    ✗   │   ✗   │     ✓     │
└──────────────────────────────────────────────────────────────┘
```

**Upgrade Process**:
```
1. Go to Profile → Subscription
2. Select tier
3. Choose payment method
4. Confirm
5. Upgrade is instant
```

---

### 1.7 Security Best Practices

**Enable Two-Factor Authentication (2FA)**:
```
1. Settings → Security → 2FA
2. Choose method:
   - SMS (less secure)
   - Authenticator app (recommended)
   - Biometric + PIN
3. Scan QR code with authenticator app
4. Enter 6-digit code to confirm
5. Save backup codes
```

**Biometric Authentication**:
- Face ID (iOS)
- Touch ID (iOS)
- Fingerprint (Android)
- Iris scan (Samsung)

**Transaction Alerts**:
```
Settings → Notifications → Transaction Alerts
✓ Enable instant push notifications
✓ Enable SMS alerts (for large transactions)
✓ Enable email alerts (daily summary)
```

**Freeze Your Account**:
- If phone stolen: Settings → Security → Freeze Account
- Or call support: +1-800-ATLASX (24/7)

---

<a name="rosca-organizers"></a>
## 2. ROSCA Circle Organizers

### 2.1 What is Digital ROSCA?

**ROSCA** = Rotating Savings and Credit Association

**Traditional (Offline)**:
- Esusu (Nigeria - Yoruba)
- Ajo (Nigeria - Yoruba)
- Adashe (Nigeria - Hausa)
- Chama (Kenya)
- Stokvels (South Africa)
- Tandas (Mexico)

**Digital ROSCA (AtlasX)**:
- **Trustless**: No physical cash handling
- **Transparent**: All contributions visible
- **Automated**: Auto-reminders, auto-payouts
- **Secure**: KYC verified members
- **Scalable**: Support 1000s of circles

---

### 2.2 Creating a ROSCA Circle

#### Step-by-Step Guide

```
1. Navigate to ROSCA tab → Create Circle

2. Circle Details:
   - Name: e.g., "University Friends Savings 2024"
   - Description: Purpose and rules
   - Type:
     • Fixed Rotation (order set at start)
     • Random (lottery each cycle)
     • Bidding (highest bid wins)
     • Organizer Decides (you choose each cycle)

3. Financial Settings:
   - Contribution Amount: e.g., $100/month
   - Currency: USD, NGN, KES, GHS, etc.
   - Frequency: Daily, Weekly, Biweekly, Monthly
   - Number of Members: 5-100

4. Rules Configuration:
   - Late Fee: Yes/No (default 5% of contribution)
   - Grace Period: 0-7 days
   - Allow Partial Payments: Yes/No
   - Require KYC: Tier 1, 2, or 3

5. Privacy:
   - Public (anyone can find and join)
   - Private (invite-only, generates invite code)

6. Review and Create
```

**Example Circle**:
```
Name: "Lagos Tech Workers Savings"
Type: Fixed Rotation
Contribution: ₦20,000/month
Members: 20
Duration: 20 months
Total Pool/Cycle: ₦400,000
Start Date: February 1, 2024
End Date: September 30, 2025
```

---

### 2.3 Inviting Members

#### For Private Circles

```
1. After creating circle, get invite code (e.g., "LAGOS2024")
2. Share via:
   - WhatsApp
   - SMS
   - Email
   - In-app share button
3. Members enter code when joining
4. You can revoke/change invite code anytime
```

#### For Public Circles

```
1. Circle appears in ROSCA marketplace
2. Users can search by:
   - Currency
   - Contribution amount
   - Frequency
   - Location
3. Join requests require your approval
```

---

### 2.4 Managing Your Circle

#### Member Management

```
Dashboard → My Circles → [Circle Name] → Members

View for each member:
- Name, profile photo
- Join date
- Payout position
- Reliability score (0-100)
- Payment history (on-time, late, missed)
- Total contributed
- Status (active, defaulted, removed)

Actions:
- Remove member (before they receive payout)
- View contribution history
- Send reminder
- Report issue
```

#### Contribution Tracking

```
Dashboard shows:
- Current cycle number (e.g., Cycle 5 of 20)
- Contributions received (15/20 paid)
- Contributions pending (5/20 pending)
- Days until next payout
- Next recipient

Automated reminders:
- 7 days before due date
- 3 days before due date
- 1 day before due date
- Day of due date
- 1 day after (late fee warning)
```

#### Payout Management

```
Automatic Payout Process:
1. All contributions received for cycle
2. System calculates total pool
3. Deducts platform fee (1.5%)
4. Transfers to recipient's wallet
5. Sends notification to all members
6. Next cycle begins

Manual Override (for organizer_decides type):
- Select next recipient from dropdown
- Confirm selection
- Payout proceeds
```

---

### 2.5 Handling Defaults

**What happens if a member doesn't pay?**

```
Grace Period (e.g., 3 days):
- Automated reminders sent
- No late fee yet

After Grace Period:
- Late fee applied (e.g., 5% = $5 on $100)
- Member marked as "late"
- You're notified

After 7 Days Overdue:
- Member marked as "defaulted"
- Options:
  1. Wait (automated collection attempts continue)
  2. Remove member (they forfeit未来 payout)
  3. Cover the amount yourself (get reimbursed when they pay)
  4. Collective decision (all members vote)

If member received payout but stops contributing:
- Legal recourse (depending on jurisdiction)
- Negative reputation score
- Blocked from future circles
- Collection agency referral (optional)
```

#### Default Insurance (Optional Add-On)

```
Cost: 2% of contribution amount
Coverage: Up to 100% of defaulted amounts
Example:
- Circle: 20 members × $100 = $2,000/cycle
- Insurance: 2% × $2,000 = $40/cycle (split among members)
- If 1 member defaults on $100, insurance pays

Activate: Circle Settings → Insurance → Enable
```

---

### 2.6 Circle Analytics

```
Dashboard → My Circles → [Circle Name] → Analytics

Metrics:
- Total Contributed: $45,000
- Total Paid Out: $40,000
- Platform Fees Paid: $675
- Average Reliability Score: 94/100
- On-Time Payment Rate: 92%
- Late Payment Rate: 6%
- Missed Payment Rate: 2%

Charts:
- Contribution trends over time
- Member reliability scores
- Payout distribution timeline
```

---

### 2.7 Best Practices for Organizers

**1. Know Your Members**
- Prefer people you trust or have been referred
- Check reliability scores from previous circles
- Start with smaller amounts for new members

**2. Clear Rules from the Start**
- Document all rules in circle description
- Share offline as well (WhatsApp group)
- Get verbal agreement from all members

**3. Active Communication**
- Create WhatsApp/Telegram group for the circle
- Celebrate each payout
- Address issues promptly

**4. Financial Discipline**
- Set contributions you can afford
- Don't create too many circles
- Keep emergency fund outside ROSCA

**5. Use Platform Features**
- Enable auto-reminders
- Review analytics monthly
- Report suspicious behavior

---

<a name="p2p-borrowers"></a>
## 3. P2P Lending Borrowers

### 3.1 Understanding P2P Lending

**Traditional Loan**:
```
You → Bank → (High interest, collateral, long process)
```

**P2P Lending on AtlasX**:
```
You → Platform → Multiple Lenders → (Lower interest, no collateral*, fast)
*Some loans may require soft collateral or guarantors
```

**Benefits**:
- Interest rates: 4-25% vs. 30-400% (traditional microlenders)
- No branch visits, fully digital
- Fractional funding (multiple lenders)
- Build credit score
- Flexible terms

---

### 3.2 Checking Your Eligibility

#### Minimum Requirements

```
✓ Age: 18+ years
✓ KYC: Tier 2 or 3 verified
✓ Account Age: 30+ days (for new users)
✓ Transaction History: 5+ successful transactions
✓ No active defaults on platform
```

#### Credit Score Tiers

```
┌────────────────────────────────────────────────────────────┐
│  Tier       │ Score Range │ Max Loan  │ Interest Rate    │
├────────────────────────────────────────────────────────────┤
│  Excellent  │   750+      │  $50,000  │   4-8% APR       │
│  Good       │   700-749   │  $25,000  │   8-12% APR      │
│  Fair       │   650-699   │  $10,000  │   12-18% APR     │
│  Poor       │   < 650     │  $3,000   │   18-25% APR     │
└────────────────────────────────────────────────────────────┘
```

**Credit Score Factors**:
- Payment history (35%)
- Amount owed (30%)
- Length of credit history (15%)
- Types of credit (10%)
- Recent credit inquiries (10%)

**Check Your Score**:
```
Profile → Credit Score → View Detailed Report
- Current score
- Score breakdown
- Improvement recommendations
- Score history (chart)
```

---

### 3.3 Applying for a Loan

#### Step-by-Step Process

```
1. Navigate to Lending → Borrow → Apply for Loan

2. Loan Details:
   - Amount Needed: e.g., $5,000
   - Purpose:
     • Business Expansion
     • Working Capital
     • Equipment Purchase
     • Education
     • Medical Emergency
     • Debt Consolidation
     • Home Improvement
   - Loan Term: 3, 6, 12, 18, 24, 36 months

3. Financial Information:
   - Monthly Income: $2,500
   - Employment Status:
     • Employed (salaried)
     • Self-employed
     • Business owner
     • Freelancer
   - Employer/Business Name
   - Time in Current Job: 2 years

4. Supporting Documents:
   - Bank statements (last 3-6 months)
   - Proof of income (pay stubs, tax returns)
   - Business registration (if applicable)
   - Optional: Open Banking connection (auto-verify income)

5. Review Offer:
   - Based on credit score, system shows:
     • Maximum approved amount
     • Interest rate
     • Monthly payment
     • Total repayment amount
     • APR

6. Accept Terms:
   - Review loan agreement
   - E-sign
   - Submit

7. Listing Goes Live:
   - Your loan appears in marketplace
   - Lenders start funding
   - Funding progress shown in real-time
```

---

#### Example Loan Application

```
Applicant: John Doe
Credit Score: 720 (Good)
Amount Requested: $10,000
Purpose: Business Expansion (food truck)
Term: 24 months
Employment: Self-employed, food truck owner, 3 years
Monthly Income: $4,000

System Offer:
✓ Approved Amount: $10,000
✓ Interest Rate: 10.5% APR
✓ Monthly Payment: $465.19
✓ Total Repayment: $11,164.56
✓ Total Interest: $1,164.56

Funding Timeline: 3-7 days (average)
First Payment Due: 30 days after disbursement
```

---

### 3.4 Loan Funding Process

```
Your Listing → Marketplace → Lenders Browse → Invest

Funding Progress:
Day 1:  $2,000 funded (20%) - 5 lenders
Day 2:  $5,500 funded (55%) - 12 lenders
Day 3:  $8,000 funded (80%) - 18 lenders
Day 4:  $10,000 funded (100%) - 23 lenders ✓

Once 100% funded:
- System verifies all investments
- Loan agreement executed
- Funds disbursed to your wallet within 24 hours
- Repayment schedule begins
```

**Accelerate Funding**:
- Add video introduction
- Connect Open Banking (shows verified income)
- Offer slightly higher interest rate
- Share listing with personal network

---

### 3.5 Loan Repayment

#### Repayment Schedule

```
Access: Lending → My Loans → [Loan ID] → Repayment Schedule

Example (24-month loan, $10,000 at 10.5%):

Payment #  | Due Date   | Principal | Interest | Total    | Balance
-----------|------------|-----------|----------|----------|----------
1          | Mar 1      | $377.69   | $87.50   | $465.19  | $9,622.31
2          | Apr 1      | $381.00   | $84.19   | $465.19  | $9,241.31
3          | May 1      | $384.34   | $80.85   | $465.19  | $8,856.97
...
24         | Feb 1 2026 | $461.19   | $4.00    | $465.19  | $0.00
```

#### Auto-Pay Setup (Recommended)

```
Lending → My Loans → [Loan ID] → Set up Auto-Pay

1. Select payment source:
   - Linked bank account (free)
   - AtlasX wallet (free)
   - Debit card (1% fee)

2. Choose auto-pay date:
   - Same as due date
   - 3 days before due date (recommended)
   - 7 days before due date

3. Confirm and activate

Benefits:
- Never miss a payment
- Improves credit score
- Avoid late fees
```

#### Manual Payment

```
1. Go to My Loans → [Loan ID]
2. Click "Make Payment"
3. Select amount:
   - Minimum payment ($465.19)
   - Extra principal (pay off faster)
   - Full payoff
4. Choose payment method
5. Confirm
6. Payment processes in < 1 minute
7. Receipt sent via email/SMS
```

---

### 3.6 Early Repayment

**No Prepayment Penalty!**

```
Calculate Early Payoff:
Lending → My Loans → [Loan ID] → Payoff Quote

Example:
Current Balance: $8,856.97 (after 3 payments)
Accrued Interest: $40.25
Payoff Amount: $8,897.22

Savings:
Remaining Interest: $1,124.31
You Save: $1,084.06

Process:
1. Request payoff quote
2. Quote valid for 7 days
3. Make lump-sum payment
4. Loan marked as paid off
5. Credit score boost
```

---

### 3.7 Late Payments & Defaults

#### Late Payment

```
Grace Period: 3 days (no fee)

After 3 Days:
- Late fee: 5% of payment ($23.26 on $465.19)
- Credit score impact: -10 points
- Notification to lenders

After 15 Days:
- Account marked "late"
- Late fee increases to 10%
- Additional -20 credit score points
- Collection calls begin

After 30 Days:
- Loan marked as "defaulted"
- Severe credit score impact (-100 points)
- Legal action may commence
- Collection agency referral
```

#### Hardship Program

```
If you're struggling to pay:

1. Contact support IMMEDIATELY
2. Explain situation (job loss, medical emergency)
3. Request hardship modification:
   - Temporary payment reduction
   - Extended term
   - Interest-only payments for 3-6 months
   - Forbearance (pause payments)

Requirements:
- Must contact before missing payment
- Provide documentation
- One-time only per loan
```

---

### 3.8 Building Your Credit Score

**Tips to Improve**:

1. **Pay On Time, Every Time**
   - Set up auto-pay
   - Pay 3-5 days early
   - Impact: +5 points/month

2. **Pay More Than Minimum**
   - Even $50 extra/month helps
   - Reduces principal faster
   - Shows financial responsibility

3. **Diversify Credit**
   - Mix of ROSCA, P2P loan, card
   - Don't take multiple loans simultaneously
   - Space out applications (3+ months)

4. **Keep Old Accounts Open**
   - Length of history matters
   - Don't close paid-off loans
   - Builds trust

5. **Monitor Your Score**
   - Check monthly
   - Dispute errors immediately
   - Understand what affects it

---

<a name="p2p-lenders"></a>
## 4. P2P Lending Lenders/Investors

### 4.1 Why Lend on AtlasX?

**Returns**:
- Average: 8-15% APR
- Top tier: 4-8% (low risk, high volume)
- High yield: 18-25% (higher risk)

**Vs. Traditional Investments**:
```
┌──────────────────────────────────────────────────────┐
│  Investment     │ Avg Return │ Risk   │ Liquidity  │
├──────────────────────────────────────────────────────┤
│  Savings Account│   0.5%     │ Very Low│ High      │
│  Bonds          │   3-5%     │ Low     │ Medium    │
│  Stocks         │   8-10%    │ High    │ High      │
│  Real Estate    │   6-12%    │ Medium  │ Low       │
│  P2P Lending    │   8-15%    │ Medium  │ Medium    │
└──────────────────────────────────────────────────────┘
```

**Benefits**:
- Passive income
- Diversification
- Social impact (helping borrowers)
- Fractional investing ($25 minimum)
- Transparent returns

---

### 4.2 Getting Started as Lender

#### Eligibility

```
✓ Age: 21+ years
✓ KYC: Tier 2 or 3
✓ Minimum Investment: $25 per loan
✓ Risk Acknowledgment: Signed
```

#### Setting Up

```
1. Profile → Lender Settings → Enable Lending

2. Risk Assessment Quiz:
   - Investment experience
   - Risk tolerance
   - Financial goals
   - Time horizon
   Based on answers, system recommends strategy

3. Fund Your Lending Wallet:
   - Transfer from bank account
   - Or use existing AtlasX balance
   - Minimum to start: $500 (to diversify)

4. Choose Lending Strategy:
   - Manual (browse and select)
   - Auto-Invest (set criteria, auto-fund)
   - Managed (AI picks for you)
```

---

### 4.3 Browsing Loan Listings

```
Lending → Invest → Browse Listings

Filters:
- Interest Rate: 4-8%, 8-12%, 12-18%, 18-25%
- Credit Score: Excellent, Good, Fair, Poor
- Loan Amount: $1K-5K, $5K-10K, $10K-25K, $25K+
- Term: 3, 6, 12, 18, 24, 36 months
- Purpose: Business, Education, Medical, etc.
- Funding Progress: < 25%, 25-50%, 50-75%, 75-99%
- Verification: Open Banking verified, Employer verified

Sort by:
- Newest listings
- Highest interest rate
- Lowest interest rate
- Almost funded
- Best credit score
```

---

#### Loan Listing Details

```
Example Listing:

Borrower: Jane S. (anonymized for privacy)
Credit Score: 720 (Good) ⭐⭐⭐⭐
Amount: $15,000
Interest Rate: 11.0% APR
Term: 24 months
Purpose: Expand catering business
Monthly Payment: $696.60
Total Repayment: $16,718.40
Your Return: 11.0% APR

Borrower Profile:
- AtlasX member since: 18 months
- Previous loans: 1 (paid in full, 0 late payments)
- Transaction history: 127 successful
- Employment: Self-employed catering, 4 years
- Monthly Income: $5,200 (Open Banking verified ✓)
- Debt-to-Income: 28%

Funding Progress:
$9,450 funded (63%) by 22 lenders
Time remaining: 4 days

Documents:
- Bank statements (6 months) ✓
- Business registration ✓
- Tax returns (2 years) ✓
- Customer testimonials
- Photo of catering setup

Borrower Story:
"I started my catering business 4 years ago...
[Read more]"

Risk Factors:
- Self-employed income variability
- Moderate credit score
- First-time platform borrower for this amount

Mitigations:
- Open Banking verified income
- Strong transaction history
- Diversified customer base (shown in statements)
```

---

### 4.4 Investing in a Loan

```
1. Click on listing
2. Review all details
3. Click "Invest"
4. Enter investment amount:
   - Minimum: $25
   - Maximum: 50% of total loan (anti-concentration)
   Example: For $15,000 loan, max invest is $7,500
5. Review investment summary:
   - Amount: $500
   - Expected monthly return: $4.58
   - Expected total return: $110.00 over 24 months
   - Annualized return: 11.0%
6. Confirm
7. Funds deducted from lending wallet
8. You're now an investor in this loan!

Post-Investment:
- Email confirmation
- Added to "My Investments"
- Monthly statements sent
- Automatic monthly payments to your account
```

---

### 4.5 Diversification Strategy

**DON'T**: Invest $10,000 in one loan
**DO**: Invest $25-100 across 100-400 loans

```
Example Portfolio ($10,000 to invest):

Strategy A: Conservative
- 200 loans × $50 each
- Credit score: 700+ only
- Interest: 8-12%
- Expected annual return: 9.5%
- Default rate: 2%
- Net return: ~7.5%

Strategy B: Balanced
- 150 loans × $66 each
- Mix of credit scores (50% good, 30% fair, 20% excellent)
- Interest: 8-18%
- Expected return: 12.5%
- Default rate: 4%
- Net return: ~8.5%

Strategy C: Aggressive
- 100 loans × $100 each
- All credit tiers
- Interest: 4-25%
- Expected return: 15.8%
- Default rate: 7%
- Net return: ~8.8%

Platform Recommendation:
- Start conservative
- Reinvest returns
- Gradually increase risk tolerance
- Target: 200+ loans for best diversification
```

---

### 4.6 Auto-Invest Feature

**Set It and Forget It**

```
Lending → Invest → Auto-Invest → Create Strategy

1. Monthly Budget: $500

2. Criteria:
   Credit Score: Good or Excellent (700+)
   Interest Rate: 8-14%
   Loan Purpose: Business, Education only
   Verification: Open Banking required
   Maximum per loan: $50
   Exclude: Borrowers with prior defaults

3. Allocation:
   $500 ÷ $50 = 10 loans/month automatically

4. Review & Activate

How it works:
- System scans new listings hourly
- Matches against your criteria
- Invests automatically (up to monthly budget)
- You get email summary weekly
- Adjust criteria anytime
```

**Advanced Auto-Invest**:
```
Multiple Strategies:
Strategy 1: "Safe" - $300/month, 700+ score, 8-10%
Strategy 2: "Growth" - $150/month, 650-699 score, 12-16%
Strategy 3: "High Yield" - $50/month, all scores, 18-25%

Rebalancing:
- System suggests rebalancing quarterly
- Sell notes on secondary market (if available)
- Reallocate to maintain target ratios
```

---

### 4.7 Managing Your Investment Portfolio

```
Dashboard → My Investments

Overview:
- Total Invested: $10,500
- Number of Loans: 187
- Active Loans: 142
- Paid Off: 38
- Defaulted: 7
- Average Interest Rate: 11.8%
- Total Earned (All Time): $1,247.56
- Expected Annual Return: 9.2%

Performance:
- This Month Returns: $82.40
- YTD Returns: $847.23
- Default Rate: 3.7% (vs. 4.2% platform avg)

Portfolio Breakdown:
Excellent Credit: 42% ($4,410)
Good Credit: 38% ($3,990)
Fair Credit: 15% ($1,575)
Poor Credit: 5% ($525)

Charts:
- Monthly returns over time
- Default rate over time
- Diversification pie chart
- Risk-adjusted returns
```

---

### 4.8 Receiving Payments

**Monthly Payments**:
```
Every month, on each loan's due date:
- Borrower pays
- System calculates your share (proportional to investment)
- Payment deposited to your AtlasX wallet
- Notification sent

Example:
You invested: $500 (of $10,000 total loan)
Your share: 5%
Monthly payment from borrower: $465.19
Your monthly receipt: $23.26

Breakdown:
- Principal: $18.88
- Interest: $4.38
- Total: $23.26

Options for received money:
1. Withdraw to bank account
2. Reinvest automatically (recommended)
3. Keep in wallet for later use
```

**Tax Reporting**:
```
End of Year:
- 1099-INT form (USA) or equivalent
- Shows total interest earned
- Available in app by January 31
- Download PDF or CSV

Interest is taxable as ordinary income
Consult tax professional
```

---

### 4.9 Handling Defaults

**What Happens**:
```
1. Borrower misses payment (30+ days)
2. Loan marked "defaulted"
3. You're notified
4. Recovery process begins:
   - Internal collections (60 days)
   - External collection agency (if internal fails)
   - Legal action (for large amounts)

Your Status:
- Investment marked "defaulted"
- Write-off for tax purposes (consult CPA)
- Any recovered amount distributed proportionally

Average Recovery:
- Within 90 days: 45% recovery rate
- Within 180 days: 65% recovery rate
- Total recovery: ~25-35% of defaulted amount
```

**Loss Protection**:
```
Built-in protections:
1. Diversification (spread risk)
2. Credit scoring (filter risky borrowers)
3. Platform provision fund (covers 1-2% of defaults)

Optional Add-On:
Default Insurance
Cost: 1.5% of annual returns
Coverage: Up to 50% of principal on defaults
Worth it if: Conservative risk profile
```

---

### 4.10 Secondary Market (Coming Soon)

```
Sell your loan notes before maturity

Use Cases:
- Need liquidity
- Rebalance portfolio
- Exit underperforming loans

Pricing:
- At par: Face value
- At discount: Sell quickly (lose some return)
- At premium: For high-performing loans

Fee: 1% of sale price

Expected Launch: Q3 2024
```

---

<a name="business-users"></a>
## 5. Business Users & Merchants

### 5.1 Business Account Setup

```
1. Sign up as Business
2. KYC Business:
   - Business name
   - Registration number
   - Business address
   - Industry
   - Estimated monthly volume

3. Submit Documents:
   - Business registration certificate
   - Tax ID / EIN
   - Beneficial ownership info (25%+ owners)
   - Bank statements (3 months)
   - Proof of address

4. Verification (2-5 business days)

5. Account activated
```

#### Account Features

```
✓ Multiple users (team access)
✓ Role-based permissions
✓ API access (for integration)
✓ Bulk payments
✓ Recurring billing
✓ Invoice generation
✓ Accounting integration (QuickBooks, Xero)
✓ Multi-currency support
✓ Employee expense cards
```

---

### 5.2 Accepting Payments

#### Payment Links

```
1. Dashboard → Accept Payment → Create Payment Link

2. Enter details:
   - Amount: $50.00
   - Description: "Logo design service"
   - Reference: INV-001
   - Expiry: 7 days (optional)

3. Generate link: https://pay.atlasx.com/abc123

4. Share via:
   - Email
   - WhatsApp
   - SMS
   - QR code

5. Customer clicks, pays, done!
6. You receive notification + money in wallet
```

#### QR Code Payments

```
For in-person payments:

1. Dashboard → Accept Payment → Generate QR Code

2. Options:
   - Static QR (fixed amount, e.g., $10 coffee)
   - Dynamic QR (amount entered at payment time)

3. Print QR code
4. Display at counter
5. Customer scans with AtlasX app or camera
6. Pays instantly
7. You receive payment < 10 seconds

Popular for:
- Restaurants
- Retail stores
- Market stalls
- Food trucks
```

---

#### API Integration

```javascript
// Accept payment via API

const atlasx = require('@atlasx/node-sdk');

atlasx.configure({
  apiKey: 'atx_live_...',
  environment: 'production'
});

// Create payment
const payment = await atlasx.payments.create({
  amount: 5000, // $50.00 in cents
  currency: 'USD',
  description: 'Order #12345',
  customer: {
    email: 'customer@example.com',
    name: 'John Doe'
  },
  metadata: {
    order_id: '12345',
    product: 'Premium Plan'
  },
  return_url: 'https://mysite.com/success'
});

// Redirect customer to payment URL
res.redirect(payment.payment_url);

// Handle webhook notification
app.post('/webhooks/atlasx', (req, res) => {
  const event = req.body;

  if (event.type === 'payment.succeeded') {
    // Fulfill order
    fulfillOrder(event.data.metadata.order_id);
  }

  res.sendStatus(200);
});
```

**Documentation**: https://docs.atlasx.com/api

---

### 5.3 Payouts to Employees/Suppliers

#### Single Payout

```
1. Dashboard → Send → Business Payout

2. Recipient details:
   - Name
   - Payment method (email, phone, bank account)
   - Country

3. Amount and reason:
   - Amount: $500
   - Reference: "Salary - Jan 2024"
   - Category: Salary / Supplier Payment / Refund

4. Schedule:
   - Now (instant)
   - Scheduled (future date)
   - Recurring (monthly, weekly)

5. Confirm
6. Payment processed
```

#### Bulk Payouts

```
1. Dashboard → Send → Bulk Payout

2. Upload CSV:
   name,email,amount,currency,reference
   John Doe,john@example.com,500,USD,Salary Jan
   Jane Smith,jane@example.com,600,USD,Salary Jan
   Supplier Inc,billing@supplier.com,1200,USD,Invoice 001

3. Review:
   - 3 payments
   - Total: $2,300
   - Fees: $34.50 (1.5%)
   - Grand Total: $2,334.50

4. Schedule date (or now)

5. Confirm

6. All payments process automatically
7. Download receipt (PDF/CSV)
```

**Use Cases**:
- Monthly salary payments
- Freelancer payouts
- Supplier/vendor payments
- Commission payments
- Tax refunds

---

### 5.4 Invoicing

```
1. Dashboard → Invoices → Create Invoice

2. Customer Details:
   - Name: ACME Corp
   - Email: billing@acme.com
   - Address

3. Line Items:
   Item 1: Website Development - $5,000
   Item 2: Hosting (1 year) - $500
   Subtotal: $5,500
   Tax (10%): $550
   Total: $6,050

4. Payment Terms:
   - Due: Net 30 (30 days from issue)
   - Accepted methods: Bank transfer, AtlasX wallet
   - Late fee: 5% after 30 days

5. Send Invoice:
   - Email with payment link embedded
   - Or download PDF

6. Customer receives:
   - Professional invoice
   - "Pay Now" button (AtlasX payment link)
   - Bank details for wire transfer

7. Status tracking:
   - Sent
   - Viewed (customer opened email)
   - Paid
   - Overdue

8. Auto-reminders:
   - 7 days before due
   - On due date
   - 7 days after due (overdue)
```

---

### 5.5 Multi-Currency for International Business

```
Operating in multiple countries:

1. Create wallets:
   - USD (for USA customers)
   - EUR (for EU customers)
   - NGN (for Nigeria operations)
   - KES (for Kenya operations)

2. Receive in local currency:
   - No FX fees for customer
   - You hold in native currency

3. Convert when needed:
   - USD → NGN for local expenses
   - Mid-market rate + 0.3%

4. Pay employees locally:
   - Kenya employee: Pay in KES from KES wallet
   - Nigeria employee: Pay in NGN from NGN wallet
   - No cross-border fees

Example:
Revenue:
- USA clients: $50,000/month (USD wallet)
- UK clients: £20,000/month (GBP wallet)
- Kenya clients: 3M KES/month (KES wallet)

Expenses:
- Nigeria office: ₦5M/month (NGN wallet)
- Kenya salaries: 2M KES/month (KES wallet)

Convert only profit:
- $50K + £20K → USD for savings/investment
```

---

### 5.6 Team Management

```
Settings → Team → Add Member

Roles:
1. Owner (you)
   - Full access
   - Can delete account

2. Admin
   - All permissions except delete account
   - Add/remove team members
   - View financials

3. Finance Manager
   - Make payments
   - View transactions
   - Export reports
   - No team management

4. Accountant (View-Only)
   - View all transactions
   - Export reports
   - No payment permissions

5. Custom Role
   - Select specific permissions

Per User:
- Name, email
- Role
- Spending limit (optional)
- Notification preferences
- Assigned virtual card (optional)
```

---

<a name="partner-developers"></a>
## 6. Partner Developers & Integrators

### 6.1 Getting API Access

```
1. Register business account
2. Complete verification
3. Navigate to: Dashboard → Developers → API Keys

4. Create API Key:
   - Environment: Sandbox / Production
   - Name: "E-commerce Integration"
   - Permissions:
     ✓ users:read
     ✓ users:write
     ✓ payments:create
     ✓ payments:read
     ✓ webhooks:manage

5. API Key generated:
   atx_live_ab12cd34ef56gh78ij90kl12mn34op56qr78st90uv12wx34yz56

6. IMPORTANT: Copy and store securely (shown only once)
```

---

### 6.2 Authentication

#### API Key Authentication

```bash
curl -X GET https://api.atlasx.com/v1/users/me \
  -H "X-API-Key: atx_live_..." \
  -H "Content-Type: application/json"
```

#### OAuth 2.0 (for user-facing apps)

```
Step 1: Redirect user to AtlasX
https://auth.atlasx.com/oauth/authorize
  ?client_id=YOUR_CLIENT_ID
  &redirect_uri=https://yourapp.com/callback
  &scope=users:read wallets:read payments:create
  &state=random-string

Step 2: User authorizes

Step 3: AtlasX redirects back with code
https://yourapp.com/callback
  ?code=AUTH_CODE
  &state=random-string

Step 4: Exchange code for token
curl -X POST https://api.atlasx.com/oauth/token \
  -H "Content-Type: application/json" \
  -d '{
    "grant_type": "authorization_code",
    "code": "AUTH_CODE",
    "client_id": "YOUR_CLIENT_ID",
    "client_secret": "YOUR_CLIENT_SECRET",
    "redirect_uri": "https://yourapp.com/callback"
  }'

Response:
{
  "access_token": "atx_token_...",
  "refresh_token": "atx_refresh_...",
  "expires_in": 3600,
  "token_type": "Bearer"
}

Step 5: Use access token
curl -X GET https://api.atlasx.com/v1/users/me \
  -H "Authorization: Bearer atx_token_..." \
  -H "Content-Type: application/json"
```

---

### 6.3 Core API Endpoints

#### Create User

```bash
POST /v1/users

{
  "email": "customer@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone": "+15551234567",
  "country": "US",
  "metadata": {
    "source": "ecommerce_signup"
  }
}

Response:
{
  "user_id": "usr_abc123",
  "email": "customer@example.com",
  "kyc_status": "pending",
  "created_at": "2024-01-15T10:00:00Z"
}
```

#### Create Wallet

```bash
POST /v1/wallets

{
  "user_id": "usr_abc123",
  "currency": "USD",
  "type": "standard"
}

Response:
{
  "wallet_id": "wlt_xyz789",
  "currency": "USD",
  "balance": "0.00",
  "status": "active"
}
```

#### Create Payment

```bash
POST /v1/payments

{
  "sender_user_id": "usr_abc123",
  "receiver_user_id": "usr_def456",
  "amount": "100.00",
  "currency": "USD",
  "rail_type": "zelle",
  "sender_rail_id": "sender@bank.com",
  "receiver_rail_id": "receiver@bank.com",
  "description": "Payment for Order #12345",
  "metadata": {
    "order_id": "12345"
  }
}

Response:
{
  "payment_id": "pmt_123456",
  "status": "completed",
  "processing_time_ms": 1234,
  "created_at": "2024-01-15T10:05:00Z"
}
```

---

### 6.4 Webhooks

#### Register Webhook Endpoint

```bash
POST /v1/webhooks/endpoints

{
  "url": "https://yourapp.com/webhooks/atlasx",
  "events": [
    "payment.completed",
    "payment.failed",
    "user.kyc_approved",
    "wallet.credited"
  ],
  "description": "Production webhook endpoint"
}

Response:
{
  "endpoint_id": "whe_abc123",
  "url": "https://yourapp.com/webhooks/atlasx",
  "secret": "whsec_...",  // For signature verification
  "status": "active"
}
```

#### Verify Webhook Signature

```javascript
const crypto = require('crypto');

function verifyWebhook(payload, signature, secret) {
  const [timestampPart, signaturePart] = signature.split(',');
  const timestamp = timestampPart.split('=')[1];
  const receivedSignature = signaturePart.split('=')[1];

  // Reconstruct signed payload
  const signedPayload = `${timestamp}.${JSON.stringify(payload)}`;

  // Calculate expected signature
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload)
    .digest('hex');

  return receivedSignature === expectedSignature;
}

// Express.js example
app.post('/webhooks/atlasx', (req, res) => {
  const signature = req.headers['x-atlasx-signature'];
  const payload = req.body;

  if (!verifyWebhook(payload, signature, WEBHOOK_SECRET)) {
    return res.status(401).send('Invalid signature');
  }

  // Process event
  switch (payload.event) {
    case 'payment.completed':
      handlePaymentCompleted(payload.data);
      break;
    case 'payment.failed':
      handlePaymentFailed(payload.data);
      break;
    // ... other events
  }

  res.sendStatus(200);
});
```

---

### 6.5 SDKs

#### Node.js

```bash
npm install @atlasx/node-sdk
```

```javascript
const AtlasX = require('@atlasx/node-sdk');

const client = new AtlasX({
  apiKey: 'atx_live_...',
  environment: 'production' // or 'sandbox'
});

// Create payment
const payment = await client.payments.create({
  senderUserId: 'usr_abc123',
  receiverUserId: 'usr_def456',
  amount: '100.00',
  currency: 'USD',
  railType: 'zelle'
});

console.log(payment.paymentId);
```

#### Python

```bash
pip install atlasx
```

```python
import atlasx

client = atlasx.Client(api_key='atx_live_...')

# Create payment
payment = client.payments.create(
    sender_user_id='usr_abc123',
    receiver_user_id='usr_def456',
    amount='100.00',
    currency='USD',
    rail_type='zelle'
)

print(payment.payment_id)
```

#### PHP

```bash
composer require atlasx/atlasx-php
```

```php
<?php
require_once('vendor/autoload.php');

$client = new \AtlasX\Client('atx_live_...');

$payment = $client->payments->create([
    'sender_user_id' => 'usr_abc123',
    'receiver_user_id' => 'usr_def456',
    'amount' => '100.00',
    'currency' => 'USD',
    'rail_type' => 'zelle'
]);

echo $payment->payment_id;
?>
```

---

### 6.6 Rate Limits

```
┌──────────────────────────────────────────────────────┐
│  Tier        │ Requests/Min │ Requests/Day │ Cost   │
├──────────────────────────────────────────────────────┤
│  Free        │     60       │    10,000    │  $0    │
│  Standard    │    300       │   100,000    │  $99/mo│
│  Professional│   1,000      │   500,000    │  $299/mo│
│  Enterprise  │  Custom      │   Custom     │ Custom │
└──────────────────────────────────────────────────────┘

Rate Limit Headers (included in every response):
X-RateLimit-Limit: 60
X-RateLimit-Remaining: 42
X-RateLimit-Reset: 1642348800

When limit exceeded:
HTTP 429 Too Many Requests
{
  "error": "rate_limit_exceeded",
  "message": "Rate limit of 60 requests per minute exceeded",
  "retry_after": 45  // seconds
}
```

---

### 6.7 Error Handling

```javascript
try {
  const payment = await client.payments.create({...});
} catch (error) {
  if (error instanceof AtlasX.errors.ValidationError) {
    // 400 - Invalid parameters
    console.error('Validation failed:', error.message);
    console.error('Invalid fields:', error.fields);

  } else if (error instanceof AtlasX.errors.AuthenticationError) {
    // 401 - Invalid API key
    console.error('Auth failed:', error.message);

  } else if (error instanceof AtlasX.errors.PermissionError) {
    // 403 - Insufficient permissions
    console.error('Permission denied:', error.message);

  } else if (error instanceof AtlasX.errors.NotFoundError) {
    // 404 - Resource not found
    console.error('Not found:', error.message);

  } else if (error instanceof AtlasX.errors.RateLimitError) {
    // 429 - Rate limit exceeded
    console.error('Rate limited. Retry after:', error.retryAfter);

  } else if (error instanceof AtlasX.errors.APIError) {
    // 500 - Server error
    console.error('API error:', error.message);
  }
}
```

---

### 6.8 Testing (Sandbox Mode)

```
Sandbox Environment:
Base URL: https://sandbox-api.atlasx.com

Differences:
- No real money
- Instant settlements (no delays)
- Test payment rails
- No actual KYC verification

Test API Key: atx_test_...

Test Users:
usr_test_approved - Pre-approved KYC
usr_test_pending - Pending KYC
usr_test_rejected - Rejected KYC

Test Cards:
4242 4242 4242 4242 - Success
4000 0000 0000 0002 - Declined
4000 0000 0000 0341 - Requires 3DS

Simulating Payment Rails:
- Payments complete instantly
- Can simulate failures by amount:
  - $100.13 → failure (insufficient funds)
  - $100.14 → failure (invalid account)
  - $100.15 → timeout

Webhooks in Sandbox:
- All webhooks fire immediately
- Test webhook delivery in dashboard
```

---

<a name="customer-support"></a>
## 9. Customer Support Agents

### 9.1 Support Dashboard Overview

```
Login: https://support.atlasx.com

Dashboard shows:
- Open tickets: 47
- Avg response time: 8 minutes
- Avg resolution time: 2.4 hours
- CSAT score: 4.7/5
- My tickets today: 12
```

---

### 9.2 Common Issues & Resolutions

#### Issue: "Payment Stuck/Pending"

```
Troubleshooting Steps:

1. Check payment status in admin panel:
   - Status: pending/processing/completed/failed
   - Processing time: < 5 min = normal

2. If > 5 min:
   - Check payment rail status (Dashboard → Rails → Health)
   - If rail down: Inform customer, ETA for resolution

3. If rail operational:
   - Check transaction logs
   - Look for error codes

4. Common causes:
   - Insufficient balance (sender)
   - Invalid recipient details
   - Network timeout (retry automatic)
   - Compliance hold (escalate to compliance team)

5. Resolution:
   - If < 10 min: Ask customer to wait
   - If > 10 min: Escalate to Tier 2
   - If compliance hold: Transfer to compliance team
```

#### Issue: "Account Locked"

```
Reasons:
1. Too many failed login attempts (automatic unlock in 30 min)
2. Suspicious activity detected (manual review required)
3. Compliance flag (escalate to compliance)
4. User requested (provide identity verification)

Steps:
1. Verify user identity:
   - Ask security questions
   - Email verification code
   - Or send SMS code

2. Check lock reason in system

3. If login attempts:
   - Unlock account manually
   - Advise user to reset password

4. If suspicious activity:
   - Review recent transactions
   - Ask user to confirm legitimate
   - Unlock if confirmed

5. If compliance:
   - Do NOT unlock
   - Escalate to compliance team
   - Inform user (generic message - no details)
```

#### Issue: "Money Not Received"

```
Checklist:
1. Confirm sender actually sent (get transaction ID)
2. Check transaction status with ID
3. Verify recipient details match
4. Check if KYC required but not completed
5. Check for compliance hold

Resolution:
- If completed: Money in recipient's wallet (check balance)
- If pending: Normal processing (ETA 1-60 min depending on rail)
- If failed: Refund sender, advise correct details
- If hold: Escalate to compliance
```

---

### 9.3 Customer Verification

Before assisting with sensitive info:

```
Verification Questions:
1. Full name on account
2. Email address on account
3. Last 4 digits of registered phone
4. Recent transaction amount + recipient
5. Security question answer (if set)

OR

Send verification code:
- To registered email
- To registered phone (SMS)
- User provides 6-digit code

Document verification in ticket:
"User verified via email code sent to j***@gmail.com"
```

---

### 9.4 Escalation Matrix

```
┌───────────────────────────────────────────────────────┐
│  Issue Type          │ Escalate To      │ SLA        │
├───────────────────────────────────────────────────────┤
│  Payment > 1 hour    │ Tier 2 Support   │ 30 min     │
│  Account security    │ Security Team    │ Immediate  │
│  Compliance flag     │ Compliance Team  │ Immediate  │
│  Technical bug       │ Engineering      │ 4 hours    │
│  Refund > $1000      │ Finance Manager  │ 1 hour     │
│  Partnership inquiry │ Business Dev     │ 24 hours   │
│  Legal threat        │ Legal Team       │ Immediate  │
└───────────────────────────────────────────────────────┘
```

---

This manual is comprehensive and includes detailed step-by-step instructions for all user categories. Each section includes practical examples, best practices, and troubleshooting guides.

**Last Updated**: January 2024
**Version**: 2.0
