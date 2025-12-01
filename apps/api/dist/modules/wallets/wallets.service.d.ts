import { Repository, DataSource, QueryRunner } from 'typeorm';
import { WalletEntity } from './entities/wallet.entity';
import { WalletTransactionEntity } from './entities/wallet-transaction.entity';
import { WalletHoldEntity } from './entities/wallet-hold.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
export interface CreateWalletDto {
    userId: string;
    currency: string;
    isPrimary?: boolean;
    metadata?: Record<string, any>;
    limits?: {
        dailyTransactionLimit?: string;
        monthlyTransactionLimit?: string;
        singleTransactionLimit?: string;
        dailyWithdrawalLimit?: string;
    };
}
export interface TransferDto {
    fromWalletId: string;
    toWalletId: string;
    amount: string;
    description?: string;
    metadata?: Record<string, any>;
    reference?: string;
}
export interface CreditWalletDto {
    walletId: string;
    amount: string;
    category: string;
    description?: string;
    metadata?: Record<string, any>;
    externalTransactionId?: string;
    paymentMethod?: string;
    paymentGateway?: string;
}
export interface DebitWalletDto {
    walletId: string;
    amount: string;
    category: string;
    description?: string;
    metadata?: Record<string, any>;
    externalTransactionId?: string;
    paymentMethod?: string;
    paymentGateway?: string;
}
export declare class WalletsService {
    private readonly walletRepository;
    private readonly transactionRepository;
    private readonly holdRepository;
    private readonly dataSource;
    private readonly eventEmitter;
    private readonly logger;
    constructor(walletRepository: Repository<WalletEntity>, transactionRepository: Repository<WalletTransactionEntity>, holdRepository: Repository<WalletHoldEntity>, dataSource: DataSource, eventEmitter: EventEmitter2);
    createWallet(dto: CreateWalletDto): Promise<WalletEntity>;
    creditWallet(dto: CreditWalletDto, queryRunner?: QueryRunner): Promise<WalletTransactionEntity>;
    debitWallet(dto: DebitWalletDto, queryRunner?: QueryRunner): Promise<WalletTransactionEntity>;
    transfer(dto: TransferDto): Promise<{
        debitTransaction: WalletTransactionEntity;
        creditTransaction: WalletTransactionEntity;
    }>;
    createHold(walletId: string, amount: string, reason: string, description?: string, expiresAt?: Date, metadata?: Record<string, any>): Promise<WalletHoldEntity>;
    releaseHold(holdId: string): Promise<WalletHoldEntity>;
    captureHold(holdId: string, description?: string): Promise<{
        hold: WalletHoldEntity;
        transaction: WalletTransactionEntity;
    }>;
    releaseExpiredHolds(): Promise<number>;
    getWallet(walletId: string): Promise<WalletEntity>;
    getUserWallets(userId: string): Promise<WalletEntity[]>;
    getWalletTransactions(walletId: string, limit?: number, offset?: number): Promise<WalletTransactionEntity[]>;
    getBalance(walletId: string): Promise<{
        balance: string;
        availableBalance: string;
        pendingBalance: string;
        heldBalance: string;
        currency: string;
    }>;
    freezeWallet(walletId: string, reason: string): Promise<WalletEntity>;
    unfreezeWallet(walletId: string): Promise<WalletEntity>;
}
