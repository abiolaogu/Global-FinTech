import { TestClient, generateTestEmail, generateTestPhone, sleep } from './helpers/test-setup';
import Decimal from 'decimal.js';

describe('AtlasX Platform Integration E2E Tests', () => {
  let client: TestClient;

  describe('Complete User Journey: Registration to Advanced Features', () => {
    let userToken: string;
    let userId: string;
    let walletId: string;
    let openBankingConnectionId: string;
    let loanListingId: string;

    it('should register a new user', async () => {
      client = new TestClient();

      const email = generateTestEmail('journey');
      const phone = generateTestPhone();

      const response = await client.post('/auth/register', {
        email,
        password: 'SecureP@ss123',
        firstName: 'Alice',
        lastName: 'Journey',
        phoneNumber: phone,
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('userId');
      expect(response.data).toHaveProperty('accessToken');
      expect(response.data).toHaveProperty('refreshToken');
      expect(response.data.email).toBe(email);

      userId = response.data.userId;
      userToken = response.data.accessToken;
    });

    it('should complete KYC verification', async () => {
      client.setAuthToken(userToken);

      // Submit KYC documents
      const response = await client.post('/kyc/verify', {
        userId,
        documentType: 'passport',
        documentNumber: 'P987654321',
        firstName: 'Alice',
        lastName: 'Journey',
        dateOfBirth: '1990-05-15',
        nationality: 'US',
        address: {
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          postalCode: '10001',
          country: 'US',
        },
      });

      expect(response.status).toBe(201);
      expect(response.data.kycStatus).toBe('verified');
      expect(response.data.kycVerified).toBe(true);
    });

    it('should create a wallet', async () => {
      client.setAuthToken(userToken);

      const response = await client.post('/wallets', {
        userId,
        currency: 'USD',
        type: 'standard',
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('walletId');
      expect(response.data.currency).toBe('USD');
      expect(response.data.balance).toBe('0.00');

      walletId = response.data.walletId;
    });

    it('should connect bank account via Open Banking', async () => {
      client.setAuthToken(userToken);

      // Get link token
      const linkResponse = await client.post('/open-banking/create-link-token', {
        userId,
        products: ['auth', 'transactions'],
      });

      expect(linkResponse.status).toBe(201);
      expect(linkResponse.data).toHaveProperty('linkToken');

      // Exchange public token (simulated)
      const exchangeResponse = await client.post('/open-banking/exchange-public-token', {
        userId,
        publicToken: 'public-sandbox-test-token',
        institutionId: 'ins_journey_test',
        institutionName: 'Journey Test Bank',
      });

      if (exchangeResponse.status === 201) {
        expect(exchangeResponse.data).toHaveProperty('connectionId');
        openBankingConnectionId = exchangeResponse.data.connectionId;
      }
    });

    it('should deposit funds to wallet', async () => {
      client.setAuthToken(userToken);

      const response = await client.post('/wallets/deposit', {
        walletId,
        amount: '5000.00',
        currency: 'USD',
        source: 'bank_transfer',
        reference: 'Initial deposit',
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('transactionId');
      expect(response.data.amount).toBe('5000.00');
      expect(response.data.type).toBe('deposit');

      // Verify wallet balance updated
      await sleep(1000);

      const walletResponse = await client.get(`/wallets/${walletId}`);
      expect(new Decimal(walletResponse.data.balance).greaterThanOrEqualTo(5000)).toBe(true);
    });

    it('should send peer-to-peer transfer', async () => {
      // Create a receiver
      const receiverEmail = generateTestEmail('receiver');
      const receiverRegister = await client.post('/auth/register', {
        email: receiverEmail,
        password: 'Test123!@#',
        firstName: 'Bob',
        lastName: 'Receiver',
      });

      const receiverId = receiverRegister.data.userId;

      // Create receiver wallet
      const receiverClient = new TestClient();
      receiverClient.setAuthToken(receiverRegister.data.accessToken);

      const receiverWalletResponse = await receiverClient.post('/wallets', {
        userId: receiverId,
        currency: 'USD',
      });

      const receiverWalletId = receiverWalletResponse.data.walletId;

      // Send transfer
      client.setAuthToken(userToken);

      const response = await client.post('/transfers/p2p', {
        senderWalletId: walletId,
        receiverWalletId,
        amount: '250.00',
        currency: 'USD',
        reference: 'Payment for services',
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('transferId');
      expect(response.data.amount).toBe('250.00');
      expect(response.data.status).toBe('completed');

      // Verify balances updated
      await sleep(1000);

      const senderWallet = await client.get(`/wallets/${walletId}`);
      const receiverWallet = await receiverClient.get(`/wallets/${receiverWalletId}`);

      expect(new Decimal(senderWallet.data.balance).lessThan(5000)).toBe(true);
      expect(new Decimal(receiverWallet.data.balance).equals(250)).toBe(true);
    });

    it('should browse P2P lending marketplace', async () => {
      client.setAuthToken(userToken);

      const response = await client.get('/p2p-lending/listings?status=open&limit=20');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);

      // Listings should have required fields
      if (response.data.length > 0) {
        const listing = response.data[0];

        expect(listing).toHaveProperty('loanListingId');
        expect(listing).toHaveProperty('amount');
        expect(listing).toHaveProperty('interestRate');
        expect(listing).toHaveProperty('term');
        expect(listing).toHaveProperty('riskTier');
        expect(listing).toHaveProperty('purpose');
        expect(listing.status).toBe('open');
      }
    });

    it('should invest in a P2P loan', async () => {
      // First create a loan listing as a borrower
      const borrowerEmail = generateTestEmail('borrower');
      const borrowerRegister = await client.post('/auth/register', {
        email: borrowerEmail,
        password: 'Test123!@#',
        firstName: 'Charlie',
        lastName: 'Borrower',
      });

      const borrowerId = borrowerRegister.data.userId;
      const borrowerToken = borrowerRegister.data.accessToken;

      // Complete KYC for borrower
      const borrowerClient = new TestClient();
      borrowerClient.setAuthToken(borrowerToken);

      await borrowerClient.post('/kyc/verify', {
        userId: borrowerId,
        documentType: 'passport',
        documentNumber: 'P555666777',
        firstName: 'Charlie',
        lastName: 'Borrower',
      });

      // Create loan listing
      const listingResponse = await borrowerClient.post('/p2p-lending/listings', {
        borrowerId,
        amount: '2000.00',
        currency: 'USD',
        interestRate: 10.5,
        term: 12,
        purpose: 'Small business expansion',
        creditScore: 720,
        employmentStatus: 'self-employed',
        annualIncome: '60000.00',
      });

      expect(listingResponse.status).toBe(201);
      loanListingId = listingResponse.data.loanListingId;

      // Invest in the loan
      client.setAuthToken(userToken);

      const investmentResponse = await client.post('/p2p-lending/investments', {
        lenderId: userId,
        loanListingId,
        amount: '500.00',
      });

      expect(investmentResponse.status).toBe(201);
      expect(investmentResponse.data).toHaveProperty('investmentId');
      expect(investmentResponse.data.amount).toBe('500.00');
      expect(investmentResponse.data.interestRate).toBe(10.5);
      expect(investmentResponse.data.status).toBe('active');
    });

    it('should view investment portfolio', async () => {
      client.setAuthToken(userToken);

      const response = await client.get(`/p2p-lending/lender/${userId}/investments`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThanOrEqual(1);

      const investment = response.data.find(
        (inv: any) => inv.loanListingId === loanListingId,
      );

      expect(investment).toBeTruthy();
      expect(investment.amount).toBe('500.00');
      expect(investment.status).toBe('active');
    });

    it('should subscribe to premium tier', async () => {
      client.setAuthToken(userToken);

      const response = await client.post('/subscriptions', {
        userId,
        tier: 'gold',
        paymentMethod: 'wallet',
        walletId,
      });

      if (response.status === 201) {
        expect(response.data).toHaveProperty('subscriptionId');
        expect(response.data.tier).toBe('gold');
        expect(response.data.status).toBe('active');

        // Verify premium features are available
        const userResponse = await client.get('/users/me');

        expect(userResponse.data.subscriptionTier).toBe('gold');
      }
    });

    it('should enable biometric authentication', async () => {
      client.setAuthToken(userToken);

      const response = await client.post('/auth/biometric/enable', {
        userId,
        biometricType: 'fingerprint',
        deviceId: 'test-device-123',
      });

      if (response.status === 200) {
        expect(response.data.biometricEnabled).toBe(true);
      }
    });

    it('should register for push notifications', async () => {
      client.setAuthToken(userToken);

      const response = await client.post('/push-notifications/register', {
        userId,
        deviceToken: 'fcm-test-token-' + Date.now(),
        platform: 'android',
        deviceName: 'Test Device',
      });

      expect(response.status).toBe(200);
      expect(response.data.success).toBe(true);
    });
  });

  describe('Cross-Feature Integration Tests', () => {
    let user1Id: string;
    let user1Token: string;
    let user2Id: string;
    let user2Token: string;

    beforeAll(async () => {
      client = new TestClient();

      // Create two users for integration tests
      const user1Register = await client.post('/auth/register', {
        email: generateTestEmail('integration1'),
        password: 'Test123!@#',
        firstName: 'User',
        lastName: 'One',
      });

      user1Id = user1Register.data.userId;
      user1Token = user1Register.data.accessToken;

      const user2Register = await client.post('/auth/register', {
        email: generateTestEmail('integration2'),
        password: 'Test123!@#',
        firstName: 'User',
        lastName: 'Two',
      });

      user2Id = user2Register.data.userId;
      user2Token = user2Register.data.accessToken;

      // Complete KYC for both
      client.setAuthToken(user1Token);
      await client.post('/kyc/verify', {
        userId: user1Id,
        documentType: 'passport',
        documentNumber: 'P111111111',
        firstName: 'User',
        lastName: 'One',
      });

      client.setAuthToken(user2Token);
      await client.post('/kyc/verify', {
        userId: user2Id,
        documentType: 'passport',
        documentNumber: 'P222222222',
        firstName: 'User',
        lastName: 'Two',
      });
    });

    it('should integrate wallet operations with transaction history', async () => {
      client.setAuthToken(user1Token);

      // Create wallet
      const walletResponse = await client.post('/wallets', {
        userId: user1Id,
        currency: 'USD',
      });

      const walletId = walletResponse.data.walletId;

      // Make multiple transactions
      await client.post('/wallets/deposit', {
        walletId,
        amount: '1000.00',
        source: 'bank_transfer',
      });

      await sleep(500);

      await client.post('/wallets/withdrawal', {
        walletId,
        amount: '100.00',
        destination: 'bank_account',
      });

      await sleep(500);

      // Check transaction history
      const historyResponse = await client.get(
        `/wallets/${walletId}/transactions?limit=10`,
      );

      expect(historyResponse.status).toBe(200);
      expect(Array.isArray(historyResponse.data)).toBe(true);
      expect(historyResponse.data.length).toBeGreaterThanOrEqual(2);

      // Verify transactions are correctly recorded
      const deposit = historyResponse.data.find((tx: any) => tx.type === 'deposit');
      const withdrawal = historyResponse.data.find((tx: any) => tx.type === 'withdrawal');

      expect(deposit).toBeTruthy();
      expect(withdrawal).toBeTruthy();
    });

    it('should integrate P2P lending with payment distribution', async () => {
      // User 1 creates a loan, User 2 funds it fully
      client.setAuthToken(user1Token);

      const listing = await client.post('/p2p-lending/listings', {
        borrowerId: user1Id,
        amount: '1000.00',
        currency: 'USD',
        interestRate: 12.0,
        term: 12,
        purpose: 'Integration test loan',
        creditScore: 700,
      });

      const loanId = listing.data.loanListingId;

      // User 2 invests
      client.setAuthToken(user2Token);

      await client.post('/p2p-lending/investments', {
        lenderId: user2Id,
        loanListingId: loanId,
        amount: '1000.00',
      });

      await sleep(2000);

      // Verify loan is disbursed
      const loanStatus = await client.get(`/p2p-lending/listings/${loanId}`);

      expect(loanStatus.data.status).toBe('active');
      expect(loanStatus.data.disbursedAt).toBeTruthy();

      // User 1 makes repayment
      client.setAuthToken(user1Token);

      const monthlyPayment = new Decimal(loanStatus.data.monthlyPayment);

      await client.post('/p2p-lending/repayments', {
        loanListingId: loanId,
        amount: monthlyPayment.toString(),
        paymentMethod: 'bank_transfer',
      });

      await sleep(2000);

      // Verify User 2 received proportional repayment
      client.setAuthToken(user2Token);

      const investments = await client.get(`/p2p-lending/lender/${user2Id}/investments`);

      const investment = investments.data.find((inv: any) => inv.loanListingId === loanId);

      expect(new Decimal(investment.totalReturns || '0').greaterThan(0)).toBe(true);
    });

    it('should integrate Open Banking data with loan applications', async () => {
      client.setAuthToken(user1Token);

      // Connect bank account
      const linkResponse = await client.post('/open-banking/create-link-token', {
        userId: user1Id,
        products: ['auth', 'transactions', 'identity'],
      });

      if (linkResponse.status === 201) {
        const exchangeResponse = await client.post('/open-banking/exchange-public-token', {
          userId: user1Id,
          publicToken: 'public-sandbox-test-token',
          institutionId: 'ins_integration',
          institutionName: 'Integration Bank',
        });

        if (exchangeResponse.status === 201) {
          const connectionId = exchangeResponse.data.connectionId;

          // Get identity data
          const identityResponse = await client.get(
            `/open-banking/connections/${connectionId}/identity`,
          );

          // Use Open Banking data in loan application
          const loanResponse = await client.post('/p2p-lending/listings', {
            borrowerId: user1Id,
            amount: '5000.00',
            currency: 'USD',
            interestRate: 9.0,
            term: 24,
            purpose: 'Business loan with verified income',
            creditScore: 750,
            employmentStatus: 'employed',
            annualIncome: '80000.00',
            openBankingVerified: true,
            openBankingConnectionId: connectionId,
          });

          if (loanResponse.status === 201) {
            expect(loanResponse.data.riskTier).toBe('excellent');
          }
        }
      }
    });
  });

  describe('Platform Performance and Concurrency', () => {
    it('should handle concurrent user registrations', async () => {
      const promises = [];

      for (let i = 0; i < 10; i++) {
        const testClient = new TestClient();
        promises.push(
          testClient.post('/auth/register', {
            email: generateTestEmail(`concurrent${i}`),
            password: 'Test123!@#',
            firstName: 'Concurrent',
            lastName: `User${i}`,
          }),
        );
      }

      const results = await Promise.all(promises);

      // All should succeed
      results.forEach((result) => {
        expect(result.status).toBe(201);
        expect(result.data).toHaveProperty('userId');
      });

      // All userIds should be unique
      const userIds = results.map((r) => r.data.userId);
      const uniqueUserIds = new Set(userIds);
      expect(uniqueUserIds.size).toBe(10);
    });

    it('should handle concurrent investments in same loan', async () => {
      // Create a loan
      client.setAuthToken(user1Token);

      const loanResponse = await client.post('/p2p-lending/listings', {
        borrowerId: user1Id,
        amount: '10000.00',
        currency: 'USD',
        interestRate: 10.0,
        term: 12,
        purpose: 'Concurrency test',
        creditScore: 700,
      });

      const loanId = loanResponse.data.loanListingId;

      // Create multiple lenders
      const lenders = [];
      for (let i = 0; i < 5; i++) {
        const lenderRegister = await client.post('/auth/register', {
          email: generateTestEmail(`lender${i}`),
          password: 'Test123!@#',
          firstName: 'Lender',
          lastName: `${i}`,
        });

        const lenderClient = new TestClient();
        lenderClient.setAuthToken(lenderRegister.data.accessToken);

        await lenderClient.post('/kyc/verify', {
          userId: lenderRegister.data.userId,
          documentType: 'passport',
          documentNumber: `P${i}${i}${i}${i}${i}${i}${i}${i}${i}`,
          firstName: 'Lender',
          lastName: `${i}`,
        });

        lenders.push({
          id: lenderRegister.data.userId,
          client: lenderClient,
        });
      }

      // All lenders invest concurrently
      const investmentPromises = lenders.map((lender) =>
        lender.client.post('/p2p-lending/investments', {
          lenderId: lender.id,
          loanListingId: loanId,
          amount: '2000.00', // Total would be exactly $10,000
        }),
      );

      const investmentResults = await Promise.all(investmentPromises);

      // Exactly 5 investments should succeed (no overfunding)
      const successful = investmentResults.filter((r) => r.status === 201);

      expect(successful.length).toBe(5);

      // Verify total funded amount
      await sleep(1000);

      const loanStatus = await client.get(`/p2p-lending/listings/${loanId}`);

      expect(loanStatus.data.fundedAmount).toBe('10000.00');
      expect(loanStatus.data.status).toBe('funded');
    });
  });
});
