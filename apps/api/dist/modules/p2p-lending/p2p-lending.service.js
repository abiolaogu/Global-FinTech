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
var P2PLendingService_1;
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", { value: true });
exports.P2PLendingService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const loan_listing_entity_1 = require("./entities/loan-listing.entity");
const loan_investment_entity_1 = require("./entities/loan-investment.entity");
const loan_repayment_entity_1 = require("./entities/loan-repayment.entity");
const user_entity_1 = require("../users/entities/user.entity");
const event_emitter_1 = require("@nestjs/event-emitter");
const decimal_js_1 = require("decimal.js");
const schedule_1 = require("@nestjs/schedule");
let P2PLendingService = P2PLendingService_1 = class P2PLendingService {
    constructor(loanListingRepository, loanInvestmentRepository, loanRepaymentRepository, userRepository, dataSource, eventEmitter) {
        this.loanListingRepository = loanListingRepository;
        this.loanInvestmentRepository = loanInvestmentRepository;
        this.loanRepaymentRepository = loanRepaymentRepository;
        this.userRepository = userRepository;
        this.dataSource = dataSource;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(P2PLendingService_1.name);
        this.riskTiers = {
            excellent: { minScore: 750, maxRate: 8.0 },
            good: { minScore: 700, maxRate: 12.0 },
            fair: { minScore: 650, maxRate: 18.0 },
            poor: { minScore: 0, maxRate: 25.0 },
        };
    }
    async createLoanListing(dto) {
        this.logger.log(`Creating loan listing for borrower ${dto.borrowerId}: ${dto.amount} ${dto.currency}`);
        const borrower = await this.userRepository.findOne({
            where: { userId: dto.borrowerId },
        });
        if (!borrower) {
            throw new common_1.BadRequestException('Borrower not found');
        }
        if (!borrower.kycVerified) {
            throw new common_1.BadRequestException('Borrower must complete KYC verification');
        }
        const riskTier = this.calculateRiskTier(dto.creditScore || 0);
        const maxAllowedRate = this.riskTiers[riskTier].maxRate;
        if (dto.interestRate > maxAllowedRate) {
            throw new common_1.BadRequestException(`Interest rate ${dto.interestRate}% exceeds maximum allowed ${maxAllowedRate}% for your credit tier`);
        }
        const monthlyPayment = this.calculateMonthlyPayment(new decimal_js_1.default(dto.amount), dto.interestRate, dto.term);
        const totalRepayment = monthlyPayment.times(dto.term);
        const totalInterest = totalRepayment.minus(dto.amount);
        const listing = this.loanListingRepository.create({
            borrowerId: dto.borrowerId,
            amount: dto.amount,
            currency: dto.currency,
            fundedAmount: '0',
            interestRate: dto.interestRate,
            term: dto.term,
            monthlyPayment: monthlyPayment.toString(),
            totalInterest: totalInterest.toString(),
            purpose: dto.purpose,
            creditScore: dto.creditScore,
            employmentStatus: dto.employmentStatus,
            annualIncome: dto.annualIncome,
            riskTier,
            status: 'open',
            expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        });
        const savedListing = await this.loanListingRepository.save(listing);
        this.eventEmitter.emit('loan.listing_created', {
            loanListingId: savedListing.loanListingId,
            borrowerId: dto.borrowerId,
            amount: dto.amount,
            interestRate: dto.interestRate,
        });
        this.logger.log(`Loan listing created: ${savedListing.loanListingId}`);
        return savedListing;
    }
    async investInLoan(dto) {
        this.logger.log(`Processing investment from ${dto.lenderId} in loan ${dto.loanListingId}: ${dto.amount}`);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const listing = await queryRunner.manager.findOne(loan_listing_entity_1.LoanListingEntity, {
                where: { loanListingId: dto.loanListingId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!listing) {
                throw new common_1.NotFoundException('Loan listing not found');
            }
            if (listing.status !== 'open') {
                throw new common_1.BadRequestException('Loan listing is no longer open for funding');
            }
            const lender = await queryRunner.manager.findOne(user_entity_1.UserEntity, {
                where: { userId: dto.lenderId },
            });
            if (!lender || !lender.kycVerified) {
                throw new common_1.BadRequestException('Lender must be KYC verified');
            }
            const investmentAmount = new decimal_js_1.default(dto.amount);
            const currentFunded = new decimal_js_1.default(listing.fundedAmount);
            const targetAmount = new decimal_js_1.default(listing.amount);
            const remaining = targetAmount.minus(currentFunded);
            if (investmentAmount.greaterThan(remaining)) {
                throw new common_1.BadRequestException(`Investment amount ${dto.amount} exceeds remaining ${remaining.toString()}`);
            }
            const investment = queryRunner.manager.create(loan_investment_entity_1.LoanInvestmentEntity, {
                loanListingId: dto.loanListingId,
                lenderId: dto.lenderId,
                amount: dto.amount,
                interestRate: listing.interestRate,
                status: 'active',
            });
            await queryRunner.manager.save(investment);
            listing.fundedAmount = currentFunded.plus(investmentAmount).toString();
            if (new decimal_js_1.default(listing.fundedAmount).greaterThanOrEqualTo(targetAmount)) {
                listing.status = 'funded';
                listing.fundedAt = new Date();
                await this.disburseLoan(listing.loanListingId, queryRunner);
            }
            await queryRunner.manager.save(listing);
            await queryRunner.commitTransaction();
            this.eventEmitter.emit('loan.investment_created', {
                investmentId: investment.investmentId,
                lenderId: dto.lenderId,
                loanListingId: dto.loanListingId,
                amount: dto.amount,
            });
            this.logger.log(`Investment created: ${investment.investmentId}`);
            return investment;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async disburseLoan(loanListingId, queryRunner) {
        const listing = await queryRunner.manager.findOne(loan_listing_entity_1.LoanListingEntity, {
            where: { loanListingId },
        });
        listing.status = 'active';
        listing.disbursedAt = new Date();
        listing.firstPaymentDue = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
        await queryRunner.manager.save(listing);
        this.eventEmitter.emit('loan.disbursed', {
            loanListingId,
            borrowerId: listing.borrowerId,
            amount: listing.amount,
            currency: listing.currency,
        });
        this.logger.log(`Loan disbursed: ${loanListingId}`);
    }
    async processRepayment(loanListingId, amount, paymentMethod) {
        this.logger.log(`Processing repayment for loan ${loanListingId}: ${amount}`);
        const listing = await this.loanListingRepository.findOne({
            where: { loanListingId },
        });
        if (!listing) {
            throw new common_1.NotFoundException('Loan not found');
        }
        if (listing.status !== 'active') {
            throw new common_1.BadRequestException('Loan is not active');
        }
        const repayment = this.loanRepaymentRepository.create({
            loanListingId,
            amount,
            paymentMethod,
            status: 'completed',
        });
        const savedRepayment = await this.loanRepaymentRepository.save(repayment);
        const currentBalance = new decimal_js_1.default(listing.outstandingBalance || listing.amount);
        const newBalance = currentBalance.minus(amount);
        listing.outstandingBalance = newBalance.toString();
        if (newBalance.lessThanOrEqualTo(0)) {
            listing.status = 'repaid';
            listing.repaidAt = new Date();
            this.eventEmitter.emit('loan.fully_repaid', {
                loanListingId,
                borrowerId: listing.borrowerId,
            });
        }
        await this.loanListingRepository.save(listing);
        await this.distributeRepayment(loanListingId, amount);
        this.logger.log(`Repayment processed: ${savedRepayment.repaymentId}`);
        return savedRepayment;
    }
    async distributeRepayment(loanListingId, totalAmount) {
        const investments = await this.loanInvestmentRepository.find({
            where: { loanListingId, status: 'active' },
        });
        const listing = await this.loanListingRepository.findOne({
            where: { loanListingId },
        });
        const totalInvested = new decimal_js_1.default(listing.fundedAmount);
        const paymentAmount = new decimal_js_1.default(totalAmount);
        for (const investment of investments) {
            const investmentShare = new decimal_js_1.default(investment.amount).dividedBy(totalInvested);
            const repaymentShare = paymentAmount.times(investmentShare);
            this.eventEmitter.emit('loan.repayment_distributed', {
                investmentId: investment.investmentId,
                lenderId: investment.lenderId,
                amount: repaymentShare.toString(),
                currency: listing.currency,
            });
        }
    }
    async getAvailableListings(limit = 50, riskTier) {
        const where = {
            status: 'open',
        };
        if (riskTier) {
            where.riskTier = riskTier;
        }
        return this.loanListingRepository.find({
            where,
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async getBorrowerLoans(borrowerId) {
        return this.loanListingRepository.find({
            where: { borrowerId },
            order: { createdAt: 'DESC' },
        });
    }
    async getLenderInvestments(lenderId) {
        return this.loanInvestmentRepository.find({
            where: { lenderId },
            order: { createdAt: 'DESC' },
        });
    }
    async checkOverduePayments() {
        const today = new Date();
        const overdueLoans = await this.loanListingRepository.find({
            where: {
                status: 'active',
                firstPaymentDue: { $lte: today },
            },
        });
        for (const loan of overdueLoans) {
            const lastPayment = await this.loanRepaymentRepository.findOne({
                where: { loanListingId: loan.loanListingId },
                order: { createdAt: 'DESC' },
            });
            const daysSinceLastPayment = lastPayment
                ? Math.floor((today.getTime() - lastPayment.createdAt.getTime()) / (1000 * 60 * 60 * 24))
                : Math.floor((today.getTime() - loan.disbursedAt.getTime()) / (1000 * 60 * 60 * 24));
            if (daysSinceLastPayment > 30) {
                loan.status = 'late';
                await this.loanListingRepository.save(loan);
                this.eventEmitter.emit('loan.payment_overdue', {
                    loanListingId: loan.loanListingId,
                    borrowerId: loan.borrowerId,
                    daysOverdue: daysSinceLastPayment - 30,
                });
            }
        }
        this.logger.log(`Checked ${overdueLoans.length} loans for overdue payments`);
    }
    calculateRiskTier(creditScore) {
        if (creditScore >= this.riskTiers.excellent.minScore)
            return 'excellent';
        if (creditScore >= this.riskTiers.good.minScore)
            return 'good';
        if (creditScore >= this.riskTiers.fair.minScore)
            return 'fair';
        return 'poor';
    }
    calculateMonthlyPayment(principal, annualRate, term) {
        const monthlyRate = new decimal_js_1.default(annualRate).dividedBy(100).dividedBy(12);
        if (monthlyRate.isZero()) {
            return principal.dividedBy(term);
        }
        const numerator = principal.times(monthlyRate).times(monthlyRate.plus(1).pow(term));
        const denominator = monthlyRate.plus(1).pow(term).minus(1);
        return numerator.dividedBy(denominator);
    }
};
exports.P2PLendingService = P2PLendingService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], P2PLendingService.prototype, "checkOverduePayments", null);
exports.P2PLendingService = P2PLendingService = P2PLendingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(loan_listing_entity_1.LoanListingEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(loan_investment_entity_1.LoanInvestmentEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(loan_repayment_entity_1.LoanRepaymentEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object, typeof (_d = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _d : Object, typeof (_e = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _e : Object, typeof (_f = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _f : Object])
], P2PLendingService);
//# sourceMappingURL=p2p-lending.service.js.map