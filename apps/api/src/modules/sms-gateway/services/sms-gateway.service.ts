import { Injectable, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { SmsSyncLogEntity } from '../entities/sms-sync-log.entity';
import { WalletEntity } from '../../wallets/entities/wallet.entity';
import { WalletTopupService } from '../../wallets/services/wallet-topup.service';
import { CreditLineService } from '../../wallets/services/credit-line.service';
import { WalletsService } from '../../wallets/wallets.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';

export interface SmsCommand {
  version: string;
  userId: string;
  command: string;
  data: string;
  checksum: string;
}

export interface SmsResponse {
  version: string;
  status: 'OK' | 'ERROR';
  data: string;
  checksum: string;
}

@Injectable()
export class SmsGatewayService {
  private readonly PROTOCOL_IDENTIFIER = '#GFT#';
  private readonly PROTOCOL_VERSION = '1.0';
  private readonly ENCRYPTION_KEY: Buffer;
  private readonly ENCRYPTION_ALGORITHM = 'aes-256-gcm';

  constructor(
    @InjectRepository(SmsSyncLogEntity)
    private smsLogRepository: Repository<SmsSyncLogEntity>,
    @InjectRepository(WalletEntity)
    private walletRepository: Repository<WalletEntity>,
    private walletsService: WalletsService,
    private topupService: WalletTopupService,
    private creditLineService: CreditLineService,
    private eventEmitter: EventEmitter2,
  ) {
    // In production, load from environment variables
    this.ENCRYPTION_KEY = Buffer.from(
      process.env.SMS_ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex'),
      'hex',
    );
  }

  /**
   * Parse incoming SMS message
   */
  parseSmsCommand(message: string): SmsCommand {
    const parts = message.split('#');

    if (parts.length < 6 || parts[1] !== 'GFT') {
      throw new BadRequestException('Invalid SMS format');
    }

    return {
      version: parts[2],
      userId: parts[3],
      command: parts[4],
      data: parts[5],
      checksum: parts[6] || '',
    };
  }

  /**
   * Validate SMS checksum
   */
  validateChecksum(command: SmsCommand): boolean {
    const payload = `${command.version}${command.userId}${command.command}${command.data}`;
    const expectedChecksum = crypto
      .createHash('sha256')
      .update(payload)
      .digest('hex')
      .substring(0, 16); // Use first 16 chars for SMS length optimization

    return command.checksum === expectedChecksum;
  }

  /**
   * Decrypt SMS payload
   */
  decryptPayload(encryptedData: string): any {
    try {
      const buffer = Buffer.from(encryptedData, 'base64');

      // Extract IV (12 bytes), auth tag (16 bytes), and encrypted data
      const iv = buffer.subarray(0, 12);
      const authTag = buffer.subarray(12, 28);
      const encrypted = buffer.subarray(28);

      const decipher = crypto.createDecipheriv(
        this.ENCRYPTION_ALGORITHM,
        this.ENCRYPTION_KEY,
        iv,
      );
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted);
      decrypted = Buffer.concat([decrypted, decipher.final()]);

      return JSON.parse(decrypted.toString('utf8'));
    } catch (error) {
      throw new BadRequestException('Failed to decrypt SMS payload');
    }
  }

  /**
   * Encrypt SMS payload
   */
  encryptPayload(data: any): string {
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv(
      this.ENCRYPTION_ALGORITHM,
      this.ENCRYPTION_KEY,
      iv,
    );

    const payload = JSON.stringify(data);
    let encrypted = cipher.update(payload, 'utf8');
    encrypted = Buffer.concat([encrypted, cipher.final()]);

    const authTag = cipher.getAuthTag();

    // Combine IV + Auth Tag + Encrypted Data
    const result = Buffer.concat([iv, authTag, encrypted]);
    return result.toString('base64');
  }

  /**
   * Generate SMS response message
   */
  generateResponse(status: 'OK' | 'ERROR', data: any): string {
    const encryptedData = this.encryptPayload(data);
    const payload = `${this.PROTOCOL_VERSION}${status}${encryptedData}`;
    const checksum = crypto
      .createHash('sha256')
      .update(payload)
      .digest('hex')
      .substring(0, 16);

    return `${this.PROTOCOL_IDENTIFIER}${this.PROTOCOL_VERSION}#${status}#${encryptedData}#${checksum}`;
  }

  /**
   * Process SMS command
   */
  async processSmsCommand(
    phoneNumber: string,
    message: string,
    gateway: string = 'unknown',
  ): Promise<string> {
    let log: SmsSyncLogEntity;
    let response: string;

    try {
      // Create log entry
      log = this.smsLogRepository.create({
        phoneNumber,
        direction: 'inbound',
        messageBody: message,
        status: 'pending',
        smsGateway: gateway,
      });
      await this.smsLogRepository.save(log);

      // Parse command
      const command = this.parseSmsCommand(message);
      log.command = command.command;
      log.encryptedPayload = command.data;

      // Validate checksum
      if (!this.validateChecksum(command)) {
        throw new BadRequestException('Invalid checksum');
      }

      // Decrypt payload
      const decryptedData = this.decryptPayload(command.data);

      // Find user by userId
      // In production, you'd need a proper user lookup mechanism
      log.userId = command.userId;

      // Process command based on type
      let responseData: any;

      switch (command.command) {
        case 'SYNC_WALLET':
          responseData = await this.handleSyncWallet(command.userId, decryptedData);
          break;

        case 'TXN':
          responseData = await this.handleTransaction(command.userId, decryptedData);
          break;

        case 'STATUS':
          responseData = await this.handleSyncStatus(command.userId, decryptedData);
          break;

        case 'TOPUP':
          responseData = await this.handleTopup(command.userId, decryptedData);
          break;

        case 'CREDIT':
          responseData = await this.handleCreditCheck(command.userId, decryptedData);
          break;

        default:
          throw new BadRequestException(`Unknown command: ${command.command}`);
      }

      // Generate response
      response = this.generateResponse('OK', responseData);
      log.response = response;
      log.status = 'processed';
      log.processedAt = new Date();

      await this.smsLogRepository.save(log);

      // Emit event
      this.eventEmitter.emit('sms.command.processed', {
        logId: log.logId,
        userId: command.userId,
        command: command.command,
      });

      return response;
    } catch (error) {
      // Generate error response
      response = this.generateResponse('ERROR', {
        code: error.status || 500,
        message: error.message || 'Internal server error',
      });

      if (log) {
        log.response = response;
        log.status = 'failed';
        log.errorMessage = error.message;
        log.processedAt = new Date();
        await this.smsLogRepository.save(log);
      }

      return response;
    }
  }

  /**
   * Handle SYNC_WALLET command
   */
  private async handleSyncWallet(userId: string, data: any): Promise<any> {
    const wallet = await this.walletRepository.findOne({
      where: {
        walletId: data.walletId,
        userId,
      },
    });

    if (!wallet) {
      throw new BadRequestException('Wallet not found');
    }

    // Update SMS sync timestamp
    wallet.lastSmsSyncAt = new Date();
    wallet.smsSyncCount += 1;
    await this.walletRepository.save(wallet);

    return {
      walletId: wallet.walletId,
      balance: wallet.balance,
      availableBalance: wallet.availableBalance,
      pendingBalance: wallet.pendingBalance,
      heldBalance: wallet.heldBalance,
      creditLimit: wallet.creditLimit,
      creditUsed: wallet.creditUsed,
      creditAvailable: wallet.creditAvailable,
      currency: wallet.currency,
      lastSyncedAt: wallet.lastSmsSyncAt.toISOString(),
    };
  }

  /**
   * Handle TXN command (submit offline transaction)
   */
  private async handleTransaction(userId: string, data: any): Promise<any> {
    // Process transaction based on type
    if (data.type === 'debit') {
      const result = await this.walletsService.debitWallet({
        walletId: data.walletId,
        amount: data.amount,
        category: data.category || 'offline_transaction',
        description: data.description || 'Offline transaction',
        reference: data.reference,
        metadata: {
          channel: 'sms',
          originalTimestamp: data.timestamp,
          ...data.metadata,
        },
      });

      return {
        transactionId: result.transactionId,
        status: result.status,
        balance: result.balanceAfter,
      };
    } else if (data.type === 'credit') {
      const result = await this.walletsService.creditWallet({
        walletId: data.walletId,
        amount: data.amount,
        category: data.category || 'offline_transaction',
        description: data.description || 'Offline transaction',
        reference: data.reference,
        metadata: {
          channel: 'sms',
          originalTimestamp: data.timestamp,
          ...data.metadata,
        },
      });

      return {
        transactionId: result.transactionId,
        status: result.status,
        balance: result.balanceAfter,
      };
    }

    throw new BadRequestException('Invalid transaction type');
  }

  /**
   * Handle STATUS command
   */
  private async handleSyncStatus(userId: string, data: any): Promise<any> {
    // Get wallet sync status
    const wallets = await this.walletRepository.find({
      where: { userId },
    });

    return {
      totalWallets: wallets.length,
      lastSmsSyncAt: wallets[0]?.lastSmsSyncAt?.toISOString(),
      smsSyncCount: wallets.reduce((sum, w) => sum + w.smsSyncCount, 0),
      wallets: wallets.map((w) => ({
        walletId: w.walletId,
        currency: w.currency,
        balance: w.balance,
        lastSyncedAt: w.lastSmsSyncAt?.toISOString(),
      })),
    };
  }

  /**
   * Handle TOPUP command
   */
  private async handleTopup(userId: string, data: any): Promise<any> {
    const topup = await this.topupService.initiateTopup({
      userId,
      walletId: data.walletId,
      amount: data.amount,
      sourceType: data.sourceType || 'main_wallet',
      sourceAccountId: data.sourceAccountId,
      channel: 'sms',
      description: data.description || 'SMS wallet top-up',
      metadata: {
        phoneNumber: data.phoneNumber,
      },
    });

    // Auto-complete if source is main wallet or pre-authorized
    if (data.autoComplete) {
      const completed = await this.topupService.completeTopup({
        topupId: topup.topupId,
      });

      return {
        topupId: completed.topupId,
        status: completed.status,
        amount: completed.amount,
        newBalance: completed.balanceAfter,
        reference: completed.reference,
      };
    }

    return {
      topupId: topup.topupId,
      status: topup.status,
      amount: topup.amount,
      reference: topup.reference,
    };
  }

  /**
   * Handle CREDIT command (check credit line)
   */
  private async handleCreditCheck(userId: string, data: any): Promise<any> {
    try {
      const creditLine = await this.creditLineService.getCreditLine(userId);

      return {
        creditLineId: creditLine.creditLineId,
        creditLimit: creditLine.creditLimit,
        creditUsed: creditLine.creditUsed,
        creditAvailable: creditLine.creditAvailable,
        utilizationRate: creditLine.utilizationRate,
        status: creditLine.status,
        nextPaymentDue: creditLine.nextPaymentDue?.toISOString(),
      };
    } catch (error) {
      return {
        creditLimit: '0',
        creditUsed: '0',
        creditAvailable: '0',
        status: 'not_available',
      };
    }
  }

  /**
   * Send SMS message
   */
  async sendSms(
    phoneNumber: string,
    message: string,
    userId?: string,
    gateway: string = 'default',
  ): Promise<SmsSyncLogEntity> {
    // Create log entry
    const log = this.smsLogRepository.create({
      userId,
      phoneNumber,
      direction: 'outbound',
      messageBody: message,
      status: 'sent',
      smsGateway: gateway,
    });

    const saved = await this.smsLogRepository.save(log);

    // Emit event for actual SMS sending (handled by SMS provider integration)
    this.eventEmitter.emit('sms.send', {
      logId: saved.logId,
      phoneNumber,
      message,
      gateway,
    });

    return saved;
  }

  /**
   * Get SMS logs for user
   */
  async getUserSmsLogs(
    userId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<SmsSyncLogEntity[]> {
    return this.smsLogRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }
}
