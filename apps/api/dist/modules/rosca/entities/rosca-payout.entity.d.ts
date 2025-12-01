export declare class RoscaPayoutEntity {
    payoutId: string;
    circleId: string;
    recipientUserId: string;
    cycleNumber: number;
    amount: string;
    currency: string;
    organizerFee: string;
    platformFee: string;
    netAmount: string;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'reversed';
    scheduledDate: Date;
    processedDate: Date | null;
    paymentMethod: string | null;
    transactionId: string | null;
    errorMessage: string | null;
    contributionBreakdown: any;
    createdAt: Date;
    updatedAt: Date;
}
