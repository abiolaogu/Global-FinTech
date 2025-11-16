import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, Between, MoreThan, LessThan } from 'typeorm';
import {
  InvestmentOpportunityEntity,
  OpportunityStatus,
  InvestmentCategory,
  RiskLevel,
} from '../entities/investment-opportunity.entity';
import {
  InvestmentCompanyEntity,
  CompanyStatus,
} from '../entities/investment-company.entity';
import { InvestmentPortfolioEntity } from '../entities/investment-portfolio.entity';
import {
  InvestmentTransactionEntity,
  TransactionType,
  TransactionStatus,
} from '../entities/investment-transaction.entity';

@Injectable()
export class InvestmentsService {
  private readonly logger = new Logger(InvestmentsService.name);

  constructor(
    @InjectRepository(InvestmentOpportunityEntity)
    private readonly opportunityRepository: Repository<InvestmentOpportunityEntity>,
    @InjectRepository(InvestmentCompanyEntity)
    private readonly companyRepository: Repository<InvestmentCompanyEntity>,
    @InjectRepository(InvestmentPortfolioEntity)
    private readonly portfolioRepository: Repository<InvestmentPortfolioEntity>,
    @InjectRepository(InvestmentTransactionEntity)
    private readonly transactionRepository: Repository<InvestmentTransactionEntity>,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Register a new investment company
   */
  async registerCompany(data: Partial<InvestmentCompanyEntity>): Promise<InvestmentCompanyEntity> {
    const company = this.companyRepository.create({
      ...data,
      status: CompanyStatus.PENDING,
    });

    return this.companyRepository.save(company);
  }

  /**
   * Get company by ID
   */
  async getCompany(companyId: string): Promise<InvestmentCompanyEntity> {
    const company = await this.companyRepository.findOne({
      where: { companyId },
      relations: ['opportunities'],
    });

    if (!company) {
      throw new NotFoundException('Investment company not found');
    }

    return company;
  }

  /**
   * Update company details
   */
  async updateCompany(
    companyId: string,
    data: Partial<InvestmentCompanyEntity>,
  ): Promise<InvestmentCompanyEntity> {
    const company = await this.getCompany(companyId);

    // Prevent updating certain fields
    delete data.status;
    delete data.approvedBy;
    delete data.approvedAt;

    Object.assign(company, data);
    return this.companyRepository.save(company);
  }

  /**
   * Approve or reject company (Admin only)
   */
  async reviewCompany(
    companyId: string,
    adminId: string,
    approved: boolean,
    reason?: string,
  ): Promise<InvestmentCompanyEntity> {
    const company = await this.getCompany(companyId);

    company.status = approved ? CompanyStatus.APPROVED : CompanyStatus.REJECTED;
    company.approvedBy = adminId;
    company.approvedAt = new Date();

    if (!approved && reason) {
      company.rejectionReason = reason;
    }

    return this.companyRepository.save(company);
  }

  /**
   * Create investment opportunity (by company)
   */
  async createOpportunity(
    companyId: string,
    data: Partial<InvestmentOpportunityEntity>,
  ): Promise<InvestmentOpportunityEntity> {
    const company = await this.getCompany(companyId);

    if (company.status !== CompanyStatus.APPROVED) {
      throw new ForbiddenException('Company must be approved to create opportunities');
    }

    // Generate slug from title
    const slug = this.generateSlug(data.title);

    const opportunity = this.opportunityRepository.create({
      ...data,
      companyId,
      slug,
      status: OpportunityStatus.DRAFT,
    });

    const saved = await this.opportunityRepository.save(opportunity);

    // Update company stats
    await this.companyRepository.increment({ companyId }, 'totalOpportunities', 1);

    return saved;
  }

  /**
   * Submit opportunity for review
   */
  async submitOpportunity(
    opportunityId: string,
    companyId: string,
    submittedBy: string,
  ): Promise<InvestmentOpportunityEntity> {
    const opportunity = await this.getOpportunity(opportunityId);

    if (opportunity.companyId !== companyId) {
      throw new ForbiddenException('Unauthorized');
    }

    if (opportunity.status !== OpportunityStatus.DRAFT) {
      throw new BadRequestException('Only draft opportunities can be submitted');
    }

    // Validate required fields
    this.validateOpportunity(opportunity);

    opportunity.status = OpportunityStatus.SUBMITTED;
    opportunity.submittedBy = submittedBy;
    opportunity.submittedAt = new Date();

    return this.opportunityRepository.save(opportunity);
  }

  /**
   * Review opportunity (Admin - AtlasX team)
   */
  async reviewOpportunity(
    opportunityId: string,
    adminId: string,
    action: 'approve' | 'reject' | 'request_changes',
    notes?: string,
  ): Promise<InvestmentOpportunityEntity> {
    const opportunity = await this.getOpportunity(opportunityId);

    if (opportunity.status !== OpportunityStatus.SUBMITTED) {
      throw new BadRequestException('Only submitted opportunities can be reviewed');
    }

    opportunity.reviewedBy = adminId;
    opportunity.reviewedAt = new Date();
    opportunity.reviewNotes = notes;

    switch (action) {
      case 'approve':
        opportunity.status = OpportunityStatus.APPROVED;
        opportunity.approvedBy = adminId;
        opportunity.approvedAt = new Date();
        break;
      case 'reject':
        opportunity.status = OpportunityStatus.REJECTED;
        opportunity.rejectionReason = notes;
        break;
      case 'request_changes':
        opportunity.status = OpportunityStatus.DRAFT;
        break;
    }

    return this.opportunityRepository.save(opportunity);
  }

  /**
   * Launch opportunity (make it active and visible to users)
   */
  async launchOpportunity(
    opportunityId: string,
    adminId: string,
  ): Promise<InvestmentOpportunityEntity> {
    const opportunity = await this.getOpportunity(opportunityId);

    if (opportunity.status !== OpportunityStatus.APPROVED) {
      throw new BadRequestException('Only approved opportunities can be launched');
    }

    opportunity.status = OpportunityStatus.ACTIVE;
    opportunity.launchedBy = adminId;
    opportunity.launchedAt = new Date();

    const saved = await this.opportunityRepository.save(opportunity);

    // Update company stats
    await this.companyRepository.increment(
      { companyId: opportunity.companyId },
      'activeOpportunities',
      1,
    );

    return saved;
  }

  /**
   * Get opportunity by ID
   */
  async getOpportunity(opportunityId: string): Promise<InvestmentOpportunityEntity> {
    const opportunity = await this.opportunityRepository.findOne({
      where: { opportunityId },
      relations: ['company'],
    });

    if (!opportunity) {
      throw new NotFoundException('Investment opportunity not found');
    }

    // Increment view count
    await this.opportunityRepository.increment({ opportunityId }, 'viewCount', 1);

    return opportunity;
  }

  /**
   * Search investment opportunities
   */
  async searchOpportunities(filters: {
    category?: InvestmentCategory;
    riskLevel?: RiskLevel;
    minInvestment?: number;
    maxInvestment?: number;
    search?: string;
    status?: OpportunityStatus;
    limit?: number;
    offset?: number;
  }): Promise<{ opportunities: InvestmentOpportunityEntity[]; total: number }> {
    const queryBuilder = this.opportunityRepository
      .createQueryBuilder('opportunity')
      .leftJoinAndSelect('opportunity.company', 'company')
      .where('opportunity.status = :status', {
        status: filters.status || OpportunityStatus.ACTIVE,
      });

    if (filters.category) {
      queryBuilder.andWhere('opportunity.category = :category', {
        category: filters.category,
      });
    }

    if (filters.riskLevel) {
      queryBuilder.andWhere('opportunity.riskLevel = :riskLevel', {
        riskLevel: filters.riskLevel,
      });
    }

    if (filters.minInvestment) {
      queryBuilder.andWhere('opportunity.minimumInvestment >= :minInvestment', {
        minInvestment: filters.minInvestment.toString(),
      });
    }

    if (filters.maxInvestment) {
      queryBuilder.andWhere('opportunity.minimumInvestment <= :maxInvestment', {
        maxInvestment: filters.maxInvestment.toString(),
      });
    }

    if (filters.search) {
      queryBuilder.andWhere(
        '(opportunity.title ILIKE :search OR opportunity.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    const total = await queryBuilder.getCount();

    queryBuilder
      .orderBy('opportunity.createdAt', 'DESC')
      .skip(filters.offset || 0)
      .take(filters.limit || 20);

    const opportunities = await queryBuilder.getMany();

    return { opportunities, total };
  }

  /**
   * Invest in an opportunity
   */
  async invest(
    userId: string,
    opportunityId: string,
    amount: string,
    currency: string,
    paymentMethod?: string,
  ): Promise<InvestmentTransactionEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const opportunity = await queryRunner.manager.findOne(InvestmentOpportunityEntity, {
        where: { opportunityId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!opportunity) {
        throw new NotFoundException('Investment opportunity not found');
      }

      if (opportunity.status !== OpportunityStatus.ACTIVE) {
        throw new BadRequestException('Investment opportunity is not active');
      }

      const amountNum = parseFloat(amount);
      const minInvestment = parseFloat(opportunity.minimumInvestment);

      if (amountNum < minInvestment) {
        throw new BadRequestException(
          `Minimum investment is ${opportunity.currency} ${minInvestment}`,
        );
      }

      if (opportunity.maximumInvestment) {
        const maxInvestment = parseFloat(opportunity.maximumInvestment);
        if (amountNum > maxInvestment) {
          throw new BadRequestException(
            `Maximum investment is ${opportunity.currency} ${maxInvestment}`,
          );
        }
      }

      // Calculate fees
      const entryFee = (amountNum * parseFloat(opportunity.entryFee)) / 100;
      const totalFees = entryFee;
      const netAmount = amountNum - totalFees;

      // Calculate shares (simplified - price per share could be dynamic)
      const pricePerShare = parseFloat(opportunity.minimumInvestment) / 10; // Simplified
      const shares = netAmount / pricePerShare;

      // Create transaction
      const transaction = queryRunner.manager.create(InvestmentTransactionEntity, {
        userId,
        opportunityId,
        type: TransactionType.BUY,
        status: TransactionStatus.PROCESSING,
        shares: shares.toString(),
        pricePerShare: pricePerShare.toString(),
        amount,
        currency,
        entryFee: entryFee.toString(),
        totalFees: totalFees.toString(),
        netAmount: netAmount.toString(),
        paymentMethod,
      });

      const savedTransaction = await queryRunner.manager.save(transaction);

      // Update or create portfolio
      let portfolio = await queryRunner.manager.findOne(InvestmentPortfolioEntity, {
        where: { userId, opportunityId },
      });

      if (portfolio) {
        // Update existing portfolio
        const currentShares = parseFloat(portfolio.shares);
        const currentInvested = parseFloat(portfolio.totalInvested);
        const newShares = currentShares + shares;
        const newInvested = currentInvested + amountNum;

        portfolio.shares = newShares.toString();
        portfolio.totalInvested = newInvested.toString();
        portfolio.averageBuyPrice = (newInvested / newShares).toString();
        portfolio.lastInvestmentDate = new Date();
        portfolio.totalTransactions += 1;
        portfolio.buyTransactions += 1;
        portfolio.totalFeesPaid = (parseFloat(portfolio.totalFeesPaid) + totalFees).toString();
      } else {
        // Create new portfolio
        portfolio = queryRunner.manager.create(InvestmentPortfolioEntity, {
          userId,
          opportunityId,
          shares: shares.toString(),
          totalInvested: amount,
          currentValue: netAmount.toString(),
          currency,
          averageBuyPrice: pricePerShare.toString(),
          firstInvestmentDate: new Date(),
          lastInvestmentDate: new Date(),
          totalTransactions: 1,
          buyTransactions: 1,
          totalFeesPaid: totalFees.toString(),
        });
      }

      await queryRunner.manager.save(portfolio);

      // Update opportunity stats
      const currentRaised = parseFloat(opportunity.raisedAmount);
      opportunity.raisedAmount = (currentRaised + amountNum).toString();
      opportunity.totalInvestors += 1;

      await queryRunner.manager.save(opportunity);

      // Update company stats
      await queryRunner.manager.increment(
        InvestmentCompanyEntity,
        { companyId: opportunity.companyId },
        'totalRaised',
        amountNum,
      );
      await queryRunner.manager.increment(
        InvestmentCompanyEntity,
        { companyId: opportunity.companyId },
        'totalInvestors',
        1,
      );

      // Mark transaction as completed (in real implementation, wait for payment confirmation)
      savedTransaction.status = TransactionStatus.COMPLETED;
      savedTransaction.processedAt = new Date();
      savedTransaction.completedAt = new Date();
      savedTransaction.portfolioId = portfolio.portfolioId;

      await queryRunner.manager.save(savedTransaction);

      await queryRunner.commitTransaction();

      return savedTransaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get user's investment portfolio
   */
  async getUserPortfolio(userId: string): Promise<{
    summary: any;
    holdings: InvestmentPortfolioEntity[];
  }> {
    const holdings = await this.portfolioRepository.find({
      where: { userId, isActive: true },
      order: { currentValue: 'DESC' },
    });

    const totalInvested = holdings.reduce(
      (sum, h) => sum + parseFloat(h.totalInvested),
      0,
    );
    const totalValue = holdings.reduce((sum, h) => sum + parseFloat(h.currentValue), 0);
    const totalGainLoss = totalValue - totalInvested;
    const totalGainLossPercent = totalInvested > 0 ? (totalGainLoss / totalInvested) * 100 : 0;

    const summary = {
      totalInvested: totalInvested.toFixed(2),
      totalValue: totalValue.toFixed(2),
      totalGainLoss: totalGainLoss.toFixed(2),
      totalGainLossPercent: totalGainLossPercent.toFixed(2),
      totalHoldings: holdings.length,
    };

    return { summary, holdings };
  }

  /**
   * Get user's investment transactions
   */
  async getUserTransactions(
    userId: string,
    filters?: {
      type?: TransactionType;
      status?: TransactionStatus;
      limit?: number;
      offset?: number;
    },
  ): Promise<InvestmentTransactionEntity[]> {
    const where: any = { userId };

    if (filters?.type) where.type = filters.type;
    if (filters?.status) where.status = filters.status;

    return this.transactionRepository.find({
      where,
      order: { createdAt: 'DESC' },
      take: filters?.limit || 50,
      skip: filters?.offset || 0,
      relations: ['opportunity'],
    });
  }

  /**
   * Get trending/popular opportunities
   */
  async getTrendingOpportunities(limit = 10): Promise<InvestmentOpportunityEntity[]> {
    return this.opportunityRepository.find({
      where: { status: OpportunityStatus.ACTIVE },
      order: { viewCount: 'DESC', totalInvestors: 'DESC' },
      take: limit,
    });
  }

  /**
   * Validate opportunity before submission
   */
  private validateOpportunity(opportunity: InvestmentOpportunityEntity): void {
    const required = [
      'title',
      'description',
      'category',
      'riskLevel',
      'minimumInvestment',
      'currency',
    ];

    for (const field of required) {
      if (!opportunity[field]) {
        throw new BadRequestException(`Missing required field: ${field}`);
      }
    }

    if (parseFloat(opportunity.minimumInvestment) <= 0) {
      throw new BadRequestException('Minimum investment must be greater than 0');
    }

    if (opportunity.prospectusUrls?.length === 0 && opportunity.factSheetUrls?.length === 0) {
      throw new BadRequestException('At least one prospectus or fact sheet is required');
    }
  }

  /**
   * Generate URL slug from title
   */
  private generateSlug(title: string): string {
    return (
      title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') +
      '-' +
      Date.now()
    );
  }
}
