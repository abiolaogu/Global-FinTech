import { InvestmentCompanyEntity } from './investment-company.entity';
import { InvestmentTransactionEntity } from './investment-transaction.entity';
export declare enum InvestmentCategory {
    STOCKS = "stocks",
    BONDS = "bonds",
    MUTUAL_FUNDS = "mutual_funds",
    ETF = "etf",
    REAL_ESTATE = "real_estate",
    COMMODITIES = "commodities",
    CRYPTOCURRENCY = "cryptocurrency",
    PRIVATE_EQUITY = "private_equity",
    VENTURE_CAPITAL = "venture_capital",
    HEDGE_FUNDS = "hedge_funds",
    STRUCTURED_PRODUCTS = "structured_products",
    ALTERNATIVE_INVESTMENTS = "alternative_investments"
}
export declare enum RiskLevel {
    VERY_LOW = "very_low",
    LOW = "low",
    MODERATE = "moderate",
    HIGH = "high",
    VERY_HIGH = "very_high"
}
export declare enum OpportunityStatus {
    DRAFT = "draft",
    SUBMITTED = "submitted",
    UNDER_REVIEW = "under_review",
    APPROVED = "approved",
    REJECTED = "rejected",
    ACTIVE = "active",
    PAUSED = "paused",
    CLOSED = "closed",
    CANCELLED = "cancelled"
}
export declare class InvestmentOpportunityEntity {
    opportunityId: string;
    companyId: string;
    company: InvestmentCompanyEntity;
    title: string;
    slug: string;
    description: string;
    category: InvestmentCategory;
    riskLevel: RiskLevel;
    status: OpportunityStatus;
    minimumInvestment: string;
    maximumInvestment: string;
    currency: string;
    targetAmount: string;
    raisedAmount: string;
    projectedReturn: string;
    historicalReturn: string;
    investmentTerm: number;
    liquidityType: string;
    managementFee: string;
    performanceFee: string;
    entryFee: string;
    exitFee: string;
    startDate: Date;
    endDate: Date;
    maturityDate: Date;
    assetClass: string;
    sector: string;
    tags: string[];
    geographies: string[];
    prospectusUrls: string[];
    factSheetUrls: string[];
    legalDocuments: string[];
    thumbnailUrl: string;
    imageUrls: string[];
    regulatoryFramework: string;
    accreditedInvestorsOnly: boolean;
    complianceCertifications: string[];
    totalInvestors: number;
    averageRating: string;
    totalReviews: number;
    viewCount: number;
    bookmarkCount: number;
    autoInvestEnabled: boolean;
    dividendReinvestment: boolean;
    dividendFrequency: string;
    keyHighlights: string;
    performanceHistory: any;
    allocationBreakdown: any;
    submittedBy: string;
    submittedAt: Date;
    reviewedBy: string;
    reviewedAt: Date;
    approvedBy: string;
    approvedAt: Date;
    launchedBy: string;
    launchedAt: Date;
    rejectionReason: string;
    reviewNotes: string;
    transactions: InvestmentTransactionEntity[];
    createdAt: Date;
    updatedAt: Date;
}
