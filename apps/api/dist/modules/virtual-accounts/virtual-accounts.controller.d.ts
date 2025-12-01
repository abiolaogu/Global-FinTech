import { VirtualAccountsService } from './virtual-accounts.service';
export declare class VirtualAccountsController {
    private readonly virtualAccountsService;
    constructor(virtualAccountsService: VirtualAccountsService);
    createVirtualAccount(dto: {
        userId: string;
        walletId?: string;
        currency: string;
        country: string;
        provider: 'paystack' | 'flutterwave' | 'woven' | 'budpay' | 'monnify' | 'korapay';
        accountType?: 'dedicated' | 'dynamic' | 'pooled';
        accountName?: string;
        autoCredit?: boolean;
        metadata?: Record<string, any>;
    }): Promise<import("./entities/virtual-account.entity").VirtualAccountEntity>;
    processPayment(virtualAccountId: string, dto: {
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
    }): Promise<import("./entities/virtual-account-transaction.entity").VirtualAccountTransactionEntity>;
    handleWebhook(provider: string, paystackSignature: string, flutterwaveSignature: string, payload: any): Promise<any>;
    getVirtualAccount(virtualAccountId: string): Promise<import("./entities/virtual-account.entity").VirtualAccountEntity>;
    getTransactions(virtualAccountId: string, limit?: number, offset?: number): Promise<import("./entities/virtual-account-transaction.entity").VirtualAccountTransactionEntity[]>;
    getUserVirtualAccounts(userId: string): Promise<import("./entities/virtual-account.entity").VirtualAccountEntity[]>;
    suspendVirtualAccount(virtualAccountId: string, dto: {
        reason: string;
    }): Promise<import("./entities/virtual-account.entity").VirtualAccountEntity>;
    reactivateVirtualAccount(virtualAccountId: string): Promise<import("./entities/virtual-account.entity").VirtualAccountEntity>;
}
