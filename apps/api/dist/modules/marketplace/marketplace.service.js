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
var MarketplaceService_1;
var _a, _b, _c, _d, _e, _f, _g, _h;
Object.defineProperty(exports, "__esModule", { value: true });
exports.MarketplaceService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const partner_entity_1 = require("./entities/partner.entity");
const product_entity_1 = require("./entities/product.entity");
const partner_transaction_entity_1 = require("./entities/partner-transaction.entity");
const product_review_entity_1 = require("./entities/product-review.entity");
const marketplace_category_entity_1 = require("./entities/marketplace-category.entity");
const partner_settlement_entity_1 = require("./entities/partner-settlement.entity");
const wallet_service_1 = require("../wallets/wallet.service");
const notification_service_1 = require("../notifications/notification.service");
const decimal_js_1 = require("decimal.js");
let MarketplaceService = MarketplaceService_1 = class MarketplaceService {
    constructor(partnerRepository, productRepository, transactionRepository, reviewRepository, categoryRepository, settlementRepository, walletService, notificationService) {
        this.partnerRepository = partnerRepository;
        this.productRepository = productRepository;
        this.transactionRepository = transactionRepository;
        this.reviewRepository = reviewRepository;
        this.categoryRepository = categoryRepository;
        this.settlementRepository = settlementRepository;
        this.walletService = walletService;
        this.notificationService = notificationService;
        this.logger = new common_1.Logger(MarketplaceService_1.name);
    }
    async getPartners(country, category) {
        const query = this.partnerRepository
            .createQueryBuilder('partner')
            .where('partner.status = :status', { status: partner_entity_1.PartnerStatus.ACTIVE });
        if (country) {
            query.andWhere(':country = ANY(partner.countries)', { country });
        }
        if (category) {
            query.andWhere('partner.category = :category', { category });
        }
        return query
            .orderBy('partner.is_featured', 'DESC')
            .addOrderBy('partner.display_order', 'ASC')
            .addOrderBy('partner.average_rating', 'DESC')
            .getMany();
    }
    async getPartnerBySlug(slug) {
        const partner = await this.partnerRepository.findOne({
            where: { slug, status: partner_entity_1.PartnerStatus.ACTIVE },
            relations: ['products'],
        });
        if (!partner) {
            throw new common_1.NotFoundException(`Partner with slug "${slug}" not found`);
        }
        return partner;
    }
    async listProducts(filters, page = 1, limit = 20) {
        const query = this.productRepository
            .createQueryBuilder('product')
            .leftJoinAndSelect('product.partner', 'partner')
            .where('product.status = :status', {
            status: filters.status || product_entity_1.ProductStatus.ACTIVE
        })
            .andWhere('partner.status = :partnerStatus', {
            partnerStatus: partner_entity_1.PartnerStatus.ACTIVE
        });
        if (filters.category) {
            query.andWhere('product.category = :category', {
                category: filters.category
            });
        }
        if (filters.partner_id) {
            query.andWhere('product.partner_id = :partner_id', {
                partner_id: filters.partner_id
            });
        }
        if (filters.country) {
            query.andWhere(':country = ANY(product.countries)', {
                country: filters.country
            });
        }
        if (filters.min_price !== undefined) {
            query.andWhere('product.price >= :min_price', {
                min_price: filters.min_price
            });
        }
        if (filters.max_price !== undefined) {
            query.andWhere('product.price <= :max_price', {
                max_price: filters.max_price
            });
        }
        if (filters.is_featured !== undefined) {
            query.andWhere('product.is_featured = :is_featured', {
                is_featured: filters.is_featured
            });
        }
        if (filters.search) {
            query.andWhere('(product.name ILIKE :search OR product.description ILIKE :search OR ARRAY_TO_STRING(product.tags, \',\') ILIKE :search)', { search: `%${filters.search}%` });
        }
        const [products, total] = await query
            .orderBy('product.is_featured', 'DESC')
            .addOrderBy('product.display_order', 'ASC')
            .addOrderBy('product.sold_count', 'DESC')
            .skip((page - 1) * limit)
            .take(limit)
            .getManyAndCount();
        return {
            data: products,
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit),
            },
        };
    }
    async getProduct(identifier) {
        const product = await this.productRepository.findOne({
            where: [
                { product_id: identifier },
                { slug: identifier },
            ],
            relations: ['partner'],
        });
        if (!product) {
            throw new common_1.NotFoundException('Product not found');
        }
        await this.productRepository.increment({ product_id: product.product_id }, 'view_count', 1);
        return product;
    }
    async purchaseProduct(userId, dto) {
        var _a, _b;
        const product = await this.getProduct(dto.product_id);
        const partner = product.partner;
        if (product.status !== product_entity_1.ProductStatus.ACTIVE) {
            throw new common_1.BadRequestException('Product is not available for purchase');
        }
        if (product.stock_quantity !== null && product.stock_quantity < dto.quantity) {
            throw new common_1.BadRequestException('Insufficient stock available');
        }
        if (dto.quantity < product.min_purchase_quantity) {
            throw new common_1.BadRequestException(`Minimum purchase quantity is ${product.min_purchase_quantity}`);
        }
        if (product.max_purchase_quantity &&
            dto.quantity > product.max_purchase_quantity) {
            throw new common_1.BadRequestException(`Maximum purchase quantity is ${product.max_purchase_quantity}`);
        }
        const unitPrice = new decimal_js_1.default(product.discount_price || product.price);
        const subtotal = unitPrice.times(dto.quantity);
        const shippingCost = new decimal_js_1.default(product.shipping_cost || 0);
        const totalAmount = subtotal.plus(shippingCost);
        const commissionPercentage = new decimal_js_1.default(partner.commission_percentage);
        const fixedCommission = new decimal_js_1.default(partner.fixed_commission);
        let platformRevenue;
        if (partner.commission_model === 'revenue_share') {
            platformRevenue = totalAmount.times(commissionPercentage.dividedBy(100));
        }
        else if (partner.commission_model === 'fixed_fee') {
            platformRevenue = fixedCommission;
        }
        else {
            platformRevenue = totalAmount
                .times(commissionPercentage.dividedBy(100))
                .plus(fixedCommission);
        }
        const partnerPayout = totalAmount.minus(platformRevenue);
        const reference = `MPT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
        const transaction = this.transactionRepository.create({
            reference,
            user_id: userId,
            partner_id: partner.partner_id,
            product_id: product.product_id,
            product_name: product.name,
            quantity: dto.quantity,
            unit_price: unitPrice.toNumber(),
            subtotal: subtotal.toNumber(),
            shipping_cost: shippingCost.toNumber(),
            total_amount: totalAmount.toNumber(),
            currency: product.currency,
            commission_amount: platformRevenue.toNumber(),
            commission_percentage: commissionPercentage.toNumber(),
            partner_payout: partnerPayout.toNumber(),
            platform_revenue: platformRevenue.toNumber(),
            status: partner_transaction_entity_1.TransactionStatus.PENDING,
            payment_status: 'pending',
            customer_email: (_a = dto.customer_details) === null || _a === void 0 ? void 0 : _a.email,
            customer_phone: (_b = dto.customer_details) === null || _b === void 0 ? void 0 : _b.phone,
            customer_details: dto.customer_details,
            shipping_address: dto.shipping_address,
            product_data: product,
            metadata: dto.metadata,
        });
        await this.transactionRepository.save(transaction);
        try {
            const paymentResult = await this.walletService.debit({
                user_id: userId,
                amount: totalAmount.toNumber(),
                currency: product.currency,
                description: `Purchase: ${product.name}`,
                reference: reference,
                metadata: {
                    transaction_id: transaction.transaction_id,
                    product_id: product.product_id,
                    partner_id: partner.partner_id,
                },
            });
            transaction.payment_transaction_id = paymentResult.transaction_id;
            transaction.payment_status = 'completed';
            transaction.status = partner_transaction_entity_1.TransactionStatus.PROCESSING;
            await this.transactionRepository.save(transaction);
            await this.updatePartnerMetrics(partner.partner_id, {
                total_transactions: () => 'total_transactions + 1',
                total_volume: () => `total_volume + ${totalAmount.toNumber()}`,
                total_commission_earned: () => `total_commission_earned + ${platformRevenue.toNumber()}`,
                pending_settlement_amount: () => `pending_settlement_amount + ${partnerPayout.toNumber()}`,
            });
            await this.productRepository.update({ product_id: product.product_id }, {
                sold_count: () => `sold_count + ${dto.quantity}`,
                total_revenue: () => `total_revenue + ${totalAmount.toNumber()}`,
                stock_quantity: product.stock_quantity !== null
                    ? () => `stock_quantity - ${dto.quantity}`
                    : undefined,
            });
            if (partner.integration_type === partner_entity_1.IntegrationType.API) {
                await this.processPartnerAPITransaction(transaction, partner, product);
            }
            await this.notificationService.send({
                user_id: userId,
                title: 'Purchase Successful',
                body: `Your purchase of ${product.name} has been confirmed. Reference: ${reference}`,
                type: 'marketplace_purchase',
                data: {
                    transaction_id: transaction.transaction_id,
                    reference,
                },
            });
            this.logger.log(`Marketplace transaction ${transaction.transaction_id} created for user ${userId}`);
            return transaction;
        }
        catch (error) {
            transaction.status = partner_transaction_entity_1.TransactionStatus.FAILED;
            transaction.payment_status = 'failed';
            transaction.error_message = error.message;
            await this.transactionRepository.save(transaction);
            throw error;
        }
    }
    async processPartnerAPITransaction(transaction, partner, product) {
        try {
            this.logger.log(`Processing API transaction ${transaction.transaction_id} with partner ${partner.name}`);
            const apiRequest = {
                transaction_id: transaction.transaction_id,
                reference: transaction.reference,
                product_id: product.external_product_id,
                amount: transaction.total_amount,
                currency: transaction.currency,
                customer: transaction.customer_details,
                metadata: transaction.metadata,
            };
            transaction.api_request = apiRequest;
            const apiResponse = {
                status: 'success',
                external_transaction_id: `EXT-${Date.now()}`,
                message: 'Order created successfully',
            };
            transaction.api_response = apiResponse;
            transaction.external_transaction_id = apiResponse.external_transaction_id;
            transaction.status = partner_transaction_entity_1.TransactionStatus.COMPLETED;
            transaction.completed_at = new Date();
            await this.transactionRepository.save(transaction);
            this.logger.log(`API transaction ${transaction.transaction_id} completed successfully`);
        }
        catch (error) {
            this.logger.error(`Error processing API transaction ${transaction.transaction_id}:`, error);
            transaction.status = partner_transaction_entity_1.TransactionStatus.FAILED;
            transaction.failed_at = new Date();
            transaction.error_message = error.message;
            transaction.error_details = {
                error: error.toString(),
                stack: error.stack,
            };
            await this.transactionRepository.save(transaction);
            await this.refundTransaction(transaction.transaction_id, 'API processing failed');
        }
    }
    async getUserTransactions(userId, page = 1, limit = 20) {
        const [transactions, total] = await this.transactionRepository.findAndCount({
            where: { user_id: userId },
            relations: ['partner', 'product'],
            order: { created_at: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        return {
            data: transactions,
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit),
            },
        };
    }
    async getTransaction(reference, userId) {
        const where = { reference };
        if (userId) {
            where.user_id = userId;
        }
        const transaction = await this.transactionRepository.findOne({
            where,
            relations: ['partner', 'product'],
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        return transaction;
    }
    async refundTransaction(transactionId, reason) {
        const transaction = await this.transactionRepository.findOne({
            where: { transaction_id: transactionId },
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        if (transaction.is_refunded) {
            throw new common_1.BadRequestException('Transaction already refunded');
        }
        await this.walletService.credit({
            user_id: transaction.user_id,
            amount: transaction.total_amount,
            currency: transaction.currency,
            description: `Refund: ${transaction.product_name}`,
            reference: `REFUND-${transaction.reference}`,
            metadata: {
                original_transaction_id: transaction.transaction_id,
                refund_reason: reason,
            },
        });
        transaction.is_refunded = true;
        transaction.refund_amount = transaction.total_amount;
        transaction.refund_reason = reason;
        transaction.refunded_at = new Date();
        transaction.status = partner_transaction_entity_1.TransactionStatus.REFUNDED;
        await this.transactionRepository.save(transaction);
        await this.updatePartnerMetrics(transaction.partner_id, {
            pending_settlement_amount: () => `pending_settlement_amount - ${transaction.partner_payout}`,
        });
        this.logger.log(`Transaction ${transactionId} refunded. Reason: ${reason}`);
        return transaction;
    }
    async addReview(userId, transactionId, rating, comment) {
        const transaction = await this.transactionRepository.findOne({
            where: { transaction_id: transactionId, user_id: userId },
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        if (transaction.is_reviewed) {
            throw new common_1.BadRequestException('You have already reviewed this product');
        }
        const review = this.reviewRepository.create({
            product_id: transaction.product_id,
            partner_id: transaction.partner_id,
            user_id: userId,
            transaction_id: transactionId,
            rating,
            comment,
            is_verified_purchase: true,
            status: product_review_entity_1.ReviewStatus.PENDING,
        });
        await this.reviewRepository.save(review);
        transaction.is_reviewed = true;
        transaction.rating = rating;
        transaction.review_comment = comment;
        transaction.reviewed_at = new Date();
        await this.transactionRepository.save(transaction);
        this.logger.log(`Review added for transaction ${transactionId}`);
        return review;
    }
    async getProductReviews(productId, page = 1, limit = 20) {
        const [reviews, total] = await this.reviewRepository.findAndCount({
            where: {
                product_id: productId,
                status: product_review_entity_1.ReviewStatus.APPROVED
            },
            order: { created_at: 'DESC' },
            skip: (page - 1) * limit,
            take: limit,
        });
        const avgRating = await this.reviewRepository
            .createQueryBuilder('review')
            .select('AVG(review.rating)', 'average')
            .where('review.product_id = :productId', { productId })
            .andWhere('review.status = :status', { status: product_review_entity_1.ReviewStatus.APPROVED })
            .getRawOne();
        return {
            data: reviews,
            pagination: {
                page,
                limit,
                total,
                total_pages: Math.ceil(total / limit),
            },
            average_rating: parseFloat(avgRating.average) || 0,
        };
    }
    async getCategories() {
        return this.categoryRepository.find({
            where: { is_active: true },
            order: {
                display_order: 'ASC',
                name: 'ASC',
            },
        });
    }
    async updatePartnerMetrics(partnerId, updates) {
        await this.partnerRepository
            .createQueryBuilder()
            .update()
            .set(updates)
            .where('partner_id = :partnerId', { partnerId })
            .execute();
    }
    async generateSettlements(startDate, endDate) {
        const partners = await this.partnerRepository.find({
            where: { status: partner_entity_1.PartnerStatus.ACTIVE },
        });
        const settlements = [];
        for (const partner of partners) {
            const transactions = await this.transactionRepository.find({
                where: {
                    partner_id: partner.partner_id,
                    status: partner_transaction_entity_1.TransactionStatus.COMPLETED,
                    is_settled: false,
                    completed_at: (0, typeorm_2.Between)(startDate, endDate),
                },
            });
            if (transactions.length === 0) {
                continue;
            }
            const totalAmount = transactions.reduce((sum, t) => sum + Number(t.total_amount), 0);
            const totalCommission = transactions.reduce((sum, t) => sum + Number(t.platform_revenue), 0);
            const totalPayout = transactions.reduce((sum, t) => sum + Number(t.partner_payout), 0);
            const settlement = this.settlementRepository.create({
                reference: `SETTLE-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`,
                partner_id: partner.partner_id,
                partner_name: partner.name,
                period_start_date: startDate,
                period_end_date: endDate,
                settlement_date: new Date(endDate.getTime() + partner.settlement_delay_days * 24 * 60 * 60 * 1000),
                transaction_count: transactions.length,
                gross_transaction_amount: totalAmount,
                platform_commission: totalCommission,
                partner_payout: totalPayout,
                net_settlement_amount: totalPayout,
                currency: transactions[0].currency,
                transaction_ids: transactions.map((t) => t.transaction_id),
                status: partner_settlement_entity_1.SettlementStatus.PENDING,
            });
            await this.settlementRepository.save(settlement);
            settlements.push(settlement);
            this.logger.log(`Settlement ${settlement.reference} generated for partner ${partner.name}`);
        }
        return settlements;
    }
};
exports.MarketplaceService = MarketplaceService;
exports.MarketplaceService = MarketplaceService = MarketplaceService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(partner_entity_1.MarketplacePartnerEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.MarketplaceProductEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(partner_transaction_entity_1.PartnerTransactionEntity)),
    __param(3, (0, typeorm_1.InjectRepository)(product_review_entity_1.ProductReviewEntity)),
    __param(4, (0, typeorm_1.InjectRepository)(marketplace_category_entity_1.MarketplaceCategoryEntity)),
    __param(5, (0, typeorm_1.InjectRepository)(partner_settlement_entity_1.PartnerSettlementEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object, typeof (_d = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _d : Object, typeof (_e = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _e : Object, typeof (_f = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _f : Object, typeof (_g = typeof wallet_service_1.WalletService !== "undefined" && wallet_service_1.WalletService) === "function" ? _g : Object, typeof (_h = typeof notification_service_1.NotificationService !== "undefined" && notification_service_1.NotificationService) === "function" ? _h : Object])
], MarketplaceService);
//# sourceMappingURL=marketplace.service.js.map