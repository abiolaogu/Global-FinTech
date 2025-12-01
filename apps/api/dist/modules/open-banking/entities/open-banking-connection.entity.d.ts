export declare class OpenBankingConnectionEntity {
    connectionId: string;
    userId: string;
    institutionId: string;
    accessTokenHash: string;
    itemId: string;
    status: 'active' | 'disconnected' | 'error' | 'consent_expired';
    consentExpiresAt: Date;
    disconnectedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
