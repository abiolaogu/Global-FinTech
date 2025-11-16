import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { MarketplaceService, PurchaseProductDto, ListProductsFilters } from './marketplace.service';
import {
  ListPartnersQueryDto,
  ListProductsQueryDto,
  PurchaseProductBodyDto,
  AddReviewDto,
} from './dto/marketplace.dto';

@ApiTags('Marketplace')
@Controller('marketplace')
export class MarketplaceController {
  constructor(private readonly marketplaceService: MarketplaceService) {}

  @Get('categories')
  @ApiOperation({ summary: 'Get all marketplace categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async getCategories() {
    const categories = await this.marketplaceService.getCategories();
    return {
      success: true,
      data: categories,
    };
  }

  @Get('partners')
  @ApiOperation({ summary: 'Get all marketplace partners' })
  @ApiResponse({ status: 200, description: 'Partners retrieved successfully' })
  async getPartners(@Query() query: ListPartnersQueryDto) {
    const partners = await this.marketplaceService.getPartners(
      query.country,
      query.category,
    );

    return {
      success: true,
      data: partners,
    };
  }

  @Get('partners/:slug')
  @ApiOperation({ summary: 'Get partner details by slug' })
  @ApiResponse({ status: 200, description: 'Partner retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Partner not found' })
  async getPartner(@Param('slug') slug: string) {
    const partner = await this.marketplaceService.getPartnerBySlug(slug);
    return {
      success: true,
      data: partner,
    };
  }

  @Get('products')
  @ApiOperation({ summary: 'List marketplace products with filters' })
  @ApiResponse({ status: 200, description: 'Products retrieved successfully' })
  async listProducts(@Query() query: ListProductsQueryDto) {
    const filters: ListProductsFilters = {
      category: query.category,
      partner_id: query.partner_id,
      country: query.country,
      min_price: query.min_price ? parseFloat(query.min_price) : undefined,
      max_price: query.max_price ? parseFloat(query.max_price) : undefined,
      is_featured: query.is_featured,
      search: query.search,
    };

    const result = await this.marketplaceService.listProducts(
      filters,
      query.page || 1,
      query.limit || 20,
    );

    return {
      success: true,
      ...result,
    };
  }

  @Get('products/:identifier')
  @ApiOperation({ summary: 'Get product details by ID or slug' })
  @ApiResponse({ status: 200, description: 'Product retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async getProduct(@Param('identifier') identifier: string) {
    const product = await this.marketplaceService.getProduct(identifier);
    return {
      success: true,
      data: product,
    };
  }

  @Post('products/:identifier/purchase')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Purchase a marketplace product' })
  @ApiResponse({ status: 200, description: 'Product purchased successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Product not found' })
  async purchaseProduct(
    @Request() req,
    @Param('identifier') identifier: string,
    @Body() dto: PurchaseProductBodyDto,
  ) {
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

  @Get('transactions')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user marketplace transactions' })
  @ApiResponse({ status: 200, description: 'Transactions retrieved successfully' })
  async getTransactions(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const result = await this.marketplaceService.getUserTransactions(
      req.user.user_id,
      page,
      limit,
    );

    return {
      success: true,
      ...result,
    };
  }

  @Get('transactions/:reference')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get transaction details by reference' })
  @ApiResponse({ status: 200, description: 'Transaction retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async getTransaction(@Request() req, @Param('reference') reference: string) {
    const transaction = await this.marketplaceService.getTransaction(
      reference,
      req.user.user_id,
    );

    return {
      success: true,
      data: transaction,
    };
  }

  @Post('transactions/:transaction_id/review')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Add review for purchased product' })
  @ApiResponse({ status: 200, description: 'Review added successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 404, description: 'Transaction not found' })
  async addReview(
    @Request() req,
    @Param('transaction_id') transactionId: string,
    @Body() dto: AddReviewDto,
  ) {
    const review = await this.marketplaceService.addReview(
      req.user.user_id,
      transactionId,
      dto.rating,
      dto.comment,
    );

    return {
      success: true,
      message: 'Review submitted successfully. It will be published after moderation.',
      data: review,
    };
  }

  @Get('products/:product_id/reviews')
  @ApiOperation({ summary: 'Get product reviews' })
  @ApiResponse({ status: 200, description: 'Reviews retrieved successfully' })
  async getProductReviews(
    @Param('product_id') productId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    const result = await this.marketplaceService.getProductReviews(
      productId,
      page,
      limit,
    );

    return {
      success: true,
      ...result,
    };
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured products' })
  @ApiResponse({ status: 200, description: 'Featured products retrieved successfully' })
  async getFeaturedProducts(
    @Query('country') country?: string,
    @Query('limit') limit: number = 10,
  ) {
    const result = await this.marketplaceService.listProducts(
      { is_featured: true, country },
      1,
      limit,
    );

    return {
      success: true,
      data: result.data,
    };
  }

  @Get('trending')
  @ApiOperation({ summary: 'Get trending products (most sold)' })
  @ApiResponse({ status: 200, description: 'Trending products retrieved successfully' })
  async getTrendingProducts(
    @Query('country') country?: string,
    @Query('limit') limit: number = 10,
  ) {
    const result = await this.marketplaceService.listProducts(
      { country },
      1,
      limit,
    );

    return {
      success: true,
      data: result.data,
    };
  }
}
