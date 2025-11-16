import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { InvestmentOpportunityEntity } from './entities/investment-opportunity.entity';
import { InvestmentCompanyEntity } from './entities/investment-company.entity';
import { InvestmentPortfolioEntity } from './entities/investment-portfolio.entity';
import { InvestmentTransactionEntity } from './entities/investment-transaction.entity';
import { InvestmentsService } from './services/investments.service';
import { InvestmentsController } from './controllers/investments.controller';
import {
  InvestmentsAdminController,
  CompanyPortalController,
} from './controllers/investments-admin.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      InvestmentOpportunityEntity,
      InvestmentCompanyEntity,
      InvestmentPortfolioEntity,
      InvestmentTransactionEntity,
    ]),
  ],
  controllers: [
    InvestmentsController,
    InvestmentsAdminController,
    CompanyPortalController,
  ],
  providers: [InvestmentsService],
  exports: [InvestmentsService],
})
export class InvestmentsModule {}
