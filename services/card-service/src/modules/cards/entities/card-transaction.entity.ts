import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('card_transactions')
@Index(['cardId', 'createdAt'])
@Index(['userId', 'createdAt'])
@Index(['status'])
@Index(['transactionType'])
export class CardTransactionEntity {
  @PrimaryGeneratedColumn('uuid')
  transactionId: string;

  @Column({ type: 'uuid' })
  cardId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'decimal', precision: 24, scale: 8 })
  amount: string;

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  @Column({ type: 'varchar', length: 50 })
  transactionType: 'AUTHORIZATION' | 'CLEARING' | 'REVERSAL' | 'REFUND';

  @Column({ type: 'varchar', length: 20 })
  status: 'PENDING' | 'COMPLETED' | 'DECLINED' | 'REVERSED';

  @Column({ type: 'varchar', length: 255, nullable: true })
  merchantName: string | null;

  @Column({ type: 'varchar', length: 50, nullable: true })
  merchantCategory: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true })
  merchantCountry: string | null;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any> | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
