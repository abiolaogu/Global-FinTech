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
var VirtualAccountsService_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.VirtualAccountsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const virtual_account_entity_1 = require("./entities/virtual-account.entity");
const virtual_account_transaction_entity_1 = require("./entities/virtual-account-transaction.entity");
const wallets_service_1 = require("../wallets/wallets.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const uuid_1 = require("uuid");
const axios_1 = require("axios");
const crypto = require("crypto");
let VirtualAccountsService = VirtualAccountsService_1 = class VirtualAccountsService {
    constructor(virtualAccountRepository, transactionRepository, walletsService, dataSource, eventEmitter) {
        this.virtualAccountRepository = virtualAccountRepository;
        this.transactionRepository = transactionRepository;
        this.walletsService = walletsService;
        this.dataSource = dataSource;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(VirtualAccountsService_1.name);
        this.providerConfigs = {
            paystack: {
                apiUrl: 'https://api.paystack.co',
                apiKey: process.env.PAYSTACK_SECRET_KEY,
            },
            flutterwave: {
                apiUrl: 'https://api.flutterwave.com/v3',
                apiKey: process.env.FLUTTERWAVE_SECRET_KEY,
            },
            woven: {
                apiUrl: 'https://api.woven.finance/v2',
                apiKey: process.env.WOVEN_SECRET_KEY,
            },
            budpay: {
                apiUrl: 'https://api.budpay.com/api/v2',
                apiKey: process.env.BUDPAY_SECRET_KEY,
            },
            monnify: {
                apiUrl: 'https://api.monnify.com/api/v1',
                apiKey: process.env.MONNIFY_API_KEY,
                secretKey: process.env.MONNIFY_SECRET_KEY,
            },
            korapay: {
                apiUrl: 'https://api.korapay.com/merchant/api/v1',
                apiKey: process.env.KORAPAY_SECRET_KEY,
            },
        };
    }
    async createVirtualAccount(dto) {
        this.logger.log(`Creating virtual account for user ${dto.userId} via ${dto.provider}`);
        const existing = await this.virtualAccountRepository.findOne({
            where: {
                userId: dto.userId,
                currency: dto.currency,
                provider: dto.provider,
                status: 'active',
            },
        });
        if (existing) {
            this.logger.log(`Returning existing virtual account: ${existing.virtualAccountId}`);
            return existing;
        }
        const providerAccount = await this.createVirtualAccountViaProvider(dto);
        const virtualAccount = this.virtualAccountRepository.create({
            virtualAccountId: (0, uuid_1.v4)(),
            userId: dto.userId,
            walletId: dto.walletId,
            accountNumber: providerAccount.accountNumber,
            accountName: dto.accountName || providerAccount.accountName,
            bankName: providerAccount.bankName,
            bankCode: providerAccount.bankCode,
            routingNumber: providerAccount.routingNumber,
            iban: providerAccount.iban,
            swiftCode: providerAccount.swiftCode,
            currency: dto.currency,
            country: dto.country,
            status: 'active',
            accountType: dto.accountType || 'dedicated',
            provider: dto.provider,
            providerId: providerAccount.providerId,
            providerAccountId: providerAccount.providerAccountId,
            autoCredit: dto.autoCredit !== false,
            metadata: dto.metadata || {},
            providerData: providerAccount.providerData || {},
            totalReceived: '0',
            transactionCount: 0,
            activatedAt: new Date(),
        });
        const saved = await this.virtualAccountRepository.save(virtualAccount);
        this.eventEmitter.emit('virtual_account.created', {
            virtualAccountId: saved.virtualAccountId,
            userId: dto.userId,
            provider: dto.provider,
            accountNumber: saved.accountNumber,
        });
        this.logger.log(`Virtual account created: ${saved.virtualAccountId} - ${saved.accountNumber}`);
        return saved;
    }
    async processPayment(dto) {
        this.logger.log(`Processing payment to virtual account ${dto.virtualAccountId}`);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const virtualAccount = await queryRunner.manager.findOne(virtual_account_entity_1.VirtualAccountEntity, {
                where: { virtualAccountId: dto.virtualAccountId },
            });
            if (!virtualAccount) {
                throw new common_1.NotFoundException('Virtual account not found');
            }
            const transaction = queryRunner.manager.create(virtual_account_transaction_entity_1.VirtualAccountTransactionEntity, {
                transactionId: (0, uuid_1.v4)(),
                virtualAccountId: virtualAccount.virtualAccountId,
                userId: virtualAccount.userId,
                walletId: virtualAccount.walletId,
                amount: dto.amount,
                currency: dto.currency,
                status: 'pending',
                senderAccountNumber: dto.senderAccountNumber,
                senderAccountName: dto.senderAccountName,
                senderBankName: dto.senderBankName,
                senderBankCode: dto.senderBankCode,
                reference: dto.reference,
                sessionId: dto.sessionId,
                narration: dto.narration,
                provider: virtualAccount.provider,
                providerTransactionId: dto.providerTransactionId,
                providerData: dto.providerData || {},
                fee: dto.fee,
                autoCredited: false,
            });
            await queryRunner.manager.save(transaction);
            if (virtualAccount.autoCredit && virtualAccount.walletId) {
                try {
                    const walletTransaction = await this.walletsService.creditWallet({
                        walletId: virtualAccount.walletId,
                        amount: dto.amount,
                        category: 'deposit',
                        description: `Virtual account deposit: ${dto.narration || 'Bank transfer'}`,
                        metadata: {
                            virtualAccountId: virtualAccount.virtualAccountId,
                            senderAccountName: dto.senderAccountName,
                            senderBankName: dto.senderBankName,
                            reference: dto.reference,
                        },
                        externalTransactionId: dto.providerTransactionId,
                        paymentMethod: 'virtual_account',
                        paymentGateway: virtualAccount.provider,
                    }, queryRunner);
                    transaction.walletTransactionId = walletTransaction.transactionId;
                    transaction.autoCredited = true;
                    transaction.status = 'completed';
                    transaction.completedAt = new Date();
                    this.logger.log(`Wallet auto-credited: ${virtualAccount.walletId}`);
                }
                catch (error) {
                    this.logger.error(`Auto-credit failed: ${error.message}`);
                    transaction.status = 'failed';
                    transaction.failedAt = new Date();
                    transaction.failureReason = `Auto-credit failed: ${error.message}`;
                }
            }
            else {
                transaction.status = 'completed';
                transaction.completedAt = new Date();
            }
            await queryRunner.manager.save(transaction);
            virtualAccount.totalReceived = (parseFloat(virtualAccount.totalReceived) + parseFloat(dto.amount)).toString();
            virtualAccount.transactionCount += 1;
            virtualAccount.lastTransactionAt = new Date();
            await queryRunner.manager.save(virtualAccount);
            await queryRunner.commitTransaction();
            this.eventEmitter.emit('virtual_account.payment_received', {
                virtualAccountId: virtualAccount.virtualAccountId,
                transactionId: transaction.transactionId,
                amount: dto.amount,
                currency: dto.currency,
                autoCredited: transaction.autoCredited,
            });
            this.logger.log(`Virtual account payment processed: ${transaction.transactionId}`);
            return transaction;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Process payment failed: ${error.message}`);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async createVirtualAccountViaPaystack(dto) {
        var _a, _b;
        const config = this.providerConfigs.paystack;
        try {
            const response = await axios_1.default.post(`${config.apiUrl}/dedicated_account`, {
                customer: dto.userId,
                preferred_bank: 'wema-bank',
                country: dto.country,
                account_name: dto.accountName,
            }, {
                headers: {
                    Authorization: `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.data.status) {
                throw new common_1.BadRequestException(response.data.message || 'Failed to create virtual account');
            }
            const data = response.data.data;
            return {
                accountNumber: data.account_number,
                accountName: data.account_name,
                bankName: data.bank.name,
                bankCode: data.bank.slug,
                providerId: data.id.toString(),
                providerAccountId: data.dedicated_account_id,
                providerData: data,
            };
        }
        catch (error) {
            this.logger.error(`Paystack virtual account creation failed: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to create virtual account: ${((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || error.message}`);
        }
    }
    async createVirtualAccountViaFlutterwave(dto) {
        var _a, _b, _c;
        const config = this.providerConfigs.flutterwave;
        try {
            const response = await axios_1.default.post(`${config.apiUrl}/virtual-account-numbers`, {
                email: `${dto.userId}@platform.com`,
                is_permanent: true,
                bvn: (_a = dto.metadata) === null || _a === void 0 ? void 0 : _a.bvn,
                tx_ref: (0, uuid_1.v4)(),
                narration: dto.accountName,
            }, {
                headers: {
                    Authorization: `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.data.status !== 'success') {
                throw new common_1.BadRequestException(response.data.message || 'Failed to create virtual account');
            }
            const data = response.data.data;
            return {
                accountNumber: data.account_number,
                accountName: data.account_name,
                bankName: data.bank_name,
                bankCode: data.bank_code,
                providerId: data.id.toString(),
                providerAccountId: data.flw_ref,
                providerData: data,
            };
        }
        catch (error) {
            this.logger.error(`Flutterwave virtual account creation failed: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to create virtual account: ${((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || error.message}`);
        }
    }
    async createVirtualAccountViaWoven(dto) {
        var _a, _b, _c, _d, _e, _f;
        const config = this.providerConfigs.woven;
        try {
            const response = await axios_1.default.post(`${config.apiUrl}/accounts/virtual`, {
                first_name: ((_a = dto.metadata) === null || _a === void 0 ? void 0 : _a.firstName) || 'User',
                last_name: ((_b = dto.metadata) === null || _b === void 0 ? void 0 : _b.lastName) || dto.userId,
                email: ((_c = dto.metadata) === null || _c === void 0 ? void 0 : _c.email) || `${dto.userId}@platform.com`,
                phone_number: (_d = dto.metadata) === null || _d === void 0 ? void 0 : _d.phone,
                currency: dto.currency,
                account_name: dto.accountName,
            }, {
                headers: {
                    Authorization: `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            const data = response.data.data;
            return {
                accountNumber: data.account_number,
                accountName: data.account_name,
                bankName: data.bank_name,
                bankCode: data.bank_code,
                providerId: data.id,
                providerAccountId: data.reference,
                providerData: data,
            };
        }
        catch (error) {
            this.logger.error(`Woven virtual account creation failed: ${error.message}`);
            throw new common_1.BadRequestException(`Failed to create virtual account: ${((_f = (_e = error.response) === null || _e === void 0 ? void 0 : _e.data) === null || _f === void 0 ? void 0 : _f.message) || error.message}`);
        }
    }
    async createVirtualAccountViaProvider(dto) {
        switch (dto.provider) {
            case 'paystack':
                return this.createVirtualAccountViaPaystack(dto);
            case 'flutterwave':
                return this.createVirtualAccountViaFlutterwave(dto);
            case 'woven':
                return this.createVirtualAccountViaWoven(dto);
            case 'budpay':
            case 'monnify':
            case 'korapay':
                throw new common_1.BadRequestException(`Provider ${dto.provider} not yet implemented`);
            default:
                throw new common_1.BadRequestException(`Unknown provider: ${dto.provider}`);
        }
    }
    async getVirtualAccount(virtualAccountId) {
        const account = await this.virtualAccountRepository.findOne({
            where: { virtualAccountId },
        });
        if (!account) {
            throw new common_1.NotFoundException('Virtual account not found');
        }
        return account;
    }
    async getUserVirtualAccounts(userId) {
        return this.virtualAccountRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
        });
    }
    async getVirtualAccountTransactions(virtualAccountId, limit = 50, offset = 0) {
        return this.transactionRepository.find({
            where: { virtualAccountId },
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
    }
    async suspendVirtualAccount(virtualAccountId, reason) {
        const account = await this.getVirtualAccount(virtualAccountId);
        account.status = 'suspended';
        account.suspendedAt = new Date();
        account.suspensionReason = reason;
        return this.virtualAccountRepository.save(account);
    }
    async reactivateVirtualAccount(virtualAccountId) {
        const account = await this.getVirtualAccount(virtualAccountId);
        account.status = 'active';
        account.suspendedAt = null;
        account.suspensionReason = null;
        return this.virtualAccountRepository.save(account);
    }
    async handleWebhook(provider, payload, signature) {
        this.logger.log(`Received webhook from ${provider}`);
        if (!this.verifyWebhookSignature(provider, payload, signature)) {
            throw new common_1.BadRequestException('Invalid webhook signature');
        }
        switch (provider) {
            case 'paystack':
                return this.handlePaystackWebhook(payload);
            case 'flutterwave':
                return this.handleFlutterwaveWebhook(payload);
            case 'woven':
                return this.handleWovenWebhook(payload);
            default:
                throw new common_1.BadRequestException(`Unknown provider: ${provider}`);
        }
    }
    async handlePaystackWebhook(payload) {
        var _a;
        const event = payload.event;
        if (event === 'charge.success' && payload.data.channel === 'dedicated_nuban') {
            const account = await this.virtualAccountRepository.findOne({
                where: {
                    accountNumber: payload.data.authorization.receiver_account_number,
                },
            });
            if (account) {
                await this.processPayment({
                    virtualAccountId: account.virtualAccountId,
                    amount: (payload.data.amount / 100).toString(),
                    currency: payload.data.currency,
                    senderAccountName: (_a = payload.data.customer) === null || _a === void 0 ? void 0 : _a.name,
                    reference: payload.data.reference,
                    sessionId: payload.data.id.toString(),
                    narration: payload.data.narration,
                    providerTransactionId: payload.data.id.toString(),
                    providerData: payload.data,
                });
            }
        }
        return { received: true };
    }
    async handleFlutterwaveWebhook(payload) {
        return { received: true };
    }
    async handleWovenWebhook(payload) {
        return { received: true };
    }
    verifyWebhookSignature(provider, payload, signature) {
        const config = this.providerConfigs[provider];
        if (!config)
            return false;
        const hash = crypto
            .createHmac('sha512', config.apiKey)
            .update(JSON.stringify(payload))
            .digest('hex');
        return hash === signature;
    }
};
exports.VirtualAccountsService = VirtualAccountsService;
exports.VirtualAccountsService = VirtualAccountsService = VirtualAccountsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(virtual_account_entity_1.VirtualAccountEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(virtual_account_transaction_entity_1.VirtualAccountTransactionEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, wallets_service_1.WalletsService, typeof (_c = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _c : Object, typeof (_d = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _d : Object])
], VirtualAccountsService);
//# sourceMappingURL=virtual-accounts.service.js.map