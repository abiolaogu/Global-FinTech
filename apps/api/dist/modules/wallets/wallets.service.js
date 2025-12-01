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
var WalletsService_1;
var _a, _b, _c, _d, _e;
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const wallet_entity_1 = require("./entities/wallet.entity");
const wallet_transaction_entity_1 = require("./entities/wallet-transaction.entity");
const wallet_hold_entity_1 = require("./entities/wallet-hold.entity");
const event_emitter_1 = require("@nestjs/event-emitter");
const decimal_js_1 = require("decimal.js");
const uuid_1 = require("uuid");
let WalletsService = WalletsService_1 = class WalletsService {
    constructor(walletRepository, transactionRepository, holdRepository, dataSource, eventEmitter) {
        this.walletRepository = walletRepository;
        this.transactionRepository = transactionRepository;
        this.holdRepository = holdRepository;
        this.dataSource = dataSource;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(WalletsService_1.name);
    }
    async createWallet(dto) {
        this.logger.log(`Creating ${dto.currency} wallet for user ${dto.userId}`);
        const existing = await this.walletRepository.findOne({
            where: {
                userId: dto.userId,
                currency: dto.currency,
            },
        });
        if (existing) {
            throw new common_1.BadRequestException(`${dto.currency} wallet already exists for this user`);
        }
        const wallet = this.walletRepository.create({
            walletId: (0, uuid_1.v4)(),
            userId: dto.userId,
            currency: dto.currency,
            balance: '0',
            availableBalance: '0',
            pendingBalance: '0',
            heldBalance: '0',
            status: 'active',
            isPrimary: dto.isPrimary || false,
            metadata: dto.metadata || {},
            limits: dto.limits || {},
            lifetimeReceived: '0',
            lifetimeSent: '0',
            transactionCount: 0,
        });
        const saved = await this.walletRepository.save(wallet);
        this.eventEmitter.emit('wallet.created', {
            walletId: saved.walletId,
            userId: dto.userId,
            currency: dto.currency,
        });
        this.logger.log(`Wallet created: ${saved.walletId}`);
        return saved;
    }
    async creditWallet(dto, queryRunner) {
        const ownQueryRunner = !queryRunner;
        const qr = queryRunner || this.dataSource.createQueryRunner();
        if (ownQueryRunner) {
            await qr.connect();
            await qr.startTransaction();
        }
        try {
            const wallet = await qr.manager.findOne(wallet_entity_1.WalletEntity, {
                where: { walletId: dto.walletId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!wallet) {
                throw new common_1.NotFoundException('Wallet not found');
            }
            if (wallet.status !== 'active') {
                throw new common_1.BadRequestException(`Wallet is ${wallet.status}`);
            }
            const amount = new decimal_js_1.default(dto.amount);
            if (amount.lte(0)) {
                throw new common_1.BadRequestException('Amount must be positive');
            }
            const balanceBefore = new decimal_js_1.default(wallet.balance);
            const balanceAfter = balanceBefore.plus(amount);
            const transaction = qr.manager.create(wallet_transaction_entity_1.WalletTransactionEntity, {
                transactionId: (0, uuid_1.v4)(),
                walletId: wallet.walletId,
                userId: wallet.userId,
                type: 'credit',
                category: dto.category,
                amount: amount.toString(),
                currency: wallet.currency,
                balanceBefore: balanceBefore.toString(),
                balanceAfter: balanceAfter.toString(),
                status: 'completed',
                description: dto.description,
                metadata: dto.metadata || {},
                externalTransactionId: dto.externalTransactionId,
                paymentMethod: dto.paymentMethod,
                paymentGateway: dto.paymentGateway,
                completedAt: new Date(),
            });
            await qr.manager.save(transaction);
            wallet.balance = balanceAfter.toString();
            wallet.availableBalance = balanceAfter.minus(wallet.heldBalance).toString();
            wallet.lifetimeReceived = new decimal_js_1.default(wallet.lifetimeReceived).plus(amount).toString();
            wallet.transactionCount += 1;
            wallet.lastTransactionAt = new Date();
            await qr.manager.save(wallet);
            if (ownQueryRunner) {
                await qr.commitTransaction();
            }
            this.eventEmitter.emit('wallet.credited', {
                walletId: wallet.walletId,
                userId: wallet.userId,
                amount: amount.toString(),
                currency: wallet.currency,
                transactionId: transaction.transactionId,
            });
            this.logger.log(`Wallet credited: ${wallet.walletId} +${amount} ${wallet.currency}`);
            return transaction;
        }
        catch (error) {
            if (ownQueryRunner) {
                await qr.rollbackTransaction();
            }
            this.logger.error(`Credit wallet failed: ${error.message}`);
            throw error;
        }
        finally {
            if (ownQueryRunner) {
                await qr.release();
            }
        }
    }
    async debitWallet(dto, queryRunner) {
        const ownQueryRunner = !queryRunner;
        const qr = queryRunner || this.dataSource.createQueryRunner();
        if (ownQueryRunner) {
            await qr.connect();
            await qr.startTransaction();
        }
        try {
            const wallet = await qr.manager.findOne(wallet_entity_1.WalletEntity, {
                where: { walletId: dto.walletId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!wallet) {
                throw new common_1.NotFoundException('Wallet not found');
            }
            if (wallet.status !== 'active') {
                throw new common_1.BadRequestException(`Wallet is ${wallet.status}`);
            }
            const amount = new decimal_js_1.default(dto.amount);
            if (amount.lte(0)) {
                throw new common_1.BadRequestException('Amount must be positive');
            }
            const availableBalance = new decimal_js_1.default(wallet.availableBalance);
            if (amount.gt(availableBalance)) {
                throw new common_1.BadRequestException('Insufficient funds');
            }
            const balanceBefore = new decimal_js_1.default(wallet.balance);
            const balanceAfter = balanceBefore.minus(amount);
            const transaction = qr.manager.create(wallet_transaction_entity_1.WalletTransactionEntity, {
                transactionId: (0, uuid_1.v4)(),
                walletId: wallet.walletId,
                userId: wallet.userId,
                type: 'debit',
                category: dto.category,
                amount: amount.toString(),
                currency: wallet.currency,
                balanceBefore: balanceBefore.toString(),
                balanceAfter: balanceAfter.toString(),
                status: 'completed',
                description: dto.description,
                metadata: dto.metadata || {},
                externalTransactionId: dto.externalTransactionId,
                paymentMethod: dto.paymentMethod,
                paymentGateway: dto.paymentGateway,
                completedAt: new Date(),
            });
            await qr.manager.save(transaction);
            wallet.balance = balanceAfter.toString();
            wallet.availableBalance = balanceAfter.minus(wallet.heldBalance).toString();
            wallet.lifetimeSent = new decimal_js_1.default(wallet.lifetimeSent).plus(amount).toString();
            wallet.transactionCount += 1;
            wallet.lastTransactionAt = new Date();
            await qr.manager.save(wallet);
            if (ownQueryRunner) {
                await qr.commitTransaction();
            }
            this.eventEmitter.emit('wallet.debited', {
                walletId: wallet.walletId,
                userId: wallet.userId,
                amount: amount.toString(),
                currency: wallet.currency,
                transactionId: transaction.transactionId,
            });
            this.logger.log(`Wallet debited: ${wallet.walletId} -${amount} ${wallet.currency}`);
            return transaction;
        }
        catch (error) {
            if (ownQueryRunner) {
                await qr.rollbackTransaction();
            }
            this.logger.error(`Debit wallet failed: ${error.message}`);
            throw error;
        }
        finally {
            if (ownQueryRunner) {
                await qr.release();
            }
        }
    }
    async transfer(dto) {
        this.logger.log(`Transfer: ${dto.fromWalletId} -> ${dto.toWalletId}, amount: ${dto.amount}`);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const fromWallet = await queryRunner.manager.findOne(wallet_entity_1.WalletEntity, {
                where: { walletId: dto.fromWalletId },
                lock: { mode: 'pessimistic_write' },
            });
            const toWallet = await queryRunner.manager.findOne(wallet_entity_1.WalletEntity, {
                where: { walletId: dto.toWalletId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!fromWallet || !toWallet) {
                throw new common_1.NotFoundException('Wallet not found');
            }
            if (fromWallet.currency !== toWallet.currency) {
                throw new common_1.BadRequestException('Currency mismatch');
            }
            const debitTransaction = await this.debitWallet({
                walletId: dto.fromWalletId,
                amount: dto.amount,
                category: 'transfer_out',
                description: dto.description || `Transfer to ${toWallet.userId}`,
                metadata: Object.assign(Object.assign({}, dto.metadata), { counterpartyWalletId: dto.toWalletId, counterpartyUserId: toWallet.userId }),
            }, queryRunner);
            const creditTransaction = await this.creditWallet({
                walletId: dto.toWalletId,
                amount: dto.amount,
                category: 'transfer_in',
                description: dto.description || `Transfer from ${fromWallet.userId}`,
                metadata: Object.assign(Object.assign({}, dto.metadata), { counterpartyWalletId: dto.fromWalletId, counterpartyUserId: fromWallet.userId }),
            }, queryRunner);
            debitTransaction.counterpartyWalletId = dto.toWalletId;
            debitTransaction.counterpartyUserId = toWallet.userId;
            debitTransaction.referenceId = creditTransaction.transactionId;
            creditTransaction.counterpartyWalletId = dto.fromWalletId;
            creditTransaction.counterpartyUserId = fromWallet.userId;
            creditTransaction.referenceId = debitTransaction.transactionId;
            await queryRunner.manager.save([debitTransaction, creditTransaction]);
            await queryRunner.commitTransaction();
            this.eventEmitter.emit('wallet.transfer_completed', {
                fromWalletId: dto.fromWalletId,
                toWalletId: dto.toWalletId,
                amount: dto.amount,
                currency: fromWallet.currency,
                debitTransactionId: debitTransaction.transactionId,
                creditTransactionId: creditTransaction.transactionId,
            });
            this.logger.log(`Transfer completed: ${debitTransaction.transactionId}`);
            return { debitTransaction, creditTransaction };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Transfer failed: ${error.message}`);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async createHold(walletId, amount, reason, description, expiresAt, metadata) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const wallet = await queryRunner.manager.findOne(wallet_entity_1.WalletEntity, {
                where: { walletId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!wallet) {
                throw new common_1.NotFoundException('Wallet not found');
            }
            const holdAmount = new decimal_js_1.default(amount);
            const availableBalance = new decimal_js_1.default(wallet.availableBalance);
            if (holdAmount.gt(availableBalance)) {
                throw new common_1.BadRequestException('Insufficient funds for hold');
            }
            const hold = queryRunner.manager.create(wallet_hold_entity_1.WalletHoldEntity, {
                holdId: (0, uuid_1.v4)(),
                walletId: wallet.walletId,
                userId: wallet.userId,
                amount: holdAmount.toString(),
                currency: wallet.currency,
                status: 'active',
                reason: reason,
                description,
                expiresAt,
                metadata: metadata || {},
            });
            await queryRunner.manager.save(hold);
            wallet.heldBalance = new decimal_js_1.default(wallet.heldBalance).plus(holdAmount).toString();
            wallet.availableBalance = new decimal_js_1.default(wallet.balance).minus(wallet.heldBalance).toString();
            await queryRunner.manager.save(wallet);
            await queryRunner.commitTransaction();
            this.logger.log(`Hold created: ${hold.holdId} for ${holdAmount} ${wallet.currency}`);
            return hold;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Create hold failed: ${error.message}`);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async releaseHold(holdId) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const hold = await queryRunner.manager.findOne(wallet_hold_entity_1.WalletHoldEntity, {
                where: { holdId },
            });
            if (!hold) {
                throw new common_1.NotFoundException('Hold not found');
            }
            if (hold.status !== 'active') {
                throw new common_1.BadRequestException(`Hold is already ${hold.status}`);
            }
            const wallet = await queryRunner.manager.findOne(wallet_entity_1.WalletEntity, {
                where: { walletId: hold.walletId },
                lock: { mode: 'pessimistic_write' },
            });
            if (!wallet) {
                throw new common_1.NotFoundException('Wallet not found');
            }
            hold.status = 'released';
            hold.releasedAt = new Date();
            await queryRunner.manager.save(hold);
            const holdAmount = new decimal_js_1.default(hold.amount);
            wallet.heldBalance = new decimal_js_1.default(wallet.heldBalance).minus(holdAmount).toString();
            wallet.availableBalance = new decimal_js_1.default(wallet.balance).minus(wallet.heldBalance).toString();
            await queryRunner.manager.save(wallet);
            await queryRunner.commitTransaction();
            this.logger.log(`Hold released: ${holdId}`);
            return hold;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Release hold failed: ${error.message}`);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async captureHold(holdId, description) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const hold = await queryRunner.manager.findOne(wallet_hold_entity_1.WalletHoldEntity, {
                where: { holdId },
            });
            if (!hold) {
                throw new common_1.NotFoundException('Hold not found');
            }
            if (hold.status !== 'active') {
                throw new common_1.BadRequestException(`Hold is already ${hold.status}`);
            }
            const transaction = await this.debitWallet({
                walletId: hold.walletId,
                amount: hold.amount,
                category: 'payment_sent',
                description: description || hold.description,
                metadata: Object.assign({ holdId: hold.holdId }, hold.metadata),
            }, queryRunner);
            hold.status = 'captured';
            hold.capturedAt = new Date();
            hold.capturedTransactionId = transaction.transactionId;
            const wallet = await queryRunner.manager.findOne(wallet_entity_1.WalletEntity, {
                where: { walletId: hold.walletId },
                lock: { mode: 'pessimistic_write' },
            });
            const holdAmount = new decimal_js_1.default(hold.amount);
            wallet.heldBalance = new decimal_js_1.default(wallet.heldBalance).minus(holdAmount).toString();
            wallet.availableBalance = new decimal_js_1.default(wallet.balance).minus(wallet.heldBalance).toString();
            await queryRunner.manager.save([hold, wallet]);
            await queryRunner.commitTransaction();
            this.logger.log(`Hold captured: ${holdId} -> ${transaction.transactionId}`);
            return { hold, transaction };
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Capture hold failed: ${error.message}`);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async releaseExpiredHolds() {
        this.logger.log('Releasing expired holds...');
        const expiredHolds = await this.holdRepository.find({
            where: {
                status: 'active',
                expiresAt: (0, typeorm_2.LessThan)(new Date()),
            },
        });
        let releasedCount = 0;
        for (const hold of expiredHolds) {
            try {
                await this.releaseHold(hold.holdId);
                releasedCount++;
            }
            catch (error) {
                this.logger.error(`Failed to release expired hold ${hold.holdId}: ${error.message}`);
            }
        }
        this.logger.log(`Released ${releasedCount} expired holds`);
        return releasedCount;
    }
    async getWallet(walletId) {
        const wallet = await this.walletRepository.findOne({
            where: { walletId },
        });
        if (!wallet) {
            throw new common_1.NotFoundException('Wallet not found');
        }
        return wallet;
    }
    async getUserWallets(userId) {
        return this.walletRepository.find({
            where: { userId },
            order: { isPrimary: 'DESC', createdAt: 'ASC' },
        });
    }
    async getWalletTransactions(walletId, limit = 50, offset = 0) {
        return this.transactionRepository.find({
            where: { walletId },
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
    }
    async getBalance(walletId) {
        const wallet = await this.getWallet(walletId);
        return {
            balance: wallet.balance,
            availableBalance: wallet.availableBalance,
            pendingBalance: wallet.pendingBalance,
            heldBalance: wallet.heldBalance,
            currency: wallet.currency,
        };
    }
    async freezeWallet(walletId, reason) {
        const wallet = await this.getWallet(walletId);
        wallet.status = 'frozen';
        wallet.frozenAt = new Date();
        wallet.frozenReason = reason;
        return this.walletRepository.save(wallet);
    }
    async unfreezeWallet(walletId) {
        const wallet = await this.getWallet(walletId);
        wallet.status = 'active';
        wallet.frozenAt = null;
        wallet.frozenReason = null;
        return this.walletRepository.save(wallet);
    }
};
exports.WalletsService = WalletsService;
exports.WalletsService = WalletsService = WalletsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(wallet_entity_1.WalletEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(wallet_transaction_entity_1.WalletTransactionEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(wallet_hold_entity_1.WalletHoldEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object, typeof (_d = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _d : Object, typeof (_e = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _e : Object])
], WalletsService);
//# sourceMappingURL=wallets.service.js.map