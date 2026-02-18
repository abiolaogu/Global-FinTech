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

  // Credit Line fields
  @Column('decimal', { precision: 20, scale: 8, default: 0 })
  creditLimit: string; // Maximum credit line amount

  @Column('decimal', { precision: 20, scale: 8, default: 0 })
  creditUsed: string; // Amount of credit currently used

  @Column('decimal', { precision: 20, scale: 8, default: 0 })
  offlineSpendLimit: string; // Maximum amount that can be spent offline

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  creditInterestRate: number; // Annual percentage rate for credit

  @Column({ type: 'integer', default: 30 })
  creditGracePeriodDays: number; // Days before interest accrues

  @Column({ type: 'timestamp', nullable: true })
  creditAllocatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  creditLastUsedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  creditNextPaymentDue: Date;

  // SMS/USSD Sync tracking
  @Column({ type: 'timestamp', nullable: true })
  lastSmsSyncAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUssdSyncAt: Date;

  @Column({ type: 'integer', default: 0 })
  smsSyncCount: number;

  @Column({ type: 'integer', default: 0 })
  ussdSyncCount: number;

  @Column({ type: 'jsonb', nullable: true })
  syncSettings: {
    preferredChannel?: 'internet' | 'sms' | 'ussd';
    smsEnabled?: boolean;
    ussdEnabled?: boolean;
    autoSyncInterval?: number; // minutes
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Computed property for credit available
  get creditAvailable(): string {
    const limit = parseFloat(this.creditLimit) || 0;
    const used = parseFloat(this.creditUsed) || 0;
    return (limit - used).toFixed(8);
  }

  // Computed property for total available (balance + credit)
  get totalAvailable(): string {
    const available = parseFloat(this.availableBalance) || 0;
    const creditAvail = parseFloat(this.creditAvailable) || 0;
    return (available + creditAvail).toFixed(8);
  }
}
