import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SubscriptionEntity } from './entities/subscription.entity';
import { UserEntity } from '../users/entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import Decimal from 'decimal.js';

export interface CreateSubscriptionDto {
  userId: string;
  tier: 'silver' | 'gold' | 'platinum';
  billingCycle: 'monthly' | 'yearly';
  paymentMethodId: string;
}

@Injectable()
export class SubscriptionsService {
  private readonly logger = new Logger(SubscriptionsService.name);

  // Subscription pricing (USD)
  private readonly pricing = {
    silver: { monthly: 9.99, yearly: 99.99 },
    gold: { monthly: 19.99, yearly: 199.99 },
    platinum: { monthly: 49.99, yearly: 499.99 },
  };

  // Tier benefits
  private readonly benefits = {
    free: {
      fxFeeRate: 0.015, // 1.5%
      withdrawalFeeFixed: 2.0,
      dailyWithdrawalLimit: 500,
      monthlyWithdrawalLimit: 5000,
      freeWithdrawalsPerMonth: 0,
      tradingFeeRate: 0.002, // 0.2%
      prioritySupport: false,
      cryptoAccess: false,
      rewardPointsMultiplier: 1,
    },
    silver: {
      fxFeeRate: 0.01, // 1.0%
      withdrawalFeeFixed: 1.0,
      dailyWithdrawalLimit: 2000,
      monthlyWithdrawalLimit: 20000,
      freeWithdrawalsPerMonth: 3,
      tradingFeeRate: 0.0015, // 0.15%
      prioritySupport: false,
      cryptoAccess: true,
      rewardPointsMultiplier: 1.5,
    },
    gold: {
      fxFeeRate: 0.005, // 0.5%
      withdrawalFeeFixed: 0,
      dailyWithdrawalLimit: 10000,
      monthlyWithdrawalLimit: 100000,
      freeWithdrawalsPerMonth: 10,
      tradingFeeRate: 0.001, // 0.1%
      prioritySupport: true,
      cryptoAccess: true,
      rewardPointsMultiplier: 2,
    },
    platinum: {
      fxFeeRate: 0, // 0%
      withdrawalFeeFixed: 0,
      dailyWithdrawalLimit: 50000,
      monthlyWithdrawalLimit: 500000,
      freeWithdrawalsPerMonth: -1, // Unlimited
      tradingFeeRate: 0.0005, // 0.05%
      prioritySupport: true,
      cryptoAccess: true,
      rewardPointsMultiplier: 3,
    },
  };

