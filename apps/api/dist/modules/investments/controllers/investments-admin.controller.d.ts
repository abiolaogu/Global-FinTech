import { InvestmentsService } from '../services/investments.service';
import { CompanyStatus, CompanyType } from '../entities/investment-company.entity';
import { OpportunityStatus } from '../entities/investment-opportunity.entity';
declare class RegisterCompanyDto {
    companyName: string;
    legalName: string;
    registrationNumber: string;
    companyType: CompanyType;
    description?: string;
    country: string;
    state?: string;
    address: string;
    email: string;
    phone: string;
    website?: string;
    secRegistration?: string;
    finraRegistration?: string;
    licenses?: string[];
    assetsUnderManagement?: string;
    aumCurrency?: string;
    yearEstablished?: number;
    complianceDocuments?: string[];
    logoUrl?: string;
    contactPersonName: string;
    contactPersonEmail: string;
    contactPersonPhone: string;
    contactPersonTitle?: string;
}
declare class ReviewCompanyDto {
    approved: boolean;
    reason?: string;
}
declare class ReviewOpportunityDto {
    action: 'approve' | 'reject' | 'request_changes';
    notes?: string;
}
export declare class InvestmentsAdminController {
    private readonly investmentsService;
    constructor(investmentsService: InvestmentsService);
    getCompanies(status?: CompanyStatus): Promise<{
        message: string;
    }>;
    getCompany(companyId: string): Promise<import("../entities/investment-company.entity").InvestmentCompanyEntity>;
    reviewCompany(companyId: string, req: any, dto: ReviewCompanyDto): Promise<import("../entities/investment-company.entity").InvestmentCompanyEntity>;
    getOpportunities(status?: OpportunityStatus, companyId?: string): Promise<{
        opportunities: import("../entities/investment-opportunity.entity").InvestmentOpportunityEntity[];
        total: number;
    }>;
    reviewOpportunity(opportunityId: string, req: any, dto: ReviewOpportunityDto): Promise<import("../entities/investment-opportunity.entity").InvestmentOpportunityEntity>;
    launchOpportunity(opportunityId: string, req: any): Promise<import("../entities/investment-opportunity.entity").InvestmentOpportunityEntity>;
    toggleOpportunity(opportunityId: string, action: 'pause' | 'unpause'): Promise<{
        message: string;
    }>;
    getStats(): Promise<{
        totalCompanies: number;
        approvedCompanies: number;
        pendingCompanies: number;
        totalOpportunities: number;
        activeOpportunities: number;
        pendingReview: number;
        totalInvested: string;
        totalInvestors: number;
    }>;
}
export declare class CompanyPortalController {
    private readonly investmentsService;
    constructor(investmentsService: InvestmentsService);
    register(dto: RegisterCompanyDto): Promise<import("../entities/investment-company.entity").InvestmentCompanyEntity>;
    getDashboard(req: any): Promise<{
        company: import("../entities/investment-company.entity").InvestmentCompanyEntity;
        stats: {
            totalOpportunities: number;
            activeOpportunities: number;
            totalRaised: string;
            totalInvestors: number;
            averageRating: string;
        };
    }>;
    updateProfile(req: any, data: Partial<RegisterCompanyDto>): Promise<import("../entities/investment-company.entity").InvestmentCompanyEntity>;
    getMyOpportunities(req: any, status?: OpportunityStatus): Promise<{
        opportunities: import("../entities/investment-opportunity.entity").InvestmentOpportunityEntity[];
    }>;
}
export {};
