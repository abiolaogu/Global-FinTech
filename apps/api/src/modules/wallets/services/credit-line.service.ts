import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { CreditLineEntity } from '../entities/credit-line.entity';
import { WalletEntity } from '../entities/wallet.entity';
import { WalletTransactionEntity } from '../entities/wallet-transaction.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Decimal from 'decimal.js';
import { v4 as uuidv4 } from 'uuid';

export interface AllocateCreditLineDto {
  userId: string;
  walletId?: string;
  creditLimit: string;
  interestRate?: number;
  gracePeriodDays?: number;
  metadata?: {
    creditScore?: number;
    assessmentDate?: string;
    approvedBy?: string;
    approvalNotes?: string;
    riskCategory?: 'low' | 'medium' | 'high';
  };
}

export interface UseCreditDto {
  userId: string;
  walletId: string;
  amount: string;
  purpose: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface RepayCreditDto {
  userId: string;
  amount: string;
  paymentMethod?: string;
  metadata?: Record<string, any>;
}

@Injectable()
export class CreditLineService {
  constructor(
    @InjectRepository(CreditLineEntity)
    private creditLineRepository: Repository<CreditLineEntity>,
    @InjectRepository(WalletEntity)
    private walletRepository: Repository<WalletEntity>,
    @InjectRepository(WalletTransactionEntity)
    private transactionRepository: Repository<WalletTransactionEntity>,
    private dataSource: DataSource,
    private eventEmitter: EventEmitter2,
  ) {}

  /**
   * Allocate credit line to a user
   */
  async allocateCreditLine(dto: AllocateCreditLineDto): Promise<CreditLineEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Check if user already has a credit line
      const existing = await queryRunner.manager.findOne(CreditLineEntity, {
        where: { userId: dto.userId },
      });

      if (existing) {
        throw new BadRequestException('User already has a credit line');
      }

      // Validate credit limit
      const creditLimit = new Decimal(dto.creditLimit);
      if (creditLimit.lte(0)) {
        throw new BadRequestException('Credit limit must be greater than zero');
      }

      // Create credit line
      const creditLine = new CreditLineEntity();
      creditLine.creditLineId = uuidv4();
      creditLine.userId = dto.userId;
      creditLine.walletId = dto.walletId;
      creditLine.creditLimit = creditLimit.toFixed(8);
      creditLine.creditUsed = '0';
      creditLine.interestRate = dto.interestRate || 0;
      creditLine.gracePeriodDays = dto.gracePeriodDays || 30;
      creditLine.status = 'active';
      creditLine.metadata = dto.metadata;
      creditLine.nextPaymentDue = new Date(
        Date.now() + (dto.gracePeriodDays || 30) * 24 * 60 * 60 * 1000,
      );

      const saved = await queryRunner.manager.save(creditLine);

      // Update wallet with credit line info
      if (dto.walletId) {
        const wallet = await queryRunner.manager.findOne(WalletEntity, {
          where: { walletId: dto.walletId },
        });

        if (wallet) {
          wallet.creditLimit = creditLimit.toFixed(8);
          wallet.creditUsed = '0';
          wallet.creditInterestRate = dto.interestRate || 0;
          wallet.creditGracePeriodDays = dto.gracePeriodDays || 30;
          wallet.creditAllocatedAt = new Date();
          wallet.creditNextPaymentDue = creditLine.nextPaymentDue;
          await queryRunner.manager.save(wallet);
        }
      }

      await queryRunner.commitTransaction();

      // Emit event
      this.eventEmitter.emit('credit.line.allocated', {
        creditLineId: saved.creditLineId,
        userId: dto.userId,
        creditLimit: dto.creditLimit,
      });

