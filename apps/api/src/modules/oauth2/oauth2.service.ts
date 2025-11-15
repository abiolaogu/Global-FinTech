import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OAuth2ClientEntity } from './entities/oauth2-client.entity';
import { OAuth2TokenEntity } from './entities/oauth2-token.entity';
import { OAuth2AuthorizationCodeEntity } from './entities/oauth2-authorization-code.entity';
import * as crypto from 'crypto';
import * as jwt from 'jsonwebtoken';
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

@Injectable()
export class OAuth2Service {
  private readonly logger = new Logger(OAuth2Service.name);
  private readonly accessTokenTTL = 3600; // 1 hour
  private readonly refreshTokenTTL = 2592000; // 30 days
  private readonly authCodeTTL = 600; // 10 minutes

  constructor(
    @InjectRepository(OAuth2ClientEntity)
    private readonly clientRepository: Repository<OAuth2ClientEntity>,
    @InjectRepository(OAuth2TokenEntity)
    private readonly tokenRepository: Repository<OAuth2TokenEntity>,
    @InjectRepository(OAuth2AuthorizationCodeEntity)
    private readonly authCodeRepository: Repository<OAuth2AuthorizationCodeEntity>,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register a new OAuth2 client (partner application)
   */
  async registerClient(dto: CreateClientDto): Promise<OAuth2ClientEntity> {
    this.logger.log(`Registering OAuth2 client: ${dto.name}`);

    // Generate client credentials
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

    // Return client with plain secret (only time it's visible)
    return {
      ...savedClient,
      clientSecret, // Include plain secret for partner to save
    } as any;
  }

  /**
   * Generate authorization code (OAuth2 authorization code flow)
   */
  async generateAuthorizationCode(
    clientId: string,
    userId: string,
    redirectUri: string,
    scope: string,
  ): Promise<string> {
    // Validate client
    const client = await this.validateClient(clientId, redirectUri);

    // Validate scope
    const requestedScopes = scope.split(' ');
    const validScopes = requestedScopes.every((s) => client.scopes.includes(s));

    if (!validScopes) {
      throw new UnauthorizedException('Invalid scope');
    }

    // Generate authorization code
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

  /**
   * Exchange authorization code for access token
   */
  async exchangeAuthorizationCode(
    code: string,
    clientId: string,
    clientSecret: string,
    redirectUri: string,
  ): Promise<TokenResponse> {
    // Validate client credentials
    await this.validateClientCredentials(clientId, clientSecret);

    // Find and validate authorization code
    const authCode = await this.authCodeRepository.findOne({
      where: { code, clientId, used: false as any },
    });

    if (!authCode) {
      throw new UnauthorizedException('Invalid authorization code');
    }

    if (authCode.expiresAt < new Date()) {
      throw new UnauthorizedException('Authorization code expired');
    }

    if (authCode.redirectUri !== redirectUri) {
      throw new UnauthorizedException('Redirect URI mismatch');
    }

    // Mark code as used
    authCode.used = true;
    await this.authCodeRepository.save(authCode);

    // Generate tokens
    const accessToken = this.generateAccessToken(authCode.userId, clientId, authCode.scope);
    const refreshToken = this.generateRefreshToken(authCode.userId, clientId, authCode.scope);

    // Store tokens
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

  /**
   * Exchange refresh token for new access token
   */
  async refreshAccessToken(
    refreshToken: string,
    clientId: string,
    clientSecret: string,
  ): Promise<TokenResponse> {
    // Validate client credentials
    await this.validateClientCredentials(clientId, clientSecret);

    // Find token
    const refreshTokenHash = await this.hashSecret(refreshToken);
    const tokenEntity = await this.tokenRepository.findOne({
      where: { refreshToken: refreshTokenHash, clientId, revoked: false as any },
    });

    if (!tokenEntity) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    if (tokenEntity.refreshTokenExpiresAt < new Date()) {
      throw new UnauthorizedException('Refresh token expired');
    }

    // Generate new access token
    const newAccessToken = this.generateAccessToken(
      tokenEntity.userId,
      clientId,
      tokenEntity.scope,
    );

    // Update token entity
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

  /**
   * Validate access token
   */
  async validateAccessToken(accessToken: string): Promise<{
    userId: string;
    clientId: string;
    scope: string;
  }> {
    try {
      const decoded = jwt.verify(
        accessToken,
        this.configService.get('OAUTH2_SECRET'),
      ) as any;

      // Check if token is revoked
      const accessTokenHash = await this.hashSecret(accessToken);
      const tokenEntity = await this.tokenRepository.findOne({
        where: { accessToken: accessTokenHash, revoked: false as any },
      });

      if (!tokenEntity) {
        throw new UnauthorizedException('Token revoked');
      }

      if (tokenEntity.accessTokenExpiresAt < new Date()) {
        throw new UnauthorizedException('Token expired');
      }

      return {
        userId: decoded.sub,
        clientId: decoded.client_id,
        scope: decoded.scope,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid access token');
    }
  }

  /**
   * Revoke token
   */
  async revokeToken(token: string, clientId: string, clientSecret: string): Promise<void> {
    // Validate client credentials
    await this.validateClientCredentials(clientId, clientSecret);

    const tokenHash = await this.hashSecret(token);

    // Find and revoke token
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

  /**
   * Get client by ID
   */
  async getClient(clientId: string): Promise<OAuth2ClientEntity> {
    const client = await this.clientRepository.findOne({
      where: { clientId, isActive: true as any },
    });

    if (!client) {
      throw new UnauthorizedException('Client not found');
    }

    return client;
  }

  /**
   * Deactivate client
   */
  async deactivateClient(clientId: string, partnerId: string): Promise<void> {
    const client = await this.clientRepository.findOne({
      where: { clientId, partnerId },
    });

    if (!client) {
      throw new UnauthorizedException('Client not found');
    }

    client.isActive = false;
    await this.clientRepository.save(client);

    // Revoke all tokens for this client
    await this.tokenRepository.update({ clientId }, { revoked: true });

    this.logger.log(`OAuth2 client deactivated: ${clientId}`);
  }

  // Private helper methods

  private async validateClient(clientId: string, redirectUri: string): Promise<OAuth2ClientEntity> {
    const client = await this.getClient(clientId);

    if (!client.redirectUris.includes(redirectUri)) {
      throw new UnauthorizedException('Invalid redirect URI');
    }

    return client;
  }

  private async validateClientCredentials(
    clientId: string,
    clientSecret: string,
  ): Promise<void> {
    const client = await this.getClient(clientId);

    const secretHash = await this.hashSecret(clientSecret);

    if (client.clientSecretHash !== secretHash) {
      throw new UnauthorizedException('Invalid client credentials');
    }
  }

  private generateClientId(): string {
    return `client_${crypto.randomBytes(16).toString('hex')}`;
  }

  private generateClientSecret(): string {
    return crypto.randomBytes(32).toString('base64');
  }

  private generateSecureToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  private async hashSecret(secret: string): Promise<string> {
    return crypto.createHash('sha256').update(secret).digest('hex');
  }

  private generateAccessToken(userId: string, clientId: string, scope: string): string {
    return jwt.sign(
      {
        sub: userId,
        client_id: clientId,
        scope,
        type: 'access',
      },
      this.configService.get('OAUTH2_SECRET'),
      { expiresIn: this.accessTokenTTL },
    );
  }

  private generateRefreshToken(userId: string, clientId: string, scope: string): string {
    return jwt.sign(
      {
        sub: userId,
        client_id: clientId,
        scope,
        type: 'refresh',
      },
      this.configService.get('OAUTH2_SECRET'),
      { expiresIn: this.refreshTokenTTL },
    );
  }

  /**
   * Get all clients for a partner
   */
  async getPartnerClients(partnerId: string): Promise<OAuth2ClientEntity[]> {
    return this.clientRepository.find({
      where: { partnerId },
      order: { createdAt: 'DESC' as any },
    });
  }

  /**
   * Get token usage statistics
   */
  async getTokenStats(clientId: string): Promise<{
    totalTokens: number;
    activeTokens: number;
    revokedTokens: number;
  }> {
    const [totalTokens, activeTokens, revokedTokens] = await Promise.all([
      this.tokenRepository.count({ where: { clientId } }),
      this.tokenRepository.count({
        where: { clientId, revoked: false as any },
      }),
      this.tokenRepository.count({
        where: { clientId, revoked: true as any },
      }),
    ]);

    return {
      totalTokens,
      activeTokens,
      revokedTokens,
    };
  }
}
