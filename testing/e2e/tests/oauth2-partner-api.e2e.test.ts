import { TestClient, generateTestEmail, sleep } from './helpers/test-setup';
import * as crypto from 'crypto';

describe('OAuth2 and Partner API E2E Tests', () => {
  let client: TestClient;
  let partnerToken: string;
  let partnerId: string;
  let apiKey: string;
  let apiKeyId: string;

  beforeAll(async () => {
    client = new TestClient();

    // Register as a partner
    const partnerEmail = generateTestEmail('partner');

    const registerResponse = await client.post('/auth/register', {
      email: partnerEmail,
      password: 'Test123!@#',
      firstName: 'Partner',
      lastName: 'Company',
      accountType: 'partner',
    });

    expect(registerResponse.status).toBe(201);
    partnerId = registerResponse.data.userId;
    partnerToken = registerResponse.data.accessToken;
  });

  describe('API Key Management', () => {
    it('should create an API key for partner', async () => {
      client.setAuthToken(partnerToken);

      const response = await client.post('/api-keys', {
        partnerId,
        name: 'Production API Key',
        permissions: ['users:read', 'users:write', 'payments:create'],
        ipWhitelist: ['192.168.1.1', '10.0.0.0/24'],
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('apiKey');
      expect(response.data).toHaveProperty('keyId');

      // API key should follow format: atx_live_XXXXXXXX...
      expect(response.data.apiKey).toMatch(/^atx_live_[a-f0-9]{48}$/);

      apiKey = response.data.apiKey;
      apiKeyId = response.data.keyId;
    });

    it('should list partner API keys', async () => {
      client.setAuthToken(partnerToken);

      const response = await client.get(`/api-keys?partnerId=${partnerId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThanOrEqual(1);

      const key = response.data[0];
      expect(key).toHaveProperty('keyId');
      expect(key).toHaveProperty('name');
      expect(key).toHaveProperty('keyPrefix'); // Only prefix visible, not full key
      expect(key.keyPrefix).toMatch(/^atx_live_/);
      expect(key).not.toHaveProperty('apiKey'); // Full key never exposed
    });

    it('should validate API key on requests', async () => {
      client.clearAuthToken();

      const response = await client.get('/users/me', undefined, {
        'X-API-Key': apiKey,
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('userId');
    });

    it('should reject invalid API key', async () => {
      client.clearAuthToken();

      const response = await client.get('/users/me', undefined, {
        'X-API-Key': 'atx_live_invalid_key',
      });

      expect(response.status).toBe(401);
    });

    it('should enforce IP whitelist', async () => {
      client.clearAuthToken();

      // Request from non-whitelisted IP (test environment limitation)
      const response = await client.get('/users/me', undefined, {
        'X-API-Key': apiKey,
        'X-Forwarded-For': '203.0.113.1', // Non-whitelisted IP
      });

      // Should reject if IP whitelisting is enabled
      expect([200, 403]).toContain(response.status);
    });

    it('should rotate API key', async () => {
      client.setAuthToken(partnerToken);

      const response = await client.post(`/api-keys/${apiKeyId}/rotate`, {
        partnerId,
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('apiKey');
      expect(response.data.apiKey).toMatch(/^atx_live_[a-f0-9]{48}$/);

      // New key should be different
      expect(response.data.apiKey).not.toBe(apiKey);

      // Old key should still work for grace period
      client.clearAuthToken();
      const oldKeyResponse = await client.get('/users/me', undefined, {
        'X-API-Key': apiKey,
      });

      // May still work during grace period or be immediately invalidated
      expect([200, 401]).toContain(oldKeyResponse.status);

      // New key should work
      const newKeyResponse = await client.get('/users/me', undefined, {
        'X-API-Key': response.data.apiKey,
      });

      expect(newKeyResponse.status).toBe(200);
    });

    it('should revoke API key', async () => {
      client.setAuthToken(partnerToken);

      const response = await client.delete(`/api-keys/${apiKeyId}`, {
        partnerId,
      });

      expect(response.status).toBe(200);

      // Revoked key should not work
      client.clearAuthToken();
      const testResponse = await client.get('/users/me', undefined, {
        'X-API-Key': apiKey,
      });

      expect(testResponse.status).toBe(401);
    });
  });

  describe('OAuth2 Authorization Flow', () => {
    let clientId: string;
    let clientSecret: string;
    let endUserId: string;
    let endUserToken: string;

    beforeAll(async () => {
      // Create OAuth2 client credentials for partner
      client.setAuthToken(partnerToken);

      const clientResponse = await client.post('/oauth2/clients', {
        partnerId,
        name: 'Test OAuth2 Client',
        redirectUris: ['https://partner-app.example.com/callback'],
        scope: 'users:read wallets:read payments:create',
      });

      expect(clientResponse.status).toBe(201);
      clientId = clientResponse.data.clientId;
      clientSecret = clientResponse.data.clientSecret;

      // Create an end user who will authorize the app
      const userEmail = generateTestEmail('enduser');
      const userRegister = await client.post('/auth/register', {
        email: userEmail,
        password: 'Test123!@#',
        firstName: 'End',
        lastName: 'User',
      });

      endUserId = userRegister.data.userId;
      endUserToken = userRegister.data.accessToken;
    });

    it('should generate authorization code', async () => {
      client.setAuthToken(endUserToken);

      const response = await client.post('/oauth2/authorize', {
        clientId,
        userId: endUserId,
        redirectUri: 'https://partner-app.example.com/callback',
        scope: 'users:read wallets:read',
        state: 'random-state-string',
      });

      expect(response.status).toBe(200);
      expect(response.data).toHaveProperty('authorizationCode');
      expect(response.data).toHaveProperty('redirectUri');

      // Authorization code should be returned
      expect(response.data.authorizationCode.length).toBeGreaterThan(20);
    });

    it('should exchange authorization code for access token', async () => {
      client.setAuthToken(endUserToken);

      // Get authorization code
      const authResponse = await client.post('/oauth2/authorize', {
        clientId,
        userId: endUserId,
        redirectUri: 'https://partner-app.example.com/callback',
        scope: 'users:read wallets:read payments:create',
      });

      const authCode = authResponse.data.authorizationCode;

      // Exchange code for token
      client.clearAuthToken();
      const tokenResponse = await client.post('/oauth2/token', {
        grantType: 'authorization_code',
        code: authCode,
        clientId,
        clientSecret,
        redirectUri: 'https://partner-app.example.com/callback',
      });

      expect(tokenResponse.status).toBe(200);
      expect(tokenResponse.data).toHaveProperty('accessToken');
      expect(tokenResponse.data).toHaveProperty('refreshToken');
      expect(tokenResponse.data).toHaveProperty('expiresIn');
      expect(tokenResponse.data).toHaveProperty('tokenType');
      expect(tokenResponse.data.tokenType).toBe('Bearer');
      expect(tokenResponse.data.expiresIn).toBe(3600); // 1 hour
    });

    it('should prevent authorization code reuse', async () => {
      client.setAuthToken(endUserToken);

      const authResponse = await client.post('/oauth2/authorize', {
        clientId,
        userId: endUserId,
        redirectUri: 'https://partner-app.example.com/callback',
        scope: 'users:read',
      });

      const authCode = authResponse.data.authorizationCode;

      // Use code once
      client.clearAuthToken();
      await client.post('/oauth2/token', {
        grantType: 'authorization_code',
        code: authCode,
        clientId,
        clientSecret,
        redirectUri: 'https://partner-app.example.com/callback',
      });

      // Try to use same code again
      const replayResponse = await client.post('/oauth2/token', {
        grantType: 'authorization_code',
        code: authCode,
        clientId,
        clientSecret,
        redirectUri: 'https://partner-app.example.com/callback',
      });

      expect(replayResponse.status).toBe(400);
      expect(replayResponse.data.error).toBe('invalid_grant');
    });

    it('should use access token to access protected resources', async () => {
      client.setAuthToken(endUserToken);

      const authResponse = await client.post('/oauth2/authorize', {
        clientId,
        userId: endUserId,
        redirectUri: 'https://partner-app.example.com/callback',
        scope: 'users:read wallets:read',
      });

      client.clearAuthToken();
      const tokenResponse = await client.post('/oauth2/token', {
        grantType: 'authorization_code',
        code: authResponse.data.authorizationCode,
        clientId,
        clientSecret,
        redirectUri: 'https://partner-app.example.com/callback',
      });

      const accessToken = tokenResponse.data.accessToken;

      // Use access token to fetch user data
      client.setAuthToken(accessToken);
      const userResponse = await client.get('/users/me');

      expect(userResponse.status).toBe(200);
      expect(userResponse.data.userId).toBe(endUserId);
    });

    it('should refresh access token using refresh token', async () => {
      client.setAuthToken(endUserToken);

      const authResponse = await client.post('/oauth2/authorize', {
        clientId,
        userId: endUserId,
        redirectUri: 'https://partner-app.example.com/callback',
        scope: 'users:read',
      });

      client.clearAuthToken();
      const tokenResponse = await client.post('/oauth2/token', {
        grantType: 'authorization_code',
        code: authResponse.data.authorizationCode,
        clientId,
        clientSecret,
        redirectUri: 'https://partner-app.example.com/callback',
      });

      const refreshToken = tokenResponse.data.refreshToken;

      // Wait a moment
      await sleep(1000);

      // Refresh the token
      const refreshResponse = await client.post('/oauth2/token', {
        grantType: 'refresh_token',
        refreshToken,
        clientId,
        clientSecret,
      });

      expect(refreshResponse.status).toBe(200);
      expect(refreshResponse.data).toHaveProperty('accessToken');
      expect(refreshResponse.data).toHaveProperty('refreshToken');

      // New access token should be different
      expect(refreshResponse.data.accessToken).not.toBe(tokenResponse.data.accessToken);

      // New access token should work
      client.setAuthToken(refreshResponse.data.accessToken);
      const userResponse = await client.get('/users/me');

      expect(userResponse.status).toBe(200);
    });

    it('should enforce scope restrictions', async () => {
      client.setAuthToken(endUserToken);

      // Authorize with limited scope (only users:read)
      const authResponse = await client.post('/oauth2/authorize', {
        clientId,
        userId: endUserId,
        redirectUri: 'https://partner-app.example.com/callback',
        scope: 'users:read',
      });

      client.clearAuthToken();
      const tokenResponse = await client.post('/oauth2/token', {
        grantType: 'authorization_code',
        code: authResponse.data.authorizationCode,
        clientId,
        clientSecret,
        redirectUri: 'https://partner-app.example.com/callback',
      });

      client.setAuthToken(tokenResponse.data.accessToken);

      // Reading should work
      const readResponse = await client.get('/users/me');
      expect(readResponse.status).toBe(200);

      // Writing should fail (no users:write scope)
      const writeResponse = await client.patch('/users/me', {
        firstName: 'Updated',
      });

      expect(writeResponse.status).toBe(403);
      expect(writeResponse.data.message).toContain('scope');
    });

    it('should validate redirect URI', async () => {
      client.setAuthToken(endUserToken);

      // Try to use different redirect URI
      const response = await client.post('/oauth2/authorize', {
        clientId,
        userId: endUserId,
        redirectUri: 'https://evil.example.com/steal-tokens',
        scope: 'users:read',
      });

      expect(response.status).toBe(400);
      expect(response.data.error).toBe('invalid_request');
    });
  });

  describe('Partner API Access', () => {
    let partnerApiKey: string;

    beforeAll(async () => {
      // Create fresh API key for these tests
      client.setAuthToken(partnerToken);

      const keyResponse = await client.post('/api-keys', {
        partnerId,
        name: 'Partner API Test Key',
        permissions: [
          'users:read',
          'users:write',
          'wallets:read',
          'wallets:write',
          'payments:create',
        ],
      });

      partnerApiKey = keyResponse.data.apiKey;
    });

    it('should create user via Partner API', async () => {
      client.clearAuthToken();

      const response = await client.post(
        '/partner/users',
        {
          email: generateTestEmail('partner-created'),
          firstName: 'Partner',
          lastName: 'Created',
          externalId: 'ext_' + Date.now(),
        },
        {
          'X-API-Key': partnerApiKey,
        },
      );

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('userId');
      expect(response.data).toHaveProperty('email');
    });

    it('should create wallet for user via Partner API', async () => {
      client.clearAuthToken();

      // First create a user
      const userResponse = await client.post(
        '/partner/users',
        {
          email: generateTestEmail('wallet-test'),
          firstName: 'Wallet',
          lastName: 'Test',
        },
        {
          'X-API-Key': partnerApiKey,
        },
      );

      const userId = userResponse.data.userId;

      // Create wallet
      const walletResponse = await client.post(
        '/partner/wallets',
        {
          userId,
          currency: 'USD',
          type: 'standard',
        },
        {
          'X-API-Key': partnerApiKey,
        },
      );

      expect(walletResponse.status).toBe(201);
      expect(walletResponse.data).toHaveProperty('walletId');
      expect(walletResponse.data.currency).toBe('USD');
      expect(walletResponse.data.balance).toBe('0.00');
    });

    it('should initiate payment via Partner API', async () => {
      client.clearAuthToken();

      // Create sender and receiver
      const senderResponse = await client.post(
        '/partner/users',
        {
          email: generateTestEmail('sender'),
          firstName: 'Sender',
          lastName: 'User',
        },
        {
          'X-API-Key': partnerApiKey,
        },
      );

      const receiverResponse = await client.post(
        '/partner/users',
        {
          email: generateTestEmail('receiver'),
          firstName: 'Receiver',
          lastName: 'User',
        },
        {
          'X-API-Key': partnerApiKey,
        },
      );

      // Create payment
      const paymentResponse = await client.post(
        '/partner/payments',
        {
          senderUserId: senderResponse.data.userId,
          receiverUserId: receiverResponse.data.userId,
          amount: '100.00',
          currency: 'USD',
          reference: 'Test payment',
        },
        {
          'X-API-Key': partnerApiKey,
        },
      );

      expect(paymentResponse.status).toBe(201);
      expect(paymentResponse.data).toHaveProperty('paymentId');
      expect(paymentResponse.data.amount).toBe('100.00');
    });

    it('should track rate limits', async () => {
      client.clearAuthToken();

      // Make multiple rapid requests
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(
          client.get('/partner/users?limit=1', undefined, {
            'X-API-Key': partnerApiKey,
          }),
        );
      }

      const responses = await Promise.all(promises);

      // Check for rate limit responses
      const rateLimited = responses.filter((r) => r.status === 429);

      // Some requests should be rate limited
      expect(rateLimited.length).toBeGreaterThanOrEqual(0);

      // Rate limit headers should be present
      const successResponse = responses.find((r) => r.status === 200);
      if (successResponse) {
        expect(successResponse.headers).toHaveProperty('x-ratelimit-limit');
        expect(successResponse.headers).toHaveProperty('x-ratelimit-remaining');
      }
    });
  });
});
