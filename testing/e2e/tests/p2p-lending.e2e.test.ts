import { TestClient, generateTestEmail, sleep } from './helpers/test-setup';
import Decimal from 'decimal.js';

describe('P2P Lending E2E Tests', () => {
  let client: TestClient;
  let borrowerToken: string;
  let lender1Token: string;
  let lender2Token: string;
  let borrowerUserId: string;
  let lender1UserId: string;
  let lender2UserId: string;

  beforeAll(async () => {
    client = new TestClient();

    // Create test users: 1 borrower and 2 lenders
    const borrowerEmail = generateTestEmail('borrower');
    const lender1Email = generateTestEmail('lender1');
    const lender2Email = generateTestEmail('lender2');

    // Register and authenticate borrower
    const borrowerRegister = await client.post('/auth/register', {
      email: borrowerEmail,
      password: 'Test123!@#',
      firstName: 'John',
      lastName: 'Borrower',
    });
    expect(borrowerRegister.status).toBe(201);
    borrowerUserId = borrowerRegister.data.userId;
    borrowerToken = borrowerRegister.data.accessToken;

    // Register and authenticate lender 1
    const lender1Register = await client.post('/auth/register', {
      email: lender1Email,
      password: 'Test123!@#',
      firstName: 'Jane',
      lastName: 'Lender1',
    });
    expect(lender1Register.status).toBe(201);
    lender1UserId = lender1Register.data.userId;
    lender1Token = lender1Register.data.accessToken;

    // Register and authenticate lender 2
    const lender2Register = await client.post('/auth/register', {
      email: lender2Email,
      password: 'Test123!@#',
      firstName: 'Bob',
      lastName: 'Lender2',
    });
    expect(lender2Register.status).toBe(201);
    lender2UserId = lender2Register.data.userId;
    lender2Token = lender2Register.data.accessToken;

    // Complete KYC for all users (simulated)
    client.setAuthToken(borrowerToken);
    await client.post('/kyc/verify', {
      userId: borrowerUserId,
      documentType: 'passport',
      documentNumber: 'P123456789',
      firstName: 'John',
      lastName: 'Borrower',
    });

    client.setAuthToken(lender1Token);
    await client.post('/kyc/verify', {
      userId: lender1UserId,
      documentType: 'passport',
      documentNumber: 'P987654321',
      firstName: 'Jane',
      lastName: 'Lender1',
    });

    client.setAuthToken(lender2Token);
    await client.post('/kyc/verify', {
      userId: lender2UserId,
      documentType: 'passport',
      documentNumber: 'P555555555',
      firstName: 'Bob',
      lastName: 'Lender2',
    });
  });

  describe('Loan Listing Creation', () => {
    let loanListingId: string;

    it('should create a loan listing with valid data', async () => {
      client.setAuthToken(borrowerToken);

      const response = await client.post('/p2p-lending/listings', {
        borrowerId: borrowerUserId,
        amount: '10000.00',
        currency: 'USD',
        interestRate: 12.5,
        term: 24,
        purpose: 'Business expansion',
        creditScore: 720,
        employmentStatus: 'employed',
        annualIncome: '75000.00',
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('loanListingId');
      expect(response.data.amount).toBe('10000.00');
      expect(response.data.interestRate).toBe(12.5);
      expect(response.data.term).toBe(24);
      expect(response.data.status).toBe('open');
      expect(response.data.riskTier).toBe('good'); // 720 credit score = good tier
      expect(response.data.fundedAmount).toBe('0');

      loanListingId = response.data.loanListingId;
    });

    it('should reject loan listing with interest rate above tier maximum', async () => {
      client.setAuthToken(borrowerToken);

      const response = await client.post('/p2p-lending/listings', {
        borrowerId: borrowerUserId,
        amount: '5000.00',
        currency: 'USD',
        interestRate: 15.0, // Exceeds 12% max for good tier (720 credit)
        term: 12,
        purpose: 'Debt consolidation',
        creditScore: 720,
      });

      expect(response.status).toBe(400);
      expect(response.data.message).toContain('exceeds maximum allowed');
    });

    it('should reject loan listing from non-KYC verified user', async () => {
      // Create a new user without KYC
      const unverifiedEmail = generateTestEmail('unverified');
      const unverifiedRegister = await client.post('/auth/register', {
        email: unverifiedEmail,
        password: 'Test123!@#',
        firstName: 'Unverified',
        lastName: 'User',
      });

      client.setAuthToken(unverifiedRegister.data.accessToken);

      const response = await client.post('/p2p-lending/listings', {
        borrowerId: unverifiedRegister.data.userId,
        amount: '3000.00',
        currency: 'USD',
        interestRate: 10.0,
        term: 12,
        purpose: 'Personal loan',
      });

      expect(response.status).toBe(400);
      expect(response.data.message).toContain('KYC verification');
    });

    it('should calculate monthly payment correctly', async () => {
      client.setAuthToken(borrowerToken);

      const principal = new Decimal('10000.00');
      const annualRate = 12.0;
      const term = 24;

      const response = await client.post('/p2p-lending/listings', {
        borrowerId: borrowerUserId,
        amount: principal.toString(),
        currency: 'USD',
        interestRate: annualRate,
        term,
        purpose: 'Home improvement',
        creditScore: 700,
      });

      expect(response.status).toBe(201);

      // Calculate expected monthly payment
      const monthlyRate = new Decimal(annualRate).dividedBy(100).dividedBy(12);
      const numerator = principal.times(monthlyRate).times(
        monthlyRate.plus(1).pow(term),
      );
      const denominator = monthlyRate.plus(1).pow(term).minus(1);
      const expectedPayment = numerator.dividedBy(denominator);

      const actualPayment = new Decimal(response.data.monthlyPayment);

      // Allow for small rounding differences
      expect(actualPayment.minus(expectedPayment).abs().lessThan(0.01)).toBe(true);
    });
  });

  describe('Loan Investment Flow', () => {
    let loanListingId: string;

    beforeEach(async () => {
      // Create a loan listing for investment tests
      client.setAuthToken(borrowerToken);

      const response = await client.post('/p2p-lending/listings', {
        borrowerId: borrowerUserId,
        amount: '5000.00',
        currency: 'USD',
        interestRate: 10.0,
        term: 12,
        purpose: 'Working capital',
        creditScore: 750,
      });

      loanListingId = response.data.loanListingId;
    });

    it('should allow lender to invest in a loan', async () => {
      client.setAuthToken(lender1Token);

      const response = await client.post('/p2p-lending/investments', {
        lenderId: lender1UserId,
        loanListingId,
        amount: '2000.00',
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('investmentId');
      expect(response.data.loanListingId).toBe(loanListingId);
      expect(response.data.lenderId).toBe(lender1UserId);
      expect(response.data.amount).toBe('2000.00');
      expect(response.data.interestRate).toBe(10.0); // Locked-in rate
      expect(response.data.status).toBe('active');
    });

    it('should update loan listing funded amount after investment', async () => {
      client.setAuthToken(lender1Token);

      await client.post('/p2p-lending/investments', {
        lenderId: lender1UserId,
        loanListingId,
        amount: '2000.00',
      });

      // Check listing status
      const listingResponse = await client.get(`/p2p-lending/listings/${loanListingId}`);

      expect(listingResponse.status).toBe(200);
      expect(listingResponse.data.fundedAmount).toBe('2000.00');
      expect(listingResponse.data.status).toBe('open'); // Still open, not fully funded
    });

    it('should support fractional lending from multiple lenders', async () => {
      // Lender 1 invests $2,000
      client.setAuthToken(lender1Token);
      const investment1 = await client.post('/p2p-lending/investments', {
        lenderId: lender1UserId,
        loanListingId,
        amount: '2000.00',
      });
      expect(investment1.status).toBe(201);

      // Lender 2 invests $3,000
      client.setAuthToken(lender2Token);
      const investment2 = await client.post('/p2p-lending/investments', {
        lenderId: lender2UserId,
        loanListingId,
        amount: '3000.00',
      });
      expect(investment2.status).toBe(201);

      // Verify listing is now fully funded
      const listingResponse = await client.get(`/p2p-lending/listings/${loanListingId}`);

      expect(listingResponse.status).toBe(200);
      expect(listingResponse.data.fundedAmount).toBe('5000.00');
      expect(listingResponse.data.status).toBe('funded');
      expect(listingResponse.data.fundedAt).toBeTruthy();
    });

    it('should prevent overfunding a loan', async () => {
      // Lender 1 invests $4,000
      client.setAuthToken(lender1Token);
      await client.post('/p2p-lending/investments', {
        lenderId: lender1UserId,
        loanListingId,
        amount: '4000.00',
      });

      // Lender 2 tries to invest $2,000 (would exceed $5,000 total)
      client.setAuthToken(lender2Token);
      const response = await client.post('/p2p-lending/investments', {
        lenderId: lender2UserId,
        loanListingId,
        amount: '2000.00',
      });

      expect(response.status).toBe(400);
      expect(response.data.message).toContain('exceeds remaining');
    });

    it('should prevent investment in non-open listings', async () => {
      // Fully fund the loan
      client.setAuthToken(lender1Token);
      await client.post('/p2p-lending/investments', {
        lenderId: lender1UserId,
        loanListingId,
        amount: '5000.00',
      });

      // Wait for status to update
      await sleep(1000);

      // Try to invest again after it's funded
      client.setAuthToken(lender2Token);
      const response = await client.post('/p2p-lending/investments', {
        lenderId: lender2UserId,
        loanListingId,
        amount: '100.00',
      });

      expect(response.status).toBe(400);
      expect(response.data.message).toContain('no longer open for funding');
    });

    it('should automatically disburse loan when fully funded', async () => {
      client.setAuthToken(lender1Token);
      await client.post('/p2p-lending/investments', {
        lenderId: lender1UserId,
        loanListingId,
        amount: '5000.00',
      });

      // Wait for disbursement
      await sleep(2000);

      const listingResponse = await client.get(`/p2p-lending/listings/${loanListingId}`);

      expect(listingResponse.status).toBe(200);
      expect(listingResponse.data.status).toBe('active'); // Active after disbursement
      expect(listingResponse.data.disbursedAt).toBeTruthy();
      expect(listingResponse.data.firstPaymentDue).toBeTruthy();

      // Verify first payment is ~30 days in future
      const firstPaymentDue = new Date(listingResponse.data.firstPaymentDue);
      const now = new Date();
      const daysDiff = Math.floor(
        (firstPaymentDue.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      );
      expect(daysDiff).toBeGreaterThanOrEqual(29);
      expect(daysDiff).toBeLessThanOrEqual(31);
    });
  });

  describe('Loan Repayment and Distribution', () => {
    let loanListingId: string;
    let investment1Id: string;
    let investment2Id: string;

    beforeEach(async () => {
      // Create and fully fund a loan
      client.setAuthToken(borrowerToken);
      const listing = await client.post('/p2p-lending/listings', {
        borrowerId: borrowerUserId,
        amount: '6000.00',
        currency: 'USD',
        interestRate: 10.0,
        term: 12,
        purpose: 'Equipment purchase',
        creditScore: 750,
      });
      loanListingId = listing.data.loanListingId;

      // Lender 1 invests $4,000 (66.67%)
      client.setAuthToken(lender1Token);
      const inv1 = await client.post('/p2p-lending/investments', {
        lenderId: lender1UserId,
        loanListingId,
        amount: '4000.00',
      });
      investment1Id = inv1.data.investmentId;

      // Lender 2 invests $2,000 (33.33%)
      client.setAuthToken(lender2Token);
      const inv2 = await client.post('/p2p-lending/investments', {
        lenderId: lender2UserId,
        loanListingId,
        amount: '2000.00',
      });
      investment2Id = inv2.data.investmentId;

      // Wait for disbursement
      await sleep(2000);
    });

    it('should process monthly repayment', async () => {
      client.setAuthToken(borrowerToken);

      const response = await client.post('/p2p-lending/repayments', {
        loanListingId,
        amount: '600.00', // Monthly payment
        paymentMethod: 'bank_transfer',
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('repaymentId');
      expect(response.data.loanListingId).toBe(loanListingId);
      expect(response.data.amount).toBe('600.00');
      expect(response.data.status).toBe('completed');
    });

    it('should distribute repayment proportionally to lenders', async () => {
      client.setAuthToken(borrowerToken);

      // Make a repayment
      await client.post('/p2p-lending/repayments', {
        loanListingId,
        amount: '600.00',
        paymentMethod: 'bank_transfer',
      });

      // Wait for distribution
      await sleep(2000);

      // Check lender 1 received 66.67% ($400)
      client.setAuthToken(lender1Token);
      const lender1Investments = await client.get(
        `/p2p-lending/investments?lenderId=${lender1UserId}`,
      );
      const lender1Investment = lender1Investments.data.find(
        (inv: any) => inv.investmentId === investment1Id,
      );

      const expectedLender1Share = new Decimal('600.00')
        .times('4000.00')
        .dividedBy('6000.00');
      expect(
        new Decimal(lender1Investment.totalReturns || '0')
          .minus(expectedLender1Share)
          .abs()
          .lessThan(0.01),
      ).toBe(true);

      // Check lender 2 received 33.33% ($200)
      client.setAuthToken(lender2Token);
      const lender2Investments = await client.get(
        `/p2p-lending/investments?lenderId=${lender2UserId}`,
      );
      const lender2Investment = lender2Investments.data.find(
        (inv: any) => inv.investmentId === investment2Id,
      );

      const expectedLender2Share = new Decimal('600.00')
        .times('2000.00')
        .dividedBy('6000.00');
      expect(
        new Decimal(lender2Investment.totalReturns || '0')
          .minus(expectedLender2Share)
          .abs()
          .lessThan(0.01),
      ).toBe(true);
    });

    it('should update outstanding balance after repayment', async () => {
      client.setAuthToken(borrowerToken);

      // Make a repayment
      await client.post('/p2p-lending/repayments', {
        loanListingId,
        amount: '600.00',
        paymentMethod: 'bank_transfer',
      });

      // Check updated balance
      const listingResponse = await client.get(`/p2p-lending/listings/${loanListingId}`);

      const expectedBalance = new Decimal('6000.00').minus('600.00');
      const actualBalance = new Decimal(listingResponse.data.outstandingBalance);

      expect(actualBalance.equals(expectedBalance)).toBe(true);
      expect(listingResponse.data.status).toBe('active'); // Still active, not fully repaid
    });

    it('should mark loan as repaid when fully paid', async () => {
      client.setAuthToken(borrowerToken);

      const listing = await client.get(`/home/user/Global-FinTech/testing/e2e/tests/p2p-lending.e2e.test.ts/${loanListingId}`);
      const totalRepayment = new Decimal(listing.data.monthlyPayment).times(12);

      // Make full repayment
      await client.post('/p2p-lending/repayments', {
        loanListingId,
        amount: totalRepayment.toString(),
        paymentMethod: 'bank_transfer',
      });

      await sleep(1000);

      // Check loan status
      const listingResponse = await client.get(`/p2p-lending/listings/${loanListingId}`);

      expect(listingResponse.data.status).toBe('repaid');
      expect(listingResponse.data.repaidAt).toBeTruthy();
      expect(new Decimal(listingResponse.data.outstandingBalance).lessThanOrEqualTo(0)).toBe(
        true,
      );
    });
  });

  describe('Marketplace and Portfolio Management', () => {
    beforeAll(async () => {
      // Create multiple loan listings with different risk tiers
      client.setAuthToken(borrowerToken);

      // Excellent tier
      await client.post('/p2p-lending/listings', {
        borrowerId: borrowerUserId,
        amount: '10000.00',
        currency: 'USD',
        interestRate: 7.0,
        term: 24,
        purpose: 'Business expansion',
        creditScore: 780,
      });

      // Good tier
      await client.post('/p2p-lending/listings', {
        borrowerId: borrowerUserId,
        amount: '5000.00',
        currency: 'USD',
        interestRate: 11.0,
        term: 12,
        purpose: 'Working capital',
        creditScore: 720,
      });

      // Fair tier
      await client.post('/p2p-lending/listings', {
        borrowerId: borrowerUserId,
        amount: '3000.00',
        currency: 'USD',
        interestRate: 16.0,
        term: 12,
        purpose: 'Inventory',
        creditScore: 670,
      });
    });

    it('should retrieve all available listings', async () => {
      client.setAuthToken(lender1Token);

      const response = await client.get('/p2p-lending/listings');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThanOrEqual(3);

      // All should be open status
      response.data.forEach((listing: any) => {
        expect(listing.status).toBe('open');
      });
    });

    it('should filter listings by risk tier', async () => {
      client.setAuthToken(lender1Token);

      const response = await client.get('/p2p-lending/listings?riskTier=excellent');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);

      response.data.forEach((listing: any) => {
        expect(listing.riskTier).toBe('excellent');
      });
    });

    it('should retrieve borrower loan history', async () => {
      client.setAuthToken(borrowerToken);

      const response = await client.get(`/p2p-lending/borrower/${borrowerUserId}/loans`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThanOrEqual(3);

      response.data.forEach((listing: any) => {
        expect(listing.borrowerId).toBe(borrowerUserId);
      });
    });

    it('should retrieve lender investment portfolio', async () => {
      // Make some investments first
      const listings = await client.get('/p2p-lending/listings');
      const firstListing = listings.data[0];

      client.setAuthToken(lender1Token);
      await client.post('/p2p-lending/investments', {
        lenderId: lender1UserId,
        loanListingId: firstListing.loanListingId,
        amount: '1000.00',
      });

      // Get portfolio
      const response = await client.get(`/p2p-lending/lender/${lender1UserId}/investments`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThanOrEqual(1);

      response.data.forEach((investment: any) => {
        expect(investment.lenderId).toBe(lender1UserId);
        expect(investment.status).toBe('active');
      });
    });
  });
});
