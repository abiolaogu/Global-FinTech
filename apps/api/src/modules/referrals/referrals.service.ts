import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ReferralEntity } from './entities/referral.entity';
import { UserEntity } from '../users/entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { customAlphabet } from 'nanoid';

export interface ReferralRewards {
  referrer: {
    cashBonus: number; // USD
    rewardPoints: number;
  };
  referee: {
    cashBonus: number;
    rewardPoints: number;
  };
}

@Injectable()
export class ReferralsService {
  private readonly logger = new Logger(ReferralsService.name);

  // Reward structure
  private readonly rewards: Record<string, ReferralRewards> = {
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

  constructor(
    @InjectRepository(ReferralEntity)
    private readonly referralRepository: Repository<ReferralEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Generate referral code for user
   */
  async generateReferralCode(userId: string): Promise<string> {
    const user = await this.userRepository.findOne({ where: { userId } });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    // Check if user already has a referral code
    if (user.referralCode) {
      return user.referralCode;
    }

    // Generate unique code (8 chars, alphanumeric)
    const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 8);
    const referralCode = nanoid();

    // Save to user
    user.referralCode = referralCode;
    await this.userRepository.save(user);

    this.logger.log(`Generated referral code for user ${userId}: ${referralCode}`);

    return referralCode;
  }

  /**
   * Apply referral code during signup
   */
  async applyReferralCode(referralCode: string, newUserId: string): Promise<void> {
    // Find referrer by code
    const referrer = await this.userRepository.findOne({
      where: { referralCode },
    });

    if (!referrer) {
      throw new BadRequestException('Invalid referral code');
    }

    if (referrer.userId === newUserId) {
      throw new BadRequestException('Cannot use your own referral code');
    }

    // Create referral record
    const referral = this.referralRepository.create({
      referrerId: referrer.userId,
      referredUserId: newUserId,
      status: 'pending',
      rewardsPaid: false,
    });

    await this.referralRepository.save(referral);

    // Award signup rewards
    await this.awardSignupRewards(referral.referralId);

    this.logger.log(`Referral applied: ${referrer.userId} -> ${newUserId}`);
  }

  /**
   * Award signup rewards
   */
  private async awardSignupRewards(referralId: string): Promise<void> {
    const referral = await this.referralRepository.findOne({
      where: { referralId },
    });

    if (!referral) {
      return;
    }

    const rewards = this.rewards.signup;

    // Award to referrer
    this.eventEmitter.emit('referral.reward', {
      userId: referral.referrerId,
      type: 'referral_signup',
      cashBonus: rewards.referrer.cashBonus,
      rewardPoints: rewards.referrer.rewardPoints,
    });

    // Award to referee
    this.eventEmitter.emit('referral.reward', {
      userId: referral.referredUserId,
      type: 'referral_signup_bonus',
      cashBonus: rewards.referee.cashBonus,
      rewardPoints: rewards.referee.rewardPoints,
    });

    // Update referral status
    referral.status = 'completed';
    referral.rewardsPaid = true;
    await this.referralRepository.save(referral);

    this.logger.log(`Signup rewards awarded for referral ${referralId}`);
  }

  /**
   * Track milestone completion (first deposit, first trade, etc.)
   */
  async trackMilestone(
    userId: string,
    milestone: 'first_deposit' | 'first_trade',
  ): Promise<void> {
    // Find if user was referred
    const referral = await this.referralRepository.findOne({
      where: { referredUserId: userId },
    });

    if (!referral) {
      return; // User was not referred
    }

    // Check if milestone already rewarded
    if (referral.milestonesCompleted?.includes(milestone)) {
      return;
    }

    // Award milestone rewards to referrer
    const rewards = this.rewards[milestone];

    this.eventEmitter.emit('referral.reward', {
      userId: referral.referrerId,
      type: `referral_${milestone}`,
      cashBonus: rewards.referrer.cashBonus,
      rewardPoints: rewards.referrer.rewardPoints,
    });

    // Update referral milestones
    referral.milestonesCompleted = [
      ...(referral.milestonesCompleted || []),
      milestone,
    ];

    await this.referralRepository.save(referral);

    this.logger.log(`Milestone ${milestone} rewarded for referral ${referral.referralId}`);
  }

  /**
   * Get referral stats for user
   */
  async getReferralStats(userId: string) {
    const referrals = await this.referralRepository.find({
      where: { referrerId: userId },
    });

    const totalReferred = referrals.length;
    const completedReferrals = referrals.filter((r) => r.status === 'completed').length;
    const pendingReferrals = referrals.filter((r) => r.status === 'pending').length;

    // Calculate total earnings
    const signupRewards = completedReferrals * this.rewards.signup.referrer.cashBonus;
    const depositRewards = referrals.filter((r) =>
      r.milestonesCompleted?.includes('first_deposit'),
    ).length * this.rewards.first_deposit.referrer.cashBonus;
    const tradeRewards = referrals.filter((r) =>
      r.milestonesCompleted?.includes('first_trade'),
    ).length * this.rewards.first_trade.referrer.cashBonus;

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

  /**
   * Get referral leaderboard
   */
  async getLeaderboard(limit: number = 100) {
    // Get top referrers
    const referralCounts = await this.referralRepository
      .createQueryBuilder('referral')
      .select('referral.referrerId', 'userId')
      .addSelect('COUNT(*)', 'count')
      .where('referral.status = :status', { status: 'completed' })
      .groupBy('referral.referrerId')
      .orderBy('count', 'DESC')
      .limit(limit)
      .getRawMany();

    const leaderboard = await Promise.all(
      referralCounts.map(async (item) => {
        const user = await this.userRepository.findOne({
          where: { userId: item.userId },
          select: ['userId', 'firstName', 'lastName', 'tier'],
        });

        return {
          userId: item.userId,
          name: `${user?.firstName} ${user?.lastName}`,
          tier: user?.tier,
          totalReferrals: parseInt(item.count),
        };
      }),
    );

    return leaderboard;
  }
}
