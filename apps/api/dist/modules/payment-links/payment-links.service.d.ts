import { Repository } from 'typeorm';
import { PaymentLinkEntity } from './entities/payment-link.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
export interface CreatePaymentLinkDto {
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
}
export declare class PaymentLinksService {
    private readonly paymentLinkRepository;
    private readonly eventEmitter;
    private readonly logger;
    constructor(paymentLinkRepository: Repository<PaymentLinkEntity>, eventEmitter: EventEmitter2);
    createPaymentLink(dto: CreatePaymentLinkDto): Promise<PaymentLinkEntity>;
    getPaymentLinkByCode(code: string): Promise<PaymentLinkEntity>;
    recordPayment(linkId: string, amount: string): Promise<PaymentLinkEntity>;
    getPaymentLink(linkId: string): Promise<PaymentLinkEntity>;
    getUserPaymentLinks(userId: string): Promise<PaymentLinkEntity[]>;
    updatePaymentLink(linkId: string, updates: Partial<CreatePaymentLinkDto>): Promise<PaymentLinkEntity>;
    deactivatePaymentLink(linkId: string): Promise<PaymentLinkEntity>;
    activatePaymentLink(linkId: string): Promise<PaymentLinkEntity>;
    private generateCode;
}
