import { Repository, DataSource } from 'typeorm';
import { VirtualAccountEntity } from './entities/virtual-account.entity';
import { VirtualAccountTransactionEntity } from './entities/virtual-account-transaction.entity';
import { WalletsService } from '../wallets/wallets.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
export interface CreateVirtualAccountDto {
    userId: string;
    walletId?: string;
    currency: string;
    country: string;
    provider: 'paystack' | 'flutterwave' | 'woven' | 'budpay' | 'monnify' | 'korapay';
    accountType?: 'dedicated' | 'dynamic' | 'pooled';
    accountName?: string;
    autoCredit?: boolean;
    metadata?: Record<string, any>;
}
export interface ProcessVirtualAccountPaymentDto {
    virtualAccountId: string;
    amount: string;
    currency: string;
    senderAccountNumber?: string;
    senderAccountName?: string;
    senderBankName?: string;
    senderBankCode?: string;
    reference?: string;
    sessionId?: string;
    narration?: string;
    providerTransactionId?: string;
    providerData?: Record<string, any>;
    fee?: string;
}
export declare class VirtualAccountsService {
    private readonly virtualAccountRepository;
    private readonly transactionRepository;
    private readonly walletsService;
    private readonly dataSource;
    private readonly eventEmitter;
    private readonly logger;
    private readonly providerConfigs;
    constructor(virtualAccountRepository: Repository<VirtualAccountEntity>, transactionRepository: Repository<VirtualAccountTransactionEntity>, walletsService: WalletsService, dataSource: DataSource, eventEmitter: EventEmitter2);
    createVirtualAccount(dto: CreateVirtualAccountDto): Promise<VirtualAccountEntity>;
    processPayment(dto: ProcessVirtualAccountPaymentDto): Promise<VirtualAccountTransactionEntity>;
    private createVirtualAccountViaPaystack;
    private createVirtualAccountViaFlutterwave;
    private createVirtualAccountViaWoven;
    private createVirtualAccountViaProvider;
    getVirtualAccount(virtualAccountId: string): Promise<VirtualAccountEntity>;
    getUserVirtualAccounts(userId: string): Promise<VirtualAccountEntity[]>;
    getVirtualAccountTransactions(virtualAccountId: string, limit?: number, offset?: number): Promise<VirtualAccountTransactionEntity[]>;
    suspendVirtualAccount(virtualAccountId: string, reason: string): Promise<VirtualAccountEntity>;
    reactivateVirtualAccount(virtualAccountId: string): Promise<VirtualAccountEntity>;
    handleWebhook(provider: string, payload: any, signature: string): Promise<any>;
    private handlePaystackWebhook;
    private handleFlutterwaveWebhook;
    private handleWovenWebhook;
    private verifyWebhookSignature;
}
