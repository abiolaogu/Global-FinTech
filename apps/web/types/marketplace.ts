/**
 * Marketplace Type Definitions
 * Type-safe interfaces for the Global-FinTech Marketplace
 */

export enum PartnerCategory {
  FINANCIAL_SERVICES = 'financial_services',
  ECOMMERCE = 'ecommerce',
  TRAVEL = 'travel',
  UTILITIES = 'utilities',
  BUSINESS_SERVICES = 'business_services',
  HEALTH = 'health',
  EDUCATION = 'education',
  LIFESTYLE = 'lifestyle',
  CRYPTO = 'crypto',
  REMITTANCE = 'remittance',
}

export enum IntegrationType {
  API = 'api',
  REDIRECT = 'redirect',
  AFFILIATE = 'affiliate',
  WHITE_LABEL = 'white_label',
  EMBEDDED = 'embedded',
}

export enum ProductType {
  PHYSICAL = 'physical',
  DIGITAL = 'digital',
  SERVICE = 'service',
  SUBSCRIPTION = 'subscription',
  UTILITY = 'utility',
  BOOKING = 'booking',
}

export enum PricingModel {
  FIXED = 'fixed',
  VARIABLE = 'variable',
  TIERED = 'tiered',
  PERCENTAGE = 'percentage',
  FREE = 'free',
}

export enum TransactionStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
  CANCELLED = 'cancelled',
  REFUNDED = 'refunded',
  DISPUTED = 'disputed',
}

export interface MarketplaceCategory {
  category_id: string;
  slug: string;
  name: string;
  description: string;
  icon_url: string | null;
  banner_url: string | null;
  display_order: number;
  is_active: boolean;
  is_featured: boolean;
  product_count: number;
  metadata: Record<string, any> | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  created_at: Date;
  updated_at: Date;
  children?: MarketplaceCategory[];
  parent?: MarketplaceCategory;
}

export interface MarketplacePartner {
  partner_id: string;
  name: string;
  slug: string;
  category: PartnerCategory;
  description: string;
  logo_url: string | null;
  banner_url: string | null;
  website_url: string | null;
  contact_email: string;
  contact_phone: string | null;
  integration_type: IntegrationType;
  api_endpoint: string | null;
  api_key_encrypted: string | null;
  webhook_url: string | null;
  webhook_secret_encrypted: string | null;
  is_active: boolean;
  is_featured: boolean;
  countries_available: string[];
  supported_currencies: string[];
  commission_percentage: number;
  commission_model: string;
  fixed_commission_amount: number | null;
  settlement_frequency: string;
  settlement_day_of_week: number | null;
  settlement_day_of_month: number | null;
  auto_settlement_enabled: boolean;
  bank_account_details: Record<string, any> | null;
  rating: number;
  review_count: number;
  total_sales: number;
  total_revenue: number;
  metadata: Record<string, any> | null;
  created_at: Date;
  updated_at: Date;
  deactivated_at: Date | null;
}

export interface PricingTier {
  tier_name: string;
  price: number;
  features: string[];
  billing_period?: string;
}

export interface MarketplaceProduct {
  product_id: string;
  partner_id: string;
  product_type: ProductType;
  name: string;
  slug: string;
  short_description: string;
  long_description: string;
  category_id: string | null;
  sku: string | null;
  price: number | null;
  pricing_model: PricingModel;
  pricing_tiers: PricingTier[] | null;
  currency: string;
  discount_price: number | null;
  discount_start_date: Date | null;
  discount_end_date: Date | null;
  images: string[];
  thumbnail_url: string | null;
  video_url: string | null;
  digital_download_url: string | null;
  requires_shipping: boolean;
  shipping_cost: number | null;
  estimated_delivery_days: number | null;
  stock_quantity: number | null;
  low_stock_threshold: number | null;
  max_purchase_quantity: number | null;
  min_purchase_quantity: number;
  is_active: boolean;
  is_featured: boolean;
  countries_available: string[];
  tags: string[];
  specifications: Record<string, any> | null;
  api_product_id: string | null;
  rating: number;
  review_count: number;
  total_sales: number;
  metadata: Record<string, any> | null;
  meta_title: string | null;
  meta_description: string | null;
  meta_keywords: string[] | null;
  created_at: Date;
  updated_at: Date;
  deactivated_at: Date | null;
  partner?: MarketplacePartner;
  category?: MarketplaceCategory;
}

export interface CustomerDetails {
  full_name?: string;
  email?: string;
  phone?: string;
  [key: string]: any;
}

export interface ShippingAddress {
  address_line_1: string;
  address_line_2?: string;
  city: string;
  state?: string;
  postal_code: string;
  country: string;
}

export interface PartnerTransaction {
  transaction_id: string;
  reference: string;
  user_id: string;
  partner_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  shipping_cost: number;
  total_amount: number;
  currency: string;
  commission_percentage: number;
  commission_amount: number;
  partner_payout: number;
  platform_revenue: number;
  status: TransactionStatus;
  payment_reference: string;
  customer_details: CustomerDetails | null;
  shipping_address: ShippingAddress | null;
  tracking_number: string | null;
  estimated_delivery_date: Date | null;
  delivered_at: Date | null;
  fulfillment_status: string;
  external_transaction_id: string | null;
  api_request: Record<string, any> | null;
  api_response: Record<string, any> | null;
  error_message: string | null;
  refund_amount: number | null;
  refund_reason: string | null;
  refunded_at: Date | null;
  metadata: Record<string, any> | null;
  created_at: Date;
  updated_at: Date;
  completed_at: Date | null;
  product?: MarketplaceProduct;
  partner?: MarketplacePartner;
}

export interface ProductReview {
  review_id: string;
  product_id: string;
  user_id: string;
  transaction_id: string;
  rating: number;
  comment: string | null;
  is_verified_purchase: boolean;
  is_moderated: boolean;
  moderation_status: string;
  moderation_notes: string | null;
  helpful_count: number;
  reported_count: number;
  created_at: Date;
  updated_at: Date;
  moderated_at: Date | null;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ListProductsFilters {
  category?: string;
  partner_id?: string;
  country?: string;
  min_price?: number;
  max_price?: number;
  is_featured?: boolean;
  search?: string;
}

export interface PurchaseProductDto {
  product_id: string;
  quantity: number;
  customer_details?: CustomerDetails;
  shipping_address?: ShippingAddress;
  metadata?: Record<string, any>;
}

export interface AddReviewDto {
  rating: number;
  comment?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
