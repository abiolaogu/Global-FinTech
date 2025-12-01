export declare enum ReviewStatus {
    PENDING = "pending",
    APPROVED = "approved",
    REJECTED = "rejected",
    FLAGGED = "flagged"
}
export declare class ProductReviewEntity {
    review_id: string;
    product_id: string;
    partner_id: string;
    user_id: string;
    transaction_id: string;
    rating: number;
    title: string;
    comment: string;
    image_urls: string[];
    quality_rating: number;
    value_rating: number;
    service_rating: number;
    is_verified_purchase: boolean;
    is_anonymous: boolean;
    status: ReviewStatus;
    moderated_by: string;
    moderated_at: Date;
    moderation_notes: string;
    helpful_count: number;
    not_helpful_count: number;
    report_count: number;
    has_partner_response: boolean;
    partner_response: string;
    partner_response_at: Date;
    user_display_name: string;
    product_name: string;
    metadata: Record<string, any>;
    created_at: Date;
    updated_at: Date;
    published_at: Date;
}
