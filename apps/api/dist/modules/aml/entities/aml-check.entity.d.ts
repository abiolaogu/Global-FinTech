export declare class AMLCheckEntity {
    checkId: string;
    userId: string;
    transactionType: string;
    amount: string;
    currency: string;
    passed: boolean;
    flags: string[] | null;
    sanctionsMatch: boolean;
    pepMatch: boolean;
    riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
    requiresReview: boolean;
    counterpartyId: string | null;
    createdAt: Date;
}
