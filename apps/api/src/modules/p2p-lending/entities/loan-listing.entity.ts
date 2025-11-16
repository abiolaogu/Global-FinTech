import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('loan_listings')
@Index(['borrowerId'])
@Index(['status'])
@Index(['riskTier'])
export class LoanListingEntity {
  @PrimaryGeneratedColumn('uuid')
  loanListingId: string;

  @Column({ type: 'uuid' })
  borrowerId: string;

  @Column({ type: 'decimal', precision: 24, scale: 8 })
  amount: string; // Requested loan amount

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  @Column({ type: 'decimal', precision: 24, scale: 8, default: '0' })
  fundedAmount: string; // Amount funded by lenders

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  interestRate: number; // Annual percentage rate

  @Column({ type: 'int' })
  term: number; // Loan term in months

  @Column({ type: 'decimal', precision: 24, scale: 8 })
  monthlyPayment: string;

  @Column({ type: 'decimal', precision: 24, scale: 8 })
  totalInterest: string;

  @Column({ type: 'decimal', precision: 24, scale: 8, nullable: true })
  outstandingBalance: string | null;

  @Column({ type: 'text' })
  purpose: string; // Loan purpose

  @Column({ type: 'int', nullable: true })
  creditScore: number | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  employmentStatus: string | null;

  @Column({ type: 'decimal', precision: 24, scale: 2, nullable: true })
  annualIncome: string | null;

  @Column({ type: 'varchar', length: 20 })
  riskTier: 'excellent' | 'good' | 'fair' | 'poor';

  @Column({ type: 'varchar', length: 20 })
  status: 'open' | 'funded' | 'active' | 'repaid' | 'late' | 'defaulted' | 'cancelled';

  @Column({ type: 'timestamp with time zone' })
  expiresAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  fundedAt: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  disbursedAt: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  firstPaymentDue: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  repaidAt: Date | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
