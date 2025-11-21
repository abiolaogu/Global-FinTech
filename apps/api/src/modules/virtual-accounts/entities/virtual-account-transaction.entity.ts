import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('virtual_account_transactions')
@Index(['virtualAccountId', 'createdAt'])
@Index(['userId'])
@Index(['status'])
@Index(['providerTransactionId'])
@Index(['sessionId'])
export class VirtualAccountTransactionEntity {
  @PrimaryColumn('uuid')
  transactionId: string;

  @Column('uuid')
  @Index()
  virtualAccountId: string;

  @Column('uuid')
  @Index()
  userId: string;

  @Column('uuid', { nullable: true })
  walletId: string; // Wallet that was credited

  @Column('uuid', { nullable: true })
  walletTransactionId: string; // Related wallet transaction

  @Column('decimal', { precision: 20, scale: 8 })
  amount: string;

  @Column({ length: 3 })
  currency: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'completed', 'failed', 'reversed'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  senderAccountNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  senderAccountName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  senderBankName: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  senderBankCode: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  reference: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  sessionId: string; // Payment session/reference

  @Column({ type: 'text', nullable: true })
  narration: string;

  @Column({ type: 'varchar', length: 100 })
  provider: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  providerTransactionId: string;

  @Column({ type: 'jsonb', nullable: true })
  providerData: Record<string, any>;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  fee: string;

  @Column({ type: 'boolean', default: false })
  autoCredited: boolean;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  failedAt: Date;

  @Column({ type: 'text', nullable: true })
  failureReason: string;

  @Column({ type: 'timestamp', nullable: true })
  reversedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
