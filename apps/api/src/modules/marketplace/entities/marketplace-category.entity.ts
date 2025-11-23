import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  Tree,
  TreeChildren,
  TreeParent,
} from 'typeorm';

@Entity('marketplace_categories')
@Tree('closure-table')
@Index(['slug'])
export class MarketplaceCategoryEntity {
  @PrimaryGeneratedColumn('uuid')
  category_id: string;

  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  slug: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  icon_url: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  banner_url: string;

  @Column({ type: 'int', default: 0 })
  display_order: number;

  @Column({ type: 'boolean', default: true })
  is_active: boolean;

  @Column({ type: 'boolean', default: false })
  is_featured: boolean;

  @Column({ type: 'int', default: 0 })
  product_count: number; // Denormalized count

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>;

  // SEO
  @Column({ type: 'varchar', length: 255, nullable: true })
  meta_title: string;

  @Column({ type: 'text', nullable: true })
  meta_description: string;

  @Column({ type: 'simple-array', nullable: true })
  meta_keywords: string[];

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  // Tree structure
  @TreeChildren()
  children: MarketplaceCategoryEntity[];

  @TreeParent()
  parent: MarketplaceCategoryEntity;
}
