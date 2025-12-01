import { Repository } from 'typeorm';
import { AMLCheckEntity } from './entities/aml-check.entity';
import { UserEntity } from '../users/entities/user.entity';
import { PaymentEntity } from '../payments/entities/payment.entity';
export interface AMLCheckResult {
    passed: boolean;
    flags: string[];
    sanctionsMatch: boolean;
    pepMatch: boolean;
    riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
    requiresReview: boolean;
}
export declare class AMLService {
    private readonly amlCheckRepository;
    private readonly userRepository;
    private readonly paymentRepository;
    private readonly logger;
    private readonly sanctionedCountries;
    private readonly highRiskCountries;
    constructor(amlCheckRepository: Repository<AMLCheckEntity>, userRepository: Repository<UserEntity>, paymentRepository: Repository<PaymentEntity>);
    checkTransaction(userId: string, amount: string, currency: string, transactionType: string, counterpartyId?: string): Promise<AMLCheckResult>;
    private checkSanctionsList;
    private checkPEPStatus;
    private checkStructuring;
    private getDailyVolume;
    private checkCountryRisk;
    private checkCounterparty;
    private checkUnusualPatterns;
    private determineRiskRating;
    getAMLHistory(userId: string, limit?: number): Promise<any>;
    getTransactionsRequiringReview(limit?: number): Promise<any>;
    getSanctionsMatches(limit?: number): Promise<any>;
}
