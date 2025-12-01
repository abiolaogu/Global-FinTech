import { ConfigService } from '@nestjs/config';
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
export declare class SumsubService {
    private readonly configService;
    private readonly logger;
    private readonly client;
    private readonly appToken;
    private readonly secretKey;
    private readonly baseUrl;
    constructor(configService: ConfigService);
    createApplicant(data: {
        externalUserId: string;
        email: string;
        phone: string;
        firstName: string;
        lastName: string;
        country: string;
        levelName?: string;
    }): Promise<SumsubApplicant>;
    generateAccessToken(externalUserId: string, levelName?: string): Promise<string>;
    getApplicantStatus(applicantId: string): Promise<SumsubVerificationResult>;
    getApplicant(applicantId: string): Promise<any>;
    requestCheck(applicantId: string): Promise<void>;
    resetApplicant(applicantId: string): Promise<void>;
    handleWebhook(payload: any, signature: string): Promise<void>;
    private handleApplicantReviewed;
    private handleApplicantPending;
    private generateSignature;
    private verifyWebhookSignature;
}
