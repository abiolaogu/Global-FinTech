import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('cards')
@Index(['userId'])
@Index(['status'])
export class CardEntity {
  @PrimaryGeneratedColumn('uuid')
  cardId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 20 })
  cardType: 'VIRTUAL' | 'PHYSICAL';

  @Column({ type: 'varchar', length: 20 })
  status: 'INACTIVE' | 'ACTIVE' | 'FROZEN' | 'TERMINATED';

  @Column({ type: 'varchar', length: 255 })
  processorCardToken: string; // Marqeta card token

  @Column({ type: 'varchar', length: 4 })
  lastFourDigits: string;

  @Column({ type: 'varchar', length: 6 })
  bin: string; // Bank Identification Number

  @Column({ type: 'int' })
  expiryMonth: number;

  @Column({ type: 'int' })
  expiryYear: number;

  @Column({ type: 'uuid' })
  settlementWalletId: string; // Wallet to debit for transactions

  @Column({ type: 'decimal', precision: 24, scale: 8 })
  dailySpendLimit: string;

  @Column({ type: 'decimal', precision: 24, scale: 8 })
  weeklySpendLimit: string;

  @Column({ type: 'decimal', precision: 24, scale: 8 })
  monthlySpendLimit: string;

  @Column({ type: 'decimal', precision: 24, scale: 8, default: '0' })
  dailySpent: string;

  @Column({ type: 'decimal', precision: 24, scale: 8, default: '0' })
  weeklySpent: string;

  @Column({ type: 'decimal', precision: 24, scale: 8, default: '0' })
  monthlySpent: string;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
