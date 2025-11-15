import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('referrals')
@Index(['referrerId'])
@Index(['referredUserId'])
@Index(['status'])
export class ReferralEntity {
  @PrimaryGeneratedColumn('uuid')
  referralId: string;

  @Column({ type: 'uuid' })
  referrerId: string;

  @Column({ type: 'uuid' })
  referredUserId: string;

  @Column({ type: 'varchar', length: 20 })
  status: 'pending' | 'completed';

  @Column({ type: 'boolean', default: false })
  rewardsPaid: boolean;

  @Column({ type: 'jsonb', nullable: true })
  milestonesCompleted: string[] | null; // ['first_deposit', 'first_trade', etc.]

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
