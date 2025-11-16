import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('subscriptions')
@Index(['userId', 'status'])
@Index(['nextBillingDate'])
export class SubscriptionEntity {
  @PrimaryGeneratedColumn('uuid')
  subscriptionId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 20 })
  tier: 'silver' | 'gold' | 'platinum';

  @Column({ type: 'varchar', length: 20 })
  billingCycle: 'monthly' | 'yearly';

  @Column({ type: 'varchar', length: 20 })
  status: 'active' | 'cancelled' | 'past_due';

  @Column({ type: 'decimal', precision: 10, scale: 2 })
  amount: string;

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  @Column({ type: 'timestamp with time zone' })
  nextBillingDate: Date;

  @Column({ type: 'varchar', length: 255 })
  paymentMethodId: string;

  @Column({ type: 'timestamp with time zone', nullable: true })
  cancelledAt: Date | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
