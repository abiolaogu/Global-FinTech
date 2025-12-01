import { ConfigService } from '@nestjs/config';
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
export declare class OnfidoService {
    private readonly configService;
    private readonly logger;
    private readonly client;
    private readonly apiToken;
    private readonly baseUrl;
    constructor(configService: ConfigService);
    createApplicant(data: {
        firstName: string;
        lastName: string;
        email: string;
        dob?: string;
        address?: {
            line1: string;
            town: string;
            country: string;
            postcode?: string;
        };
    }): Promise<OnfidoApplicant>;
    generateSdkToken(applicantId: string): Promise<string>;
    createCheck(applicantId: string, checkType?: 'standard' | 'express' | 'basic'): Promise<OnfidoCheck>;
    getCheck(checkId: string): Promise<OnfidoCheck>;
    getCheckResults(checkId: string): Promise<{
        status: string;
        result: string;
        breakdown: any;
    }>;
    getReport(reportId: string): Promise<any>;
    verifyWebhookSignature(payload: string, signature: string, webhookToken: string): boolean;
    handleWebhook(payload: any): Promise<void>;
    private handleCheckCompleted;
    private handleReportCompleted;
    private getReportNames;
}
