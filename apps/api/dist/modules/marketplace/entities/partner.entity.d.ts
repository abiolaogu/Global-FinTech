import { MarketplaceProductEntity } from './product.entity';
import { PartnerTransactionEntity } from './partner-transaction.entity';
export declare enum PartnerCategory {
    FINANCIAL_SERVICES = "financial_services",
    ECOMMERCE = "ecommerce",
    TRAVEL = "travel",
    UTILITIES = "utilities",
    BUSINESS_SERVICES = "business_services",
    HEALTH = "health",
    EDUCATION = "education",
    LIFESTYLE = "lifestyle",
    CRYPTO = "crypto",
    REMITTANCE = "remittance"
}
export declare enum IntegrationType {
    API = "api",
    REDIRECT = "redirect",
    AFFILIATE = "affiliate",
    WHITE_LABEL = "white_label",
    EMBEDDED = "embedded"
}
export declare enum PartnerStatus {
    PENDING = "pending",
    ACTIVE = "active",
    PAUSED = "paused",
    SUSPENDED = "suspended",
    INACTIVE = "inactive"
}
export declare class MarketplacePartnerEntity {
    partner_id: string;
    name: string;
    slug: string;
    description: string;
    logo_url: string;
    banner_url: string;
    category: PartnerCategory;
    sub_categories: string[];
    integration_type: IntegrationType;
    status: PartnerStatus;
    countries: string[];
    contact_email: string;
    contact_phone: string;
    website_url: string;
    legal_entity_name: string;
    registration_number: string;
    api_base_url: string;
    api_key: string;
    api_secret: string;
    webhook_url: string;
    redirect_url: string;
    callback_url: string;
    commission_percentage: number;
    fixed_commission: number;
    commission_model: string;
    settlement_frequency: string;
    settlement_delay_days: number;
    pending_settlement_amount: number;
    last_settlement_date: Date;
    total_transactions: number;
    total_volume: number;
    total_commission_earned: number;
    average_rating: number;
    total_reviews: number;
    is_featured: boolean;
    is_promoted: boolean;
    display_order: number;
    metadata: Record<string, any>;
    tags: string[];
    created_at: Date;
    updated_at: Date;
    activated_at: Date;
    suspended_at: Date;
    products: MarketplaceProductEntity[];
    transactions: PartnerTransactionEntity[];
}
