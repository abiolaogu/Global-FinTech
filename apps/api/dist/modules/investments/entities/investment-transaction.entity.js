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
exports.InvestmentTransactionEntity = exports.TransactionStatus = exports.TransactionType = void 0;
const typeorm_1 = require("typeorm");
const investment_opportunity_entity_1 = require("./investment-opportunity.entity");
var TransactionType;
(function (TransactionType) {
    TransactionType["BUY"] = "buy";
    TransactionType["SELL"] = "sell";
    TransactionType["DIVIDEND"] = "dividend";
    TransactionType["FEE"] = "fee";
    TransactionType["TRANSFER_IN"] = "transfer_in";
    TransactionType["TRANSFER_OUT"] = "transfer_out";
})(TransactionType || (exports.TransactionType = TransactionType = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "pending";
    TransactionStatus["PROCESSING"] = "processing";
    TransactionStatus["COMPLETED"] = "completed";
    TransactionStatus["FAILED"] = "failed";
    TransactionStatus["CANCELLED"] = "cancelled";
    TransactionStatus["REFUNDED"] = "refunded";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
let InvestmentTransactionEntity = class InvestmentTransactionEntity {
};
exports.InvestmentTransactionEntity = InvestmentTransactionEntity;
__decorate([
    (0, typeorm_1.PrimaryGeneratedColumn)('uuid'),
    __metadata("design:type", String)
], InvestmentTransactionEntity.prototype, "transactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], InvestmentTransactionEntity.prototype, "userId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid' }),
    (0, typeorm_1.Index)(),
    __metadata("design:type", String)
], InvestmentTransactionEntity.prototype, "opportunityId", void 0);
__decorate([
    (0, typeorm_1.ManyToOne)(() => investment_opportunity_entity_1.InvestmentOpportunityEntity, (opportunity) => opportunity.transactions),
    (0, typeorm_1.JoinColumn)({ name: 'opportunityId' }),
    __metadata("design:type", investment_opportunity_entity_1.InvestmentOpportunityEntity)
], InvestmentTransactionEntity.prototype, "opportunity", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], InvestmentTransactionEntity.prototype, "portfolioId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50 }),
    __metadata("design:type", String)
], InvestmentTransactionEntity.prototype, "type", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 50, default: TransactionStatus.PENDING }),
    __metadata("design:type", String)
], InvestmentTransactionEntity.prototype, "status", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 8 }),
    __metadata("design:type", String)
], InvestmentTransactionEntity.prototype, "shares", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 2 }),
    __metadata("design:type", String)
], InvestmentTransactionEntity.prototype, "pricePerShare", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 2 }),
    __metadata("design:type", String)
], InvestmentTransactionEntity.prototype, "amount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10 }),
    __metadata("design:type", String)
], InvestmentTransactionEntity.prototype, "currency", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 2, default: '0' }),
    __metadata("design:type", String)
], InvestmentTransactionEntity.prototype, "entryFee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 2, default: '0' }),
    __metadata("design:type", String)
], InvestmentTransactionEntity.prototype, "exitFee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 2, default: '0' }),
    __metadata("design:type", String)
], InvestmentTransactionEntity.prototype, "managementFee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 2, default: '0' }),
    __metadata("design:type", String)
], InvestmentTransactionEntity.prototype, "performanceFee", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 2, default: '0' }),
    __metadata("design:type", String)
], InvestmentTransactionEntity.prototype, "totalFees", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 2 }),
    __metadata("design:type", String)
], InvestmentTransactionEntity.prototype, "netAmount", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InvestmentTransactionEntity.prototype, "paymentMethod", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InvestmentTransactionEntity.prototype, "paymentReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'uuid', nullable: true }),
    __metadata("design:type", String)
], InvestmentTransactionEntity.prototype, "walletTransactionId", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InvestmentTransactionEntity.prototype, "settledAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 100, nullable: true }),
    __metadata("design:type", String)
], InvestmentTransactionEntity.prototype, "settlementReference", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 24, scale: 2, nullable: true }),
    __metadata("design:type", String)
], InvestmentTransactionEntity.prototype, "taxWithheld", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 10, nullable: true }),
    __metadata("design:type", String)
], InvestmentTransactionEntity.prototype, "taxYear", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], InvestmentTransactionEntity.prototype, "isTaxable", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InvestmentTransactionEntity.prototype, "dividendDate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'decimal', precision: 5, scale: 2, nullable: true }),
    __metadata("design:type", String)
], InvestmentTransactionEntity.prototype, "dividendRate", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'boolean', default: false }),
    __metadata("design:type", Boolean)
], InvestmentTransactionEntity.prototype, "dividendReinvested", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'varchar', length: 255, nullable: true }),
    __metadata("design:type", String)
], InvestmentTransactionEntity.prototype, "description", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'json', nullable: true }),
    __metadata("design:type", Object)
], InvestmentTransactionEntity.prototype, "metadata", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'text', nullable: true }),
    __metadata("design:type", String)
], InvestmentTransactionEntity.prototype, "failureReason", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InvestmentTransactionEntity.prototype, "processedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InvestmentTransactionEntity.prototype, "completedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InvestmentTransactionEntity.prototype, "failedAt", void 0);
__decorate([
    (0, typeorm_1.Column)({ type: 'timestamp', nullable: true }),
    __metadata("design:type", Date)
], InvestmentTransactionEntity.prototype, "cancelledAt", void 0);
__decorate([
    (0, typeorm_1.CreateDateColumn)(),
    __metadata("design:type", Date)
], InvestmentTransactionEntity.prototype, "createdAt", void 0);
__decorate([
    (0, typeorm_1.UpdateDateColumn)(),
    __metadata("design:type", Date)
], InvestmentTransactionEntity.prototype, "updatedAt", void 0);
exports.InvestmentTransactionEntity = InvestmentTransactionEntity = __decorate([
    (0, typeorm_1.Entity)('investment_transactions')
], InvestmentTransactionEntity);
//# sourceMappingURL=investment-transaction.entity.js.map