import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ChatSessionEntity } from './chat-session.entity';

export enum MessageRole {
  USER = 'user',
  ASSISTANT = 'assistant',
  SYSTEM = 'system',
}

export enum MessageStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

@Entity('chat_messages')
export class ChatMessageEntity {
  @PrimaryGeneratedColumn('uuid')
  messageId: string;

  @Column({ type: 'uuid' })
  @Index()
  sessionId: string;

  @ManyToOne(() => ChatSessionEntity, (session) => session.messages)
  @JoinColumn({ name: 'sessionId' })
  session: ChatSessionEntity;

  @Column({ type: 'uuid' })
  @Index()
  userId: string;

  @Column({ type: 'varchar', length: 50 })
  role: MessageRole;

  @Column({ type: 'text' })
  content: string;

  @Column({ type: 'varchar', length: 50, default: MessageStatus.COMPLETED })
  status: MessageStatus;

  // Intent recognition
  @Column({ type: 'varchar', length: 100, nullable: true })
  detectedIntent: string;

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  intentConfidence: string;

  @Column({ type: 'json', nullable: true })
  entities: any; // Extracted entities (amounts, dates, account numbers, etc.)

  @Column({ type: 'json', nullable: true })
  alternatives: any; // Alternative intents if confidence is low

  // Action execution
  @Column({ type: 'varchar', length: 100, nullable: true })
  actionType: string; // send_money, check_balance, invest, etc.

  @Column({ type: 'json', nullable: true })
  actionParams: any; // Parameters for the action

  @Column({ type: 'varchar', length: 50, nullable: true })
  actionStatus: string;

  @Column({ type: 'uuid', nullable: true })
  actionResultId: string; // Reference to the result (transaction ID, etc.)

  @Column({ type: 'text', nullable: true })
  actionError: string;

  // Context
  @Column({ type: 'json', nullable: true })
  context: any; // Conversation context at this point

  @Column({ type: 'simple-array', nullable: true })
  references: string[]; // References to previous messages

  // Sentiment analysis
  @Column({ type: 'varchar', length: 50, nullable: true })
  sentiment: string; // positive, negative, neutral

  @Column({ type: 'decimal', precision: 5, scale: 4, nullable: true })
  sentimentScore: string;

  // Response metadata
  @Column({ type: 'int', nullable: true })
  responseTime: number; // Response time in milliseconds

  @Column({ type: 'varchar', length: 100, nullable: true })
  modelVersion: string;

  @Column({ type: 'int', nullable: true })
  tokensUsed: number;

  // User feedback
  @Column({ type: 'boolean', nullable: true })
  isHelpful: boolean;

  @Column({ type: 'varchar', length: 50, nullable: true })
  feedbackType: string; // thumbs_up, thumbs_down, flag

  @Column({ type: 'text', nullable: true })
  feedbackComment: string;

  // Metadata
  @Column({ type: 'json', nullable: true })
  metadata: any;

  @Column({ type: 'boolean', default: false })
  isEdited: boolean;

  @Column({ type: 'boolean', default: false })
  isDeleted: boolean;

  @CreateDateColumn()
  @Index()
  createdAt: Date;
}
