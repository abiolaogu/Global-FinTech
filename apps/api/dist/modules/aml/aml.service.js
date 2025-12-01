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
var AMLService_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.AMLService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const aml_check_entity_1 = require("./entities/aml-check.entity");
const user_entity_1 = require("../users/entities/user.entity");
const payment_entity_1 = require("../payments/entities/payment.entity");
const decimal_js_1 = require("decimal.js");
let AMLService = AMLService_1 = class AMLService {
    constructor(amlCheckRepository, userRepository, paymentRepository) {
        this.amlCheckRepository = amlCheckRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
        this.logger = new common_1.Logger(AMLService_1.name);
        this.sanctionedCountries = [
            'KP',
            'IR',
            'SY',
            'CU',
        ];
        this.highRiskCountries = [
            'AF',
            'MM',
            'YE',
        ];
    }
    async checkTransaction(userId, amount, currency, transactionType, counterpartyId) {
        this.logger.log(`Running AML check for user ${userId}, amount ${amount} ${currency}`);
        const flags = [];
        let sanctionsMatch = false;
        let pepMatch = false;
        let requiresReview = false;
        const user = await this.userRepository.findOne({ where: { userId } });
        if (!user) {
            flags.push('User not found');
            return {
                passed: false,
                flags,
                sanctionsMatch: false,
                pepMatch: false,
                riskRating: 'HIGH',
                requiresReview: true,
            };
        }
        sanctionsMatch = await this.checkSanctionsList(user);
        if (sanctionsMatch) {
            flags.push('User matches sanctions list');
        }
        pepMatch = await this.checkPEPStatus(user);
        if (pepMatch) {
            flags.push('User is a Politically Exposed Person');
            requiresReview = true;
        }
        const amountDecimal = new decimal_js_1.default(amount);
        if (amountDecimal.greaterThanOrEqualTo(10000) && currency === 'USD') {
            flags.push('Large transaction (>= $10,000) requires CTR filing');
            requiresReview = true;
        }
        const structuringDetected = await this.checkStructuring(userId, amount, currency);
        if (structuringDetected) {
            flags.push('Potential structuring detected');
            requiresReview = true;
        }
        const dailyVolume = await this.getDailyVolume(userId, currency);
        if (dailyVolume.plus(amountDecimal).greaterThan(50000)) {
            flags.push('High daily transaction volume');
            requiresReview = true;
        }
        const countryRisk = this.checkCountryRisk(user.country);
        if (countryRisk === 'HIGH') {
            flags.push('Transaction involves high-risk jurisdiction');
            requiresReview = true;
        }
        if (countryRisk === 'SANCTIONED') {
            flags.push('Transaction involves sanctioned jurisdiction');
            sanctionsMatch = true;
        }
        if (counterpartyId) {
            const counterpartyCheck = await this.checkCounterparty(counterpartyId);
            if (counterpartyCheck.sanctioned) {
                flags.push('Counterparty matches sanctions list');
                sanctionsMatch = true;
            }
            if (counterpartyCheck.highRisk) {
                flags.push('Counterparty is high-risk');
                requiresReview = true;
            }
        }
        const unusualPattern = await this.checkUnusualPatterns(userId, transactionType);
        if (unusualPattern) {
            flags.push('Unusual transaction pattern detected');
            requiresReview = true;
        }
        const riskRating = this.determineRiskRating(flags, sanctionsMatch, pepMatch);
        const passed = !sanctionsMatch && riskRating !== 'HIGH';
        const amlCheck = this.amlCheckRepository.create({
            userId,
            transactionType,
            amount,
            currency,
            passed,
            flags: flags.length > 0 ? flags : null,
            sanctionsMatch,
            pepMatch,
            riskRating,
            requiresReview,
            counterpartyId,
        });
        await this.amlCheckRepository.save(amlCheck);
        return {
            passed,
            flags,
            sanctionsMatch,
            pepMatch,
            riskRating,
            requiresReview,
        };
    }
    async checkSanctionsList(user) {
        if (this.sanctionedCountries.includes(user.country)) {
            return true;
        }
        return false;
    }
    async checkPEPStatus(user) {
        var _a;
        return ((_a = user.metadata) === null || _a === void 0 ? void 0 : _a.isPEP) === true;
    }
    async checkStructuring(userId, amount, currency) {
        const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
        const recentTransactions = await this.paymentRepository.find({
            where: {
                userId,
                currency,
                createdAt: { $gte: oneDayAgo },
            },
        });
        const suspiciousTransactions = recentTransactions.filter((tx) => {
            const amt = new decimal_js_1.default(tx.amount);
            return amt.greaterThanOrEqualTo(9000) && amt.lessThan(10000);
        });
        return suspiciousTransactions.length >= 3;
    }
    async getDailyVolume(userId, currency) {
        const todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0);
        const transactions = await this.paymentRepository.find({
            where: {
                userId,
                currency,
                createdAt: { $gte: todayStart },
            },
        });
        return transactions.reduce((sum, tx) => sum.plus(tx.amount), new decimal_js_1.default(0));
    }
    checkCountryRisk(countryCode) {
        if (this.sanctionedCountries.includes(countryCode)) {
            return 'SANCTIONED';
        }
        if (this.highRiskCountries.includes(countryCode)) {
            return 'HIGH';
        }
        return 'LOW';
    }
    async checkCounterparty(counterpartyId) {
        var _a;
        const counterparty = await this.userRepository.findOne({
            where: { userId: counterpartyId },
        });
        if (!counterparty) {
            return { sanctioned: false, highRisk: true };
        }
        const sanctioned = await this.checkSanctionsList(counterparty);
        const countryRisk = this.checkCountryRisk(counterparty.country);
        const highRisk = countryRisk === 'HIGH' || countryRisk === 'SANCTIONED' || ((_a = counterparty.metadata) === null || _a === void 0 ? void 0 : _a.isPEP);
        return { sanctioned, highRisk };
    }
    async checkUnusualPatterns(userId, transactionType) {
        const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentTransactions = await this.paymentRepository.find({
            where: {
                userId,
                createdAt: { $gte: last30Days },
            },
        });
        if (recentTransactions.length === 0) {
            const user = await this.userRepository.findOne({ where: { userId } });
            const accountAge = Date.now() - user.createdAt.getTime();
            const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
            if (accountAge > thirtyDaysMs) {
                return true;
            }
        }
        return false;
    }
    determineRiskRating(flags, sanctionsMatch, pepMatch) {
        if (sanctionsMatch) {
            return 'HIGH';
        }
        if (pepMatch || flags.length >= 3) {
            return 'HIGH';
        }
        if (flags.length >= 1) {
            return 'MEDIUM';
        }
        return 'LOW';
    }
    async getAMLHistory(userId, limit = 50) {
        return this.amlCheckRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async getTransactionsRequiringReview(limit = 100) {
        return this.amlCheckRepository.find({
            where: { requiresReview: true },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async getSanctionsMatches(limit = 100) {
        return this.amlCheckRepository.find({
            where: { sanctionsMatch: true },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
};
exports.AMLService = AMLService;
exports.AMLService = AMLService = AMLService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(aml_check_entity_1.AMLCheckEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(payment_entity_1.PaymentEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object])
], AMLService);
//# sourceMappingURL=aml.service.js.map