import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, LessThan, In } from 'typeorm';
import { RoscaCircleEntity } from './entities/rosca-circle.entity';
import { RoscaMembershipEntity } from './entities/rosca-membership.entity';
import { RoscaContributionEntity } from './entities/rosca-contribution.entity';
import { RoscaPayoutEntity } from './entities/rosca-payout.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Cron, CronExpression } from '@nestjs/schedule';
import Decimal from 'decimal.js';
import * as crypto from 'crypto';

export interface CreateCircleDto {
  organizerId: string;
  name: string;
  description?: string;
  circleType: 'fixed_rotation' | 'bidding' | 'random' | 'organizer_decides';
  contributionAmount: string;
  currency: string;
  maxMembers: number;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';
  startDate: Date;
  isPrivate?: boolean;
  allowLateFees?: boolean;
  lateFeePercentage?: string;
  requireKyc?: boolean;
}

export interface JoinCircleDto {
  userId: string;
  circleId: string;
  inviteCode?: string;
}

export interface MakeContributionDto {
  userId: string;
  circleId: string;
  cycleNumber: number;
  amount: string;
  paymentMethod: string;
}

@Injectable()
export class RoscaService {
  private readonly logger = new Logger(RoscaService.name);

  // Platform fee: 1.5% of payout
  private readonly platformFeePercentage = new Decimal(1.5);

