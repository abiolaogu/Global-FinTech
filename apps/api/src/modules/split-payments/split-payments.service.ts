import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { SplitPaymentEntity } from './entities/split-payment.entity';
import { SplitConfigurationEntity } from './entities/split-configuration.entity';
import { WalletsService } from '../wallets/wallets.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Decimal from 'decimal.js';
import { v4 as uuidv4 } from 'uuid';

export interface CreateSplitPaymentDto {
  paymentId: string;
  userId: string;
  totalAmount: string;
  currency: string;
  splitRules: Array<{
    recipientId: string;
    recipientType: 'user' | 'wallet' | 'merchant' | 'platform';
    splitType: 'percentage' | 'fixed';
    value: string;
    description?: string;
    metadata?: Record<string, any>;
  }>;
  platformFee?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface CreateSplitConfigurationDto {
  userId: string;
  name: string;
  description?: string;
  splitType: 'percentage' | 'fixed' | 'hybrid';
  splitRules: Array<{
    recipientId: string;
    recipientType: 'user' | 'wallet' | 'merchant' | 'platform';
    recipientName?: string;
    splitType: 'percentage' | 'fixed';
    value: string;
    description?: string;
    priority?: number;
  }>;
  isDefault?: boolean;
  conditions?: {
    minAmount?: string;
    maxAmount?: string;
    currencies?: string[];
    paymentMethods?: string[];
  };
}

@Injectable()
export class SplitPaymentsService {
  private readonly logger = new Logger(SplitPaymentsService.name);

