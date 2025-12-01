import { MarketplaceService } from './marketplace.service';
import { ListPartnersQueryDto, ListProductsQueryDto, PurchaseProductBodyDto, AddReviewDto } from './dto/marketplace.dto';
export declare class MarketplaceController {
    private readonly marketplaceService;
    constructor(marketplaceService: MarketplaceService);
    getCategories(): Promise<{
        success: boolean;
        data: any;
    }>;
    getPartners(query: ListPartnersQueryDto): Promise<{
        success: boolean;
        data: any;
    }>;
    getPartner(slug: string): Promise<{
        success: boolean;
        data: any;
    }>;
    listProducts(query: ListProductsQueryDto): Promise<{
        data: any;
        pagination: {
            page: number;
            limit: number;
            total: any;
            total_pages: number;
        };
        success: boolean;
    }>;
    getProduct(identifier: string): Promise<{
        success: boolean;
        data: any;
    }>;
    purchaseProduct(req: any, identifier: string, dto: PurchaseProductBodyDto): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    getTransactions(req: any, page?: number, limit?: number): Promise<{
        data: any;
        pagination: {
            page: number;
            limit: number;
            total: any;
            total_pages: number;
        };
        success: boolean;
    }>;
    getTransaction(req: any, reference: string): Promise<{
        success: boolean;
        data: any;
    }>;
    addReview(req: any, transactionId: string, dto: AddReviewDto): Promise<{
        success: boolean;
        message: string;
        data: any;
    }>;
    getProductReviews(productId: string, page?: number, limit?: number): Promise<{
        data: any;
        pagination: {
            page: number;
            limit: number;
            total: any;
            total_pages: number;
        };
        average_rating: number;
        success: boolean;
    }>;
    getFeaturedProducts(country?: string, limit?: number): Promise<{
        success: boolean;
        data: any;
    }>;
    getTrendingProducts(country?: string, limit?: number): Promise<{
        success: boolean;
        data: any;
    }>;
}
