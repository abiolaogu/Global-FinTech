export declare class FraudCheckEntity {
    checkId: string;
    userId: string;
    transactionType: string;
    amount: string;
    currency: string;
    riskScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    shouldBlock: boolean;
    metadata: {
        checks?: any;
        reasons?: string[];
        ipAddress?: string;
        deviceId?: string;
        location?: {
            lat: number;
            lon: number;
        };
    };
    createdAt: Date;
}
