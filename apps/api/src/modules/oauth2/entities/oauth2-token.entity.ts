import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

@Entity('oauth2_tokens')
@Index(['clientId', 'userId'])
@Index(['accessToken'])
@Index(['refreshToken'])
export class OAuth2TokenEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  accessToken: string; // Hashed

  @Column({ type: 'varchar', length: 255 })
  refreshToken: string; // Hashed

  @Column({ type: 'varchar', length: 255 })
  clientId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'text' })
  scope: string;

  @Column({ type: 'timestamp with time zone' })
  accessTokenExpiresAt: Date;

  @Column({ type: 'timestamp with time zone' })
  refreshTokenExpiresAt: Date;

  @Column({ type: 'boolean', default: false })
  revoked: boolean;

  @CreateDateColumn({ type: 'timestamp with time zone' })
  createdAt: Date;
}
