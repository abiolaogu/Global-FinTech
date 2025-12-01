import { AdminService } from './admin.service';
export declare class AdminController {
    private readonly adminService;
    constructor(adminService: AdminService);
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
    getBusinessMetrics(period?: 'day' | 'week' | 'month'): Promise<{
        period: "day" | "week" | "month";
        transactions: {
            count: any;
            volume: any;
            average: any;
        };
        breakdown: Record<string, number>;
    }>;
    listUsers(status?: string, tier?: string, kycStatus?: string, page?: number, limit?: number): Promise<{
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
    updateUserStatus(userId: string, body: {
        status: 'active' | 'suspended' | 'banned';
        reason?: string;
    }): Promise<{
        success: boolean;
        user: any;
    }>;
    updateUserTier(userId: string, body: {
        tier: 'free' | 'silver' | 'gold' | 'platinum';
    }): Promise<{
        success: boolean;
        user: any;
    }>;
    getPendingKYC(limit?: number): Promise<any>;
    getKYCDetails(kycId: string): Promise<{
        kycId: string;
        status: string;
    }>;
    approveKYC(kycId: string, body: {
        notes?: string;
    }): Promise<{
        success: boolean;
    }>;
    rejectKYC(kycId: string, body: {
        reason: string;
        notes?: string;
    }): Promise<{
        success: boolean;
    }>;
    listTransactions(status?: string, type?: string, userId?: string, minAmount?: number, page?: number, limit?: number): Promise<{
        data: any;
        pagination: {
            page: any;
            limit: any;
            total: any;
            pages: number;
        };
    }>;
    getFlaggedTransactions(limit?: number): Promise<{
        fraud: any;
        aml: any;
    }>;
    reviewTransaction(transactionId: string, body: {
        action: 'approve' | 'reject' | 'escalate';
        notes: string;
    }): Promise<{
        success: boolean;
    }>;
    getFraudAlerts(limit?: number): Promise<any>;
    getAMLAlerts(limit?: number): Promise<any>;
    getSystemHealth(): Promise<{
        status: string;
        uptime: number;
        memory: NodeJS.MemoryUsage;
        timestamp: Date;
    }>;
    getSystemLogs(level?: string, limit?: number): Promise<any[]>;
    getRevenueReport(startDate: string, endDate: string): Promise<{
        period: {
            startDate: Date;
            endDate: Date;
        };
        totalRevenue: any;
        transactionCount: any;
        breakdown: Record<string, string>;
    }>;
    getTransactionReport(startDate: string, endDate: string): Promise<{
        period: {
            startDate: Date;
            endDate: Date;
        };
        totalCount: any;
        breakdown: Record<string, number>;
    }>;
    getComplianceReport(startDate: string, endDate: string): Promise<{
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
}
