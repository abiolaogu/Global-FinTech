import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { MarketplacePartnerEntity } from './partner.entity';
import { PartnerTransactionEntity } from './partner-transaction.entity';

export enum ProductType {
  PHYSICAL = 'physical', // Physical goods
  DIGITAL = 'digital', // Digital products (vouchers, gift cards)
  SERVICE = 'service', // Services (insurance, loans)
  SUBSCRIPTION = 'subscription', // Recurring subscriptions
  UTILITY = 'utility', // Bill payments, airtime
  BOOKING = 'booking', // Hotel, flight bookings
}

export enum PricingModel {
  FIXED = 'fixed', // Fixed price
  VARIABLE = 'variable', // User enters amount (e.g., airtime)
  TIERED = 'tiered', // Different tiers/plans
  PERCENTAGE = 'percentage', // Percentage-based (e.g., insurance premium)
  FREE = 'free', // Free product/service
}

export enum ProductStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  OUT_OF_STOCK = 'out_of_stock',
  DISCONTINUED = 'discontinued',
  SUSPENDED = 'suspended',
}

@Entity('marketplace_products')
@Index(['partner_id', 'status'])
@Index(['status', 'is_featured'])
export class MarketplaceProductEntity {
  @PrimaryGeneratedColumn('uuid')
  product_id: string;

  @Column({ type: 'uuid' })
  @Index()
  partner_id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  @Index()
  slug: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text', nullable: true })
  long_description: string;

  @Column({
    type: 'enum',
    enum: ProductType,
  })
  product_type: ProductType;

  // Pricing
  @Column({
    type: 'enum',
    enum: PricingModel,
    default: PricingModel.FIXED,
  })
  pricing_model: PricingModel;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  price: number;

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  min_amount: number; // For variable pricing

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  max_amount: number; // For variable pricing

  @Column({ type: 'decimal', precision: 12, scale: 2, nullable: true })
  discount_price: number; // Sale price

  @Column({ type: 'timestamp', nullable: true })
  discount_ends_at: Date;

  // Tiered pricing (for subscriptions, insurance plans, etc.)
  @Column({ type: 'jsonb', nullable: true })
  pricing_tiers: Array<{
    tier_name: string;
    price: number;
    features: string[];
    billing_period?: string; // 'monthly', 'annual'
  }>;

  // Media
  @Column({ type: 'varchar', length: 500, nullable: true })
  image_url: string;

  @Column({ type: 'simple-array', nullable: true })
  gallery_urls: string[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  video_url: string;

  // Availability
  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.ACTIVE,
  })
  status: ProductStatus;

  @Column({ type: 'simple-array' })
  countries: string[]; // ISO country codes

  @Column({ type: 'int', nullable: true })
  stock_quantity: number; // For physical products

  @Column({ type: 'int', default: 0 })
  sold_count: number;

  // Features and specifications
  @Column({ type: 'jsonb', nullable: true })
  features: string[];

  @Column({ type: 'jsonb', nullable: true })
  specifications: Record<string, any>;

  @Column({ type: 'text', nullable: true })
  terms_and_conditions: string;

  // Categories and tags
  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  subcategory: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  // SEO
  @Column({ type: 'varchar', length: 255, nullable: true })
  meta_title: string;

  @Column({ type: 'text', nullable: true })
  meta_description: string;

  @Column({ type: 'simple-array', nullable: true })
  meta_keywords: string[];

  // Integration details
  @Column({ type: 'varchar', length: 255, nullable: true })
  external_product_id: string; // Partner's product ID

  @Column({ type: 'varchar', length: 255, nullable: true })
  api_endpoint: string; // Specific endpoint for this product

  @Column({ type: 'jsonb', nullable: true })
  api_params: Record<string, any>; // Default API parameters

  // Performance metrics
  @Column({ type: 'int', default: 0 })
  view_count: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  average_rating: number;

  @Column({ type: 'int', default: 0 })
  total_reviews: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  total_revenue: number;

  // Display settings
  @Column({ type: 'boolean', default: false })
  is_featured: boolean;

  @Column({ type: 'boolean', default: true })
  is_visible: boolean;

  @Column({ type: 'int', default: 0 })
  display_order: number;

  @Column({ type: 'simple-array', nullable: true })
  badges: string[]; // ['bestseller', 'new', 'trending', 'hot_deal']

  // Delivery/Fulfillment (for physical products)
  @Column({ type: 'int', nullable: true })
  estimated_delivery_days: number;

  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  shipping_cost: number;

  @Column({ type: 'boolean', default: false })
  requires_kyc: boolean; // If product requires KYC verification

  @Column({ type: 'int', default: 1 })
  min_purchase_quantity: number;

  @Column({ type: 'int', nullable: true })
  max_purchase_quantity: number;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  published_at: Date;

  // Relations
  @ManyToOne(() => MarketplacePartnerEntity, (partner) => partner.products)
  @JoinColumn({ name: 'partner_id' })
  partner: MarketplacePartnerEntity;

  @OneToMany(
    () => PartnerTransactionEntity,
    (transaction) => transaction.product,
  )
  transactions: PartnerTransactionEntity[];
}
