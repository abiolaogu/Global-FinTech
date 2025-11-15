import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('oauth2_authorization_codes')
@Index(['code'], { unique: true })
@Index(['clientId', 'userId'])
export class OAuth2AuthorizationCodeEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  code: string;

  @Column({ type: 'varchar', length: 255 })
  clientId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'text' })
  redirectUri: string;

  @Column({ type: 'text' })
  scope: string;

  @Column({ type: 'timestamp with time zone' })
  expiresAt: Date;

  @Column({ type: 'boolean', default: false })
  used: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
