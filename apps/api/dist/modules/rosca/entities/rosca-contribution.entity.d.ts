export declare class RoscaContributionEntity {
    contributionId: string;
    circleId: string;
    userId: string;
    cycleNumber: number;
    amount: string;
    currency: string;
    lateFee: string;
    status: 'pending' | 'paid' | 'late' | 'missed' | 'waived';
    dueDate: Date;
    paidDate: Date | null;
    daysLate: number | null;
    paymentMethod: string | null;
    transactionId: string | null;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
}
