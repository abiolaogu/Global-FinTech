import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('webhook_endpoints')
@Index(['partnerId'])
export class WebhookEndpointEntity {
  @PrimaryGeneratedColumn('uuid')
  endpointId: string;

  @Column({ type: 'uuid' })
  partnerId: string;

  @Column({ type: 'text' })
  url: string;

  @Column({ type: 'jsonb' })
  events: string[]; // ['transaction.created', 'payment.completed', etc.] or ['*']

  @Column({ type: 'varchar', length: 255 })
  secret: string; // For HMAC signature verification

  @Column({ type: 'text', nullable: true })
  description: string | null;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'int', default: 0 })
  successCount: number;

  @Column({ type: 'int', default: 0 })
  failureCount: number;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastSuccessAt: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastFailureAt: Date | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
