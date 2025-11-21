import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('wallet_holds')
@Index(['walletId', 'status'])
@Index(['expiresAt'])
export class WalletHoldEntity {
  @PrimaryColumn('uuid')
  holdId: string;

  @Column('uuid')
  @Index()
  walletId: string;

  @Column('uuid')
  userId: string;

  @Column('decimal', { precision: 20, scale: 8 })
  amount: string;

  @Column({ length: 3 })
  currency: string;

  @Column({
    type: 'enum',
    enum: ['active', 'released', 'captured', 'expired', 'cancelled'],
    default: 'active',
  })
  status: string;

  @Column({
    type: 'enum',
    enum: ['payment_authorization', 'dispute', 'compliance_check', 'manual', 'other'],
  })
  reason: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'uuid', nullable: true })
  referenceTransactionId: string; // Related transaction

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  releasedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  capturedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  capturedTransactionId: string; // Transaction created when hold was captured

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
