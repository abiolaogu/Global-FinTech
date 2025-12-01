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
var OAuth2Service_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.OAuth2Service = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const oauth2_client_entity_1 = require("./entities/oauth2-client.entity");
const oauth2_token_entity_1 = require("./entities/oauth2-token.entity");
const oauth2_authorization_code_entity_1 = require("./entities/oauth2-authorization-code.entity");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const config_1 = require("@nestjs/config");
let OAuth2Service = OAuth2Service_1 = class OAuth2Service {
    constructor(clientRepository, tokenRepository, authCodeRepository, configService) {
        this.clientRepository = clientRepository;
        this.tokenRepository = tokenRepository;
        this.authCodeRepository = authCodeRepository;
        this.configService = configService;
        this.logger = new common_1.Logger(OAuth2Service_1.name);
        this.accessTokenTTL = 3600;
        this.refreshTokenTTL = 2592000;
        this.authCodeTTL = 600;
    }
    async registerClient(dto) {
        this.logger.log(`Registering OAuth2 client: ${dto.name}`);
        const clientId = this.generateClientId();
        const clientSecret = this.generateClientSecret();
        const clientSecretHash = await this.hashSecret(clientSecret);
        const client = this.clientRepository.create({
            clientId,
            clientSecretHash,
            name: dto.name,
            redirectUris: dto.redirectUris,
            scopes: dto.scopes,
            partnerId: dto.partnerId,
            isActive: true,
        });
        const savedClient = await this.clientRepository.save(client);
        this.logger.log(`OAuth2 client registered: ${clientId}`);
        return Object.assign(Object.assign({}, savedClient), { clientSecret });
    }
    async generateAuthorizationCode(clientId, userId, redirectUri, scope) {
        const client = await this.validateClient(clientId, redirectUri);
        const requestedScopes = scope.split(' ');
        const validScopes = requestedScopes.every((s) => client.scopes.includes(s));
        if (!validScopes) {
            throw new common_1.UnauthorizedException('Invalid scope');
        }
        const code = this.generateSecureToken();
        const expiresAt = new Date(Date.now() + this.authCodeTTL * 1000);
        const authCode = this.authCodeRepository.create({
            code,
            clientId,
            userId,
            redirectUri,
            scope,
            expiresAt,
        });
        await this.authCodeRepository.save(authCode);
        this.logger.log(`Authorization code generated for client ${clientId}, user ${userId}`);
        return code;
    }
    async exchangeAuthorizationCode(code, clientId, clientSecret, redirectUri) {
        await this.validateClientCredentials(clientId, clientSecret);
        const authCode = await this.authCodeRepository.findOne({
            where: { code, clientId, used: false },
        });
        if (!authCode) {
            throw new common_1.UnauthorizedException('Invalid authorization code');
        }
        if (authCode.expiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Authorization code expired');
        }
        if (authCode.redirectUri !== redirectUri) {
            throw new common_1.UnauthorizedException('Redirect URI mismatch');
        }
        authCode.used = true;
        await this.authCodeRepository.save(authCode);
        const accessToken = this.generateAccessToken(authCode.userId, clientId, authCode.scope);
        const refreshToken = this.generateRefreshToken(authCode.userId, clientId, authCode.scope);
        const tokenEntity = this.tokenRepository.create({
            accessToken: await this.hashSecret(accessToken),
            refreshToken: await this.hashSecret(refreshToken),
            clientId,
            userId: authCode.userId,
            scope: authCode.scope,
            accessTokenExpiresAt: new Date(Date.now() + this.accessTokenTTL * 1000),
            refreshTokenExpiresAt: new Date(Date.now() + this.refreshTokenTTL * 1000),
        });
        await this.tokenRepository.save(tokenEntity);
        this.logger.log(`Access token issued for client ${clientId}, user ${authCode.userId}`);
        return {
            access_token: accessToken,
            token_type: 'Bearer',
            expires_in: this.accessTokenTTL,
            refresh_token: refreshToken,
            scope: authCode.scope,
        };
    }
    async refreshAccessToken(refreshToken, clientId, clientSecret) {
        await this.validateClientCredentials(clientId, clientSecret);
        const refreshTokenHash = await this.hashSecret(refreshToken);
        const tokenEntity = await this.tokenRepository.findOne({
            where: { refreshToken: refreshTokenHash, clientId, revoked: false },
        });
        if (!tokenEntity) {
            throw new common_1.UnauthorizedException('Invalid refresh token');
        }
        if (tokenEntity.refreshTokenExpiresAt < new Date()) {
            throw new common_1.UnauthorizedException('Refresh token expired');
        }
        const newAccessToken = this.generateAccessToken(tokenEntity.userId, clientId, tokenEntity.scope);
        tokenEntity.accessToken = await this.hashSecret(newAccessToken);
        tokenEntity.accessTokenExpiresAt = new Date(Date.now() + this.accessTokenTTL * 1000);
        await this.tokenRepository.save(tokenEntity);
        this.logger.log(`Access token refreshed for client ${clientId}, user ${tokenEntity.userId}`);
        return {
            access_token: newAccessToken,
            token_type: 'Bearer',
            expires_in: this.accessTokenTTL,
            scope: tokenEntity.scope,
        };
    }
    async validateAccessToken(accessToken) {
        try {
            const decoded = jwt.verify(accessToken, this.configService.get('OAUTH2_SECRET'));
            const accessTokenHash = await this.hashSecret(accessToken);
            const tokenEntity = await this.tokenRepository.findOne({
                where: { accessToken: accessTokenHash, revoked: false },
            });
            if (!tokenEntity) {
                throw new common_1.UnauthorizedException('Token revoked');
            }
            if (tokenEntity.accessTokenExpiresAt < new Date()) {
                throw new common_1.UnauthorizedException('Token expired');
            }
            return {
                userId: decoded.sub,
                clientId: decoded.client_id,
                scope: decoded.scope,
            };
        }
        catch (error) {
            throw new common_1.UnauthorizedException('Invalid access token');
        }
    }
    async revokeToken(token, clientId, clientSecret) {
        await this.validateClientCredentials(clientId, clientSecret);
        const tokenHash = await this.hashSecret(token);
        const tokenEntity = await this.tokenRepository.findOne({
            where: [
                { accessToken: tokenHash, clientId },
                { refreshToken: tokenHash, clientId },
            ],
        });
        if (tokenEntity) {
            tokenEntity.revoked = true;
            await this.tokenRepository.save(tokenEntity);
            this.logger.log(`Token revoked for client ${clientId}`);
        }
    }
    async getClient(clientId) {
        const client = await this.clientRepository.findOne({
            where: { clientId, isActive: true },
        });
        if (!client) {
            throw new common_1.UnauthorizedException('Client not found');
        }
        return client;
    }
    async deactivateClient(clientId, partnerId) {
        const client = await this.clientRepository.findOne({
            where: { clientId, partnerId },
        });
        if (!client) {
            throw new common_1.UnauthorizedException('Client not found');
        }
        client.isActive = false;
        await this.clientRepository.save(client);
        await this.tokenRepository.update({ clientId }, { revoked: true });
        this.logger.log(`OAuth2 client deactivated: ${clientId}`);
    }
    async validateClient(clientId, redirectUri) {
        const client = await this.getClient(clientId);
        if (!client.redirectUris.includes(redirectUri)) {
            throw new common_1.UnauthorizedException('Invalid redirect URI');
        }
        return client;
    }
    async validateClientCredentials(clientId, clientSecret) {
        const client = await this.getClient(clientId);
        const secretHash = await this.hashSecret(clientSecret);
        if (client.clientSecretHash !== secretHash) {
            throw new common_1.UnauthorizedException('Invalid client credentials');
        }
    }
    generateClientId() {
        return `client_${crypto.randomBytes(16).toString('hex')}`;
    }
    generateClientSecret() {
        return crypto.randomBytes(32).toString('base64');
    }
    generateSecureToken() {
        return crypto.randomBytes(32).toString('hex');
    }
    async hashSecret(secret) {
        return crypto.createHash('sha256').update(secret).digest('hex');
    }
    generateAccessToken(userId, clientId, scope) {
        return jwt.sign({
            sub: userId,
            client_id: clientId,
            scope,
            type: 'access',
        }, this.configService.get('OAUTH2_SECRET'), { expiresIn: this.accessTokenTTL });
    }
    generateRefreshToken(userId, clientId, scope) {
        return jwt.sign({
            sub: userId,
            client_id: clientId,
            scope,
            type: 'refresh',
        }, this.configService.get('OAUTH2_SECRET'), { expiresIn: this.refreshTokenTTL });
    }
    async getPartnerClients(partnerId) {
        return this.clientRepository.find({
            where: { partnerId },
            order: { createdAt: 'DESC' },
        });
    }
    async getTokenStats(clientId) {
        const [totalTokens, activeTokens, revokedTokens] = await Promise.all([
            this.tokenRepository.count({ where: { clientId } }),
            this.tokenRepository.count({
                where: { clientId, revoked: false },
            }),
            this.tokenRepository.count({
                where: { clientId, revoked: true },
            }),
        ]);
        return {
            totalTokens,
            activeTokens,
            revokedTokens,
        };
    }
};
exports.OAuth2Service = OAuth2Service;
exports.OAuth2Service = OAuth2Service = OAuth2Service_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(oauth2_client_entity_1.OAuth2ClientEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(oauth2_token_entity_1.OAuth2TokenEntity)),
    __param(2, (0, typeorm_1.InjectRepository)(oauth2_authorization_code_entity_1.OAuth2AuthorizationCodeEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _c : Object, typeof (_d = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _d : Object])
], OAuth2Service);
//# sourceMappingURL=oauth2.service.js.map