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
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import { InvestmentsService } from '../services/investments.service';
import {
  InvestmentCategory,
  RiskLevel,
  OpportunityStatus,
} from '../entities/investment-opportunity.entity';
import { TransactionType, TransactionStatus } from '../entities/investment-transaction.entity';

// DTOs would normally be in separate files
class SearchOpportunitiesDto {
  category?: InvestmentCategory;
  riskLevel?: RiskLevel;
  minInvestment?: number;
  maxInvestment?: number;
  search?: string;
  limit?: number;
  offset?: number;
}

class InvestDto {
  opportunityId: string;
  amount: string;
  currency: string;
  paymentMethod?: string;
}

class CreateOpportunityDto {
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

@Controller('investments')
// @UseGuards(AuthGuard) // Add authentication
export class InvestmentsController {
  constructor(private readonly investmentsService: InvestmentsService) {}

  /**
   * Search investment opportunities
   */
  @Get('opportunities/search')
  async searchOpportunities(@Query() filters: SearchOpportunitiesDto) {
    return this.investmentsService.searchOpportunities(filters);
  }

  /**
   * Get trending opportunities
   */
  @Get('opportunities/trending')
  async getTrending(@Query('limit') limit?: number) {
    return this.investmentsService.getTrendingOpportunities(limit);
  }

  /**
   * Get opportunity by ID
   */
  @Get('opportunities/:opportunityId')
  async getOpportunity(@Param('opportunityId') opportunityId: string) {
    return this.investmentsService.getOpportunity(opportunityId);
  }

  /**
   * Invest in opportunity
   */
  @Post('invest')
  @HttpCode(HttpStatus.CREATED)
  async invest(@Request() req, @Body() dto: InvestDto) {
    const userId = req.user?.userId || 'usr_demo'; // Get from auth
    return this.investmentsService.invest(
      userId,
      dto.opportunityId,
      dto.amount,
      dto.currency,
      dto.paymentMethod,
    );
  }

  /**
   * Get user's portfolio
   */
  @Get('portfolio')
  async getPortfolio(@Request() req) {
    const userId = req.user?.userId || 'usr_demo';
    return this.investmentsService.getUserPortfolio(userId);
  }

  /**
   * Get user's transactions
   */
  @Get('transactions')
  async getTransactions(
    @Request() req,
    @Query('type') type?: TransactionType,
    @Query('status') status?: TransactionStatus,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    const userId = req.user?.userId || 'usr_demo';
    return this.investmentsService.getUserTransactions(userId, {
      type,
      status,
      limit,
      offset,
    });
  }

  /**
   * Create investment opportunity (Company portal)
   */
  @Post('companies/:companyId/opportunities')
  @HttpCode(HttpStatus.CREATED)
  async createOpportunity(
    @Param('companyId') companyId: string,
    @Body() dto: CreateOpportunityDto,
  ) {
    return this.investmentsService.createOpportunity(companyId, dto);
  }

  /**
   * Submit opportunity for review
   */
  @Post('opportunities/:opportunityId/submit')
  async submitOpportunity(
    @Param('opportunityId') opportunityId: string,
    @Request() req,
    @Body('companyId') companyId: string,
  ) {
    const userId = req.user?.userId || 'usr_demo';
    return this.investmentsService.submitOpportunity(opportunityId, companyId, userId);
  }

  /**
   * Update opportunity
   */
  @Put('opportunities/:opportunityId')
  async updateOpportunity(
    @Param('opportunityId') opportunityId: string,
    @Body() data: Partial<CreateOpportunityDto>,
  ) {
    // Would call an update method in the service
    return { message: 'Update not implemented in service yet' };
  }
}
