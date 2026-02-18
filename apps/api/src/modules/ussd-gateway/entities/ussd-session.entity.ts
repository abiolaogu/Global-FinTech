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

@Entity('ussd_sessions')
@Index(['sessionToken'], { unique: true })
@Index(['phoneNumber'])
@Index(['status'])
@Index(['expiresAt'])
export class UssdSessionEntity {
  @PrimaryColumn('uuid')
  sessionId: string;

  @Column('uuid', { nullable: true })
  @Index()
  userId: string;

  @Column({ length: 20 })
  @Index()
  phoneNumber: string;

  @Column({ length: 255, unique: true })
  sessionToken: string;

  @Column({ length: 50, nullable: true })
  currentMenu: string; // main, balance, sync, topup, credit, history

  @Column({ type: 'jsonb', nullable: true })
  menuState: {
    navigationPath?: string[];
    inputBuffer?: string;
    selectedWallet?: string;
    pendingAmount?: string;
    pendingRecipient?: string;
    step?: string;
  };

  @Column({ type: 'boolean', default: false })
  authenticated: boolean;

  @Column({ type: 'integer', default: 0 })
  pinAttempts: number;

  @Column({
    type: 'enum',
    enum: ['active', 'completed', 'timeout', 'terminated', 'error'],
    default: 'active',
  })
  status: string;

  @Column({ length: 50, nullable: true })
  ussdGateway: string; // africastalking, hubtel, etc.

  @Column({ type: 'text', nullable: true })
  lastResponse: string;

  @Column({ type: 'text', nullable: true })
  lastUserInput: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: {
    gatewaySessionId?: string;
    serviceCode?: string;
    networkOperator?: string;
    deviceInfo?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  lastInteractionAt: Date;

  @Column({ type: 'timestamp' })
  expiresAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  completedAt: Date;

  @BeforeInsert()
  generateSessionData() {
    if (!this.sessionId) {
      this.sessionId = uuidv4();
    }
    if (!this.sessionToken) {
      this.sessionToken = `USSD-${Date.now()}-${uuidv4().substring(0, 8)}`;
    }
    if (!this.expiresAt) {
      // Default 30-second timeout
      this.expiresAt = new Date(Date.now() + 30000);
    }
  }

  // Check if session is still valid
  get isValid(): boolean {
    return (
      this.status === 'active' &&
      this.expiresAt &&
      new Date() < this.expiresAt
    );
  }

  // Check if user can still attempt PIN
  get canAttemptPin(): boolean {
    return this.pinAttempts < 3;
  }
}
