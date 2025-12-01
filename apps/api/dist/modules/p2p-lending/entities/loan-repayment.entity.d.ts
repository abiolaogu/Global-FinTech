export declare class LoanRepaymentEntity {
    repaymentId: string;
    loanListingId: string;
    amount: string;
    paymentMethod: string;
    status: 'pending' | 'completed' | 'failed';
    createdAt: Date;
}
