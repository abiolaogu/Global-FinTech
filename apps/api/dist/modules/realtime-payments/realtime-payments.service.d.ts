import { Repository, DataSource } from 'typeorm';
import { RealtimePaymentEntity } from './entities/realtime-payment.entity';
import { PaymentRailConnectionEntity } from './entities/payment-rail-connection.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
export interface InitiatePaymentDto {
    senderUserId: string;
    receiverUserId: string;
    amount: string;
    currency: string;
    railType: 'upi' | 'pix' | 'fednow' | 'sepa_instant' | 'faster_payments' | 'ach_realtime';
    description?: string;
    reference?: string;
    senderRailId: string;
    receiverRailId: string;
}
export interface RegisterRailConnectionDto {
    partnerId?: string;
    railType: 'upi' | 'pix' | 'fednow' | 'sepa_instant' | 'faster_payments' | 'ach_realtime';
    country: string;
    credentials: {
        apiKey?: string;
        apiSecret?: string;
        merchantId?: string;
        certificatePath?: string;
        [key: string]: any;
    };
    configuration?: any;
    isLive: boolean;
}
export declare class RealtimePaymentsService {
    private readonly paymentRepository;
    private readonly connectionRepository;
    private readonly dataSource;
    private readonly eventEmitter;
    private readonly logger;
    private readonly feeConfig;
    constructor(paymentRepository: Repository<RealtimePaymentEntity>, connectionRepository: Repository<PaymentRailConnectionEntity>, dataSource: DataSource, eventEmitter: EventEmitter2);
    registerRailConnection(dto: RegisterRailConnectionDto): Promise<PaymentRailConnectionEntity>;
    initiatePayment(dto: InitiatePaymentDto): Promise<RealtimePaymentEntity>;
    private processPaymentThroughRail;
    private processUpiPayment;
    private processPixPayment;
    private processFedNowPayment;
    private processSepaInstantPayment;
    private processFasterPayment;
    private processAchRealtimePayment;
    private buildIso20022Message;
    testConnection(connectionId: string): Promise<boolean>;
    getPayment(paymentId: string): Promise<RealtimePaymentEntity>;
    getUserPayments(userId: string, type?: 'sent' | 'received' | 'all', limit?: number): Promise<RealtimePaymentEntity[]>;
    getPaymentStats(railType?: string, startDate?: Date, endDate?: Date): Promise<{
        totalPayments: number;
        totalVolume: string;
        successRate: number;
        avgProcessingTimeMs: number;
    }>;
    private calculateFee;
    private getRailInfo;
    private encryptCredentials;
    private decryptCredentials;
}
