import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('rosca_circles')
@Index(['organizerId'])
@Index(['status'])
@Index(['nextPayoutDate'])
@Index(['circleType'])
export class RoscaCircleEntity {
  @PrimaryGeneratedColumn('uuid')
  circleId: string;

  @Column({ type: 'uuid' })
  organizerId: string; // Circle creator/organizer

  @Column({ type: 'varchar', length: 200 })
  name: string; // Circle name

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 50 })
  circleType: 'fixed_rotation' | 'bidding' | 'random' | 'organizer_decides';

  @Column({ type: 'decimal', precision: 24, scale: 8 })
  contributionAmount: string; // Fixed contribution per cycle

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  @Column({ type: 'int' })
  maxMembers: number; // Maximum number of participants

  @Column({ type: 'int', default: 1 })
  currentMembers: number; // Current number of participants

  @Column({ type: 'varchar', length: 20 })
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly';

  @Column({ type: 'int' })
  cycleDurationDays: number; // Days between payouts

  @Column({ type: 'timestamp with time zone' })
  startDate: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  endDate: Date | null; // Calculated when circle starts

  @Column({ type: 'timestamp with time zone', nullable: true })
  nextPayoutDate: Date | null;

  @Column({ type: 'int', default: 1 })
  currentCycle: number; // Current payout cycle

  @Column({ type: 'int' })
  totalCycles: number; // Equal to maxMembers

  @Column({ type: 'varchar', length: 20 })
  status: 'recruiting' | 'active' | 'completed' | 'cancelled' | 'suspended';

  // Rules and settings
  @Column({ type: 'boolean', default: true })
  allowLateFees: boolean;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  lateFeePercentage: string | null; // Percentage of contribution

  @Column({ type: 'boolean', default: true })
  requireKyc: boolean;

  @Column({ type: 'boolean', default: false })
  allowPartialPayments: boolean;

  @Column({ type: 'int', default: 3 })
  gracePeriodDays: number;

  @Column({ type: 'boolean', default: true })
  autoRemindContributions: boolean;

  @Column({ type: 'boolean', default: false })
  isPrivate: boolean; // Private (invite-only) or public

  @Column({ type: 'varchar', length: 100, nullable: true })
  inviteCode: string | null; // For private circles

  // Financial tracking
  @Column({ type: 'decimal', precision: 24, scale: 8, default: '0' })
  totalContributed: string;

  @Column({ type: 'decimal', precision: 24, scale: 8, default: '0' })
  totalPaidOut: string;

  @Column({ type: 'decimal', precision: 24, scale: 8, default: '0' })
  pendingContributions: string;

  // Trust and reputation
  @Column({ type: 'int', default: 0 })
  defaultCount: number; // Number of defaults in circle

  @Column({ type: 'decimal', precision: 5, scale: 2, default: '100' })
  trustScore: string; // 0-100 based on payment history

  @Column({ type: 'jsonb', nullable: true })
  rules: any; // Custom circle rules

  @Column({ type: 'jsonb', nullable: true })
  payoutOrder: string[] | null; // Array of user IDs in payout order

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
