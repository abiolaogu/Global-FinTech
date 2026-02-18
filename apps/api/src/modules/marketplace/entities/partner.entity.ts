import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { MarketplaceProductEntity } from './product.entity';
import { PartnerTransactionEntity } from './partner-transaction.entity';

export enum PartnerCategory {
  FINANCIAL_SERVICES = 'financial_services', // Insurance, Loans, Credit Cards
  ECOMMERCE = 'ecommerce', // Retail, Shopping, Vouchers
  TRAVEL = 'travel', // Flights, Hotels, Visa Services
  UTILITIES = 'utilities', // Bills, Airtime, Data
  BUSINESS_SERVICES = 'business_services', // Accounting, Payroll, Invoicing
  HEALTH = 'health', // Health Insurance, Telemedicine
  EDUCATION = 'education', // Courses, Tuition Payments
  LIFESTYLE = 'lifestyle', // Entertainment, Events, Subscriptions
  CRYPTO = 'crypto', // Crypto Exchange, Wallet Services
  REMITTANCE = 'remittance', // International Money Transfer
}

export enum IntegrationType {
  API = 'api', // Deep API integration
  REDIRECT = 'redirect', // OAuth/Redirect to partner
  AFFILIATE = 'affiliate', // Commission-based affiliate
  WHITE_LABEL = 'white_label', // Partner service under our brand
  EMBEDDED = 'embedded', // Embedded widget/iframe
}

export enum PartnerStatus {
  PENDING = 'pending', // Awaiting approval
  ACTIVE = 'active', // Live and accepting transactions
  PAUSED = 'paused', // Temporarily paused
  SUSPENDED = 'suspended', // Suspended due to violations
  INACTIVE = 'inactive', // No longer active
}

@Entity('marketplace_partners')
@Index(['status', 'category'])
@Index(['countries'])
export class MarketplacePartnerEntity {
  @PrimaryGeneratedColumn('uuid')
  partner_id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  slug: string; // URL-friendly identifier

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo_url: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  banner_url: string;

  @Column({
    type: 'enum',
    enum: PartnerCategory,
  })
  category: PartnerCategory;

  @Column({ type: 'simple-array', nullable: true })
  sub_categories: string[]; // e.g., ['health_insurance', 'life_insurance']

  @Column({
    type: 'enum',
    enum: IntegrationType,
  })
  integration_type: IntegrationType;

  @Column({
    type: 'enum',
    enum: PartnerStatus,
    default: PartnerStatus.PENDING,
  })
  status: PartnerStatus;

  // Geographic availability
  @Column({ type: 'simple-array' })
  countries: string[]; // ISO country codes: ['NG', 'KE', 'GH']

  // Partner contact and legal info
  @Column({ type: 'varchar', length: 255 })
  contact_email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  contact_phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website_url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  legal_entity_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  registration_number: string;

  // API Integration details
  @Column({ type: 'varchar', length: 500, nullable: true })
  api_base_url: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  api_key: string; // Encrypted

  @Column({ type: 'varchar', length: 500, nullable: true })
  api_secret: string; // Encrypted

  @Column({ type: 'varchar', length: 255, nullable: true })
  webhook_url: string; // Our webhook URL for partner callbacks

  @Column({ type: 'text', nullable: true })
  redirect_url: string; // For redirect integrations

  @Column({ type: 'text', nullable: true })
  callback_url: string; // Post-transaction callback

  // Revenue sharing
  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  commission_percentage: number; // e.g., 10.00 for 10%

  @Column({ type: 'decimal', precision: 12, scale: 2, default: 0 })
  fixed_commission: number; // Fixed fee per transaction

  @Column({ type: 'varchar', length: 50, default: 'revenue_share' })
  commission_model: string; // 'revenue_share', 'fixed_fee', 'hybrid'

  // Settlements
  @Column({ type: 'varchar', length: 50, default: 'monthly' })
  settlement_frequency: string; // 'daily', 'weekly', 'monthly'

  @Column({ type: 'int', default: 7 })
  settlement_delay_days: number; // Days to hold funds before settlement

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  pending_settlement_amount: number;

  @Column({ type: 'timestamp', nullable: true })
  last_settlement_date: Date;

  // Performance metrics
  @Column({ type: 'int', default: 0 })
  total_transactions: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  total_volume: number;

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  total_commission_earned: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  average_rating: number; // 0-5 stars

  @Column({ type: 'int', default: 0 })
  total_reviews: number;

  // Featured and promotions
  @Column({ type: 'boolean', default: false })
  is_featured: boolean;

  @Column({ type: 'boolean', default: true })
  is_promoted: boolean;

  @Column({ type: 'int', default: 0 })
  display_order: number; // For sorting in listings

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[]; // ['popular', 'new', 'trending']

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  activated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  suspended_at: Date;

  // Relations
  @OneToMany(() => MarketplaceProductEntity, (product) => product.partner)
  products: MarketplaceProductEntity[];

  @OneToMany(
    () => PartnerTransactionEntity,
    (transaction) => transaction.partner,
  )
  transactions: PartnerTransactionEntity[];
}
