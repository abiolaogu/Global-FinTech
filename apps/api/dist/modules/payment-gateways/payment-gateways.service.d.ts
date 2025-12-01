import { Repository, DataSource } from 'typeorm';
import { PaymentGatewayEntity } from './entities/payment-gateway.entity';
import { PaymentTransactionEntity } from './entities/payment-transaction.entity';
import { WalletsService } from '../wallets/wallets.service';
import { SplitPaymentsService } from '../split-payments/split-payments.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
export interface InitiatePaymentDto {
    userId?: string;
    merchantId?: string;
    amount: string;
    currency: string;
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
}
export interface VerifyPaymentDto {
    reference: string;
    provider: string;
}
export declare class PaymentGatewaysService {
    private readonly gatewayRepository;
    private readonly transactionRepository;
    private readonly walletsService;
    private readonly splitPaymentsService;
    private readonly dataSource;
    private readonly eventEmitter;
    private readonly logger;
    private readonly providerConfigs;
    constructor(gatewayRepository: Repository<PaymentGatewayEntity>, transactionRepository: Repository<PaymentTransactionEntity>, walletsService: WalletsService, splitPaymentsService: SplitPaymentsService, dataSource: DataSource, eventEmitter: EventEmitter2);
    initiatePayment(dto: InitiatePaymentDto, provider: string): Promise<PaymentTransactionEntity>;
    private initializePaymentWithPaystack;
    private initializePaymentWithFlutterwave;
    private initializePaymentWithStripe;
    private initializePaymentWithProvider;
    verifyPayment(dto: VerifyPaymentDto): Promise<PaymentTransactionEntity>;
    private verifyPaymentWithPaystack;
    private verifyPaymentWithFlutterwave;
    private verifyPaymentWithProvider;
    private selectGateway;
    private createPlatformGateway;
    private calculateFee;
    private generateReference;
    private encryptCredentials;
    getTransaction(transactionId: string): Promise<PaymentTransactionEntity>;
    getUserTransactions(userId: string, limit?: number, offset?: number): Promise<PaymentTransactionEntity[]>;
}
