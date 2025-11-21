import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('split_configurations')
@Index(['userId', 'isActive'])
@Index(['name'])
export class SplitConfigurationEntity {
  @PrimaryColumn('uuid')
  configurationId: string;

  @Column('uuid')
  @Index()
  userId: string; // Owner of this configuration

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: ['percentage', 'fixed', 'hybrid'],
    default: 'percentage',
  })
  splitType: string;

  @Column({ type: 'jsonb' })
  splitRules: Array<{
    recipientId: string;
    recipientType: 'user' | 'wallet' | 'merchant' | 'platform';
    recipientName?: string;
    splitType: 'percentage' | 'fixed';
    value: string;
    description?: string;
    priority?: number; // For processing order
  }>;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean; // Default configuration for this user

  @Column({ type: 'jsonb', nullable: true })
  conditions: {
    minAmount?: string;
    maxAmount?: string;
    currencies?: string[];
    paymentMethods?: string[];
  };

  @Column({ type: 'integer', default: 0 })
  usageCount: number;

  @Column({ type: 'timestamp', nullable: true })
  lastUsedAt: Date;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
