export declare class LoanListingEntity {
    loanListingId: string;
    borrowerId: string;
    amount: string;
    currency: string;
    fundedAmount: string;
    interestRate: number;
    term: number;
    monthlyPayment: string;
    totalInterest: string;
    outstandingBalance: string | null;
    purpose: string;
    creditScore: number | null;
    employmentStatus: string | null;
    annualIncome: string | null;
    riskTier: 'excellent' | 'good' | 'fair' | 'poor';
    status: 'open' | 'funded' | 'active' | 'repaid' | 'late' | 'defaulted' | 'cancelled';
    expiresAt: Date;
    fundedAt: Date | null;
    disbursedAt: Date | null;
    firstPaymentDue: Date | null;
    repaidAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
