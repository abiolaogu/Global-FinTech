export declare class ReferralEntity {
    referralId: string;
    referrerId: string;
    referredUserId: string;
    status: 'pending' | 'completed';
    rewardsPaid: boolean;
    milestonesCompleted: string[] | null;
    createdAt: Date;
    updatedAt: Date;
}
