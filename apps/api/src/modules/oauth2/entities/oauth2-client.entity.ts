import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('oauth2_clients')
@Index(['partnerId'])
@Index(['clientId'], { unique: true })
export class OAuth2ClientEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  clientId: string;

  @Column({ type: 'varchar', length: 255 })
  clientSecretHash: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'uuid' })
  partnerId: string;

  @Column({ type: 'jsonb' })
  redirectUris: string[];

  @Column({ type: 'jsonb' })
  scopes: string[]; // e.g., ['read:wallets', 'write:payments', 'read:transactions']

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;

  @UpdateDateColumn({ type: 'timestamp with time zone' })
  updatedAt: Date;
}
