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
exports.ProductReviewEntity = exports.ReviewStatus = void 0;
const typeorm_1 = require("typeorm");
var ReviewStatus;
(function (ReviewStatus) {
    ReviewStatus["PENDING"] = "pending";
    ReviewStatus["APPROVED"] = "approved";
    ReviewStatus["REJECTED"] = "rejected";
    ReviewStatus["FLAGGED"] = "flagged";
})(ReviewStatus || (exports.ReviewStatus = ReviewStatus = {}));
let ProductReviewEntity = class ProductReviewEntity {
};
exports.ProductReviewEntity = ProductReviewEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], ProductReviewEntity.prototype, "review_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], ProductReviewEntity.prototype, "product_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], ProductReviewEntity.prototype, "partner_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], ProductReviewEntity.prototype, "user_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ProductReviewEntity.prototype, "transaction_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], ProductReviewEntity.prototype, "rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], ProductReviewEntity.prototype, "title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text' }),
    __metadata("design:type", String)
], ProductReviewEntity.prototype, "comment", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], ProductReviewEntity.prototype, "image_urls", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ProductReviewEntity.prototype, "quality_rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ProductReviewEntity.prototype, "value_rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', nullable: true }),
    __metadata("design:type", Number)
], ProductReviewEntity.prototype, "service_rating", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], ProductReviewEntity.prototype, "is_verified_purchase", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], ProductReviewEntity.prototype, "is_anonymous", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ReviewStatus,
        default: ReviewStatus.PENDING,
    }),
    __metadata("design:type", String)
], ProductReviewEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], ProductReviewEntity.prototype, "moderated_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ProductReviewEntity.prototype, "moderated_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ProductReviewEntity.prototype, "moderation_notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ProductReviewEntity.prototype, "helpful_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ProductReviewEntity.prototype, "not_helpful_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], ProductReviewEntity.prototype, "report_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], ProductReviewEntity.prototype, "has_partner_response", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], ProductReviewEntity.prototype, "partner_response", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ProductReviewEntity.prototype, "partner_response_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], ProductReviewEntity.prototype, "user_display_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], ProductReviewEntity.prototype, "product_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], ProductReviewEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], ProductReviewEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], ProductReviewEntity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], ProductReviewEntity.prototype, "published_at", void 0);
exports.ProductReviewEntity = ProductReviewEntity = __decorate([
    (0, typeorm_1.Entity)('product_reviews'),
    (0, typeorm_1.Index)(['product_id', 'status']),
    (0, typeorm_1.Index)(['user_id']),
    (0, typeorm_1.Index)(['partner_id'])
], ProductReviewEntity);
//# sourceMappingURL=product-review.entity.js.map