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
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateProductDto = exports.CreatePartnerDto = exports.AddReviewDto = exports.PurchaseProductBodyDto = exports.ShippingAddressDto = exports.CustomerDetailsDto = exports.ListProductsQueryDto = exports.ListPartnersQueryDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const class_validator_1 = require("class-validator");
const class_transformer_1 = require("class-transformer");
const product_entity_1 = require("../entities/product.entity");
class ListPartnersQueryDto {
}
exports.ListPartnersQueryDto = ListPartnersQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by country (ISO code)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListPartnersQueryDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by partner category' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListPartnersQueryDto.prototype, "category", void 0);
class ListProductsQueryDto {
}
exports.ListProductsQueryDto = ListProductsQueryDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by category' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListProductsQueryDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by partner ID' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListProductsQueryDto.prototype, "partner_id", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Filter by country (ISO code)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListProductsQueryDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Minimum price' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListProductsQueryDto.prototype, "min_price", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Maximum price' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListProductsQueryDto.prototype, "max_price", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Show only featured products' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    (0, class_transformer_1.Type)(() => Boolean),
    __metadata("design:type", Boolean)
], ListProductsQueryDto.prototype, "is_featured", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Search query' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], ListProductsQueryDto.prototype, "search", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Product status filter', enum: product_entity_1.ProductStatus }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(product_entity_1.ProductStatus),
    __metadata("design:type", String)
], ListProductsQueryDto.prototype, "status", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Page number', default: 1 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], ListProductsQueryDto.prototype, "page", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Items per page', default: 20 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_transformer_1.Type)(() => Number),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], ListProductsQueryDto.prototype, "limit", void 0);
class CustomerDetailsDto {
}
exports.CustomerDetailsDto = CustomerDetailsDto;
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer email' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CustomerDetailsDto.prototype, "email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer phone number' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomerDetailsDto.prototype, "phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer name' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CustomerDetailsDto.prototype, "name", void 0);
class ShippingAddressDto {
}
exports.ShippingAddressDto = ShippingAddressDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Street address' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(5),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], ShippingAddressDto.prototype, "street", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'City' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], ShippingAddressDto.prototype, "city", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'State/Province' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], ShippingAddressDto.prototype, "state", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Country (ISO code)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(2),
    __metadata("design:type", String)
], ShippingAddressDto.prototype, "country", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Postal/ZIP code' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(20),
    __metadata("design:type", String)
], ShippingAddressDto.prototype, "postal_code", void 0);
class PurchaseProductBodyDto {
}
exports.PurchaseProductBodyDto = PurchaseProductBodyDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Quantity to purchase', default: 1 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    __metadata("design:type", Number)
], PurchaseProductBodyDto.prototype, "quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Customer details', type: CustomerDetailsDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => CustomerDetailsDto),
    __metadata("design:type", CustomerDetailsDto)
], PurchaseProductBodyDto.prototype, "customer_details", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Shipping address (for physical products)', type: ShippingAddressDto }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.ValidateNested)(),
    (0, class_transformer_1.Type)(() => ShippingAddressDto),
    __metadata("design:type", ShippingAddressDto)
], PurchaseProductBodyDto.prototype, "shipping_address", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Additional metadata' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsObject)(),
    __metadata("design:type", Object)
], PurchaseProductBodyDto.prototype, "metadata", void 0);
class AddReviewDto {
}
exports.AddReviewDto = AddReviewDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Rating (1-5 stars)', minimum: 1, maximum: 5 }),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(5),
    __metadata("design:type", Number)
], AddReviewDto.prototype, "rating", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Review comment' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(10),
    (0, class_validator_1.MaxLength)(1000),
    __metadata("design:type", String)
], AddReviewDto.prototype, "comment", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Review title' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], AddReviewDto.prototype, "title", void 0);
class CreatePartnerDto {
}
exports.CreatePartnerDto = CreatePartnerDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Partner name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreatePartnerDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Partner slug (URL-friendly)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreatePartnerDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Partner description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePartnerDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Partner category' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePartnerDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Integration type (api, redirect, affiliate, white_label, embedded)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePartnerDto.prototype, "integration_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Countries where partner is available', type: [String] }),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreatePartnerDto.prototype, "countries", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Contact email' }),
    (0, class_validator_1.IsEmail)(),
    __metadata("design:type", String)
], CreatePartnerDto.prototype, "contact_email", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Contact phone' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePartnerDto.prototype, "contact_phone", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Website URL' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePartnerDto.prototype, "website_url", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Commission percentage', minimum: 0, maximum: 100 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    (0, class_validator_1.Max)(100),
    __metadata("design:type", Number)
], CreatePartnerDto.prototype, "commission_percentage", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Fixed commission amount' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreatePartnerDto.prototype, "fixed_commission", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Commission model (revenue_share, fixed_fee, hybrid)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreatePartnerDto.prototype, "commission_model", void 0);
class CreateProductDto {
}
exports.CreateProductDto = CreateProductDto;
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Partner ID' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "partner_id", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product name' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(255),
    __metadata("design:type", String)
], CreateProductDto.prototype, "name", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product slug (URL-friendly)' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(2),
    (0, class_validator_1.MaxLength)(100),
    __metadata("design:type", String)
], CreateProductDto.prototype, "slug", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Product description' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "description", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Product type (physical, digital, service, subscription, utility, booking)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "product_type", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Pricing model (fixed, variable, tiered, percentage, free)' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "pricing_model", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Price' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsNumber)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "price", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Currency (ISO code)', default: 'USD' }),
    (0, class_validator_1.IsString)(),
    (0, class_validator_1.MinLength)(3),
    (0, class_validator_1.MaxLength)(3),
    __metadata("design:type", String)
], CreateProductDto.prototype, "currency", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Category' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateProductDto.prototype, "category", void 0);
__decorate([
    (0, swagger_1.ApiProperty)({ description: 'Countries where product is available', type: [String] }),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateProductDto.prototype, "countries", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Stock quantity (for physical products)' }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(0),
    __metadata("design:type", Number)
], CreateProductDto.prototype, "stock_quantity", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Features list', type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateProductDto.prototype, "features", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ description: 'Product tags', type: [String] }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsString)({ each: true }),
    __metadata("design:type", Array)
], CreateProductDto.prototype, "tags", void 0);
//# sourceMappingURL=marketplace.dto.js.map