export declare class ApiKeyEntity {
    keyId: string;
    name: string;
    partnerId: string;
    keyPrefix: string;
    keyHash: string;
    scopes: string[];
    rateLimit: number;
    ipWhitelist: string[];
    isActive: boolean;
    lastUsedAt: Date | null;
    revokedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
