import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('rosca_memberships')
@Index(['circleId'])
@Index(['userId'])
@Index(['status'])
@Index(['payoutPosition'])
export class RoscaMembershipEntity {
  @PrimaryGeneratedColumn('uuid')
  membershipId: string;

  @Column({ type: 'uuid' })
  circleId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 20 })
  role: 'organizer' | 'member';

  @Column({ type: 'int', nullable: true })
  payoutPosition: number | null; // Position in payout queue (1 to maxMembers)

  @Column({ type: 'varchar', length: 20 })
  status: 'pending' | 'active' | 'completed' | 'defaulted' | 'removed';

  @Column({ type: 'boolean', default: false })
  hasReceivedPayout: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  payoutReceivedDate: Date | null;

  @Column({ type: 'decimal', precision: 24, scale: 8, default: '0' })
  totalContributed: string;

  @Column({ type: 'decimal', precision: 24, scale: 8, default: '0' })
  totalReceived: string;

  @Column({ type: 'int', default: 0 })
  missedPayments: number;

  @Column({ type: 'int', default: 0 })
  latePayments: number;

  @Column({ type: 'int', default: 0 })
  onTimePayments: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: '100' })
  reliabilityScore: string; // 0-100 based on payment history

  @Column({ type: 'timestamp with time zone', nullable: true })
  joinedAt: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  leftAt: Date | null;

  @Column({ type: 'jsonb', nullable: true })
  preferences: any; // Member-specific preferences

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
