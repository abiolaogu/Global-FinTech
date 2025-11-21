import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner, LessThan } from 'typeorm';
import { WalletEntity } from './entities/wallet.entity';
import { WalletTransactionEntity } from './entities/wallet-transaction.entity';
import { WalletHoldEntity } from './entities/wallet-hold.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Decimal from 'decimal.js';
import { v4 as uuidv4 } from 'uuid';

export interface CreateWalletDto {
  userId: string;
  currency: string;
  isPrimary?: boolean;
  metadata?: Record<string, any>;
  limits?: {
    dailyTransactionLimit?: string;
    monthlyTransactionLimit?: string;
    singleTransactionLimit?: string;
    dailyWithdrawalLimit?: string;
  };
}

export interface TransferDto {
  fromWalletId: string;
  toWalletId: string;
  amount: string;
  description?: string;
  metadata?: Record<string, any>;
  reference?: string;
}

export interface CreditWalletDto {
  walletId: string;
  amount: string;
  category: string;
  description?: string;
  metadata?: Record<string, any>;
  externalTransactionId?: string;
  paymentMethod?: string;
  paymentGateway?: string;
}

export interface DebitWalletDto {
  walletId: string;
  amount: string;
  category: string;
  description?: string;
  metadata?: Record<string, any>;
  externalTransactionId?: string;
  paymentMethod?: string;
  paymentGateway?: string;
}

@Injectable()
export class WalletsService {
  private readonly logger = new Logger(WalletsService.name);

