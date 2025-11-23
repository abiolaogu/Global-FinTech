import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

export enum ReviewStatus {
  PENDING = 'pending', // Awaiting moderation
  APPROVED = 'approved', // Published
  REJECTED = 'rejected', // Rejected by moderator
  FLAGGED = 'flagged', // Flagged for review
}

@Entity('product_reviews')
@Index(['product_id', 'status'])
@Index(['user_id'])
@Index(['partner_id'])
export class ProductReviewEntity {
  @PrimaryGeneratedColumn('uuid')
  review_id: string;

  @Column({ type: 'uuid' })
  @Index()
  product_id: string;

  @Column({ type: 'uuid' })
  @Index()
  partner_id: string;

  @Column({ type: 'uuid' })
  @Index()
  user_id: string;

  @Column({ type: 'uuid', nullable: true })
  transaction_id: string; // Link to purchase transaction

  // Review content
  @Column({ type: 'int' })
  rating: number; // 1-5 stars

  @Column({ type: 'varchar', length: 255, nullable: true })
  title: string;

  @Column({ type: 'text' })
  comment: string;

  @Column({ type: 'simple-array', nullable: true })
  image_urls: string[]; // Photos uploaded by user

  // Detailed ratings (optional)
  @Column({ type: 'int', nullable: true })
  quality_rating: number; // 1-5

  @Column({ type: 'int', nullable: true })
  value_rating: number; // 1-5

  @Column({ type: 'int', nullable: true })
  service_rating: number; // 1-5

  // Verification
  @Column({ type: 'boolean', default: false })
  is_verified_purchase: boolean; // Has user purchased this?

  @Column({ type: 'boolean', default: false })
  is_anonymous: boolean; // Posted anonymously

  // Moderation
  @Column({
    type: 'enum',
    enum: ReviewStatus,
    default: ReviewStatus.PENDING,
  })
  status: ReviewStatus;

  @Column({ type: 'uuid', nullable: true })
  moderated_by: string; // Admin user ID

  @Column({ type: 'timestamp', nullable: true })
  moderated_at: Date;

  @Column({ type: 'text', nullable: true })
  moderation_notes: string;

  // Engagement
  @Column({ type: 'int', default: 0 })
  helpful_count: number; // "Helpful" votes

  @Column({ type: 'int', default: 0 })
  not_helpful_count: number;

  @Column({ type: 'int', default: 0 })
  report_count: number; // Times reported by users

  // Partner response
  @Column({ type: 'boolean', default: false })
  has_partner_response: boolean;

  @Column({ type: 'text', nullable: true })
  partner_response: string;

  @Column({ type: 'timestamp', nullable: true })
  partner_response_at: Date;

  // Metadata
  @Column({ type: 'varchar', length: 255, nullable: true })
  user_display_name: string; // Cached for display

  @Column({ type: 'varchar', length: 255, nullable: true })
  product_name: string; // Cached

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @Column({ type: 'timestamp', nullable: true })
  published_at: Date;
}
