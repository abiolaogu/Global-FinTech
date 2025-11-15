import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../users/entities/user.entity';
import { PaymentEntity } from '../payments/entities/payment.entity';
import { FraudCheckEntity } from '../fraud/entities/fraud-check.entity';
import { AMLCheckEntity } from '../aml/entities/aml-check.entity';
import Decimal from 'decimal.js';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
    @InjectRepository(FraudCheckEntity)
    private readonly fraudCheckRepository: Repository<FraudCheckEntity>,
    @InjectRepository(AMLCheckEntity)
    private readonly amlCheckRepository: Repository<AMLCheckEntity>,
  ) {}

  /**
   * Get dashboard statistics
   */
  async getDashboardStats() {
    const [
      totalUsers,
      activeUsers,
      pendingKYC,
      todayTransactions,
      todayRevenue,
      flaggedTransactions,
    ] = await Promise.all([
      this.userRepository.count(),
      this.userRepository.count({ where: { status: 'active' as any } }),
      this.userRepository.count({ where: { kycVerified: false as any } }),
      this.getTodayTransactionCount(),
      this.getTodayRevenue(),
      this.fraudCheckRepository.count({ where: { shouldBlock: true as any } }),
    ]);

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        pendingKYC,
      },
      transactions: {
        today: todayTransactions,
        flagged: flaggedTransactions,
      },
      revenue: {
        today: todayRevenue,
      },
    };
  }

  /**
   * Get business metrics
   */
  async getBusinessMetrics(period: 'day' | 'week' | 'month') {
    const startDate = this.getStartDate(period);

    const transactions = await this.paymentRepository.find({
      where: {
        createdAt: { $gte: startDate } as any,
        status: 'completed' as any,
      },
    });

    const totalVolume = transactions.reduce(
      (sum, tx) => sum.plus(tx.amount),
      new Decimal(0),
    );

    const averageTransaction = transactions.length > 0
      ? totalVolume.dividedBy(transactions.length)
      : new Decimal(0);

    return {
      period,
      transactions: {
        count: transactions.length,
        volume: totalVolume.toString(),
        average: averageTransaction.toString(),
      },
      breakdown: this.getTransactionBreakdown(transactions),
    };
  }

  /**
   * List users with filters
   */
  async listUsers(filters: {
    status?: string;
    tier?: string;
    kycStatus?: string;
    page: number;
    limit: number;
  }) {
    const where: any = {};

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.tier) {
      where.tier = filters.tier;
    }
    if (filters.kycStatus === 'verified') {
      where.kycVerified = true;
    } else if (filters.kycStatus === 'pending') {
      where.kycVerified = false;
    }

    const [users, total] = await this.userRepository.findAndCount({
      where,
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      order: { createdAt: 'DESC' as any },
    });

    return {
      data: users,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit),
      },
    };
  }

  /**
   * Get user details
   */
  async getUserDetails(userId: string) {
    const user = await this.userRepository.findOne({ where: { userId } });

    // Get user's transaction history
    const transactions = await this.paymentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' as any },
      take: 10,
    });

    // Get fraud/AML alerts
    const fraudAlerts = await this.fraudCheckRepository.find({
      where: { userId, shouldBlock: true as any },
      take: 5,
    });

    const amlAlerts = await this.amlCheckRepository.find({
      where: { userId, requiresReview: true as any },
      take: 5,
    });

    return {
      user,
      recentTransactions: transactions,
      alerts: {
        fraud: fraudAlerts,
        aml: amlAlerts,
      },
    };
  }

  /**
   * Update user status
   */
  async updateUserStatus(
    userId: string,
    status: 'active' | 'suspended' | 'banned',
    reason?: string,
  ) {
    const user = await this.userRepository.findOne({ where: { userId } });
    user.status = status as any;
    user.metadata = { ...user.metadata, statusReason: reason };

    await this.userRepository.save(user);

    this.logger.log(`User ${userId} status updated to ${status}`);

    return { success: true, user };
  }

  /**
   * Update user tier
   */
  async updateUserTier(
    userId: string,
    tier: 'free' | 'silver' | 'gold' | 'platinum',
  ) {
    const user = await this.userRepository.findOne({ where: { userId } });
    user.tier = tier as any;

    await this.userRepository.save(user);

    this.logger.log(`User ${userId} tier updated to ${tier}`);

    return { success: true, user };
  }

  /**
   * Get pending KYC verifications
   */
  async getPendingKYCVerifications(limit: number) {
    return this.userRepository.find({
      where: { kycVerified: false as any },
      take: limit,
      order: { createdAt: 'ASC' as any },
    });
  }

  /**
   * Get KYC details
   */
  async getKYCDetails(kycId: string) {
    // In production, this would fetch from KYC service
    return { kycId, status: 'pending' };
  }

  /**
   * Approve KYC
   */
  async approveKYC(kycId: string, notes?: string) {
    this.logger.log(`KYC ${kycId} approved`);
    return { success: true };
  }

  /**
   * Reject KYC
   */
  async rejectKYC(kycId: string, reason: string, notes?: string) {
    this.logger.log(`KYC ${kycId} rejected: ${reason}`);
    return { success: true };
  }

  /**
   * List transactions
   */
  async listTransactions(filters: any) {
    const where: any = {};

    if (filters.status) where.status = filters.status;
    if (filters.type) where.transactionType = filters.type;
    if (filters.userId) where.userId = filters.userId;

    const [transactions, total] = await this.paymentRepository.findAndCount({
      where,
      skip: (filters.page - 1) * filters.limit,
      take: filters.limit,
      order: { createdAt: 'DESC' as any },
    });

    return {
      data: transactions,
      pagination: {
        page: filters.page,
        limit: filters.limit,
        total,
        pages: Math.ceil(total / filters.limit),
      },
    };
  }

  /**
   * Get flagged transactions
   */
  async getFlaggedTransactions(limit: number) {
    const fraudAlerts = await this.fraudCheckRepository.find({
      where: { shouldBlock: true as any },
      order: { createdAt: 'DESC' as any },
      take: limit,
    });

    const amlAlerts = await this.amlCheckRepository.find({
      where: { requiresReview: true as any },
      order: { createdAt: 'DESC' as any },
      take: limit,
    });

    return {
      fraud: fraudAlerts,
      aml: amlAlerts,
    };
  }

  /**
   * Review transaction
   */
  async reviewTransaction(
    transactionId: string,
    action: 'approve' | 'reject' | 'escalate',
    notes: string,
  ) {
    this.logger.log(`Transaction ${transactionId} reviewed: ${action}`);
    return { success: true };
  }

  /**
   * Get fraud alerts
   */
  async getFraudAlerts(limit: number) {
    return this.fraudCheckRepository.find({
      where: { shouldBlock: true as any },
      order: { createdAt: 'DESC' as any },
      take: limit,
    });
  }

  /**
   * Get AML alerts
   */
  async getAMLAlerts(limit: number) {
    return this.amlCheckRepository.find({
      where: { requiresReview: true as any },
      order: { createdAt: 'DESC' as any },
      take: limit,
    });
  }

  /**
   * Get system health
   */
  async getSystemHealth() {
    return {
      status: 'healthy',
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      timestamp: new Date(),
    };
  }

  /**
   * Get system logs
   */
  async getSystemLogs(level?: string, limit: number = 1000) {
    // In production, this would query from logging system (Loki, ELK)
    return [];
  }

  /**
   * Get revenue report
   */
  async getRevenueReport(startDate: Date, endDate: Date) {
    const transactions = await this.paymentRepository.find({
      where: {
        createdAt: { $gte: startDate, $lte: endDate } as any,
        status: 'completed' as any,
      },
    });

    const totalRevenue = transactions.reduce(
      (sum, tx) => sum.plus(tx.fee || 0),
      new Decimal(0),
    );

    return {
      period: { startDate, endDate },
      totalRevenue: totalRevenue.toString(),
      transactionCount: transactions.length,
      breakdown: this.getRevenueBreakdown(transactions),
    };
  }

  /**
   * Get transaction report
   */
  async getTransactionReport(startDate: Date, endDate: Date) {
    const transactions = await this.paymentRepository.find({
      where: {
        createdAt: { $gte: startDate, $lte: endDate } as any,
      },
    });

    return {
      period: { startDate, endDate },
      totalCount: transactions.length,
      breakdown: this.getTransactionBreakdown(transactions),
    };
  }

  /**
   * Get compliance report
   */
  async getComplianceReport(startDate: Date, endDate: Date) {
    const [fraudChecks, amlChecks] = await Promise.all([
      this.fraudCheckRepository.find({
        where: {
          createdAt: { $gte: startDate, $lte: endDate } as any,
        },
      }),
      this.amlCheckRepository.find({
        where: {
          createdAt: { $gte: startDate, $lte: endDate } as any,
        },
      }),
    ]);

    return {
      period: { startDate, endDate },
      fraud: {
        total: fraudChecks.length,
        blocked: fraudChecks.filter((c) => c.shouldBlock).length,
      },
      aml: {
        total: amlChecks.length,
        requiresReview: amlChecks.filter((c) => c.requiresReview).length,
        sanctionsMatches: amlChecks.filter((c) => c.sanctionsMatch).length,
      },
    };
  }

  // Helper methods

  private async getTodayTransactionCount(): Promise<number> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    return this.paymentRepository.count({
      where: {
        createdAt: { $gte: todayStart } as any,
      },
    });
  }

  private async getTodayRevenue(): Promise<string> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const transactions = await this.paymentRepository.find({
      where: {
        createdAt: { $gte: todayStart } as any,
        status: 'completed' as any,
      },
    });

    const revenue = transactions.reduce(
      (sum, tx) => sum.plus(tx.fee || 0),
      new Decimal(0),
    );

    return revenue.toString();
  }

  private getStartDate(period: 'day' | 'week' | 'month'): Date {
    const now = new Date();

    switch (period) {
      case 'day':
        now.setHours(0, 0, 0, 0);
        return now;
      case 'week':
        now.setDate(now.getDate() - 7);
        return now;
      case 'month':
        now.setMonth(now.getMonth() - 1);
        return now;
    }
  }

  private getTransactionBreakdown(transactions: PaymentEntity[]) {
    const breakdown: Record<string, number> = {};

    transactions.forEach((tx) => {
      breakdown[tx.transactionType] = (breakdown[tx.transactionType] || 0) + 1;
    });

    return breakdown;
  }

  private getRevenueBreakdown(transactions: PaymentEntity[]) {
    const breakdown: Record<string, string> = {};

    transactions.forEach((tx) => {
      const type = tx.transactionType;
      const currentRevenue = breakdown[type] ? new Decimal(breakdown[type]) : new Decimal(0);
      breakdown[type] = currentRevenue.plus(tx.fee || 0).toString();
    });

    return breakdown;
  }
}
