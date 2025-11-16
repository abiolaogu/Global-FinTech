import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { LoanListingEntity } from './entities/loan-listing.entity';
import { LoanInvestmentEntity } from './entities/loan-investment.entity';
import { LoanRepaymentEntity } from './entities/loan-repayment.entity';
import { UserEntity } from '../users/entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Decimal from 'decimal.js';
import { Cron, CronExpression } from '@nestjs/schedule';

export interface CreateLoanListingDto {
  borrowerId: string;
  amount: string;
  currency: string;
  interestRate: number; // Annual percentage rate
  term: number; // Months
  purpose: string;
  creditScore?: number;
  employmentStatus?: string;
  annualIncome?: string;
}

export interface InvestInLoanDto {
  lenderId: string;
  loanListingId: string;
  amount: string;
}

@Injectable()
export class P2PLendingService {
  private readonly logger = new Logger(P2PLendingService.name);

  // Risk-based pricing tiers
  private readonly riskTiers = {
    excellent: { minScore: 750, maxRate: 8.0 },
    good: { minScore: 700, maxRate: 12.0 },
    fair: { minScore: 650, maxRate: 18.0 },
    poor: { minScore: 0, maxRate: 25.0 },
  };

  constructor(
    @InjectRepository(LoanListingEntity)
    private readonly loanListingRepository: Repository<LoanListingEntity>,
    @InjectRepository(LoanInvestmentEntity)
    private readonly loanInvestmentRepository: Repository<LoanInvestmentEntity>,
    @InjectRepository(LoanRepaymentEntity)
    private readonly loanRepaymentRepository: Repository<LoanRepaymentEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create loan listing (borrower requests loan)
   */
  async createLoanListing(dto: CreateLoanListingDto): Promise<LoanListingEntity> {
    this.logger.log(`Creating loan listing for borrower ${dto.borrowerId}: ${dto.amount} ${dto.currency}`);

    // Validate borrower
    const borrower = await this.userRepository.findOne({
      where: { userId: dto.borrowerId },
    });

    if (!borrower) {
      throw new BadRequestException('Borrower not found');
    }

    if (!borrower.kycVerified) {
      throw new BadRequestException('Borrower must complete KYC verification');
    }

    // Calculate risk tier and validate interest rate
    const riskTier = this.calculateRiskTier(dto.creditScore || 0);
    const maxAllowedRate = this.riskTiers[riskTier].maxRate;

    if (dto.interestRate > maxAllowedRate) {
      throw new BadRequestException(
        `Interest rate ${dto.interestRate}% exceeds maximum allowed ${maxAllowedRate}% for your credit tier`,
      );
    }

    // Calculate monthly payment
    const monthlyPayment = this.calculateMonthlyPayment(
      new Decimal(dto.amount),
      dto.interestRate,
      dto.term,
    );

    // Calculate total interest
    const totalRepayment = monthlyPayment.times(dto.term);
    const totalInterest = totalRepayment.minus(dto.amount);

    // Create loan listing
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
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days to fund
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

  /**
   * Invest in a loan (lender provides funds)
   */
  async investInLoan(dto: InvestInLoanDto): Promise<LoanInvestmentEntity> {
    this.logger.log(`Processing investment from ${dto.lenderId} in loan ${dto.loanListingId}: ${dto.amount}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get loan listing
      const listing = await queryRunner.manager.findOne(LoanListingEntity, {
        where: { loanListingId: dto.loanListingId },
        lock: { mode: 'pessimistic_write' }, // Lock for update
      });

      if (!listing) {
        throw new NotFoundException('Loan listing not found');
      }

      if (listing.status !== 'open') {
        throw new BadRequestException('Loan listing is no longer open for funding');
      }

      // Validate lender
      const lender = await queryRunner.manager.findOne(UserEntity, {
        where: { userId: dto.lenderId },
      });

      if (!lender || !lender.kycVerified) {
        throw new BadRequestException('Lender must be KYC verified');
      }

      // Check if investment would overfund
      const investmentAmount = new Decimal(dto.amount);
      const currentFunded = new Decimal(listing.fundedAmount);
      const targetAmount = new Decimal(listing.amount);
      const remaining = targetAmount.minus(currentFunded);

      if (investmentAmount.greaterThan(remaining)) {
        throw new BadRequestException(
          `Investment amount ${dto.amount} exceeds remaining ${remaining.toString()}`,
        );
      }

      // Create investment
      const investment = queryRunner.manager.create(LoanInvestmentEntity, {
        loanListingId: dto.loanListingId,
        lenderId: dto.lenderId,
        amount: dto.amount,
        interestRate: listing.interestRate,
        status: 'active',
      });

      await queryRunner.manager.save(investment);

      // Update funded amount
      listing.fundedAmount = currentFunded.plus(investmentAmount).toString();

      // Check if fully funded
      if (new Decimal(listing.fundedAmount).greaterThanOrEqualTo(targetAmount)) {
        listing.status = 'funded';
        listing.fundedAt = new Date();

        // Initiate loan disbursement
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
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Disburse loan to borrower
   */
  private async disburseLoan(loanListingId: string, queryRunner: any): Promise<void> {
    const listing = await queryRunner.manager.findOne(LoanListingEntity, {
      where: { loanListingId },
    });

    listing.status = 'active';
    listing.disbursedAt = new Date();
    listing.firstPaymentDue = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days

    await queryRunner.manager.save(listing);

    // Emit event for payment processing
    this.eventEmitter.emit('loan.disbursed', {
      loanListingId,
      borrowerId: listing.borrowerId,
      amount: listing.amount,
      currency: listing.currency,
    });

    this.logger.log(`Loan disbursed: ${loanListingId}`);
  }

  /**
   * Process monthly repayment
   */
  async processRepayment(
    loanListingId: string,
    amount: string,
    paymentMethod: string,
  ): Promise<LoanRepaymentEntity> {
    this.logger.log(`Processing repayment for loan ${loanListingId}: ${amount}`);

    const listing = await this.loanListingRepository.findOne({
      where: { loanListingId },
    });

    if (!listing) {
      throw new NotFoundException('Loan not found');
    }

    if (listing.status !== 'active') {
      throw new BadRequestException('Loan is not active');
    }

    // Create repayment record
    const repayment = this.loanRepaymentRepository.create({
      loanListingId,
      amount,
      paymentMethod,
      status: 'completed',
    });

    const savedRepayment = await this.loanRepaymentRepository.save(repayment);

    // Update remaining balance
    const currentBalance = new Decimal(listing.outstandingBalance || listing.amount);
    const newBalance = currentBalance.minus(amount);

    listing.outstandingBalance = newBalance.toString();

    // Check if fully repaid
    if (newBalance.lessThanOrEqualTo(0)) {
      listing.status = 'repaid';
      listing.repaidAt = new Date();

      this.eventEmitter.emit('loan.fully_repaid', {
        loanListingId,
        borrowerId: listing.borrowerId,
      });
    }

    await this.loanListingRepository.save(listing);

    // Distribute payment to investors
    await this.distributeRepayment(loanListingId, amount);

    this.logger.log(`Repayment processed: ${savedRepayment.repaymentId}`);

    return savedRepayment;
  }

  /**
   * Distribute repayment to all investors proportionally
   */
  private async distributeRepayment(loanListingId: string, totalAmount: string): Promise<void> {
    const investments = await this.loanInvestmentRepository.find({
      where: { loanListingId, status: 'active' as any },
    });

    const listing = await this.loanListingRepository.findOne({
      where: { loanListingId },
    });

    const totalInvested = new Decimal(listing.fundedAmount);
    const paymentAmount = new Decimal(totalAmount);

    for (const investment of investments) {
      const investmentShare = new Decimal(investment.amount).dividedBy(totalInvested);
      const repaymentShare = paymentAmount.times(investmentShare);

      // Emit event for payment to lender
      this.eventEmitter.emit('loan.repayment_distributed', {
        investmentId: investment.investmentId,
        lenderId: investment.lenderId,
        amount: repaymentShare.toString(),
        currency: listing.currency,
      });
    }
  }

  /**
   * Get available loan listings (marketplace)
   */
  async getAvailableListings(
    limit: number = 50,
    riskTier?: string,
  ): Promise<LoanListingEntity[]> {
    const where: any = {
      status: 'open',
    };

    if (riskTier) {
      where.riskTier = riskTier;
    }

    return this.loanListingRepository.find({
      where,
      order: { createdAt: 'DESC' as any },
      take: limit,
    });
  }

  /**
   * Get borrower's loans
   */
  async getBorrowerLoans(borrowerId: string): Promise<LoanListingEntity[]> {
    return this.loanListingRepository.find({
      where: { borrowerId },
      order: { createdAt: 'DESC' as any },
    });
  }

  /**
   * Get lender's investments
   */
  async getLenderInvestments(lenderId: string): Promise<LoanInvestmentEntity[]> {
    return this.loanInvestmentRepository.find({
      where: { lenderId },
      order: { createdAt: 'DESC' as any },
    });
  }

  /**
   * Check for overdue payments (scheduled job)
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkOverduePayments(): Promise<void> {
    const today = new Date();

    const overdueLoans = await this.loanListingRepository.find({
      where: {
        status: 'active' as any,
        firstPaymentDue: { $lte: today } as any,
      },
    });

    for (const loan of overdueLoans) {
      // Check if payment received
      const lastPayment = await this.loanRepaymentRepository.findOne({
        where: { loanListingId: loan.loanListingId },
        order: { createdAt: 'DESC' as any },
      });

      const daysSinceLastPayment = lastPayment
        ? Math.floor((today.getTime() - lastPayment.createdAt.getTime()) / (1000 * 60 * 60 * 24))
        : Math.floor((today.getTime() - loan.disbursedAt.getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceLastPayment > 30) {
        // Mark as late
        loan.status = 'late';
        await this.loanListingRepository.save(loan);

        // Notify borrower and lenders
        this.eventEmitter.emit('loan.payment_overdue', {
          loanListingId: loan.loanListingId,
          borrowerId: loan.borrowerId,
          daysOverdue: daysSinceLastPayment - 30,
        });
      }
    }

    this.logger.log(`Checked ${overdueLoans.length} loans for overdue payments`);
  }

  // Helper methods

  private calculateRiskTier(creditScore: number): string {
    if (creditScore >= this.riskTiers.excellent.minScore) return 'excellent';
    if (creditScore >= this.riskTiers.good.minScore) return 'good';
    if (creditScore >= this.riskTiers.fair.minScore) return 'fair';
    return 'poor';
  }

  private calculateMonthlyPayment(
    principal: Decimal,
    annualRate: number,
    term: number,
  ): Decimal {
    const monthlyRate = new Decimal(annualRate).dividedBy(100).dividedBy(12);

    if (monthlyRate.isZero()) {
      return principal.dividedBy(term);
    }

    const numerator = principal.times(monthlyRate).times(
      monthlyRate.plus(1).pow(term),
    );

    const denominator = monthlyRate.plus(1).pow(term).minus(1);

    return numerator.dividedBy(denominator);
  }
}
