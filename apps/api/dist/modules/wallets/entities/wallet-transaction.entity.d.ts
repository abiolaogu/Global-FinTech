export declare class WalletTransactionEntity {
    transactionId: string;
    walletId: string;
    userId: string;
    type: string;
    category: string;
    amount: string;
    currency: string;
    balanceBefore: string;
    balanceAfter: string;
    status: string;
    description: string;
    counterpartyWalletId: string;
    counterpartyUserId: string;
    externalTransactionId: string;
    referenceId: string;
    metadata: Record<string, any>;
    paymentMethod: string;
    paymentGateway: string;
    completedAt: Date;
    failedAt: Date;
    failureReason: string;
    errorCode: string;
    reversedAt: Date;
    reversalTransactionId: string;
    createdAt: Date;
    updatedAt: Date;
}
