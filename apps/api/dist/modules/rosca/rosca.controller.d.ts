import { RoscaService, CreateCircleDto, JoinCircleDto, MakeContributionDto } from './rosca.service';
export declare class RoscaController {
    private readonly roscaService;
    constructor(roscaService: RoscaService);
    createCircle(dto: CreateCircleDto): Promise<import("./entities/rosca-circle.entity").RoscaCircleEntity>;
    joinCircle(circleId: string, dto: Omit<JoinCircleDto, 'circleId'>): Promise<import("./entities/rosca-membership.entity").RoscaMembershipEntity>;
    makeContribution(dto: MakeContributionDto): Promise<import("./entities/rosca-contribution.entity").RoscaContributionEntity>;
    getUserCircles(userId: string): Promise<{
        active: import("./entities/rosca-circle.entity").RoscaCircleEntity[];
        recruiting: import("./entities/rosca-circle.entity").RoscaCircleEntity[];
        completed: import("./entities/rosca-circle.entity").RoscaCircleEntity[];
    }>;
    getCircleDetails(circleId: string): Promise<{
        circle: import("./entities/rosca-circle.entity").RoscaCircleEntity;
        memberships: import("./entities/rosca-membership.entity").RoscaMembershipEntity[];
        upcomingPayouts: import("./entities/rosca-payout.entity").RoscaPayoutEntity[];
    }>;
    getUserContributions(circleId: string, userId: string): Promise<import("./entities/rosca-contribution.entity").RoscaContributionEntity[]>;
    searchCircles(currency?: string, maxContribution?: string, frequency?: string): Promise<import("./entities/rosca-circle.entity").RoscaCircleEntity[]>;
}
