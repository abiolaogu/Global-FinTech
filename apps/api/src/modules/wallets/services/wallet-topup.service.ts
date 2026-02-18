import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, QueryRunner } from 'typeorm';
import { WalletTopupEntity } from '../entities/wallet-topup.entity';
import { WalletEntity } from '../entities/wallet.entity';
import { WalletTransactionEntity } from '../entities/wallet-transaction.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Decimal from 'decimal.js';
import { v4 as uuidv4 } from 'uuid';

export interface InitiateTopupDto {
  userId: string;
  walletId: string;
  amount: string;
  sourceType: 'bank_account' | 'card' | 'main_wallet' | 'virtual_account';
  sourceAccountId?: string;
  channel?: 'internet' | 'sms' | 'ussd';
  description?: string;
  metadata?: Record<string, any>;
}

export interface CompleteTopupDto {
  topupId: string;
  gatewayReference?: string;
  metadata?: Record<string, any>;
}

export interface ReverseTopupDto {
  topupId: string;
  reason: string;
}

@Injectable()
export class WalletTopupService {
  constructor(
    @InjectRepository(WalletTopupEntity)
    private topupRepository: Repository<WalletTopupEntity>,
    @InjectRepository(WalletEntity)
    private walletRepository: Repository<WalletEntity>,
    @InjectRepository(WalletTransactionEntity)
    private transactionRepository: Repository<WalletTransactionEntity>,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Initiate a wallet top-up
   */
  async initiateTopup(dto: InitiateTopupDto): Promise<WalletTopupEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Validate wallet exists
      const wallet = await queryRunner.manager.findOne(WalletEntity, {
        where: { walletId: dto.walletId, userId: dto.userId },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      if (wallet.status !== 'active') {
        throw new BadRequestException('Wallet is not active');
      }

      // Validate amount
      const amount = new Decimal(dto.amount);
      if (amount.lte(0)) {
        throw new BadRequestException('Amount must be greater than zero');
      }

      // Create top-up record
      const topup = new WalletTopupEntity();
      topup.topupId = uuidv4();
      topup.walletId = dto.walletId;
      topup.userId = dto.userId;
      topup.amount = amount.toFixed(8);
      topup.sourceType = dto.sourceType;
      topup.sourceAccountId = dto.sourceAccountId;
      topup.channel = dto.channel || 'internet';
      topup.description = dto.description || 'Wallet top-up';
      topup.status = 'pending';
      topup.balanceBefore = wallet.balance;
      topup.metadata = {
        ...dto.metadata,
        initiatedAt: new Date().toISOString(),
      };

      const savedTopup = await queryRunner.manager.save(topup);

      await queryRunner.commitTransaction();

      // Emit event
      this.eventEmitter.emit('wallet.topup.initiated', {
        topupId: savedTopup.topupId,
        userId: dto.userId,
        walletId: dto.walletId,
        amount: dto.amount,
        channel: dto.channel,
      });

      return savedTopup;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Complete a wallet top-up and credit the wallet
   */
  async completeTopup(dto: CompleteTopupDto): Promise<WalletTopupEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get top-up record with lock
      const topup = await queryRunner.manager.findOne(WalletTopupEntity, {
        where: { topupId: dto.topupId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!topup) {
        throw new NotFoundException('Top-up not found');
      }

      if (topup.status !== 'pending' && topup.status !== 'processing') {
        throw new BadRequestException(`Top-up is already ${topup.status}`);
      }

      // Get wallet with lock
      const wallet = await queryRunner.manager.findOne(WalletEntity, {
        where: { walletId: topup.walletId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      // Credit wallet
      const amount = new Decimal(topup.amount);
      const newBalance = new Decimal(wallet.balance).plus(amount);
      const newAvailable = new Decimal(wallet.availableBalance).plus(amount);

      wallet.balance = newBalance.toFixed(8);
      wallet.availableBalance = newAvailable.toFixed(8);
      wallet.lifetimeReceived = new Decimal(wallet.lifetimeReceived)
        .plus(amount)
        .toFixed(8);
      wallet.transactionCount += 1;
      wallet.lastTransactionAt = new Date();

      await queryRunner.manager.save(wallet);

      // Create transaction record
      const transaction = new WalletTransactionEntity();
      transaction.transactionId = uuidv4();
      transaction.walletId = topup.walletId;
      transaction.userId = topup.userId;
      transaction.type = 'credit';
      transaction.amount = topup.amount;
      transaction.balanceBefore = topup.balanceBefore;
      transaction.balanceAfter = wallet.balance;
      transaction.category = 'wallet_topup';
      transaction.description = topup.description || 'Wallet top-up';
      transaction.reference = topup.reference;
      transaction.status = 'completed';
      transaction.metadata = {
        topupId: topup.topupId,
        sourceType: topup.sourceType,
        channel: topup.channel,
        ...dto.metadata,
      };

      await queryRunner.manager.save(transaction);

      // Update top-up status
      topup.status = 'completed';
      topup.completedAt = new Date();
      topup.balanceAfter = wallet.balance;
      topup.metadata = {
        ...topup.metadata,
        ...dto.metadata,
        gatewayReference: dto.gatewayReference,
        completedAt: new Date().toISOString(),
        transactionId: transaction.transactionId,
      };

      const updatedTopup = await queryRunner.manager.save(topup);

      await queryRunner.commitTransaction();

      // Emit events
      this.eventEmitter.emit('wallet.topup.completed', {
        topupId: updatedTopup.topupId,
        userId: topup.userId,
        walletId: topup.walletId,
        amount: topup.amount,
        transactionId: transaction.transactionId,
      });

      this.eventEmitter.emit('wallet.credited', {
        walletId: wallet.walletId,
        userId: wallet.userId,
        amount: topup.amount,
        category: 'wallet_topup',
        transactionId: transaction.transactionId,
      });

      return updatedTopup;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Mark top-up as failed
   */
  async failTopup(topupId: string, reason: string): Promise<WalletTopupEntity> {
    const topup = await this.topupRepository.findOne({
      where: { topupId },
    });

    if (!topup) {
      throw new NotFoundException('Top-up not found');
    }

    topup.status = 'failed';
    topup.failureReason = reason;
    topup.failedAt = new Date();
    topup.metadata = {
      ...topup.metadata,
      failedAt: new Date().toISOString(),
    };

    const updated = await this.topupRepository.save(topup);

    this.eventEmitter.emit('wallet.topup.failed', {
      topupId: updated.topupId,
      userId: topup.userId,
      reason,
    });

    return updated;
  }

  /**
   * Reverse a completed top-up
   */
  async reverseTopup(dto: ReverseTopupDto): Promise<WalletTopupEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get top-up record with lock
      const topup = await queryRunner.manager.findOne(WalletTopupEntity, {
        where: { topupId: dto.topupId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!topup) {
        throw new NotFoundException('Top-up not found');
      }

      if (topup.status !== 'completed') {
        throw new BadRequestException('Can only reverse completed top-ups');
      }

      // Get wallet with lock
      const wallet = await queryRunner.manager.findOne(WalletEntity, {
        where: { walletId: topup.walletId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      // Debit wallet
      const amount = new Decimal(topup.amount);
      const newBalance = new Decimal(wallet.balance).minus(amount);
      const newAvailable = new Decimal(wallet.availableBalance).minus(amount);

      if (newBalance.lt(0)) {
        throw new BadRequestException('Insufficient balance to reverse top-up');
      }

      wallet.balance = newBalance.toFixed(8);
      wallet.availableBalance = newAvailable.toFixed(8);
      wallet.lifetimeSent = new Decimal(wallet.lifetimeSent)
        .plus(amount)
        .toFixed(8);
      wallet.transactionCount += 1;
      wallet.lastTransactionAt = new Date();

      await queryRunner.manager.save(wallet);

      // Create reversal transaction
      const transaction = new WalletTransactionEntity();
      transaction.transactionId = uuidv4();
      transaction.walletId = topup.walletId;
      transaction.userId = topup.userId;
      transaction.type = 'debit';
      transaction.amount = topup.amount;
      transaction.balanceBefore = wallet.balance;
      transaction.balanceAfter = newBalance.toFixed(8);
      transaction.category = 'topup_reversal';
      transaction.description = `Reversal: ${topup.description} - ${dto.reason}`;
      transaction.reference = `REV-${topup.reference}`;
      transaction.status = 'completed';
      transaction.metadata = {
        topupId: topup.topupId,
        originalReference: topup.reference,
        reversalReason: dto.reason,
      };

      await queryRunner.manager.save(transaction);

      // Update top-up status
      topup.status = 'reversed';
      topup.reversedAt = new Date();
      topup.failureReason = dto.reason;
      topup.metadata = {
        ...topup.metadata,
        reversedAt: new Date().toISOString(),
        reversalReason: dto.reason,
        reversalTransactionId: transaction.transactionId,
      };

      const updatedTopup = await queryRunner.manager.save(topup);

      await queryRunner.commitTransaction();

      // Emit event
      this.eventEmitter.emit('wallet.topup.reversed', {
        topupId: updatedTopup.topupId,
        userId: topup.userId,
        walletId: topup.walletId,
        amount: topup.amount,
        reason: dto.reason,
      });

      return updatedTopup;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get top-up by ID
   */
  async getTopup(topupId: string): Promise<WalletTopupEntity> {
    const topup = await this.topupRepository.findOne({
      where: { topupId },
    });

    if (!topup) {
      throw new NotFoundException('Top-up not found');
    }

    return topup;
  }

  /**
   * Get top-ups for a wallet
   */
  async getWalletTopups(
    walletId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<WalletTopupEntity[]> {
    return this.topupRepository.find({
      where: { walletId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Get top-ups for a user
   */
  async getUserTopups(
    userId: string,
    limit: number = 20,
    offset: number = 0,
  ): Promise<WalletTopupEntity[]> {
    return this.topupRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }
}
