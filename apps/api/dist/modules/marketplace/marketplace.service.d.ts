import { Repository } from 'typeorm';
import { MarketplacePartnerEntity } from './entities/partner.entity';
import { MarketplaceProductEntity, ProductStatus } from './entities/product.entity';
import { PartnerTransactionEntity } from './entities/partner-transaction.entity';
import { ProductReviewEntity } from './entities/product-review.entity';
import { MarketplaceCategoryEntity } from './entities/marketplace-category.entity';
import { PartnerSettlementEntity } from './entities/partner-settlement.entity';
import { WalletService } from '../wallets/wallet.service';
import { NotificationService } from '../notifications/notification.service';
export interface PurchaseProductDto {
    product_id: string;
    quantity: number;
    customer_details?: {
        email?: string;
        phone?: string;
        name?: string;
    };
    shipping_address?: {
        street: string;
        city: string;
        state: string;
        country: string;
        postal_code: string;
    };
    metadata?: Record<string, any>;
}
export interface ListProductsFilters {
    category?: string;
    partner_id?: string;
    country?: string;
    min_price?: number;
    max_price?: number;
    is_featured?: boolean;
    search?: string;
    status?: ProductStatus;
}
export declare class MarketplaceService {
    private partnerRepository;
    private productRepository;
    private transactionRepository;
    private reviewRepository;
    private categoryRepository;
    private settlementRepository;
    private walletService;
    private notificationService;
    private readonly logger;
    constructor(partnerRepository: Repository<MarketplacePartnerEntity>, productRepository: Repository<MarketplaceProductEntity>, transactionRepository: Repository<PartnerTransactionEntity>, reviewRepository: Repository<ProductReviewEntity>, categoryRepository: Repository<MarketplaceCategoryEntity>, settlementRepository: Repository<PartnerSettlementEntity>, walletService: WalletService, notificationService: NotificationService);
    getPartners(country?: string, category?: string): Promise<any>;
    getPartnerBySlug(slug: string): Promise<any>;
    listProducts(filters: ListProductsFilters, page?: number, limit?: number): Promise<{
        data: any;
        pagination: {
            page: number;
            limit: number;
            total: any;
            total_pages: number;
        };
    }>;
    getProduct(identifier: string): Promise<any>;
    purchaseProduct(userId: string, dto: PurchaseProductDto): Promise<any>;
    private processPartnerAPITransaction;
    getUserTransactions(userId: string, page?: number, limit?: number): Promise<{
        data: any;
        pagination: {
            page: number;
            limit: number;
            total: any;
            total_pages: number;
        };
    }>;
    getTransaction(reference: string, userId?: string): Promise<any>;
    refundTransaction(transactionId: string, reason: string): Promise<any>;
    addReview(userId: string, transactionId: string, rating: number, comment: string): Promise<any>;
    getProductReviews(productId: string, page?: number, limit?: number): Promise<{
        data: any;
        pagination: {
            page: number;
            limit: number;
            total: any;
            total_pages: number;
        };
        average_rating: number;
    }>;
    getCategories(): Promise<any>;
    private updatePartnerMetrics;
    generateSettlements(startDate: Date, endDate: Date): Promise<any[]>;
}
