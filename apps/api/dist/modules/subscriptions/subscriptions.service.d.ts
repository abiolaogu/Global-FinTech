import { Repository } from 'typeorm';
import { SubscriptionEntity } from './entities/subscription.entity';
import { UserEntity } from '../users/entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
export interface CreateSubscriptionDto {
    userId: string;
    tier: 'silver' | 'gold' | 'platinum';
    billingCycle: 'monthly' | 'yearly';
    paymentMethodId: string;
}
export declare class SubscriptionsService {
    private readonly subscriptionRepository;
    private readonly userRepository;
    private readonly eventEmitter;
    private readonly logger;
    private readonly pricing;
    private readonly benefits;
    constructor(subscriptionRepository: Repository<SubscriptionEntity>, userRepository: Repository<UserEntity>, eventEmitter: EventEmitter2);
    createSubscription(dto: CreateSubscriptionDto): Promise<SubscriptionEntity>;
    cancelSubscription(subscriptionId: string, userId: string): Promise<SubscriptionEntity>;
    upgradeSubscription(subscriptionId: string, userId: string, newTier: 'silver' | 'gold' | 'platinum'): Promise<SubscriptionEntity>;
    getUserSubscription(userId: string): Promise<SubscriptionEntity | null>;
    getTierBenefits(tier: 'free' | 'silver' | 'gold' | 'platinum'): {
        fxFeeRate: number;
        withdrawalFeeFixed: number;
        dailyWithdrawalLimit: number;
        monthlyWithdrawalLimit: number;
        freeWithdrawalsPerMonth: number;
        tradingFeeRate: number;
        prioritySupport: boolean;
        cryptoAccess: boolean;
        rewardPointsMultiplier: number;
    } | {
        fxFeeRate: number;
        withdrawalFeeFixed: number;
        dailyWithdrawalLimit: number;
        monthlyWithdrawalLimit: number;
        freeWithdrawalsPerMonth: number;
        tradingFeeRate: number;
        prioritySupport: boolean;
        cryptoAccess: boolean;
        rewardPointsMultiplier: number;
    } | {
        fxFeeRate: number;
        withdrawalFeeFixed: number;
        dailyWithdrawalLimit: number;
        monthlyWithdrawalLimit: number;
        freeWithdrawalsPerMonth: number;
        tradingFeeRate: number;
        prioritySupport: boolean;
        cryptoAccess: boolean;
        rewardPointsMultiplier: number;
    } | {
        fxFeeRate: number;
        withdrawalFeeFixed: number;
        dailyWithdrawalLimit: number;
        monthlyWithdrawalLimit: number;
        freeWithdrawalsPerMonth: number;
        tradingFeeRate: number;
        prioritySupport: boolean;
        cryptoAccess: boolean;
        rewardPointsMultiplier: number;
    };
    processRecurringBilling(): Promise<void>;
    private chargeSubscription;
    handleFailedPayment(subscriptionId: string): Promise<void>;
    handleSuccessfulPayment(subscriptionId: string): Promise<void>;
    private calculateNextBillingDate;
    private calculateDaysRemaining;
}
