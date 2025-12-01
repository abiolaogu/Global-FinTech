import { Repository } from 'typeorm';
import { RecurringPaymentEntity } from './entities/recurring-payment.entity';
import { PaymentGatewaysService } from '../payment-gateways/payment-gateways.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
export interface CreateRecurringPaymentDto {
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
}
export declare class RecurringPaymentsService {
    private readonly recurringPaymentRepository;
    private readonly paymentGatewaysService;
    private readonly eventEmitter;
    private readonly logger;
    constructor(recurringPaymentRepository: Repository<RecurringPaymentEntity>, paymentGatewaysService: PaymentGatewaysService, eventEmitter: EventEmitter2);
    createRecurringPayment(dto: CreateRecurringPaymentDto): Promise<RecurringPaymentEntity>;
    processDuePayments(): Promise<number>;
    private processRecurringPayment;
    pauseRecurringPayment(recurringPaymentId: string): Promise<RecurringPaymentEntity>;
    resumeRecurringPayment(recurringPaymentId: string): Promise<RecurringPaymentEntity>;
    cancelRecurringPayment(recurringPaymentId: string, reason?: string): Promise<RecurringPaymentEntity>;
    getRecurringPayment(recurringPaymentId: string): Promise<RecurringPaymentEntity>;
    getUserRecurringPayments(userId: string): Promise<RecurringPaymentEntity[]>;
    getMerchantRecurringPayments(merchantId: string): Promise<RecurringPaymentEntity[]>;
    private calculateNextPaymentDate;
    private encryptPaymentMethod;
}
