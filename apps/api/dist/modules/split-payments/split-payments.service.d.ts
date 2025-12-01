import { Repository, DataSource } from 'typeorm';
import { SplitPaymentEntity } from './entities/split-payment.entity';
import { SplitConfigurationEntity } from './entities/split-configuration.entity';
import { WalletsService } from '../wallets/wallets.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
export interface CreateSplitPaymentDto {
    paymentId: string;
    userId: string;
    totalAmount: string;
    currency: string;
    splitRules: Array<{
        recipientId: string;
        recipientType: 'user' | 'wallet' | 'merchant' | 'platform';
        splitType: 'percentage' | 'fixed';
        value: string;
        description?: string;
        metadata?: Record<string, any>;
    }>;
    platformFee?: string;
    description?: string;
    metadata?: Record<string, any>;
}
export interface CreateSplitConfigurationDto {
    userId: string;
    name: string;
    description?: string;
    splitType: 'percentage' | 'fixed' | 'hybrid';
    splitRules: Array<{
        recipientId: string;
        recipientType: 'user' | 'wallet' | 'merchant' | 'platform';
        recipientName?: string;
        splitType: 'percentage' | 'fixed';
        value: string;
        description?: string;
        priority?: number;
    }>;
    isDefault?: boolean;
    conditions?: {
        minAmount?: string;
        maxAmount?: string;
        currencies?: string[];
        paymentMethods?: string[];
    };
}
export declare class SplitPaymentsService {
    private readonly splitPaymentRepository;
    private readonly configurationRepository;
    private readonly walletsService;
    private readonly dataSource;
    private readonly eventEmitter;
    private readonly logger;
    constructor(splitPaymentRepository: Repository<SplitPaymentEntity>, configurationRepository: Repository<SplitConfigurationEntity>, walletsService: WalletsService, dataSource: DataSource, eventEmitter: EventEmitter2);
    processSplitPayment(dto: CreateSplitPaymentDto): Promise<SplitPaymentEntity>;
    createConfiguration(dto: CreateSplitConfigurationDto): Promise<SplitConfigurationEntity>;
    applySplitConfiguration(configurationId: string, paymentId: string, userId: string, totalAmount: string, currency: string): Promise<SplitPaymentEntity>;
    private calculateSplits;
    private validateSplitRules;
    private getOrCreateRecipientWallet;
    getSplitPayment(splitPaymentId: string): Promise<SplitPaymentEntity>;
    getUserConfigurations(userId: string): Promise<SplitConfigurationEntity[]>;
    getPaymentSplits(paymentId: string): Promise<SplitPaymentEntity[]>;
}
