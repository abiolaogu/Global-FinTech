import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNumber,
  IsOptional,
  IsBoolean,
  IsObject,
  IsInt,
  Min,
  Max,
  IsEmail,
  IsPhoneNumber,
  MinLength,
  MaxLength,
  IsEnum,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ProductStatus } from '../entities/product.entity';

export class ListPartnersQueryDto {
  @ApiPropertyOptional({ description: 'Filter by country (ISO code)' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Filter by partner category' })
  @IsOptional()
  @IsString()
  category?: string;
}

export class ListProductsQueryDto {
  @ApiPropertyOptional({ description: 'Filter by category' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Filter by partner ID' })
  @IsOptional()
  @IsString()
  partner_id?: string;

  @ApiPropertyOptional({ description: 'Filter by country (ISO code)' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Minimum price' })
  @IsOptional()
  @IsString()
  min_price?: string;

  @ApiPropertyOptional({ description: 'Maximum price' })
  @IsOptional()
  @IsString()
  max_price?: string;

  @ApiPropertyOptional({ description: 'Show only featured products' })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  is_featured?: boolean;

  @ApiPropertyOptional({ description: 'Search query' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ description: 'Product status filter', enum: ProductStatus })
  @IsOptional()
  @IsEnum(ProductStatus)
  status?: ProductStatus;

  @ApiPropertyOptional({ description: 'Page number', default: 1 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  page?: number;

  @ApiPropertyOptional({ description: 'Items per page', default: 20 })
  @IsOptional()
  @IsInt()
  @Type(() => Number)
  @Min(1)
  @Max(100)
  limit?: number;
}

export class CustomerDetailsDto {
  @ApiPropertyOptional({ description: 'Customer email' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: 'Customer phone number' })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: 'Customer name' })
  @IsOptional()
  @IsString()
  name?: string;
}

export class ShippingAddressDto {
  @ApiProperty({ description: 'Street address' })
  @IsString()
  @MinLength(5)
  @MaxLength(255)
  street: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  city: string;

  @ApiProperty({ description: 'State/Province' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  state: string;

  @ApiProperty({ description: 'Country (ISO code)' })
  @IsString()
  @MinLength(2)
  @MaxLength(2)
  country: string;

  @ApiProperty({ description: 'Postal/ZIP code' })
  @IsString()
  @MinLength(3)
  @MaxLength(20)
  postal_code: string;
}

export class PurchaseProductBodyDto {
  @ApiProperty({ description: 'Quantity to purchase', default: 1 })
  @IsInt()
  @Min(1)
  quantity: number;

  @ApiPropertyOptional({ description: 'Customer details', type: CustomerDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => CustomerDetailsDto)
  customer_details?: CustomerDetailsDto;

  @ApiPropertyOptional({ description: 'Shipping address (for physical products)', type: ShippingAddressDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => ShippingAddressDto)
  shipping_address?: ShippingAddressDto;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class AddReviewDto {
  @ApiProperty({ description: 'Rating (1-5 stars)', minimum: 1, maximum: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiProperty({ description: 'Review comment' })
  @IsString()
  @MinLength(10)
  @MaxLength(1000)
  comment: string;

  @ApiPropertyOptional({ description: 'Review title' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;
}

export class CreatePartnerDto {
  @ApiProperty({ description: 'Partner name' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Partner slug (URL-friendly)' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  slug: string;

  @ApiPropertyOptional({ description: 'Partner description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Partner category' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Integration type (api, redirect, affiliate, white_label, embedded)' })
  @IsString()
  integration_type: string;

  @ApiProperty({ description: 'Countries where partner is available', type: [String] })
  @IsString({ each: true })
  countries: string[];

  @ApiProperty({ description: 'Contact email' })
  @IsEmail()
  contact_email: string;

  @ApiPropertyOptional({ description: 'Contact phone' })
  @IsOptional()
  @IsString()
  contact_phone?: string;

  @ApiPropertyOptional({ description: 'Website URL' })
  @IsOptional()
  @IsString()
  website_url?: string;

  @ApiPropertyOptional({ description: 'Commission percentage', minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  commission_percentage?: number;

  @ApiPropertyOptional({ description: 'Fixed commission amount' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  fixed_commission?: number;

  @ApiPropertyOptional({ description: 'Commission model (revenue_share, fixed_fee, hybrid)' })
  @IsOptional()
  @IsString()
  commission_model?: string;
}

export class CreateProductDto {
  @ApiProperty({ description: 'Partner ID' })
  @IsString()
  partner_id: string;

  @ApiProperty({ description: 'Product name' })
  @IsString()
  @MinLength(2)
  @MaxLength(255)
  name: string;

  @ApiProperty({ description: 'Product slug (URL-friendly)' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  slug: string;

  @ApiPropertyOptional({ description: 'Product description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Product type (physical, digital, service, subscription, utility, booking)' })
  @IsString()
  product_type: string;

  @ApiProperty({ description: 'Pricing model (fixed, variable, tiered, percentage, free)' })
  @IsString()
  pricing_model: string;

  @ApiPropertyOptional({ description: 'Price' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ description: 'Currency (ISO code)', default: 'USD' })
  @IsString()
  @MinLength(3)
  @MaxLength(3)
  currency: string;

  @ApiProperty({ description: 'Category' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Countries where product is available', type: [String] })
  @IsString({ each: true })
  countries: string[];

  @ApiPropertyOptional({ description: 'Stock quantity (for physical products)' })
  @IsOptional()
  @IsInt()
  @Min(0)
  stock_quantity?: number;

  @ApiPropertyOptional({ description: 'Features list', type: [String] })
  @IsOptional()
  @IsString({ each: true })
  features?: string[];

  @ApiPropertyOptional({ description: 'Product tags', type: [String] })
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];
}
