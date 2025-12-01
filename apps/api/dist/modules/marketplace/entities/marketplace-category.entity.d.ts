export declare class MarketplaceCategoryEntity {
    category_id: string;
    slug: string;
    name: string;
    description: string;
    icon_url: string;
    banner_url: string;
    display_order: number;
    is_active: boolean;
    is_featured: boolean;
    product_count: number;
    metadata: Record<string, any>;
    meta_title: string;
    meta_description: string;
    meta_keywords: string[];
    created_at: Date;
    updated_at: Date;
    children: MarketplaceCategoryEntity[];
    parent: MarketplaceCategoryEntity;
}