  constructor(
    @InjectRepository(RoscaCircleEntity)
    private readonly circleRepository: Repository<RoscaCircleEntity>,
    @InjectRepository(RoscaMembershipEntity)
    private readonly membershipRepository: Repository<RoscaMembershipEntity>,
    @InjectRepository(RoscaContributionEntity)
    private readonly contributionRepository: Repository<RoscaContributionEntity>,
    @InjectRepository(RoscaPayoutEntity)
    private readonly payoutRepository: Repository<RoscaPayoutEntity>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new ROSCA circle
   */
  async createCircle(dto: CreateCircleDto): Promise<RoscaCircleEntity> {
    this.logger.log(`Creating ROSCA circle: ${dto.name} for ${dto.maxMembers} members`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Calculate cycle duration
      const cycleDurationDays = this.getFrequencyDays(dto.frequency);

      // Calculate end date
      const endDate = new Date(dto.startDate);
      endDate.setDate(endDate.getDate() + cycleDurationDays * dto.maxMembers);

      // Generate invite code for private circles
      const inviteCode = dto.isPrivate ? this.generateInviteCode() : null;

      // Create circle
      const circle = queryRunner.manager.create(RoscaCircleEntity, {
        organizerId: dto.organizerId,
        name: dto.name,
        description: dto.description,
        circleType: dto.circleType,
        contributionAmount: dto.contributionAmount,
        currency: dto.currency,
        maxMembers: dto.maxMembers,
        currentMembers: 1, // Organizer is first member
        frequency: dto.frequency,
        cycleDurationDays,
        startDate: dto.startDate,
        endDate,
        nextPayoutDate: dto.startDate,
        currentCycle: 1,
        totalCycles: dto.maxMembers,
        status: 'recruiting',
        allowLateFees: dto.allowLateFees ?? true,
        lateFeePercentage: dto.lateFeePercentage ?? '5.0',
        requireKyc: dto.requireKyc ?? true,
        isPrivate: dto.isPrivate ?? false,
        inviteCode,
      });

      const savedCircle = await queryRunner.manager.save(circle);

      // Add organizer as first member
      const membership = queryRunner.manager.create(RoscaMembershipEntity, {
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
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to create circle: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Join a ROSCA circle
   */
  async joinCircle(dto: JoinCircleDto): Promise<RoscaMembershipEntity> {
    this.logger.log(`User ${dto.userId} joining circle ${dto.circleId}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get circle with lock
      const circle = await queryRunner.manager.findOne(RoscaCircleEntity, {
        where: { circleId: dto.circleId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!circle) {
        throw new NotFoundException('Circle not found');
      }

      // Validate circle status
      if (circle.status !== 'recruiting') {
        throw new BadRequestException('Circle is not accepting new members');
      }

      // Check if circle is full
      if (circle.currentMembers >= circle.maxMembers) {
        throw new BadRequestException('Circle is full');
      }

      // Check invite code for private circles
      if (circle.isPrivate && dto.inviteCode !== circle.inviteCode) {
        throw new BadRequestException('Invalid invite code');
      }

      // Check if user already member
      const existingMembership = await queryRunner.manager.findOne(RoscaMembershipEntity, {
        where: {
          circleId: dto.circleId,
          userId: dto.userId,
          status: In(['pending', 'active']),
        },
      });

      if (existingMembership) {
        throw new BadRequestException('Already a member of this circle');
      }

      // Get next payout position
      const nextPosition = circle.currentMembers + 1;

      // Create membership
      const membership = queryRunner.manager.create(RoscaMembershipEntity, {
        circleId: dto.circleId,
        userId: dto.userId,
        role: 'member',
        payoutPosition: circle.circleType === 'fixed_rotation' ? nextPosition : null,
        status: 'active',
        joinedAt: new Date(),
      });

      await queryRunner.manager.save(membership);

      // Update circle member count
      circle.currentMembers += 1;

      // Check if circle is now full - activate it
      if (circle.currentMembers === circle.maxMembers) {
        circle.status = 'active';

        // Determine payout order
        await this.determinePayoutOrder(circle, queryRunner);

        // Create contribution records for all cycles
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
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to join circle: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Make contribution to circle
   */
  async makeContribution(dto: MakeContributionDto): Promise<RoscaContributionEntity> {
    this.logger.log(
      `User ${dto.userId} making contribution to circle ${dto.circleId} for cycle ${dto.cycleNumber}`,
    );

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get pending contribution
      const contribution = await queryRunner.manager.findOne(RoscaContributionEntity, {
        where: {
          circleId: dto.circleId,
          userId: dto.userId,
          cycleNumber: dto.cycleNumber,
          status: In(['pending', 'late']),
        },
      });

      if (!contribution) {
        throw new NotFoundException('Contribution record not found');
      }

      // Validate amount
      const expectedAmount = new Decimal(contribution.amount).plus(contribution.lateFee);

      if (!new Decimal(dto.amount).equals(expectedAmount)) {
        throw new BadRequestException(
          `Amount mismatch. Expected ${expectedAmount.toString()}, got ${dto.amount}`,
        );
      }

      // Update contribution
      contribution.status = 'paid';
      contribution.paidDate = new Date();
      contribution.paymentMethod = dto.paymentMethod;

      // Calculate if late
      const now = new Date();
      const dueDate = new Date(contribution.dueDate);

      if (now > dueDate) {
        contribution.daysLate = Math.floor(
          (now.getTime() - dueDate.getTime()) / (1000 * 60 * 60 * 24),
        );
      }

      await queryRunner.manager.save(contribution);

      // Update membership stats
      const membership = await queryRunner.manager.findOne(RoscaMembershipEntity, {
        where: {
          circleId: dto.circleId,
          userId: dto.userId,
        },
      });

      if (membership) {
        membership.totalContributed = new Decimal(membership.totalContributed)
          .plus(dto.amount)
          .toString();

        if (contribution.daysLate && contribution.daysLate > 0) {
          membership.latePayments += 1;
        } else {
          membership.onTimePayments += 1;
        }

        // Update reliability score
        membership.reliabilityScore = this.calculateReliabilityScore(membership);

        await queryRunner.manager.save(membership);
      }

      // Update circle totals
      const circle = await queryRunner.manager.findOne(RoscaCircleEntity, {
        where: { circleId: dto.circleId },
      });

      if (circle) {
        circle.totalContributed = new Decimal(circle.totalContributed).plus(dto.amount).toString();
        circle.pendingContributions = new Decimal(circle.pendingContributions)
          .minus(dto.amount)
          .toString();

        await queryRunner.manager.save(circle);

        // Check if all contributions for current cycle are paid
        const pendingCount = await queryRunner.manager.count(RoscaContributionEntity, {
          where: {
            circleId: dto.circleId,
            cycleNumber: circle.currentCycle,
            status: In(['pending', 'late']),
          },
        });

        if (pendingCount === 0) {
          // All contributions received, process payout
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
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to make contribution: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Process payout for current cycle
   */
  private async processPayout(circle: RoscaCircleEntity, queryRunner: any): Promise<void> {
    this.logger.log(`Processing payout for circle ${circle.circleId}, cycle ${circle.currentCycle}`);

    // Get recipient for current cycle
    const recipientPosition = circle.currentCycle;
    const recipient = await queryRunner.manager.findOne(RoscaMembershipEntity, {
      where: {
        circleId: circle.circleId,
        payoutPosition: recipientPosition,
      },
    });

    if (!recipient) {
      this.logger.error(`No recipient found for cycle ${circle.currentCycle}`);
      return;
    }

    // Calculate payout amount
    const contributionAmount = new Decimal(circle.contributionAmount);
    const totalAmount = contributionAmount.times(circle.maxMembers);

    // Calculate fees
    const platformFee = totalAmount.times(this.platformFeePercentage).dividedBy(100);
    const organizerFee = new Decimal(0); // Optional: can be configured per circle
    const netAmount = totalAmount.minus(platformFee).minus(organizerFee);

    // Create payout record
    const payout = queryRunner.manager.create(RoscaPayoutEntity, {
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

    // Update membership
    recipient.hasReceivedPayout = true;
    recipient.payoutReceivedDate = new Date();
    recipient.totalReceived = new Decimal(recipient.totalReceived).plus(netAmount).toString();

    await queryRunner.manager.save(recipient);

    // Update circle
    circle.totalPaidOut = new Decimal(circle.totalPaidOut).plus(netAmount).toString();
    circle.currentCycle += 1;

    // Calculate next payout date
    if (circle.currentCycle <= circle.totalCycles) {
      const nextPayoutDate = new Date(circle.nextPayoutDate);
      nextPayoutDate.setDate(nextPayoutDate.getDate() + circle.cycleDurationDays);
      circle.nextPayoutDate = nextPayoutDate;
    } else {
      // Circle completed
      circle.status = 'completed';
      circle.nextPayoutDate = null;
    }

    await queryRunner.manager.save(circle);

    this.logger.log(
      `Payout processed: ${payout.payoutId} to user ${recipient.userId} for ${netAmount.toString()}`,
    );

    this.eventEmitter.emit('rosca.payout_processed', {
      circleId: circle.circleId,
      payoutId: payout.payoutId,
      recipientUserId: recipient.userId,
      amount: netAmount.toString(),
      cycleNumber: circle.currentCycle - 1,
    });
  }

  /**
   * Determine payout order based on circle type
   */
  private async determinePayoutOrder(circle: RoscaCircleEntity, queryRunner: any): Promise<void> {
    const memberships = await queryRunner.manager.find(RoscaMembershipEntity, {
      where: { circleId: circle.circleId, status: 'active' },
    });

    if (circle.circleType === 'fixed_rotation') {
      // Already assigned during join
      circle.payoutOrder = memberships
        .sort((a, b) => a.payoutPosition! - b.payoutPosition!)
        .map((m) => m.userId);
    } else if (circle.circleType === 'random') {
      // Random shuffle
      const shuffled = this.shuffleArray([...memberships]);
      shuffled.forEach((membership, index) => {
        membership.payoutPosition = index + 1;
      });

      await queryRunner.manager.save(shuffled);

      circle.payoutOrder = shuffled.map((m) => m.userId);
    } else if (circle.circleType === 'organizer_decides') {
      // Organizer is first, others TBD
      const organizer = memberships.find((m) => m.role === 'organizer');
      const others = memberships.filter((m) => m.role !== 'organizer');

      organizer!.payoutPosition = 1;
      await queryRunner.manager.save(organizer);

      circle.payoutOrder = [organizer!.userId, ...others.map((m) => m.userId)];
    }
    // Bidding type requires separate bidding mechanism
  }

  /**
   * Create contribution records for all cycles
   */
  private async createContributionRecords(circle: RoscaCircleEntity, queryRunner: any): Promise<void> {
    const memberships = await queryRunner.manager.find(RoscaMembershipEntity, {
      where: { circleId: circle.circleId, status: 'active' },
    });

    const contributions: RoscaContributionEntity[] = [];

    for (let cycle = 1; cycle <= circle.totalCycles; cycle++) {
      const cycleStartDate = new Date(circle.startDate);
      cycleStartDate.setDate(cycleStartDate.getDate() + (cycle - 1) * circle.cycleDurationDays);

      const dueDate = new Date(cycleStartDate);
      dueDate.setDate(dueDate.getDate() + circle.cycleDurationDays);

      for (const membership of memberships) {
        const contribution = queryRunner.manager.create(RoscaContributionEntity, {
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

    // Update pending contributions total
    const totalPending = new Decimal(circle.contributionAmount)
      .times(circle.maxMembers)
      .times(circle.totalCycles);

    circle.pendingContributions = totalPending.toString();
  }

  /**
   * Get user's circles
   */
  async getUserCircles(userId: string): Promise<{
    active: RoscaCircleEntity[];
    recruiting: RoscaCircleEntity[];
    completed: RoscaCircleEntity[];
  }> {
    const memberships = await this.membershipRepository.find({
      where: { userId, status: In(['pending', 'active', 'completed']) },
    });

    const circleIds = memberships.map((m) => m.circleId);

    if (circleIds.length === 0) {
      return { active: [], recruiting: [], completed: [] };
    }

    const circles = await this.circleRepository.find({
      where: { circleId: In(circleIds) },
    });

    return {
      active: circles.filter((c) => c.status === 'active'),
      recruiting: circles.filter((c) => c.status === 'recruiting'),
      completed: circles.filter((c) => c.status === 'completed'),
    };
  }

  /**
   * Get circle details with memberships
   */
  async getCircleDetails(circleId: string): Promise<{
    circle: RoscaCircleEntity;
    memberships: RoscaMembershipEntity[];
    upcomingPayouts: RoscaPayoutEntity[];
  }> {
    const circle = await this.circleRepository.findOne({
      where: { circleId },
    });

    if (!circle) {
      throw new NotFoundException('Circle not found');
    }

    const memberships = await this.membershipRepository.find({
      where: { circleId },
      order: { payoutPosition: 'ASC' as any },
    });

    const upcomingPayouts = await this.payoutRepository.find({
      where: {
        circleId,
        status: In(['pending', 'processing']),
      },
      order: { cycleNumber: 'ASC' as any },
    });

    return { circle, memberships, upcomingPayouts };
  }

  /**
   * Get user contribution history for a circle
   */
  async getUserContributions(userId: string, circleId: string): Promise<RoscaContributionEntity[]> {
    return this.contributionRepository.find({
      where: { userId, circleId },
      order: { cycleNumber: 'ASC' as any },
    });
  }

  /**
   * CRON: Check for overdue contributions and apply late fees
   */
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async checkOverdueContributions(): Promise<void> {
    this.logger.log('Checking for overdue ROSCA contributions');

    const now = new Date();

    const overdueContributions = await this.contributionRepository.find({
      where: {
        status: 'pending',
        dueDate: LessThan(now),
      },
    });

    for (const contribution of overdueContributions) {
      const circle = await this.circleRepository.findOne({
        where: { circleId: contribution.circleId },
      });

      if (!circle || !circle.allowLateFees) {
        continue;
      }

      // Calculate late fee
      const daysLate = Math.floor((now.getTime() - contribution.dueDate.getTime()) / (1000 * 60 * 60 * 24));

      if (daysLate > circle.gracePeriodDays) {
        const lateFee = new Decimal(contribution.amount)
          .times(circle.lateFeePercentage || '5')
          .dividedBy(100);

        contribution.lateFee = lateFee.toString();
        contribution.status = 'late';
        contribution.daysLate = daysLate;

        await this.contributionRepository.save(contribution);

        // Update membership
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

        this.logger.log(
          `Late fee applied: ${contribution.contributionId}, ${lateFee.toString()} ${contribution.currency}`,
        );

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

  /**
   * Search for public circles
   */
  async searchCircles(filters: {
    currency?: string;
    maxContribution?: string;
    frequency?: string;
  }): Promise<RoscaCircleEntity[]> {
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

  // Helper methods

  private getFrequencyDays(frequency: string): number {
    const map = {
      daily: 1,
      weekly: 7,
      biweekly: 14,
      monthly: 30,
    };
    return map[frequency] || 30;
  }

  private generateInviteCode(): string {
    return crypto.randomBytes(8).toString('hex').toUpperCase();
  }

  private shuffleArray<T>(array: T[]): T[] {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  private calculateReliabilityScore(membership: RoscaMembershipEntity): string {
    const totalPayments = membership.onTimePayments + membership.latePayments + membership.missedPayments;

    if (totalPayments === 0) {
      return '100';
    }

    const score =
      ((membership.onTimePayments + membership.latePayments * 0.5) / totalPayments) * 100;

    return Math.max(0, Math.min(100, score)).toFixed(2);
  }
}
