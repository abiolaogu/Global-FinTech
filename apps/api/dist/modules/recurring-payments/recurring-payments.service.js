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
var RecurringPaymentsService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RecurringPaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const recurring_payment_entity_1 = require("./entities/recurring-payment.entity");
const payment_gateways_service_1 = require("../payment-gateways/payment-gateways.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const uuid_1 = require("uuid");
const crypto = require("crypto");
const decimal_js_1 = require("decimal.js");
let RecurringPaymentsService = RecurringPaymentsService_1 = class RecurringPaymentsService {
    constructor(recurringPaymentRepository, paymentGatewaysService, eventEmitter) {
        this.recurringPaymentRepository = recurringPaymentRepository;
        this.paymentGatewaysService = paymentGatewaysService;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(RecurringPaymentsService_1.name);
    }
    async createRecurringPayment(dto) {
        this.logger.log(`Creating recurring payment for user ${dto.userId}`);
        const nextPaymentDate = this.calculateNextPaymentDate(dto.startDate, dto.frequency);
        const recurringPayment = this.recurringPaymentRepository.create({
            recurringPaymentId: (0, uuid_1.v4)(),
            userId: dto.userId,
            merchantId: dto.merchantId,
            name: dto.name,
            description: dto.description,
            amount: dto.amount,
            currency: dto.currency,
            frequency: dto.frequency,
            status: 'active',
            startDate: dto.startDate,
            endDate: dto.endDate,
            nextPaymentDate,
            maxPayments: dto.maxPayments,
            paymentsMade: 0,
            failedPayments: 0,
            successfulPayments: 0,
            paymentMethod: dto.paymentMethod,
            paymentMethodEncrypted: this.encryptPaymentMethod(dto.paymentMethodToken),
            gatewayId: dto.gatewayId,
            provider: dto.provider,
            authorizationCode: dto.authorizationCode,
            retryAttempts: 0,
            maxRetryAttempts: 3,
            totalCollected: '0',
            metadata: dto.metadata || {},
        });
        const saved = await this.recurringPaymentRepository.save(recurringPayment);
        this.eventEmitter.emit('recurring_payment.created', {
            recurringPaymentId: saved.recurringPaymentId,
            userId: dto.userId,
            frequency: dto.frequency,
            amount: dto.amount,
        });
        this.logger.log(`Recurring payment created: ${saved.recurringPaymentId}`);
        return saved;
    }
    async processDuePayments() {
        this.logger.log('Processing due recurring payments...');
        const duePayments = await this.recurringPaymentRepository.find({
            where: {
                status: 'active',
                nextPaymentDate: (0, typeorm_2.LessThanOrEqual)(new Date()),
            },
        });
        let processedCount = 0;
        for (const payment of duePayments) {
            try {
                await this.processRecurringPayment(payment);
                processedCount++;
            }
            catch (error) {
                this.logger.error(`Failed to process recurring payment ${payment.recurringPaymentId}: ${error.message}`);
            }
        }
        this.logger.log(`Processed ${processedCount} recurring payments`);
        return processedCount;
    }
    async processRecurringPayment(payment) {
        this.logger.log(`Processing recurring payment: ${payment.recurringPaymentId}`);
        try {
            const transaction = await this.paymentGatewaysService.initiatePayment({
                userId: payment.userId,
                merchantId: payment.merchantId,
                amount: payment.amount,
                currency: payment.currency,
                paymentMethod: payment.paymentMethod,
                description: `Recurring payment: ${payment.name}`,
                metadata: {
                    recurringPaymentId: payment.recurringPaymentId,
                    paymentNumber: payment.paymentsMade + 1,
                },
            }, payment.provider);
            payment.paymentsMade += 1;
            payment.successfulPayments += 1;
            payment.totalCollected = new decimal_js_1.default(payment.totalCollected).plus(payment.amount).toString();
            payment.lastPaymentAt = new Date();
            payment.retryAttempts = 0;
            payment.nextPaymentDate = this.calculateNextPaymentDate(new Date(), payment.frequency);
            if (payment.maxPayments && payment.paymentsMade >= payment.maxPayments) {
                payment.status = 'expired';
            }
            else if (payment.endDate && new Date() >= payment.endDate) {
                payment.status = 'expired';
            }
            await this.recurringPaymentRepository.save(payment);
            this.eventEmitter.emit('recurring_payment.processed', {
                recurringPaymentId: payment.recurringPaymentId,
                transactionId: transaction.transactionId,
                paymentNumber: payment.paymentsMade,
            });
            this.logger.log(`Recurring payment processed successfully: ${payment.recurringPaymentId}`);
        }
        catch (error) {
            this.logger.error(`Recurring payment processing failed: ${error.message}`);
            payment.failedPayments += 1;
            payment.retryAttempts += 1;
            payment.lastFailureAt = new Date();
            payment.lastFailureReason = error.message;
            if (payment.retryAttempts >= payment.maxRetryAttempts) {
                payment.status = 'failed';
                payment.nextPaymentDate = null;
            }
            else {
                payment.nextPaymentDate = new Date(Date.now() + 60 * 60 * 1000);
            }
            await this.recurringPaymentRepository.save(payment);
            this.eventEmitter.emit('recurring_payment.failed', {
                recurringPaymentId: payment.recurringPaymentId,
                error: error.message,
                retryAttempts: payment.retryAttempts,
            });
        }
    }
    async pauseRecurringPayment(recurringPaymentId) {
        const payment = await this.getRecurringPayment(recurringPaymentId);
        if (payment.status !== 'active') {
            throw new common_1.BadRequestException('Only active recurring payments can be paused');
        }
        payment.status = 'paused';
        payment.pausedAt = new Date();
        return this.recurringPaymentRepository.save(payment);
    }
    async resumeRecurringPayment(recurringPaymentId) {
        const payment = await this.getRecurringPayment(recurringPaymentId);
        if (payment.status !== 'paused') {
            throw new common_1.BadRequestException('Only paused recurring payments can be resumed');
        }
        payment.status = 'active';
        payment.pausedAt = null;
        payment.nextPaymentDate = this.calculateNextPaymentDate(new Date(), payment.frequency);
        return this.recurringPaymentRepository.save(payment);
    }
    async cancelRecurringPayment(recurringPaymentId, reason) {
        const payment = await this.getRecurringPayment(recurringPaymentId);
        payment.status = 'cancelled';
        payment.cancelledAt = new Date();
        payment.cancellationReason = reason;
        payment.nextPaymentDate = null;
        return this.recurringPaymentRepository.save(payment);
    }
    async getRecurringPayment(recurringPaymentId) {
        const payment = await this.recurringPaymentRepository.findOne({
            where: { recurringPaymentId },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Recurring payment not found');
        }
        return payment;
    }
    async getUserRecurringPayments(userId) {
        return this.recurringPaymentRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async getMerchantRecurringPayments(merchantId) {
        return this.recurringPaymentRepository.find({
            where: { merchantId },
            order: { createdAt: 'DESC' },
        });
    }
    calculateNextPaymentDate(fromDate, frequency) {
        const date = new Date(fromDate);
        switch (frequency) {
            case 'daily':
                date.setDate(date.getDate() + 1);
                break;
            case 'weekly':
                date.setDate(date.getDate() + 7);
                break;
            case 'biweekly':
                date.setDate(date.getDate() + 14);
                break;
            case 'monthly':
                date.setMonth(date.getMonth() + 1);
                break;
            case 'quarterly':
                date.setMonth(date.getMonth() + 3);
                break;
            case 'yearly':
                date.setFullYear(date.getFullYear() + 1);
                break;
            default:
                throw new common_1.BadRequestException(`Invalid frequency: ${frequency}`);
        }
        return date;
    }
    encryptPaymentMethod(data) {
        const algorithm = 'aes-256-gcm';
        const key = Buffer.from(process.env.ENCRYPTION_KEY || '0'.repeat(64), 'hex');
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const tag = cipher.getAuthTag();
        return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
    }
};
exports.RecurringPaymentsService = RecurringPaymentsService;
exports.RecurringPaymentsService = RecurringPaymentsService = RecurringPaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(recurring_payment_entity_1.RecurringPaymentEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, payment_gateways_service_1.PaymentGatewaysService, typeof (_b = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _b : Object])
], RecurringPaymentsService);
//# sourceMappingURL=recurring-payments.service.js.map