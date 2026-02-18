import { Injectable, OnModuleInit, OnModuleDestroy, Logger } from '@nestjs/common';
import { createClient, Client, Account, Transfer, CreateAccountError, CreateTransferError } from 'tigerbeetle-node';
import { EventEmitter2 } from '@nestjs/event-emitter';
import * as crypto from 'crypto';

export interface CreateAccountDto {
  id: bigint;
  ledger: number;
  code: number;
  flags?: number;
  debits_posted?: bigint;
  credits_posted?: bigint;
  user_data_128?: bigint;
  user_data_64?: bigint;
  user_data_32?: number;
}

export interface CreateTransferDto {
  id?: bigint;
  debit_account_id: bigint;
  credit_account_id: bigint;
  amount: bigint;
  ledger?: number;
  code: number;
  flags?: number;
  user_data_128?: bigint;
  user_data_64?: bigint;
  user_data_32?: number;
  timeout?: number;
  pending_id?: bigint;
}

export interface AccountBalance {
  account_id: bigint;
  debits_pending: bigint;
  debits_posted: bigint;
  credits_pending: bigint;
  credits_posted: bigint;
  available_balance: bigint;
  total_balance: bigint;
}

export enum AccountFlags {
  NONE = 0,
  LINKED = 1 << 0,
  DEBITS_MUST_NOT_EXCEED_CREDITS = 1 << 1,
  CREDITS_MUST_NOT_EXCEED_DEBITS = 1 << 2,
}

export enum TransferFlags {
  NONE = 0,
  LINKED = 1 << 0,
  PENDING = 1 << 1,
  POST_PENDING_TRANSFER = 1 << 2,
  VOID_PENDING_TRANSFER = 1 << 3,
  BALANCING_DEBIT = 1 << 4,
  BALANCING_CREDIT = 1 << 5,
}

export enum TransferCode {
  WALLET_DEPOSIT = 1,
  WALLET_WITHDRAWAL = 2,
  PAYMENT_SEND = 3,
  PAYMENT_RECEIVE = 4,
  PAYMENT_HOLD = 5,
  PAYMENT_CAPTURE = 6,
  PAYMENT_VOID = 7,
  SPLIT_PAYMENT = 8,
  CREDIT_ADVANCE = 9,
  CREDIT_REPAYMENT = 10,
  FEE_CHARGE = 11,
  REFUND = 12,
  TRANSFER_WALLET = 13,
  SMS_SYNC_CREDIT = 14,
  USSD_SYNC_CREDIT = 15,
}

@Injectable()
export class TigerBeetleService implements OnModuleInit, OnModuleDestroy {
  private client: Client;
  private readonly logger = new Logger(TigerBeetleService.name);
  private readonly CLUSTER_ID = BigInt(process.env.TIGERBEETLE_CLUSTER_ID || '0');
  private readonly REPLICA_ADDRESSES = (
    process.env.TIGERBEETLE_REPLICA_ADDRESSES ||
    '3000@127.0.0.1:3000,3001@127.0.0.1:3001,3002@127.0.0.1:3002'
  ).split(',');

  constructor(private eventEmitter: EventEmitter2) {}

