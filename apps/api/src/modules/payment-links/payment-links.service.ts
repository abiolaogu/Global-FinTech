import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PaymentLinkEntity } from './entities/payment-link.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import Decimal from 'decimal.js';

export interface CreatePaymentLinkDto {
  userId: string;
  title: string;
  description?: string;
  amountType: 'fixed' | 'flexible' | 'minimum';
  amount?: string;
  currency: string;
  allowedPaymentMethods?: string[];
  redirectUrl?: string;
  collectCustomerInfo?: boolean;
  customFields?: Array<any>;
  logoUrl?: string;
  brandColor?: string;
  maxPayments?: number;
  expiresAt?: Date;
  splitConfigurationId?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class PaymentLinksService {
  private readonly logger = new Logger(PaymentLinksService.name);

  constructor(
    @InjectRepository(PaymentLinkEntity)
    private readonly paymentLinkRepository: Repository<PaymentLinkEntity>,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a payment link
   */
  async createPaymentLink(dto: CreatePaymentLinkDto): Promise<PaymentLinkEntity> {
    this.logger.log(`Creating payment link for user ${dto.userId}`);

    if (dto.amountType === 'fixed' && !dto.amount) {
      throw new BadRequestException('Amount is required for fixed payment links');
    }

    const code = this.generateCode();

    const paymentLink = this.paymentLinkRepository.create({
      linkId: uuidv4(),
      userId: dto.userId,
      code,
      title: dto.title,
      description: dto.description,
      amountType: dto.amountType,
      amount: dto.amount,
      currency: dto.currency,
      active: true,
      status: 'active',
      allowedPaymentMethods: dto.allowedPaymentMethods,
      redirectUrl: dto.redirectUrl,
      collectCustomerInfo: dto.collectCustomerInfo || false,
      customFields: dto.customFields,
      logoUrl: dto.logoUrl,
      brandColor: dto.brandColor,
      maxPayments: dto.maxPayments,
      paymentCount: 0,
      totalCollected: '0',
      expiresAt: dto.expiresAt,
      splitConfigurationId: dto.splitConfigurationId,
      metadata: dto.metadata || {},
      viewCount: 0,
    });

    const saved = await this.paymentLinkRepository.save(paymentLink);

    this.eventEmitter.emit('payment_link.created', {
      linkId: saved.linkId,
      userId: dto.userId,
      code: saved.code,
    });

    this.logger.log(`Payment link created: ${saved.linkId} - ${saved.code}`);

    return saved;
  }

  /**
   * Get payment link by code
   */
  async getPaymentLinkByCode(code: string): Promise<PaymentLinkEntity> {
    const link = await this.paymentLinkRepository.findOne({
      where: { code },
    });

    if (!link) {
      throw new NotFoundException('Payment link not found');
    }

    // Check if expired
    if (link.expiresAt && new Date() > link.expiresAt) {
      link.status = 'expired';
      await this.paymentLinkRepository.save(link);
      throw new BadRequestException('Payment link has expired');
    }

    // Check if max payments reached
    if (link.maxPayments && link.paymentCount >= link.maxPayments) {
      link.status = 'completed';
      await this.paymentLinkRepository.save(link);
      throw new BadRequestException('Payment link has reached maximum payments');
    }

    // Increment view count
    link.viewCount += 1;
    await this.paymentLinkRepository.save(link);

    return link;
  }

  /**
   * Record payment for link
   */
  async recordPayment(linkId: string, amount: string): Promise<PaymentLinkEntity> {
    const link = await this.paymentLinkRepository.findOne({
      where: { linkId },
    });

    if (!link) {
      throw new NotFoundException('Payment link not found');
    }

    link.paymentCount += 1;
    link.totalCollected = new Decimal(link.totalCollected).plus(amount).toString();
    link.lastPaymentAt = new Date();

    // Check if max payments reached
    if (link.maxPayments && link.paymentCount >= link.maxPayments) {
      link.status = 'completed';
      link.active = false;
    }

    const saved = await this.paymentLinkRepository.save(link);

    this.eventEmitter.emit('payment_link.payment_received', {
      linkId: link.linkId,
      amount,
      paymentCount: link.paymentCount,
    });

    return saved;
  }

  /**
   * Get payment link by ID
   */
  async getPaymentLink(linkId: string): Promise<PaymentLinkEntity> {
    const link = await this.paymentLinkRepository.findOne({
      where: { linkId },
    });

    if (!link) {
      throw new NotFoundException('Payment link not found');
    }

    return link;
  }

  /**
   * Get user's payment links
   */
  async getUserPaymentLinks(userId: string): Promise<PaymentLinkEntity[]> {
    return this.paymentLinkRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update payment link
   */
  async updatePaymentLink(
    linkId: string,
    updates: Partial<CreatePaymentLinkDto>,
  ): Promise<PaymentLinkEntity> {
    const link = await this.getPaymentLink(linkId);

    Object.assign(link, updates);

    return this.paymentLinkRepository.save(link);
  }

  /**
   * Deactivate payment link
   */
  async deactivatePaymentLink(linkId: string): Promise<PaymentLinkEntity> {
    const link = await this.getPaymentLink(linkId);

    link.active = false;
    link.status = 'inactive';

    return this.paymentLinkRepository.save(link);
  }

  /**
   * Activate payment link
   */
  async activatePaymentLink(linkId: string): Promise<PaymentLinkEntity> {
    const link = await this.getPaymentLink(linkId);

    link.active = true;
    link.status = 'active';

    return this.paymentLinkRepository.save(link);
  }

  /**
   * Generate unique code
   */
  private generateCode(): string {
    return crypto.randomBytes(6).toString('hex');
  }
}
