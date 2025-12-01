import { Repository } from 'typeorm';
import { FraudCheckEntity } from './entities/fraud-check.entity';
import { UserEntity } from '../users/entities/user.entity';
import { PaymentEntity } from '../payments/entities/payment.entity';
export interface FraudCheckResult {
    riskScore: number;
    riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    checks: {
        velocityCheck: boolean;
        amountCheck: boolean;
        geoCheck: boolean;
        deviceCheck: boolean;
        behaviorCheck: boolean;
    };
    shouldBlock: boolean;
    reasons: string[];
}
export declare class FraudService {
    private readonly fraudCheckRepository;
    private readonly userRepository;
    private readonly paymentRepository;
    private readonly logger;
    constructor(fraudCheckRepository: Repository<FraudCheckEntity>, userRepository: Repository<UserEntity>, paymentRepository: Repository<PaymentEntity>);
    checkTransaction(userId: string, amount: string, currency: string, transactionType: string, metadata?: {
        ipAddress?: string;
        deviceId?: string;
        location?: {
            lat: number;
            lon: number;
        };
        merchantCategory?: string;
    }): Promise<FraudCheckResult>;
    private checkVelocity;
    private checkAmount;
    private checkGeolocation;
    private checkDevice;
    private checkBehavior;
    private calculateRiskScore;
    private determineRiskLevel;
    private generateReasons;
    private calculateDistance;
    private degreesToRadians;
    getFraudHistory(userId: string, limit?: number): Promise<any>;
    getFlaggedTransactions(limit?: number): Promise<any>;
}
