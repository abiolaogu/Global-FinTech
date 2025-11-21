import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('split_payments')
@Index(['paymentId'])
@Index(['userId'])
@Index(['status'])
@Index(['createdAt'])
export class SplitPaymentEntity {
  @PrimaryColumn('uuid')
  splitPaymentId: string;

  @Column('uuid')
  @Index()
  paymentId: string; // Original payment transaction ID

  @Column('uuid')
  @Index()
  userId: string; // Merchant/seller who created the split

  @Column('decimal', { precision: 20, scale: 8 })
  totalAmount: string;

  @Column({ length: 3 })
  currency: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'completed', 'failed', 'partially_completed'],
    default: 'pending',
  })
  status: string;

  @Column({
    type: 'enum',
    enum: ['percentage', 'fixed', 'hybrid'],
    default: 'percentage',
  })
  splitType: string;

  @Column({ type: 'jsonb' })
  splitRules: Array<{
    recipientId: string; // User ID or wallet ID
    recipientType: 'user' | 'wallet' | 'merchant' | 'platform';
    splitType: 'percentage' | 'fixed';
    value: string; // Percentage (0-100) or fixed amount
    description?: string;
    metadata?: Record<string, any>;
  }>;

  @Column({ type: 'jsonb', nullable: true })
  actualSplits: Array<{
    recipientId: string;
    recipientType: string;
    amount: string;
    currency: string;
    status: 'pending' | 'completed' | 'failed';
    transactionId?: string;
    walletId?: string;
    failureReason?: string;
    completedAt?: Date;
  }>;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  platformFee: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  splitConfigurationId: string; // Reference to saved split configuration

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  failedAt: Date;

  @Column({ type: 'text', nullable: true })
  failureReason: string;

  @Column({ type: 'integer', default: 0 })
  completedSplitsCount: number;

  @Column({ type: 'integer', default: 0 })
  failedSplitsCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
