export declare class PaymentGatewayEntity {
    gatewayId: string;
    userId: string;
    provider: string;
    name: string;
    description: string;
    credentialsEncrypted: string;
    isLive: boolean;
    isActive: boolean;
    supportedCurrencies: string[];
    supportedCountries: string[];
    supportedPaymentMethods: string[];
    configuration: {
        webhookUrl?: string;
        callbackUrl?: string;
        logoUrl?: string;
        brandColor?: string;
        businessName?: string;
        supportEmail?: string;
        customFields?: Record<string, any>;
    };
    feeConfiguration: {
        type: 'platform' | 'custom';
        cardFee?: {
            percentage?: number;
            fixed?: string;
            cap?: string;
        };
        bankTransferFee?: {
            percentage?: number;
            fixed?: string;
        };
        mobileMoney?: {
            percentage?: number;
            fixed?: string;
        };
        ussd?: {
            percentage?: number;
            fixed?: string;
        };
        currency?: string;
    };
    totalProcessed: string;
    transactionCount: number;
    lastTransactionAt: Date;
    lastHealthCheck: Date;
    healthStatus: string;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
