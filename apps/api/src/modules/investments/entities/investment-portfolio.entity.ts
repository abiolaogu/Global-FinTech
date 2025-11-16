import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('investment_portfolios')
@Index(['userId', 'opportunityId'], { unique: true })
export class InvestmentPortfolioEntity {
  @PrimaryGeneratedColumn('uuid')
  portfolioId: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'uuid' })
  @Index()
  opportunityId: string;

  // Holdings
  @Column({ type: 'decimal', precision: 24, scale: 8 })
  shares: string; // Number of units/shares held

  @Column({ type: 'decimal', precision: 24, scale: 2 })
  totalInvested: string; // Total amount invested

  @Column({ type: 'decimal', precision: 24, scale: 2 })
  currentValue: string; // Current market value

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  @Column({ type: 'decimal', precision: 24, scale: 2 })
  averageBuyPrice: string;

  // Performance
  @Column({ type: 'decimal', precision: 24, scale: 2, default: '0' })
  unrealizedGainLoss: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: '0' })
  unrealizedGainLossPercent: string;

  @Column({ type: 'decimal', precision: 24, scale: 2, default: '0' })
  realizedGainLoss: string;

  @Column({ type: 'decimal', precision: 24, scale: 2, default: '0' })
  totalDividends: string;

  @Column({ type: 'decimal', precision: 24, scale: 2, default: '0' })
  totalFeesPaid: string;

  // Statistics
  @Column({ type: 'timestamp' })
  firstInvestmentDate: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastInvestmentDate: Date;

  @Column({ type: 'int', default: 0 })
  totalTransactions: number;

  @Column({ type: 'int', default: 0 })
  buyTransactions: number;

  @Column({ type: 'int', default: 0 })
  sellTransactions: number;

  // Risk and allocation
  @Column({ type: 'decimal', precision: 5, scale: 2, default: '0' })
  portfolioAllocationPercent: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  riskCategory: string;

  // Auto-invest settings
  @Column({ type: 'boolean', default: false })
  autoInvestEnabled: boolean;

  @Column({ type: 'decimal', precision: 24, scale: 2, nullable: true })
  autoInvestAmount: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  autoInvestFrequency: string; // weekly, monthly, etc.

  @Column({ type: 'timestamp', nullable: true })
  nextAutoInvestDate: Date;

  // Dividend settings
  @Column({ type: 'boolean', default: false })
  dividendReinvestment: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastDividendDate: Date;

  @Column({ type: 'decimal', precision: 24, scale: 2, nullable: true })
  lastDividendAmount: string;

  // Status
  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
