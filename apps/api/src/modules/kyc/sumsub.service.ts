import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';

export interface SumsubApplicant {
  id: string;
  externalUserId: string;
  email: string;
  phone: string;
}

export interface SumsubVerificationResult {
  reviewStatus: 'init' | 'pending' | 'prechecked' | 'queued' | 'completed' | 'onHold';
  reviewResult: {
    reviewAnswer: 'GREEN' | 'RED' | 'RETRY';
    rejectLabels: string[];
    reviewRejectType: string | null;
  };
}

@Injectable()
export class SumsubService {
  private readonly logger = new Logger(SumsubService.name);
  private readonly client: AxiosInstance;
  private readonly appToken: string;
  private readonly secretKey: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.appToken = this.configService.get<string>('SUMSUB_APP_TOKEN');
    this.secretKey = this.configService.get<string>('SUMSUB_SECRET_KEY');
    this.baseUrl = this.configService.get<string>('SUMSUB_BASE_URL') || 'https://api.sumsub.com';

    if (!this.appToken || !this.secretKey) {
      throw new Error('Sumsub credentials not configured');
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
    });

    // Add request interceptor to sign requests
    this.client.interceptors.request.use((config) => {
      const ts = Math.floor(Date.now() / 1000);
      const signature = this.generateSignature(
        ts,
        config.method.toUpperCase(),
        config.url,
        config.data,
      );

      config.headers['X-App-Token'] = this.appToken;
      config.headers['X-App-Access-Sig'] = signature;
      config.headers['X-App-Access-Ts'] = ts.toString();

      return config;
    });
  }

  /**
   * Create an applicant
   */
  async createApplicant(data: {
    externalUserId: string;
    email: string;
    phone: string;
    firstName: string;
    lastName: string;
    country: string;
    levelName?: string; // KYC level: 'basic-kyc-level', 'advanced-kyc-level'
  }): Promise<SumsubApplicant> {
    try {
      const response = await this.client.post('/resources/applicants', {
        externalUserId: data.externalUserId,
        email: data.email,
        phone: data.phone,
        fixedInfo: {
          firstName: data.firstName,
          lastName: data.lastName,
          country: data.country,
        },
      }, {
        params: {
          levelName: data.levelName || 'basic-kyc-level',
        },
      });

      this.logger.log(`Created Sumsub applicant: ${response.data.id}`);

      return {
        id: response.data.id,
        externalUserId: response.data.externalUserId,
        email: response.data.email,
        phone: response.data.phone,
      };
    } catch (error) {
      this.logger.error(`Failed to create Sumsub applicant: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to create KYC applicant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generate access token for SDK
   */
  async generateAccessToken(
    externalUserId: string,
    levelName: string = 'basic-kyc-level',
  ): Promise<string> {
    try {
      const response = await this.client.post(
        `/resources/accessTokens`,
        {
          externalUserId,
          levelName,
          ttlInSecs: 600, // 10 minutes
        },
      );

      return response.data.token;
    } catch (error) {
      this.logger.error(`Failed to generate access token: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to generate KYC token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get applicant status
   */
  async getApplicantStatus(applicantId: string): Promise<SumsubVerificationResult> {
    try {
      const response = await this.client.get(`/resources/applicants/${applicantId}/status`);

      return {
        reviewStatus: response.data.reviewStatus,
        reviewResult: response.data.reviewResult,
      };
    } catch (error) {
      this.logger.error(`Failed to get applicant status: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to get KYC status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get applicant data
   */
  async getApplicant(applicantId: string): Promise<any> {
    try {
      const response = await this.client.get(`/resources/applicants/${applicantId}/one`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get applicant data: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to get KYC data',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Request applicant check
   */
  async requestCheck(applicantId: string): Promise<void> {
    try {
      await this.client.post(`/resources/applicants/${applicantId}/status/pending`);
      this.logger.log(`Requested check for applicant: ${applicantId}`);
    } catch (error) {
      this.logger.error(`Failed to request check: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to request KYC check',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Reset applicant (for re-verification)
   */
  async resetApplicant(applicantId: string): Promise<void> {
    try {
      await this.client.post(`/resources/applicants/${applicantId}/reset`);
      this.logger.log(`Reset applicant: ${applicantId}`);
    } catch (error) {
      this.logger.error(`Failed to reset applicant: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to reset KYC',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Handle webhook
   */
  async handleWebhook(payload: any, signature: string): Promise<void> {
    // Verify webhook signature
    const isValid = this.verifyWebhookSignature(JSON.stringify(payload), signature);
    if (!isValid) {
      this.logger.warn('Invalid webhook signature');
      throw new HttpException('Invalid signature', HttpStatus.UNAUTHORIZED);
    }

    this.logger.log(`Received Sumsub webhook: ${payload.type}`);

    switch (payload.type) {
      case 'applicantReviewed':
        await this.handleApplicantReviewed(payload);
        break;
      case 'applicantPending':
        await this.handleApplicantPending(payload);
        break;
      case 'applicantCreated':
        this.logger.log(`Applicant created: ${payload.applicantId}`);
        break;
      default:
        this.logger.warn(`Unhandled webhook type: ${payload.type}`);
    }
  }

  private async handleApplicantReviewed(payload: any): Promise<void> {
    const { applicantId, externalUserId, reviewResult } = payload;

    this.logger.log(
      `Applicant reviewed: ${applicantId} - Result: ${reviewResult.reviewAnswer}`,
    );

    // Emit event for the main application to update user KYC status
    // In production, this would use event bus or message queue
  }

  private async handleApplicantPending(payload: any): Promise<void> {
    this.logger.log(`Applicant pending: ${payload.applicantId}`);
  }

  private generateSignature(
    ts: number,
    method: string,
    url: string,
    body: any = null,
  ): string {
    const data = ts + method + url + (body ? JSON.stringify(body) : '');
    return crypto.createHmac('sha256', this.secretKey).update(data).digest('hex');
  }

  private verifyWebhookSignature(payload: string, signature: string): boolean {
    const hmac = crypto.createHmac('sha256', this.secretKey);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');

    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }
}
