export declare class PaymentRailConnectionEntity {
    connectionId: string;
    partnerId: string | null;
    railType: 'upi' | 'pix' | 'fednow' | 'sepa_instant' | 'faster_payments' | 'ach_realtime';
    railName: string;
    country: string;
    credentialsEncrypted: string | null;
    apiEndpoint: string | null;
    configuration: any;
    status: 'active' | 'inactive' | 'pending' | 'error';
    isLive: boolean;
    lastHealthCheck: Date | null;
    healthStatus: 'healthy' | 'degraded' | 'down' | null;
    createdAt: Date;
    updatedAt: Date;
}
