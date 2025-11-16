import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { InvestmentsService } from '../services/investments.service';
import { CompanyStatus, CompanyType } from '../entities/investment-company.entity';
import { OpportunityStatus } from '../entities/investment-opportunity.entity';

class RegisterCompanyDto {
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

class ReviewCompanyDto {
  approved: boolean;
  reason?: string;
}

class ReviewOpportunityDto {
  action: 'approve' | 'reject' | 'request_changes';
  notes?: string;
}

/**
 * Admin controller for managing investment companies and opportunities
 * AtlasX team uses this to approve/reject submissions
 */
@Controller('admin/investments')
// @UseGuards(AuthGuard, AdminGuard) // Add admin authentication
export class InvestmentsAdminController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  /**
   * Get all companies (with filtering)
   */
  @Get('companies')
  async getCompanies(@Query('status') status?: CompanyStatus) {
    // Would implement a getCompanies method in service
    return { message: 'Get companies - to be implemented' };
  }

  /**
   * Get company details
   */
  @Get('companies/:companyId')
  async getCompany(@Param('companyId') companyId: string) {
    return this.investmentsService.getCompany(companyId);
  }

  /**
   * Review company application
   */
  @Post('companies/:companyId/review')
  @HttpCode(HttpStatus.OK)
  async reviewCompany(
    @Param('companyId') companyId: string,
    @Request() req,
    @Body() dto: ReviewCompanyDto,
  ) {
    const adminId = req.user?.userId || 'admin_demo';
    return this.investmentsService.reviewCompany(
      companyId,
      adminId,
      dto.approved,
      dto.reason,
    );
  }

  /**
   * Get all opportunities (with filtering)
   */
  @Get('opportunities')
  async getOpportunities(
    @Query('status') status?: OpportunityStatus,
    @Query('companyId') companyId?: string,
  ) {
    return this.investmentsService.searchOpportunities({
      status,
      limit: 100,
    });
  }

  /**
   * Review opportunity
   */
  @Post('opportunities/:opportunityId/review')
  @HttpCode(HttpStatus.OK)
  async reviewOpportunity(
    @Param('opportunityId') opportunityId: string,
    @Request() req,
    @Body() dto: ReviewOpportunityDto,
  ) {
    const adminId = req.user?.userId || 'admin_demo';
    return this.investmentsService.reviewOpportunity(
      opportunityId,
      adminId,
      dto.action,
      dto.notes,
    );
  }

  /**
   * Launch opportunity (make it live)
   */
  @Post('opportunities/:opportunityId/launch')
  @HttpCode(HttpStatus.OK)
  async launchOpportunity(
    @Param('opportunityId') opportunityId: string,
    @Request() req,
  ) {
    const adminId = req.user?.userId || 'admin_demo';
    return this.investmentsService.launchOpportunity(opportunityId, adminId);
  }

  /**
   * Pause/unpause opportunity
   */
  @Post('opportunities/:opportunityId/:action(pause|unpause)')
  @HttpCode(HttpStatus.OK)
  async toggleOpportunity(
    @Param('opportunityId') opportunityId: string,
    @Param('action') action: 'pause' | 'unpause',
  ) {
    // Would implement pause/unpause logic
    return { message: `Opportunity ${action}d successfully` };
  }

  /**
   * Get platform statistics
   */
  @Get('stats')
  async getStats() {
    // Would implement comprehensive stats
    return {
      totalCompanies: 0,
      approvedCompanies: 0,
      pendingCompanies: 0,
      totalOpportunities: 0,
      activeOpportunities: 0,
      pendingReview: 0,
      totalInvested: '0',
      totalInvestors: 0,
    };
  }
}

/**
 * Company portal controller
 * Investment companies use this to manage their account and opportunities
 */
@Controller('company-portal')
// @UseGuards(AuthGuard, CompanyGuard)
export class CompanyPortalController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  /**
   * Register new company
   */
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(@Body() dto: RegisterCompanyDto) {
    return this.investmentsService.registerCompany(dto);
  }

  /**
   * Get company dashboard
   */
  @Get('dashboard')
  async getDashboard(@Request() req) {
    const companyId = req.user?.companyId || 'comp_demo';
    const company = await this.investmentsService.getCompany(companyId);

    return {
      company,
      stats: {
        totalOpportunities: company.totalOpportunities,
        activeOpportunities: company.activeOpportunities,
        totalRaised: company.totalRaised,
        totalInvestors: company.totalInvestors,
        averageRating: company.averageRating,
      },
    };
  }

  /**
   * Update company profile
   */
  @Put('profile')
  async updateProfile(@Request() req, @Body() data: Partial<RegisterCompanyDto>) {
    const companyId = req.user?.companyId || 'comp_demo';
    return this.investmentsService.updateCompany(companyId, data);
  }

  /**
   * Get company's opportunities
   */
  @Get('opportunities')
  async getMyOpportunities(@Request() req, @Query('status') status?: OpportunityStatus) {
    const companyId = req.user?.companyId || 'comp_demo';
    const company = await this.investmentsService.getCompany(companyId);
    return { opportunities: company.opportunities };
  }
}
