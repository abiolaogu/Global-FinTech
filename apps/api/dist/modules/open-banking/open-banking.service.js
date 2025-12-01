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
var OpenBankingService_1;
var _a, _b, _c;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OpenBankingService = void 0;
const common_1 = require("@nestjs/common");
const axios_1 = require("@nestjs/axios");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const open_banking_connection_entity_1 = require("./entities/open-banking-connection.entity");
const rxjs_1 = require("rxjs");
const crypto = require("crypto");
let OpenBankingService = OpenBankingService_1 = class OpenBankingService {
    constructor(connectionRepository, httpService, configService) {
        this.connectionRepository = connectionRepository;
        this.httpService = httpService;
        this.configService = configService;
        this.logger = new common_1.Logger(OpenBankingService_1.name);
        this.plaidClientId = this.configService.get('PLAID_CLIENT_ID');
        this.plaidSecret = this.configService.get('PLAID_SECRET');
        this.plaidEnv = this.configService.get('PLAID_ENV') || 'sandbox';
    }
    async createLinkToken(dto) {
        this.logger.log(`Creating Plaid Link token for user ${dto.userId}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`https://${this.plaidEnv}.plaid.com/link/token/create`, {
                client_id: this.plaidClientId,
                secret: this.plaidSecret,
                user: {
                    client_user_id: dto.userId,
                },
                client_name: 'AtlasX',
                products: ['auth', 'transactions', 'identity', 'assets'],
                country_codes: ['US', 'GB', 'EU'],
                language: 'en',
                redirect_uri: dto.redirectUrl,
            }));
            return response.data.link_token;
        }
        catch (error) {
            this.logger.error(`Failed to create Link token: ${error.message}`);
            throw new common_1.BadRequestException('Failed to initiate bank connection');
        }
    }
    async exchangePublicToken(userId, publicToken, institutionId) {
        this.logger.log(`Exchanging public token for user ${userId}`);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`https://${this.plaidEnv}.plaid.com/item/public_token/exchange`, {
                client_id: this.plaidClientId,
                secret: this.plaidSecret,
                public_token: publicToken,
            }));
            const { access_token, item_id } = response.data;
            const encryptedToken = this.encryptToken(access_token);
            const connection = this.connectionRepository.create({
                userId,
                institutionId,
                accessTokenHash: encryptedToken,
                itemId: item_id,
                status: 'active',
                consentExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
            });
            const savedConnection = await this.connectionRepository.save(connection);
            this.logger.log(`Open Banking connection established: ${savedConnection.connectionId}`);
            return savedConnection;
        }
        catch (error) {
            this.logger.error(`Failed to exchange token: ${error.message}`);
            throw new common_1.BadRequestException('Failed to establish bank connection');
        }
    }
    async getAccounts(connectionId, userId) {
        const connection = await this.getConnection(connectionId, userId);
        const accessToken = this.decryptToken(connection.accessTokenHash);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`https://${this.plaidEnv}.plaid.com/accounts/get`, {
                client_id: this.plaidClientId,
                secret: this.plaidSecret,
                access_token: accessToken,
            }));
            return response.data.accounts.map((account) => {
                var _a, _b;
                return ({
                    accountId: account.account_id,
                    institutionId: connection.institutionId,
                    accountName: account.name,
                    accountType: account.type,
                    currency: account.balances.iso_currency_code || 'USD',
                    balance: ((_a = account.balances.current) === null || _a === void 0 ? void 0 : _a.toString()) || '0',
                    availableBalance: ((_b = account.balances.available) === null || _b === void 0 ? void 0 : _b.toString()) || '0',
                    lastUpdated: new Date(),
                });
            });
        }
        catch (error) {
            this.logger.error(`Failed to get accounts: ${error.message}`);
            throw new common_1.BadRequestException('Failed to retrieve accounts');
        }
    }
    async getTransactions(connectionId, userId, startDate, endDate) {
        const connection = await this.getConnection(connectionId, userId);
        const accessToken = this.decryptToken(connection.accessTokenHash);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`https://${this.plaidEnv}.plaid.com/transactions/get`, {
                client_id: this.plaidClientId,
                secret: this.plaidSecret,
                access_token: accessToken,
                start_date: startDate.toISOString().split('T')[0],
                end_date: endDate.toISOString().split('T')[0],
            }));
            return response.data.transactions;
        }
        catch (error) {
            this.logger.error(`Failed to get transactions: ${error.message}`);
            throw new common_1.BadRequestException('Failed to retrieve transactions');
        }
    }
    async getIdentity(connectionId, userId) {
        const connection = await this.getConnection(connectionId, userId);
        const accessToken = this.decryptToken(connection.accessTokenHash);
        try {
            const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`https://${this.plaidEnv}.plaid.com/identity/get`, {
                client_id: this.plaidClientId,
                secret: this.plaidSecret,
                access_token: accessToken,
            }));
            return response.data.accounts;
        }
        catch (error) {
            this.logger.error(`Failed to get identity: ${error.message}`);
            throw new common_1.BadRequestException('Failed to retrieve identity data');
        }
    }
    async refreshConnection(connectionId, userId) {
        const connection = await this.getConnection(connectionId, userId);
        const response = await (0, rxjs_1.firstValueFrom)(this.httpService.post(`https://${this.plaidEnv}.plaid.com/link/token/create`, {
            client_id: this.plaidClientId,
            secret: this.plaidSecret,
            user: {
                client_user_id: userId,
            },
            access_token: this.decryptToken(connection.accessTokenHash),
            client_name: 'AtlasX',
        }));
        return response.data.link_token;
    }
    async disconnectConnection(connectionId, userId) {
        const connection = await this.getConnection(connectionId, userId);
        connection.status = 'disconnected';
        connection.disconnectedAt = new Date();
        await this.connectionRepository.save(connection);
        this.logger.log(`Open Banking connection disconnected: ${connectionId}`);
    }
    async getUserConnections(userId) {
        return this.connectionRepository.find({
            where: { userId, status: 'active' },
            order: { createdAt: 'DESC' },
        });
    }
    async getConnection(connectionId, userId) {
        const connection = await this.connectionRepository.findOne({
            where: { connectionId, userId },
        });
        if (!connection) {
            throw new common_1.BadRequestException('Connection not found');
        }
        if (connection.status !== 'active') {
            throw new common_1.BadRequestException('Connection is not active');
        }
        if (connection.consentExpiresAt < new Date()) {
            throw new common_1.BadRequestException('Connection consent has expired. Please re-authenticate.');
        }
        return connection;
    }
    encryptToken(token) {
        const algorithm = 'aes-256-gcm';
        const key = Buffer.from(this.configService.get('ENCRYPTION_KEY'), 'hex');
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(token, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const tag = cipher.getAuthTag();
        return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
    }
    decryptToken(encryptedToken) {
        const algorithm = 'aes-256-gcm';
        const key = Buffer.from(this.configService.get('ENCRYPTION_KEY'), 'hex');
        const parts = encryptedToken.split(':');
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        const tag = Buffer.from(parts[2], 'hex');
        const decipher = crypto.createDecipheriv(algorithm, key, iv);
        decipher.setAuthTag(tag);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
};
exports.OpenBankingService = OpenBankingService;
exports.OpenBankingService = OpenBankingService = OpenBankingService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(open_banking_connection_entity_1.OpenBankingConnectionEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof axios_1.HttpService !== "undefined" && axios_1.HttpService) === "function" ? _b : Object, typeof (_c = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _c : Object])
], OpenBankingService);
//# sourceMappingURL=open-banking.service.js.map