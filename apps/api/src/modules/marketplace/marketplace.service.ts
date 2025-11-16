import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, MoreThan, LessThan } from 'typeorm';
import { MarketplacePartnerEntity, PartnerStatus, IntegrationType } from './entities/partner.entity';
import { MarketplaceProductEntity, ProductStatus } from './entities/product.entity';
import { PartnerTransactionEntity, TransactionStatus } from './entities/partner-transaction.entity';
import { ProductReviewEntity, ReviewStatus } from './entities/product-review.entity';
import { MarketplaceCategoryEntity } from './entities/marketplace-category.entity';
import { PartnerSettlementEntity, SettlementStatus } from './entities/partner-settlement.entity';
import { WalletService } from '../wallets/wallet.service';
import { NotificationService } from '../notifications/notification.service';
import Decimal from 'decimal.js';

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

@Injectable()
export class MarketplaceService {
  private readonly logger = new Logger(MarketplaceService.name);

  constructor(
    @InjectRepository(MarketplacePartnerEntity)
    private partnerRepository: Repository<MarketplacePartnerEntity>,
    @InjectRepository(MarketplaceProductEntity)
    private productRepository: Repository<MarketplaceProductEntity>,
    @InjectRepository(PartnerTransactionEntity)
    private transactionRepository: Repository<PartnerTransactionEntity>,
    @InjectRepository(ProductReviewEntity)
    private reviewRepository: Repository<ProductReviewEntity>,
    @InjectRepository(MarketplaceCategoryEntity)
    private categoryRepository: Repository<MarketplaceCategoryEntity>,
    @InjectRepository(PartnerSettlementEntity)
    private settlementRepository: Repository<PartnerSettlementEntity>,
    private walletService: WalletService,
    private notificationService: NotificationService,
  ) {}

