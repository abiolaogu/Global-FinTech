import { PaymentLinksService } from './payment-links.service';
export declare class PaymentLinksController {
    private readonly paymentLinksService;
    constructor(paymentLinksService: PaymentLinksService);
    createPaymentLink(dto: {
        userId: string;
        title: string;
        description?: string;
        amountType: 'fixed' | 'flexible' | 'minimum';
        amount?: string;
        currency: string;
        allowedPaymentMethods?: string[];
        redirectUrl?: string;
        collectCustomerInfo?: boolean;
        customFields?: Array<any>;
        logoUrl?: string;
        brandColor?: string;
        maxPayments?: number;
        expiresAt?: Date;
        splitConfigurationId?: string;
        metadata?: Record<string, any>;
    }): Promise<import("./entities/payment-link.entity").PaymentLinkEntity>;
    getPaymentLinkByCode(code: string): Promise<import("./entities/payment-link.entity").PaymentLinkEntity>;
    getPaymentLink(linkId: string): Promise<import("./entities/payment-link.entity").PaymentLinkEntity>;
    getUserPaymentLinks(userId: string): Promise<import("./entities/payment-link.entity").PaymentLinkEntity[]>;
    updatePaymentLink(linkId: string, updates: any): Promise<import("./entities/payment-link.entity").PaymentLinkEntity>;
    deactivatePaymentLink(linkId: string): Promise<import("./entities/payment-link.entity").PaymentLinkEntity>;
    activatePaymentLink(linkId: string): Promise<import("./entities/payment-link.entity").PaymentLinkEntity>;
    recordPayment(linkId: string, dto: {
        amount: string;
    }): Promise<import("./entities/payment-link.entity").PaymentLinkEntity>;
}
