import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('virtual_accounts')
@Index(['userId', 'currency'])
@Index(['accountNumber'], { unique: true })
@Index(['status'])
@Index(['providerId'])
export class VirtualAccountEntity {
  @PrimaryColumn('uuid')
  virtualAccountId: string;

  @Column('uuid')
  @Index()
  userId: string;

  @Column('uuid', { nullable: true })
  walletId: string; // Linked wallet for auto-credit

  @Column({ type: 'varchar', length: 50, unique: true })
  accountNumber: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  accountName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bankName: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  bankCode: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  routingNumber: string; // For US ACH

  @Column({ type: 'varchar', length: 50, nullable: true })
  iban: string; // For European accounts

  @Column({ type: 'varchar', length: 50, nullable: true })
  swiftCode: string;

  @Column({ length: 3 })
  currency: string;

  @Column({ length: 2 })
  country: string;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'suspended', 'closed'],
    default: 'active',
  })
  status: string;

  @Column({
    type: 'enum',
    enum: ['dedicated', 'dynamic', 'pooled'],
    default: 'dedicated',
  })
  accountType: string;

  @Column({
    type: 'varchar',
    length: 100,
  })
  provider: string; // paystack, flutterwave, woven, budpay, etc.

  @Column({ type: 'varchar', length: 255, nullable: true })
  providerId: string; // Provider's reference ID

  @Column({ type: 'varchar', length: 255, nullable: true })
  providerAccountId: string;

  @Column({ type: 'boolean', default: true })
  autoCredit: boolean; // Automatically credit wallet on payment received

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  providerData: Record<string, any>; // Provider-specific data

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  totalReceived: string;

  @Column({ type: 'integer', default: 0 })
  transactionCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastTransactionAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  activatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  suspendedAt: Date;

  @Column({ type: 'text', nullable: true })
  suspensionReason: string;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date; // For temporary/dynamic accounts

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
