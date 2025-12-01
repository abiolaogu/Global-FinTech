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
var PaymentGatewaysService_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGatewaysService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const payment_gateway_entity_1 = require("./entities/payment-gateway.entity");
const payment_transaction_entity_1 = require("./entities/payment-transaction.entity");
const wallets_service_1 = require("../wallets/wallets.service");
const split_payments_service_1 = require("../split-payments/split-payments.service");
const event_emitter_1 = require("@nestjs/event-emitter");
const uuid_1 = require("uuid");
const axios_1 = require("axios");
const crypto = require("crypto");
const decimal_js_1 = require("decimal.js");
let PaymentGatewaysService = PaymentGatewaysService_1 = class PaymentGatewaysService {
    constructor(gatewayRepository, transactionRepository, walletsService, splitPaymentsService, dataSource, eventEmitter) {
        this.gatewayRepository = gatewayRepository;
        this.transactionRepository = transactionRepository;
        this.walletsService = walletsService;
        this.splitPaymentsService = splitPaymentsService;
        this.dataSource = dataSource;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(PaymentGatewaysService_1.name);
        this.providerConfigs = {
            paystack: {
                name: 'Paystack',
                apiUrl: 'https://api.paystack.co',
                apiKey: process.env.PAYSTACK_SECRET_KEY,
                publicKey: process.env.PAYSTACK_PUBLIC_KEY,
                supportedCurrencies: ['NGN', 'GHS', 'ZAR', 'USD'],
                supportedCountries: ['NG', 'GH', 'ZA', 'KE'],
                paymentMethods: ['card', 'bank', 'bank_transfer', 'ussd', 'qr', 'mobile_money'],
                feePercentage: 1.5,
                feeCap: 2000,
            },
            flutterwave: {
                name: 'Flutterwave',
                apiUrl: 'https://api.flutterwave.com/v3',
                apiKey: process.env.FLUTTERWAVE_SECRET_KEY,
                publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY,
                supportedCurrencies: ['NGN', 'USD', 'GBP', 'EUR', 'GHS', 'KES', 'UGX', 'TZS', 'ZAR', 'RWF'],
                supportedCountries: ['NG', 'GH', 'KE', 'UG', 'TZ', 'ZA', 'RW'],
                paymentMethods: ['card', 'account', 'ussd', 'mpesa', 'ghana_mobile_money', 'uganda_mobile_money', 'bank_transfer'],
                feePercentage: 1.4,
            },
            stripe: {
                name: 'Stripe',
                apiUrl: 'https://api.stripe.com/v1',
                apiKey: process.env.STRIPE_SECRET_KEY,
                publicKey: process.env.STRIPE_PUBLIC_KEY,
                supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
                supportedCountries: ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'IT', 'ES'],
                paymentMethods: ['card', 'apple_pay', 'google_pay', 'bank_transfer', 'sepa_debit'],
                feePercentage: 2.9,
                feeFixed: 0.30,
            },
            razorpay: {
                name: 'Razorpay',
                apiUrl: 'https://api.razorpay.com/v1',
                apiKey: process.env.RAZORPAY_KEY_ID,
                secretKey: process.env.RAZORPAY_KEY_SECRET,
                supportedCurrencies: ['INR'],
                supportedCountries: ['IN'],
                paymentMethods: ['card', 'netbanking', 'wallet', 'upi', 'emi'],
                feePercentage: 2.0,
            },
            payu: {
                name: 'PayU',
                apiUrl: 'https://secure.payu.com/api/v2_1',
                apiKey: process.env.PAYU_API_KEY,
                supportedCurrencies: ['PLN', 'CZK', 'RON', 'HUF', 'UAH'],
                supportedCountries: ['PL', 'CZ', 'RO', 'HU', 'UA'],
                paymentMethods: ['card', 'bank_transfer', 'cash', 'installments'],
                feePercentage: 1.9,
            },
            mercadopago: {
                name: 'Mercado Pago',
                apiUrl: 'https://api.mercadopago.com/v1',
                apiKey: process.env.MERCADOPAGO_ACCESS_TOKEN,
                supportedCurrencies: ['BRL', 'ARS', 'MXN', 'CLP', 'COP', 'PEN', 'UYU'],
                supportedCountries: ['BR', 'AR', 'MX', 'CL', 'CO', 'PE', 'UY'],
                paymentMethods: ['credit_card', 'debit_card', 'ticket', 'bank_transfer', 'pix'],
                feePercentage: 3.99,
            },
            khalti: {
                name: 'Khalti',
                apiUrl: 'https://khalti.com/api/v2',
                apiKey: process.env.KHALTI_SECRET_KEY,
                supportedCurrencies: ['NPR'],
                supportedCountries: ['NP'],
                paymentMethods: ['khalti', 'ebanking', 'mobile_banking', 'connect_ips', 'sct'],
                feePercentage: 2.5,
            },
            paymongo: {
                name: 'PayMongo',
                apiUrl: 'https://api.paymongo.com/v1',
                apiKey: process.env.PAYMONGO_SECRET_KEY,
                supportedCurrencies: ['PHP'],
                supportedCountries: ['PH'],
                paymentMethods: ['card', 'gcash', 'grab_pay', 'paymaya'],
                feePercentage: 2.9,
                feeFixed: 15,
            },
        };
    }
    async initiatePayment(dto, provider) {
        this.logger.log(`Initiating payment via ${provider}: ${dto.amount} ${dto.currency}`);
        const gateway = await this.selectGateway(provider, dto.currency);
        const reference = this.generateReference();
        const amount = new decimal_js_1.default(dto.amount);
        const fee = this.calculateFee(provider, amount, dto.currency);
        const netAmount = amount.minus(fee);
        const transaction = this.transactionRepository.create({
            transactionId: (0, uuid_1.v4)(),
            userId: dto.userId,
            merchantId: dto.merchantId,
            gatewayId: gateway.gatewayId,
            provider,
            amount: amount.toString(),
            currency: dto.currency,
            status: 'pending',
            reference,
            paymentMethod: dto.paymentMethod || 'card',
            description: dto.description,
            customer: dto.customer,
            fee: fee.toString(),
            netAmount: netAmount.toString(),
            callbackUrl: dto.callbackUrl,
            redirectUrl: dto.redirectUrl,
            metadata: dto.metadata || {},
        });
        await this.transactionRepository.save(transaction);
        const providerResponse = await this.initializePaymentWithProvider(provider, transaction, dto);
        transaction.providerReference = providerResponse.reference;
        transaction.authorizationUrl = providerResponse.authorizationUrl;
        transaction.accessCode = providerResponse.accessCode;
        transaction.providerResponse = providerResponse.rawResponse;
        await this.transactionRepository.save(transaction);
        this.eventEmitter.emit('payment.initiated', {
            transactionId: transaction.transactionId,
            reference,
            provider,
            amount: dto.amount,
            currency: dto.currency,
        });
        this.logger.log(`Payment initiated: ${transaction.transactionId}`);
        return transaction;
    }
    async initializePaymentWithPaystack(transaction, dto) {
        var _a, _b, _c;
        const config = this.providerConfigs.paystack;
        try {
            const response = await axios_1.default.post(`${config.apiUrl}/transaction/initialize`, {
                email: ((_a = dto.customer) === null || _a === void 0 ? void 0 : _a.email) || `${dto.userId}@platform.com`,
                amount: Math.round(parseFloat(dto.amount) * 100),
                currency: dto.currency,
                reference: transaction.reference,
                callback_url: dto.callbackUrl,
                metadata: Object.assign(Object.assign({}, dto.metadata), { userId: dto.userId, transactionId: transaction.transactionId }),
                channels: dto.paymentMethod ? [dto.paymentMethod] : undefined,
            }, {
                headers: {
                    Authorization: `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            if (!response.data.status) {
                throw new common_1.BadRequestException(response.data.message);
            }
            return {
                reference: transaction.reference,
                authorizationUrl: response.data.data.authorization_url,
                accessCode: response.data.data.access_code,
                rawResponse: response.data,
            };
        }
        catch (error) {
            this.logger.error(`Paystack initialization failed: ${error.message}`);
            throw new common_1.BadRequestException(((_c = (_b = error.response) === null || _b === void 0 ? void 0 : _b.data) === null || _c === void 0 ? void 0 : _c.message) || error.message);
        }
    }
    async initializePaymentWithFlutterwave(transaction, dto) {
        var _a, _b, _c, _d, _e;
        const config = this.providerConfigs.flutterwave;
        try {
            const response = await axios_1.default.post(`${config.apiUrl}/payments`, {
                tx_ref: transaction.reference,
                amount: dto.amount,
                currency: dto.currency,
                redirect_url: dto.callbackUrl || dto.redirectUrl,
                payment_options: dto.paymentMethod || 'card,account,ussd,mpesa',
                customer: {
                    email: ((_a = dto.customer) === null || _a === void 0 ? void 0 : _a.email) || `${dto.userId}@platform.com`,
                    name: ((_b = dto.customer) === null || _b === void 0 ? void 0 : _b.name) || 'Customer',
                    phonenumber: (_c = dto.customer) === null || _c === void 0 ? void 0 : _c.phone,
                },
                customizations: {
                    title: 'Payment',
                    description: dto.description || 'Payment',
                },
                meta: Object.assign(Object.assign({}, dto.metadata), { userId: dto.userId, transactionId: transaction.transactionId }),
            }, {
                headers: {
                    Authorization: `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/json',
                },
            });
            if (response.data.status !== 'success') {
                throw new common_1.BadRequestException(response.data.message);
            }
            return {
                reference: transaction.reference,
                authorizationUrl: response.data.data.link,
                accessCode: response.data.data.link,
                rawResponse: response.data,
            };
        }
        catch (error) {
            this.logger.error(`Flutterwave initialization failed: ${error.message}`);
            throw new common_1.BadRequestException(((_e = (_d = error.response) === null || _d === void 0 ? void 0 : _d.data) === null || _e === void 0 ? void 0 : _e.message) || error.message);
        }
    }
    async initializePaymentWithStripe(transaction, dto) {
        var _a, _b;
        const config = this.providerConfigs.stripe;
        try {
            const response = await axios_1.default.post(`${config.apiUrl}/payment_intents`, new URLSearchParams({
                amount: Math.round(parseFloat(dto.amount) * 100).toString(),
                currency: dto.currency.toLowerCase(),
                'metadata[userId]': dto.userId || '',
                'metadata[transactionId]': transaction.transactionId,
                'metadata[reference]': transaction.reference,
            }), {
                headers: {
                    Authorization: `Bearer ${config.apiKey}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });
            return {
                reference: transaction.reference,
                authorizationUrl: `https://checkout.stripe.com/${response.data.client_secret}`,
                accessCode: response.data.client_secret,
                rawResponse: response.data,
            };
        }
        catch (error) {
            this.logger.error(`Stripe initialization failed: ${error.message}`);
            throw new common_1.BadRequestException(((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || error.message);
        }
    }
    async initializePaymentWithProvider(provider, transaction, dto) {
        switch (provider) {
            case 'paystack':
                return this.initializePaymentWithPaystack(transaction, dto);
            case 'flutterwave':
                return this.initializePaymentWithFlutterwave(transaction, dto);
            case 'stripe':
                return this.initializePaymentWithStripe(transaction, dto);
            case 'razorpay':
            case 'payu':
            case 'mercadopago':
            case 'khalti':
            case 'paymongo':
                throw new common_1.BadRequestException(`Provider ${provider} payment initialization not yet implemented`);
            default:
                throw new common_1.BadRequestException(`Unknown provider: ${provider}`);
        }
    }
    async verifyPayment(dto) {
        var _a;
        this.logger.log(`Verifying payment: ${dto.reference} via ${dto.provider}`);
        const transaction = await this.transactionRepository.findOne({
            where: { reference: dto.reference },
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        if (transaction.status === 'success') {
            return transaction;
        }
        const verification = await this.verifyPaymentWithProvider(dto.provider, dto.reference);
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            transaction.status = verification.success ? 'success' : 'failed';
            transaction.providerResponse = verification.data;
            if (verification.success) {
                transaction.paidAt = new Date();
                if (transaction.merchantId) {
                    const merchantWallets = await this.walletsService.getUserWallets(transaction.merchantId);
                    const merchantWallet = merchantWallets.find(w => w.currency === transaction.currency);
                    if (merchantWallet) {
                        await this.walletsService.creditWallet({
                            walletId: merchantWallet.walletId,
                            amount: transaction.netAmount,
                            category: 'payment_received',
                            description: transaction.description || 'Payment received',
                            metadata: {
                                transactionId: transaction.transactionId,
                                reference: transaction.reference,
                                customer: transaction.customer,
                            },
                            externalTransactionId: transaction.providerReference,
                            paymentMethod: transaction.paymentMethod,
                            paymentGateway: transaction.provider,
                        }, queryRunner);
                        if ((_a = transaction.metadata) === null || _a === void 0 ? void 0 : _a.splitConfigurationId) {
                            await this.splitPaymentsService.applySplitConfiguration(transaction.metadata.splitConfigurationId, transaction.transactionId, transaction.merchantId, transaction.amount, transaction.currency);
                        }
                    }
                }
            }
            else {
                transaction.failedAt = new Date();
                transaction.failureReason = verification.message;
                transaction.errorCode = verification.errorCode;
            }
            await queryRunner.manager.save(transaction);
            await queryRunner.commitTransaction();
            this.eventEmitter.emit('payment.verified', {
                transactionId: transaction.transactionId,
                reference: dto.reference,
                status: transaction.status,
            });
            this.logger.log(`Payment verified: ${transaction.transactionId} - ${transaction.status}`);
            return transaction;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Payment verification failed: ${error.message}`);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async verifyPaymentWithPaystack(reference) {
        var _a, _b;
        const config = this.providerConfigs.paystack;
        try {
            const response = await axios_1.default.get(`${config.apiUrl}/transaction/verify/${reference}`, {
                headers: {
                    Authorization: `Bearer ${config.apiKey}`,
                },
            });
            return {
                success: response.data.status && response.data.data.status === 'success',
                data: response.data.data,
                message: response.data.message,
            };
        }
        catch (error) {
            this.logger.error(`Paystack verification failed: ${error.message}`);
            return {
                success: false,
                message: ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || error.message,
            };
        }
    }
    async verifyPaymentWithFlutterwave(reference) {
        var _a, _b;
        const config = this.providerConfigs.flutterwave;
        try {
            const response = await axios_1.default.get(`${config.apiUrl}/transactions/verify_by_reference?tx_ref=${reference}`, {
                headers: {
                    Authorization: `Bearer ${config.apiKey}`,
                },
            });
            return {
                success: response.data.status === 'success' && response.data.data.status === 'successful',
                data: response.data.data,
                message: response.data.message,
            };
        }
        catch (error) {
            this.logger.error(`Flutterwave verification failed: ${error.message}`);
            return {
                success: false,
                message: ((_b = (_a = error.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.message) || error.message,
            };
        }
    }
    async verifyPaymentWithProvider(provider, reference) {
        switch (provider) {
            case 'paystack':
                return this.verifyPaymentWithPaystack(reference);
            case 'flutterwave':
                return this.verifyPaymentWithFlutterwave(reference);
            case 'stripe':
            case 'razorpay':
            case 'payu':
            case 'mercadopago':
            case 'khalti':
            case 'paymongo':
                throw new common_1.BadRequestException(`Provider ${provider} verification not yet implemented`);
            default:
                throw new common_1.BadRequestException(`Unknown provider: ${provider}`);
        }
    }
    async selectGateway(provider, currency) {
        const gateway = await this.gatewayRepository.findOne({
            where: {
                provider,
                isActive: true,
                isLive: true,
            },
        });
        if (!gateway) {
            return this.createPlatformGateway(provider, currency);
        }
        return gateway;
    }
    async createPlatformGateway(provider, currency) {
        const config = this.providerConfigs[provider];
        const gateway = this.gatewayRepository.create({
            gatewayId: (0, uuid_1.v4)(),
            userId: null,
            provider,
            name: `${config.name} (Platform)`,
            description: `Platform ${config.name} gateway`,
            credentialsEncrypted: this.encryptCredentials(JSON.stringify({
                apiKey: config.apiKey,
                publicKey: config.publicKey || config.apiKey,
                secretKey: config.secretKey,
            })),
            isLive: true,
            isActive: true,
            supportedCurrencies: config.supportedCurrencies,
            supportedCountries: config.supportedCountries,
            supportedPaymentMethods: config.paymentMethods,
            feeConfiguration: {
                type: 'platform',
            },
            totalProcessed: '0',
            transactionCount: 0,
            healthStatus: 'healthy',
        });
        return this.gatewayRepository.save(gateway);
    }
    calculateFee(provider, amount, currency) {
        const config = this.providerConfigs[provider];
        if (!config)
            return new decimal_js_1.default(0);
        const percentageFee = amount.times(config.feePercentage).dividedBy(100);
        const fixedFee = new decimal_js_1.default(config.feeFixed || 0);
        let totalFee = percentageFee.plus(fixedFee);
        if (config.feeCap) {
            const cap = new decimal_js_1.default(config.feeCap);
            totalFee = decimal_js_1.default.min(totalFee, cap);
        }
        return totalFee;
    }
    generateReference() {
        return `PAY-${Date.now()}-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
    }
    encryptCredentials(data) {
        const algorithm = 'aes-256-gcm';
        const key = Buffer.from(process.env.ENCRYPTION_KEY || '0'.repeat(64), 'hex');
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const tag = cipher.getAuthTag();
        return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
    }
    async getTransaction(transactionId) {
        const transaction = await this.transactionRepository.findOne({
            where: { transactionId },
        });
        if (!transaction) {
            throw new common_1.NotFoundException('Transaction not found');
        }
        return transaction;
    }
    async getUserTransactions(userId, limit = 50, offset = 0) {
        return this.transactionRepository.find({
            where: { userId },
            order: { createdAt: 'DESC' },
            take: limit,
            skip: offset,
        });
    }
};
exports.PaymentGatewaysService = PaymentGatewaysService;
exports.PaymentGatewaysService = PaymentGatewaysService = PaymentGatewaysService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(payment_gateway_entity_1.PaymentGatewayEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(payment_transaction_entity_1.PaymentTransactionEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, wallets_service_1.WalletsService,
        split_payments_service_1.SplitPaymentsService, typeof (_c = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _c : Object, typeof (_d = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _d : Object])
], PaymentGatewaysService);
//# sourceMappingURL=payment-gateways.service.js.map