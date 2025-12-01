export declare class SplitConfigurationEntity {
    configurationId: string;
    userId: string;
    name: string;
    description: string;
    splitType: string;
    splitRules: Array<{
        recipientId: string;
        recipientType: 'user' | 'wallet' | 'merchant' | 'platform';
        recipientName?: string;
        splitType: 'percentage' | 'fixed';
        value: string;
        description?: string;
        priority?: number;
    }>;
    isActive: boolean;
    isDefault: boolean;
    conditions: {
        minAmount?: string;
        maxAmount?: string;
        currencies?: string[];
        paymentMethods?: string[];
    };
    usageCount: number;
    lastUsedAt: Date;
    metadata: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
}
