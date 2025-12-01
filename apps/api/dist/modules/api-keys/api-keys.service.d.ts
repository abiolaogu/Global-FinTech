import { Repository } from 'typeorm';
import { ApiKeyEntity } from './entities/api-key.entity';
export interface CreateApiKeyDto {
    name: string;
    partnerId: string;
    scopes: string[];
    rateLimit?: number;
    ipWhitelist?: string[];
}
export declare class ApiKeysService {
    private readonly apiKeyRepository;
    private readonly logger;
    constructor(apiKeyRepository: Repository<ApiKeyEntity>);
    createApiKey(dto: CreateApiKeyDto): Promise<{
        apiKey: string;
        entity: ApiKeyEntity;
    }>;
    validateApiKey(apiKey: string, ipAddress?: string): Promise<ApiKeyEntity>;
    revokeApiKey(keyId: string, partnerId: string): Promise<void>;
    rotateApiKey(keyId: string, partnerId: string): Promise<{
        apiKey: string;
        entity: ApiKeyEntity;
    }>;
    getPartnerApiKeys(partnerId: string): Promise<ApiKeyEntity[]>;
    updateApiKey(keyId: string, partnerId: string, updates: {
        name?: string;
        scopes?: string[];
        rateLimit?: number;
        ipWhitelist?: string[];
    }): Promise<ApiKeyEntity>;
    getApiKeyStats(keyId: string, partnerId: string): Promise<{
        totalRequests: number;
        lastUsed: Date | null;
        createdAt: Date;
        isActive: boolean;
    }>;
    private generateApiKey;
    private hashApiKey;
}