  constructor(
    @InjectRepository(WalletEntity)
    private readonly walletRepository: Repository<WalletEntity>,
    @InjectRepository(WalletTransactionEntity)
    private readonly transactionRepository: Repository<WalletTransactionEntity>,
    @InjectRepository(WalletHoldEntity)
    private readonly holdRepository: Repository<WalletHoldEntity>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a new wallet for a user
   */
  async createWallet(dto: CreateWalletDto): Promise<WalletEntity> {
    this.logger.log(`Creating ${dto.currency} wallet for user ${dto.userId}`);

    // Check if wallet already exists
    const existing = await this.walletRepository.findOne({
      where: {
        userId: dto.userId,
        currency: dto.currency,
      },
    });

    if (existing) {
      throw new BadRequestException(`${dto.currency} wallet already exists for this user`);
    }

    const wallet = this.walletRepository.create({
      walletId: uuidv4(),
      userId: dto.userId,
      currency: dto.currency,
      balance: '0',
      availableBalance: '0',
      pendingBalance: '0',
      heldBalance: '0',
      status: 'active',
      isPrimary: dto.isPrimary || false,
      metadata: dto.metadata || {},
      limits: dto.limits || {},
      lifetimeReceived: '0',
      lifetimeSent: '0',
      transactionCount: 0,
    });

    const saved = await this.walletRepository.save(wallet);

    this.eventEmitter.emit('wallet.created', {
      walletId: saved.walletId,
      userId: dto.userId,
      currency: dto.currency,
    });

    this.logger.log(`Wallet created: ${saved.walletId}`);

    return saved;
  }

  /**
   * Credit a wallet (add funds)
   */
  async creditWallet(dto: CreditWalletDto, queryRunner?: QueryRunner): Promise<WalletTransactionEntity> {
    const ownQueryRunner = !queryRunner;
    const qr = queryRunner || this.dataSource.createQueryRunner();

    if (ownQueryRunner) {
      await qr.connect();
      await qr.startTransaction();
    }

    try {
      // Lock wallet for update
      const wallet = await qr.manager.findOne(WalletEntity, {
        where: { walletId: dto.walletId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      if (wallet.status !== 'active') {
        throw new BadRequestException(`Wallet is ${wallet.status}`);
      }

      const amount = new Decimal(dto.amount);
      if (amount.lte(0)) {
        throw new BadRequestException('Amount must be positive');
      }

      const balanceBefore = new Decimal(wallet.balance);
      const balanceAfter = balanceBefore.plus(amount);

      // Create transaction
      const transaction = qr.manager.create(WalletTransactionEntity, {
        transactionId: uuidv4(),
        walletId: wallet.walletId,
        userId: wallet.userId,
        type: 'credit',
        category: dto.category,
        amount: amount.toString(),
        currency: wallet.currency,
        balanceBefore: balanceBefore.toString(),
        balanceAfter: balanceAfter.toString(),
        status: 'completed',
        description: dto.description,
        metadata: dto.metadata || {},
        externalTransactionId: dto.externalTransactionId,
        paymentMethod: dto.paymentMethod,
        paymentGateway: dto.paymentGateway,
        completedAt: new Date(),
      });

      await qr.manager.save(transaction);

      // Update wallet
      wallet.balance = balanceAfter.toString();
      wallet.availableBalance = balanceAfter.minus(wallet.heldBalance).toString();
      wallet.lifetimeReceived = new Decimal(wallet.lifetimeReceived).plus(amount).toString();
      wallet.transactionCount += 1;
      wallet.lastTransactionAt = new Date();

      await qr.manager.save(wallet);

      if (ownQueryRunner) {
        await qr.commitTransaction();
      }

      this.eventEmitter.emit('wallet.credited', {
        walletId: wallet.walletId,
        userId: wallet.userId,
        amount: amount.toString(),
        currency: wallet.currency,
        transactionId: transaction.transactionId,
      });

      this.logger.log(`Wallet credited: ${wallet.walletId} +${amount} ${wallet.currency}`);

      return transaction;
    } catch (error) {
      if (ownQueryRunner) {
        await qr.rollbackTransaction();
      }
      this.logger.error(`Credit wallet failed: ${error.message}`);
      throw error;
    } finally {
      if (ownQueryRunner) {
        await qr.release();
      }
    }
  }

  /**
   * Debit a wallet (remove funds)
   */
  async debitWallet(dto: DebitWalletDto, queryRunner?: QueryRunner): Promise<WalletTransactionEntity> {
    const ownQueryRunner = !queryRunner;
    const qr = queryRunner || this.dataSource.createQueryRunner();

    if (ownQueryRunner) {
      await qr.connect();
      await qr.startTransaction();
    }

    try {
      // Lock wallet for update
      const wallet = await qr.manager.findOne(WalletEntity, {
        where: { walletId: dto.walletId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      if (wallet.status !== 'active') {
        throw new BadRequestException(`Wallet is ${wallet.status}`);
      }

      const amount = new Decimal(dto.amount);
      if (amount.lte(0)) {
        throw new BadRequestException('Amount must be positive');
      }

      const availableBalance = new Decimal(wallet.availableBalance);
      if (amount.gt(availableBalance)) {
        throw new BadRequestException('Insufficient funds');
      }

      const balanceBefore = new Decimal(wallet.balance);
      const balanceAfter = balanceBefore.minus(amount);

      // Create transaction
      const transaction = qr.manager.create(WalletTransactionEntity, {
        transactionId: uuidv4(),
        walletId: wallet.walletId,
        userId: wallet.userId,
        type: 'debit',
        category: dto.category,
        amount: amount.toString(),
        currency: wallet.currency,
        balanceBefore: balanceBefore.toString(),
        balanceAfter: balanceAfter.toString(),
        status: 'completed',
        description: dto.description,
        metadata: dto.metadata || {},
        externalTransactionId: dto.externalTransactionId,
        paymentMethod: dto.paymentMethod,
        paymentGateway: dto.paymentGateway,
        completedAt: new Date(),
      });

      await qr.manager.save(transaction);

      // Update wallet
      wallet.balance = balanceAfter.toString();
      wallet.availableBalance = balanceAfter.minus(wallet.heldBalance).toString();
      wallet.lifetimeSent = new Decimal(wallet.lifetimeSent).plus(amount).toString();
      wallet.transactionCount += 1;
      wallet.lastTransactionAt = new Date();

      await qr.manager.save(wallet);

      if (ownQueryRunner) {
        await qr.commitTransaction();
      }

      this.eventEmitter.emit('wallet.debited', {
        walletId: wallet.walletId,
        userId: wallet.userId,
        amount: amount.toString(),
        currency: wallet.currency,
        transactionId: transaction.transactionId,
      });

      this.logger.log(`Wallet debited: ${wallet.walletId} -${amount} ${wallet.currency}`);

      return transaction;
    } catch (error) {
      if (ownQueryRunner) {
        await qr.rollbackTransaction();
      }
      this.logger.error(`Debit wallet failed: ${error.message}`);
      throw error;
    } finally {
      if (ownQueryRunner) {
        await qr.release();
      }
    }
  }

  /**
   * Transfer funds between wallets
   */
  async transfer(dto: TransferDto): Promise<{
    debitTransaction: WalletTransactionEntity;
    creditTransaction: WalletTransactionEntity;
  }> {
    this.logger.log(`Transfer: ${dto.fromWalletId} -> ${dto.toWalletId}, amount: ${dto.amount}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Lock both wallets
      const fromWallet = await queryRunner.manager.findOne(WalletEntity, {
        where: { walletId: dto.fromWalletId },
        lock: { mode: 'pessimistic_write' },
      });

      const toWallet = await queryRunner.manager.findOne(WalletEntity, {
        where: { walletId: dto.toWalletId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!fromWallet || !toWallet) {
        throw new NotFoundException('Wallet not found');
      }

      if (fromWallet.currency !== toWallet.currency) {
        throw new BadRequestException('Currency mismatch');
      }

      // Debit from sender
      const debitTransaction = await this.debitWallet(
        {
          walletId: dto.fromWalletId,
          amount: dto.amount,
          category: 'transfer_out',
          description: dto.description || `Transfer to ${toWallet.userId}`,
          metadata: { ...dto.metadata, counterpartyWalletId: dto.toWalletId, counterpartyUserId: toWallet.userId },
        },
        queryRunner,
      );

      // Credit to receiver
      const creditTransaction = await this.creditWallet(
        {
          walletId: dto.toWalletId,
          amount: dto.amount,
          category: 'transfer_in',
          description: dto.description || `Transfer from ${fromWallet.userId}`,
          metadata: { ...dto.metadata, counterpartyWalletId: dto.fromWalletId, counterpartyUserId: fromWallet.userId },
        },
        queryRunner,
      );

      // Update cross-references
      debitTransaction.counterpartyWalletId = dto.toWalletId;
      debitTransaction.counterpartyUserId = toWallet.userId;
      debitTransaction.referenceId = creditTransaction.transactionId;

      creditTransaction.counterpartyWalletId = dto.fromWalletId;
      creditTransaction.counterpartyUserId = fromWallet.userId;
      creditTransaction.referenceId = debitTransaction.transactionId;

      await queryRunner.manager.save([debitTransaction, creditTransaction]);

      await queryRunner.commitTransaction();

      this.eventEmitter.emit('wallet.transfer_completed', {
        fromWalletId: dto.fromWalletId,
        toWalletId: dto.toWalletId,
        amount: dto.amount,
        currency: fromWallet.currency,
        debitTransactionId: debitTransaction.transactionId,
        creditTransactionId: creditTransaction.transactionId,
      });

      this.logger.log(`Transfer completed: ${debitTransaction.transactionId}`);

      return { debitTransaction, creditTransaction };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Transfer failed: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Create a hold on wallet funds (authorization)
   */
  async createHold(
    walletId: string,
    amount: string,
    reason: string,
    description?: string,
    expiresAt?: Date,
    metadata?: Record<string, any>,
  ): Promise<WalletHoldEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const wallet = await queryRunner.manager.findOne(WalletEntity, {
        where: { walletId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      const holdAmount = new Decimal(amount);
      const availableBalance = new Decimal(wallet.availableBalance);

      if (holdAmount.gt(availableBalance)) {
        throw new BadRequestException('Insufficient funds for hold');
      }

      const hold = queryRunner.manager.create(WalletHoldEntity, {
        holdId: uuidv4(),
        walletId: wallet.walletId,
        userId: wallet.userId,
        amount: holdAmount.toString(),
        currency: wallet.currency,
        status: 'active',
        reason: reason as any,
        description,
        expiresAt,
        metadata: metadata || {},
      });

      await queryRunner.manager.save(hold);

      // Update wallet
      wallet.heldBalance = new Decimal(wallet.heldBalance).plus(holdAmount).toString();
      wallet.availableBalance = new Decimal(wallet.balance).minus(wallet.heldBalance).toString();

      await queryRunner.manager.save(wallet);

      await queryRunner.commitTransaction();

      this.logger.log(`Hold created: ${hold.holdId} for ${holdAmount} ${wallet.currency}`);

      return hold;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Create hold failed: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Release a hold (return funds to available balance)
   */
  async releaseHold(holdId: string): Promise<WalletHoldEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hold = await queryRunner.manager.findOne(WalletHoldEntity, {
        where: { holdId },
      });

      if (!hold) {
        throw new NotFoundException('Hold not found');
      }

      if (hold.status !== 'active') {
        throw new BadRequestException(`Hold is already ${hold.status}`);
      }

      const wallet = await queryRunner.manager.findOne(WalletEntity, {
        where: { walletId: hold.walletId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      // Update hold
      hold.status = 'released';
      hold.releasedAt = new Date();
      await queryRunner.manager.save(hold);

      // Update wallet
      const holdAmount = new Decimal(hold.amount);
      wallet.heldBalance = new Decimal(wallet.heldBalance).minus(holdAmount).toString();
      wallet.availableBalance = new Decimal(wallet.balance).minus(wallet.heldBalance).toString();

      await queryRunner.manager.save(wallet);

      await queryRunner.commitTransaction();

      this.logger.log(`Hold released: ${holdId}`);

      return hold;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Release hold failed: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Capture a hold (convert to actual debit)
   */
  async captureHold(holdId: string, description?: string): Promise<{
    hold: WalletHoldEntity;
    transaction: WalletTransactionEntity;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const hold = await queryRunner.manager.findOne(WalletHoldEntity, {
        where: { holdId },
      });

      if (!hold) {
        throw new NotFoundException('Hold not found');
      }

      if (hold.status !== 'active') {
        throw new BadRequestException(`Hold is already ${hold.status}`);
      }

      // Debit the wallet
      const transaction = await this.debitWallet(
        {
          walletId: hold.walletId,
          amount: hold.amount,
          category: 'payment_sent',
          description: description || hold.description,
          metadata: { holdId: hold.holdId, ...hold.metadata },
        },
        queryRunner,
      );

      // Update hold
      hold.status = 'captured';
      hold.capturedAt = new Date();
      hold.capturedTransactionId = transaction.transactionId;

      // Also reduce held balance since funds are now debited
      const wallet = await queryRunner.manager.findOne(WalletEntity, {
        where: { walletId: hold.walletId },
        lock: { mode: 'pessimistic_write' },
      });

      const holdAmount = new Decimal(hold.amount);
      wallet.heldBalance = new Decimal(wallet.heldBalance).minus(holdAmount).toString();
      wallet.availableBalance = new Decimal(wallet.balance).minus(wallet.heldBalance).toString();

      await queryRunner.manager.save([hold, wallet]);

      await queryRunner.commitTransaction();

      this.logger.log(`Hold captured: ${holdId} -> ${transaction.transactionId}`);

      return { hold, transaction };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Capture hold failed: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Release expired holds (scheduled job)
   */
  async releaseExpiredHolds(): Promise<number> {
    this.logger.log('Releasing expired holds...');

    const expiredHolds = await this.holdRepository.find({
      where: {
        status: 'active',
        expiresAt: LessThan(new Date()),
      },
    });

    let releasedCount = 0;

    for (const hold of expiredHolds) {
      try {
        await this.releaseHold(hold.holdId);
        releasedCount++;
      } catch (error) {
        this.logger.error(`Failed to release expired hold ${hold.holdId}: ${error.message}`);
      }
    }

    this.logger.log(`Released ${releasedCount} expired holds`);

    return releasedCount;
  }

  /**
   * Get wallet by ID
   */
  async getWallet(walletId: string): Promise<WalletEntity> {
    const wallet = await this.walletRepository.findOne({
      where: { walletId },
    });

    if (!wallet) {
      throw new NotFoundException('Wallet not found');
    }

    return wallet;
  }

  /**
   * Get user's wallets
   */
  async getUserWallets(userId: string): Promise<WalletEntity[]> {
    return this.walletRepository.find({
      where: { userId },
      order: { isPrimary: 'DESC', createdAt: 'ASC' },
    });
  }

  /**
   * Get wallet transactions
   */
  async getWalletTransactions(
    walletId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<WalletTransactionEntity[]> {
    return this.transactionRepository.find({
      where: { walletId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get wallet balance
   */
  async getBalance(walletId: string): Promise<{
    balance: string;
    availableBalance: string;
    pendingBalance: string;
    heldBalance: string;
    currency: string;
  }> {
    const wallet = await this.getWallet(walletId);

    return {
      balance: wallet.balance,
      availableBalance: wallet.availableBalance,
      pendingBalance: wallet.pendingBalance,
      heldBalance: wallet.heldBalance,
      currency: wallet.currency,
    };
  }

  /**
   * Freeze wallet
   */
  async freezeWallet(walletId: string, reason: string): Promise<WalletEntity> {
    const wallet = await this.getWallet(walletId);

    wallet.status = 'frozen';
    wallet.frozenAt = new Date();
    wallet.frozenReason = reason;

    return this.walletRepository.save(wallet);
  }

  /**
   * Unfreeze wallet
   */
  async unfreezeWallet(walletId: string): Promise<WalletEntity> {
    const wallet = await this.getWallet(walletId);

    wallet.status = 'active';
    wallet.frozenAt = null;
    wallet.frozenReason = null;

    return this.walletRepository.save(wallet);
  }
}
