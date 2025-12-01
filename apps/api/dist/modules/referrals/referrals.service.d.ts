import { Repository } from 'typeorm';
import { ReferralEntity } from './entities/referral.entity';
import { UserEntity } from '../users/entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
export interface ReferralRewards {
    referrer: {
        cashBonus: number;
        rewardPoints: number;
    };
    referee: {
        cashBonus: number;
        rewardPoints: number;
    };
}
export declare class ReferralsService {
    private readonly referralRepository;
    private readonly userRepository;
    private readonly eventEmitter;
    private readonly logger;
    private readonly rewards;
    constructor(referralRepository: Repository<ReferralEntity>, userRepository: Repository<UserEntity>, eventEmitter: EventEmitter2);
    generateReferralCode(userId: string): Promise<string>;
    applyReferralCode(referralCode: string, newUserId: string): Promise<void>;
    private awardSignupRewards;
    trackMilestone(userId: string, milestone: 'first_deposit' | 'first_trade'): Promise<void>;
    getReferralStats(userId: string): Promise<{
        totalReferred: any;
        completedReferrals: any;
        pendingReferrals: any;
        totalEarnings: number;
        breakdown: {
            signup: number;
            deposits: number;
            trades: number;
        };
        referrals: any;
    }>;
    getLeaderboard(limit?: number): Promise<any>;
}
