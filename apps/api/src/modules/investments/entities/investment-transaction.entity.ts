import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { InvestmentOpportunityEntity } from './investment-opportunity.entity';

export enum TransactionType {
  BUY = 'buy',
  SELL = 'sell',
  DIVIDEND = 'dividend',
  FEE = 'fee',
  TRANSFER_IN = 'transfer_in',
  TRANSFER_OUT = 'transfer_out',
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
}

@Entity('investment_transactions')
export class InvestmentTransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  transactionId: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'uuid' })
  @Index()
  opportunityId: string;

  @ManyToOne(() => InvestmentOpportunityEntity, (opportunity) => opportunity.transactions)
  @JoinColumn({ name: 'opportunityId' })
  opportunity: InvestmentOpportunityEntity;

  @Column({ type: 'uuid', nullable: true })
  portfolioId: string;

  @Column({ type: 'varchar', length: 50 })
  type: TransactionType;

  @Column({ type: 'varchar', length: 50, default: TransactionStatus.PENDING })
  status: TransactionStatus;

  // Transaction details
  @Column({ type: 'decimal', precision: 24, scale: 8 })
  shares: string; // Number of units/shares

  @Column({ type: 'decimal', precision: 24, scale: 2 })
  pricePerShare: string;

  @Column({ type: 'decimal', precision: 24, scale: 2 })
  amount: string; // Total transaction amount

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  // Fees
  @Column({ type: 'decimal', precision: 24, scale: 2, default: '0' })
  entryFee: string;

  @Column({ type: 'decimal', precision: 24, scale: 2, default: '0' })
  exitFee: string;

  @Column({ type: 'decimal', precision: 24, scale: 2, default: '0' })
  managementFee: string;

  @Column({ type: 'decimal', precision: 24, scale: 2, default: '0' })
  performanceFee: string;

  @Column({ type: 'decimal', precision: 24, scale: 2, default: '0' })
  totalFees: string;

  @Column({ type: 'decimal', precision: 24, scale: 2 })
  netAmount: string; // Amount after fees

  // Payment details
  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentMethod: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  paymentReference: string;

  @Column({ type: 'uuid', nullable: true })
  walletTransactionId: string; // Reference to wallet transaction

  // Settlement
  @Column({ type: 'timestamp', nullable: true })
  settledAt: Date;

  @Column({ type: 'varchar', length: 100, nullable: true })
  settlementReference: string;

  // Tax information
  @Column({ type: 'decimal', precision: 24, scale: 2, nullable: true })
  taxWithheld: string;

  @Column({ type: 'varchar', length: 10, nullable: true })
  taxYear: string;

  @Column({ type: 'boolean', default: false })
  isTaxable: boolean;

  // For dividends
  @Column({ type: 'timestamp', nullable: true })
  dividendDate: Date;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  dividendRate: string;

  @Column({ type: 'boolean', default: false })
  dividendReinvested: boolean;

  // Metadata
  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'json', nullable: true })
  metadata: any;

  @Column({ type: 'text', nullable: true })
  failureReason: string;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  failedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  cancelledAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
