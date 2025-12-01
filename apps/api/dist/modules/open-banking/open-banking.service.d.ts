import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { OpenBankingConnectionEntity } from './entities/open-banking-connection.entity';
export interface InitiateConnectionDto {
    userId: string;
    institutionId: string;
    redirectUrl: string;
}
export interface AccountData {
    accountId: string;
    institutionId: string;
    accountName: string;
    accountType: 'checking' | 'savings' | 'credit' | 'investment';
    currency: string;
    balance: string;
    availableBalance: string;
    lastUpdated: Date;
}
export declare class OpenBankingService {
    private readonly connectionRepository;
    private readonly httpService;
    private readonly configService;
    private readonly logger;
    private readonly plaidClientId;
    private readonly plaidSecret;
    private readonly plaidEnv;
    constructor(connectionRepository: Repository<OpenBankingConnectionEntity>, httpService: HttpService, configService: ConfigService);
    createLinkToken(dto: InitiateConnectionDto): Promise<string>;
    exchangePublicToken(userId: string, publicToken: string, institutionId: string): Promise<OpenBankingConnectionEntity>;
    getAccounts(connectionId: string, userId: string): Promise<AccountData[]>;
    getTransactions(connectionId: string, userId: string, startDate: Date, endDate: Date): Promise<any[]>;
    getIdentity(connectionId: string, userId: string): Promise<any>;
    refreshConnection(connectionId: string, userId: string): Promise<string>;
    disconnectConnection(connectionId: string, userId: string): Promise<void>;
    getUserConnections(userId: string): Promise<OpenBankingConnectionEntity[]>;
    private getConnection;
    private encryptToken;
    private decryptToken;
}
