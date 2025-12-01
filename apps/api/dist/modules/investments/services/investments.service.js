"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var InvestmentsService_1;
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.InvestmentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const investment_opportunity_entity_1 = require("../entities/investment-opportunity.entity");
const investment_company_entity_1 = require("../entities/investment-company.entity");
const investment_portfolio_entity_1 = require("../entities/investment-portfolio.entity");
const investment_transaction_entity_1 = require("../entities/investment-transaction.entity");
let InvestmentsService = InvestmentsService_1 = class InvestmentsService {
    constructor(opportunityRepository, companyRepository, portfolioRepository, transactionRepository, dataSource) {
        this.opportunityRepository = opportunityRepository;
        this.companyRepository = companyRepository;
        this.portfolioRepository = portfolioRepository;
        this.transactionRepository = transactionRepository;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(InvestmentsService_1.name);
    }
    async registerCompany(data) {
        const company = this.companyRepository.create(Object.assign(Object.assign({}, data), { status: investment_company_entity_1.CompanyStatus.PENDING }));
        return this.companyRepository.save(company);
    }
    async getCompany(companyId) {
        const company = await this.companyRepository.findOne({
            where: { companyId },
            relations: ['opportunities'],
        });
        if (!company) {
            throw new common_1.NotFoundException('Investment company not found');
        }
        return company;
    }
    async updateCompany(companyId, data) {
        const company = await this.getCompany(companyId);
        delete data.status;
        delete data.approvedBy;
        delete data.approvedAt;
        Object.assign(company, data);
        return this.companyRepository.save(company);
    }
    async reviewCompany(companyId, adminId, approved, reason) {
        const company = await this.getCompany(companyId);
        company.status = approved ? investment_company_entity_1.CompanyStatus.APPROVED : investment_company_entity_1.CompanyStatus.REJECTED;
        company.approvedBy = adminId;
        company.approvedAt = new Date();
        if (!approved && reason) {
            company.rejectionReason = reason;
        }
        return this.companyRepository.save(company);
    }
    async createOpportunity(companyId, data) {
        const company = await this.getCompany(companyId);
        if (company.status !== investment_company_entity_1.CompanyStatus.APPROVED) {
            throw new common_1.ForbiddenException('Company must be approved to create opportunities');
        }
        const slug = this.generateSlug(data.title);
        const opportunity = this.opportunityRepository.create(Object.assign(Object.assign({}, data), { companyId,
            slug, status: investment_opportunity_entity_1.OpportunityStatus.DRAFT }));
        const saved = await this.opportunityRepository.save(opportunity);
        await this.companyRepository.increment({ companyId }, 'totalOpportunities', 1);
        return saved;
    }
    async submitOpportunity(opportunityId, companyId, submittedBy) {
        const opportunity = await this.getOpportunity(opportunityId);
        if (opportunity.companyId !== companyId) {
            throw new common_1.ForbiddenException('Unauthorized');
        }
        if (opportunity.status !== investment_opportunity_entity_1.OpportunityStatus.DRAFT) {
            throw new common_1.BadRequestException('Only draft opportunities can be submitted');
        }
        this.validateOpportunity(opportunity);
        opportunity.status = investment_opportunity_entity_1.OpportunityStatus.SUBMITTED;
        opportunity.submittedBy = submittedBy;
        opportunity.submittedAt = new Date();
        return this.opportunityRepository.save(opportunity);
    }
    async reviewOpportunity(opportunityId, adminId, action, notes) {
        const opportunity = await this.getOpportunity(opportunityId);
        if (opportunity.status !== investment_opportunity_entity_1.OpportunityStatus.SUBMITTED) {
            throw new common_1.BadRequestException('Only submitted opportunities can be reviewed');
        }
        opportunity.reviewedBy = adminId;
        opportunity.reviewedAt = new Date();
        opportunity.reviewNotes = notes;
        switch (action) {
            case 'approve':
                opportunity.status = investment_opportunity_entity_1.OpportunityStatus.APPROVED;
                opportunity.approvedBy = adminId;
                opportunity.approvedAt = new Date();
                break;
            case 'reject':
                opportunity.status = investment_opportunity_entity_1.OpportunityStatus.REJECTED;
                opportunity.rejectionReason = notes;
                break;
            case 'request_changes':
                opportunity.status = investment_opportunity_entity_1.OpportunityStatus.DRAFT;
                break;
        }
        return this.opportunityRepository.save(opportunity);
    }
    async launchOpportunity(opportunityId, adminId) {
        const opportunity = await this.getOpportunity(opportunityId);
        if (opportunity.status !== investment_opportunity_entity_1.OpportunityStatus.APPROVED) {
            throw new common_1.BadRequestException('Only approved opportunities can be launched');
        }
        opportunity.status = investment_opportunity_entity_1.OpportunityStatus.ACTIVE;
        opportunity.launchedBy = adminId;
        opportunity.launchedAt = new Date();
        const saved = await this.opportunityRepository.save(opportunity);
        await this.companyRepository.increment({ companyId: opportunity.companyId }, 'activeOpportunities', 1);
        return saved;
    }
    async getOpportunity(opportunityId) {
        const opportunity = await this.opportunityRepository.findOne({
            where: { opportunityId },
            relations: ['company'],
        });
        if (!opportunity) {
            throw new common_1.NotFoundException('Investment opportunity not found');
        }
        await this.opportunityRepository.increment({ opportunityId }, 'viewCount', 1);
        return opportunity;
    }
    async searchOpportunities(filters) {
        const queryBuilder = this.opportunityRepository
            .createQueryBuilder('opportunity')
            .leftJoinAndSelect('opportunity.company', 'company')
            .where('opportunity.status = :status', {
            status: filters.status || investment_opportunity_entity_1.OpportunityStatus.ACTIVE,
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
            queryBuilder.andWhere('(opportunity.title ILIKE :search OR opportunity.description ILIKE :search)', { search: `%${filters.search}%` });
        }
        const total = await queryBuilder.getCount();
        queryBuilder
            .orderBy('opportunity.createdAt', 'DESC')
            .skip(filters.offset || 0)
            .take(filters.limit || 20);
        const opportunities = await queryBuilder.getMany();
        return { opportunities, total };
    }
    async invest(userId, opportunityId, amount, currency, paymentMethod) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const opportunity = await queryRunner.manager.findOne(investment_opportunity_entity_1.InvestmentOpportunityEntity, {
                where: { opportunityId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!opportunity) {
                throw new common_1.NotFoundException('Investment opportunity not found');
            }
            if (opportunity.status !== investment_opportunity_entity_1.OpportunityStatus.ACTIVE) {
                throw new common_1.BadRequestException('Investment opportunity is not active');
            }
            const amountNum = parseFloat(amount);
            const minInvestment = parseFloat(opportunity.minimumInvestment);
            if (amountNum < minInvestment) {
                throw new common_1.BadRequestException(`Minimum investment is ${opportunity.currency} ${minInvestment}`);
            }
            if (opportunity.maximumInvestment) {
                const maxInvestment = parseFloat(opportunity.maximumInvestment);
                if (amountNum > maxInvestment) {
                    throw new common_1.BadRequestException(`Maximum investment is ${opportunity.currency} ${maxInvestment}`);
                }
            }
            const entryFee = (amountNum * parseFloat(opportunity.entryFee)) / 100;
            const totalFees = entryFee;
            const netAmount = amountNum - totalFees;
            const pricePerShare = parseFloat(opportunity.minimumInvestment) / 10;
            const shares = netAmount / pricePerShare;
            const transaction = queryRunner.manager.create(investment_transaction_entity_1.InvestmentTransactionEntity, {
                userId,
                opportunityId,
                type: investment_transaction_entity_1.TransactionType.BUY,
                status: investment_transaction_entity_1.TransactionStatus.PROCESSING,
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
            let portfolio = await queryRunner.manager.findOne(investment_portfolio_entity_1.InvestmentPortfolioEntity, {
                where: { userId, opportunityId },
            });
            if (portfolio) {
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
            }
            else {
                portfolio = queryRunner.manager.create(investment_portfolio_entity_1.InvestmentPortfolioEntity, {
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
            const currentRaised = parseFloat(opportunity.raisedAmount);
            opportunity.raisedAmount = (currentRaised + amountNum).toString();
            opportunity.totalInvestors += 1;
            await queryRunner.manager.save(opportunity);
            await queryRunner.manager.increment(investment_company_entity_1.InvestmentCompanyEntity, { companyId: opportunity.companyId }, 'totalRaised', amountNum);
            await queryRunner.manager.increment(investment_company_entity_1.InvestmentCompanyEntity, { companyId: opportunity.companyId }, 'totalInvestors', 1);
            savedTransaction.status = investment_transaction_entity_1.TransactionStatus.COMPLETED;
            savedTransaction.processedAt = new Date();
            savedTransaction.completedAt = new Date();
            savedTransaction.portfolioId = portfolio.portfolioId;
            await queryRunner.manager.save(savedTransaction);
            await queryRunner.commitTransaction();
            return savedTransaction;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async getUserPortfolio(userId) {
        const holdings = await this.portfolioRepository.find({
            where: { userId, isActive: true },
            order: { currentValue: 'DESC' },
        });
        const totalInvested = holdings.reduce((sum, h) => sum + parseFloat(h.totalInvested), 0);
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
    async getUserTransactions(userId, filters) {
        const where = { userId };
        if (filters === null || filters === void 0 ? void 0 : filters.type)
            where.type = filters.type;
        if (filters === null || filters === void 0 ? void 0 : filters.status)
            where.status = filters.status;
        return this.transactionRepository.find({
            where,
            order: { createdAt: 'DESC' },
            take: (filters === null || filters === void 0 ? void 0 : filters.limit) || 50,
            skip: (filters === null || filters === void 0 ? void 0 : filters.offset) || 0,
            relations: ['opportunity'],
        });
    }
    async getTrendingOpportunities(limit = 10) {
        return this.opportunityRepository.find({
            where: { status: investment_opportunity_entity_1.OpportunityStatus.ACTIVE },
            order: { viewCount: 'DESC', totalInvestors: 'DESC' },
            take: limit,
        });
    }
    validateOpportunity(opportunity) {
        var _a, _b;
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
                throw new common_1.BadRequestException(`Missing required field: ${field}`);
            }
        }
        if (parseFloat(opportunity.minimumInvestment) <= 0) {
            throw new common_1.BadRequestException('Minimum investment must be greater than 0');
        }
        if (((_a = opportunity.prospectusUrls) === null || _a === void 0 ? void 0 : _a.length) === 0 && ((_b = opportunity.factSheetUrls) === null || _b === void 0 ? void 0 : _b.length) === 0) {
            throw new common_1.BadRequestException('At least one prospectus or fact sheet is required');
        }
    }
    generateSlug(title) {
        return (title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, '-')
            .replace(/^-+|-+$/g, '') +
            '-' +
            Date.now());
    }
};
exports.InvestmentsService = InvestmentsService;
exports.InvestmentsService = InvestmentsService = InvestmentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(investment_opportunity_entity_1.InvestmentOpportunityEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(investment_company_entity_1.InvestmentCompanyEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(investment_portfolio_entity_1.InvestmentPortfolioEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(investment_transaction_entity_1.InvestmentTransactionEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object, typeof (_d = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _d : Object, typeof (_e = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _e : Object])
], InvestmentsService);
//# sourceMappingURL=investments.service.js.map