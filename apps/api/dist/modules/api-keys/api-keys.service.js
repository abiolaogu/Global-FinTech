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
var ApiKeysService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeysService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const api_key_entity_1 = require("./entities/api-key.entity");
const crypto = require("crypto");
let ApiKeysService = ApiKeysService_1 = class ApiKeysService {
    constructor(apiKeyRepository) {
        this.apiKeyRepository = apiKeyRepository;
        this.logger = new common_1.Logger(ApiKeysService_1.name);
    }
    async createApiKey(dto) {
        this.logger.log(`Creating API key for partner ${dto.partnerId}: ${dto.name}`);
        const apiKey = this.generateApiKey();
        const apiKeyHash = this.hashApiKey(apiKey);
        const entity = this.apiKeyRepository.create({
            name: dto.name,
            partnerId: dto.partnerId,
            keyHash: apiKeyHash,
            keyPrefix: apiKey.substring(0, 8),
            scopes: dto.scopes,
            rateLimit: dto.rateLimit || 100,
            ipWhitelist: dto.ipWhitelist || [],
            isActive: true,
            lastUsedAt: null,
        });
        const savedEntity = await this.apiKeyRepository.save(entity);
        this.logger.log(`API key created: ${savedEntity.keyId}`);
        return {
            apiKey,
            entity: savedEntity,
        };
    }
    async validateApiKey(apiKey, ipAddress) {
        const keyHash = this.hashApiKey(apiKey);
        const keyPrefix = apiKey.substring(0, 8);
        const entity = await this.apiKeyRepository.findOne({
            where: {
                keyPrefix,
                keyHash,
                isActive: true,
            },
        });
        if (!entity) {
            throw new common_1.UnauthorizedException('Invalid API key');
        }
        if (entity.ipWhitelist.length > 0 && ipAddress) {
            if (!entity.ipWhitelist.includes(ipAddress)) {
                this.logger.warn(`API key ${entity.keyId} used from unauthorized IP: ${ipAddress}`);
                throw new common_1.UnauthorizedException('IP address not whitelisted');
            }
        }
        entity.lastUsedAt = new Date();
        await this.apiKeyRepository.save(entity);
        return entity;
    }
    async revokeApiKey(keyId, partnerId) {
        const entity = await this.apiKeyRepository.findOne({
            where: { keyId, partnerId },
        });
        if (!entity) {
            throw new common_1.UnauthorizedException('API key not found');
        }
        entity.isActive = false;
        entity.revokedAt = new Date();
        await this.apiKeyRepository.save(entity);
        this.logger.log(`API key revoked: ${keyId}`);
    }
    async rotateApiKey(keyId, partnerId) {
        const oldEntity = await this.apiKeyRepository.findOne({
            where: { keyId, partnerId },
        });
        if (!oldEntity) {
            throw new common_1.UnauthorizedException('API key not found');
        }
        const newKey = await this.createApiKey({
            name: `${oldEntity.name} (rotated)`,
            partnerId: oldEntity.partnerId,
            scopes: oldEntity.scopes,
            rateLimit: oldEntity.rateLimit,
            ipWhitelist: oldEntity.ipWhitelist,
        });
        await this.revokeApiKey(keyId, partnerId);
        this.logger.log(`API key rotated: ${keyId} -> ${newKey.entity.keyId}`);
        return newKey;
    }
    async getPartnerApiKeys(partnerId) {
        return this.apiKeyRepository.find({
            where: { partnerId },
            order: { createdAt: 'DESC' },
        });
    }
    async updateApiKey(keyId, partnerId, updates) {
        const entity = await this.apiKeyRepository.findOne({
            where: { keyId, partnerId },
        });
        if (!entity) {
            throw new common_1.UnauthorizedException('API key not found');
        }
        if (updates.name)
            entity.name = updates.name;
        if (updates.scopes)
            entity.scopes = updates.scopes;
        if (updates.rateLimit)
            entity.rateLimit = updates.rateLimit;
        if (updates.ipWhitelist)
            entity.ipWhitelist = updates.ipWhitelist;
        const updated = await this.apiKeyRepository.save(entity);
        this.logger.log(`API key updated: ${keyId}`);
        return updated;
    }
    async getApiKeyStats(keyId, partnerId) {
        const entity = await this.apiKeyRepository.findOne({
            where: { keyId, partnerId },
        });
        if (!entity) {
            throw new common_1.UnauthorizedException('API key not found');
        }
        return {
            totalRequests: 0,
            lastUsed: entity.lastUsedAt,
            createdAt: entity.createdAt,
            isActive: entity.isActive,
        };
    }
    generateApiKey() {
        const random = crypto.randomBytes(24).toString('hex');
        return `atx_live_${random}`;
    }
    hashApiKey(apiKey) {
        return crypto.createHash('sha256').update(apiKey).digest('hex');
    }
};
exports.ApiKeysService = ApiKeysService;
exports.ApiKeysService = ApiKeysService = ApiKeysService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(api_key_entity_1.ApiKeyEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object])
], ApiKeysService);
//# sourceMappingURL=api-keys.service.js.map