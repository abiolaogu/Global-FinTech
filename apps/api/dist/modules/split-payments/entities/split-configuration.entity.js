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
exports.SplitConfigurationEntity = void 0;
const typeorm_1 = require("typeorm");
let SplitConfigurationEntity = class SplitConfigurationEntity {
};
exports.SplitConfigurationEntity = SplitConfigurationEntity;
__decorate([
    (0, typeorm_1.PrimaryColumn)('uuid'),
    __metadata("design:type", String)
], SplitConfigurationEntity.prototype, "configurationId", void 0);
__decorate([
    (0, typeorm_1.Column)('uuid'),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], SplitConfigurationEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], SplitConfigurationEntity.prototype, "name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], SplitConfigurationEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: ['percentage', 'fixed', 'hybrid'],
        default: 'percentage',
    }),
    __metadata("design:type", String)
], SplitConfigurationEntity.prototype, "splitType", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb' }),
    __metadata("design:type", Array)
], SplitConfigurationEntity.prototype, "splitRules", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: true }),
    __metadata("design:type", Boolean)
], SplitConfigurationEntity.prototype, "isActive", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], SplitConfigurationEntity.prototype, "isDefault", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], SplitConfigurationEntity.prototype, "conditions", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'integer', default: 0 }),
    __metadata("design:type", Number)
], SplitConfigurationEntity.prototype, "usageCount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], SplitConfigurationEntity.prototype, "lastUsedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], SplitConfigurationEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], SplitConfigurationEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], SplitConfigurationEntity.prototype, "updatedAt", void 0);
exports.SplitConfigurationEntity = SplitConfigurationEntity = __decorate([
    (0, typeorm_1.Entity)('split_configurations'),
    (0, typeorm_1.Index)(['userId', 'isActive']),
    (0, typeorm_1.Index)(['name'])
], SplitConfigurationEntity);
//# sourceMappingURL=split-configuration.entity.js.map