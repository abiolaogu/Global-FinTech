import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';

@Entity('wallets')
@Index(['userId', 'currency'], { unique: true })
@Index(['status'])
@Index(['createdAt'])
export class WalletEntity {
  @PrimaryColumn('uuid')
  walletId: string;

  @Column('uuid')
  @Index()
  userId: string;

  @Column({ length: 3 })
  currency: string; // ISO 4217 currency code

  @Column('decimal', { precision: 20, scale: 8, default: 0 })
  balance: string;

  @Column('decimal', { precision: 20, scale: 8, default: 0 })
  availableBalance: string; // Balance minus holds

  @Column('decimal', { precision: 20, scale: 8, default: 0 })
  pendingBalance: string; // Pending incoming funds

  @Column('decimal', { precision: 20, scale: 8, default: 0 })
  heldBalance: string; // Funds on hold (disputes, pending settlements)

  @Column({
    type: 'enum',
    enum: ['active', 'frozen', 'closed', 'restricted'],
    default: 'active',
  })
  status: string;

  @Column({ type: 'boolean', default: false })
  isPrimary: boolean; // Primary wallet for this currency

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  limits: {
    dailyTransactionLimit?: string;
    monthlyTransactionLimit?: string;
    singleTransactionLimit?: string;
    dailyWithdrawalLimit?: string;
  };

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  lifetimeReceived: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  lifetimeSent: string;

  @Column({ type: 'integer', default: 0 })
  transactionCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastTransactionAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  frozenAt: Date;

  @Column({ type: 'text', nullable: true })
  frozenReason: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
