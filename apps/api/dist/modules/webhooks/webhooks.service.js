"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var WebhooksService_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhooksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const webhook_endpoint_entity_1 = require("./entities/webhook-endpoint.entity");
const webhook_delivery_entity_1 = require("./entities/webhook-delivery.entity");
const axios_1 = require("@nestjs/axios");
const rxjs_1 = require("rxjs");
const crypto = require("crypto");
const schedule_1 = require("@nestjs/schedule");
let WebhooksService = WebhooksService_1 = class WebhooksService {
    constructor(endpointRepository, deliveryRepository, httpService) {
        this.endpointRepository = endpointRepository;
        this.deliveryRepository = deliveryRepository;
        this.httpService = httpService;
        this.logger = new common_1.Logger(WebhooksService_1.name);
        this.maxRetries = 5;
        this.retryBackoff = [30, 60, 300, 900, 3600];
    }
    async registerEndpoint(dto) {
        this.logger.log(`Registering webhook endpoint for partner ${dto.partnerId}: ${dto.url}`);
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
    async sendWebhook(event) {
        this.logger.log(`Sending webhook event: ${event.type}`);
        const endpoints = await this.endpointRepository.find({
            where: Object.assign({ isActive: true }, (event.partnerId && { partnerId: event.partnerId })),
        });
        const relevantEndpoints = endpoints.filter((endpoint) => endpoint.events.includes(event.type) || endpoint.events.includes('*'));
        if (relevantEndpoints.length === 0) {
            this.logger.debug(`No endpoints registered for event: ${event.type}`);
            return;
        }
        for (const endpoint of relevantEndpoints) {
            await this.createDelivery(endpoint, event);
        }
    }
    async createDelivery(endpoint, event) {
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
        await this.attemptDelivery(savedDelivery, endpoint);
    }
    async attemptDelivery(delivery, endpoint) {
        var _a;
        this.logger.log(`Attempting webhook delivery: ${delivery.deliveryId}`);
        try {
            const signature = this.generateSignature(delivery.payload, endpoint.secret);
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(endpoint.url, delivery.payload, {
                headers: {
                    'Content-Type': 'application/json',
                    'X-AtlasX-Signature': signature,
                    'X-AtlasX-Delivery-ID': delivery.deliveryId,
                    'X-AtlasX-Event-Type': delivery.eventType,
                },
                timeout: 10000,
            }));
            delivery.status = 'delivered';
            delivery.attemptCount += 1;
            delivery.responseCode = response.status;
            delivery.responseBody = response.data;
            delivery.deliveredAt = new Date();
            await this.deliveryRepository.save(delivery);
            this.logger.log(`Webhook delivered successfully: ${delivery.deliveryId}`);
            endpoint.successCount += 1;
            endpoint.lastSuccessAt = new Date();
            await this.endpointRepository.save(endpoint);
        }
        catch (error) {
            delivery.attemptCount += 1;
            delivery.responseCode = ((_a = error.response) === null || _a === void 0 ? void 0 : _a.status) || 0;
            delivery.responseBody = error.message;
            if (delivery.attemptCount < this.maxRetries) {
                delivery.status = 'pending';
                delivery.nextRetryAt = this.calculateNextRetry(delivery.attemptCount);
                this.logger.warn(`Webhook delivery failed (attempt ${delivery.attemptCount}/${this.maxRetries}): ${delivery.deliveryId}`);
            }
            else {
                delivery.status = 'failed';
                delivery.failedAt = new Date();
                this.logger.error(`Webhook delivery permanently failed: ${delivery.deliveryId}`);
                endpoint.failureCount += 1;
                endpoint.lastFailureAt = new Date();
                await this.endpointRepository.save(endpoint);
            }
            await this.deliveryRepository.save(delivery);
        }
    }
    async retryFailedDeliveries() {
        const now = new Date();
        const pendingDeliveries = await this.deliveryRepository.find({
            where: {
                status: 'pending',
            },
            take: 100,
        });
        const deliveriesToRetry = pendingDeliveries.filter((d) => !d.nextRetryAt || d.nextRetryAt <= now);
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
    async getEndpointDeliveries(endpointId, partnerId, limit = 100) {
        const endpoint = await this.endpointRepository.findOne({
            where: { endpointId, partnerId },
        });
        if (!endpoint) {
            throw new Error('Endpoint not found');
        }
        return this.deliveryRepository.find({
            where: { endpointId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async getPartnerEndpoints(partnerId) {
        return this.endpointRepository.find({
            where: { partnerId },
            order: { createdAt: 'DESC' },
        });
    }
    async updateEndpoint(endpointId, partnerId, updates) {
        const endpoint = await this.endpointRepository.findOne({
            where: { endpointId, partnerId },
        });
        if (!endpoint) {
            throw new Error('Endpoint not found');
        }
        if (updates.url)
            endpoint.url = updates.url;
        if (updates.events)
            endpoint.events = updates.events;
        if (updates.description)
            endpoint.description = updates.description;
        if (updates.isActive !== undefined)
            endpoint.isActive = updates.isActive;
        const updated = await this.endpointRepository.save(endpoint);
        this.logger.log(`Webhook endpoint updated: ${endpointId}`);
        return updated;
    }
    async deleteEndpoint(endpointId, partnerId) {
        const endpoint = await this.endpointRepository.findOne({
            where: { endpointId, partnerId },
        });
        if (!endpoint) {
            throw new Error('Endpoint not found');
        }
        await this.endpointRepository.remove(endpoint);
        this.logger.log(`Webhook endpoint deleted: ${endpointId}`);
    }
    async regenerateSecret(endpointId, partnerId) {
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
    async getEndpointStats(endpointId, partnerId) {
        const endpoint = await this.endpointRepository.findOne({
            where: { endpointId, partnerId },
        });
        if (!endpoint) {
            throw new Error('Endpoint not found');
        }
        const [totalDeliveries, pendingCount] = await Promise.all([
            this.deliveryRepository.count({ where: { endpointId } }),
            this.deliveryRepository.count({
                where: { endpointId, status: 'pending' },
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
    generateWebhookSecret() {
        return `whsec_${crypto.randomBytes(32).toString('hex')}`;
    }
    generateSignature(payload, secret) {
        const timestamp = Math.floor(Date.now() / 1000);
        const signedPayload = `${timestamp}.${JSON.stringify(payload)}`;
        const signature = crypto
            .createHmac('sha256', secret)
            .update(signedPayload)
            .digest('hex');
        return `t=${timestamp},v1=${signature}`;
    }
    calculateNextRetry(attemptCount) {
        const backoffSeconds = this.retryBackoff[attemptCount - 1] || 3600;
        return new Date(Date.now() + backoffSeconds * 1000);
    }
};
exports.WebhooksService = WebhooksService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_MINUTE),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], WebhooksService.prototype, "retryFailedDeliveries", null);
exports.WebhooksService = WebhooksService = WebhooksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(webhook_endpoint_entity_1.WebhookEndpointEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(webhook_delivery_entity_1.WebhookDeliveryEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _c : Object])
], WebhooksService);
//# sourceMappingURL=webhooks.service.js.map