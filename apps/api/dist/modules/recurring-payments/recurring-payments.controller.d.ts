import { RecurringPaymentsService } from './recurring-payments.service';
export declare class RecurringPaymentsController {
    private readonly recurringPaymentsService;
    constructor(recurringPaymentsService: RecurringPaymentsService);
    createRecurringPayment(dto: {
        userId: string;
        merchantId: string;
        name: string;
        description?: string;
        amount: string;
        currency: string;
        frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
        startDate: Date;
        endDate?: Date;
        maxPayments?: number;
        paymentMethod: string;
        paymentMethodToken: string;
        gatewayId: string;
        provider: string;
        authorizationCode?: string;
        metadata?: Record<string, any>;
    }): Promise<import("./entities/recurring-payment.entity").RecurringPaymentEntity>;
    getRecurringPayment(recurringPaymentId: string): Promise<import("./entities/recurring-payment.entity").RecurringPaymentEntity>;
    getUserRecurringPayments(userId: string): Promise<import("./entities/recurring-payment.entity").RecurringPaymentEntity[]>;
    getMerchantRecurringPayments(merchantId: string): Promise<import("./entities/recurring-payment.entity").RecurringPaymentEntity[]>;
    pauseRecurringPayment(recurringPaymentId: string): Promise<import("./entities/recurring-payment.entity").RecurringPaymentEntity>;
    resumeRecurringPayment(recurringPaymentId: string): Promise<import("./entities/recurring-payment.entity").RecurringPaymentEntity>;
    cancelRecurringPayment(recurringPaymentId: string, dto: {
        reason?: string;
    }): Promise<import("./entities/recurring-payment.entity").RecurringPaymentEntity>;
}
