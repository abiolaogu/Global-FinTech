import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  Index,
  BeforeInsert,
} from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Entity('sms_sync_log')
@Index(['userId'])
@Index(['phoneNumber'])
@Index(['status'])
@Index(['createdAt'])
export class SmsSyncLogEntity {
  @PrimaryColumn('uuid')
  logId: string;

  @Column('uuid')
  @Index()
  userId: string;

  @Column({ length: 20 })
  @Index()
  phoneNumber: string;

  @Column({
    type: 'enum',
    enum: ['inbound', 'outbound'],
  })
  direction: string;

  @Column({ length: 50, nullable: true })
  command: string; // SYNC_WALLET, TXN, STATUS, TOPUP, CREDIT

  @Column({ type: 'text' })
  messageBody: string; // Raw SMS message

  @Column({ type: 'text', nullable: true })
  encryptedPayload: string; // Encrypted data payload

  @Column({ type: 'text', nullable: true })
  response: string; // Response sent back

  @Column({
    type: 'enum',
    enum: ['sent', 'delivered', 'failed', 'processed', 'pending'],
    default: 'pending',
  })
  status: string;

  @Column({ length: 50, nullable: true })
  smsGateway: string; // twilio, africastalking, termii, etc.

  @Column({ type: 'decimal', precision: 10, scale: 4, nullable: true })
  cost: string; // Cost in USD

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    gatewayMessageId?: string;
    segments?: number;
    encoding?: string;
    checksum?: string;
    ipAddress?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  processedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  deliveredAt: Date;

  @BeforeInsert()
  generateId() {
    if (!this.logId) {
      this.logId = uuidv4();
    }
  }
}
