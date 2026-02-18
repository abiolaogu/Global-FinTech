import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('credit_lines')
@Index(['userId'], { unique: true })
@Index(['walletId'])
@Index(['status'])
export class CreditLineEntity {
  @PrimaryColumn('uuid')
  creditLineId: string;

  @Column('uuid', { unique: true })
  @Index()
  userId: string;

  @Column('uuid', { nullable: true })
  @Index()
  walletId: string;

  @Column('decimal', { precision: 20, scale: 8, default: 0 })
  creditLimit: string;

  @Column('decimal', { precision: 20, scale: 8, default: 0 })
  creditUsed: string;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  interestRate: number; // Annual percentage rate

  @Column({ type: 'integer', default: 30 })
  gracePeriodDays: number; // Days before interest accrues

  @Column({
    type: 'enum',
    enum: ['active', 'suspended', 'closed', 'defaulted'],
    default: 'active',
  })
  status: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  totalRepaid: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  interestAccrued: string;

  @Column({ type: 'decimal', precision: 20, scale: 8, default: 0 })
  minimumPaymentDue: string;

  @Column({ type: 'timestamp', nullable: true })
  nextPaymentDue: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  lastRepaymentAt: Date;

  @Column({ type: 'integer', default: 0 })
  missedPayments: number;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    creditScore?: number;
    assessmentDate?: string;
    approvedBy?: string;
    approvalNotes?: string;
    riskCategory?: 'low' | 'medium' | 'high';
  };

  @Column({ type: 'text', nullable: true })
  suspensionReason: string;

  @Column({ type: 'timestamp', nullable: true })
  suspendedAt: Date;

  @CreateDateColumn()
  allocatedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @BeforeInsert()
  generateId() {
    if (!this.creditLineId) {
      this.creditLineId = uuidv4();
    }
  }

  // Computed property for credit available
  get creditAvailable(): string {
    const limit = parseFloat(this.creditLimit) || 0;
    const used = parseFloat(this.creditUsed) || 0;
    return (limit - used).toFixed(8);
  }

  // Computed property for credit utilization percentage
  get utilizationRate(): number {
    const limit = parseFloat(this.creditLimit) || 0;
    const used = parseFloat(this.creditUsed) || 0;
    if (limit === 0) return 0;
    return parseFloat(((used / limit) * 100).toFixed(2));
  }

  // Check if credit line can be used
  get isUsable(): boolean {
    return this.status === 'active' && parseFloat(this.creditAvailable) > 0;
  }
}
