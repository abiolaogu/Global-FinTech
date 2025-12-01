import { Repository } from 'typeorm';
import { WebhookEndpointEntity } from './entities/webhook-endpoint.entity';
import { WebhookDeliveryEntity } from './entities/webhook-delivery.entity';
import { HttpService } from '@nestjs/axios';
export interface CreateWebhookEndpointDto {
    partnerId: string;
    url: string;
    events: string[];
    secret?: string;
    description?: string;
}
export interface WebhookEvent {
    type: string;
    data: any;
    partnerId?: string;
}
export declare class WebhooksService {
    private readonly endpointRepository;
    private readonly deliveryRepository;
    private readonly httpService;
    private readonly logger;
    private readonly maxRetries;
    private readonly retryBackoff;
    constructor(endpointRepository: Repository<WebhookEndpointEntity>, deliveryRepository: Repository<WebhookDeliveryEntity>, httpService: HttpService);
    registerEndpoint(dto: CreateWebhookEndpointDto): Promise<WebhookEndpointEntity>;
    sendWebhook(event: WebhookEvent): Promise<void>;
    private createDelivery;
    private attemptDelivery;
    retryFailedDeliveries(): Promise<void>;
    getEndpointDeliveries(endpointId: string, partnerId: string, limit?: number): Promise<WebhookDeliveryEntity[]>;
    getPartnerEndpoints(partnerId: string): Promise<WebhookEndpointEntity[]>;
    updateEndpoint(endpointId: string, partnerId: string, updates: {
        url?: string;
        events?: string[];
        description?: string;
        isActive?: boolean;
    }): Promise<WebhookEndpointEntity>;
    deleteEndpoint(endpointId: string, partnerId: string): Promise<void>;
    regenerateSecret(endpointId: string, partnerId: string): Promise<string>;
    getEndpointStats(endpointId: string, partnerId: string): Promise<{
        totalDeliveries: number;
        successCount: number;
        failureCount: number;
        pendingCount: number;
        lastSuccess: Date | null;
        lastFailure: Date | null;
    }>;
    private generateWebhookSecret;
    private generateSignature;
    private calculateNextRetry;
}
