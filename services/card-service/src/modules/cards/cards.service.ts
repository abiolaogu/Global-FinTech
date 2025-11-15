import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CardEntity } from './entities/card.entity';
import { CardTransactionEntity } from './entities/card-transaction.entity';
import { MarqetaService } from '../card-processor/marqeta.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Decimal from 'decimal.js';

export interface CreateCardDto {
  userId: string;
  cardType: 'VIRTUAL' | 'PHYSICAL';
  cardProductToken: string;
  settlementWalletId: string;
  spendingLimits?: {
    dailyLimit?: number;
    weeklyLimit?: number;
    monthlyLimit?: number;
  };
}

export interface CardAuthorizationDto {
  cardId: string;
  amount: string;
  currency: string;
  merchantName: string;
  merchantCategory: string;
  merchantCountry: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class CardsService {
  private readonly logger = new Logger(CardsService.name);

  constructor(
    @InjectRepository(CardEntity)
    private readonly cardRepository: Repository<CardEntity>,
    @InjectRepository(CardTransactionEntity)
    private readonly cardTransactionRepository: Repository<CardTransactionEntity>,
    private readonly marqetaService: MarqetaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Issue a new card
   */
  async createCard(dto: CreateCardDto): Promise<CardEntity> {
    this.logger.log(`Creating ${dto.cardType} card for user ${dto.userId}`);

    try {
      // Create card with Marqeta
      const marqetaCard = await this.marqetaService.createCard({
        userId: dto.userId,
        cardProductToken: dto.cardProductToken,
        metadata: {
          cardType: dto.cardType,
          settlementWalletId: dto.settlementWalletId,
        },
      });

      // Store card in database (never store full PAN/CVV in plain text)
      const card = this.cardRepository.create({
        userId: dto.userId,
        cardType: dto.cardType,
        status: 'INACTIVE', // Requires activation
        processorCardToken: marqetaCard.token,
        lastFourDigits: marqetaCard.lastFour,
        bin: marqetaCard.pan.slice(0, 6),
        expiryMonth: parseInt(marqetaCard.expiration.split('/')[0]),
        expiryYear: parseInt(marqetaCard.expiration.split('/')[1]),
        settlementWalletId: dto.settlementWalletId,
        dailySpendLimit: dto.spendingLimits?.dailyLimit?.toString() || '1000',
        weeklySpendLimit: dto.spendingLimits?.weeklyLimit?.toString() || '5000',
        monthlySpendLimit: dto.spendingLimits?.monthlyLimit?.toString() || '20000',
        dailySpent: '0',
        weeklySpent: '0',
        monthlySpent: '0',
      });

      const savedCard = await this.cardRepository.save(card);

      // Set spending limits in Marqeta
      if (dto.spendingLimits) {
        await this.marqetaService.setSpendingLimits(marqetaCard.token, dto.spendingLimits);
      }

      this.eventEmitter.emit('card.created', {
        userId: dto.userId,
        cardId: savedCard.cardId,
        cardType: dto.cardType,
      });

      this.logger.log(`Card created successfully: ${savedCard.cardId}`);

      return savedCard;
    } catch (error) {
      this.logger.error(`Failed to create card: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Activate a card
   */
  async activateCard(cardId: string, userId: string): Promise<CardEntity> {
    const card = await this.findCardByIdAndUser(cardId, userId);

    if (card.status === 'ACTIVE') {
      throw new BadRequestException('Card is already active');
    }

    if (card.status === 'TERMINATED') {
      throw new BadRequestException('Cannot activate terminated card');
    }

    // Activate in Marqeta
    await this.marqetaService.activateCard(card.processorCardToken);

    // Update status
    card.status = 'ACTIVE';
    const updatedCard = await this.cardRepository.save(card);

    this.eventEmitter.emit('card.activated', {
      userId: card.userId,
      cardId: card.cardId,
    });

    return updatedCard;
  }

  /**
   * Freeze a card
   */
  async freezeCard(cardId: string, userId: string): Promise<CardEntity> {
    const card = await this.findCardByIdAndUser(cardId, userId);

    if (card.status === 'FROZEN') {
      throw new BadRequestException('Card is already frozen');
    }

    if (card.status === 'TERMINATED') {
      throw new BadRequestException('Cannot freeze terminated card');
    }

    // Freeze in Marqeta
    await this.marqetaService.freezeCard(card.processorCardToken);

    card.status = 'FROZEN';
    const updatedCard = await this.cardRepository.save(card);

    this.eventEmitter.emit('card.frozen', {
      userId: card.userId,
      cardId: card.cardId,
    });

    return updatedCard;
  }

  /**
   * Unfreeze a card
   */
  async unfreezeCard(cardId: string, userId: string): Promise<CardEntity> {
    const card = await this.findCardByIdAndUser(cardId, userId);

    if (card.status !== 'FROZEN') {
      throw new BadRequestException('Card is not frozen');
    }

    // Unfreeze in Marqeta
    await this.marqetaService.unfreezeCard(card.processorCardToken);

    card.status = 'ACTIVE';
    const updatedCard = await this.cardRepository.save(card);

    this.eventEmitter.emit('card.unfrozen', {
      userId: card.userId,
      cardId: card.cardId,
    });

    return updatedCard;
  }

  /**
   * Terminate a card (permanent)
   */
  async terminateCard(cardId: string, userId: string): Promise<CardEntity> {
    const card = await this.findCardByIdAndUser(cardId, userId);

    if (card.status === 'TERMINATED') {
      throw new BadRequestException('Card is already terminated');
    }

    // Terminate in Marqeta
    await this.marqetaService.terminateCard(card.processorCardToken);

    card.status = 'TERMINATED';
    const updatedCard = await this.cardRepository.save(card);

    this.eventEmitter.emit('card.terminated', {
      userId: card.userId,
      cardId: card.cardId,
    });

    return updatedCard;
  }

  /**
   * Update spending limits
   */
  async updateSpendingLimits(
    cardId: string,
    userId: string,
    limits: {
      dailyLimit?: number;
      weeklyLimit?: number;
      monthlyLimit?: number;
    },
  ): Promise<CardEntity> {
    const card = await this.findCardByIdAndUser(cardId, userId);

    // Update in Marqeta
    await this.marqetaService.setSpendingLimits(card.processorCardToken, limits);

    // Update in database
    if (limits.dailyLimit) card.dailySpendLimit = limits.dailyLimit.toString();
    if (limits.weeklyLimit) card.weeklySpendLimit = limits.weeklyLimit.toString();
    if (limits.monthlyLimit) card.monthlySpendLimit = limits.monthlyLimit.toString();

    const updatedCard = await this.cardRepository.save(card);

    this.eventEmitter.emit('card.limits_updated', {
      userId: card.userId,
      cardId: card.cardId,
      limits,
    });

    return updatedCard;
  }

  /**
   * Process card authorization (called by webhook)
   */
  async processAuthorization(dto: CardAuthorizationDto): Promise<{
    approved: boolean;
    authorizationCode?: string;
    declineReason?: string;
  }> {
    this.logger.log(`Processing authorization for card ${dto.cardId}, amount ${dto.amount}`);

    const card = await this.cardRepository.findOne({ where: { cardId: dto.cardId } });

    if (!card) {
      return { approved: false, declineReason: 'Card not found' };
    }

    // Check card status
    if (card.status !== 'ACTIVE') {
      return { approved: false, declineReason: `Card is ${card.status}` };
    }

    // Check spending limits
    const amount = new Decimal(dto.amount);

    const dailyRemaining = new Decimal(card.dailySpendLimit).minus(card.dailySpent);
    if (amount.greaterThan(dailyRemaining)) {
      return { approved: false, declineReason: 'Daily limit exceeded' };
    }

    const weeklyRemaining = new Decimal(card.weeklySpendLimit).minus(card.weeklySpent);
    if (amount.greaterThan(weeklyRemaining)) {
      return { approved: false, declineReason: 'Weekly limit exceeded' };
    }

    const monthlyRemaining = new Decimal(card.monthlySpendLimit).minus(card.monthlySpent);
    if (amount.greaterThan(monthlyRemaining)) {
      return { approved: false, declineReason: 'Monthly limit exceeded' };
    }

    // Create authorization transaction
    const transaction = this.cardTransactionRepository.create({
      cardId: dto.cardId,
      userId: card.userId,
      amount: dto.amount,
      currency: dto.currency,
      transactionType: 'AUTHORIZATION',
      status: 'PENDING',
      merchantName: dto.merchantName,
      merchantCategory: dto.merchantCategory,
      merchantCountry: dto.merchantCountry,
      metadata: dto.metadata,
    });

    const savedTransaction = await this.cardTransactionRepository.save(transaction);

    // Update spending counters
    card.dailySpent = new Decimal(card.dailySpent).plus(amount).toString();
    card.weeklySpent = new Decimal(card.weeklySpent).plus(amount).toString();
    card.monthlySpent = new Decimal(card.monthlySpent).plus(amount).toString();
    await this.cardRepository.save(card);

    // Emit event for wallet debit
    this.eventEmitter.emit('card.authorization', {
      userId: card.userId,
      cardId: card.cardId,
      transactionId: savedTransaction.transactionId,
      amount: dto.amount,
      currency: dto.currency,
      settlementWalletId: card.settlementWalletId,
    });

    return {
      approved: true,
      authorizationCode: savedTransaction.transactionId,
    };
  }

  /**
   * Get user cards
   */
  async getUserCards(userId: string): Promise<CardEntity[]> {
    return this.cardRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' as any },
    });
  }

  /**
   * Get card by ID
   */
  async getCard(cardId: string, userId: string): Promise<CardEntity> {
    return this.findCardByIdAndUser(cardId, userId);
  }

  /**
   * Get card transactions
   */
  async getCardTransactions(cardId: string, userId: string, limit: number = 100): Promise<CardTransactionEntity[]> {
    const card = await this.findCardByIdAndUser(cardId, userId);

    return this.cardTransactionRepository.find({
      where: { cardId: card.cardId },
      order: { createdAt: 'DESC' as any },
      take: limit,
    });
  }

  /**
   * Helper: find card by ID and user
   */
  private async findCardByIdAndUser(cardId: string, userId: string): Promise<CardEntity> {
    const card = await this.cardRepository.findOne({
      where: { cardId, userId },
    });

    if (!card) {
      throw new NotFoundException('Card not found');
    }

    return card;
  }

  /**
   * Reset daily spending counters (scheduled job)
   */
  async resetDailyCounters(): Promise<void> {
    await this.cardRepository.update({}, { dailySpent: '0' });
    this.logger.log('Reset daily spending counters');
  }

  /**
   * Reset weekly spending counters (scheduled job)
   */
  async resetWeeklyCounters(): Promise<void> {
    await this.cardRepository.update({}, { weeklySpent: '0' });
    this.logger.log('Reset weekly spending counters');
  }

  /**
   * Reset monthly spending counters (scheduled job)
   */
  async resetMonthlyCounters(): Promise<void> {
    await this.cardRepository.update({}, { monthlySpent: '0' });
    this.logger.log('Reset monthly spending counters');
  }
}
