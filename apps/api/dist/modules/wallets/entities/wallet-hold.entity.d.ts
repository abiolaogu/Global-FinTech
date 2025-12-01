export declare class WalletHoldEntity {
    holdId: string;
    walletId: string;
    userId: string;
    amount: string;
    currency: string;
    status: string;
    reason: string;
    description: string;
    referenceTransactionId: string;
    expiresAt: Date;
    metadata: Record<string, any>;
    releasedAt: Date;
    capturedAt: Date;
    capturedTransactionId: string;
    createdAt: Date;
    updatedAt: Date;
}
