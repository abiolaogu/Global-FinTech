import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { InvestmentCompanyEntity } from './investment-company.entity';
import { InvestmentTransactionEntity } from './investment-transaction.entity';

export enum InvestmentCategory {
  STOCKS = 'stocks',
  BONDS = 'bonds',
  MUTUAL_FUNDS = 'mutual_funds',
  ETF = 'etf',
  REAL_ESTATE = 'real_estate',
  COMMODITIES = 'commodities',
  CRYPTOCURRENCY = 'cryptocurrency',
  PRIVATE_EQUITY = 'private_equity',
  VENTURE_CAPITAL = 'venture_capital',
  HEDGE_FUNDS = 'hedge_funds',
  STRUCTURED_PRODUCTS = 'structured_products',
  ALTERNATIVE_INVESTMENTS = 'alternative_investments',
}

export enum RiskLevel {
  VERY_LOW = 'very_low',
  LOW = 'low',
  MODERATE = 'moderate',
  HIGH = 'high',
  VERY_HIGH = 'very_high',
}

export enum OpportunityStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  ACTIVE = 'active',
  PAUSED = 'paused',
  CLOSED = 'closed',
  CANCELLED = 'cancelled',
}

@Entity('investment_opportunities')
export class InvestmentOpportunityEntity {
  @PrimaryGeneratedColumn('uuid')
  opportunityId: string;

  @Column({ type: 'uuid' })
  companyId: string;

  @ManyToOne(() => InvestmentCompanyEntity, (company) => company.opportunities)
  @JoinColumn({ name: 'companyId' })
  company: InvestmentCompanyEntity;

  @Column({ type: 'varchar', length: 200 })
  title: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  slug: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 50 })
  category: InvestmentCategory;

  @Column({ type: 'varchar', length: 50 })
  riskLevel: RiskLevel;

  @Column({ type: 'varchar', length: 50, default: OpportunityStatus.DRAFT })
  status: OpportunityStatus;

  // Financial details
  @Column({ type: 'decimal', precision: 24, scale: 2 })
  minimumInvestment: string;

  @Column({ type: 'decimal', precision: 24, scale: 2, nullable: true })
  maximumInvestment: string;

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  @Column({ type: 'decimal', precision: 24, scale: 2, nullable: true })
  targetAmount: string;

  @Column({ type: 'decimal', precision: 24, scale: 2, default: '0' })
  raisedAmount: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  projectedReturn: string; // Annual return percentage

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  historicalReturn: string;

  @Column({ type: 'int', nullable: true })
  investmentTerm: number; // In months

  @Column({ type: 'varchar', length: 50, nullable: true })
  liquidityType: string; // daily, weekly, monthly, locked, etc.

  // Fees
  @Column({ type: 'decimal', precision: 5, scale: 2, default: '0' })
  managementFee: string; // Annual percentage

  @Column({ type: 'decimal', precision: 5, scale: 2, default: '0' })
  performanceFee: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: '0' })
  entryFee: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: '0' })
  exitFee: string;

  // Dates
  @Column({ type: 'timestamp', nullable: true })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  endDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  maturityDate: Date;

  // Investment details
  @Column({ type: 'varchar', length: 100, nullable: true })
  assetClass: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  sector: string;

  @Column({ type: 'simple-array', nullable: true })
  tags: string[];

  @Column({ type: 'simple-array', nullable: true })
  geographies: string[];

  // Documents
  @Column({ type: 'simple-array', nullable: true })
  prospectusUrls: string[];

  @Column({ type: 'simple-array', nullable: true })
  factSheetUrls: string[];

  @Column({ type: 'simple-array', nullable: true })
  legalDocuments: string[];

  @Column({ type: 'varchar', length: 500, nullable: true })
  thumbnailUrl: string;

  @Column({ type: 'simple-array', nullable: true })
  imageUrls: string[];

  // Regulatory
  @Column({ type: 'varchar', length: 100, nullable: true })
  regulatoryFramework: string; // Reg D, Reg A+, Reg CF, etc.

  @Column({ type: 'boolean', default: false })
  accreditedInvestorsOnly: boolean;

  @Column({ type: 'simple-array', nullable: true })
  complianceCertifications: string[];

  // Performance metrics
  @Column({ type: 'int', default: 0 })
  totalInvestors: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: '0' })
  averageRating: string;

  @Column({ type: 'int', default: 0 })
  totalReviews: number;

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  bookmarkCount: number;

  // Additional features
  @Column({ type: 'boolean', default: false })
  autoInvestEnabled: boolean;

  @Column({ type: 'boolean', default: false })
  dividendReinvestment: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  dividendFrequency: string; // monthly, quarterly, annually

  @Column({ type: 'text', nullable: true })
  keyHighlights: string;

  @Column({ type: 'json', nullable: true })
  performanceHistory: any; // Historical performance data

  @Column({ type: 'json', nullable: true })
  allocationBreakdown: any; // Asset allocation percentages

  // Approval tracking
  @Column({ type: 'uuid', nullable: true })
  submittedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  submittedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  reviewedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  reviewedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  approvedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  approvedAt: Date;

  @Column({ type: 'uuid', nullable: true })
  launchedBy: string;

  @Column({ type: 'timestamp', nullable: true })
  launchedAt: Date;

  @Column({ type: 'text', nullable: true })
  rejectionReason: string;

  @Column({ type: 'text', nullable: true })
  reviewNotes: string;

  @OneToMany(
    () => InvestmentTransactionEntity,
    (transaction) => transaction.opportunity,
  )
  transactions: InvestmentTransactionEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
