export declare class RoscaMembershipEntity {
    membershipId: string;
    circleId: string;
    userId: string;
    role: 'organizer' | 'member';
    payoutPosition: number | null;
    status: 'pending' | 'active' | 'completed' | 'defaulted' | 'removed';
    hasReceivedPayout: boolean;
    payoutReceivedDate: Date | null;
    totalContributed: string;
    totalReceived: string;
    missedPayments: number;
    latePayments: number;
    onTimePayments: number;
    reliabilityScore: string;
    joinedAt: Date | null;
    leftAt: Date | null;
    preferences: any;
    createdAt: Date;
    updatedAt: Date;
}
