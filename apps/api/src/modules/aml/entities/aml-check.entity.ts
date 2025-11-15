import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('aml_checks')
@Index(['userId', 'createdAt'])
@Index(['requiresReview'])
@Index(['sanctionsMatch'])
@Index(['pepMatch'])
export class AMLCheckEntity {
  @PrimaryGeneratedColumn('uuid')
  checkId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 50 })
  transactionType: string;

  @Column({ type: 'decimal', precision: 24, scale: 8 })
  amount: string;

  @Column({ type: 'varchar', length: 10 })
  currency: string;

  @Column({ type: 'boolean' })
  passed: boolean;

  @Column({ type: 'jsonb', nullable: true })
  flags: string[] | null;

  @Column({ type: 'boolean', default: false })
  sanctionsMatch: boolean;

  @Column({ type: 'boolean', default: false })
  pepMatch: boolean;

  @Column({ type: 'varchar', length: 20 })
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';

  @Column({ type: 'boolean', default: false })
  requiresReview: boolean;

  @Column({ type: 'uuid', nullable: true })
  counterpartyId: string | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
