import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { WebhookEndpointEntity } from './entities/webhook-endpoint.entity';
import { WebhookDeliveryEntity } from './entities/webhook-delivery.entity';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import * as crypto from 'crypto';
import { Cron, CronExpression } from '@nestjs/schedule';

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

@Injectable()
export class WebhooksService {
  private readonly logger = new Logger(WebhooksService.name);
  private readonly maxRetries = 5;
  private readonly retryBackoff = [30, 60, 300, 900, 3600]; // seconds

  constructor(
    @InjectRepository(WebhookEndpointEntity)
    private readonly endpointRepository: Repository<WebhookEndpointEntity>,
    @InjectRepository(WebhookDeliveryEntity)
    private readonly deliveryRepository: Repository<WebhookDeliveryEntity>,
    private readonly httpService: HttpService,
  ) {}

  /**
   * Register a webhook endpoint
   */
  async registerEndpoint(dto: CreateWebhookEndpointDto): Promise<WebhookEndpointEntity> {
    this.logger.log(`Registering webhook endpoint for partner ${dto.partnerId}: ${dto.url}`);

    // Generate webhook secret if not provided
    const secret = dto.secret || this.generateWebhookSecret();

    const endpoint = this.endpointRepository.create({
      partnerId: dto.partnerId,
      url: dto.url,
      events: dto.events,
      secret,
      description: dto.description,
      isActive: true,
    });

    const savedEndpoint = await this.endpointRepository.save(endpoint);

    this.logger.log(`Webhook endpoint registered: ${savedEndpoint.endpointId}`);

    return savedEndpoint;
  }

  /**
   * Send webhook event
   */
  async sendWebhook(event: WebhookEvent): Promise<void> {
    this.logger.log(`Sending webhook event: ${event.type}`);

    // Find all endpoints subscribed to this event
    const endpoints = await this.endpointRepository.find({
      where: {
        isActive: true as any,
        ...(event.partnerId && { partnerId: event.partnerId }),
      },
    });

    const relevantEndpoints = endpoints.filter((endpoint) =>
      endpoint.events.includes(event.type) || endpoint.events.includes('*'),
    );

    if (relevantEndpoints.length === 0) {
      this.logger.debug(`No endpoints registered for event: ${event.type}`);
      return;
    }

    // Create deliveries for all relevant endpoints
    for (const endpoint of relevantEndpoints) {
      await this.createDelivery(endpoint, event);
    }
  }

  /**
   * Create webhook delivery
   */
  private async createDelivery(
    endpoint: WebhookEndpointEntity,
    event: WebhookEvent,
  ): Promise<void> {
    const payload = {
      id: crypto.randomUUID(),
      type: event.type,
      created_at: new Date().toISOString(),
      data: event.data,
    };

    const delivery = this.deliveryRepository.create({
      endpointId: endpoint.endpointId,
      eventType: event.type,
      payload,
      status: 'pending',
      attemptCount: 0,
    });

    const savedDelivery = await this.deliveryRepository.save(delivery);

    // Attempt delivery immediately
    await this.attemptDelivery(savedDelivery, endpoint);
  }

  /**
   * Attempt webhook delivery
   */
  private async attemptDelivery(
    delivery: WebhookDeliveryEntity,
    endpoint: WebhookEndpointEntity,
  ): Promise<void> {
    this.logger.log(`Attempting webhook delivery: ${delivery.deliveryId}`);

    try {
      // Generate signature
      const signature = this.generateSignature(delivery.payload, endpoint.secret);

      // Send HTTP request
      const response = await firstValueFrom(
        this.httpService.post(endpoint.url, delivery.payload, {
          headers: {
            'Content-Type': 'application/json',
            'X-AtlasX-Signature': signature,
            'X-AtlasX-Delivery-ID': delivery.deliveryId,
            'X-AtlasX-Event-Type': delivery.eventType,
          },
          timeout: 10000, // 10 second timeout
        }),
      );

      // Delivery successful
      delivery.status = 'delivered';
      delivery.attemptCount += 1;
      delivery.responseCode = response.status;
      delivery.responseBody = response.data;
      delivery.deliveredAt = new Date();

      await this.deliveryRepository.save(delivery);

      this.logger.log(`Webhook delivered successfully: ${delivery.deliveryId}`);

      // Update endpoint stats
      endpoint.successCount += 1;
      endpoint.lastSuccessAt = new Date();
      await this.endpointRepository.save(endpoint);
    } catch (error) {
      delivery.attemptCount += 1;
      delivery.responseCode = error.response?.status || 0;
      delivery.responseBody = error.message;

      // Check if we should retry
      if (delivery.attemptCount < this.maxRetries) {
        delivery.status = 'pending';
        delivery.nextRetryAt = this.calculateNextRetry(delivery.attemptCount);

        this.logger.warn(
          `Webhook delivery failed (attempt ${delivery.attemptCount}/${this.maxRetries}): ${delivery.deliveryId}`,
        );
      } else {
        delivery.status = 'failed';
        delivery.failedAt = new Date();

        this.logger.error(`Webhook delivery permanently failed: ${delivery.deliveryId}`);

        // Update endpoint stats
        endpoint.failureCount += 1;
        endpoint.lastFailureAt = new Date();
        await this.endpointRepository.save(endpoint);
      }

      await this.deliveryRepository.save(delivery);
    }
  }

