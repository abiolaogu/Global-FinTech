import { InvestmentOpportunityEntity } from './investment-opportunity.entity';
export declare enum TransactionType {
    BUY = "buy",
    SELL = "sell",
    DIVIDEND = "dividend",
    FEE = "fee",
    TRANSFER_IN = "transfer_in",
    TRANSFER_OUT = "transfer_out"
}
export declare enum TransactionStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled",
    REFUNDED = "refunded"
}
export declare class InvestmentTransactionEntity {
    transactionId: string;
    userId: string;
    opportunityId: string;
    opportunity: InvestmentOpportunityEntity;
    portfolioId: string;
    type: TransactionType;
    status: TransactionStatus;
    shares: string;
    pricePerShare: string;
    amount: string;
    currency: string;
    entryFee: string;
    exitFee: string;
    managementFee: string;
    performanceFee: string;
    totalFees: string;
    netAmount: string;
    paymentMethod: string;
    paymentReference: string;
    walletTransactionId: string;
    settledAt: Date;
    settlementReference: string;
    taxWithheld: string;
    taxYear: string;
    isTaxable: boolean;
    dividendDate: Date;
    dividendRate: string;
    dividendReinvested: boolean;
    description: string;
    metadata: any;
    failureReason: string;
    processedAt: Date;
    completedAt: Date;
    failedAt: Date;
    cancelledAt: Date;
    createdAt: Date;
    updatedAt: Date;
}
