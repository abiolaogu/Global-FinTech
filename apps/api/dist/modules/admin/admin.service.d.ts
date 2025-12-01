import { Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { PaymentEntity } from '../payments/entities/payment.entity';
import { FraudCheckEntity } from '../fraud/entities/fraud-check.entity';
import { AMLCheckEntity } from '../aml/entities/aml-check.entity';
export declare class AdminService {
    private readonly userRepository;
    private readonly paymentRepository;
    private readonly fraudCheckRepository;
    private readonly amlCheckRepository;
    private readonly logger;
    constructor(userRepository: Repository<UserEntity>, paymentRepository: Repository<PaymentEntity>, fraudCheckRepository: Repository<FraudCheckEntity>, amlCheckRepository: Repository<AMLCheckEntity>);
    getDashboardStats(): Promise<{
        users: {
            total: any;
            active: any;
            pendingKYC: any;
        };
        transactions: {
            today: any;
            flagged: any;
        };
        revenue: {
            today: any;
        };
    }>;
    getBusinessMetrics(period: 'day' | 'week' | 'month'): Promise<{
        period: "day" | "week" | "month";
        transactions: {
            count: any;
            volume: any;
            average: any;
        };
        breakdown: Record<string, number>;
    }>;
    listUsers(filters: {
        status?: string;
        tier?: string;
        kycStatus?: string;
        page: number;
        limit: number;
    }): Promise<{
        data: any;
        pagination: {
            page: number;
            limit: number;
            total: any;
            pages: number;
        };
    }>;
    getUserDetails(userId: string): Promise<{
        user: any;
        recentTransactions: any;
        alerts: {
            fraud: any;
            aml: any;
        };
    }>;
    updateUserStatus(userId: string, status: 'active' | 'suspended' | 'banned', reason?: string): Promise<{
        success: boolean;
        user: any;
    }>;
    updateUserTier(userId: string, tier: 'free' | 'silver' | 'gold' | 'platinum'): Promise<{
        success: boolean;
        user: any;
    }>;
    getPendingKYCVerifications(limit: number): Promise<any>;
    getKYCDetails(kycId: string): Promise<{
        kycId: string;
        status: string;
    }>;
    approveKYC(kycId: string, notes?: string): Promise<{
        success: boolean;
    }>;
    rejectKYC(kycId: string, reason: string, notes?: string): Promise<{
        success: boolean;
    }>;
    listTransactions(filters: any): Promise<{
        data: any;
        pagination: {
            page: any;
            limit: any;
            total: any;
            pages: number;
        };
    }>;
    getFlaggedTransactions(limit: number): Promise<{
        fraud: any;
        aml: any;
    }>;
    reviewTransaction(transactionId: string, action: 'approve' | 'reject' | 'escalate', notes: string): Promise<{
        success: boolean;
    }>;
    getFraudAlerts(limit: number): Promise<any>;
    getAMLAlerts(limit: number): Promise<any>;
    getSystemHealth(): Promise<{
        status: string;
        uptime: number;
        memory: NodeJS.MemoryUsage;
        timestamp: Date;
    }>;
    getSystemLogs(level?: string, limit?: number): Promise<any[]>;
    getRevenueReport(startDate: Date, endDate: Date): Promise<{
        period: {
            startDate: Date;
            endDate: Date;
        };
        totalRevenue: any;
        transactionCount: any;
        breakdown: Record<string, string>;
    }>;
    getTransactionReport(startDate: Date, endDate: Date): Promise<{
        period: {
            startDate: Date;
            endDate: Date;
        };
        totalCount: any;
        breakdown: Record<string, number>;
    }>;
    getComplianceReport(startDate: Date, endDate: Date): Promise<{
        period: {
            startDate: Date;
            endDate: Date;
        };
        fraud: {
            total: any;
            blocked: any;
        };
        aml: {
            total: any;
            requiresReview: any;
            sanctionsMatches: any;
        };
    }>;
    private getTodayTransactionCount;
    private getTodayRevenue;
    private getStartDate;
    private getTransactionBreakdown;
    private getRevenueBreakdown;
}
