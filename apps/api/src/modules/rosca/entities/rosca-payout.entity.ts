import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('rosca_payouts')
@Index(['circleId'])
@Index(['recipientUserId'])
@Index(['cycleNumber'])
@Index(['status'])
export class RoscaPayoutEntity {
  @PrimaryGeneratedColumn('uuid')
  payoutId: string;

  @Column({ type: 'uuid' })
  circleId: string;

  @Column({ type: 'uuid' })
  recipientUserId: string;

  @Column({ type: 'int' })
  cycleNumber: number;

  @Column({ type: 'decimal', precision: 24, scale: 8 })
  amount: string; // Total payout amount

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  @Column({ type: 'decimal', precision: 24, scale: 8, default: '0' })
  organizerFee: string; // Optional organizer fee

  @Column({ type: 'decimal', precision: 24, scale: 8, default: '0' })
  platformFee: string; // Platform fee

  @Column({ type: 'decimal', precision: 24, scale: 8 })
  netAmount: string; // Amount after fees

  @Column({ type: 'varchar', length: 20 })
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'reversed';

  @Column({ type: 'timestamp with time zone' })
  scheduledDate: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  processedDate: Date | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  paymentMethod: string | null;

  @Column({ type: 'uuid', nullable: true })
  transactionId: string | null;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'jsonb', nullable: true })
  contributionBreakdown: any; // Details of contributions that make up this payout

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
