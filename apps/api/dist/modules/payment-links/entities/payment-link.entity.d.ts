export declare class PaymentLinkEntity {
    linkId: string;
    userId: string;
    code: string;
    title: string;
    description: string;
    amountType: string;
    amount: string;
    currency: string;
    active: boolean;
    status: string;
    allowedPaymentMethods: string[];
    redirectUrl: string;
    collectCustomerInfo: boolean;
    customFields: Array<{
        name: string;
        label: string;
        type: 'text' | 'email' | 'phone' | 'number' | 'select';
        required: boolean;
        options?: string[];
    }>;
    logoUrl: string;
    brandColor: string;
    maxPayments: number;
    paymentCount: number;
    totalCollected: string;
    expiresAt: Date;
    splitConfigurationId: string;
    metadata: Record<string, any>;
    lastPaymentAt: Date;
    viewCount: number;
    createdAt: Date;
    updatedAt: Date;
}
