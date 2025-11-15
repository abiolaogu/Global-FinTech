import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('fraud_checks')
@Index(['userId', 'createdAt'])
@Index(['riskLevel'])
@Index(['shouldBlock'])
export class FraudCheckEntity {
  @PrimaryGeneratedColumn('uuid')
  checkId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 50 })
  transactionType: string;

  @Column({ type: 'decimal', precision: 24, scale: 8 })
  amount: string;

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  @Column({ type: 'int' })
  riskScore: number;

  @Column({ type: 'varchar', length: 20 })
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @Column({ type: 'boolean', default: false })
  shouldBlock: boolean;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    checks?: any;
    reasons?: string[];
    ipAddress?: string;
    deviceId?: string;
    location?: { lat: number; lon: number };
  };

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
