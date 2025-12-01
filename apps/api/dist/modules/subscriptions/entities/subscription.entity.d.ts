export declare class SubscriptionEntity {
    subscriptionId: string;
    userId: string;
    tier: 'silver' | 'gold' | 'platinum';
    billingCycle: 'monthly' | 'yearly';
    status: 'active' | 'cancelled' | 'past_due';
    amount: string;
    currency: string;
    nextBillingDate: Date;
    paymentMethodId: string;
    cancelledAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
