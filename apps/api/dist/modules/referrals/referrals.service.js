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
var ReferralsService_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReferralsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const referral_entity_1 = require("./entities/referral.entity");
const user_entity_1 = require("../users/entities/user.entity");
const event_emitter_1 = require("@nestjs/event-emitter");
const nanoid_1 = require("nanoid");
let ReferralsService = ReferralsService_1 = class ReferralsService {
    constructor(referralRepository, userRepository, eventEmitter) {
        this.referralRepository = referralRepository;
        this.userRepository = userRepository;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(ReferralsService_1.name);
        this.rewards = {
            signup: {
                referrer: { cashBonus: 10, rewardPoints: 1000 },
                referee: { cashBonus: 10, rewardPoints: 1000 },
            },
            first_deposit: {
                referrer: { cashBonus: 20, rewardPoints: 2000 },
                referee: { cashBonus: 0, rewardPoints: 0 },
            },
            first_trade: {
                referrer: { cashBonus: 15, rewardPoints: 1500 },
                referee: { cashBonus: 0, rewardPoints: 0 },
            },
        };
    }
    async generateReferralCode(userId) {
        const user = await this.userRepository.findOne({ where: { userId } });
        if (!user) {
            throw new common_1.BadRequestException('User not found');
        }
        if (user.referralCode) {
            return user.referralCode;
        }
        const nanoid = (0, nanoid_1.customAlphabet)('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);
        const referralCode = nanoid();
        user.referralCode = referralCode;
        await this.userRepository.save(user);
        this.logger.log(`Generated referral code for user ${userId}: ${referralCode}`);
        return referralCode;
    }
    async applyReferralCode(referralCode, newUserId) {
        const referrer = await this.userRepository.findOne({
            where: { referralCode },
        });
        if (!referrer) {
            throw new common_1.BadRequestException('Invalid referral code');
        }
        if (referrer.userId === newUserId) {
            throw new common_1.BadRequestException('Cannot use your own referral code');
        }
        const referral = this.referralRepository.create({
            referrerId: referrer.userId,
            referredUserId: newUserId,
            status: 'pending',
            rewardsPaid: false,
        });
        await this.referralRepository.save(referral);
        await this.awardSignupRewards(referral.referralId);
        this.logger.log(`Referral applied: ${referrer.userId} -> ${newUserId}`);
    }
    async awardSignupRewards(referralId) {
        const referral = await this.referralRepository.findOne({
            where: { referralId },
        });
        if (!referral) {
            return;
        }
        const rewards = this.rewards.signup;
        this.eventEmitter.emit('referral.reward', {
            userId: referral.referrerId,
            type: 'referral_signup',
            cashBonus: rewards.referrer.cashBonus,
            rewardPoints: rewards.referrer.rewardPoints,
        });
        this.eventEmitter.emit('referral.reward', {
            userId: referral.referredUserId,
            type: 'referral_signup_bonus',
            cashBonus: rewards.referee.cashBonus,
            rewardPoints: rewards.referee.rewardPoints,
        });
        referral.status = 'completed';
        referral.rewardsPaid = true;
        await this.referralRepository.save(referral);
        this.logger.log(`Signup rewards awarded for referral ${referralId}`);
    }
    async trackMilestone(userId, milestone) {
        var _a;
        const referral = await this.referralRepository.findOne({
            where: { referredUserId: userId },
        });
        if (!referral) {
            return;
        }
        if ((_a = referral.milestonesCompleted) === null || _a === void 0 ? void 0 : _a.includes(milestone)) {
            return;
        }
        const rewards = this.rewards[milestone];
        this.eventEmitter.emit('referral.reward', {
            userId: referral.referrerId,
            type: `referral_${milestone}`,
            cashBonus: rewards.referrer.cashBonus,
            rewardPoints: rewards.referrer.rewardPoints,
        });
        referral.milestonesCompleted = [
            ...(referral.milestonesCompleted || []),
            milestone,
        ];
        await this.referralRepository.save(referral);
        this.logger.log(`Milestone ${milestone} rewarded for referral ${referral.referralId}`);
    }
    async getReferralStats(userId) {
        const referrals = await this.referralRepository.find({
            where: { referrerId: userId },
        });
        const totalReferred = referrals.length;
        const completedReferrals = referrals.filter((r) => r.status === 'completed').length;
        const pendingReferrals = referrals.filter((r) => r.status === 'pending').length;
        const signupRewards = completedReferrals * this.rewards.signup.referrer.cashBonus;
        const depositRewards = referrals.filter((r) => { var _a; return (_a = r.milestonesCompleted) === null || _a === void 0 ? void 0 : _a.includes('first_deposit'); }).length * this.rewards.first_deposit.referrer.cashBonus;
        const tradeRewards = referrals.filter((r) => { var _a; return (_a = r.milestonesCompleted) === null || _a === void 0 ? void 0 : _a.includes('first_trade'); }).length * this.rewards.first_trade.referrer.cashBonus;
        const totalEarnings = signupRewards + depositRewards + tradeRewards;
        return {
            totalReferred,
            completedReferrals,
            pendingReferrals,
            totalEarnings,
            breakdown: {
                signup: signupRewards,
                deposits: depositRewards,
                trades: tradeRewards,
            },
            referrals: referrals.map((r) => ({
                referredUserId: r.referredUserId,
                status: r.status,
                createdAt: r.createdAt,
                milestonesCompleted: r.milestonesCompleted || [],
            })),
        };
    }
    async getLeaderboard(limit = 100) {
        const referralCounts = await this.referralRepository
            .createQueryBuilder('referral')
            .select('referral.referrerId', 'userId')
            .addSelect('COUNT(*)', 'count')
            .where('referral.status = :status', { status: 'completed' })
            .groupBy('referral.referrerId')
            .orderBy('count', 'DESC')
            .limit(limit)
            .getRawMany();
        const leaderboard = await Promise.all(referralCounts.map(async (item) => {
            const user = await this.userRepository.findOne({
                where: { userId: item.userId },
                select: ['userId', 'firstName', 'lastName', 'tier'],
            });
            return {
                userId: item.userId,
                name: `${user === null || user === void 0 ? void 0 : user.firstName} ${user === null || user === void 0 ? void 0 : user.lastName}`,
                tier: user === null || user === void 0 ? void 0 : user.tier,
                totalReferrals: parseInt(item.count),
            };
        }));
        return leaderboard;
    }
};
exports.ReferralsService = ReferralsService;
exports.ReferralsService = ReferralsService = ReferralsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(referral_entity_1.ReferralEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.UserEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _c : Object])
], ReferralsService);
//# sourceMappingURL=referrals.service.js.map