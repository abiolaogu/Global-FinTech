import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('wallet_transactions')
@Index(['walletId', 'createdAt'])
@Index(['userId', 'createdAt'])
@Index(['type'])
@Index(['status'])
@Index(['referenceId'])
@Index(['externalTransactionId'])
export class WalletTransactionEntity {
  @PrimaryColumn('uuid')
  transactionId: string;

  @Column('uuid')
  @Index()
  walletId: string;

  @Column('uuid')
  @Index()
  userId: string;

  @Column({
    type: 'enum',
    enum: [
      'credit',
      'debit',
      'hold',
      'release_hold',
      'reversal',
      'fee',
      'refund',
      'adjustment',
    ],
  })
  type: string;

  @Column({
    type: 'enum',
    enum: [
      'payment_received',
      'payment_sent',
      'deposit',
      'withdrawal',
      'transfer_in',
      'transfer_out',
      'split_payment_received',
      'split_payment_sent',
      'fee_charged',
      'refund_received',
      'refund_sent',
      'chargeback',
      'adjustment',
      'interest_earned',
      'cashback',
      'reward',
    ],
  })
  category: string;

  @Column('decimal', { precision: 20, scale: 8 })
  amount: string;

  @Column({ length: 3 })
  currency: string;

  @Column('decimal', { precision: 20, scale: 8 })
  balanceBefore: string;

  @Column('decimal', { precision: 20, scale: 8 })
  balanceAfter: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'completed', 'failed', 'reversed', 'cancelled'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  counterpartyWalletId: string; // For internal transfers

  @Column({ type: 'uuid', nullable: true })
  counterpartyUserId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  externalTransactionId: string; // External payment gateway transaction ID

  @Column({ type: 'varchar', length: 255, nullable: true })
  referenceId: string; // Reference to parent transaction (e.g., original payment for a refund)

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentMethod: string; // card, bank_transfer, virtual_account, etc.

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentGateway: string; // paystack, flutterwave, stripe, etc.

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  failedAt: Date;

  @Column({ type: 'text', nullable: true })
  failureReason: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  errorCode: string;

  @Column({ type: 'timestamp', nullable: true })
  reversedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  reversalTransactionId: string; // ID of the reversal transaction

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