  constructor(
    @InjectRepository(SubscriptionEntity)
    private readonly subscriptionRepository: Repository<SubscriptionEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new subscription
   */
  async createSubscription(dto: CreateSubscriptionDto): Promise<SubscriptionEntity> {
    this.logger.log(`Creating ${dto.tier} subscription for user ${dto.userId}`);

    // Check if user already has an active subscription
    const existingSubscription = await this.subscriptionRepository.findOne({
      where: {
        userId: dto.userId,
        status: 'active' as any,
      },
    });

    if (existingSubscription) {
      throw new BadRequestException('User already has an active subscription');
    }

    // Calculate pricing
    const amount = this.pricing[dto.tier][dto.billingCycle];
    const nextBillingDate = this.calculateNextBillingDate(dto.billingCycle);

    // Create subscription
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

    // Update user tier
    await this.userRepository.update(
      { userId: dto.userId },
      { tier: dto.tier as any },
    );

    this.eventEmitter.emit('subscription.created', {
      userId: dto.userId,
      subscriptionId: savedSubscription.subscriptionId,
      tier: dto.tier,
      amount,
    });

    this.logger.log(`Subscription created: ${savedSubscription.subscriptionId}`);

    return savedSubscription;
  }

  /**
   * Cancel subscription
   */
  async cancelSubscription(subscriptionId: string, userId: string): Promise<SubscriptionEntity> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { subscriptionId, userId },
    });

    if (!subscription) {
      throw new BadRequestException('Subscription not found');
    }

    if (subscription.status === 'cancelled') {
      throw new BadRequestException('Subscription already cancelled');
    }

    subscription.status = 'cancelled';
    subscription.cancelledAt = new Date();

    const updatedSubscription = await this.subscriptionRepository.save(subscription);

    // Downgrade user to free tier
    await this.userRepository.update(
      { userId },
      { tier: 'free' as any },
    );

    this.eventEmitter.emit('subscription.cancelled', {
      userId,
      subscriptionId,
      tier: subscription.tier,
    });

    this.logger.log(`Subscription cancelled: ${subscriptionId}`);

    return updatedSubscription;
  }

  /**
   * Upgrade subscription
   */
  async upgradeSubscription(
    subscriptionId: string,
    userId: string,
    newTier: 'silver' | 'gold' | 'platinum',
  ): Promise<SubscriptionEntity> {
    const subscription = await this.subscriptionRepository.findOne({
      where: { subscriptionId, userId },
    });

    if (!subscription) {
      throw new BadRequestException('Subscription not found');
    }

    const tierLevels = { silver: 1, gold: 2, platinum: 3 };
    const currentLevel = tierLevels[subscription.tier];
    const newLevel = tierLevels[newTier];

    if (newLevel <= currentLevel) {
      throw new BadRequestException('Can only upgrade to a higher tier');
    }

    // Calculate prorated refund and new charge
    const oldAmount = new Decimal(subscription.amount);
    const newAmount = new Decimal(this.pricing[newTier][subscription.billingCycle]);
    const daysRemaining = this.calculateDaysRemaining(subscription.nextBillingDate);
    const totalDays = subscription.billingCycle === 'monthly' ? 30 : 365;
    const proratedCredit = oldAmount.times(daysRemaining).dividedBy(totalDays);
    const chargeAmount = newAmount.minus(proratedCredit);

    subscription.tier = newTier;
    subscription.amount = newAmount.toString();

    const updatedSubscription = await this.subscriptionRepository.save(subscription);

    // Update user tier
    await this.userRepository.update(
      { userId },
      { tier: newTier as any },
    );

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

  /**
   * Get subscription for user
   */
  async getUserSubscription(userId: string): Promise<SubscriptionEntity | null> {
    return this.subscriptionRepository.findOne({
      where: { userId, status: 'active' as any },
    });
  }

  /**
   * Get tier benefits
   */
  getTierBenefits(tier: 'free' | 'silver' | 'gold' | 'platinum') {
    return this.benefits[tier];
  }

  /**
   * Process recurring billing (scheduled job)
   */
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async processRecurringBilling(): Promise<void> {
    this.logger.log('Processing recurring billing');

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueSubscriptions = await this.subscriptionRepository.find({
      where: {
        status: 'active' as any,
        nextBillingDate: { $lte: today } as any,
      },
    });

    for (const subscription of dueSubscriptions) {
      try {
        await this.chargeSubs cription(subscription);
      } catch (error) {
        this.logger.error(
          `Failed to charge subscription ${subscription.subscriptionId}: ${error.message}`,
        );
      }
    }

    this.logger.log(`Processed ${dueSubscriptions.length} subscriptions`);
  }

  /**
   * Charge subscription
   */
  private async chargeSubscription(subscription: SubscriptionEntity): Promise<void> {
    this.logger.log(`Charging subscription: ${subscription.subscriptionId}`);

    // Emit event for payment processing
    this.eventEmitter.emit('subscription.charge_due', {
      subscriptionId: subscription.subscriptionId,
      userId: subscription.userId,
      amount: subscription.amount,
      currency: subscription.currency,
      paymentMethodId: subscription.paymentMethodId,
    });

    // Update next billing date
    subscription.nextBillingDate = this.calculateNextBillingDate(subscription.billingCycle);
    await this.subscriptionRepository.save(subscription);
  }

  /**
   * Handle failed payment
   */
  async handleFailedPayment(subscriptionId: string): Promise<void> {
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

  /**
   * Handle successful payment
   */
  async handleSuccessfulPayment(subscriptionId: string): Promise<void> {
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

  // Helper methods

  private calculateNextBillingDate(billingCycle: 'monthly' | 'yearly'): Date {
    const date = new Date();

    if (billingCycle === 'monthly') {
      date.setMonth(date.getMonth() + 1);
    } else {
      date.setFullYear(date.getFullYear() + 1);
    }

    return date;
  }

  private calculateDaysRemaining(nextBillingDate: Date): number {
    const now = new Date();
    const diff = nextBillingDate.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }
}
