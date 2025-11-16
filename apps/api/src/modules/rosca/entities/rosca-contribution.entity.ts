import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('rosca_contributions')
@Index(['circleId'])
@Index(['userId'])
@Index(['cycleNumber'])
@Index(['status'])
@Index(['dueDate'])
export class RoscaContributionEntity {
  @PrimaryGeneratedColumn('uuid')
  contributionId: string;

  @Column({ type: 'uuid' })
  circleId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'int' })
  cycleNumber: number; // Which cycle this contribution is for

  @Column({ type: 'decimal', precision: 24, scale: 8 })
  amount: string;

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  @Column({ type: 'decimal', precision: 24, scale: 8, default: '0' })
  lateFee: string;

  @Column({ type: 'varchar', length: 20 })
  status: 'pending' | 'paid' | 'late' | 'missed' | 'waived';

  @Column({ type: 'timestamp with time zone' })
  dueDate: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  paidDate: Date | null;

  @Column({ type: 'int', nullable: true })
  daysLate: number | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  paymentMethod: string | null;

  @Column({ type: 'uuid', nullable: true })
  transactionId: string | null; // Reference to payment transaction

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
