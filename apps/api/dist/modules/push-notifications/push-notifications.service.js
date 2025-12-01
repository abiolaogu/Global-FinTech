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
var PushNotificationsService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PushNotificationsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const device_token_entity_1 = require("./entities/device-token.entity");
const admin = require("firebase-admin");
let PushNotificationsService = PushNotificationsService_1 = class PushNotificationsService {
    constructor(deviceTokenRepository) {
        this.deviceTokenRepository = deviceTokenRepository;
        this.logger = new common_1.Logger(PushNotificationsService_1.name);
        if (!admin.apps.length) {
            admin.initializeApp({
                credential: admin.credential.applicationDefault(),
            });
        }
    }
    async registerDevice(dto) {
        this.logger.log(`Registering device for user ${dto.userId}: ${dto.platform}`);
        const existing = await this.deviceTokenRepository.findOne({
            where: { token: dto.token },
        });
        if (existing) {
            existing.userId = dto.userId;
            existing.lastUsedAt = new Date();
            await this.deviceTokenRepository.save(existing);
        }
        else {
            const deviceToken = this.deviceTokenRepository.create({
                userId: dto.userId,
                token: dto.token,
                platform: dto.platform,
                deviceId: dto.deviceId,
                isActive: true,
            });
            await this.deviceTokenRepository.save(deviceToken);
        }
        this.logger.log(`Device registered successfully for user ${dto.userId}`);
    }
    async unregisterDevice(token) {
        await this.deviceTokenRepository.delete({ token });
        this.logger.log(`Device unregistered: ${token.substring(0, 10)}...`);
    }
    async sendToUser(userId, dto) {
        const deviceTokens = await this.deviceTokenRepository.find({
            where: { userId, isActive: true },
        });
        if (deviceTokens.length === 0) {
            this.logger.warn(`No active devices found for user ${userId}`);
            return;
        }
        const tokens = deviceTokens.map((d) => d.token);
        await this.sendMulticast(tokens, dto);
    }
    async sendToTopic(topic, dto) {
        const message = {
            notification: Object.assign({ title: dto.title, body: dto.body }, (dto.imageUrl && { imageUrl: dto.imageUrl })),
            data: dto.data || {},
            topic,
        };
        try {
            const response = await admin.messaging().send(message);
            this.logger.log(`Notification sent to topic ${topic}: ${response}`);
        }
        catch (error) {
            this.logger.error(`Failed to send notification to topic ${topic}: ${error.message}`);
        }
    }
    async sendMulticast(tokens, dto) {
        const message = {
            notification: Object.assign({ title: dto.title, body: dto.body }, (dto.imageUrl && { imageUrl: dto.imageUrl })),
            data: dto.data || {},
            tokens,
        };
        try {
            const response = await admin.messaging().sendMulticast(message);
            this.logger.log(`Multicast sent: ${response.successCount} success, ${response.failureCount} failures`);
            if (response.failureCount > 0) {
                const failedTokens = [];
                response.responses.forEach((resp, idx) => {
                    if (!resp.success) {
                        failedTokens.push(tokens[idx]);
                    }
                });
                await this.deactivateTokens(failedTokens);
            }
        }
        catch (error) {
            this.logger.error(`Failed to send multicast: ${error.message}`);
        }
    }
    async deactivateTokens(tokens) {
        if (tokens.length === 0)
            return;
        await this.deviceTokenRepository.update({ token: { $in: tokens } }, { isActive: false });
        this.logger.log(`Deactivated ${tokens.length} invalid tokens`);
    }
    async subscribeToTopic(userId, topic) {
        const deviceTokens = await this.deviceTokenRepository.find({
            where: { userId, isActive: true },
        });
        if (deviceTokens.length === 0) {
            return;
        }
        const tokens = deviceTokens.map((d) => d.token);
        try {
            await admin.messaging().subscribeToTopic(tokens, topic);
            this.logger.log(`User ${userId} subscribed to topic ${topic}`);
        }
        catch (error) {
            this.logger.error(`Failed to subscribe to topic: ${error.message}`);
        }
    }
    async unsubscribeFromTopic(userId, topic) {
        const deviceTokens = await this.deviceTokenRepository.find({
            where: { userId, isActive: true },
        });
        if (deviceTokens.length === 0) {
            return;
        }
        const tokens = deviceTokens.map((d) => d.token);
        try {
            await admin.messaging().unsubscribeFromTopic(tokens, topic);
            this.logger.log(`User ${userId} unsubscribed from topic ${topic}`);
        }
        catch (error) {
            this.logger.error(`Failed to unsubscribe from topic: ${error.message}`);
        }
    }
    async sendTransactionNotification(userId, transactionId, amount, type) {
        await this.sendToUser(userId, {
            title: 'Transaction Update',
            body: `${type}: ${amount}`,
            data: {
                type: 'transaction',
                transactionId,
            },
        });
    }
    async sendSecurityAlert(userId, message) {
        await this.sendToUser(userId, {
            title: 'Security Alert',
            body: message,
            data: {
                type: 'security',
            },
        });
    }
    async sendKYCUpdate(userId, status) {
        await this.sendToUser(userId, {
            title: 'KYC Verification Update',
            body: `Your verification is ${status}`,
            data: {
                type: 'kyc',
                status,
            },
        });
    }
};
exports.PushNotificationsService = PushNotificationsService;
exports.PushNotificationsService = PushNotificationsService = PushNotificationsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(device_token_entity_1.DeviceTokenEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], PushNotificationsService);
//# sourceMappingURL=push-notifications.service.js.map