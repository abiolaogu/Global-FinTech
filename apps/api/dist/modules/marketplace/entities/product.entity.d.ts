import { MarketplacePartnerEntity } from './partner.entity';
import { PartnerTransactionEntity } from './partner-transaction.entity';
export declare enum ProductType {
    PHYSICAL = "physical",
    DIGITAL = "digital",
    SERVICE = "service",
    SUBSCRIPTION = "subscription",
    UTILITY = "utility",
    BOOKING = "booking"
}
export declare enum PricingModel {
    FIXED = "fixed",
    VARIABLE = "variable",
    TIERED = "tiered",
    PERCENTAGE = "percentage",
    FREE = "free"
}
export declare enum ProductStatus {
    DRAFT = "draft",
    ACTIVE = "active",
    OUT_OF_STOCK = "out_of_stock",
    DISCONTINUED = "discontinued",
    SUSPENDED = "suspended"
}
export declare class MarketplaceProductEntity {
    product_id: string;
    partner_id: string;
    name: string;
    slug: string;
    description: string;
    long_description: string;
    product_type: ProductType;
    pricing_model: PricingModel;
    price: number;
    currency: string;
    min_amount: number;
    max_amount: number;
    discount_price: number;
    discount_ends_at: Date;
    pricing_tiers: Array<{
        tier_name: string;
        price: number;
        features: string[];
        billing_period?: string;
    }>;
    image_url: string;
    gallery_urls: string[];
    video_url: string;
    status: ProductStatus;
    countries: string[];
    stock_quantity: number;
    sold_count: number;
    features: string[];
    specifications: Record<string, any>;
    terms_and_conditions: string;
    category: string;
    subcategory: string;
    tags: string[];
    meta_title: string;
    meta_description: string;
    meta_keywords: string[];
    external_product_id: string;
    api_endpoint: string;
    api_params: Record<string, any>;
    view_count: number;
    average_rating: number;
    total_reviews: number;
    total_revenue: number;
    is_featured: boolean;
    is_visible: boolean;
    display_order: number;
    badges: string[];
    estimated_delivery_days: number;
    shipping_cost: number;
    requires_kyc: boolean;
    min_purchase_quantity: number;
    max_purchase_quantity: number;
    metadata: Record<string, any>;
    created_at: Date;
    updated_at: Date;
    published_at: Date;
    partner: MarketplacePartnerEntity;
    transactions: PartnerTransactionEntity[];
}
