import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('payment_gateways')
@Index(['userId', 'provider'])
@Index(['isActive'])
export class PaymentGatewayEntity {
  @PrimaryColumn('uuid')
  gatewayId: string;

  @Column('uuid', { nullable: true })
  @Index()
  userId: string; // Null for platform-level gateways

  @Column({
    type: 'varchar',
    length: 100,
  })
  provider: string; // paystack, flutterwave, stripe, razorpay, payu, mercadopago, etc.

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text' })
  credentialsEncrypted: string; // Encrypted API keys and secrets

  @Column({ type: 'boolean', default: true })
  isLive: boolean; // Live vs Test mode

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'jsonb', nullable: true })
  supportedCurrencies: string[];

  @Column({ type: 'jsonb', nullable: true })
  supportedCountries: string[];

  @Column({ type: 'jsonb', nullable: true })
  supportedPaymentMethods: string[]; // card, bank_transfer, mobile_money, ussd, etc.

  @Column({ type: 'jsonb', nullable: true })
  configuration: {
    webhookUrl?: string;
    callbackUrl?: string;
    logoUrl?: string;
    brandColor?: string;
    businessName?: string;
    supportEmail?: string;
    customFields?: Record<string, any>;
  };

  @Column({ type: 'jsonb', nullable: true })
  feeConfiguration: {
    type: 'platform' | 'custom';
    cardFee?: { percentage?: number; fixed?: string; cap?: string };
    bankTransferFee?: { percentage?: number; fixed?: string };
    mobileMoney?: { percentage?: number; fixed?: string };
    ussd?: { percentage?: number; fixed?: string };
    currency?: string;
  };

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  totalProcessed: string;

  @Column({ type: 'integer', default: 0 })
  transactionCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastTransactionAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastHealthCheck: Date;

  @Column({ type: 'varchar', length: 50, default: 'healthy' })
  healthStatus: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
