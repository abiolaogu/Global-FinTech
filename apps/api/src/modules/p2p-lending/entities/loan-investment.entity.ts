import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('loan_investments')
@Index(['loanListingId'])
@Index(['lenderId'])
@Index(['status'])
export class LoanInvestmentEntity {
  @PrimaryGeneratedColumn('uuid')
  investmentId: string;

  @Column({ type: 'uuid' })
  loanListingId: string;

  @Column({ type: 'uuid' })
  lenderId: string;

  @Column({ type: 'decimal', precision: 24, scale: 8 })
  amount: string; // Amount invested

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  interestRate: number; // Locked-in interest rate

  @Column({ type: 'decimal', precision: 24, scale: 8, default: '0' })
  totalReturns: string; // Total returns received

  @Column({ type: 'varchar', length: 20 })
  status: 'active' | 'completed' | 'defaulted';

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
