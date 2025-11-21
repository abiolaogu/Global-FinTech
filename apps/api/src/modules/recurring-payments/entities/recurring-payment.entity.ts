import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('recurring_payments')
@Index(['userId'])
@Index(['merchantId'])
@Index(['status'])
@Index(['nextPaymentDate'])
export class RecurringPaymentEntity {
  @PrimaryColumn('uuid')
  recurringPaymentId: string;

  @Column('uuid')
  @Index()
  userId: string; // Customer

  @Column('uuid')
  @Index()
  merchantId: string; // Merchant receiving payments

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column('decimal', { precision: 20, scale: 8 })
  amount: string;

  @Column({ length: 3 })
  currency: string;

  @Column({
    type: 'enum',
    enum: ['daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'yearly'],
  })
  frequency: string;

  @Column({
    type: 'enum',
    enum: ['active', 'paused', 'cancelled', 'expired', 'failed'],
    default: 'active',
  })
  status: string;

  @Column({ type: 'date' })
  startDate: Date;

  @Column({ type: 'date', nullable: true })
  endDate: Date; // Null for indefinite

  @Column({ type: 'date' })
  nextPaymentDate: Date;

  @Column({ type: 'integer', nullable: true })
  maxPayments: number; // Null for indefinite

  @Column({ type: 'integer', default: 0 })
  paymentsMade: number;

  @Column({ type: 'integer', default: 0 })
  failedPayments: number;

  @Column({ type: 'integer', default: 0 })
  successfulPayments: number;

  @Column({ type: 'varchar', length: 100 })
  paymentMethod: string;

  @Column({ type: 'text' })
  paymentMethodEncrypted: string; // Encrypted payment method details (card token, etc.)

  @Column('uuid')
  gatewayId: string;

  @Column({ type: 'varchar', length: 100 })
  provider: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  authorizationCode: string; // For tokenized payments

  @Column({ type: 'integer', default: 0 })
  retryAttempts: number;

  @Column({ type: 'integer', default: 3 })
  maxRetryAttempts: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  totalCollected: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  lastPaymentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastFailureAt: Date;

  @Column({ type: 'text', nullable: true })
  lastFailureReason: string;

  @Column({ type: 'timestamp', nullable: true })
  pausedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date;

  @Column({ type: 'text', nullable: true })
  cancellationReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
