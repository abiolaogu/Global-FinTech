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
var SubscriptionsService_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubscriptionsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const subscription_entity_1 = require("./entities/subscription.entity");
const user_entity_1 = require("../users/entities/user.entity");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const decimal_js_1 = require("decimal.js");
let SubscriptionsService = SubscriptionsService_1 = class SubscriptionsService {
    constructor(subscriptionRepository, userRepository, eventEmitter) {
        this.subscriptionRepository = subscriptionRepository;
        this.userRepository = userRepository;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(SubscriptionsService_1.name);
        this.pricing = {
            silver: { monthly: 9.99, yearly: 99.99 },
            gold: { monthly: 19.99, yearly: 199.99 },
            platinum: { monthly: 49.99, yearly: 499.99 },
        };
        this.benefits = {
            free: {
                fxFeeRate: 0.015,
                withdrawalFeeFixed: 2.0,
                dailyWithdrawalLimit: 500,
                monthlyWithdrawalLimit: 5000,
                freeWithdrawalsPerMonth: 0,
                tradingFeeRate: 0.002,
                prioritySupport: false,
                cryptoAccess: false,
                rewardPointsMultiplier: 1,
            },
            silver: {
                fxFeeRate: 0.01,
                withdrawalFeeFixed: 1.0,
                dailyWithdrawalLimit: 2000,
                monthlyWithdrawalLimit: 20000,
                freeWithdrawalsPerMonth: 3,
                tradingFeeRate: 0.0015,
                prioritySupport: false,
                cryptoAccess: true,
                rewardPointsMultiplier: 1.5,
            },
            gold: {
                fxFeeRate: 0.005,
                withdrawalFeeFixed: 0,
                dailyWithdrawalLimit: 10000,
                monthlyWithdrawalLimit: 100000,
                freeWithdrawalsPerMonth: 10,
                tradingFeeRate: 0.001,
                prioritySupport: true,
                cryptoAccess: true,
                rewardPointsMultiplier: 2,
            },
            platinum: {
                fxFeeRate: 0,
                withdrawalFeeFixed: 0,
                dailyWithdrawalLimit: 50000,
                monthlyWithdrawalLimit: 500000,
                freeWithdrawalsPerMonth: -1,
                tradingFeeRate: 0.0005,
                prioritySupport: true,
                cryptoAccess: true,
                rewardPointsMultiplier: 3,
            },
        };
    }
    async createSubscription(dto) {
        this.logger.log(`Creating ${dto.tier} subscription for user ${dto.userId}`);
        const existingSubscription = await this.subscriptionRepository.findOne({
            where: {
                userId: dto.userId,
                status: 'active',
            },
        });
        if (existingSubscription) {
            throw new common_1.BadRequestException('User already has an active subscription');
        }
        const amount = this.pricing[dto.tier][dto.billingCycle];
        const nextBillingDate = this.calculateNextBillingDate(dto.billingCycle);
        const subscription = this.subscriptionRepository.create({
            userId: dto.userId,
            tier: dto.tier,
            billingCycle: dto.billingCycle,
            status: 'active',
            amount: amount.toString(),
            currency: 'USD',
            nextBillingDate,
            paymentMethodId: dto.paymentMethodId,
        });
        const savedSubscription = await this.subscriptionRepository.save(subscription);
        await this.userRepository.update({ userId: dto.userId }, { tier: dto.tier });
        this.eventEmitter.emit('subscription.created', {
            userId: dto.userId,
            subscriptionId: savedSubscription.subscriptionId,
            tier: dto.tier,
            amount,
        });
        this.logger.log(`Subscription created: ${savedSubscription.subscriptionId}`);
        return savedSubscription;
    }
    async cancelSubscription(subscriptionId, userId) {
        const subscription = await this.subscriptionRepository.findOne({
            where: { subscriptionId, userId },
        });
        if (!subscription) {
            throw new common_1.BadRequestException('Subscription not found');
        }
        if (subscription.status === 'cancelled') {
            throw new common_1.BadRequestException('Subscription already cancelled');
        }
        subscription.status = 'cancelled';
        subscription.cancelledAt = new Date();
        const updatedSubscription = await this.subscriptionRepository.save(subscription);
        await this.userRepository.update({ userId }, { tier: 'free' });
        this.eventEmitter.emit('subscription.cancelled', {
            userId,
            subscriptionId,
            tier: subscription.tier,
        });
        this.logger.log(`Subscription cancelled: ${subscriptionId}`);
        return updatedSubscription;
    }
    async upgradeSubscription(subscriptionId, userId, newTier) {
        const subscription = await this.subscriptionRepository.findOne({
            where: { subscriptionId, userId },
        });
        if (!subscription) {
            throw new common_1.BadRequestException('Subscription not found');
        }
        const tierLevels = { silver: 1, gold: 2, platinum: 3 };
        const currentLevel = tierLevels[subscription.tier];
        const newLevel = tierLevels[newTier];
        if (newLevel <= currentLevel) {
            throw new common_1.BadRequestException('Can only upgrade to a higher tier');
        }
        const oldAmount = new decimal_js_1.default(subscription.amount);
        const newAmount = new decimal_js_1.default(this.pricing[newTier][subscription.billingCycle]);
        const daysRemaining = this.calculateDaysRemaining(subscription.nextBillingDate);
        const totalDays = subscription.billingCycle === 'monthly' ? 30 : 365;
        const proratedCredit = oldAmount.times(daysRemaining).dividedBy(totalDays);
        const chargeAmount = newAmount.minus(proratedCredit);
        subscription.tier = newTier;
        subscription.amount = newAmount.toString();
        const updatedSubscription = await this.subscriptionRepository.save(subscription);
        await this.userRepository.update({ userId }, { tier: newTier });
        this.eventEmitter.emit('subscription.upgraded', {
            userId,
            subscriptionId,
            oldTier: subscription.tier,
            newTier,
            chargeAmount: chargeAmount.toString(),
        });
        this.logger.log(`Subscription upgraded: ${subscriptionId} to ${newTier}`);
        return updatedSubscription;
    }
    async getUserSubscription(userId) {
        return this.subscriptionRepository.findOne({
            where: { userId, status: 'active' },
        });
    }
    getTierBenefits(tier) {
        return this.benefits[tier];
    }
    async processRecurringBilling() {
        this.logger.log('Processing recurring billing');
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const dueSubscriptions = await this.subscriptionRepository.find({
            where: {
                status: 'active',
                nextBillingDate: { $lte: today },
            },
        });
        for (const subscription of dueSubscriptions) {
            try {
                await this.chargeSubs;
                cription(subscription);
            }
            catch (error) {
                this.logger.error(`Failed to charge subscription ${subscription.subscriptionId}: ${error.message}`);
            }
        }
        this.logger.log(`Processed ${dueSubscriptions.length} subscriptions`);
    }
    async chargeSubscription(subscription) {
        this.logger.log(`Charging subscription: ${subscription.subscriptionId}`);
        this.eventEmitter.emit('subscription.charge_due', {
            subscriptionId: subscription.subscriptionId,
            userId: subscription.userId,
            amount: subscription.amount,
            currency: subscription.currency,
            paymentMethodId: subscription.paymentMethodId,
        });
        subscription.nextBillingDate = this.calculateNextBillingDate(subscription.billingCycle);
        await this.subscriptionRepository.save(subscription);
    }
    async handleFailedPayment(subscriptionId) {
        const subscription = await this.subscriptionRepository.findOne({
            where: { subscriptionId },
        });
        if (!subscription) {
            return;
        }
        subscription.status = 'past_due';
        await this.subscriptionRepository.save(subscription);
        this.eventEmitter.emit('subscription.payment_failed', {
            subscriptionId,
            userId: subscription.userId,
        });
        this.logger.log(`Subscription payment failed: ${subscriptionId}`);
    }
    async handleSuccessfulPayment(subscriptionId) {
        const subscription = await this.subscriptionRepository.findOne({
            where: { subscriptionId },
        });
        if (!subscription) {
            return;
        }
        if (subscription.status === 'past_due') {
            subscription.status = 'active';
            await this.subscriptionRepository.save(subscription);
            this.logger.log(`Subscription reactivated: ${subscriptionId}`);
        }
    }
    calculateNextBillingDate(billingCycle) {
        const date = new Date();
        if (billingCycle === 'monthly') {
            date.setMonth(date.getMonth() + 1);
        }
        else {
            date.setFullYear(date.getFullYear() + 1);
        }
        return date;
    }
    calculateDaysRemaining(nextBillingDate) {
        const now = new Date();
        const diff = nextBillingDate.getTime() - now.getTime();
        return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
    }
};
exports.SubscriptionsService = SubscriptionsService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_2AM),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], SubscriptionsService.prototype, "processRecurringBilling", null);
exports.SubscriptionsService = SubscriptionsService = SubscriptionsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(subscription_entity_1.SubscriptionEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _c : Object])
], SubscriptionsService);
//# sourceMappingURL=subscriptions.service.js.map