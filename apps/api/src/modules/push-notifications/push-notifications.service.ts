import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeviceTokenEntity } from './entities/device-token.entity';
import * as admin from 'firebase-admin';

export interface RegisterDeviceDto {
  userId: string;
  token: string;
  platform: 'ios' | 'android' | 'web';
  deviceId: string;
}

export interface SendNotificationDto {
  userId?: string; // Send to specific user
  topic?: string; // Send to topic subscribers
  title: string;
  body: string;
  data?: Record<string, string>;
  imageUrl?: string;
}

@Injectable()
export class PushNotificationsService {
  private readonly logger = new Logger(PushNotificationsService.name);

  constructor(
    @InjectRepository(DeviceTokenEntity)
    private readonly deviceTokenRepository: Repository<DeviceTokenEntity>,
  ) {
    // Initialize Firebase Admin SDK
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.applicationDefault(),
      });
    }
  }

  /**
   * Register device token
   */
  async registerDevice(dto: RegisterDeviceDto): Promise<void> {
    this.logger.log(`Registering device for user ${dto.userId}: ${dto.platform}`);

    // Check if token already exists
    const existing = await this.deviceTokenRepository.findOne({
      where: { token: dto.token },
    });

    if (existing) {
      // Update existing
      existing.userId = dto.userId;
      existing.lastUsedAt = new Date();
      await this.deviceTokenRepository.save(existing);
    } else {
      // Create new
      const deviceToken = this.deviceTokenRepository.create({
        userId: dto.userId,
        token: dto.token,
        platform: dto.platform,
        deviceId: dto.deviceId,
        isActive: true,
      });

      await this.deviceTokenRepository.save(deviceToken);
    }

    this.logger.log(`Device registered successfully for user ${dto.userId}`);
  }

  /**
   * Unregister device token
   */
  async unregisterDevice(token: string): Promise<void> {
    await this.deviceTokenRepository.delete({ token });
    this.logger.log(`Device unregistered: ${token.substring(0, 10)}...`);
  }

  /**
   * Send notification to user
   */
  async sendToUser(userId: string, dto: Omit<SendNotificationDto, 'userId' | 'topic'>): Promise<void> {
    const deviceTokens = await this.deviceTokenRepository.find({
      where: { userId, isActive: true as any },
    });

    if (deviceTokens.length === 0) {
      this.logger.warn(`No active devices found for user ${userId}`);
      return;
    }

    const tokens = deviceTokens.map((d) => d.token);

    await this.sendMulticast(tokens, dto);
  }

  /**
   * Send notification to topic
   */
  async sendToTopic(topic: string, dto: Omit<SendNotificationDto, 'userId' | 'topic'>): Promise<void> {
    const message = {
      notification: {
        title: dto.title,
        body: dto.body,
        ...(dto.imageUrl && { imageUrl: dto.imageUrl }),
      },
      data: dto.data || {},
      topic,
    };

    try {
      const response = await admin.messaging().send(message);
      this.logger.log(`Notification sent to topic ${topic}: ${response}`);
    } catch (error) {
      this.logger.error(`Failed to send notification to topic ${topic}: ${error.message}`);
    }
  }

  /**
   * Send multicast notification
   */
  private async sendMulticast(
    tokens: string[],
    dto: Omit<SendNotificationDto, 'userId' | 'topic'>,
  ): Promise<void> {
    const message = {
      notification: {
        title: dto.title,
        body: dto.body,
        ...(dto.imageUrl && { imageUrl: dto.imageUrl }),
      },
      data: dto.data || {},
      tokens,
    };

    try {
      const response = await admin.messaging().sendMulticast(message);

      this.logger.log(
        `Multicast sent: ${response.successCount} success, ${response.failureCount} failures`,
      );

      // Handle failed tokens
      if (response.failureCount > 0) {
        const failedTokens: string[] = [];

        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(tokens[idx]);
          }
        });

        // Deactivate invalid tokens
        await this.deactivateTokens(failedTokens);
      }
    } catch (error) {
      this.logger.error(`Failed to send multicast: ${error.message}`);
    }
  }

  /**
   * Deactivate invalid tokens
   */
  private async deactivateTokens(tokens: string[]): Promise<void> {
    if (tokens.length === 0) return;

    await this.deviceTokenRepository.update(
      { token: { $in: tokens } as any },
      { isActive: false },
    );

    this.logger.log(`Deactivated ${tokens.length} invalid tokens`);
  }

  /**
   * Subscribe user to topic
   */
  async subscribeToTopic(userId: string, topic: string): Promise<void> {
    const deviceTokens = await this.deviceTokenRepository.find({
      where: { userId, isActive: true as any },
    });

    if (deviceTokens.length === 0) {
      return;
    }

    const tokens = deviceTokens.map((d) => d.token);

    try {
      await admin.messaging().subscribeToTopic(tokens, topic);
      this.logger.log(`User ${userId} subscribed to topic ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to subscribe to topic: ${error.message}`);
    }
  }

  /**
   * Unsubscribe user from topic
   */
  async unsubscribeFromTopic(userId: string, topic: string): Promise<void> {
    const deviceTokens = await this.deviceTokenRepository.find({
      where: { userId, isActive: true as any },
    });

    if (deviceTokens.length === 0) {
      return;
    }

    const tokens = deviceTokens.map((d) => d.token);

    try {
      await admin.messaging().unsubscribeFromTopic(tokens, topic);
      this.logger.log(`User ${userId} unsubscribed from topic ${topic}`);
    } catch (error) {
      this.logger.error(`Failed to unsubscribe from topic: ${error.message}`);
    }
  }

  /**
   * Send transaction notification
   */
  async sendTransactionNotification(
    userId: string,
    transactionId: string,
    amount: string,
    type: string,
  ): Promise<void> {
    await this.sendToUser(userId, {
      title: 'Transaction Update',
      body: `${type}: ${amount}`,
      data: {
        type: 'transaction',
        transactionId,
      },
    });
  }

  /**
   * Send security alert
   */
  async sendSecurityAlert(userId: string, message: string): Promise<void> {
    await this.sendToUser(userId, {
      title: 'Security Alert',
      body: message,
      data: {
        type: 'security',
      },
    });
  }

  /**
   * Send KYC update
   */
  async sendKYCUpdate(userId: string, status: string): Promise<void> {
    await this.sendToUser(userId, {
      title: 'KYC Verification Update',
      body: `Your verification is ${status}`,
      data: {
        type: 'kyc',
        status,
      },
    });
  }
}
