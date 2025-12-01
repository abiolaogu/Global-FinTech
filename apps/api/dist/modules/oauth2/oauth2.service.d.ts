import { Repository } from 'typeorm';
import { OAuth2ClientEntity } from './entities/oauth2-client.entity';
import { OAuth2TokenEntity } from './entities/oauth2-token.entity';
import { OAuth2AuthorizationCodeEntity } from './entities/oauth2-authorization-code.entity';
import { ConfigService } from '@nestjs/config';
export interface CreateClientDto {
    name: string;
    redirectUris: string[];
    scopes: string[];
    partnerId: string;
}
export interface TokenResponse {
    access_token: string;
    token_type: 'Bearer';
    expires_in: number;
    refresh_token?: string;
    scope: string;
}
export declare class OAuth2Service {
    private readonly clientRepository;
    private readonly tokenRepository;
    private readonly authCodeRepository;
    private readonly configService;
    private readonly logger;
    private readonly accessTokenTTL;
    private readonly refreshTokenTTL;
    private readonly authCodeTTL;
    constructor(clientRepository: Repository<OAuth2ClientEntity>, tokenRepository: Repository<OAuth2TokenEntity>, authCodeRepository: Repository<OAuth2AuthorizationCodeEntity>, configService: ConfigService);
    registerClient(dto: CreateClientDto): Promise<OAuth2ClientEntity>;
    generateAuthorizationCode(clientId: string, userId: string, redirectUri: string, scope: string): Promise<string>;
    exchangeAuthorizationCode(code: string, clientId: string, clientSecret: string, redirectUri: string): Promise<TokenResponse>;
    refreshAccessToken(refreshToken: string, clientId: string, clientSecret: string): Promise<TokenResponse>;
    validateAccessToken(accessToken: string): Promise<{
        userId: string;
        clientId: string;
        scope: string;
    }>;
    revokeToken(token: string, clientId: string, clientSecret: string): Promise<void>;
    getClient(clientId: string): Promise<OAuth2ClientEntity>;
    deactivateClient(clientId: string, partnerId: string): Promise<void>;
    private validateClient;
    private validateClientCredentials;
    private generateClientId;
    private generateClientSecret;
    private generateSecureToken;
    private hashSecret;
    private generateAccessToken;
    private generateRefreshToken;
    getPartnerClients(partnerId: string): Promise<OAuth2ClientEntity[]>;
    getTokenStats(clientId: string): Promise<{
        totalTokens: number;
        activeTokens: number;
        revokedTokens: number;
    }>;
}
