import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('payment_links')
@Index(['userId'])
@Index(['code'], { unique: true })
@Index(['status'])
export class PaymentLinkEntity {
  @PrimaryColumn('uuid')
  linkId: string;

  @Column('uuid')
  @Index()
  userId: string; // Merchant/user who created the link

  @Column({ type: 'varchar', length: 100, unique: true })
  code: string; // Short code for the link (e.g., pay/abc123)

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['fixed', 'flexible', 'minimum'],
    default: 'fixed',
  })
  amountType: string;

  @Column('decimal', { precision: 20, scale: 8, nullable: true })
  amount: string; // Fixed or minimum amount

  @Column({ length: 3 })
  currency: string;

  @Column({ type: 'boolean', default: true })
  active: boolean;

  @Column({
    type: 'enum',
    enum: ['active', 'inactive', 'expired', 'completed'],
    default: 'active',
  })
  status: string;

  @Column({ type: 'jsonb', nullable: true })
  allowedPaymentMethods: string[]; // card, bank_transfer, mobile_money, etc.

  @Column({ type: 'varchar', length: 255, nullable: true })
  redirectUrl: string; // Where to redirect after payment

  @Column({ type: 'boolean', default: false })
  collectCustomerInfo: boolean;

  @Column({ type: 'jsonb', nullable: true })
  customFields: Array<{
    name: string;
    label: string;
    type: 'text' | 'email' | 'phone' | 'number' | 'select';
    required: boolean;
    options?: string[];
  }>;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logoUrl: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  brandColor: string;

  @Column({ type: 'integer', nullable: true })
  maxPayments: number; // Maximum number of times this link can be paid

  @Column({ type: 'integer', default: 0 })
  paymentCount: number;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  totalCollected: string;

  @Column({ type: 'timestamp', nullable: true })
  expiresAt: Date;

  @Column({ type: 'uuid', nullable: true })
  splitConfigurationId: string; // Auto-apply split payment

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  lastPaymentAt: Date;

  @Column({ type: 'integer', default: 0 })
  viewCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
