import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum SettlementStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
}

@Entity('partner_settlements')
@Index(['partner_id', 'status'])
@Index(['settlement_date'])
export class PartnerSettlementEntity {
  @PrimaryGeneratedColumn('uuid')
  settlement_id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  reference: string; // SETTLE-XXXXXX

  @Column({ type: 'uuid' })
  @Index()
  partner_id: string;

  @Column({ type: 'varchar', length: 255 })
  partner_name: string;

  // Settlement period
  @Column({ type: 'date' })
  period_start_date: Date;

  @Column({ type: 'date' })
  period_end_date: Date;

  @Column({ type: 'date' })
  settlement_date: Date; // Date settlement is due

  // Amounts
  @Column({ type: 'int' })
  transaction_count: number;

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  gross_transaction_amount: number; // Total transaction amount

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  platform_commission: number; // Our commission

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  partner_payout: number; // Amount to pay partner

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  adjustments: number; // Manual adjustments (+ or -)

  @Column({ type: 'decimal', precision: 18, scale: 2, default: 0 })
  refund_amount: number; // Refunds in period

  @Column({ type: 'decimal', precision: 18, scale: 2 })
  net_settlement_amount: number; // Final amount to settle

  @Column({ type: 'varchar', length: 3, default: 'USD' })
  currency: string;

  // Payment details
  @Column({ type: 'varchar', length: 50, nullable: true })
  payment_method: string; // 'bank_transfer', 'wallet'

  @Column({ type: 'varchar', length: 100, nullable: true })
  bank_account_number: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bank_name: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  bank_code: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  account_holder_name: string;

  @Column({ type: 'uuid', nullable: true })
  payment_transaction_id: string; // Link to payment record

  @Column({ type: 'varchar', length: 255, nullable: true })
  payment_reference: string;

  // Status
  @Column({
    type: 'enum',
    enum: SettlementStatus,
    default: SettlementStatus.PENDING,
  })
  status: SettlementStatus;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({ type: 'text', nullable: true })
  adjustment_reason: string;

  // Transaction IDs included in settlement
  @Column({ type: 'simple-array', nullable: true })
  transaction_ids: string[];

  // Processing
  @Column({ type: 'uuid', nullable: true })
  processed_by: string; // Admin user ID

  @Column({ type: 'timestamp', nullable: true })
  processed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  completed_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  failed_at: Date;

  @Column({ type: 'text', nullable: true })
  failure_reason: string;

  // Metadata
  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
