import { ProductStatus } from '../entities/product.entity';
export declare class ListPartnersQueryDto {
    country?: string;
    category?: string;
}
export declare class ListProductsQueryDto {
    category?: string;
    partner_id?: string;
    country?: string;
    min_price?: string;
    max_price?: string;
    is_featured?: boolean;
    search?: string;
    status?: ProductStatus;
    page?: number;
    limit?: number;
}
export declare class CustomerDetailsDto {
    email?: string;
    phone?: string;
    name?: string;
}
export declare class ShippingAddressDto {
    street: string;
    city: string;
    state: string;
    country: string;
    postal_code: string;
}
export declare class PurchaseProductBodyDto {
    quantity: number;
    customer_details?: CustomerDetailsDto;
    shipping_address?: ShippingAddressDto;
    metadata?: Record<string, any>;
}
export declare class AddReviewDto {
    rating: number;
    comment: string;
    title?: string;
}
export declare class CreatePartnerDto {
    name: string;
    slug: string;
    description?: string;
    category: string;
    integration_type: string;
    countries: string[];
    contact_email: string;
    contact_phone?: string;
    website_url?: string;
    commission_percentage?: number;
    fixed_commission?: number;
    commission_model?: string;
}
export declare class CreateProductDto {
    partner_id: string;
    name: string;
    slug: string;
    description?: string;
    product_type: string;
    pricing_model: string;
    price?: number;
    currency: string;
    category: string;
    countries: string[];
    stock_quantity?: number;
    features?: string[];
    tags?: string[];
}