  constructor(
    @InjectRepository(SplitPaymentEntity)
    private readonly splitPaymentRepository: Repository<SplitPaymentEntity>,
    @InjectRepository(SplitConfigurationEntity)
    private readonly configurationRepository: Repository<SplitConfigurationEntity>,
    private readonly walletsService: WalletsService,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Process a split payment
   */
  async processSplitPayment(dto: CreateSplitPaymentDto): Promise<SplitPaymentEntity> {
    this.logger.log(`Processing split payment for transaction ${dto.paymentId}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate split rules
      this.validateSplitRules(dto.splitRules, dto.totalAmount, dto.splitRules[0]?.splitType === 'percentage');

      // Calculate actual split amounts
      const actualSplits = this.calculateSplits(dto.splitRules, dto.totalAmount, dto.platformFee);

      // Create split payment record
      const splitPayment = queryRunner.manager.create(SplitPaymentEntity, {
        splitPaymentId: uuidv4(),
        paymentId: dto.paymentId,
        userId: dto.userId,
        totalAmount: dto.totalAmount,
        currency: dto.currency,
        status: 'processing',
        splitType: dto.splitRules[0]?.splitType || 'percentage',
        splitRules: dto.splitRules,
        actualSplits: actualSplits.map(split => ({
          ...split,
          status: 'pending' as const,
        })),
        platformFee: dto.platformFee,
        description: dto.description,
        metadata: dto.metadata || {},
        completedSplitsCount: 0,
        failedSplitsCount: 0,
      });

      await queryRunner.manager.save(splitPayment);

      // Execute splits
      let completedCount = 0;
      let failedCount = 0;

      for (const split of actualSplits) {
        try {
          // Find or create recipient wallet
          const recipientWallet = await this.getOrCreateRecipientWallet(
            split.recipientId,
            dto.currency,
            queryRunner,
          );

          // Credit recipient wallet
          const transaction = await this.walletsService.creditWallet(
            {
              walletId: recipientWallet.walletId,
              amount: split.amount,
              category: 'split_payment_received',
              description: `Split payment from ${dto.userId}: ${dto.description || 'Payment split'}`,
              metadata: {
                splitPaymentId: splitPayment.splitPaymentId,
                paymentId: dto.paymentId,
                recipientType: split.recipientType,
                ...split.metadata,
              },
              externalTransactionId: dto.paymentId,
            },
            queryRunner,
          );

          // Update split status
          const splitIndex = splitPayment.actualSplits.findIndex(s => s.recipientId === split.recipientId);
          if (splitIndex !== -1) {
            splitPayment.actualSplits[splitIndex].status = 'completed';
            splitPayment.actualSplits[splitIndex].transactionId = transaction.transactionId;
            splitPayment.actualSplits[splitIndex].walletId = recipientWallet.walletId;
            splitPayment.actualSplits[splitIndex].completedAt = new Date();
          }

          completedCount++;
        } catch (error) {
          this.logger.error(`Split to ${split.recipientId} failed: ${error.message}`);

          // Update split status
          const splitIndex = splitPayment.actualSplits.findIndex(s => s.recipientId === split.recipientId);
          if (splitIndex !== -1) {
            splitPayment.actualSplits[splitIndex].status = 'failed';
            splitPayment.actualSplits[splitIndex].failureReason = error.message;
          }

          failedCount++;
        }
      }

      // Update split payment status
      splitPayment.completedSplitsCount = completedCount;
      splitPayment.failedSplitsCount = failedCount;

      if (failedCount === 0) {
        splitPayment.status = 'completed';
        splitPayment.completedAt = new Date();
      } else if (completedCount === 0) {
        splitPayment.status = 'failed';
        splitPayment.failedAt = new Date();
        splitPayment.failureReason = 'All splits failed';
      } else {
        splitPayment.status = 'partially_completed';
        splitPayment.completedAt = new Date();
      }

      await queryRunner.manager.save(splitPayment);

      await queryRunner.commitTransaction();

      this.eventEmitter.emit('split_payment.processed', {
        splitPaymentId: splitPayment.splitPaymentId,
        paymentId: dto.paymentId,
        status: splitPayment.status,
        completedCount,
        failedCount,
      });

      this.logger.log(
        `Split payment ${splitPayment.status}: ${splitPayment.splitPaymentId} (${completedCount}/${actualSplits.length} completed)`,
      );

      return splitPayment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Split payment processing failed: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Create a split configuration
   */
  async createConfiguration(dto: CreateSplitConfigurationDto): Promise<SplitConfigurationEntity> {
    this.logger.log(`Creating split configuration for user ${dto.userId}`);

    // If this is default, unset other defaults
    if (dto.isDefault) {
      await this.configurationRepository.update(
        { userId: dto.userId, isDefault: true },
        { isDefault: false },
      );
    }

    const configuration = this.configurationRepository.create({
      configurationId: uuidv4(),
      userId: dto.userId,
      name: dto.name,
      description: dto.description,
      splitType: dto.splitType,
      splitRules: dto.splitRules,
      isActive: true,
      isDefault: dto.isDefault || false,
      conditions: dto.conditions,
      usageCount: 0,
    });

    const saved = await this.configurationRepository.save(configuration);

    this.logger.log(`Split configuration created: ${saved.configurationId}`);

    return saved;
  }

  /**
   * Apply split configuration to a payment
   */
  async applySplitConfiguration(
    configurationId: string,
    paymentId: string,
    userId: string,
    totalAmount: string,
    currency: string,
  ): Promise<SplitPaymentEntity> {
    const configuration = await this.configurationRepository.findOne({
      where: { configurationId },
    });

    if (!configuration) {
      throw new NotFoundException('Split configuration not found');
    }

    if (!configuration.isActive) {
      throw new BadRequestException('Split configuration is inactive');
    }

    // Check conditions
    if (configuration.conditions) {
      if (configuration.conditions.minAmount) {
        const minAmount = new Decimal(configuration.conditions.minAmount);
        if (new Decimal(totalAmount).lt(minAmount)) {
          throw new BadRequestException(`Amount below minimum: ${configuration.conditions.minAmount}`);
        }
      }

      if (configuration.conditions.maxAmount) {
        const maxAmount = new Decimal(configuration.conditions.maxAmount);
        if (new Decimal(totalAmount).gt(maxAmount)) {
          throw new BadRequestException(`Amount above maximum: ${configuration.conditions.maxAmount}`);
        }
      }

      if (configuration.conditions.currencies && !configuration.conditions.currencies.includes(currency)) {
        throw new BadRequestException(`Currency ${currency} not supported by this configuration`);
      }
    }

    // Update usage stats
    configuration.usageCount += 1;
    configuration.lastUsedAt = new Date();
    await this.configurationRepository.save(configuration);

    // Process split payment
    return this.processSplitPayment({
      paymentId,
      userId,
      totalAmount,
      currency,
      splitRules: configuration.splitRules,
      description: `Split payment using configuration: ${configuration.name}`,
      metadata: { splitConfigurationId: configurationId },
    });
  }

  /**
   * Calculate actual split amounts
   */
  private calculateSplits(
    splitRules: Array<{
      recipientId: string;
      recipientType: 'user' | 'wallet' | 'merchant' | 'platform';
      splitType: 'percentage' | 'fixed';
      value: string;
      description?: string;
      metadata?: Record<string, any>;
    }>,
    totalAmount: string,
    platformFee?: string,
  ): Array<{
    recipientId: string;
    recipientType: string;
    amount: string;
    currency: string;
    metadata?: Record<string, any>;
  }> {
    const total = new Decimal(totalAmount);
    const fee = platformFee ? new Decimal(platformFee) : new Decimal(0);
    const splittableAmount = total.minus(fee);

    const splits = [];
    let allocatedAmount = new Decimal(0);

    // First, allocate fixed amounts
    for (const rule of splitRules.filter(r => r.splitType === 'fixed')) {
      const amount = new Decimal(rule.value);
      splits.push({
        recipientId: rule.recipientId,
        recipientType: rule.recipientType,
        amount: amount.toString(),
        currency: '', // Will be set by caller
        metadata: rule.metadata,
      });
      allocatedAmount = allocatedAmount.plus(amount);
    }

    // Then, allocate percentage amounts from remaining
    const remainingForPercentage = splittableAmount.minus(allocatedAmount);

    for (const rule of splitRules.filter(r => r.splitType === 'percentage')) {
      const percentage = new Decimal(rule.value);
      const amount = remainingForPercentage.times(percentage).dividedBy(100);
      splits.push({
        recipientId: rule.recipientId,
        recipientType: rule.recipientType,
        amount: amount.toFixed(2, Decimal.ROUND_DOWN),
        currency: '',
        metadata: rule.metadata,
      });
      allocatedAmount = allocatedAmount.plus(amount);
    }

    return splits;
  }

  /**
   * Validate split rules
   */
  private validateSplitRules(
    splitRules: Array<{
      splitType: 'percentage' | 'fixed';
      value: string;
    }>,
    totalAmount: string,
    isPercentageBased: boolean,
  ): void {
    if (!splitRules || splitRules.length === 0) {
      throw new BadRequestException('At least one split rule is required');
    }

    if (isPercentageBased) {
      const totalPercentage = splitRules
        .filter(r => r.splitType === 'percentage')
        .reduce((sum, r) => sum.plus(r.value), new Decimal(0));

      if (totalPercentage.gt(100)) {
        throw new BadRequestException('Total percentage exceeds 100%');
      }
    }

    const totalFixed = splitRules
      .filter(r => r.splitType === 'fixed')
      .reduce((sum, r) => sum.plus(r.value), new Decimal(0));

    if (totalFixed.gt(totalAmount)) {
      throw new BadRequestException('Total fixed amounts exceed total amount');
    }
  }

  /**
   * Get or create recipient wallet
   */
  private async getOrCreateRecipientWallet(
    recipientId: string,
    currency: string,
    queryRunner: any,
  ): Promise<any> {
    // Try to find existing wallet
    let wallet = await queryRunner.manager.findOne(
      'WalletEntity',
      {
        where: { userId: recipientId, currency },
      },
    );

    if (!wallet) {
      // Create new wallet
      wallet = await this.walletsService.createWallet({
        userId: recipientId,
        currency,
        isPrimary: false,
      });
    }

    return wallet;
  }

  /**
   * Get split payment by ID
   */
  async getSplitPayment(splitPaymentId: string): Promise<SplitPaymentEntity> {
    const splitPayment = await this.splitPaymentRepository.findOne({
      where: { splitPaymentId },
    });

    if (!splitPayment) {
      throw new NotFoundException('Split payment not found');
    }

    return splitPayment;
  }

  /**
   * Get user's split configurations
   */
  async getUserConfigurations(userId: string): Promise<SplitConfigurationEntity[]> {
    return this.configurationRepository.find({
      where: { userId, isActive: true },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });
  }

  /**
   * Get payment splits history
   */
  async getPaymentSplits(paymentId: string): Promise<SplitPaymentEntity[]> {
    return this.splitPaymentRepository.find({
      where: { paymentId },
      order: { createdAt: 'DESC' },
    });
  }
}
