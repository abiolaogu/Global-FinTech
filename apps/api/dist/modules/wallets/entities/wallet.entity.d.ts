export declare class WalletEntity {
    walletId: string;
    userId: string;
    currency: string;
    balance: string;
    availableBalance: string;
    pendingBalance: string;
    heldBalance: string;
    status: string;
    isPrimary: boolean;
    metadata: Record<string, any>;
    limits: {
        dailyTransactionLimit?: string;
        monthlyTransactionLimit?: string;
        singleTransactionLimit?: string;
        dailyWithdrawalLimit?: string;
    };
    lifetimeReceived: string;
    lifetimeSent: string;
    transactionCount: number;
    lastTransactionAt: Date;
    frozenAt: Date;
    frozenReason: string;
    createdAt: Date;
    updatedAt: Date;
}
