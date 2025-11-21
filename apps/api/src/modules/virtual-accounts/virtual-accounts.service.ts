import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { VirtualAccountEntity } from './entities/virtual-account.entity';
import { VirtualAccountTransactionEntity } from './entities/virtual-account-transaction.entity';
import { WalletsService } from '../wallets/wallets.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import * as crypto from 'crypto';

export interface CreateVirtualAccountDto {
  userId: string;
  walletId?: string;
  currency: string;
  country: string;
  provider: 'paystack' | 'flutterwave' | 'woven' | 'budpay' | 'monnify' | 'korapay';
  accountType?: 'dedicated' | 'dynamic' | 'pooled';
  accountName?: string;
  autoCredit?: boolean;
  metadata?: Record<string, any>;
}

export interface ProcessVirtualAccountPaymentDto {
  virtualAccountId: string;
  amount: string;
  currency: string;
  senderAccountNumber?: string;
  senderAccountName?: string;
  senderBankName?: string;
  senderBankCode?: string;
  reference?: string;
  sessionId?: string;
  narration?: string;
  providerTransactionId?: string;
  providerData?: Record<string, any>;
  fee?: string;
}

@Injectable()
export class VirtualAccountsService {
  private readonly logger = new Logger(VirtualAccountsService.name);

  private readonly providerConfigs = {
    paystack: {
      apiUrl: 'https://api.paystack.co',
      apiKey: process.env.PAYSTACK_SECRET_KEY,
    },
    flutterwave: {
      apiUrl: 'https://api.flutterwave.com/v3',
      apiKey: process.env.FLUTTERWAVE_SECRET_KEY,
    },
    woven: {
      apiUrl: 'https://api.woven.finance/v2',
      apiKey: process.env.WOVEN_SECRET_KEY,
    },
    budpay: {
      apiUrl: 'https://api.budpay.com/api/v2',
      apiKey: process.env.BUDPAY_SECRET_KEY,
    },
    monnify: {
      apiUrl: 'https://api.monnify.com/api/v1',
      apiKey: process.env.MONNIFY_API_KEY,
      secretKey: process.env.MONNIFY_SECRET_KEY,
    },
    korapay: {
      apiUrl: 'https://api.korapay.com/merchant/api/v1',
      apiKey: process.env.KORAPAY_SECRET_KEY,
    },
  };

