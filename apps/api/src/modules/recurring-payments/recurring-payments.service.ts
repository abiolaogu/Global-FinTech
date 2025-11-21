import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { RecurringPaymentEntity } from './entities/recurring-payment.entity';
import { PaymentGatewaysService } from '../payment-gateways/payment-gateways.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import Decimal from 'decimal.js';

export interface CreateRecurringPaymentDto {
  userId: string;
  merchantId: string;
  name: string;
  description?: string;
  amount: string;
  currency: string;
  frequency: 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: Date;
  endDate?: Date;
  maxPayments?: number;
  paymentMethod: string;
  paymentMethodToken: string; // Encrypted payment method details
  gatewayId: string;
  provider: string;
  authorizationCode?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class RecurringPaymentsService {
  private readonly logger = new Logger(RecurringPaymentsService.name);

  constructor(
    @InjectRepository(RecurringPaymentEntity)
    private readonly recurringPaymentRepository: Repository<RecurringPaymentEntity>,
    private readonly paymentGatewaysService: PaymentGatewaysService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a recurring payment
   */
  async createRecurringPayment(dto: CreateRecurringPaymentDto): Promise<RecurringPaymentEntity> {
    this.logger.log(`Creating recurring payment for user ${dto.userId}`);

    const nextPaymentDate = this.calculateNextPaymentDate(dto.startDate, dto.frequency);

    const recurringPayment = this.recurringPaymentRepository.create({
      recurringPaymentId: uuidv4(),
      userId: dto.userId,
      merchantId: dto.merchantId,
      name: dto.name,
      description: dto.description,
      amount: dto.amount,
      currency: dto.currency,
      frequency: dto.frequency,
      status: 'active',
      startDate: dto.startDate,
      endDate: dto.endDate,
      nextPaymentDate,
      maxPayments: dto.maxPayments,
      paymentsMade: 0,
      failedPayments: 0,
      successfulPayments: 0,
      paymentMethod: dto.paymentMethod,
      paymentMethodEncrypted: this.encryptPaymentMethod(dto.paymentMethodToken),
      gatewayId: dto.gatewayId,
      provider: dto.provider,
      authorizationCode: dto.authorizationCode,
      retryAttempts: 0,
      maxRetryAttempts: 3,
      totalCollected: '0',
      metadata: dto.metadata || {},
    });

    const saved = await this.recurringPaymentRepository.save(recurringPayment);

    this.eventEmitter.emit('recurring_payment.created', {
      recurringPaymentId: saved.recurringPaymentId,
      userId: dto.userId,
      frequency: dto.frequency,
      amount: dto.amount,
    });

    this.logger.log(`Recurring payment created: ${saved.recurringPaymentId}`);

    return saved;
  }

  /**
   * Process due recurring payments (scheduled job)
   */
  async processDuePayments(): Promise<number> {
    this.logger.log('Processing due recurring payments...');

    const duePayments = await this.recurringPaymentRepository.find({
      where: {
        status: 'active',
        nextPaymentDate: LessThanOrEqual(new Date()),
      },
    });

    let processedCount = 0;

    for (const payment of duePayments) {
      try {
        await this.processRecurringPayment(payment);
        processedCount++;
      } catch (error) {
        this.logger.error(`Failed to process recurring payment ${payment.recurringPaymentId}: ${error.message}`);
      }
    }

    this.logger.log(`Processed ${processedCount} recurring payments`);

    return processedCount;
  }

  /**
   * Process a single recurring payment
   */
  private async processRecurringPayment(payment: RecurringPaymentEntity): Promise<void> {
    this.logger.log(`Processing recurring payment: ${payment.recurringPaymentId}`);

    try {
      // Initiate payment via gateway (using tokenized payment method)
      // This is a simplified version - actual implementation would use provider's recurring payment APIs
      const transaction = await this.paymentGatewaysService.initiatePayment(
        {
          userId: payment.userId,
          merchantId: payment.merchantId,
          amount: payment.amount,
          currency: payment.currency,
          paymentMethod: payment.paymentMethod,
          description: `Recurring payment: ${payment.name}`,
          metadata: {
            recurringPaymentId: payment.recurringPaymentId,
            paymentNumber: payment.paymentsMade + 1,
          },
        },
        payment.provider,
      );

      // Update recurring payment
      payment.paymentsMade += 1;
      payment.successfulPayments += 1;
      payment.totalCollected = new Decimal(payment.totalCollected).plus(payment.amount).toString();
      payment.lastPaymentAt = new Date();
      payment.retryAttempts = 0;

      // Calculate next payment date
      payment.nextPaymentDate = this.calculateNextPaymentDate(new Date(), payment.frequency);

      // Check if should complete
      if (payment.maxPayments && payment.paymentsMade >= payment.maxPayments) {
        payment.status = 'expired';
      } else if (payment.endDate && new Date() >= payment.endDate) {
        payment.status = 'expired';
      }

      await this.recurringPaymentRepository.save(payment);

      this.eventEmitter.emit('recurring_payment.processed', {
        recurringPaymentId: payment.recurringPaymentId,
        transactionId: transaction.transactionId,
        paymentNumber: payment.paymentsMade,
      });

      this.logger.log(`Recurring payment processed successfully: ${payment.recurringPaymentId}`);
    } catch (error) {
      this.logger.error(`Recurring payment processing failed: ${error.message}`);

      payment.failedPayments += 1;
      payment.retryAttempts += 1;
      payment.lastFailureAt = new Date();
      payment.lastFailureReason = error.message;

      if (payment.retryAttempts >= payment.maxRetryAttempts) {
        payment.status = 'failed';
        payment.nextPaymentDate = null;
      } else {
        // Retry later (e.g., in 1 hour)
        payment.nextPaymentDate = new Date(Date.now() + 60 * 60 * 1000);
      }

      await this.recurringPaymentRepository.save(payment);

      this.eventEmitter.emit('recurring_payment.failed', {
        recurringPaymentId: payment.recurringPaymentId,
        error: error.message,
        retryAttempts: payment.retryAttempts,
      });
    }
  }

  /**
   * Pause recurring payment
   */
  async pauseRecurringPayment(recurringPaymentId: string): Promise<RecurringPaymentEntity> {
    const payment = await this.getRecurringPayment(recurringPaymentId);

    if (payment.status !== 'active') {
      throw new BadRequestException('Only active recurring payments can be paused');
    }

    payment.status = 'paused';
    payment.pausedAt = new Date();

    return this.recurringPaymentRepository.save(payment);
  }

  /**
   * Resume recurring payment
   */
  async resumeRecurringPayment(recurringPaymentId: string): Promise<RecurringPaymentEntity> {
    const payment = await this.getRecurringPayment(recurringPaymentId);

    if (payment.status !== 'paused') {
      throw new BadRequestException('Only paused recurring payments can be resumed');
    }

    payment.status = 'active';
    payment.pausedAt = null;

    // Recalculate next payment date
    payment.nextPaymentDate = this.calculateNextPaymentDate(new Date(), payment.frequency);

    return this.recurringPaymentRepository.save(payment);
  }

  /**
   * Cancel recurring payment
   */
  async cancelRecurringPayment(
    recurringPaymentId: string,
    reason?: string,
  ): Promise<RecurringPaymentEntity> {
    const payment = await this.getRecurringPayment(recurringPaymentId);

    payment.status = 'cancelled';
    payment.cancelledAt = new Date();
    payment.cancellationReason = reason;
    payment.nextPaymentDate = null;

    return this.recurringPaymentRepository.save(payment);
  }

  /**
   * Get recurring payment
   */
  async getRecurringPayment(recurringPaymentId: string): Promise<RecurringPaymentEntity> {
    const payment = await this.recurringPaymentRepository.findOne({
      where: { recurringPaymentId },
    });

    if (!payment) {
      throw new NotFoundException('Recurring payment not found');
    }

    return payment;
  }

  /**
   * Get user's recurring payments
   */
  async getUserRecurringPayments(userId: string): Promise<RecurringPaymentEntity[]> {
    return this.recurringPaymentRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get merchant's recurring payments
   */
  async getMerchantRecurringPayments(merchantId: string): Promise<RecurringPaymentEntity[]> {
    return this.recurringPaymentRepository.find({
      where: { merchantId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Calculate next payment date
   */
  private calculateNextPaymentDate(fromDate: Date, frequency: string): Date {
    const date = new Date(fromDate);

    switch (frequency) {
      case 'daily':
        date.setDate(date.getDate() + 1);
        break;
      case 'weekly':
        date.setDate(date.getDate() + 7);
        break;
      case 'biweekly':
        date.setDate(date.getDate() + 14);
        break;
      case 'monthly':
        date.setMonth(date.getMonth() + 1);
        break;
      case 'quarterly':
        date.setMonth(date.getMonth() + 3);
        break;
      case 'yearly':
        date.setFullYear(date.getFullYear() + 1);
        break;
      default:
        throw new BadRequestException(`Invalid frequency: ${frequency}`);
    }

    return date;
  }

  /**
   * Encrypt payment method
   */
  private encryptPaymentMethod(data: string): string {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || '0'.repeat(64), 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
  }
}
