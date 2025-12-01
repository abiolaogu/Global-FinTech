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
var FraudService_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.FraudService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const fraud_check_entity_1 = require("./entities/fraud-check.entity");
const user_entity_1 = require("../users/entities/user.entity");
const payment_entity_1 = require("../payments/entities/payment.entity");
const decimal_js_1 = require("decimal.js");
let FraudService = FraudService_1 = class FraudService {
    constructor(fraudCheckRepository, userRepository, paymentRepository) {
        this.fraudCheckRepository = fraudCheckRepository;
        this.userRepository = userRepository;
        this.paymentRepository = paymentRepository;
        this.logger = new common_1.Logger(FraudService_1.name);
    }
    async checkTransaction(userId, amount, currency, transactionType, metadata) {
        this.logger.log(`Running fraud check for user ${userId}, amount ${amount} ${currency}`);
        const checks = {
            velocityCheck: await this.checkVelocity(userId, transactionType),
            amountCheck: await this.checkAmount(userId, amount, currency),
            geoCheck: await this.checkGeolocation(userId, metadata === null || metadata === void 0 ? void 0 : metadata.location),
            deviceCheck: await this.checkDevice(userId, metadata === null || metadata === void 0 ? void 0 : metadata.deviceId),
            behaviorCheck: await this.checkBehavior(userId, amount, transactionType),
        };
        const riskScore = this.calculateRiskScore(checks, amount);
        const riskLevel = this.determineRiskLevel(riskScore);
        const shouldBlock = riskScore >= 80;
        const reasons = this.generateReasons(checks, riskScore);
        const fraudCheck = this.fraudCheckRepository.create({
            userId,
            transactionType,
            amount,
            currency,
            riskScore,
            riskLevel,
            shouldBlock,
            metadata: {
                checks,
                reasons,
                ipAddress: metadata === null || metadata === void 0 ? void 0 : metadata.ipAddress,
                deviceId: metadata === null || metadata === void 0 ? void 0 : metadata.deviceId,
                location: metadata === null || metadata === void 0 ? void 0 : metadata.location,
            },
        });
        await this.fraudCheckRepository.save(fraudCheck);
        return {
            riskScore,
            riskLevel,
            checks,
            shouldBlock,
            reasons,
        };
    }
    async checkVelocity(userId, transactionType) {
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
        const recentTransactions = await this.paymentRepository.count({
            where: {
                userId,
                transactionType,
                createdAt: { $gte: oneHourAgo },
            },
        });
        return recentTransactions <= 10;
    }
    async checkAmount(userId, amount, currency) {
        const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const recentTransactions = await this.paymentRepository.find({
            where: {
                userId,
                currency,
                createdAt: { $gte: last30Days },
            },
            select: ['amount'],
        });
        if (recentTransactions.length === 0) {
            return new decimal_js_1.default(amount).lessThanOrEqualTo(1000);
        }
        const totalAmount = recentTransactions.reduce((sum, tx) => sum.plus(tx.amount), new decimal_js_1.default(0));
        const avgAmount = totalAmount.dividedBy(recentTransactions.length);
        const threshold = avgAmount.times(3);
        return new decimal_js_1.default(amount).lessThanOrEqualTo(threshold);
    }
    async checkGeolocation(userId, location) {
        var _a;
        if (!location) {
            return true;
        }
        const recentFraudChecks = await this.fraudCheckRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 5,
        });
        if (recentFraudChecks.length === 0) {
            return true;
        }
        const lastLocation = (_a = recentFraudChecks[0].metadata) === null || _a === void 0 ? void 0 : _a.location;
        if (!lastLocation) {
            return true;
        }
        const distance = this.calculateDistance(location.lat, location.lon, lastLocation.lat, lastLocation.lon);
        const timeDiff = Date.now() - recentFraudChecks[0].createdAt.getTime();
        const oneHour = 60 * 60 * 1000;
        return !(distance > 500 && timeDiff < oneHour);
    }
    async checkDevice(userId, deviceId) {
        if (!deviceId) {
            return true;
        }
        const recentFraudChecks = await this.fraudCheckRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: 20,
        });
        const knownDevices = recentFraudChecks
            .map((check) => { var _a; return (_a = check.metadata) === null || _a === void 0 ? void 0 : _a.deviceId; })
            .filter(Boolean);
        return knownDevices.includes(deviceId);
    }
    async checkBehavior(userId, amount, transactionType) {
        const user = await this.userRepository.findOne({ where: { userId } });
        if (!user) {
            return false;
        }
        const accountAge = Date.now() - user.createdAt.getTime();
        const oneDayMs = 24 * 60 * 60 * 1000;
        if (accountAge < oneDayMs && new decimal_js_1.default(amount).greaterThan(500)) {
            return false;
        }
        if (!user.kycVerified && new decimal_js_1.default(amount).greaterThan(1000)) {
            return false;
        }
        return true;
    }
    calculateRiskScore(checks, amount) {
        let score = 0;
        if (!checks.velocityCheck)
            score += 25;
        if (!checks.amountCheck)
            score += 20;
        if (!checks.geoCheck)
            score += 20;
        if (!checks.deviceCheck)
            score += 15;
        if (!checks.behaviorCheck)
            score += 20;
        const amountDecimal = new decimal_js_1.default(amount);
        if (amountDecimal.greaterThan(10000)) {
            score += 10;
        }
        else if (amountDecimal.greaterThan(5000)) {
            score += 5;
        }
        return Math.min(score, 100);
    }
    determineRiskLevel(riskScore) {
        if (riskScore >= 80)
            return 'CRITICAL';
        if (riskScore >= 60)
            return 'HIGH';
        if (riskScore >= 40)
            return 'MEDIUM';
        return 'LOW';
    }
    generateReasons(checks, riskScore) {
        const reasons = [];
        if (!checks.velocityCheck) {
            reasons.push('Unusual transaction velocity detected');
        }
        if (!checks.amountCheck) {
            reasons.push('Transaction amount significantly higher than typical');
        }
        if (!checks.geoCheck) {
            reasons.push('Suspicious geolocation change detected');
        }
        if (!checks.deviceCheck) {
            reasons.push('Unrecognized device');
        }
        if (!checks.behaviorCheck) {
            reasons.push('Unusual transaction behavior');
        }
        if (reasons.length === 0 && riskScore > 0) {
            reasons.push('Overall risk assessment elevated');
        }
        return reasons;
    }
    calculateDistance(lat1, lon1, lat2, lon2) {
        const R = 6371;
        const dLat = this.degreesToRadians(lat2 - lat1);
        const dLon = this.degreesToRadians(lon2 - lon1);
        const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(this.degreesToRadians(lat1)) *
                Math.cos(this.degreesToRadians(lat2)) *
                Math.sin(dLon / 2) *
                Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
    degreesToRadians(degrees) {
        return degrees * (Math.PI / 180);
    }
    async getFraudHistory(userId, limit = 50) {
        return this.fraudCheckRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async getFlaggedTransactions(limit = 100) {
        return this.fraudCheckRepository.find({
            where: { shouldBlock: true },
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
};
exports.FraudService = FraudService;
exports.FraudService = FraudService = FraudService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(fraud_check_entity_1.FraudCheckEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(payment_entity_1.PaymentEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object])
], FraudService);
//# sourceMappingURL=fraud.service.js.map