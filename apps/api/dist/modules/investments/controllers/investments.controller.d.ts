import { InvestmentsService } from '../services/investments.service';
import { InvestmentCategory, RiskLevel } from '../entities/investment-opportunity.entity';
import { TransactionType, TransactionStatus } from '../entities/investment-transaction.entity';
declare class SearchOpportunitiesDto {
    category?: InvestmentCategory;
    riskLevel?: RiskLevel;
    minInvestment?: number;
    maxInvestment?: number;
    search?: string;
    limit?: number;
    offset?: number;
}
declare class InvestDto {
    opportunityId: string;
    amount: string;
    currency: string;
    paymentMethod?: string;
}
declare class CreateOpportunityDto {
    title: string;
    description: string;
    category: InvestmentCategory;
    riskLevel: RiskLevel;
    minimumInvestment: string;
    maximumInvestment?: string;
    currency: string;
    targetAmount?: string;
    projectedReturn?: string;
    investmentTerm?: number;
    liquidityType?: string;
    managementFee?: string;
    performanceFee?: string;
    entryFee?: string;
    exitFee?: string;
    startDate?: Date;
    endDate?: Date;
    assetClass?: string;
    sector?: string;
    tags?: string[];
    geographies?: string[];
    prospectusUrls?: string[];
    factSheetUrls?: string[];
    thumbnailUrl?: string;
    regulatoryFramework?: string;
    accreditedInvestorsOnly?: boolean;
}
export declare class InvestmentsController {
    private readonly investmentsService;
    constructor(investmentsService: InvestmentsService);
    searchOpportunities(filters: SearchOpportunitiesDto): Promise<{
        opportunities: import("../entities/investment-opportunity.entity").InvestmentOpportunityEntity[];
        total: number;
    }>;
    getTrending(limit?: number): Promise<import("../entities/investment-opportunity.entity").InvestmentOpportunityEntity[]>;
    getOpportunity(opportunityId: string): Promise<import("../entities/investment-opportunity.entity").InvestmentOpportunityEntity>;
    invest(req: any, dto: InvestDto): Promise<import("../entities/investment-transaction.entity").InvestmentTransactionEntity>;
    getPortfolio(req: any): Promise<{
        summary: any;
        holdings: import("../entities/investment-portfolio.entity").InvestmentPortfolioEntity[];
    }>;
    getTransactions(req: any, type?: TransactionType, status?: TransactionStatus, limit?: number, offset?: number): Promise<import("../entities/investment-transaction.entity").InvestmentTransactionEntity[]>;
    createOpportunity(companyId: string, dto: CreateOpportunityDto): Promise<import("../entities/investment-opportunity.entity").InvestmentOpportunityEntity>;
    submitOpportunity(opportunityId: string, req: any, companyId: string): Promise<import("../entities/investment-opportunity.entity").InvestmentOpportunityEntity>;
    updateOpportunity(opportunityId: string, data: Partial<CreateOpportunityDto>): Promise<{
        message: string;
    }>;
}
export {};
