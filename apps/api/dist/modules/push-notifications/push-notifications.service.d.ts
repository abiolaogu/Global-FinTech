import { Repository } from 'typeorm';
import { DeviceTokenEntity } from './entities/device-token.entity';
export interface RegisterDeviceDto {
    userId: string;
    token: string;
    platform: 'ios' | 'android' | 'web';
    deviceId: string;
}
export interface SendNotificationDto {
    userId?: string;
    topic?: string;
    title: string;
    body: string;
    data?: Record<string, string>;
    imageUrl?: string;
}
export declare class PushNotificationsService {
    private readonly deviceTokenRepository;
    private readonly logger;
    constructor(deviceTokenRepository: Repository<DeviceTokenEntity>);
    registerDevice(dto: RegisterDeviceDto): Promise<void>;
    unregisterDevice(token: string): Promise<void>;
    sendToUser(userId: string, dto: Omit<SendNotificationDto, 'userId' | 'topic'>): Promise<void>;
    sendToTopic(topic: string, dto: Omit<SendNotificationDto, 'userId' | 'topic'>): Promise<void>;
    private sendMulticast;
    private deactivateTokens;
    subscribeToTopic(userId: string, topic: string): Promise<void>;
    unsubscribeFromTopic(userId: string, topic: string): Promise<void>;
    sendTransactionNotification(userId: string, transactionId: string, amount: string, type: string): Promise<void>;
    sendSecurityAlert(userId: string, message: string): Promise<void>;
    sendKYCUpdate(userId: string, status: string): Promise<void>;
}
