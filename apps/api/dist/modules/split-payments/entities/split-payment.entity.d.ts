export declare class SplitPaymentEntity {
    splitPaymentId: string;
    paymentId: string;
    userId: string;
    totalAmount: string;
    currency: string;
    status: string;
    splitType: string;
    splitRules: Array<{
        recipientId: string;
        recipientType: 'user' | 'wallet' | 'merchant' | 'platform';
        splitType: 'percentage' | 'fixed';
        value: string;
        description?: string;
        metadata?: Record<string, any>;
    }>;
    actualSplits: Array<{
        recipientId: string;
        recipientType: string;
        amount: string;
        currency: string;
        status: 'pending' | 'completed' | 'failed';
        transactionId?: string;
        walletId?: string;
        failureReason?: string;
        completedAt?: Date;
    }>;
    platformFee: string;
    splitConfigurationId: string;
    metadata: Record<string, any>;
    description: string;
    completedAt: Date;
    failedAt: Date;
    failureReason: string;
    completedSplitsCount: number;
    failedSplitsCount: number;
    createdAt: Date;
    updatedAt: Date;
}
