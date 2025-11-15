import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ApiKeyEntity } from './entities/api-key.entity';
import * as crypto from 'crypto';

export interface CreateApiKeyDto {
  name: string;
  partnerId: string;
  scopes: string[];
  rateLimit?: number; // Requests per minute
  ipWhitelist?: string[];
}

@Injectable()
export class ApiKeysService {
  private readonly logger = new Logger(ApiKeysService.name);

  constructor(
    @InjectRepository(ApiKeyEntity)
    private readonly apiKeyRepository: Repository<ApiKeyEntity>,
  ) {}

  /**
   * Create a new API key
   */
  async createApiKey(dto: CreateApiKeyDto): Promise<{ apiKey: string; entity: ApiKeyEntity }> {
    this.logger.log(`Creating API key for partner ${dto.partnerId}: ${dto.name}`);

    // Generate API key
    const apiKey = this.generateApiKey();
    const apiKeyHash = this.hashApiKey(apiKey);

    const entity = this.apiKeyRepository.create({
      name: dto.name,
      partnerId: dto.partnerId,
      keyHash: apiKeyHash,
      keyPrefix: apiKey.substring(0, 8), // Store prefix for identification
      scopes: dto.scopes,
      rateLimit: dto.rateLimit || 100, // Default 100 req/min
      ipWhitelist: dto.ipWhitelist || [],
      isActive: true,
      lastUsedAt: null,
    });

    const savedEntity = await this.apiKeyRepository.save(entity);

    this.logger.log(`API key created: ${savedEntity.keyId}`);

    // Return plain API key (only time it's visible)
    return {
      apiKey, // atx_live_...
      entity: savedEntity,
    };
  }

  /**
   * Validate API key
   */
  async validateApiKey(apiKey: string, ipAddress?: string): Promise<ApiKeyEntity> {
    const keyHash = this.hashApiKey(apiKey);
    const keyPrefix = apiKey.substring(0, 8);

    const entity = await this.apiKeyRepository.findOne({
      where: {
        keyPrefix,
        keyHash,
        isActive: true as any,
      },
    });

    if (!entity) {
      throw new UnauthorizedException('Invalid API key');
    }

    // Check IP whitelist
    if (entity.ipWhitelist.length > 0 && ipAddress) {
      if (!entity.ipWhitelist.includes(ipAddress)) {
        this.logger.warn(`API key ${entity.keyId} used from unauthorized IP: ${ipAddress}`);
        throw new UnauthorizedException('IP address not whitelisted');
      }
    }

    // Update last used timestamp
    entity.lastUsedAt = new Date();
    await this.apiKeyRepository.save(entity);

    return entity;
  }

  /**
   * Revoke API key
   */
  async revokeApiKey(keyId: string, partnerId: string): Promise<void> {
    const entity = await this.apiKeyRepository.findOne({
      where: { keyId, partnerId },
    });

    if (!entity) {
      throw new UnauthorizedException('API key not found');
    }

    entity.isActive = false;
    entity.revokedAt = new Date();

    await this.apiKeyRepository.save(entity);

    this.logger.log(`API key revoked: ${keyId}`);
  }

  /**
   * Rotate API key (create new, mark old as revoked)
   */
  async rotateApiKey(keyId: string, partnerId: string): Promise<{ apiKey: string; entity: ApiKeyEntity }> {
    const oldEntity = await this.apiKeyRepository.findOne({
      where: { keyId, partnerId },
    });

    if (!oldEntity) {
      throw new UnauthorizedException('API key not found');
    }

    // Create new key with same settings
    const newKey = await this.createApiKey({
      name: `${oldEntity.name} (rotated)`,
      partnerId: oldEntity.partnerId,
      scopes: oldEntity.scopes,
      rateLimit: oldEntity.rateLimit,
      ipWhitelist: oldEntity.ipWhitelist,
    });

    // Revoke old key
    await this.revokeApiKey(keyId, partnerId);

    this.logger.log(`API key rotated: ${keyId} -> ${newKey.entity.keyId}`);

    return newKey;
  }

  /**
   * Get all API keys for a partner
   */
  async getPartnerApiKeys(partnerId: string): Promise<ApiKeyEntity[]> {
    return this.apiKeyRepository.find({
      where: { partnerId },
      order: { createdAt: 'DESC' as any },
    });
  }

  /**
   * Update API key settings
   */
  async updateApiKey(
    keyId: string,
    partnerId: string,
    updates: {
      name?: string;
      scopes?: string[];
      rateLimit?: number;
      ipWhitelist?: string[];
    },
  ): Promise<ApiKeyEntity> {
    const entity = await this.apiKeyRepository.findOne({
      where: { keyId, partnerId },
    });

    if (!entity) {
      throw new UnauthorizedException('API key not found');
    }

    if (updates.name) entity.name = updates.name;
    if (updates.scopes) entity.scopes = updates.scopes;
    if (updates.rateLimit) entity.rateLimit = updates.rateLimit;
    if (updates.ipWhitelist) entity.ipWhitelist = updates.ipWhitelist;

    const updated = await this.apiKeyRepository.save(entity);

    this.logger.log(`API key updated: ${keyId}`);

    return updated;
  }

  /**
   * Get API key usage statistics
   */
  async getApiKeyStats(keyId: string, partnerId: string): Promise<{
    totalRequests: number;
    lastUsed: Date | null;
    createdAt: Date;
    isActive: boolean;
  }> {
    const entity = await this.apiKeyRepository.findOne({
      where: { keyId, partnerId },
    });

    if (!entity) {
      throw new UnauthorizedException('API key not found');
    }

    // In production, fetch request count from metrics/logs
    return {
      totalRequests: 0, // Placeholder - fetch from Prometheus
      lastUsed: entity.lastUsedAt,
      createdAt: entity.createdAt,
      isActive: entity.isActive,
    };
  }

  // Private helper methods

  private generateApiKey(): string {
    // Format: atx_live_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
    const random = crypto.randomBytes(24).toString('hex');
    return `atx_live_${random}`;
  }

  private hashApiKey(apiKey: string): string {
    return crypto.createHash('sha256').update(apiKey).digest('hex');
  }
}
