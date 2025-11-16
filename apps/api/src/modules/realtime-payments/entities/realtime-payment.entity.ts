import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('realtime_payments')
@Index(['senderUserId'])
@Index(['receiverUserId'])
@Index(['railType'])
@Index(['status'])
@Index(['externalTransactionId'])
@Index(['createdAt'])
export class RealtimePaymentEntity {
  @PrimaryGeneratedColumn('uuid')
  paymentId: string;

  @Column({ type: 'uuid' })
  senderUserId: string;

  @Column({ type: 'uuid' })
  receiverUserId: string;

  @Column({ type: 'varchar', length: 50 })
  railType: 'upi' | 'pix' | 'fednow' | 'sepa_instant' | 'faster_payments' | 'ach_realtime';

  @Column({ type: 'uuid' })
  connectionId: string; // Reference to payment_rail_connections

  @Column({ type: 'decimal', precision: 24, scale: 8 })
  amount: string;

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'varchar', length: 200, nullable: true })
  reference: string | null;

  // Rail-specific identifiers
  @Column({ type: 'varchar', length: 200, nullable: true })
  externalTransactionId: string | null; // ID from payment rail

  @Column({ type: 'varchar', length: 200, nullable: true })
  senderRailId: string | null; // UPI VPA, Pix key, bank account, etc.

  @Column({ type: 'varchar', length: 200, nullable: true })
  receiverRailId: string | null; // UPI VPA, Pix key, bank account, etc.

  @Column({ type: 'varchar', length: 20 })
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'reversed';

  @Column({ type: 'text', nullable: true })
  errorCode: string | null;

  @Column({ type: 'text', nullable: true })
  errorMessage: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 2, default: '0' })
  feeAmount: string; // Transaction fee

  @Column({ type: 'timestamp with time zone', nullable: true })
  initiatedAt: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  completedAt: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  failedAt: Date | null;

  @Column({ type: 'integer', nullable: true })
  processingTimeMs: number | null; // Time to complete in milliseconds

  @Column({ type: 'jsonb', nullable: true })
  metadata: any; // Additional rail-specific data

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
