import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface OnfidoApplicant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface OnfidoCheck {
  id: string;
  status: 'in_progress' | 'awaiting_applicant' | 'complete' | 'withdrawn' | 'paused' | 'reopened';
  result: 'clear' | 'consider' | null;
  reports: Array<{
    id: string;
    name: string;
    status: string;
    result: string;
  }>;
}

@Injectable()
export class OnfidoService {
  private readonly logger = new Logger(OnfidoService.name);
  private readonly client: AxiosInstance;
  private readonly apiToken: string;
  private readonly baseUrl: string;

  constructor(private readonly configService: ConfigService) {
    this.apiToken = this.configService.get<string>('ONFIDO_API_TOKEN');
    this.baseUrl = this.configService.get<string>('ONFIDO_BASE_URL') || 'https://api.onfido.com/v3.6';

    if (!this.apiToken) {
      throw new Error('ONFIDO_API_TOKEN not configured');
    }

    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Token token=${this.apiToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 30000,
    });
  }

  /**
   * Create an applicant
   */
  async createApplicant(data: {
    firstName: string;
    lastName: string;
    email: string;
    dob?: string; // YYYY-MM-DD
    address?: {
      line1: string;
      town: string;
      country: string;
      postcode?: string;
    };
  }): Promise<OnfidoApplicant> {
    try {
      const response = await this.client.post('/applicants', {
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        dob: data.dob,
        address: data.address,
      });

      this.logger.log(`Created Onfido applicant: ${response.data.id}`);

      return {
        id: response.data.id,
        firstName: response.data.first_name,
        lastName: response.data.last_name,
        email: response.data.email,
      };
    } catch (error) {
      this.logger.error(`Failed to create Onfido applicant: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to create KYC applicant',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Generate SDK token for client-side document upload
   */
  async generateSdkToken(applicantId: string): Promise<string> {
    try {
      const response = await this.client.post('/sdk_token', {
        applicant_id: applicantId,
        referrer: '*://*/*', // Allow all referrers (customize for production)
      });

      return response.data.token;
    } catch (error) {
      this.logger.error(`Failed to generate SDK token: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to generate KYC token',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Create a check (identity verification)
   */
  async createCheck(
    applicantId: string,
    checkType: 'standard' | 'express' | 'basic' = 'standard',
  ): Promise<OnfidoCheck> {
    try {
      const reportNames = this.getReportNames(checkType);

      const response = await this.client.post('/checks', {
        applicant_id: applicantId,
        report_names: reportNames,
      });

      this.logger.log(`Created Onfido check: ${response.data.id}`);

      return {
        id: response.data.id,
        status: response.data.status,
        result: response.data.result,
        reports: response.data.reports || [],
      };
    } catch (error) {
      this.logger.error(`Failed to create check: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to create KYC check',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get check status
   */
  async getCheck(checkId: string): Promise<OnfidoCheck> {
    try {
      const response = await this.client.get(`/checks/${checkId}`);

      return {
        id: response.data.id,
        status: response.data.status,
        result: response.data.result,
        reports: response.data.reports || [],
      };
    } catch (error) {
      this.logger.error(`Failed to get check status: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to get KYC check status',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get check results
   */
  async getCheckResults(checkId: string): Promise<{
    status: string;
    result: string;
    breakdown: any;
  }> {
    try {
      const response = await this.client.get(`/checks/${checkId}`);
      const check = response.data;

      // Get detailed reports
      const reports = await Promise.all(
        check.report_ids.map((reportId: string) => this.getReport(reportId)),
      );

      return {
        status: check.status,
        result: check.result,
        breakdown: {
          documentCheck: reports.find((r: any) => r.name === 'document'),
          facialSimilarityCheck: reports.find((r: any) => r.name === 'facial_similarity_photo'),
          proofOfAddress: reports.find((r: any) => r.name === 'proof_of_address'),
        },
      };
    } catch (error) {
      this.logger.error(`Failed to get check results: ${error.message}`, error.stack);
      throw new HttpException(
        'Failed to get KYC check results',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Get individual report
   */
  async getReport(reportId: string): Promise<any> {
    try {
      const response = await this.client.get(`/reports/${reportId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get report: ${error.message}`, error.stack);
      return null;
    }
  }

  /**
   * Webhook verification
   */
  verifyWebhookSignature(payload: string, signature: string, webhookToken: string): boolean {
    const crypto = require('crypto');
    const hmac = crypto.createHmac('sha256', webhookToken);
    hmac.update(payload);
    const expectedSignature = hmac.digest('hex');

    return signature === expectedSignature;
  }

  /**
   * Handle webhook
   */
  async handleWebhook(payload: any): Promise<void> {
    this.logger.log(`Received Onfido webhook: ${payload.resource_type} - ${payload.action}`);

    switch (payload.resource_type) {
      case 'check':
        if (payload.action === 'check.completed') {
          await this.handleCheckCompleted(payload.object);
        }
        break;
      case 'report':
        if (payload.action === 'report.completed') {
          await this.handleReportCompleted(payload.object);
        }
        break;
      default:
        this.logger.warn(`Unhandled webhook type: ${payload.resource_type}`);
    }
  }

  private async handleCheckCompleted(check: any): Promise<void> {
    this.logger.log(`Check completed: ${check.id} - Result: ${check.result}`);
    // Emit event for the main application to update user KYC status
  }

  private async handleReportCompleted(report: any): Promise<void> {
    this.logger.log(`Report completed: ${report.id} - Result: ${report.result}`);
  }

  private getReportNames(checkType: string): string[] {
    switch (checkType) {
      case 'express':
        return ['document', 'facial_similarity_photo'];
      case 'basic':
        return ['document'];
      case 'standard':
      default:
        return ['document', 'facial_similarity_photo', 'proof_of_address'];
    }
  }
}
