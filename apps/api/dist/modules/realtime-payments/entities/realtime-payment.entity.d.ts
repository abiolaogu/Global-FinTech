export declare class RealtimePaymentEntity {
    paymentId: string;
    senderUserId: string;
    receiverUserId: string;
    railType: 'upi' | 'pix' | 'fednow' | 'sepa_instant' | 'faster_payments' | 'ach_realtime';
    connectionId: string;
    amount: string;
    currency: string;
    description: string | null;
    reference: string | null;
    externalTransactionId: string | null;
    senderRailId: string | null;
    receiverRailId: string | null;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'reversed';
    errorCode: string | null;
    errorMessage: string | null;
    feeAmount: string;
    initiatedAt: Date | null;
    completedAt: Date | null;
    failedAt: Date | null;
    processingTimeMs: number | null;
    metadata: any;
    createdAt: Date;
    updatedAt: Date;
}
