export declare class VirtualAccountTransactionEntity {
    transactionId: string;
    virtualAccountId: string;
    userId: string;
    walletId: string;
    walletTransactionId: string;
    amount: string;
    currency: string;
    status: string;
    senderAccountNumber: string;
    senderAccountName: string;
    senderBankName: string;
    senderBankCode: string;
    reference: string;
    sessionId: string;
    narration: string;
    provider: string;
    providerTransactionId: string;
    providerData: Record<string, any>;
    fee: string;
    autoCredited: boolean;
    completedAt: Date;
    failedAt: Date;
    failureReason: string;
    reversedAt: Date;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
