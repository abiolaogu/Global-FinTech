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
var RoscaService_1;
var _a, _b, _c, _d, _e, _f;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoscaService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const rosca_circle_entity_1 = require("./entities/rosca-circle.entity");
const rosca_membership_entity_1 = require("./entities/rosca-membership.entity");
const rosca_contribution_entity_1 = require("./entities/rosca-contribution.entity");
const rosca_payout_entity_1 = require("./entities/rosca-payout.entity");
const event_emitter_1 = require("@nestjs/event-emitter");
const schedule_1 = require("@nestjs/schedule");
const decimal_js_1 = require("decimal.js");
const crypto = require("crypto");
let RoscaService = RoscaService_1 = class RoscaService {
    constructor(circleRepository, membershipRepository, contributionRepository, payoutRepository, dataSource, eventEmitter) {
        this.circleRepository = circleRepository;
        this.membershipRepository = membershipRepository;
        this.contributionRepository = contributionRepository;
        this.payoutRepository = payoutRepository;
        this.dataSource = dataSource;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(RoscaService_1.name);
        this.platformFeePercentage = new decimal_js_1.default(1.5);
    }
    async createCircle(dto) {
        var _a, _b, _c, _d;
        this.logger.log(`Creating ROSCA circle: ${dto.name} for ${dto.maxMembers} members`);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const cycleDurationDays = this.getFrequencyDays(dto.frequency);
            const endDate = new Date(dto.startDate);
            endDate.setDate(endDate.getDate() + cycleDurationDays * dto.maxMembers);
            const inviteCode = dto.isPrivate ? this.generateInviteCode() : null;
            const circle = queryRunner.manager.create(rosca_circle_entity_1.RoscaCircleEntity, {
                organizerId: dto.organizerId,
                name: dto.name,
                description: dto.description,
                circleType: dto.circleType,
                contributionAmount: dto.contributionAmount,
                currency: dto.currency,
                maxMembers: dto.maxMembers,
                currentMembers: 1,
                frequency: dto.frequency,
                cycleDurationDays,
                startDate: dto.startDate,
                endDate,
                nextPayoutDate: dto.startDate,
                currentCycle: 1,
                totalCycles: dto.maxMembers,
                status: 'recruiting',
                allowLateFees: (_a = dto.allowLateFees) !== null && _a !== void 0 ? _a : true,
                lateFeePercentage: (_b = dto.lateFeePercentage) !== null && _b !== void 0 ? _b : '5.0',
                requireKyc: (_c = dto.requireKyc) !== null && _c !== void 0 ? _c : true,
                isPrivate: (_d = dto.isPrivate) !== null && _d !== void 0 ? _d : false,
                inviteCode,
            });
            const savedCircle = await queryRunner.manager.save(circle);
            const membership = queryRunner.manager.create(rosca_membership_entity_1.RoscaMembershipEntity, {
                circleId: savedCircle.circleId,
                userId: dto.organizerId,
                role: 'organizer',
                payoutPosition: dto.circleType === 'fixed_rotation' ? 1 : null,
                status: 'active',
                joinedAt: new Date(),
            });
            await queryRunner.manager.save(membership);
            await queryRunner.commitTransaction();
            this.logger.log(`Circle created: ${savedCircle.circleId}`);
            this.eventEmitter.emit('rosca.circle_created', {
                circleId: savedCircle.circleId,
                organizerId: dto.organizerId,
                name: dto.name,
                maxMembers: dto.maxMembers,
            });
            return savedCircle;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to create circle: ${error.message}`);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async joinCircle(dto) {
        this.logger.log(`User ${dto.userId} joining circle ${dto.circleId}`);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const circle = await queryRunner.manager.findOne(rosca_circle_entity_1.RoscaCircleEntity, {
                where: { circleId: dto.circleId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!circle) {
                throw new common_1.NotFoundException('Circle not found');
            }
            if (circle.status !== 'recruiting') {
                throw new common_1.BadRequestException('Circle is not accepting new members');
            }
            if (circle.currentMembers >= circle.maxMembers) {
                throw new common_1.BadRequestException('Circle is full');
            }
            if (circle.isPrivate && dto.inviteCode !== circle.inviteCode) {
                throw new common_1.BadRequestException('Invalid invite code');
            }
            const existingMembership = await queryRunner.manager.findOne(rosca_membership_entity_1.RoscaMembershipEntity, {
                where: {
                    circleId: dto.circleId,
                    userId: dto.userId,
                    status: (0, typeorm_2.In)(['pending', 'active']),
                },
            });
            if (existingMembership) {
                throw new common_1.BadRequestException('Already a member of this circle');
            }
            const nextPosition = circle.currentMembers + 1;
            const membership = queryRunner.manager.create(rosca_membership_entity_1.RoscaMembershipEntity, {
                circleId: dto.circleId,
                userId: dto.userId,
                role: 'member',
                payoutPosition: circle.circleType === 'fixed_rotation' ? nextPosition : null,
                status: 'active',
                joinedAt: new Date(),
            });
            await queryRunner.manager.save(membership);
            circle.currentMembers += 1;
            if (circle.currentMembers === circle.maxMembers) {
                circle.status = 'active';
                await this.determinePayoutOrder(circle, queryRunner);
                await this.createContributionRecords(circle, queryRunner);
                this.logger.log(`Circle ${circle.circleId} is now full and activated`);
            }
            await queryRunner.manager.save(circle);
            await queryRunner.commitTransaction();
            this.logger.log(`User ${dto.userId} joined circle ${dto.circleId}`);
            this.eventEmitter.emit('rosca.member_joined', {
                circleId: dto.circleId,
                userId: dto.userId,
                memberCount: circle.currentMembers,
            });
            return membership;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to join circle: ${error.message}`);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async makeContribution(dto) {
        this.logger.log(`User ${dto.userId} making contribution to circle ${dto.circleId} for cycle ${dto.cycleNumber}`);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const contribution = await queryRunner.manager.findOne(rosca_contribution_entity_1.RoscaContributionEntity, {
                where: {
                    circleId: dto.circleId,
                    userId: dto.userId,
                    cycleNumber: dto.cycleNumber,
                    status: (0, typeorm_2.In)(['pending', 'late']),
                },
            });
            if (!contribution) {
                throw new common_1.NotFoundException('Contribution record not found');
            }
            const expectedAmount = new decimal_js_1.default(contribution.amount).plus(contribution.lateFee);
            if (!new decimal_js_1.default(dto.amount).equals(expectedAmount)) {
                throw new common_1.BadRequestException(`Amount mismatch. Expected ${expectedAmount.toString()}, got ${dto.amount}`);
            }
            contribution.status = 'paid';
            contribution.paidDate = new Date();
            contribution.paymentMethod = dto.paymentMethod;
            const now = new Date();
            const dueDate = new Date(contribution.dueDate);
            if (now > dueDate) {
                contribution.daysLate = Math.floor((now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24));
            }
            await queryRunner.manager.save(contribution);
            const membership = await queryRunner.manager.findOne(rosca_membership_entity_1.RoscaMembershipEntity, {
                where: {
                    circleId: dto.circleId,
                    userId: dto.userId,
                },
            });
            if (membership) {
                membership.totalContributed = new decimal_js_1.default(membership.totalContributed)
                    .plus(dto.amount)
                    .toString();
                if (contribution.daysLate && contribution.daysLate > 0) {
                    membership.latePayments += 1;
                }
                else {
                    membership.onTimePayments += 1;
                }
                membership.reliabilityScore = this.calculateReliabilityScore(membership);
                await queryRunner.manager.save(membership);
            }
            const circle = await queryRunner.manager.findOne(rosca_circle_entity_1.RoscaCircleEntity, {
                where: { circleId: dto.circleId },
            });
            if (circle) {
                circle.totalContributed = new decimal_js_1.default(circle.totalContributed).plus(dto.amount).toString();
                circle.pendingContributions = new decimal_js_1.default(circle.pendingContributions)
                    .minus(dto.amount)
                    .toString();
                await queryRunner.manager.save(circle);
                const pendingCount = await queryRunner.manager.count(rosca_contribution_entity_1.RoscaContributionEntity, {
                    where: {
                        circleId: dto.circleId,
                        cycleNumber: circle.currentCycle,
                        status: (0, typeorm_2.In)(['pending', 'late']),
                    },
                });
                if (pendingCount === 0) {
                    await this.processPayout(circle, queryRunner);
                }
            }
            await queryRunner.commitTransaction();
            this.logger.log(`Contribution recorded: ${contribution.contributionId}`);
            this.eventEmitter.emit('rosca.contribution_made', {
                circleId: dto.circleId,
                userId: dto.userId,
                cycleNumber: dto.cycleNumber,
                amount: dto.amount,
            });
            return contribution;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to make contribution: ${error.message}`);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async processPayout(circle, queryRunner) {
        this.logger.log(`Processing payout for circle ${circle.circleId}, cycle ${circle.currentCycle}`);
        const recipientPosition = circle.currentCycle;
        const recipient = await queryRunner.manager.findOne(rosca_membership_entity_1.RoscaMembershipEntity, {
            where: {
                circleId: circle.circleId,
                payoutPosition: recipientPosition,
            },
        });
        if (!recipient) {
            this.logger.error(`No recipient found for cycle ${circle.currentCycle}`);
            return;
        }
        const contributionAmount = new decimal_js_1.default(circle.contributionAmount);
        const totalAmount = contributionAmount.times(circle.maxMembers);
        const platformFee = totalAmount.times(this.platformFeePercentage).dividedBy(100);
        const organizerFee = new decimal_js_1.default(0);
        const netAmount = totalAmount.minus(platformFee).minus(organizerFee);
        const payout = queryRunner.manager.create(rosca_payout_entity_1.RoscaPayoutEntity, {
            circleId: circle.circleId,
            recipientUserId: recipient.userId,
            cycleNumber: circle.currentCycle,
            amount: totalAmount.toString(),
            currency: circle.currency,
            organizerFee: organizerFee.toString(),
            platformFee: platformFee.toString(),
            netAmount: netAmount.toString(),
            status: 'completed',
            scheduledDate: new Date(),
            processedDate: new Date(),
        });
        await queryRunner.manager.save(payout);
        recipient.hasReceivedPayout = true;
        recipient.payoutReceivedDate = new Date();
        recipient.totalReceived = new decimal_js_1.default(recipient.totalReceived).plus(netAmount).toString();
        await queryRunner.manager.save(recipient);
        circle.totalPaidOut = new decimal_js_1.default(circle.totalPaidOut).plus(netAmount).toString();
        circle.currentCycle += 1;
        if (circle.currentCycle <= circle.totalCycles) {
            const nextPayoutDate = new Date(circle.nextPayoutDate);
            nextPayoutDate.setDate(nextPayoutDate.getDate() + circle.cycleDurationDays);
            circle.nextPayoutDate = nextPayoutDate;
        }
        else {
            circle.status = 'completed';
            circle.nextPayoutDate = null;
        }
        await queryRunner.manager.save(circle);
        this.logger.log(`Payout processed: ${payout.payoutId} to user ${recipient.userId} for ${netAmount.toString()}`);
        this.eventEmitter.emit('rosca.payout_processed', {
            circleId: circle.circleId,
            payoutId: payout.payoutId,
            recipientUserId: recipient.userId,
            amount: netAmount.toString(),
            cycleNumber: circle.currentCycle - 1,
        });
    }
    async determinePayoutOrder(circle, queryRunner) {
        const memberships = await queryRunner.manager.find(rosca_membership_entity_1.RoscaMembershipEntity, {
            where: { circleId: circle.circleId, status: 'active' },
        });
        if (circle.circleType === 'fixed_rotation') {
            circle.payoutOrder = memberships
                .sort((a, b) => a.payoutPosition - b.payoutPosition)
                .map((m) => m.userId);
        }
        else if (circle.circleType === 'random') {
            const shuffled = this.shuffleArray([...memberships]);
            shuffled.forEach((membership, index) => {
                membership.payoutPosition = index + 1;
            });
            await queryRunner.manager.save(shuffled);
            circle.payoutOrder = shuffled.map((m) => m.userId);
        }
        else if (circle.circleType === 'organizer_decides') {
            const organizer = memberships.find((m) => m.role === 'organizer');
            const others = memberships.filter((m) => m.role !== 'organizer');
            organizer.payoutPosition = 1;
            await queryRunner.manager.save(organizer);
            circle.payoutOrder = [organizer.userId, ...others.map((m) => m.userId)];
        }
    }
    async createContributionRecords(circle, queryRunner) {
        const memberships = await queryRunner.manager.find(rosca_membership_entity_1.RoscaMembershipEntity, {
            where: { circleId: circle.circleId, status: 'active' },
        });
        const contributions = [];
        for (let cycle = 1; cycle <= circle.totalCycles; cycle++) {
            const cycleStartDate = new Date(circle.startDate);
            cycleStartDate.setDate(cycleStartDate.getDate() + (cycle - 1) * circle.cycleDurationDays);
            const dueDate = new Date(cycleStartDate);
            dueDate.setDate(dueDate.getDate() + circle.cycleDurationDays);
            for (const membership of memberships) {
                const contribution = queryRunner.manager.create(rosca_contribution_entity_1.RoscaContributionEntity, {
                    circleId: circle.circleId,
                    userId: membership.userId,
                    cycleNumber: cycle,
                    amount: circle.contributionAmount,
                    currency: circle.currency,
                    status: 'pending',
                    dueDate,
                });
                contributions.push(contribution);
            }
        }
        await queryRunner.manager.save(contributions);
        const totalPending = new decimal_js_1.default(circle.contributionAmount)
            .times(circle.maxMembers)
            .times(circle.totalCycles);
        circle.pendingContributions = totalPending.toString();
    }
    async getUserCircles(userId) {
        const memberships = await this.membershipRepository.find({
            where: { userId, status: (0, typeorm_2.In)(['pending', 'active', 'completed']) },
        });
        const circleIds = memberships.map((m) => m.circleId);
        if (circleIds.length === 0) {
            return { active: [], recruiting: [], completed: [] };
        }
        const circles = await this.circleRepository.find({
            where: { circleId: (0, typeorm_2.In)(circleIds) },
        });
        return {
            active: circles.filter((c) => c.status === 'active'),
            recruiting: circles.filter((c) => c.status === 'recruiting'),
            completed: circles.filter((c) => c.status === 'completed'),
        };
    }
    async getCircleDetails(circleId) {
        const circle = await this.circleRepository.findOne({
            where: { circleId },
        });
        if (!circle) {
            throw new common_1.NotFoundException('Circle not found');
        }
        const memberships = await this.membershipRepository.find({
            where: { circleId },
            order: { payoutPosition: 'ASC' },
        });
        const upcomingPayouts = await this.payoutRepository.find({
            where: {
                circleId,
                status: (0, typeorm_2.In)(['pending', 'processing']),
            },
            order: { cycleNumber: 'ASC' },
        });
        return { circle, memberships, upcomingPayouts };
    }
    async getUserContributions(userId, circleId) {
        return this.contributionRepository.find({
            where: { userId, circleId },
            order: { cycleNumber: 'ASC' },
        });
    }
    async checkOverdueContributions() {
        this.logger.log('Checking for overdue ROSCA contributions');
        const now = new Date();
        const overdueContributions = await this.contributionRepository.find({
            where: {
                status: 'pending',
                dueDate: (0, typeorm_2.LessThan)(now),
            },
        });
        for (const contribution of overdueContributions) {
            const circle = await this.circleRepository.findOne({
                where: { circleId: contribution.circleId },
            });
            if (!circle || !circle.allowLateFees) {
                continue;
            }
            const daysLate = Math.floor((now.getTime() - contribution.dueDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysLate > circle.gracePeriodDays) {
                const lateFee = new decimal_js_1.default(contribution.amount)
                    .times(circle.lateFeePercentage || '5')
                    .dividedBy(100);
                contribution.lateFee = lateFee.toString();
                contribution.status = 'late';
                contribution.daysLate = daysLate;
                await this.contributionRepository.save(contribution);
                const membership = await this.membershipRepository.findOne({
                    where: {
                        circleId: contribution.circleId,
                        userId: contribution.userId,
                    },
                });
                if (membership) {
                    membership.missedPayments += 1;
                    membership.reliabilityScore = this.calculateReliabilityScore(membership);
                    await this.membershipRepository.save(membership);
                }
                this.logger.log(`Late fee applied: ${contribution.contributionId}, ${lateFee.toString()} ${contribution.currency}`);
                this.eventEmitter.emit('rosca.contribution_overdue', {
                    circleId: contribution.circleId,
                    userId: contribution.userId,
                    contributionId: contribution.contributionId,
                    daysLate,
                    lateFee: lateFee.toString(),
                });
            }
        }
    }
    async searchCircles(filters) {
        const query = this.circleRepository.createQueryBuilder('circle');
        query.where('circle.status = :status', { status: 'recruiting' });
        query.andWhere('circle.isPrivate = :isPrivate', { isPrivate: false });
        if (filters.currency) {
            query.andWhere('circle.currency = :currency', { currency: filters.currency });
        }
        if (filters.maxContribution) {
            query.andWhere('circle.contributionAmount <= :maxContribution', {
                maxContribution: filters.maxContribution,
            });
        }
        if (filters.frequency) {
            query.andWhere('circle.frequency = :frequency', { frequency: filters.frequency });
        }
        query.orderBy('circle.createdAt', 'DESC');
        query.limit(50);
        return query.getMany();
    }
    getFrequencyDays(frequency) {
        const map = {
            daily: 1,
            weekly: 7,
            biweekly: 14,
            monthly: 30,
        };
        return map[frequency] || 30;
    }
    generateInviteCode() {
        return crypto.randomBytes(8).toString('hex').toUpperCase();
    }
    shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }
    calculateReliabilityScore(membership) {
        const totalPayments = membership.onTimePayments + membership.latePayments + membership.missedPayments;
        if (totalPayments === 0) {
            return '100';
        }
        const score = ((membership.onTimePayments + membership.latePayments * 0.5) / totalPayments) * 100;
        return Math.max(0, Math.min(100, score)).toFixed(2);
    }
};
exports.RoscaService = RoscaService;
__decorate([
    (0, schedule_1.Cron)(schedule_1.CronExpression.EVERY_DAY_AT_MIDNIGHT),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], RoscaService.prototype, "checkOverdueContributions", null);
exports.RoscaService = RoscaService = RoscaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(rosca_circle_entity_1.RoscaCircleEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(rosca_membership_entity_1.RoscaMembershipEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(rosca_contribution_entity_1.RoscaContributionEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(rosca_payout_entity_1.RoscaPayoutEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object, typeof (_d = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _d : Object, typeof (_e = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _e : Object, typeof (_f = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _f : Object])
], RoscaService);
//# sourceMappingURL=rosca.service.js.map