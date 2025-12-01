import { InvestmentOpportunityEntity } from './investment-opportunity.entity';
export declare enum CompanyStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    SUSPENDED = "suspended"
}
export declare enum CompanyType {
    ASSET_MANAGER = "asset_manager",
    VENTURE_CAPITAL = "venture_capital",
    PRIVATE_EQUITY = "private_equity",
    HEDGE_FUND = "hedge_fund",
    REAL_ESTATE = "real_estate",
    CROWDFUNDING = "crowdfunding",
    BROKER_DEALER = "broker_dealer"
}
export declare class InvestmentCompanyEntity {
    companyId: string;
    companyName: string;
    legalName: string;
    registrationNumber: string;
    companyType: CompanyType;
    status: CompanyStatus;
    description: string;
    country: string;
    state: string;
    address: string;
    email: string;
    phone: string;
    website: string;
    secRegistration: string;
    finraRegistration: string;
    licenses: string[];
    regulatoryApprovals: string[];
    assetsUnderManagement: string;
    aumCurrency: string;
    yearEstablished: number;
    totalInvestors: number;
    complianceDocuments: string[];
    logoUrl: string;
    contactPersonName: string;
    contactPersonEmail: string;
    contactPersonPhone: string;
    contactPersonTitle: string;
    totalOpportunities: number;
    activeOpportunities: number;
    totalRaised: string;
    averageRating: string;
    totalReviews: number;
    approvedBy: string;
    approvedAt: Date;
    rejectionReason: string;
    internalNotes: string;
    opportunities: InvestmentOpportunityEntity[];
    createdAt: Date;
    updatedAt: Date;
}