  constructor(
    @InjectRepository(VirtualAccountEntity)
    private readonly virtualAccountRepository: Repository<VirtualAccountEntity>,
    @InjectRepository(VirtualAccountTransactionEntity)
    private readonly transactionRepository: Repository<VirtualAccountTransactionEntity>,
    private readonly walletsService: WalletsService,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Create a virtual account
   */
  async createVirtualAccount(dto: CreateVirtualAccountDto): Promise<VirtualAccountEntity> {
    this.logger.log(`Creating virtual account for user ${dto.userId} via ${dto.provider}`);

    // Check if user already has a virtual account for this currency
    const existing = await this.virtualAccountRepository.findOne({
      where: {
        userId: dto.userId,
        currency: dto.currency,
        provider: dto.provider,
        status: 'active',
      },
    });

    if (existing) {
      this.logger.log(`Returning existing virtual account: ${existing.virtualAccountId}`);
      return existing;
    }

    // Create virtual account via provider
    const providerAccount = await this.createVirtualAccountViaProvider(dto);

    // Save to database
    const virtualAccount = this.virtualAccountRepository.create({
      virtualAccountId: uuidv4(),
      userId: dto.userId,
      walletId: dto.walletId,
      accountNumber: providerAccount.accountNumber,
      accountName: dto.accountName || providerAccount.accountName,
      bankName: providerAccount.bankName,
      bankCode: providerAccount.bankCode,
      routingNumber: providerAccount.routingNumber,
      iban: providerAccount.iban,
      swiftCode: providerAccount.swiftCode,
      currency: dto.currency,
      country: dto.country,
      status: 'active',
      accountType: dto.accountType || 'dedicated',
      provider: dto.provider,
      providerId: providerAccount.providerId,
      providerAccountId: providerAccount.providerAccountId,
      autoCredit: dto.autoCredit !== false,
      metadata: dto.metadata || {},
      providerData: providerAccount.providerData || {},
      totalReceived: '0',
      transactionCount: 0,
      activatedAt: new Date(),
    });

    const saved = await this.virtualAccountRepository.save(virtualAccount);

    this.eventEmitter.emit('virtual_account.created', {
      virtualAccountId: saved.virtualAccountId,
      userId: dto.userId,
      provider: dto.provider,
      accountNumber: saved.accountNumber,
    });

    this.logger.log(`Virtual account created: ${saved.virtualAccountId} - ${saved.accountNumber}`);

    return saved;
  }

  /**
   * Process incoming payment to virtual account
   */
  async processPayment(dto: ProcessVirtualAccountPaymentDto): Promise<VirtualAccountTransactionEntity> {
    this.logger.log(`Processing payment to virtual account ${dto.virtualAccountId}`);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const virtualAccount = await queryRunner.manager.findOne(VirtualAccountEntity, {
        where: { virtualAccountId: dto.virtualAccountId },
      });

      if (!virtualAccount) {
        throw new NotFoundException('Virtual account not found');
      }

      // Create transaction record
      const transaction = queryRunner.manager.create(VirtualAccountTransactionEntity, {
        transactionId: uuidv4(),
        virtualAccountId: virtualAccount.virtualAccountId,
        userId: virtualAccount.userId,
        walletId: virtualAccount.walletId,
        amount: dto.amount,
        currency: dto.currency,
        status: 'pending',
        senderAccountNumber: dto.senderAccountNumber,
        senderAccountName: dto.senderAccountName,
        senderBankName: dto.senderBankName,
        senderBankCode: dto.senderBankCode,
        reference: dto.reference,
        sessionId: dto.sessionId,
        narration: dto.narration,
        provider: virtualAccount.provider,
        providerTransactionId: dto.providerTransactionId,
        providerData: dto.providerData || {},
        fee: dto.fee,
        autoCredited: false,
      });

      await queryRunner.manager.save(transaction);

      // Auto-credit wallet if enabled
      if (virtualAccount.autoCredit && virtualAccount.walletId) {
        try {
          const walletTransaction = await this.walletsService.creditWallet(
            {
              walletId: virtualAccount.walletId,
              amount: dto.amount,
              category: 'deposit',
              description: `Virtual account deposit: ${dto.narration || 'Bank transfer'}`,
              metadata: {
                virtualAccountId: virtualAccount.virtualAccountId,
                senderAccountName: dto.senderAccountName,
                senderBankName: dto.senderBankName,
                reference: dto.reference,
              },
              externalTransactionId: dto.providerTransactionId,
              paymentMethod: 'virtual_account',
              paymentGateway: virtualAccount.provider,
            },
            queryRunner,
          );

          transaction.walletTransactionId = walletTransaction.transactionId;
          transaction.autoCredited = true;
          transaction.status = 'completed';
          transaction.completedAt = new Date();

          this.logger.log(`Wallet auto-credited: ${virtualAccount.walletId}`);
        } catch (error) {
          this.logger.error(`Auto-credit failed: ${error.message}`);
          transaction.status = 'failed';
          transaction.failedAt = new Date();
          transaction.failureReason = `Auto-credit failed: ${error.message}`;
        }
      } else {
        // Manual credit required
        transaction.status = 'completed';
        transaction.completedAt = new Date();
      }

      await queryRunner.manager.save(transaction);

      // Update virtual account stats
      virtualAccount.totalReceived = (parseFloat(virtualAccount.totalReceived) + parseFloat(dto.amount)).toString();
      virtualAccount.transactionCount += 1;
      virtualAccount.lastTransactionAt = new Date();

      await queryRunner.manager.save(virtualAccount);

      await queryRunner.commitTransaction();

      this.eventEmitter.emit('virtual_account.payment_received', {
        virtualAccountId: virtualAccount.virtualAccountId,
        transactionId: transaction.transactionId,
        amount: dto.amount,
        currency: dto.currency,
        autoCredited: transaction.autoCredited,
      });

      this.logger.log(`Virtual account payment processed: ${transaction.transactionId}`);

      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Process payment failed: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Create virtual account via provider (Paystack)
   */
  private async createVirtualAccountViaPaystack(dto: CreateVirtualAccountDto): Promise<any> {
    const config = this.providerConfigs.paystack;

    try {
      const response = await axios.post(
        `${config.apiUrl}/dedicated_account`,
        {
          customer: dto.userId,
          preferred_bank: 'wema-bank', // or 'titan-paystack'
          country: dto.country,
          account_name: dto.accountName,
        },
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.data.status) {
        throw new BadRequestException(response.data.message || 'Failed to create virtual account');
      }

      const data = response.data.data;

      return {
        accountNumber: data.account_number,
        accountName: data.account_name,
        bankName: data.bank.name,
        bankCode: data.bank.slug,
        providerId: data.id.toString(),
        providerAccountId: data.dedicated_account_id,
        providerData: data,
      };
    } catch (error) {
      this.logger.error(`Paystack virtual account creation failed: ${error.message}`);
      throw new BadRequestException(`Failed to create virtual account: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Create virtual account via provider (Flutterwave)
   */
  private async createVirtualAccountViaFlutterwave(dto: CreateVirtualAccountDto): Promise<any> {
    const config = this.providerConfigs.flutterwave;

    try {
      const response = await axios.post(
        `${config.apiUrl}/virtual-account-numbers`,
        {
          email: `${dto.userId}@platform.com`, // Should be actual user email
          is_permanent: true,
          bvn: dto.metadata?.bvn, // Required in Nigeria
          tx_ref: uuidv4(),
          narration: dto.accountName,
        },
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.status !== 'success') {
        throw new BadRequestException(response.data.message || 'Failed to create virtual account');
      }

      const data = response.data.data;

      return {
        accountNumber: data.account_number,
        accountName: data.account_name,
        bankName: data.bank_name,
        bankCode: data.bank_code,
        providerId: data.id.toString(),
        providerAccountId: data.flw_ref,
        providerData: data,
      };
    } catch (error) {
      this.logger.error(`Flutterwave virtual account creation failed: ${error.message}`);
      throw new BadRequestException(`Failed to create virtual account: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Create virtual account via provider (Woven Finance)
   */
  private async createVirtualAccountViaWoven(dto: CreateVirtualAccountDto): Promise<any> {
    const config = this.providerConfigs.woven;

    try {
      const response = await axios.post(
        `${config.apiUrl}/accounts/virtual`,
        {
          first_name: dto.metadata?.firstName || 'User',
          last_name: dto.metadata?.lastName || dto.userId,
          email: dto.metadata?.email || `${dto.userId}@platform.com`,
          phone_number: dto.metadata?.phone,
          currency: dto.currency,
          account_name: dto.accountName,
        },
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      const data = response.data.data;

      return {
        accountNumber: data.account_number,
        accountName: data.account_name,
        bankName: data.bank_name,
        bankCode: data.bank_code,
        providerId: data.id,
        providerAccountId: data.reference,
        providerData: data,
      };
    } catch (error) {
      this.logger.error(`Woven virtual account creation failed: ${error.message}`);
      throw new BadRequestException(`Failed to create virtual account: ${error.response?.data?.message || error.message}`);
    }
  }

  /**
   * Route to appropriate provider
   */
  private async createVirtualAccountViaProvider(dto: CreateVirtualAccountDto): Promise<any> {
    switch (dto.provider) {
      case 'paystack':
        return this.createVirtualAccountViaPaystack(dto);
      case 'flutterwave':
        return this.createVirtualAccountViaFlutterwave(dto);
      case 'woven':
        return this.createVirtualAccountViaWoven(dto);
      case 'budpay':
      case 'monnify':
      case 'korapay':
        // Implement similar methods for other providers
        throw new BadRequestException(`Provider ${dto.provider} not yet implemented`);
      default:
        throw new BadRequestException(`Unknown provider: ${dto.provider}`);
    }
  }

  /**
   * Get virtual account by ID
   */
  async getVirtualAccount(virtualAccountId: string): Promise<VirtualAccountEntity> {
    const account = await this.virtualAccountRepository.findOne({
      where: { virtualAccountId },
    });

    if (!account) {
      throw new NotFoundException('Virtual account not found');
    }

    return account;
  }

  /**
   * Get user's virtual accounts
   */
  async getUserVirtualAccounts(userId: string): Promise<VirtualAccountEntity[]> {
    return this.virtualAccountRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Get virtual account transactions
   */
  async getVirtualAccountTransactions(
    virtualAccountId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<VirtualAccountTransactionEntity[]> {
    return this.transactionRepository.find({
      where: { virtualAccountId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }

  /**
   * Suspend virtual account
   */
  async suspendVirtualAccount(virtualAccountId: string, reason: string): Promise<VirtualAccountEntity> {
    const account = await this.getVirtualAccount(virtualAccountId);

    account.status = 'suspended';
    account.suspendedAt = new Date();
    account.suspensionReason = reason;

    return this.virtualAccountRepository.save(account);
  }

  /**
   * Reactivate virtual account
   */
  async reactivateVirtualAccount(virtualAccountId: string): Promise<VirtualAccountEntity> {
    const account = await this.getVirtualAccount(virtualAccountId);

    account.status = 'active';
    account.suspendedAt = null;
    account.suspensionReason = null;

    return this.virtualAccountRepository.save(account);
  }

  /**
   * Handle webhook from provider
   */
  async handleWebhook(provider: string, payload: any, signature: string): Promise<any> {
    this.logger.log(`Received webhook from ${provider}`);

    // Verify webhook signature
    if (!this.verifyWebhookSignature(provider, payload, signature)) {
      throw new BadRequestException('Invalid webhook signature');
    }

    // Process based on provider
    switch (provider) {
      case 'paystack':
        return this.handlePaystackWebhook(payload);
      case 'flutterwave':
        return this.handleFlutterwaveWebhook(payload);
      case 'woven':
        return this.handleWovenWebhook(payload);
      default:
        throw new BadRequestException(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Handle Paystack webhook
   */
  private async handlePaystackWebhook(payload: any): Promise<any> {
    const event = payload.event;

    if (event === 'charge.success' && payload.data.channel === 'dedicated_nuban') {
      // Find virtual account
      const account = await this.virtualAccountRepository.findOne({
        where: {
          accountNumber: payload.data.authorization.receiver_account_number,
        },
      });

      if (account) {
        // Process payment
        await this.processPayment({
          virtualAccountId: account.virtualAccountId,
          amount: (payload.data.amount / 100).toString(), // Paystack uses kobo
          currency: payload.data.currency,
          senderAccountName: payload.data.customer?.name,
          reference: payload.data.reference,
          sessionId: payload.data.id.toString(),
          narration: payload.data.narration,
          providerTransactionId: payload.data.id.toString(),
          providerData: payload.data,
        });
      }
    }

    return { received: true };
  }

  /**
   * Handle Flutterwave webhook
   */
  private async handleFlutterwaveWebhook(payload: any): Promise<any> {
    // Similar to Paystack
    return { received: true };
  }

  /**
   * Handle Woven webhook
   */
  private async handleWovenWebhook(payload: any): Promise<any> {
    // Similar to Paystack
    return { received: true };
  }

  /**
   * Verify webhook signature
   */
  private verifyWebhookSignature(provider: string, payload: any, signature: string): boolean {
    const config = this.providerConfigs[provider];
    if (!config) return false;

    const hash = crypto
      .createHmac('sha512', config.apiKey)
      .update(JSON.stringify(payload))
      .digest('hex');

    return hash === signature;
  }
}
