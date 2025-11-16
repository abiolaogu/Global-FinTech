import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('open_banking_connections')
@Index(['userId'])
@Index(['status'])
export class OpenBankingConnectionEntity {
  @PrimaryGeneratedColumn('uuid')
  connectionId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  institutionId: string; // Bank/institution identifier

  @Column({ type: 'text' })
  accessTokenHash: string; // Encrypted Plaid access token

  @Column({ type: 'varchar', length: 255 })
  itemId: string; // Plaid item ID

  @Column({ type: 'varchar', length: 20 })
  status: 'active' | 'disconnected' | 'error' | 'consent_expired';

  @Column({ type: 'timestamp with time zone' })
  consentExpiresAt: Date;

  @Column({ type: 'timestamp with time zone', nullable: true })
  disconnectedAt: Date | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