  /**
   * Get all active marketplace partners
   */
  async getPartners(country?: string, category?: string) {
    const query = this.partnerRepository
      .createQueryBuilder('partner')
      .where('partner.status = :status', { status: PartnerStatus.ACTIVE });

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

  /**
   * Get partner by slug
   */
  async getPartnerBySlug(slug: string) {
    const partner = await this.partnerRepository.findOne({
      where: { slug, status: PartnerStatus.ACTIVE },
      relations: ['products'],
    });

    if (!partner) {
      throw new NotFoundException(`Partner with slug "${slug}" not found`);
    }

    return partner;
  }

  /**
   * List products with filters
   */
  async listProducts(filters: ListProductsFilters, page = 1, limit = 20) {
    const query = this.productRepository
      .createQueryBuilder('product')
      .leftJoinAndSelect('product.partner', 'partner')
      .where('product.status = :status', {
        status: filters.status || ProductStatus.ACTIVE
      })
      .andWhere('partner.status = :partnerStatus', {
        partnerStatus: PartnerStatus.ACTIVE
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
      query.andWhere(
        '(product.name ILIKE :search OR product.description ILIKE :search OR ARRAY_TO_STRING(product.tags, \',\') ILIKE :search)',
        { search: `%${filters.search}%` }
      );
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

  /**
   * Get product by ID or slug
   */
  async getProduct(identifier: string) {
    const product = await this.productRepository.findOne({
      where: [
        { product_id: identifier },
        { slug: identifier },
      ],
      relations: ['partner'],
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Increment view count
    await this.productRepository.increment(
      { product_id: product.product_id },
      'view_count',
      1,
    );

    return product;
  }

  /**
   * Purchase a product
   */
  async purchaseProduct(userId: string, dto: PurchaseProductDto) {
    const product = await this.getProduct(dto.product_id);
    const partner = product.partner;

    // Check product status
    if (product.status !== ProductStatus.ACTIVE) {
      throw new BadRequestException('Product is not available for purchase');
    }

    // Check stock for physical products
    if (product.stock_quantity !== null && product.stock_quantity < dto.quantity) {
      throw new BadRequestException('Insufficient stock available');
    }

    // Check quantity limits
    if (dto.quantity < product.min_purchase_quantity) {
      throw new BadRequestException(
        `Minimum purchase quantity is ${product.min_purchase_quantity}`
      );
    }

    if (
      product.max_purchase_quantity &&
      dto.quantity > product.max_purchase_quantity
    ) {
      throw new BadRequestException(
        `Maximum purchase quantity is ${product.max_purchase_quantity}`
      );
    }

    // Calculate amounts
    const unitPrice = new Decimal(product.discount_price || product.price);
    const subtotal = unitPrice.times(dto.quantity);
    const shippingCost = new Decimal(product.shipping_cost || 0);
    const totalAmount = subtotal.plus(shippingCost);

    // Calculate commission
    const commissionPercentage = new Decimal(partner.commission_percentage);
    const fixedCommission = new Decimal(partner.fixed_commission);

    let platformRevenue: Decimal;
    if (partner.commission_model === 'revenue_share') {
      platformRevenue = totalAmount.times(commissionPercentage.dividedBy(100));
    } else if (partner.commission_model === 'fixed_fee') {
      platformRevenue = fixedCommission;
    } else {
      // hybrid
      platformRevenue = totalAmount
        .times(commissionPercentage.dividedBy(100))
        .plus(fixedCommission);
    }

    const partnerPayout = totalAmount.minus(platformRevenue);

    // Generate reference
    const reference = `MPT-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    // Create transaction record
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
      status: TransactionStatus.PENDING,
      payment_status: 'pending',
      customer_email: dto.customer_details?.email,
      customer_phone: dto.customer_details?.phone,
      customer_details: dto.customer_details,
      shipping_address: dto.shipping_address,
      product_data: product,
      metadata: dto.metadata,
    });

    await this.transactionRepository.save(transaction);

    // Deduct from user's wallet
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
      transaction.status = TransactionStatus.PROCESSING;

      await this.transactionRepository.save(transaction);

      // Update partner metrics
      await this.updatePartnerMetrics(partner.partner_id, {
        total_transactions: () => 'total_transactions + 1',
        total_volume: () => `total_volume + ${totalAmount.toNumber()}`,
        total_commission_earned: () =>
          `total_commission_earned + ${platformRevenue.toNumber()}`,
        pending_settlement_amount: () =>
          `pending_settlement_amount + ${partnerPayout.toNumber()}`,
      });

      // Update product metrics
      await this.productRepository.update(
        { product_id: product.product_id },
        {
          sold_count: () => `sold_count + ${dto.quantity}`,
          total_revenue: () => `total_revenue + ${totalAmount.toNumber()}`,
          stock_quantity:
            product.stock_quantity !== null
              ? () => `stock_quantity - ${dto.quantity}`
              : undefined,
        },
      );

      // Process with partner API if deep integration
      if (partner.integration_type === IntegrationType.API) {
        await this.processPartnerAPITransaction(transaction, partner, product);
      }

      // Send notifications
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

      this.logger.log(
        `Marketplace transaction ${transaction.transaction_id} created for user ${userId}`
      );

      return transaction;
    } catch (error) {
      // Mark transaction as failed
      transaction.status = TransactionStatus.FAILED;
      transaction.payment_status = 'failed';
      transaction.error_message = error.message;
      await this.transactionRepository.save(transaction);

      throw error;
    }
  }

  /**
   * Process transaction with partner API
   */
  private async processPartnerAPITransaction(
    transaction: PartnerTransactionEntity,
    partner: MarketplacePartnerEntity,
    product: MarketplaceProductEntity,
  ) {
    // This is a placeholder - actual implementation would call partner's API
    // Example: For insurance, call insurance partner's API to create policy
    // For bill payment, call biller's API to process payment
    // For e-commerce, call merchant's API to create order

    try {
      this.logger.log(
        `Processing API transaction ${transaction.transaction_id} with partner ${partner.name}`
      );

      // Simulate API call
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

      // TODO: Actual HTTP call to partner API
      // const response = await this.httpService.post(
      //   `${partner.api_base_url}${product.api_endpoint}`,
      //   apiRequest,
      //   {
      //     headers: {
      //       'Authorization': `Bearer ${partner.api_key}`,
      //       'Content-Type': 'application/json',
      //     },
      //   },
      // ).toPromise();

      // Simulate successful response
      const apiResponse = {
        status: 'success',
        external_transaction_id: `EXT-${Date.now()}`,
        message: 'Order created successfully',
      };

      transaction.api_response = apiResponse;
      transaction.external_transaction_id = apiResponse.external_transaction_id;
      transaction.status = TransactionStatus.COMPLETED;
      transaction.completed_at = new Date();

      await this.transactionRepository.save(transaction);

      this.logger.log(
        `API transaction ${transaction.transaction_id} completed successfully`
      );
    } catch (error) {
      this.logger.error(
        `Error processing API transaction ${transaction.transaction_id}:`,
        error
      );

      transaction.status = TransactionStatus.FAILED;
      transaction.failed_at = new Date();
      transaction.error_message = error.message;
      transaction.error_details = {
        error: error.toString(),
        stack: error.stack,
      };

      await this.transactionRepository.save(transaction);

      // Refund user
      await this.refundTransaction(transaction.transaction_id, 'API processing failed');
    }
  }

  /**
   * Get user's marketplace transactions
   */
  async getUserTransactions(userId: string, page = 1, limit = 20) {
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

  /**
   * Get transaction by reference
   */
  async getTransaction(reference: string, userId?: string) {
    const where: any = { reference };
    if (userId) {
      where.user_id = userId;
    }

    const transaction = await this.transactionRepository.findOne({
      where,
      relations: ['partner', 'product'],
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  /**
   * Refund a transaction
   */
  async refundTransaction(transactionId: string, reason: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { transaction_id: transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.is_refunded) {
      throw new BadRequestException('Transaction already refunded');
    }

    // Credit user's wallet
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

    // Update transaction
    transaction.is_refunded = true;
    transaction.refund_amount = transaction.total_amount;
    transaction.refund_reason = reason;
    transaction.refunded_at = new Date();
    transaction.status = TransactionStatus.REFUNDED;

    await this.transactionRepository.save(transaction);

    // Update partner metrics
    await this.updatePartnerMetrics(transaction.partner_id, {
      pending_settlement_amount: () =>
        `pending_settlement_amount - ${transaction.partner_payout}`,
    });

    this.logger.log(`Transaction ${transactionId} refunded. Reason: ${reason}`);

    return transaction;
  }

  /**
   * Add product review
   */
  async addReview(userId: string, transactionId: string, rating: number, comment: string) {
    const transaction = await this.transactionRepository.findOne({
      where: { transaction_id: transactionId, user_id: userId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.is_reviewed) {
      throw new BadRequestException('You have already reviewed this product');
    }

    const review = this.reviewRepository.create({
      product_id: transaction.product_id,
      partner_id: transaction.partner_id,
      user_id: userId,
      transaction_id: transactionId,
      rating,
      comment,
      is_verified_purchase: true,
      status: ReviewStatus.PENDING, // Requires moderation
    });

    await this.reviewRepository.save(review);

    // Mark transaction as reviewed
    transaction.is_reviewed = true;
    transaction.rating = rating;
    transaction.review_comment = comment;
    transaction.reviewed_at = new Date();
    await this.transactionRepository.save(transaction);

    this.logger.log(`Review added for transaction ${transactionId}`);

    return review;
  }

  /**
   * Get product reviews
   */
  async getProductReviews(productId: string, page = 1, limit = 20) {
    const [reviews, total] = await this.reviewRepository.findAndCount({
      where: {
        product_id: productId,
        status: ReviewStatus.APPROVED
      },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // Calculate average rating
    const avgRating = await this.reviewRepository
      .createQueryBuilder('review')
      .select('AVG(review.rating)', 'average')
      .where('review.product_id = :productId', { productId })
      .andWhere('review.status = :status', { status: ReviewStatus.APPROVED })
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

  /**
   * Get marketplace categories
   */
  async getCategories() {
    return this.categoryRepository.find({
      where: { is_active: true },
      order: {
        display_order: 'ASC',
        name: 'ASC',
      },
    });
  }

  /**
   * Update partner metrics (helper)
   */
  private async updatePartnerMetrics(
    partnerId: string,
    updates: Record<string, any>,
  ) {
    await this.partnerRepository
      .createQueryBuilder()
      .update()
      .set(updates)
      .where('partner_id = :partnerId', { partnerId })
      .execute();
  }

  /**
   * Generate partner settlement
   */
  async generateSettlements(startDate: Date, endDate: Date) {
    const partners = await this.partnerRepository.find({
      where: { status: PartnerStatus.ACTIVE },
    });

    const settlements = [];

    for (const partner of partners) {
      const transactions = await this.transactionRepository.find({
        where: {
          partner_id: partner.partner_id,
          status: TransactionStatus.COMPLETED,
          is_settled: false,
          completed_at: Between(startDate, endDate),
        },
      });

      if (transactions.length === 0) {
        continue;
      }

      const totalAmount = transactions.reduce(
        (sum, t) => sum + Number(t.total_amount),
        0,
      );
      const totalCommission = transactions.reduce(
        (sum, t) => sum + Number(t.platform_revenue),
        0,
      );
      const totalPayout = transactions.reduce(
        (sum, t) => sum + Number(t.partner_payout),
        0,
      );

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
        status: SettlementStatus.PENDING,
      });

      await this.settlementRepository.save(settlement);
      settlements.push(settlement);

      this.logger.log(
        `Settlement ${settlement.reference} generated for partner ${partner.name}`
      );
    }

    return settlements;
  }
}
