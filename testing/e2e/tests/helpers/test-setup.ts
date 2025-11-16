import axios, { AxiosInstance } from 'axios';
import * as dotenv from 'dotenv';

dotenv.config();

export interface TestConfig {
  apiBaseUrl: string;
  plaidPublicKey?: string;
  fcmServerKey?: string;
}

export const config: TestConfig = {
  apiBaseUrl: process.env.API_BASE_URL || 'http://localhost:3000',
  plaidPublicKey: process.env.PLAID_PUBLIC_KEY,
  fcmServerKey: process.env.FCM_SERVER_KEY,
};

export interface TestUser {
  userId: string;
  email: string;
  accessToken: string;
  refreshToken?: string;
}

export interface TestLoanListing {
  loanListingId: string;
  borrowerId: string;
  amount: string;
  interestRate: number;
  term: number;
  status: string;
}

export class TestClient {
  private client: AxiosInstance;
  private authToken?: string;

  constructor(baseURL: string = config.apiBaseUrl) {
    this.client = axios.create({
      baseURL,
      timeout: 10000,
      validateStatus: () => true, // Don't throw on any status
    });
  }

  setAuthToken(token: string) {
    this.authToken = token;
    this.client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  clearAuthToken() {
    this.authToken = undefined;
    delete this.client.defaults.headers.common['Authorization'];
  }

  async post(url: string, data?: any, headers?: any) {
    return this.client.post(url, data, { headers });
  }

  async get(url: string, params?: any, headers?: any) {
    return this.client.get(url, { params, headers });
  }

  async put(url: string, data?: any, headers?: any) {
    return this.client.put(url, data, { headers });
  }

  async patch(url: string, data?: any, headers?: any) {
    return this.client.patch(url, data, { headers });
  }

  async delete(url: string, headers?: any) {
    return this.client.delete(url, { headers });
  }
}

/**
 * Generate a unique test user email
 */
export function generateTestEmail(prefix: string = 'test'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  return `${prefix}-${timestamp}-${random}@atlasx-test.com`;
}

/**
 * Generate a unique test phone number
 */
export function generateTestPhone(): string {
  const random = Math.floor(Math.random() * 900000000) + 100000000;
  return `+1555${random}`;
}

/**
 * Sleep utility for async operations
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Wait for a condition to be true with timeout
 */
export async function waitFor(
  condition: () => Promise<boolean>,
  timeout: number = 10000,
  interval: number = 500,
): Promise<boolean> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    if (await condition()) {
      return true;
    }
    await sleep(interval);
  }

  return false;
}

/**
 * Retry an async operation with exponential backoff
 */
export async function retryOperation<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelay: number = 1000,
): Promise<T> {
  let lastError: Error;

  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        const delay = initialDelay * Math.pow(2, i);
        await sleep(delay);
      }
    }
  }

  throw lastError!;
}
