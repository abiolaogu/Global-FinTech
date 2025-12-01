export declare class WebhookDeliveryEntity {
    deliveryId: string;
    endpointId: string;
    eventType: string;
    payload: any;
    status: 'pending' | 'delivered' | 'failed';
    attemptCount: number;
    responseCode: number | null;
    responseBody: string | null;
    nextRetryAt: Date | null;
    deliveredAt: Date | null;
    failedAt: Date | null;
    createdAt: Date;
}
