import { WalletsService } from './wallets.service';
export declare class WalletsController {
    private readonly walletsService;
    constructor(walletsService: WalletsService);
    createWallet(dto: {
        userId: string;
        currency: string;
        isPrimary?: boolean;
        metadata?: Record<string, any>;
        limits?: any;
    }): Promise<import("./entities/wallet.entity").WalletEntity>;
    transfer(dto: {
        fromWalletId: string;
        toWalletId: string;
        amount: string;
        description?: string;
        metadata?: Record<string, any>;
    }): Promise<{
        debitTransaction: import("./entities/wallet-transaction.entity").WalletTransactionEntity;
        creditTransaction: import("./entities/wallet-transaction.entity").WalletTransactionEntity;
    }>;
    creditWallet(walletId: string, dto: {
        amount: string;
        category: string;
        description?: string;
        metadata?: Record<string, any>;
    }): Promise<import("./entities/wallet-transaction.entity").WalletTransactionEntity>;
    debitWallet(walletId: string, dto: {
        amount: string;
        category: string;
        description?: string;
        metadata?: Record<string, any>;
    }): Promise<import("./entities/wallet-transaction.entity").WalletTransactionEntity>;
    createHold(walletId: string, dto: {
        amount: string;
        reason: string;
        description?: string;
        expiresAt?: Date;
        metadata?: Record<string, any>;
    }): Promise<import("./entities/wallet-hold.entity").WalletHoldEntity>;
    releaseHold(holdId: string): Promise<import("./entities/wallet-hold.entity").WalletHoldEntity>;
    captureHold(holdId: string, dto: {
        description?: string;
    }): Promise<{
        hold: import("./entities/wallet-hold.entity").WalletHoldEntity;
        transaction: import("./entities/wallet-transaction.entity").WalletTransactionEntity;
    }>;
    getWallet(walletId: string): Promise<import("./entities/wallet.entity").WalletEntity>;
    getBalance(walletId: string): Promise<{
        balance: string;
        availableBalance: string;
        pendingBalance: string;
        heldBalance: string;
        currency: string;
    }>;
    getTransactions(walletId: string, limit?: number, offset?: number): Promise<import("./entities/wallet-transaction.entity").WalletTransactionEntity[]>;
    getUserWallets(userId: string): Promise<import("./entities/wallet.entity").WalletEntity[]>;
    freezeWallet(walletId: string, dto: {
        reason: string;
    }): Promise<import("./entities/wallet.entity").WalletEntity>;
    unfreezeWallet(walletId: string): Promise<import("./entities/wallet.entity").WalletEntity>;
}
