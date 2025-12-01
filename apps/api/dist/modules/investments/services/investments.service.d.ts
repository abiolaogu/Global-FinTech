import { Repository, DataSource } from 'typeorm';
import { InvestmentOpportunityEntity, OpportunityStatus, InvestmentCategory, RiskLevel } from '../entities/investment-opportunity.entity';
import { InvestmentCompanyEntity } from '../entities/investment-company.entity';
import { InvestmentPortfolioEntity } from '../entities/investment-portfolio.entity';
import { InvestmentTransactionEntity, TransactionType, TransactionStatus } from '../entities/investment-transaction.entity';
export declare class InvestmentsService {
    private readonly opportunityRepository;
    private readonly companyRepository;
    private readonly portfolioRepository;
    private readonly transactionRepository;
    private readonly dataSource;
    private readonly logger;
    constructor(opportunityRepository: Repository<InvestmentOpportunityEntity>, companyRepository: Repository<InvestmentCompanyEntity>, portfolioRepository: Repository<InvestmentPortfolioEntity>, transactionRepository: Repository<InvestmentTransactionEntity>, dataSource: DataSource);
    registerCompany(data: Partial<InvestmentCompanyEntity>): Promise<InvestmentCompanyEntity>;
    getCompany(companyId: string): Promise<InvestmentCompanyEntity>;
    updateCompany(companyId: string, data: Partial<InvestmentCompanyEntity>): Promise<InvestmentCompanyEntity>;
    reviewCompany(companyId: string, adminId: string, approved: boolean, reason?: string): Promise<InvestmentCompanyEntity>;
    createOpportunity(companyId: string, data: Partial<InvestmentOpportunityEntity>): Promise<InvestmentOpportunityEntity>;
    submitOpportunity(opportunityId: string, companyId: string, submittedBy: string): Promise<InvestmentOpportunityEntity>;
    reviewOpportunity(opportunityId: string, adminId: string, action: 'approve' | 'reject' | 'request_changes', notes?: string): Promise<InvestmentOpportunityEntity>;
    launchOpportunity(opportunityId: string, adminId: string): Promise<InvestmentOpportunityEntity>;
    getOpportunity(opportunityId: string): Promise<InvestmentOpportunityEntity>;
    searchOpportunities(filters: {
        category?: InvestmentCategory;
        riskLevel?: RiskLevel;
        minInvestment?: number;
        maxInvestment?: number;
        search?: string;
        status?: OpportunityStatus;
        limit?: number;
        offset?: number;
    }): Promise<{
        opportunities: InvestmentOpportunityEntity[];
        total: number;
    }>;
    invest(userId: string, opportunityId: string, amount: string, currency: string, paymentMethod?: string): Promise<InvestmentTransactionEntity>;
    getUserPortfolio(userId: string): Promise<{
        summary: any;
        holdings: InvestmentPortfolioEntity[];
    }>;
    getUserTransactions(userId: string, filters?: {
        type?: TransactionType;
        status?: TransactionStatus;
        limit?: number;
        offset?: number;
    }): Promise<InvestmentTransactionEntity[]>;
    getTrendingOpportunities(limit?: number): Promise<InvestmentOpportunityEntity[]>;
    private validateOpportunity;
    private generateSlug;
}
