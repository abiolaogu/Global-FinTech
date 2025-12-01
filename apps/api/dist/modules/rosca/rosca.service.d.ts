import { Repository, DataSource } from 'typeorm';
import { RoscaCircleEntity } from './entities/rosca-circle.entity';
import { RoscaMembershipEntity } from './entities/rosca-membership.entity';
import { RoscaContributionEntity } from './entities/rosca-contribution.entity';
import { RoscaPayoutEntity } from './entities/rosca-payout.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
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
export declare class RoscaService {
    private readonly circleRepository;
    private readonly membershipRepository;
    private readonly contributionRepository;
    private readonly payoutRepository;
    private readonly dataSource;
    private readonly eventEmitter;
    private readonly logger;
    private readonly platformFeePercentage;
    constructor(circleRepository: Repository<RoscaCircleEntity>, membershipRepository: Repository<RoscaMembershipEntity>, contributionRepository: Repository<RoscaContributionEntity>, payoutRepository: Repository<RoscaPayoutEntity>, dataSource: DataSource, eventEmitter: EventEmitter2);
    createCircle(dto: CreateCircleDto): Promise<RoscaCircleEntity>;
    joinCircle(dto: JoinCircleDto): Promise<RoscaMembershipEntity>;
    makeContribution(dto: MakeContributionDto): Promise<RoscaContributionEntity>;
    private processPayout;
    private determinePayoutOrder;
    private createContributionRecords;
    getUserCircles(userId: string): Promise<{
        active: RoscaCircleEntity[];
        recruiting: RoscaCircleEntity[];
        completed: RoscaCircleEntity[];
    }>;
    getCircleDetails(circleId: string): Promise<{
        circle: RoscaCircleEntity;
        memberships: RoscaMembershipEntity[];
        upcomingPayouts: RoscaPayoutEntity[];
    }>;
    getUserContributions(userId: string, circleId: string): Promise<RoscaContributionEntity[]>;
    checkOverdueContributions(): Promise<void>;
    searchCircles(filters: {
        currency?: string;
        maxContribution?: string;
        frequency?: string;
    }): Promise<RoscaCircleEntity[]>;
    private getFrequencyDays;
    private generateInviteCode;
    private shuffleArray;
    private calculateReliabilityScore;
}
