export declare enum SettlementStatus {
    PENDING = "pending",
    PROCESSING = "processing",
    COMPLETED = "completed",
    FAILED = "failed",
    CANCELLED = "cancelled"
}
export declare class PartnerSettlementEntity {
    settlement_id: string;
    reference: string;
    partner_id: string;
    partner_name: string;
    period_start_date: Date;
    period_end_date: Date;
    settlement_date: Date;
    transaction_count: number;
    gross_transaction_amount: number;
    platform_commission: number;
    partner_payout: number;
    adjustments: number;
    refund_amount: number;
    net_settlement_amount: number;
    currency: string;
    payment_method: string;
    bank_account_number: string;
    bank_name: string;
    bank_code: string;
    account_holder_name: string;
    payment_transaction_id: string;
    payment_reference: string;
    status: SettlementStatus;
    notes: string;
    adjustment_reason: string;
    transaction_ids: string[];
    processed_by: string;
    processed_at: Date;
    completed_at: Date;
    failed_at: Date;
    failure_reason: string;
    metadata: Record<string, any>;
    created_at: Date;
    updated_at: Date;
}
