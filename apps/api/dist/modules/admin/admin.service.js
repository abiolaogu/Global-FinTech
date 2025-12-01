"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var AdminService_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const user_entity_1 = require("../users/entities/user.entity");
const payment_entity_1 = require("../payments/entities/payment.entity");
const fraud_check_entity_1 = require("../fraud/entities/fraud-check.entity");
const aml_check_entity_1 = require("../aml/entities/aml-check.entity");
const decimal_js_1 = require("decimal.js");
let AdminService = AdminService_1 = class AdminService {
    constructor(userRepository, paymentRepository, fraudCheckRepository, amlCheckRepository) {
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
        this.fraudCheckRepository = fraudCheckRepository;
        this.amlCheckRepository = amlCheckRepository;
        this.logger = new common_1.Logger(AdminService_1.name);
    }
    async getDashboardStats() {
        const [totalUsers, activeUsers, pendingKYC, todayTransactions, todayRevenue, flaggedTransactions,] = await Promise.all([
            this.userRepository.count(),
            this.userRepository.count({ where: { status: 'active' } }),
            this.userRepository.count({ where: { kycVerified: false } }),
            this.getTodayTransactionCount(),
            this.getTodayRevenue(),
            this.fraudCheckRepository.count({ where: { shouldBlock: true } }),
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
    async getBusinessMetrics(period) {
        const startDate = this.getStartDate(period);
        const transactions = await this.paymentRepository.find({
            where: {
                createdAt: { $gte: startDate },
                status: 'completed',
            },
        });
        const totalVolume = transactions.reduce((sum, tx) => sum.plus(tx.amount), new decimal_js_1.default(0));
        const averageTransaction = transactions.length > 0
            ? totalVolume.dividedBy(transactions.length)
            : new decimal_js_1.default(0);
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
    async listUsers(filters) {
        const where = {};
        if (filters.status) {
            where.status = filters.status;
        }
        if (filters.tier) {
            where.tier = filters.tier;
        }
        if (filters.kycStatus === 'verified') {
            where.kycVerified = true;
        }
        else if (filters.kycStatus === 'pending') {
            where.kycVerified = false;
        }
        const [users, total] = await this.userRepository.findAndCount({
            where,
            skip: (filters.page - 1) * filters.limit,
            take: filters.limit,
            order: { createdAt: 'DESC' },
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
    async getUserDetails(userId) {
        const user = await this.userRepository.findOne({ where: { userId } });
        const transactions = await this.paymentRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 10,
        });
        const fraudAlerts = await this.fraudCheckRepository.find({
            where: { userId, shouldBlock: true },
            take: 5,
        });
        const amlAlerts = await this.amlCheckRepository.find({
            where: { userId, requiresReview: true },
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
    async updateUserStatus(userId, status, reason) {
        const user = await this.userRepository.findOne({ where: { userId } });
        user.status = status;
        user.metadata = Object.assign(Object.assign({}, user.metadata), { statusReason: reason });
        await this.userRepository.save(user);
        this.logger.log(`User ${userId} status updated to ${status}`);
        return { success: true, user };
    }
    async updateUserTier(userId, tier) {
        const user = await this.userRepository.findOne({ where: { userId } });
        user.tier = tier;
        await this.userRepository.save(user);
        this.logger.log(`User ${userId} tier updated to ${tier}`);
        return { success: true, user };
    }
    async getPendingKYCVerifications(limit) {
        return this.userRepository.find({
            where: { kycVerified: false },
            take: limit,
            order: { createdAt: 'ASC' },
        });
    }
    async getKYCDetails(kycId) {
        return { kycId, status: 'pending' };
    }
    async approveKYC(kycId, notes) {
        this.logger.log(`KYC ${kycId} approved`);
        return { success: true };
    }
    async rejectKYC(kycId, reason, notes) {
        this.logger.log(`KYC ${kycId} rejected: ${reason}`);
        return { success: true };
    }
    async listTransactions(filters) {
        const where = {};
        if (filters.status)
            where.status = filters.status;
        if (filters.type)
            where.transactionType = filters.type;
        if (filters.userId)
            where.userId = filters.userId;
        const [transactions, total] = await this.paymentRepository.findAndCount({
            where,
            skip: (filters.page - 1) * filters.limit,
            take: filters.limit,
            order: { createdAt: 'DESC' },
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
    async getFlaggedTransactions(limit) {
        const fraudAlerts = await this.fraudCheckRepository.find({
            where: { shouldBlock: true },
            order: { createdAt: 'DESC' },
            take: limit,
        });
        const amlAlerts = await this.amlCheckRepository.find({
            where: { requiresReview: true },
            order: { createdAt: 'DESC' },
            take: limit,
        });
        return {
            fraud: fraudAlerts,
            aml: amlAlerts,
        };
    }
    async reviewTransaction(transactionId, action, notes) {
        this.logger.log(`Transaction ${transactionId} reviewed: ${action}`);
        return { success: true };
    }
    async getFraudAlerts(limit) {
        return this.fraudCheckRepository.find({
            where: { shouldBlock: true },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async getAMLAlerts(limit) {
        return this.amlCheckRepository.find({
            where: { requiresReview: true },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async getSystemHealth() {
        return {
            status: 'healthy',
            uptime: process.uptime(),
            memory: process.memoryUsage(),
            timestamp: new Date(),
        };
    }
    async getSystemLogs(level, limit = 1000) {
        return [];
    }
    async getRevenueReport(startDate, endDate) {
        const transactions = await this.paymentRepository.find({
            where: {
                createdAt: { $gte: startDate, $lte: endDate },
                status: 'completed',
            },
        });
        const totalRevenue = transactions.reduce((sum, tx) => sum.plus(tx.fee || 0), new decimal_js_1.default(0));
        return {
            period: { startDate, endDate },
            totalRevenue: totalRevenue.toString(),
            transactionCount: transactions.length,
            breakdown: this.getRevenueBreakdown(transactions),
        };
    }
    async getTransactionReport(startDate, endDate) {
        const transactions = await this.paymentRepository.find({
            where: {
                createdAt: { $gte: startDate, $lte: endDate },
            },
        });
        return {
            period: { startDate, endDate },
            totalCount: transactions.length,
            breakdown: this.getTransactionBreakdown(transactions),
        };
    }
    async getComplianceReport(startDate, endDate) {
        const [fraudChecks, amlChecks] = await Promise.all([
            this.fraudCheckRepository.find({
                where: {
                    createdAt: { $gte: startDate, $lte: endDate },
                },
            }),
            this.amlCheckRepository.find({
                where: {
                    createdAt: { $gte: startDate, $lte: endDate },
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
    async getTodayTransactionCount() {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        return this.paymentRepository.count({
            where: {
                createdAt: { $gte: todayStart },
            },
        });
    }
    async getTodayRevenue() {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const transactions = await this.paymentRepository.find({
            where: {
                createdAt: { $gte: todayStart },
                status: 'completed',
            },
        });
        const revenue = transactions.reduce((sum, tx) => sum.plus(tx.fee || 0), new decimal_js_1.default(0));
        return revenue.toString();
    }
    getStartDate(period) {
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
    getTransactionBreakdown(transactions) {
        const breakdown = {};
        transactions.forEach((tx) => {
            breakdown[tx.transactionType] = (breakdown[tx.transactionType] || 0) + 1;
        });
        return breakdown;
    }
    getRevenueBreakdown(transactions) {
        const breakdown = {};
        transactions.forEach((tx) => {
            const type = tx.transactionType;
            const currentRevenue = breakdown[type] ? new decimal_js_1.default(breakdown[type]) : new decimal_js_1.default(0);
            breakdown[type] = currentRevenue.plus(tx.fee || 0).toString();
        });
        return breakdown;
    }
};
exports.AdminService = AdminService;
exports.AdminService = AdminService = AdminService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(payment_entity_1.PaymentEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(fraud_check_entity_1.FraudCheckEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(aml_check_entity_1.AMLCheckEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object, typeof (_d = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _d : Object])
], AdminService);
//# sourceMappingURL=admin.service.js.map