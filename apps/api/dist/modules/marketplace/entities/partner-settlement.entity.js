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
exports.PartnerSettlementEntity = exports.SettlementStatus = void 0;
const typeorm_1 = require("typeorm");
var SettlementStatus;
(function (SettlementStatus) {
    SettlementStatus["PENDING"] = "pending";
    SettlementStatus["PROCESSING"] = "processing";
    SettlementStatus["COMPLETED"] = "completed";
    SettlementStatus["FAILED"] = "failed";
    SettlementStatus["CANCELLED"] = "cancelled";
})(SettlementStatus || (exports.SettlementStatus = SettlementStatus = {}));
let PartnerSettlementEntity = class PartnerSettlementEntity {
};
exports.PartnerSettlementEntity = PartnerSettlementEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], PartnerSettlementEntity.prototype, "settlement_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, unique: true }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PartnerSettlementEntity.prototype, "reference", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], PartnerSettlementEntity.prototype, "partner_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255 }),
    __metadata("design:type", String)
], PartnerSettlementEntity.prototype, "partner_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], PartnerSettlementEntity.prototype, "period_start_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], PartnerSettlementEntity.prototype, "period_end_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'date' }),
    __metadata("design:type", Date)
], PartnerSettlementEntity.prototype, "settlement_date", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'int' }),
    __metadata("design:type", Number)
], PartnerSettlementEntity.prototype, "transaction_count", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2 }),
    __metadata("design:type", Number)
], PartnerSettlementEntity.prototype, "gross_transaction_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2 }),
    __metadata("design:type", Number)
], PartnerSettlementEntity.prototype, "platform_commission", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2 }),
    __metadata("design:type", Number)
], PartnerSettlementEntity.prototype, "partner_payout", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PartnerSettlementEntity.prototype, "adjustments", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2, default: 0 }),
    __metadata("design:type", Number)
], PartnerSettlementEntity.prototype, "refund_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 18, scale: 2 }),
    __metadata("design:type", Number)
], PartnerSettlementEntity.prototype, "net_settlement_amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 3, default: 'USD' }),
    __metadata("design:type", String)
], PartnerSettlementEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, nullable: true }),
    __metadata("design:type", String)
], PartnerSettlementEntity.prototype, "payment_method", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], PartnerSettlementEntity.prototype, "bank_account_number", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], PartnerSettlementEntity.prototype, "bank_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], PartnerSettlementEntity.prototype, "bank_code", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], PartnerSettlementEntity.prototype, "account_holder_name", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], PartnerSettlementEntity.prototype, "payment_transaction_id", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], PartnerSettlementEntity.prototype, "payment_reference", void 0);
__decorate([
    (0, typeorm_1.Column)({
        type: 'enum',
        enum: SettlementStatus,
        default: SettlementStatus.PENDING,
    }),
    __metadata("design:type", String)
], PartnerSettlementEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PartnerSettlementEntity.prototype, "notes", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PartnerSettlementEntity.prototype, "adjustment_reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'simple-array', nullable: true }),
    __metadata("design:type", Array)
], PartnerSettlementEntity.prototype, "transaction_ids", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], PartnerSettlementEntity.prototype, "processed_by", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PartnerSettlementEntity.prototype, "processed_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PartnerSettlementEntity.prototype, "completed_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], PartnerSettlementEntity.prototype, "failed_at", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], PartnerSettlementEntity.prototype, "failure_reason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'jsonb', nullable: true }),
    __metadata("design:type", Object)
], PartnerSettlementEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], PartnerSettlementEntity.prototype, "created_at", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], PartnerSettlementEntity.prototype, "updated_at", void 0);
exports.PartnerSettlementEntity = PartnerSettlementEntity = __decorate([
    (0, typeorm_1.Entity)('partner_settlements'),
    (0, typeorm_1.Index)(['partner_id', 'status']),
    (0, typeorm_1.Index)(['settlement_date'])
], PartnerSettlementEntity);
//# sourceMappingURL=partner-settlement.entity.js.map