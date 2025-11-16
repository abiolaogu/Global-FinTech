import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { ChatMessageEntity } from './chat-message.entity';

export enum SessionStatus {
  ACTIVE = 'active',
  IDLE = 'idle',
  CLOSED = 'closed',
}

@Entity('chat_sessions')
export class ChatSessionEntity {
  @PrimaryGeneratedColumn('uuid')
  sessionId: string;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'varchar', length: 50, default: SessionStatus.ACTIVE })
  status: SessionStatus;

  @Column({ type: 'varchar', length: 100, nullable: true })
  title: string; // Auto-generated from first message

  @Column({ type: 'int', default: 0 })
  messageCount: number;

  @Column({ type: 'timestamp' })
  lastActivityAt: Date;

  // Context tracking
  @Column({ type: 'json', nullable: true })
  context: any; // Current conversation context (accounts, recent actions, etc.)

  @Column({ type: 'simple-array', nullable: true })
  activeTopics: string[]; // Topics being discussed

  @Column({ type: 'varchar', length: 100, nullable: true })
  lastIntent: string; // Last recognized intent

  @Column({ type: 'json', nullable: true })
  userPreferences: any; // User preferences learned during session

  // Session metadata
  @Column({ type: 'varchar', length: 50, nullable: true })
  deviceType: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  platform: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  ipAddress: string;

  // Session statistics
  @Column({ type: 'int', default: 0 })
  actionsExecuted: number;

  @Column({ type: 'int', default: 0 })
  successfulActions: number;

  @Column({ type: 'int', default: 0 })
  failedActions: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, nullable: true })
  satisfactionScore: string; // User satisfaction rating

  @OneToMany(() => ChatMessageEntity, (message) => message.session)
  messages: ChatMessageEntity[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  closedAt: Date;
}