      return saved;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Use credit line (add to wallet balance)
   */
  async useCredit(dto: UseCreditDto): Promise<{
    transaction: WalletTransactionEntity;
    creditLine: CreditLineEntity;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get credit line with lock
      const creditLine = await queryRunner.manager.findOne(CreditLineEntity, {
        where: { userId: dto.userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!creditLine) {
        throw new NotFoundException('Credit line not found');
      }

      if (!creditLine.isUsable) {
        throw new BadRequestException('Credit line is not available for use');
      }

      // Validate amount
      const amount = new Decimal(dto.amount);
      if (amount.lte(0)) {
        throw new BadRequestException('Amount must be greater than zero');
      }

      const available = new Decimal(creditLine.creditAvailable);
      if (amount.gt(available)) {
        throw new BadRequestException(
          `Insufficient credit. Available: ${creditLine.creditAvailable}`,
        );
      }

      // Get wallet with lock
      const wallet = await queryRunner.manager.findOne(WalletEntity, {
        where: { walletId: dto.walletId, userId: dto.userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!wallet) {
        throw new NotFoundException('Wallet not found');
      }

      // Update credit line
      const newCreditUsed = new Decimal(creditLine.creditUsed).plus(amount);
      creditLine.creditUsed = newCreditUsed.toFixed(8);
      creditLine.lastUsedAt = new Date();

      await queryRunner.manager.save(creditLine);

      // Credit wallet with the credit line amount
      const newBalance = new Decimal(wallet.balance).plus(amount);
      const newAvailable = new Decimal(wallet.availableBalance).plus(amount);

      wallet.balance = newBalance.toFixed(8);
      wallet.availableBalance = newAvailable.toFixed(8);
      wallet.creditUsed = newCreditUsed.toFixed(8);
      wallet.creditLastUsedAt = new Date();
      wallet.lifetimeReceived = new Decimal(wallet.lifetimeReceived)
        .plus(amount)
        .toFixed(8);
      wallet.transactionCount += 1;
      wallet.lastTransactionAt = new Date();

      await queryRunner.manager.save(wallet);

      // Create transaction record
      const transaction = new WalletTransactionEntity();
      transaction.transactionId = uuidv4();
      transaction.walletId = dto.walletId;
      transaction.userId = dto.userId;
      transaction.type = 'credit';
      transaction.amount = amount.toFixed(8);
      transaction.balanceBefore = new Decimal(wallet.balance).minus(amount).toFixed(8);
      transaction.balanceAfter = wallet.balance;
      transaction.category = 'credit_line_advance';
      transaction.description =
        dto.description || `Credit line advance - ${dto.purpose}`;
      transaction.status = 'completed';
      transaction.metadata = {
        creditLineId: creditLine.creditLineId,
        purpose: dto.purpose,
        creditUsedBefore: new Decimal(creditLine.creditUsed).minus(amount).toFixed(8),
        creditUsedAfter: creditLine.creditUsed,
        creditAvailable: creditLine.creditAvailable,
        ...dto.metadata,
      };

      const savedTxn = await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();

      // Emit events
      this.eventEmitter.emit('credit.line.used', {
        creditLineId: creditLine.creditLineId,
        userId: dto.userId,
        amount: dto.amount,
        transactionId: savedTxn.transactionId,
      });

      this.eventEmitter.emit('wallet.credited', {
        walletId: wallet.walletId,
        userId: wallet.userId,
        amount: dto.amount,
        category: 'credit_line_advance',
        transactionId: savedTxn.transactionId,
      });

      return {
        transaction: savedTxn,
        creditLine,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Repay credit line
   */
  async repayCredit(dto: RepayCreditDto): Promise<{
    transaction: WalletTransactionEntity;
    creditLine: CreditLineEntity;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get credit line with lock
      const creditLine = await queryRunner.manager.findOne(CreditLineEntity, {
        where: { userId: dto.userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!creditLine) {
        throw new NotFoundException('Credit line not found');
      }

      // Validate amount
      const amount = new Decimal(dto.amount);
      if (amount.lte(0)) {
        throw new BadRequestException('Amount must be greater than zero');
      }

      const creditUsed = new Decimal(creditLine.creditUsed);
      if (amount.gt(creditUsed)) {
        throw new BadRequestException(
          `Repayment amount exceeds credit used. Used: ${creditLine.creditUsed}`,
        );
      }

      // Update credit line
      const newCreditUsed = creditUsed.minus(amount);
      const oldTotalRepaid = new Decimal(creditLine.totalRepaid);

      creditLine.creditUsed = newCreditUsed.toFixed(8);
      creditLine.totalRepaid = oldTotalRepaid.plus(amount).toFixed(8);
      creditLine.lastRepaymentAt = new Date();

      // Reset missed payments if fully repaid
      if (newCreditUsed.eq(0)) {
        creditLine.missedPayments = 0;
        creditLine.nextPaymentDue = null;
      }

      await queryRunner.manager.save(creditLine);

      // Update wallet if linked
      if (creditLine.walletId) {
        const wallet = await queryRunner.manager.findOne(WalletEntity, {
          where: { walletId: creditLine.walletId },
        });

        if (wallet) {
          wallet.creditUsed = newCreditUsed.toFixed(8);
          await queryRunner.manager.save(wallet);
        }
      }

      // Create transaction record (external payment, not wallet transaction)
      const transaction = new WalletTransactionEntity();
      transaction.transactionId = uuidv4();
      transaction.walletId = creditLine.walletId;
      transaction.userId = dto.userId;
      transaction.type = 'credit_repayment';
      transaction.amount = amount.toFixed(8);
      transaction.category = 'credit_line_repayment';
      transaction.description = 'Credit line repayment';
      transaction.status = 'completed';
      transaction.metadata = {
        creditLineId: creditLine.creditLineId,
        creditUsedBefore: creditUsed.toFixed(8),
        creditUsedAfter: creditLine.creditUsed,
        creditAvailable: creditLine.creditAvailable,
        paymentMethod: dto.paymentMethod,
        ...dto.metadata,
      };

      const savedTxn = await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();

      // Emit event
      this.eventEmitter.emit('credit.line.repaid', {
        creditLineId: creditLine.creditLineId,
        userId: dto.userId,
        amount: dto.amount,
        transactionId: savedTxn.transactionId,
      });

      return {
        transaction: savedTxn,
        creditLine,
      };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get credit line info for user
   */
  async getCreditLine(userId: string): Promise<CreditLineEntity> {
    const creditLine = await this.creditLineRepository.findOne({
      where: { userId },
    });

    if (!creditLine) {
      throw new NotFoundException('Credit line not found');
    }

    return creditLine;
  }

  /**
   * Get available credit for user
   */
  async getAvailableCredit(userId: string): Promise<string> {
    const creditLine = await this.getCreditLine(userId);
    return creditLine.creditAvailable;
  }

  /**
   * Suspend credit line
   */
  async suspendCreditLine(
    userId: string,
    reason: string,
  ): Promise<CreditLineEntity> {
    const creditLine = await this.getCreditLine(userId);

    creditLine.status = 'suspended';
    creditLine.suspensionReason = reason;
    creditLine.suspendedAt = new Date();

    const updated = await this.creditLineRepository.save(creditLine);

    this.eventEmitter.emit('credit.line.suspended', {
      creditLineId: updated.creditLineId,
      userId,
      reason,
    });

    return updated;
  }

  /**
   * Activate suspended credit line
   */
  async activateCreditLine(userId: string): Promise<CreditLineEntity> {
    const creditLine = await this.getCreditLine(userId);

    if (creditLine.status !== 'suspended') {
      throw new BadRequestException('Credit line is not suspended');
    }

    creditLine.status = 'active';
    creditLine.suspensionReason = null;
    creditLine.suspendedAt = null;

    const updated = await this.creditLineRepository.save(creditLine);

    this.eventEmitter.emit('credit.line.activated', {
      creditLineId: updated.creditLineId,
      userId,
    });

    return updated;
  }

  /**
   * Update credit limit
   */
  async updateCreditLimit(
    userId: string,
    newLimit: string,
  ): Promise<CreditLineEntity> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const creditLine = await queryRunner.manager.findOne(CreditLineEntity, {
        where: { userId },
        lock: { mode: 'pessimistic_write' },
      });

      if (!creditLine) {
        throw new NotFoundException('Credit line not found');
      }

      const limit = new Decimal(newLimit);
      if (limit.lt(0)) {
        throw new BadRequestException('Credit limit cannot be negative');
      }

      const used = new Decimal(creditLine.creditUsed);
      if (limit.lt(used)) {
        throw new BadRequestException(
          'New limit cannot be less than amount already used',
        );
      }

      const oldLimit = creditLine.creditLimit;
      creditLine.creditLimit = limit.toFixed(8);

      await queryRunner.manager.save(creditLine);

      // Update wallet if linked
      if (creditLine.walletId) {
        const wallet = await queryRunner.manager.findOne(WalletEntity, {
          where: { walletId: creditLine.walletId },
        });

        if (wallet) {
          wallet.creditLimit = limit.toFixed(8);
          await queryRunner.manager.save(wallet);
        }
      }

      await queryRunner.commitTransaction();

      this.eventEmitter.emit('credit.line.limit.updated', {
        creditLineId: creditLine.creditLineId,
        userId,
        oldLimit,
        newLimit,
      });

      return creditLine;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