  /**
   * Retry failed deliveries (scheduled job)
   */
  @Cron(CronExpression.EVERY_MINUTE)
  async retryFailedDeliveries(): Promise<void> {
    const now = new Date();

    const pendingDeliveries = await this.deliveryRepository.find({
      where: {
        status: 'pending' as any,
      },
      take: 100,
    });

    const deliveriesToRetry = pendingDeliveries.filter(
      (d) => !d.nextRetryAt || d.nextRetryAt <= now,
    );

    if (deliveriesToRetry.length === 0) {
      return;
    }

    this.logger.log(`Retrying ${deliveriesToRetry.length} failed deliveries`);

    for (const delivery of deliveriesToRetry) {
      const endpoint = await this.endpointRepository.findOne({
        where: { endpointId: delivery.endpointId },
      });

      if (endpoint && endpoint.isActive) {
        await this.attemptDelivery(delivery, endpoint);
      }
    }
  }

  /**
   * Get deliveries for an endpoint
   */
  async getEndpointDeliveries(
    endpointId: string,
    partnerId: string,
    limit: number = 100,
  ): Promise<WebhookDeliveryEntity[]> {
    const endpoint = await this.endpointRepository.findOne({
      where: { endpointId, partnerId },
    });

    if (!endpoint) {
      throw new Error('Endpoint not found');
    }

    return this.deliveryRepository.find({
      where: { endpointId },
      order: { createdAt: 'DESC' as any },
      take: limit,
    });
  }

  /**
   * Get all endpoints for a partner
   */
  async getPartnerEndpoints(partnerId: string): Promise<WebhookEndpointEntity[]> {
    return this.endpointRepository.find({
      where: { partnerId },
      order: { createdAt: 'DESC' as any },
    });
  }

  /**
   * Update webhook endpoint
   */
  async updateEndpoint(
    endpointId: string,
    partnerId: string,
    updates: {
      url?: string;
      events?: string[];
      description?: string;
      isActive?: boolean;
    },
  ): Promise<WebhookEndpointEntity> {
    const endpoint = await this.endpointRepository.findOne({
      where: { endpointId, partnerId },
    });

    if (!endpoint) {
      throw new Error('Endpoint not found');
    }

    if (updates.url) endpoint.url = updates.url;
    if (updates.events) endpoint.events = updates.events;
    if (updates.description) endpoint.description = updates.description;
    if (updates.isActive !== undefined) endpoint.isActive = updates.isActive;

    const updated = await this.endpointRepository.save(endpoint);

    this.logger.log(`Webhook endpoint updated: ${endpointId}`);

    return updated;
  }

  /**
   * Delete webhook endpoint
   */
  async deleteEndpoint(endpointId: string, partnerId: string): Promise<void> {
    const endpoint = await this.endpointRepository.findOne({
      where: { endpointId, partnerId },
    });

    if (!endpoint) {
      throw new Error('Endpoint not found');
    }

    await this.endpointRepository.remove(endpoint);

    this.logger.log(`Webhook endpoint deleted: ${endpointId}`);
  }

  /**
   * Regenerate webhook secret
   */
  async regenerateSecret(endpointId: string, partnerId: string): Promise<string> {
    const endpoint = await this.endpointRepository.findOne({
      where: { endpointId, partnerId },
    });

    if (!endpoint) {
      throw new Error('Endpoint not found');
    }

    const newSecret = this.generateWebhookSecret();
    endpoint.secret = newSecret;

    await this.endpointRepository.save(endpoint);

    this.logger.log(`Webhook secret regenerated: ${endpointId}`);

    return newSecret;
  }

  /**
   * Get endpoint statistics
   */
  async getEndpointStats(endpointId: string, partnerId: string): Promise<{
    totalDeliveries: number;
    successCount: number;
    failureCount: number;
    pendingCount: number;
    lastSuccess: Date | null;
    lastFailure: Date | null;
  }> {
    const endpoint = await this.endpointRepository.findOne({
      where: { endpointId, partnerId },
    });

    if (!endpoint) {
      throw new Error('Endpoint not found');
    }

    const [totalDeliveries, pendingCount] = await Promise.all([
      this.deliveryRepository.count({ where: { endpointId } }),
      this.deliveryRepository.count({
        where: { endpointId, status: 'pending' as any },
      }),
    ]);

    return {
      totalDeliveries,
      successCount: endpoint.successCount,
      failureCount: endpoint.failureCount,
      pendingCount,
      lastSuccess: endpoint.lastSuccessAt,
      lastFailure: endpoint.lastFailureAt,
    };
  }

  // Private helper methods

  private generateWebhookSecret(): string {
    return `whsec_${crypto.randomBytes(32).toString('hex')}`;
  }

  private generateSignature(payload: any, secret: string): string {
    const timestamp = Math.floor(Date.now() / 1000);
    const signedPayload = `${timestamp}.${JSON.stringify(payload)}`;

    const signature = crypto
      .createHmac('sha256', secret)
      .update(signedPayload)
      .digest('hex');

    return `t=${timestamp},v1=${signature}`;
  }

  private calculateNextRetry(attemptCount: number): Date {
    const backoffSeconds = this.retryBackoff[attemptCount - 1] || 3600;
    return new Date(Date.now() + backoffSeconds * 1000);
  }
}
