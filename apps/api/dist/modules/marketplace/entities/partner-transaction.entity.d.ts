import { MarketplacePartnerEntity } from './partner.entity';
import { MarketplaceProductEntity } from './product.entity';
export declare enum TransactionStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled",
    REFUNDED = "refunded",
    DISPUTED = "disputed"
}
export declare enum FulfillmentStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    SHIPPED = "shipped",
    DELIVERED = "delivered",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export declare class PartnerTransactionEntity {
    transaction_id: string;
    reference: string;
    user_id: string;
    partner_id: string;
    product_id: string;
    product_name: string;
    quantity: number;
    unit_price: number;
    subtotal: number;
    discount_amount: number;
    tax_amount: number;
    shipping_cost: number;
    total_amount: number;
    currency: string;
    commission_amount: number;
    commission_percentage: number;
    partner_payout: number;
    platform_revenue: number;
    payment_transaction_id: string;
    payment_method: string;
    payment_status: string;
    status: TransactionStatus;
    fulfillment_status: FulfillmentStatus;
    external_transaction_id: string;
    external_reference: string;
    api_request: Record<string, any>;
    api_response: Record<string, any>;
    customer_email: string;
    customer_phone: string;
    customer_details: Record<string, any>;
    shipping_address: {
        street: string;
        city: string;
        state: string;
        country: string;
        postal_code: string;
    };
    tracking_number: string;
    courier_name: string;
    shipped_at: Date;
    delivered_at: Date;
    estimated_delivery_date: Date;
    product_data: Record<string, any>;
    customer_notes: string;
    internal_notes: string;
    is_refunded: boolean;
    refund_amount: number;
    refund_reason: string;
    refunded_at: Date;
    is_reviewed: boolean;
    rating: number;
    review_comment: string;
    reviewed_at: Date;
    is_settled: boolean;
    settlement_batch_id: string;
    settled_at: Date;
    retry_count: number;
    error_message: string;
    error_details: Record<string, any>;
    metadata: Record<string, any>;
    source: string;
    user_agent: string;
    ip_address: string;
    created_at: Date;
    updated_at: Date;
    completed_at: Date;
    failed_at: Date;
    cancelled_at: Date;
    partner: MarketplacePartnerEntity;
    product: MarketplaceProductEntity;
}
