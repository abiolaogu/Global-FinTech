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
var PaymentLinksService_1;
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentLinksService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_link_entity_1 = require("./entities/payment-link.entity");
const event_emitter_1 = require("@nestjs/event-emitter");
const uuid_1 = require("uuid");
const crypto = require("crypto");
const decimal_js_1 = require("decimal.js");
let PaymentLinksService = PaymentLinksService_1 = class PaymentLinksService {
    constructor(paymentLinkRepository, eventEmitter) {
        this.paymentLinkRepository = paymentLinkRepository;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(PaymentLinksService_1.name);
    }
    async createPaymentLink(dto) {
        this.logger.log(`Creating payment link for user ${dto.userId}`);
        if (dto.amountType === 'fixed' && !dto.amount) {
            throw new common_1.BadRequestException('Amount is required for fixed payment links');
        }
        const code = this.generateCode();
        const paymentLink = this.paymentLinkRepository.create({
            linkId: (0, uuid_1.v4)(),
            userId: dto.userId,
            code,
            title: dto.title,
            description: dto.description,
            amountType: dto.amountType,
            amount: dto.amount,
            currency: dto.currency,
            active: true,
            status: 'active',
            allowedPaymentMethods: dto.allowedPaymentMethods,
            redirectUrl: dto.redirectUrl,
            collectCustomerInfo: dto.collectCustomerInfo || false,
            customFields: dto.customFields,
            logoUrl: dto.logoUrl,
            brandColor: dto.brandColor,
            maxPayments: dto.maxPayments,
            paymentCount: 0,
            totalCollected: '0',
            expiresAt: dto.expiresAt,
            splitConfigurationId: dto.splitConfigurationId,
            metadata: dto.metadata || {},
            viewCount: 0,
        });
        const saved = await this.paymentLinkRepository.save(paymentLink);
        this.eventEmitter.emit('payment_link.created', {
            linkId: saved.linkId,
            userId: dto.userId,
            code: saved.code,
        });
        this.logger.log(`Payment link created: ${saved.linkId} - ${saved.code}`);
        return saved;
    }
    async getPaymentLinkByCode(code) {
        const link = await this.paymentLinkRepository.findOne({
            where: { code },
        });
        if (!link) {
            throw new common_1.NotFoundException('Payment link not found');
        }
        if (link.expiresAt && new Date() > link.expiresAt) {
            link.status = 'expired';
            await this.paymentLinkRepository.save(link);
            throw new common_1.BadRequestException('Payment link has expired');
        }
        if (link.maxPayments && link.paymentCount >= link.maxPayments) {
            link.status = 'completed';
            await this.paymentLinkRepository.save(link);
            throw new common_1.BadRequestException('Payment link has reached maximum payments');
        }
        link.viewCount += 1;
        await this.paymentLinkRepository.save(link);
        return link;
    }
    async recordPayment(linkId, amount) {
        const link = await this.paymentLinkRepository.findOne({
            where: { linkId },
        });
        if (!link) {
            throw new common_1.NotFoundException('Payment link not found');
        }
        link.paymentCount += 1;
        link.totalCollected = new decimal_js_1.default(link.totalCollected).plus(amount).toString();
        link.lastPaymentAt = new Date();
        if (link.maxPayments && link.paymentCount >= link.maxPayments) {
            link.status = 'completed';
            link.active = false;
        }
        const saved = await this.paymentLinkRepository.save(link);
        this.eventEmitter.emit('payment_link.payment_received', {
            linkId: link.linkId,
            amount,
            paymentCount: link.paymentCount,
        });
        return saved;
    }
    async getPaymentLink(linkId) {
        const link = await this.paymentLinkRepository.findOne({
            where: { linkId },
        });
        if (!link) {
            throw new common_1.NotFoundException('Payment link not found');
        }
        return link;
    }
    async getUserPaymentLinks(userId) {
        return this.paymentLinkRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async updatePaymentLink(linkId, updates) {
        const link = await this.getPaymentLink(linkId);
        Object.assign(link, updates);
        return this.paymentLinkRepository.save(link);
    }
    async deactivatePaymentLink(linkId) {
        const link = await this.getPaymentLink(linkId);
        link.active = false;
        link.status = 'inactive';
        return this.paymentLinkRepository.save(link);
    }
    async activatePaymentLink(linkId) {
        const link = await this.getPaymentLink(linkId);
        link.active = true;
        link.status = 'active';
        return this.paymentLinkRepository.save(link);
    }
    generateCode() {
        return crypto.randomBytes(6).toString('hex');
    }
};
exports.PaymentLinksService = PaymentLinksService;
exports.PaymentLinksService = PaymentLinksService = PaymentLinksService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_link_entity_1.PaymentLinkEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _b : Object])
], PaymentLinksService);
//# sourceMappingURL=payment-links.service.js.map