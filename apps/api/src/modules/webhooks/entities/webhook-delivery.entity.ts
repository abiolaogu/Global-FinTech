import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('webhook_deliveries')
@Index(['endpointId', 'createdAt'])
@Index(['status', 'nextRetryAt'])
export class WebhookDeliveryEntity {
  @PrimaryGeneratedColumn('uuid')
  deliveryId: string;

  @Column({ type: 'uuid' })
  endpointId: string;

  @Column({ type: 'varchar', length: 100 })
  eventType: string;

  @Column({ type: 'jsonb' })
  payload: any;

  @Column({ type: 'varchar', length: 20 })
  status: 'pending' | 'delivered' | 'failed';

  @Column({ type: 'int', default: 0 })
  attemptCount: number;

  @Column({ type: 'int', nullable: true })
  responseCode: number | null;

  @Column({ type: 'text', nullable: true })
  responseBody: string | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  nextRetryAt: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  deliveredAt: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  failedAt: Date | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
