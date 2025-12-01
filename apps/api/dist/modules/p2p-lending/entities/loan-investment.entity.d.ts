export declare class LoanInvestmentEntity {
    investmentId: string;
    loanListingId: string;
    lenderId: string;
    amount: string;
    interestRate: number;
    totalReturns: string;
    status: 'active' | 'completed' | 'defaulted';
    createdAt: Date;
    updatedAt: Date;
}
