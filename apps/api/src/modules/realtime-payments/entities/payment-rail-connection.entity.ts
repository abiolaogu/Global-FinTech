import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('payment_rail_connections')
@Index(['partnerId'])
@Index(['railType'])
@Index(['status'])
export class PaymentRailConnectionEntity {
  @PrimaryGeneratedColumn('uuid')
  connectionId: string;

  @Column({ type: 'uuid', nullable: true })
  partnerId: string | null; // Partner who owns this connection

  @Column({ type: 'varchar', length: 50 })
  railType: 'upi' | 'pix' | 'fednow' | 'sepa_instant' | 'faster_payments' | 'ach_realtime';

  @Column({ type: 'varchar', length: 100 })
  railName: string; // Human-readable name

  @Column({ type: 'varchar', length: 10 })
  country: string; // ISO 3166-1 alpha-2

  @Column({ type: 'text', nullable: true })
  credentialsEncrypted: string | null; // Encrypted API credentials

  @Column({ type: 'varchar', length: 200, nullable: true })
  apiEndpoint: string | null;

  @Column({ type: 'jsonb', nullable: true })
  configuration: any; // Rail-specific configuration

  @Column({ type: 'varchar', length: 20 })
  status: 'active' | 'inactive' | 'pending' | 'error';

  @Column({ type: 'boolean', default: true })
  isLive: boolean; // true = production, false = sandbox

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastHealthCheck: Date | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  healthStatus: 'healthy' | 'degraded' | 'down' | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
