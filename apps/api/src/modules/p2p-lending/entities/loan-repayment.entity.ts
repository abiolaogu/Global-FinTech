import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('loan_repayments')
@Index(['loanListingId', 'createdAt'])
export class LoanRepaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  repaymentId: string;

  @Column({ type: 'uuid' })
  loanListingId: string;

  @Column({ type: 'decimal', precision: 24, scale: 8 })
  amount: string;

  @Column({ type: 'varchar', length: 50 })
  paymentMethod: string;

  @Column({ type: 'varchar', length: 20 })
  status: 'pending' | 'completed' | 'failed';

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
