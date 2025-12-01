export declare class DeviceTokenEntity {
    id: string;
    userId: string;
    token: string;
    platform: 'ios' | 'android' | 'web';
    deviceId: string;
    isActive: boolean;
    lastUsedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
