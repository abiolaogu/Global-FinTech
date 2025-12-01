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
exports.MarketplaceCategoryEntity = void 0;
const typeorm_1 = require("typeorm");
let MarketplaceCategoryEntity = class MarketplaceCategoryEntity {
};
exports.MarketplaceCategoryEntity = MarketplaceCategoryEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], MarketplaceCategoryEntity.prototype, "category_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, unique: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], MarketplaceCategoryEntity.prototype, "slug", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], MarketplaceCategoryEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MarketplaceCategoryEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], MarketplaceCategoryEntity.prototype, "icon_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 500, nullable: true }),
    __metadata("design:type", String)
], MarketplaceCategoryEntity.prototype, "banner_url", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], MarketplaceCategoryEntity.prototype, "display_order", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], MarketplaceCategoryEntity.prototype, "is_active", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], MarketplaceCategoryEntity.prototype, "is_featured", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int', default: 0 }),
    __metadata("design:type", Number)
], MarketplaceCategoryEntity.prototype, "product_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], MarketplaceCategoryEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], MarketplaceCategoryEntity.prototype, "meta_title", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], MarketplaceCategoryEntity.prototype, "meta_description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], MarketplaceCategoryEntity.prototype, "meta_keywords", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], MarketplaceCategoryEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], MarketplaceCategoryEntity.prototype, "updated_at", void 0);
__decorate([
    (0, typeorm_1.TreeChildren)(),
    __metadata("design:type", Array)
], MarketplaceCategoryEntity.prototype, "children", void 0);
__decorate([
    (0, typeorm_1.TreeParent)(),
    __metadata("design:type", MarketplaceCategoryEntity)
], MarketplaceCategoryEntity.prototype, "parent", void 0);
exports.MarketplaceCategoryEntity = MarketplaceCategoryEntity = __decorate([
    (0, typeorm_1.Entity)('marketplace_categories'),
    (0, typeorm_1.Tree)('closure-table'),
    (0, typeorm_1.Index)(['slug'])
], MarketplaceCategoryEntity);
//# sourceMappingURL=marketplace-category.entity.js.map