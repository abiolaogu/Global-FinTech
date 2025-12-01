import { Repository, DataSource } from 'typeorm';
import { LoanListingEntity } from './entities/loan-listing.entity';
import { LoanInvestmentEntity } from './entities/loan-investment.entity';
import { LoanRepaymentEntity } from './entities/loan-repayment.entity';
import { UserEntity } from '../users/entities/user.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
export interface CreateLoanListingDto {
    borrowerId: string;
    amount: string;
    currency: string;
    interestRate: number;
    term: number;
    purpose: string;
    creditScore?: number;
    employmentStatus?: string;
    annualIncome?: string;
}
export interface InvestInLoanDto {
    lenderId: string;
    loanListingId: string;
    amount: string;
}
export declare class P2PLendingService {
    private readonly loanListingRepository;
    private readonly loanInvestmentRepository;
    private readonly loanRepaymentRepository;
    private readonly userRepository;
    private readonly dataSource;
    private readonly eventEmitter;
    private readonly logger;
    private readonly riskTiers;
    constructor(loanListingRepository: Repository<LoanListingEntity>, loanInvestmentRepository: Repository<LoanInvestmentEntity>, loanRepaymentRepository: Repository<LoanRepaymentEntity>, userRepository: Repository<UserEntity>, dataSource: DataSource, eventEmitter: EventEmitter2);
    createLoanListing(dto: CreateLoanListingDto): Promise<LoanListingEntity>;
    investInLoan(dto: InvestInLoanDto): Promise<LoanInvestmentEntity>;
    private disburseLoan;
    processRepayment(loanListingId: string, amount: string, paymentMethod: string): Promise<LoanRepaymentEntity>;
    private distributeRepayment;
    getAvailableListings(limit?: number, riskTier?: string): Promise<LoanListingEntity[]>;
    getBorrowerLoans(borrowerId: string): Promise<LoanListingEntity[]>;
    getLenderInvestments(lenderId: string): Promise<LoanInvestmentEntity[]>;
    checkOverduePayments(): Promise<void>;
    private calculateRiskTier;
    private calculateMonthlyPayment;
}
