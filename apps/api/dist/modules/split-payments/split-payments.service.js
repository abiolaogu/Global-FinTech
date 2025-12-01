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
var SplitPaymentsService_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.SplitPaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const split_payment_entity_1 = require("./entities/split-payment.entity");
const split_configuration_entity_1 = require("./entities/split-configuration.entity");
const wallets_service_1 = require("../wallets/wallets.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const decimal_js_1 = require("decimal.js");
const uuid_1 = require("uuid");
let SplitPaymentsService = SplitPaymentsService_1 = class SplitPaymentsService {
    constructor(splitPaymentRepository, configurationRepository, walletsService, dataSource, eventEmitter) {
        this.splitPaymentRepository = splitPaymentRepository;
        this.configurationRepository = configurationRepository;
        this.walletsService = walletsService;
        this.dataSource = dataSource;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(SplitPaymentsService_1.name);
    }
    async processSplitPayment(dto) {
        var _a, _b;
        this.logger.log(`Processing split payment for transaction ${dto.paymentId}`);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            this.validateSplitRules(dto.splitRules, dto.totalAmount, ((_a = dto.splitRules[0]) === null || _a === void 0 ? void 0 : _a.splitType) === 'percentage');
            const actualSplits = this.calculateSplits(dto.splitRules, dto.totalAmount, dto.platformFee);
            const splitPayment = queryRunner.manager.create(split_payment_entity_1.SplitPaymentEntity, {
                splitPaymentId: (0, uuid_1.v4)(),
                paymentId: dto.paymentId,
                userId: dto.userId,
                totalAmount: dto.totalAmount,
                currency: dto.currency,
                status: 'processing',
                splitType: ((_b = dto.splitRules[0]) === null || _b === void 0 ? void 0 : _b.splitType) || 'percentage',
                splitRules: dto.splitRules,
                actualSplits: actualSplits.map(split => (Object.assign(Object.assign({}, split), { status: 'pending' }))),
                platformFee: dto.platformFee,
                description: dto.description,
                metadata: dto.metadata || {},
                completedSplitsCount: 0,
                failedSplitsCount: 0,
            });
            await queryRunner.manager.save(splitPayment);
            let completedCount = 0;
            let failedCount = 0;
            for (const split of actualSplits) {
                try {
                    const recipientWallet = await this.getOrCreateRecipientWallet(split.recipientId, dto.currency, queryRunner);
                    const transaction = await this.walletsService.creditWallet({
                        walletId: recipientWallet.walletId,
                        amount: split.amount,
                        category: 'split_payment_received',
                        description: `Split payment from ${dto.userId}: ${dto.description || 'Payment split'}`,
                        metadata: Object.assign({ splitPaymentId: splitPayment.splitPaymentId, paymentId: dto.paymentId, recipientType: split.recipientType }, split.metadata),
                        externalTransactionId: dto.paymentId,
                    }, queryRunner);
                    const splitIndex = splitPayment.actualSplits.findIndex(s => s.recipientId === split.recipientId);
                    if (splitIndex !== -1) {
                        splitPayment.actualSplits[splitIndex].status = 'completed';
                        splitPayment.actualSplits[splitIndex].transactionId = transaction.transactionId;
                        splitPayment.actualSplits[splitIndex].walletId = recipientWallet.walletId;
                        splitPayment.actualSplits[splitIndex].completedAt = new Date();
                    }
                    completedCount++;
                }
                catch (error) {
                    this.logger.error(`Split to ${split.recipientId} failed: ${error.message}`);
                    const splitIndex = splitPayment.actualSplits.findIndex(s => s.recipientId === split.recipientId);
                    if (splitIndex !== -1) {
                        splitPayment.actualSplits[splitIndex].status = 'failed';
                        splitPayment.actualSplits[splitIndex].failureReason = error.message;
                    }
                    failedCount++;
                }
            }
            splitPayment.completedSplitsCount = completedCount;
            splitPayment.failedSplitsCount = failedCount;
            if (failedCount === 0) {
                splitPayment.status = 'completed';
                splitPayment.completedAt = new Date();
            }
            else if (completedCount === 0) {
                splitPayment.status = 'failed';
                splitPayment.failedAt = new Date();
                splitPayment.failureReason = 'All splits failed';
            }
            else {
                splitPayment.status = 'partially_completed';
                splitPayment.completedAt = new Date();
            }
            await queryRunner.manager.save(splitPayment);
            await queryRunner.commitTransaction();
            this.eventEmitter.emit('split_payment.processed', {
                splitPaymentId: splitPayment.splitPaymentId,
                paymentId: dto.paymentId,
                status: splitPayment.status,
                completedCount,
                failedCount,
            });
            this.logger.log(`Split payment ${splitPayment.status}: ${splitPayment.splitPaymentId} (${completedCount}/${actualSplits.length} completed)`);
            return splitPayment;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Split payment processing failed: ${error.message}`);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async createConfiguration(dto) {
        this.logger.log(`Creating split configuration for user ${dto.userId}`);
        if (dto.isDefault) {
            await this.configurationRepository.update({ userId: dto.userId, isDefault: true }, { isDefault: false });
        }
        const configuration = this.configurationRepository.create({
            configurationId: (0, uuid_1.v4)(),
            userId: dto.userId,
            name: dto.name,
            description: dto.description,
            splitType: dto.splitType,
            splitRules: dto.splitRules,
            isActive: true,
            isDefault: dto.isDefault || false,
            conditions: dto.conditions,
            usageCount: 0,
        });
        const saved = await this.configurationRepository.save(configuration);
        this.logger.log(`Split configuration created: ${saved.configurationId}`);
        return saved;
    }
    async applySplitConfiguration(configurationId, paymentId, userId, totalAmount, currency) {
        const configuration = await this.configurationRepository.findOne({
            where: { configurationId },
        });
        if (!configuration) {
            throw new common_1.NotFoundException('Split configuration not found');
        }
        if (!configuration.isActive) {
            throw new common_1.BadRequestException('Split configuration is inactive');
        }
        if (configuration.conditions) {
            if (configuration.conditions.minAmount) {
                const minAmount = new decimal_js_1.default(configuration.conditions.minAmount);
                if (new decimal_js_1.default(totalAmount).lt(minAmount)) {
                    throw new common_1.BadRequestException(`Amount below minimum: ${configuration.conditions.minAmount}`);
                }
            }
            if (configuration.conditions.maxAmount) {
                const maxAmount = new decimal_js_1.default(configuration.conditions.maxAmount);
                if (new decimal_js_1.default(totalAmount).gt(maxAmount)) {
                    throw new common_1.BadRequestException(`Amount above maximum: ${configuration.conditions.maxAmount}`);
                }
            }
            if (configuration.conditions.currencies && !configuration.conditions.currencies.includes(currency)) {
                throw new common_1.BadRequestException(`Currency ${currency} not supported by this configuration`);
            }
        }
        configuration.usageCount += 1;
        configuration.lastUsedAt = new Date();
        await this.configurationRepository.save(configuration);
        return this.processSplitPayment({
            paymentId,
            userId,
            totalAmount,
            currency,
            splitRules: configuration.splitRules,
            description: `Split payment using configuration: ${configuration.name}`,
            metadata: { splitConfigurationId: configurationId },
        });
    }
    calculateSplits(splitRules, totalAmount, platformFee) {
        const total = new decimal_js_1.default(totalAmount);
        const fee = platformFee ? new decimal_js_1.default(platformFee) : new decimal_js_1.default(0);
        const splittableAmount = total.minus(fee);
        const splits = [];
        let allocatedAmount = new decimal_js_1.default(0);
        for (const rule of splitRules.filter(r => r.splitType === 'fixed')) {
            const amount = new decimal_js_1.default(rule.value);
            splits.push({
                recipientId: rule.recipientId,
                recipientType: rule.recipientType,
                amount: amount.toString(),
                currency: '',
                metadata: rule.metadata,
            });
            allocatedAmount = allocatedAmount.plus(amount);
        }
        const remainingForPercentage = splittableAmount.minus(allocatedAmount);
        for (const rule of splitRules.filter(r => r.splitType === 'percentage')) {
            const percentage = new decimal_js_1.default(rule.value);
            const amount = remainingForPercentage.times(percentage).dividedBy(100);
            splits.push({
                recipientId: rule.recipientId,
                recipientType: rule.recipientType,
                amount: amount.toFixed(2, decimal_js_1.default.ROUND_DOWN),
                currency: '',
                metadata: rule.metadata,
            });
            allocatedAmount = allocatedAmount.plus(amount);
        }
        return splits;
    }
    validateSplitRules(splitRules, totalAmount, isPercentageBased) {
        if (!splitRules || splitRules.length === 0) {
            throw new common_1.BadRequestException('At least one split rule is required');
        }
        if (isPercentageBased) {
            const totalPercentage = splitRules
                .filter(r => r.splitType === 'percentage')
                .reduce((sum, r) => sum.plus(r.value), new decimal_js_1.default(0));
            if (totalPercentage.gt(100)) {
                throw new common_1.BadRequestException('Total percentage exceeds 100%');
            }
        }
        const totalFixed = splitRules
            .filter(r => r.splitType === 'fixed')
            .reduce((sum, r) => sum.plus(r.value), new decimal_js_1.default(0));
        if (totalFixed.gt(totalAmount)) {
            throw new common_1.BadRequestException('Total fixed amounts exceed total amount');
        }
    }
    async getOrCreateRecipientWallet(recipientId, currency, queryRunner) {
        let wallet = await queryRunner.manager.findOne('WalletEntity', {
            where: { userId: recipientId, currency },
        });
        if (!wallet) {
            wallet = await this.walletsService.createWallet({
                userId: recipientId,
                currency,
                isPrimary: false,
            });
        }
        return wallet;
    }
    async getSplitPayment(splitPaymentId) {
        const splitPayment = await this.splitPaymentRepository.findOne({
            where: { splitPaymentId },
        });
        if (!splitPayment) {
            throw new common_1.NotFoundException('Split payment not found');
        }
        return splitPayment;
    }
    async getUserConfigurations(userId) {
        return this.configurationRepository.find({
            where: { userId, isActive: true },
            order: { isDefault: 'DESC', createdAt: 'DESC' },
        });
    }
    async getPaymentSplits(paymentId) {
        return this.splitPaymentRepository.find({
            where: { paymentId },
            order: { createdAt: 'DESC' },
        });
    }
};
exports.SplitPaymentsService = SplitPaymentsService;
exports.SplitPaymentsService = SplitPaymentsService = SplitPaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(split_payment_entity_1.SplitPaymentEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(split_configuration_entity_1.SplitConfigurationEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, wallets_service_1.WalletsService, typeof (_c = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _c : Object, typeof (_d = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _d : Object])
], SplitPaymentsService);
//# sourceMappingURL=split-payments.service.js.map