  async onModuleInit() {
    try {
      this.logger.log('Initializing TigerBeetle client...');
      this.logger.log(`Cluster ID: ${this.CLUSTER_ID}`);
      this.logger.log(`Replica addresses: ${this.REPLICA_ADDRESSES.join(', ')}`);

      this.client = createClient({
        cluster_id: this.CLUSTER_ID,
        replica_addresses: this.REPLICA_ADDRESSES,
      });

      this.logger.log('TigerBeetle client initialized successfully');

      // Create platform accounts if they don't exist
      await this.initializePlatformAccounts();
    } catch (error) {
      this.logger.error('Failed to initialize TigerBeetle client', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      this.logger.log('Closing TigerBeetle client...');
      // Client cleanup handled by Node.js client
    }
  }

  /**
   * Initialize platform accounts (float, fees, etc.)
   */
  private async initializePlatformAccounts(): Promise<void> {
    const platformAccounts: CreateAccountDto[] = [
      // Platform float accounts for each currency
      {
        id: this.generateAccountId('PLATFORM_FLOAT_USD'),
        ledger: 1,
        code: 2000, // PLATFORM_FLOAT_USD
        flags: AccountFlags.NONE,
      },
      {
        id: this.generateAccountId('PLATFORM_FLOAT_EUR'),
        ledger: 1,
        code: 2001,
        flags: AccountFlags.NONE,
      },
      {
        id: this.generateAccountId('PLATFORM_FLOAT_NGN'),
        ledger: 1,
        code: 2003,
        flags: AccountFlags.NONE,
      },
      // Platform credit pool
      {
        id: this.generateAccountId('PLATFORM_CREDIT_POOL'),
        ledger: 1,
        code: 3001,
        flags: AccountFlags.NONE,
      },
      // Platform fee accounts
      {
        id: this.generateAccountId('PLATFORM_FEES_USD'),
        ledger: 1,
        code: 5000,
        flags: AccountFlags.NONE,
      },
    ];

    for (const account of platformAccounts) {
      try {
        await this.createAccount(account);
        this.logger.log(`Platform account created: ${account.code}`);
      } catch (error) {
        // Account might already exist, ignore error
        if (!error.message?.includes('exists')) {
          this.logger.warn(`Failed to create platform account ${account.code}:`, error.message);
        }
      }
    }
  }

  /**
   * Create a new account in TigerBeetle
   */
  async createAccount(dto: CreateAccountDto): Promise<Account> {
    const account: Account = {
      id: dto.id,
      debits_pending: 0n,
      debits_posted: dto.debits_posted || 0n,
      credits_pending: 0n,
      credits_posted: dto.credits_posted || 0n,
      user_data_128: dto.user_data_128 || 0n,
      user_data_64: dto.user_data_64 || 0n,
      user_data_32: dto.user_data_32 || 0,
      reserved: 0,
      ledger: dto.ledger,
      code: dto.code,
      flags: dto.flags || 0,
      timestamp: 0n,
    };

    const errors = await this.client.createAccounts([account]);

    if (errors.length > 0) {
      const error = errors[0];
      throw new Error(`Failed to create account: ${CreateAccountError[error.result]}`);
    }

    this.eventEmitter.emit('tigerbeetle.account.created', {
      accountId: dto.id.toString(),
      ledger: dto.ledger,
      code: dto.code,
    });

    return account;
  }

  /**
   * Create multiple accounts in batch
   */
  async createAccounts(dtos: CreateAccountDto[]): Promise<Account[]> {
    const accounts: Account[] = dtos.map((dto) => ({
      id: dto.id,
      debits_pending: 0n,
      debits_posted: dto.debits_posted || 0n,
      credits_pending: 0n,
      credits_posted: dto.credits_posted || 0n,
      user_data_128: dto.user_data_128 || 0n,
      user_data_64: dto.user_data_64 || 0n,
      user_data_32: dto.user_data_32 || 0,
      reserved: 0,
      ledger: dto.ledger,
      code: dto.code,
      flags: dto.flags || 0,
      timestamp: 0n,
    }));

    const errors = await this.client.createAccounts(accounts);

    if (errors.length > 0) {
      this.logger.error(`Failed to create ${errors.length} accounts out of ${accounts.length}`);
      errors.forEach((error) => {
        this.logger.error(`Account ${error.index}: ${CreateAccountError[error.result]}`);
      });
      throw new Error(`Failed to create ${errors.length} accounts`);
    }

    return accounts;
  }

  /**
   * Lookup account by ID
   */
  async lookupAccount(accountId: bigint): Promise<Account | null> {
    const accounts = await this.client.lookupAccounts([accountId]);
    return accounts.length > 0 ? accounts[0] : null;
  }

  /**
   * Lookup multiple accounts
   */
  async lookupAccounts(accountIds: bigint[]): Promise<Account[]> {
    return await this.client.lookupAccounts(accountIds);
  }

  /**
   * Get account balance
   */
  async getAccountBalance(accountId: bigint): Promise<AccountBalance> {
    const account = await this.lookupAccount(accountId);

    if (!account) {
      throw new Error('Account not found');
    }

    const totalBalance = account.credits_posted - account.debits_posted;
    const availableBalance = totalBalance - account.debits_pending;

    return {
      account_id: accountId,
      debits_pending: account.debits_pending,
      debits_posted: account.debits_posted,
      credits_pending: account.credits_pending,
      credits_posted: account.credits_posted,
      available_balance: availableBalance,
      total_balance: totalBalance,
    };
  }

  /**
   * Create a transfer
   */
  async createTransfer(dto: CreateTransferDto): Promise<Transfer> {
    const transfer: Transfer = {
      id: dto.id || this.generateTransferId(),
      debit_account_id: dto.debit_account_id,
      credit_account_id: dto.credit_account_id,
      amount: dto.amount,
      pending_id: dto.pending_id || 0n,
      user_data_128: dto.user_data_128 || 0n,
      user_data_64: dto.user_data_64 || 0n,
      user_data_32: dto.user_data_32 || 0,
      timeout: dto.timeout || 0,
      ledger: dto.ledger || 1,
      code: dto.code,
      flags: dto.flags || 0,
      timestamp: 0n,
    };

    const errors = await this.client.createTransfers([transfer]);

    if (errors.length > 0) {
      const error = errors[0];
      const errorMessage = CreateTransferError[error.result];
      throw new Error(`Failed to create transfer: ${errorMessage}`);
    }

    this.eventEmitter.emit('tigerbeetle.transfer.created', {
      transferId: transfer.id.toString(),
      debitAccountId: dto.debit_account_id.toString(),
      creditAccountId: dto.credit_account_id.toString(),
      amount: dto.amount.toString(),
      code: dto.code,
    });

    return transfer;
  }

  /**
   * Create multiple linked transfers (atomic)
   */
  async createLinkedTransfers(dtos: CreateTransferDto[]): Promise<Transfer[]> {
    const transfers: Transfer[] = dtos.map((dto, index) => ({
      id: dto.id || this.generateTransferId(),
      debit_account_id: dto.debit_account_id,
      credit_account_id: dto.credit_account_id,
      amount: dto.amount,
      pending_id: dto.pending_id || 0n,
      user_data_128: dto.user_data_128 || 0n,
      user_data_64: dto.user_data_64 || 0n,
      user_data_32: dto.user_data_32 || 0,
      timeout: dto.timeout || 0,
      ledger: dto.ledger || 1,
      code: dto.code,
      flags: (dto.flags || 0) | TransferFlags.LINKED,
      timestamp: 0n,
    }));

    const errors = await this.client.createTransfers(transfers);

    if (errors.length > 0) {
      this.logger.error(`Failed to create ${errors.length} transfers out of ${transfers.length}`);
      errors.forEach((error) => {
        this.logger.error(`Transfer ${error.index}: ${CreateTransferError[error.result]}`);
      });
      throw new Error(`Failed to create ${errors.length} linked transfers`);
    }

    this.eventEmitter.emit('tigerbeetle.linked_transfers.created', {
      count: transfers.length,
      transferIds: transfers.map((t) => t.id.toString()),
    });

    return transfers;
  }

  /**
   * Create a pending transfer (hold)
   */
  async createPendingTransfer(dto: CreateTransferDto): Promise<Transfer> {
    return this.createTransfer({
      ...dto,
      flags: (dto.flags || 0) | TransferFlags.PENDING,
      timeout: dto.timeout || 3600, // Default 1 hour timeout
    });
  }

  /**
   * Post (capture) a pending transfer
   */
  async postPendingTransfer(
    pendingId: bigint,
    debitAccountId: bigint,
    creditAccountId: bigint,
    amount: bigint,
    code: number,
  ): Promise<Transfer> {
    return this.createTransfer({
      id: this.generateTransferId(),
      debit_account_id: debitAccountId,
      credit_account_id: creditAccountId,
      amount,
      ledger: 1,
      code,
      flags: TransferFlags.POST_PENDING_TRANSFER,
      pending_id: pendingId,
    });
  }

  /**
   * Void (cancel) a pending transfer
   */
  async voidPendingTransfer(
    pendingId: bigint,
    debitAccountId: bigint,
    creditAccountId: bigint,
    amount: bigint,
    code: number,
  ): Promise<Transfer> {
    return this.createTransfer({
      id: this.generateTransferId(),
      debit_account_id: debitAccountId,
      credit_account_id: creditAccountId,
      amount,
      ledger: 1,
      code,
      flags: TransferFlags.VOID_PENDING_TRANSFER,
      pending_id: pendingId,
    });
  }

  /**
   * Lookup transfer by ID
   */
  async lookupTransfer(transferId: bigint): Promise<Transfer | null> {
    const transfers = await this.client.lookupTransfers([transferId]);
    return transfers.length > 0 ? transfers[0] : null;
  }

  /**
   * Get account history (recent transfers)
   */
  async getAccountTransfers(
    accountId: bigint,
    flags: {
      debits?: boolean;
      credits?: boolean;
      reversed?: boolean;
    } = { debits: true, credits: true },
  ): Promise<Transfer[]> {
    // TigerBeetle provides getAccountTransfers for querying
    // For now, this would need to be implemented based on TigerBeetle's query API
    // or by maintaining an index in PostgreSQL
    this.logger.warn('getAccountTransfers not fully implemented - requires TigerBeetle query API');
    return [];
  }

  /**
   * Convert decimal amount to TigerBeetle amount (cents/smallest unit)
   */
  toTigerBeetleAmount(decimalAmount: string | number): bigint {
    const amount = typeof decimalAmount === 'string' ? parseFloat(decimalAmount) : decimalAmount;
    // Convert to cents (multiply by 100) and then to bigint
    return BigInt(Math.round(amount * 100));
  }

  /**
   * Convert TigerBeetle amount to decimal string
   */
  fromTigerBeetleAmount(amount: bigint): string {
    const cents = Number(amount);
    return (cents / 100).toFixed(2);
  }

  /**
   * Generate unique transfer ID
   */
  generateTransferId(): bigint {
    // Use timestamp (42 bits) + random (86 bits) for 128-bit ID
    const timestamp = BigInt(Date.now());
    const random = BigInt('0x' + crypto.randomBytes(11).toString('hex'));
    return (timestamp << 86n) | random;
  }

  /**
   * Generate account ID from string identifier
   */
  generateAccountId(identifier: string): bigint {
    const hash = crypto.createHash('sha256').update(identifier).digest();
    // Take first 16 bytes (128 bits) and convert to bigint
    const high = hash.readBigUInt64BE(0);
    const low = hash.readBigUInt64BE(8);
    return (high << 64n) | low;
  }

  /**
   * Check if TigerBeetle is healthy
   */
  async healthCheck(): Promise<{
    status: string;
    latency_ms: number;
  }> {
    const start = Date.now();

    try {
      // Try to lookup a known account (platform float)
      const platformFloatId = this.generateAccountId('PLATFORM_FLOAT_USD');
      await this.lookupAccount(platformFloatId);

      const latency = Date.now() - start;

      return {
        status: 'healthy',
        latency_ms: latency,
      };
    } catch (error) {
      this.logger.error('TigerBeetle health check failed', error);
      return {
        status: 'unhealthy',
        latency_ms: Date.now() - start,
      };
    }
  }

  /**
   * Get client instance (for advanced usage)
   */
  getClient(): Client {
    return this.client;
  }
}
