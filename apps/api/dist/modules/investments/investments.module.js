"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvestmentsModule = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const investment_opportunity_entity_1 = require("./entities/investment-opportunity.entity");
const investment_company_entity_1 = require("./entities/investment-company.entity");
const investment_portfolio_entity_1 = require("./entities/investment-portfolio.entity");
const investment_transaction_entity_1 = require("./entities/investment-transaction.entity");
const investments_service_1 = require("./services/investments.service");
const investments_controller_1 = require("./controllers/investments.controller");
const investments_admin_controller_1 = require("./controllers/investments-admin.controller");
let InvestmentsModule = class InvestmentsModule {
};
exports.InvestmentsModule = InvestmentsModule;
exports.InvestmentsModule = InvestmentsModule = __decorate([
    (0, common_1.Module)({
        imports: [
            typeorm_1.TypeOrmModule.forFeature([
                investment_opportunity_entity_1.InvestmentOpportunityEntity,
                investment_company_entity_1.InvestmentCompanyEntity,
                investment_portfolio_entity_1.InvestmentPortfolioEntity,
                investment_transaction_entity_1.InvestmentTransactionEntity,
            ]),
        ],
        controllers: [
            investments_controller_1.InvestmentsController,
            investments_admin_controller_1.InvestmentsAdminController,
            investments_admin_controller_1.CompanyPortalController,
        ],
        providers: [investments_service_1.InvestmentsService],
        exports: [investments_service_1.InvestmentsService],
    })
], InvestmentsModule);
//# sourceMappingURL=investments.module.js.map