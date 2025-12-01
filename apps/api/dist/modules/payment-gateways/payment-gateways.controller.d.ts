import { PaymentGatewaysService } from './payment-gateways.service';
export declare class PaymentGatewaysController {
    private readonly paymentGatewaysService;
    constructor(paymentGatewaysService: PaymentGatewaysService);
    initiatePayment(dto: {
        userId?: string;
        merchantId?: string;
        amount: string;
        currency: string;
        provider: string;
        paymentMethod?: string;
        description?: string;
        customer?: {
            email: string;
            name?: string;
            phone?: string;
        };
        callbackUrl?: string;
        redirectUrl?: string;
        splitConfigurationId?: string;
        metadata?: Record<string, any>;
    }): Promise<import("./entities/payment-transaction.entity").PaymentTransactionEntity>;
    verifyPayment(dto: {
        reference: string;
        provider: string;
    }): Promise<import("./entities/payment-transaction.entity").PaymentTransactionEntity>;
    getTransaction(transactionId: string): Promise<import("./entities/payment-transaction.entity").PaymentTransactionEntity>;
    getUserTransactions(userId: string, limit?: number, offset?: number): Promise<import("./entities/payment-transaction.entity").PaymentTransactionEntity[]>;
}
