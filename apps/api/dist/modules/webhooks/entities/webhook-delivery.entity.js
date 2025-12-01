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
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebhookDeliveryEntity = void 0;
const typeorm_1 = require("typeorm");
let WebhookDeliveryEntity = class WebhookDeliveryEntity {
};
exports.WebhookDeliveryEntity = WebhookDeliveryEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], WebhookDeliveryEntity.prototype, "deliveryId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    __metadata("design:type", String)
], WebhookDeliveryEntity.prototype, "endpointId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100 }),
    __metadata("design:type", String)
], WebhookDeliveryEntity.prototype, "eventType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Object)
], WebhookDeliveryEntity.prototype, "payload", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 20 }),
    __metadata("design:type", String)
], WebhookDeliveryEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], WebhookDeliveryEntity.prototype, "attemptCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], WebhookDeliveryEntity.prototype, "responseCode", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], WebhookDeliveryEntity.prototype, "responseBody", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], WebhookDeliveryEntity.prototype, "nextRetryAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], WebhookDeliveryEntity.prototype, "deliveredAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp with time zone', nullable: true }),
    __metadata("design:type", Date)
], WebhookDeliveryEntity.prototype, "failedAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)({ type: 'timestamp with time zone' }),
    __metadata("design:type", Date)
], WebhookDeliveryEntity.prototype, "createdAt", void 0);
exports.WebhookDeliveryEntity = WebhookDeliveryEntity = __decorate([
    (0, typeorm_1.Entity)('webhook_deliveries'),
    (0, typeorm_1.Index)(['endpointId', 'createdAt']),
    (0, typeorm_1.Index)(['status', 'nextRetryAt'])
], WebhookDeliveryEntity);
//# sourceMappingURL=webhook-delivery.entity.js.map