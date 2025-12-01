import { SplitPaymentsService } from './split-payments.service';
export declare class SplitPaymentsController {
    private readonly splitPaymentsService;
    constructor(splitPaymentsService: SplitPaymentsService);
    processSplitPayment(dto: {
        paymentId: string;
        userId: string;
        totalAmount: string;
        currency: string;
        splitRules: Array<any>;
        platformFee?: string;
        description?: string;
        metadata?: Record<string, any>;
    }): Promise<import("./entities/split-payment.entity").SplitPaymentEntity>;
    createConfiguration(dto: {
        userId: string;
        name: string;
        description?: string;
        splitType: 'percentage' | 'fixed' | 'hybrid';
        splitRules: Array<any>;
        isDefault?: boolean;
        conditions?: any;
    }): Promise<import("./entities/split-configuration.entity").SplitConfigurationEntity>;
    applySplitConfiguration(configurationId: string, dto: {
        paymentId: string;
        userId: string;
        totalAmount: string;
        currency: string;
    }): Promise<import("./entities/split-payment.entity").SplitPaymentEntity>;
    getSplitPayment(splitPaymentId: string): Promise<import("./entities/split-payment.entity").SplitPaymentEntity>;
    getPaymentSplits(paymentId: string): Promise<import("./entities/split-payment.entity").SplitPaymentEntity[]>;
    getUserConfigurations(userId: string): Promise<import("./entities/split-configuration.entity").SplitConfigurationEntity[]>;
}
