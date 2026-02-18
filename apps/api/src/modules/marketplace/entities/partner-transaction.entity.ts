import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { MarketplacePartnerEntity } from './partner.entity';
import { MarketplaceProductEntity } from './product.entity';

export enum TransactionStatus {
  PENDING = 'pending', // Transaction initiated
  PROCESSING = 'processing', // Being processed by partner
  COMPLETED = 'completed', // Successfully completed
  FAILED = 'failed', // Failed
  CANCELLED = 'cancelled', // Cancelled by user
  REFUNDED = 'refunded', // Refunded
  DISPUTED = 'disputed', // Under dispute
}

export enum FulfillmentStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  SHIPPED = 'shipped',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('partner_transactions')
@Index(['user_id', 'status'])
@Index(['partner_id', 'status'])
@Index(['created_at'])
@Index(['reference'])
export class PartnerTransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  transaction_id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  reference: string; // MPT-XXXXXX

  @Column({ type: 'uuid' })
  @Index()
  user_id: string;

  @Column({ type: 'uuid' })
  @Index()
  partner_id: string;

  @Column({ type: 'uuid', nullable: true })
  @Index()
  product_id: string;

  // Transaction details
  @Column({ type: 'varchar', length: 255 })
  product_name: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  unit_price: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  subtotal: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  discount_amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  tax_amount: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  shipping_cost: number;

  @Column({ type: 'decimal', precision: 12, scale: 2 })
  total_amount: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  // Commission
  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  commission_amount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  commission_percentage: number;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  partner_payout: number; // Amount to be paid to partner

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  platform_revenue: number; // Our commission/fee

  // Payment
  @Column({ type: 'uuid', nullable: true })
  payment_transaction_id: string; // Link to our payment system

  @Column({ type: 'varchar', length: 50 })
  payment_method: string; // 'wallet', 'card', 'bank_transfer'

  @Column({ type: 'varchar', length: 50 })
  payment_status: string; // 'pending', 'completed', 'failed'

  // Status
  @Column({
    type: 'enum',
    enum: TransactionStatus,
    default: TransactionStatus.PENDING,
  })
  status: TransactionStatus;

  @Column({
    type: 'enum',
    enum: FulfillmentStatus,
    default: FulfillmentStatus.PENDING,
  })
  fulfillment_status: FulfillmentStatus;

  // Partner integration
  @Column({ type: 'varchar', length: 255, nullable: true })
  external_transaction_id: string; // Partner's transaction ID

  @Column({ type: 'text', nullable: true })
  external_reference: string; // Partner's reference

  @Column({ type: 'jsonb', nullable: true })
  api_request: Record<string, any>; // Request sent to partner

  @Column({ type: 'jsonb', nullable: true })
  api_response: Record<string, any>; // Response from partner

  // Customer details (stored for record keeping)
  @Column({ type: 'varchar', length: 255, nullable: true })
  customer_email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  customer_phone: string;

  @Column({ type: 'jsonb', nullable: true })
  customer_details: Record<string, any>; // Name, address, etc.

  // Delivery/Fulfillment (for physical products)
  @Column({ type: 'jsonb', nullable: true })
  shipping_address: {
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
  };

  @Column({ type: 'varchar', length: 255, nullable: true })
  tracking_number: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  courier_name: string;

  @Column({ type: 'timestamp', nullable: true })
  shipped_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  delivered_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  estimated_delivery_date: Date;

  // Additional data
  @Column({ type: 'jsonb', nullable: true })
  product_data: Record<string, any>; // Product details at time of purchase

  @Column({ type: 'text', nullable: true })
  customer_notes: string;

  @Column({ type: 'text', nullable: true })
  internal_notes: string;

  // Refund
  @Column({ type: 'boolean', default: false })
  is_refunded: boolean;

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  refund_amount: number;

  @Column({ type: 'text', nullable: true })
  refund_reason: string;

  @Column({ type: 'timestamp', nullable: true })
  refunded_at: Date;

  // Review
  @Column({ type: 'boolean', default: false })
  is_reviewed: boolean;

  @Column({ type: 'int', nullable: true })
  rating: number; // 1-5 stars

  @Column({ type: 'text', nullable: true })
  review_comment: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewed_at: Date;

  // Settlement
  @Column({ type: 'boolean', default: false })
  is_settled: boolean;

  @Column({ type: 'uuid', nullable: true })
  settlement_batch_id: string;

  @Column({ type: 'timestamp', nullable: true })
  settled_at: Date;

  // Error handling
  @Column({ type: 'int', default: 0 })
  retry_count: number;

  @Column({ type: 'text', nullable: true })
  error_message: string;

  @Column({ type: 'jsonb', nullable: true })
  error_details: Record<string, any>;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'varchar', length: 50, nullable: true })
  source: string; // 'mobile_app', 'web', 'api'

  @Column({ type: 'varchar', length: 100, nullable: true })
  user_agent: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ip_address: string;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  failed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelled_at: Date;

  // Relations
  @ManyToOne(() => MarketplacePartnerEntity, (partner) => partner.transactions)
  @JoinColumn({ name: 'partner_id' })
  partner: MarketplacePartnerEntity;

  @ManyToOne(() => MarketplaceProductEntity, (product) => product.transactions, {
    nullable: true,
  })
  @JoinColumn({ name: 'product_id' })
  product: MarketplaceProductEntity;
}
