import { RealtimePaymentsService, InitiatePaymentDto, RegisterRailConnectionDto } from './realtime-payments.service';
export declare class RealtimePaymentsController {
    private readonly realtimePaymentsService;
    constructor(realtimePaymentsService: RealtimePaymentsService);
    registerConnection(dto: RegisterRailConnectionDto): Promise<import("./entities/payment-rail-connection.entity").PaymentRailConnectionEntity>;
    testConnection(connectionId: string): Promise<{
        connectionId: string;
        healthy: boolean;
        message: string;
    }>;
    initiatePayment(dto: InitiatePaymentDto): Promise<import("./entities/realtime-payment.entity").RealtimePaymentEntity>;
    getPayment(paymentId: string): Promise<import("./entities/realtime-payment.entity").RealtimePaymentEntity>;
    getUserPayments(userId: string, type?: 'sent' | 'received' | 'all', limit?: string): Promise<import("./entities/realtime-payment.entity").RealtimePaymentEntity[]>;
    getStats(railType?: string, startDate?: string, endDate?: string): Promise<{
        totalPayments: number;
        totalVolume: string;
        successRate: number;
        avgProcessingTimeMs: number;
    }>;
}
