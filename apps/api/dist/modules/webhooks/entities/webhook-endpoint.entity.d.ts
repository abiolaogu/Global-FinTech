export declare class WebhookEndpointEntity {
    endpointId: string;
    partnerId: string;
    url: string;
    events: string[];
    secret: string;
    description: string | null;
    isActive: boolean;
    successCount: number;
    failureCount: number;
    lastSuccessAt: Date | null;
    lastFailureAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
