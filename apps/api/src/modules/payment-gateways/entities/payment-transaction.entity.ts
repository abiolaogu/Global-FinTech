import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('payment_transactions')
@Index(['userId', 'createdAt'])
@Index(['merchantId', 'createdAt'])
@Index(['gatewayId'])
@Index(['status'])
@Index(['reference'])
@Index(['providerReference'])
export class PaymentTransactionEntity {
  @PrimaryColumn('uuid')
  transactionId: string;

  @Column('uuid', { nullable: true })
  @Index()
  userId: string; // Customer making payment

  @Column('uuid', { nullable: true })
  @Index()
  merchantId: string; // Merchant receiving payment

  @Column('uuid')
  gatewayId: string;

  @Column({ type: 'varchar', length: 100 })
  provider: string;

  @Column('decimal', { precision: 20, scale: 8 })
  amount: string;

  @Column({ length: 3 })
  currency: string;

  @Column({
    type: 'enum',
    enum: ['pending', 'processing', 'success', 'failed', 'cancelled', 'refunded', 'partially_refunded'],
    default: 'pending',
  })
  status: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  reference: string; // Our internal reference

  @Column({ type: 'varchar', length: 255, nullable: true })
  providerReference: string; // Provider's transaction reference

  @Column({ type: 'varchar', length: 100 })
  paymentMethod: string; // card, bank_transfer, mobile_money, ussd, qr, etc.

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentChannel: string; // visa, mastercard, mpesa, gcash, etc.

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'jsonb', nullable: true })
  customer: {
    email?: string;
    name?: string;
    phone?: string;
    customerId?: string;
  };

  @Column({ type: 'jsonb', nullable: true })
  paymentDetails: {
    cardLast4?: string;
    cardBrand?: string;
    cardExpiry?: string;
    cardBank?: string;
    accountNumber?: string;
    accountName?: string;
    bankName?: string;
    mobileNumber?: string;
    walletProvider?: string;
  };

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  fee: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  netAmount: string; // Amount after fees

  @Column({ type: 'varchar', length: 255, nullable: true })
  callbackUrl: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  redirectUrl: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  authorizationUrl: string; // URL for customer to complete payment

  @Column({ type: 'varchar', length: 500, nullable: true })
  accessCode: string; // Provider access code

  @Column({ type: 'uuid', nullable: true })
  splitPaymentId: string; // Related split payment

  @Column({ type: 'uuid', nullable: true })
  walletTransactionId: string; // Related wallet transaction

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'jsonb', nullable: true })
  providerResponse: Record<string, any>;

  @Column({ type: 'timestamp', nullable: true })
  paidAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  failedAt: Date;

  @Column({ type: 'text', nullable: true })
  failureReason: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  errorCode: string;

  @Column({ type: 'timestamp', nullable: true })
  refundedAt: Date;

  @Column({ type: 'decimal', precision: 20, scale: 8, nullable: true })
  refundedAmount: string;

  @Column({ type: 'integer', nullable: true })
  processingTimeMs: number;

  @Column({ type: 'varchar', length: 100, nullable: true })
  ipAddress: string;

  @Column({ type: 'text', nullable: true })
  userAgent: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
