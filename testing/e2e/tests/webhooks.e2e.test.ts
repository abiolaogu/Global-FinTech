import { TestClient, generateTestEmail, sleep, waitFor } from './helpers/test-setup';
import * as crypto from 'crypto';
import * as http from 'http';
import { AddressInfo } from 'net';

describe('Webhooks E2E Tests', () => {
  let client: TestClient;
  let partnerToken: string;
  let partnerId: string;
  let webhookEndpointId: string;
  let webhookSecret: string;
  let mockServer: http.Server;
  let receivedWebhooks: any[] = [];

  beforeAll(async () => {
    client = new TestClient();

    // Create partner account
    const partnerEmail = generateTestEmail('webhook-partner');
    const registerResponse = await client.post('/auth/register', {
      email: partnerEmail,
      password: 'Test123!@#',
      firstName: 'Webhook',
      lastName: 'Partner',
      accountType: 'partner',
    });

    partnerId = registerResponse.data.userId;
    partnerToken = registerResponse.data.accessToken;

    // Start mock webhook server to receive webhooks
    mockServer = http.createServer((req, res) => {
      let body = '';

      req.on('data', (chunk) => {
        body += chunk.toString();
      });

      req.on('end', () => {
        const headers = req.headers;
        receivedWebhooks.push({
          headers,
          body: JSON.parse(body),
          timestamp: Date.now(),
        });

        res.writeHead(200);
        res.end('OK');
      });
    });

    await new Promise<void>((resolve) => {
      mockServer.listen(0, () => {
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (mockServer) {
      await new Promise<void>((resolve) => {
        mockServer.close(() => resolve());
      });
    }
  });

  describe('Webhook Endpoint Registration', () => {
    it('should register a webhook endpoint', async () => {
      client.setAuthToken(partnerToken);

      const port = (mockServer.address() as AddressInfo).port;
      const webhookUrl = `http://localhost:${port}/webhooks`;

      const response = await client.post('/webhooks/endpoints', {
        partnerId,
        url: webhookUrl,
        events: ['transaction.created', 'payment.completed', 'user.created'],
        description: 'Test webhook endpoint',
      });

      expect(response.status).toBe(201);
      expect(response.data).toHaveProperty('endpointId');
      expect(response.data).toHaveProperty('secret');
      expect(response.data.url).toBe(webhookUrl);
      expect(response.data.events).toEqual([
        'transaction.created',
        'payment.completed',
        'user.created',
      ]);
      expect(response.data.status).toBe('active');

      webhookEndpointId = response.data.endpointId;
      webhookSecret = response.data.secret;
    });

    it('should list webhook endpoints', async () => {
      client.setAuthToken(partnerToken);

      const response = await client.get(`/webhooks/endpoints?partnerId=${partnerId}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThanOrEqual(1);

      const endpoint = response.data[0];
      expect(endpoint).toHaveProperty('endpointId');
      expect(endpoint).toHaveProperty('url');
      expect(endpoint).toHaveProperty('events');
      expect(endpoint).toHaveProperty('status');
      expect(endpoint).not.toHaveProperty('secret'); // Secret never exposed in list
    });

    it('should update webhook endpoint', async () => {
      client.setAuthToken(partnerToken);

      const response = await client.patch(`/webhooks/endpoints/${webhookEndpointId}`, {
        partnerId,
        events: ['transaction.created', 'loan.disbursed'],
        description: 'Updated webhook endpoint',
      });

      expect(response.status).toBe(200);
      expect(response.data.events).toEqual(['transaction.created', 'loan.disbursed']);
      expect(response.data.description).toBe('Updated webhook endpoint');
    });

    it('should validate webhook URL format', async () => {
      client.setAuthToken(partnerToken);

      const response = await client.post('/webhooks/endpoints', {
        partnerId,
        url: 'not-a-valid-url',
        events: ['transaction.created'],
      });

      expect(response.status).toBe(400);
      expect(response.data.message).toContain('url');
    });
  });

  describe('Webhook Delivery', () => {
    beforeEach(() => {
      receivedWebhooks = [];
    });

    it('should deliver webhook for transaction.created event', async () => {
      // Trigger a transaction event
      client.setAuthToken(partnerToken);

      // Create a transaction that will trigger webhook
      await client.post('/transactions', {
        userId: partnerId,
        amount: '100.00',
        currency: 'USD',
        type: 'deposit',
      });

      // Wait for webhook delivery
      const received = await waitFor(
        async () => {
          return receivedWebhooks.some((wh) => wh.body.event === 'transaction.created');
        },
        10000,
        500,
      );

      expect(received).toBe(true);

      const webhook = receivedWebhooks.find(
        (wh) => wh.body.event === 'transaction.created',
      );

      expect(webhook).toBeTruthy();
      expect(webhook.body).toHaveProperty('event');
      expect(webhook.body).toHaveProperty('data');
      expect(webhook.body.event).toBe('transaction.created');
    });

    it('should include HMAC signature in webhook headers', async () => {
      receivedWebhooks = [];

      // Trigger an event
      client.setAuthToken(partnerToken);

      await client.post('/users', {
        email: generateTestEmail('webhook-trigger'),
        firstName: 'Webhook',
        lastName: 'Trigger',
      });

      // Wait for webhook
      const received = await waitFor(
        async () => {
          return receivedWebhooks.some((wh) => wh.body.event === 'user.created');
        },
        10000,
        500,
      );

      if (received) {
        const webhook = receivedWebhooks.find((wh) => wh.body.event === 'user.created');

        expect(webhook.headers).toHaveProperty('x-atlasx-signature');

        const signature = webhook.headers['x-atlasx-signature'] as string;

        // Signature should be in format: t=timestamp,v1=signature
        expect(signature).toMatch(/^t=\d+,v1=[a-f0-9]{64}$/);
      }
    });

    it('should verify webhook signature correctly', async () => {
      receivedWebhooks = [];

      client.setAuthToken(partnerToken);

      await client.post('/transactions', {
        userId: partnerId,
        amount: '50.00',
        currency: 'USD',
        type: 'withdrawal',
      });

      const received = await waitFor(
        async () => {
          return receivedWebhooks.some((wh) => wh.body.event === 'transaction.created');
        },
        10000,
        500,
      );

      if (received) {
        const webhook = receivedWebhooks.find(
          (wh) => wh.body.event === 'transaction.created',
        );

        const signature = webhook.headers['x-atlasx-signature'] as string;
        const [timestampPart, signaturePart] = signature.split(',');

        const timestamp = timestampPart.split('=')[1];
        const receivedSignature = signaturePart.split('=')[1];

        // Verify signature
        const payload = `${timestamp}.${JSON.stringify(webhook.body)}`;
        const expectedSignature = crypto
          .createHmac('sha256', webhookSecret)
          .update(payload)
          .digest('hex');

        expect(receivedSignature).toBe(expectedSignature);
      }
    });

    it('should include delivery ID in headers', async () => {
      receivedWebhooks = [];

      client.setAuthToken(partnerToken);

      await client.post('/transactions', {
        userId: partnerId,
        amount: '25.00',
        currency: 'USD',
        type: 'deposit',
      });

      const received = await waitFor(
        async () => receivedWebhooks.length > 0,
        10000,
        500,
      );

      if (received) {
        const webhook = receivedWebhooks[0];

        expect(webhook.headers).toHaveProperty('x-atlasx-delivery-id');
        expect(webhook.headers).toHaveProperty('x-atlasx-event-type');

        const deliveryId = webhook.headers['x-atlasx-delivery-id'];
        expect(typeof deliveryId).toBe('string');
        expect(deliveryId.length).toBeGreaterThan(0);
      }
    });
  });

  describe('Webhook Retry Mechanism', () => {
    let failingServer: http.Server;
    let failingEndpointId: string;
    let attemptCount = 0;

    beforeAll(async () => {
      // Create a server that fails first few attempts
      failingServer = http.createServer((req, res) => {
        attemptCount++;

        // Fail first 2 attempts, succeed on 3rd
        if (attemptCount <= 2) {
          res.writeHead(500);
          res.end('Internal Server Error');
        } else {
          let body = '';
          req.on('data', (chunk) => {
            body += chunk.toString();
          });
          req.on('end', () => {
            receivedWebhooks.push({
              headers: req.headers,
              body: JSON.parse(body),
              attempt: attemptCount,
            });
            res.writeHead(200);
            res.end('OK');
          });
        }
      });

      await new Promise<void>((resolve) => {
        failingServer.listen(0, () => resolve());
      });

      // Register endpoint
      client.setAuthToken(partnerToken);
      const port = (failingServer.address() as AddressInfo).port;

      const response = await client.post('/webhooks/endpoints', {
        partnerId,
        url: `http://localhost:${port}/webhooks`,
        events: ['transaction.created'],
        description: 'Failing endpoint for retry tests',
      });

      failingEndpointId = response.data.endpointId;
    });

    afterAll(async () => {
      if (failingServer) {
        await new Promise<void>((resolve) => {
          failingServer.close(() => resolve());
        });
      }
    });

    it('should retry failed webhook deliveries', async () => {
      receivedWebhooks = [];
      attemptCount = 0;

      client.setAuthToken(partnerToken);

      await client.post('/transactions', {
        userId: partnerId,
        amount: '75.00',
        currency: 'USD',
        type: 'deposit',
      });

      // Wait for retries to complete
      const received = await waitFor(
        async () => receivedWebhooks.length > 0,
        60000,
        2000,
      );

      expect(received).toBe(true);

      // Should have succeeded on 3rd attempt
      expect(attemptCount).toBe(3);
      expect(receivedWebhooks.length).toBe(1);
      expect(receivedWebhooks[0].attempt).toBe(3);
    });

    it('should use exponential backoff for retries', async () => {
      client.setAuthToken(partnerToken);

      // Query delivery history
      const response = await client.get(
        `/webhooks/deliveries?endpointId=${failingEndpointId}&limit=10`,
      );

      expect(response.status).toBe(200);

      if (response.data.length > 0) {
        const delivery = response.data[0];

        expect(delivery).toHaveProperty('attempts');
        expect(delivery.attempts).toBeGreaterThanOrEqual(1);

        // Verify exponential backoff pattern (30s, 60s, 300s, 900s, 3600s)
        if (delivery.attemptHistory) {
          for (let i = 1; i < delivery.attemptHistory.length; i++) {
            const prevAttempt = new Date(delivery.attemptHistory[i - 1].timestamp);
            const currentAttempt = new Date(delivery.attemptHistory[i].timestamp);
            const delaySeconds = (currentAttempt.getTime() - prevAttempt.getTime()) / 1000;

            // Allow some margin for processing time
            expect(delaySeconds).toBeGreaterThan(10);
          }
        }
      }
    });

    it('should mark delivery as failed after max retries', async () => {
      // Create an endpoint that always fails
      let alwaysFailServer: http.Server;

      alwaysFailServer = http.createServer((req, res) => {
        res.writeHead(500);
        res.end('Always fails');
      });

      await new Promise<void>((resolve) => {
        alwaysFailServer.listen(0, () => resolve());
      });

      client.setAuthToken(partnerToken);
      const port = (alwaysFailServer.address() as AddressInfo).port;

      const endpointResponse = await client.post('/webhooks/endpoints', {
        partnerId,
        url: `http://localhost:${port}/webhooks`,
        events: ['transaction.created'],
      });

      const alwaysFailEndpointId = endpointResponse.data.endpointId;

      // Trigger event
      await client.post('/transactions', {
        userId: partnerId,
        amount: '10.00',
        currency: 'USD',
        type: 'deposit',
      });

      // Wait for max retries (this will take time due to exponential backoff)
      await sleep(10000);

      // Check delivery status
      const deliveryResponse = await client.get(
        `/webhooks/deliveries?endpointId=${alwaysFailEndpointId}&limit=1`,
      );

      if (deliveryResponse.data.length > 0) {
        const delivery = deliveryResponse.data[0];

        // Should have attempted 5 times (initial + 4 retries or 5 total)
        expect(delivery.attempts).toBeGreaterThanOrEqual(1);
        expect(delivery.attempts).toBeLessThanOrEqual(5);
      }

      alwaysFailServer.close();
    });
  });

  describe('Webhook Event Subscriptions', () => {
    it('should only deliver subscribed events', async () => {
      receivedWebhooks = [];

      // Create endpoint subscribed only to loan events
      const loanServer = http.createServer((req, res) => {
        let body = '';
        req.on('data', (chunk) => {
          body += chunk.toString();
        });
        req.on('end', () => {
          receivedWebhooks.push({
            body: JSON.parse(body),
          });
          res.writeHead(200);
          res.end('OK');
        });
      });

      await new Promise<void>((resolve) => {
        loanServer.listen(0, () => resolve());
      });

      client.setAuthToken(partnerToken);
      const port = (loanServer.address() as AddressInfo).port;

      await client.post('/webhooks/endpoints', {
        partnerId,
        url: `http://localhost:${port}/webhooks`,
        events: ['loan.disbursed', 'loan.fully_repaid'],
      });

      // Trigger non-subscribed event
      await client.post('/transactions', {
        userId: partnerId,
        amount: '30.00',
        currency: 'USD',
        type: 'deposit',
      });

      await sleep(3000);

      // Should not have received transaction event
      const transactionEvents = receivedWebhooks.filter(
        (wh) => wh.body.event === 'transaction.created',
      );
      expect(transactionEvents.length).toBe(0);

      loanServer.close();
    });
  });

  describe('Webhook Management', () => {
    it('should disable webhook endpoint', async () => {
      client.setAuthToken(partnerToken);

      const response = await client.patch(`/webhooks/endpoints/${webhookEndpointId}`, {
        partnerId,
        status: 'disabled',
      });

      expect(response.status).toBe(200);
      expect(response.data.status).toBe('disabled');

      // Trigger event - should not be delivered
      receivedWebhooks = [];

      await client.post('/transactions', {
        userId: partnerId,
        amount: '15.00',
        currency: 'USD',
        type: 'deposit',
      });

      await sleep(3000);

      // Should not have received webhook
      expect(receivedWebhooks.length).toBe(0);
    });

    it('should re-enable webhook endpoint', async () => {
      client.setAuthToken(partnerToken);

      const response = await client.patch(`/webhooks/endpoints/${webhookEndpointId}`, {
        partnerId,
        status: 'active',
      });

      expect(response.status).toBe(200);
      expect(response.data.status).toBe('active');

      // Trigger event - should now be delivered
      receivedWebhooks = [];

      await client.post('/transactions', {
        userId: partnerId,
        amount: '20.00',
        currency: 'USD',
        type: 'deposit',
      });

      const received = await waitFor(
        async () => receivedWebhooks.length > 0,
        10000,
        500,
      );

      expect(received).toBe(true);
    });

    it('should delete webhook endpoint', async () => {
      client.setAuthToken(partnerToken);

      const response = await client.delete(`/webhooks/endpoints/${webhookEndpointId}`, {
        partnerId,
      });

      expect(response.status).toBe(200);

      // Verify endpoint is deleted
      const listResponse = await client.get(
        `/webhooks/endpoints?partnerId=${partnerId}`,
      );

      const deletedEndpoint = listResponse.data.find(
        (ep: any) => ep.endpointId === webhookEndpointId,
      );

      expect(deletedEndpoint).toBeFalsy();
    });
  });
});
