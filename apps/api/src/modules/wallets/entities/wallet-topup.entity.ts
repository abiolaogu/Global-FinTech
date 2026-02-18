import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('wallet_topups')
@Index(['walletId'])
@Index(['userId'])
@Index(['status'])
@Index(['reference'], { unique: true })
@Index(['createdAt'])
export class WalletTopupEntity {
  @PrimaryColumn('uuid')
  topupId: string;

  @Column('uuid')
  @Index()
  walletId: string;

  @Column('uuid')
  @Index()
  userId: string;

  @Column('decimal', { precision: 20, scale: 8 })
  amount: string;

  @Column({ type: 'uuid', nullable: true })
  sourceAccountId: string; // Bank account, card, or main wallet ID

  @Column({ length: 50 })
  sourceType: string; // 'bank_account', 'card', 'main_wallet', 'virtual_account'

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'completed', 'failed', 'reversed'],
    default: 'pending',
  })
  status: string;

  @Column({
    type: 'enum',
    enum: ['internet', 'sms', 'ussd'],
    default: 'internet',
  })
  channel: string; // Channel used to initiate top-up

  @Column({ length: 255, unique: true })
  reference: string; // Unique reference for this top-up

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    sourceAccountName?: string;
    sourceAccountNumber?: string;
    paymentGateway?: string;
    gatewayReference?: string;
    ipAddress?: string;
    deviceInfo?: string;
    smsId?: string; // If initiated via SMS
    ussdSessionId?: string; // If initiated via USSD
  };

  @Column({ type: 'text', nullable: true })
  failureReason: string;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  failedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  reversedAt: Date;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  balanceBefore: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  balanceAfter: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateReference() {
    if (!this.topupId) {
      this.topupId = uuidv4();
    }
    if (!this.reference) {
      this.reference = `TOP-${Date.now()}-${this.topupId.substring(0, 8).toUpperCase()}`;
    }
  }
}
