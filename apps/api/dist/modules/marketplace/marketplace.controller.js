"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceController = void 0;
const common_1 = require("@nestjs/common");
const swagger_1 = require("@nestjs/swagger");
const jwt_auth_guard_1 = require("../auth/guards/jwt-auth.guard");
const marketplace_service_1 = require("./marketplace.service");
const marketplace_dto_1 = require("./dto/marketplace.dto");
let MarketplaceController = class MarketplaceController {
    constructor(marketplaceService) {
        this.marketplaceService = marketplaceService;
    }
    async getCategories() {
        const categories = await this.marketplaceService.getCategories();
        return {
            success: true,
            data: categories,
        };
    }
    async getPartners(query) {
        const partners = await this.marketplaceService.getPartners(query.country, query.category);
        return {
            success: true,
            data: partners,
        };
    }
    async getPartner(slug) {
        const partner = await this.marketplaceService.getPartnerBySlug(slug);
        return {
            success: true,
            data: partner,
        };
    }
    async listProducts(query) {
        const filters = {
            category: query.category,
            partner_id: query.partner_id,
            country: query.country,
            min_price: query.min_price ? parseFloat(query.min_price) : undefined,
            max_price: query.max_price ? parseFloat(query.max_price) : undefined,
            is_featured: query.is_featured,
            search: query.search,
        };
        const result = await this.marketplaceService.listProducts(filters, query.page || 1, query.limit || 20);
        return Object.assign({ success: true }, result);
    }
    async getProduct(identifier) {
        const product = await this.marketplaceService.getProduct(identifier);
        return {
            success: true,
            data: product,
        };
    }
    async purchaseProduct(req, identifier, dto) {
        const transaction = await this.marketplaceService.purchaseProduct(req.user.user_id, {
            product_id: identifier,
            quantity: dto.quantity,
            customer_details: dto.customer_details,
            shipping_address: dto.shipping_address,
            metadata: dto.metadata,
        });
        return {
            success: true,
            message: 'Purchase successful',
            data: transaction,
        };
    }
    async getTransactions(req, page = 1, limit = 20) {
        const result = await this.marketplaceService.getUserTransactions(req.user.user_id, page, limit);
        return Object.assign({ success: true }, result);
    }
    async getTransaction(req, reference) {
        const transaction = await this.marketplaceService.getTransaction(reference, req.user.user_id);
        return {
            success: true,
            data: transaction,
        };
    }
    async addReview(req, transactionId, dto) {
        const review = await this.marketplaceService.addReview(req.user.user_id, transactionId, dto.rating, dto.comment);
        return {
            success: true,
            message: 'Review submitted successfully. It will be published after moderation.',
            data: review,
        };
    }
    async getProductReviews(productId, page = 1, limit = 20) {
        const result = await this.marketplaceService.getProductReviews(productId, page, limit);
        return Object.assign({ success: true }, result);
    }
    async getFeaturedProducts(country, limit = 10) {
        const result = await this.marketplaceService.listProducts({ is_featured: true, country }, 1, limit);
        return {
            success: true,
            data: result.data,
        };
    }
    async getTrendingProducts(country, limit = 10) {
        const result = await this.marketplaceService.listProducts({ country }, 1, limit);
        return {
            success: true,
            data: result.data,
        };
    }
};
exports.MarketplaceController = MarketplaceController;
__decorate([
    (0, common_1.Get)('categories'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all marketplace categories' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Categories retrieved successfully' }),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "getCategories", null);
__decorate([
    (0, common_1.Get)('partners'),
    (0, swagger_1.ApiOperation)({ summary: 'Get all marketplace partners' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Partners retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [marketplace_dto_1.ListPartnersQueryDto]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "getPartners", null);
__decorate([
    (0, common_1.Get)('partners/:slug'),
    (0, swagger_1.ApiOperation)({ summary: 'Get partner details by slug' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Partner retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Partner not found' }),
    __param(0, (0, common_1.Param)('slug')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "getPartner", null);
__decorate([
    (0, common_1.Get)('products'),
    (0, swagger_1.ApiOperation)({ summary: 'List marketplace products with filters' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Products retrieved successfully' }),
    __param(0, (0, common_1.Query)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [marketplace_dto_1.ListProductsQueryDto]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "listProducts", null);
__decorate([
    (0, common_1.Get)('products/:identifier'),
    (0, swagger_1.ApiOperation)({ summary: 'Get product details by ID or slug' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Product retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Product not found' }),
    __param(0, (0, common_1.Param)('identifier')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "getProduct", null);
__decorate([
    (0, common_1.Post)('products/:identifier/purchase'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Purchase a marketplace product' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Product purchased successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Product not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('identifier')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, marketplace_dto_1.PurchaseProductBodyDto]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "purchaseProduct", null);
__decorate([
    (0, common_1.Get)('transactions'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get user marketplace transactions' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transactions retrieved successfully' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Number, Number]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "getTransactions", null);
__decorate([
    (0, common_1.Get)('transactions/:reference'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, swagger_1.ApiOperation)({ summary: 'Get transaction details by reference' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Transaction retrieved successfully' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('reference')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "getTransaction", null);
__decorate([
    (0, common_1.Post)('transactions/:transaction_id/review'),
    (0, common_1.UseGuards)(jwt_auth_guard_1.JwtAuthGuard),
    (0, swagger_1.ApiBearerAuth)(),
    (0, common_1.HttpCode)(common_1.HttpStatus.OK),
    (0, swagger_1.ApiOperation)({ summary: 'Add review for purchased product' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Review added successfully' }),
    (0, swagger_1.ApiResponse)({ status: 400, description: 'Bad request' }),
    (0, swagger_1.ApiResponse)({ status: 404, description: 'Transaction not found' }),
    __param(0, (0, common_1.Request)()),
    __param(1, (0, common_1.Param)('transaction_id')),
    __param(2, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, marketplace_dto_1.AddReviewDto]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "addReview", null);
__decorate([
    (0, common_1.Get)('products/:product_id/reviews'),
    (0, swagger_1.ApiOperation)({ summary: 'Get product reviews' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Reviews retrieved successfully' }),
    __param(0, (0, common_1.Param)('product_id')),
    __param(1, (0, common_1.Query)('page')),
    __param(2, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number, Number]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "getProductReviews", null);
__decorate([
    (0, common_1.Get)('featured'),
    (0, swagger_1.ApiOperation)({ summary: 'Get featured products' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Featured products retrieved successfully' }),
    __param(0, (0, common_1.Query)('country')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "getFeaturedProducts", null);
__decorate([
    (0, common_1.Get)('trending'),
    (0, swagger_1.ApiOperation)({ summary: 'Get trending products (most sold)' }),
    (0, swagger_1.ApiResponse)({ status: 200, description: 'Trending products retrieved successfully' }),
    __param(0, (0, common_1.Query)('country')),
    __param(1, (0, common_1.Query)('limit')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Number]),
    __metadata("design:returntype", Promise)
], MarketplaceController.prototype, "getTrendingProducts", null);
exports.MarketplaceController = MarketplaceController = __decorate([
    (0, swagger_1.ApiTags)('Marketplace'),
    (0, common_1.Controller)('marketplace'),
    __metadata("design:paramtypes", [marketplace_service_1.MarketplaceService])
], MarketplaceController);
//# sourceMappingURL=marketplace.controller.js.map