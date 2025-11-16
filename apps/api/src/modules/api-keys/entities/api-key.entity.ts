import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('api_keys')
@Index(['partnerId'])
@Index(['keyPrefix', 'keyHash'], { unique: true })
export class ApiKeyEntity {
  @PrimaryGeneratedColumn('uuid')
  keyId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'uuid' })
  partnerId: string;

  @Column({ type: 'varchar', length: 10 })
  keyPrefix: string; // First 8 chars of key for identification

  @Column({ type: 'varchar', length: 255 })
  keyHash: string; // SHA-256 hash of full key

  @Column({ type: 'jsonb' })
  scopes: string[];

  @Column({ type: 'int', default: 100 })
  rateLimit: number; // Requests per minute

  @Column({ type: 'jsonb', default: [] })
  ipWhitelist: string[];

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'timestamp with time zone', nullable: true })
  lastUsedAt: Date | null;

  @Column({ type: 'timestamp with time zone', nullable: true })
  revokedAt: Date | null;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
