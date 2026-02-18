import * as crypto from 'crypto';

export enum LedgerCode {
  // User Wallet Accounts (Asset Accounts - Debits increase, Credits decrease)
  USER_WALLET_USD = 1000,
  USER_WALLET_EUR = 1001,
  USER_WALLET_GBP = 1002,
  USER_WALLET_NGN = 1003,
  USER_WALLET_KES = 1004,
  USER_WALLET_GHS = 1005,
  USER_WALLET_ZAR = 1006,
  USER_WALLET_JPY = 1007,
  USER_WALLET_CNY = 1008,
  USER_WALLET_INR = 1009,

  // Platform Float Accounts (Liability Accounts - Credits increase, Debits decrease)
  PLATFORM_FLOAT_USD = 2000,
  PLATFORM_FLOAT_EUR = 2001,
  PLATFORM_FLOAT_GBP = 2002,
  PLATFORM_FLOAT_NGN = 2003,
  PLATFORM_FLOAT_KES = 2004,
  PLATFORM_FLOAT_GHS = 2005,
  PLATFORM_FLOAT_ZAR = 2006,
  PLATFORM_FLOAT_JPY = 2007,
  PLATFORM_FLOAT_CNY = 2008,
  PLATFORM_FLOAT_INR = 2009,

  // Credit Line Accounts
  USER_CREDIT_LINE = 3000,
  PLATFORM_CREDIT_POOL = 3001,

  // Reserve/Hold Accounts
  PAYMENT_HOLDS_USD = 4000,
  PAYMENT_HOLDS_EUR = 4001,
  PAYMENT_HOLDS_GBP = 4002,
  PAYMENT_HOLDS_NGN = 4003,
  PAYMENT_HOLDS_KES = 4004,
  PAYMENT_HOLDS_GHS = 4005,
  PAYMENT_HOLDS_ZAR = 4006,

  // Fee Accounts
  PLATFORM_FEES_USD = 5000,
  PLATFORM_FEES_EUR = 5001,
  PLATFORM_FEES_GBP = 5002,
  PLATFORM_FEES_NGN = 5003,

  // Gateway Settlement Accounts
  GATEWAY_SETTLEMENT_PAYSTACK = 6000,
  GATEWAY_SETTLEMENT_FLUTTERWAVE = 6001,
  GATEWAY_SETTLEMENT_STRIPE = 6002,
  GATEWAY_SETTLEMENT_RAZORPAY = 6003,
  GATEWAY_SETTLEMENT_MERCADOPAGO = 6004,
}

export class AccountIdGenerator {
  private static readonly CURRENCY_TO_WALLET_CODE: Record<string, number> = {
    USD: LedgerCode.USER_WALLET_USD,
    EUR: LedgerCode.USER_WALLET_EUR,
    GBP: LedgerCode.USER_WALLET_GBP,
    NGN: LedgerCode.USER_WALLET_NGN,
    KES: LedgerCode.USER_WALLET_KES,
    GHS: LedgerCode.USER_WALLET_GHS,
    ZAR: LedgerCode.USER_WALLET_ZAR,
    JPY: LedgerCode.USER_WALLET_JPY,
    CNY: LedgerCode.USER_WALLET_CNY,
    INR: LedgerCode.USER_WALLET_INR,
  };

  private static readonly CURRENCY_TO_FLOAT_CODE: Record<string, number> = {
    USD: LedgerCode.PLATFORM_FLOAT_USD,
    EUR: LedgerCode.PLATFORM_FLOAT_EUR,
    GBP: LedgerCode.PLATFORM_FLOAT_GBP,
    NGN: LedgerCode.PLATFORM_FLOAT_NGN,
    KES: LedgerCode.PLATFORM_FLOAT_KES,
    GHS: LedgerCode.PLATFORM_FLOAT_GHS,
    ZAR: LedgerCode.PLATFORM_FLOAT_ZAR,
    JPY: LedgerCode.PLATFORM_FLOAT_JPY,
    CNY: LedgerCode.PLATFORM_FLOAT_CNY,
    INR: LedgerCode.PLATFORM_FLOAT_INR,
  };

  private static readonly CURRENCY_TO_HOLD_CODE: Record<string, number> = {
    USD: LedgerCode.PAYMENT_HOLDS_USD,
    EUR: LedgerCode.PAYMENT_HOLDS_EUR,
    GBP: LedgerCode.PAYMENT_HOLDS_GBP,
    NGN: LedgerCode.PAYMENT_HOLDS_NGN,
    KES: LedgerCode.PAYMENT_HOLDS_KES,
    GHS: LedgerCode.PAYMENT_HOLDS_GHS,
    ZAR: LedgerCode.PAYMENT_HOLDS_ZAR,
  };

  private static readonly CURRENCY_TO_FEE_CODE: Record<string, number> = {
    USD: LedgerCode.PLATFORM_FEES_USD,
    EUR: LedgerCode.PLATFORM_FEES_EUR,
    GBP: LedgerCode.PLATFORM_FEES_GBP,
    NGN: LedgerCode.PLATFORM_FEES_NGN,
  };

  /**
   * Create wallet account ID for a user and currency
   */
  static createWalletAccountId(userId: string, currency: string): bigint {
    const ledgerCode = this.getCurrencyWalletCode(currency);
    return this.combineWithUserId(ledgerCode, userId);
  }

  /**
   * Create credit line account ID for a user
   */
  static createCreditLineAccountId(userId: string): bigint {
    return this.combineWithUserId(LedgerCode.USER_CREDIT_LINE, userId);
  }

  /**
   * Create platform float account ID for a currency
   */
  static createPlatformFloatAccountId(currency: string): bigint {
    const ledgerCode = this.getCurrencyFloatCode(currency);
    return this.generateFixedAccountId(`PLATFORM_FLOAT_${currency}`);
  }

  /**
   * Create payment hold account ID for a currency
   */
  static createPaymentHoldAccountId(currency: string): bigint {
    const ledgerCode = this.getCurrencyHoldCode(currency);
    return this.generateFixedAccountId(`PAYMENT_HOLDS_${currency}`);
  }

  /**
   * Create platform fee account ID for a currency
   */
  static createPlatformFeeAccountId(currency: string): bigint {
    const ledgerCode = this.getCurrencyFeeCode(currency);
    return this.generateFixedAccountId(`PLATFORM_FEES_${currency}`);
  }

  /**
   * Create gateway settlement account ID
   */
  static createGatewaySettlementAccountId(gateway: string): bigint {
    const ledgerCode = this.getGatewaySettlementCode(gateway);
    return this.generateFixedAccountId(`GATEWAY_${gateway}`);
  }

  /**
   * Get ledger code for wallet account by currency
   */
  static getCurrencyWalletCode(currency: string): number {
    const code = this.CURRENCY_TO_WALLET_CODE[currency.toUpperCase()];
    if (!code) {
      throw new Error(`Unsupported currency for wallet: ${currency}`);
    }
    return code;
  }

  /**
   * Get ledger code for platform float by currency
   */
  static getCurrencyFloatCode(currency: string): number {
    const code = this.CURRENCY_TO_FLOAT_CODE[currency.toUpperCase()];
    if (!code) {
      throw new Error(`Unsupported currency for float: ${currency}`);
    }
    return code;
  }

  /**
   * Get ledger code for payment hold by currency
   */
  static getCurrencyHoldCode(currency: string): number {
    const code = this.CURRENCY_TO_HOLD_CODE[currency.toUpperCase()];
    if (!code) {
      throw new Error(`Unsupported currency for holds: ${currency}`);
    }
    return code;
  }

  /**
   * Get ledger code for fees by currency
   */
  static getCurrencyFeeCode(currency: string): number {
    const code = this.CURRENCY_TO_FEE_CODE[currency.toUpperCase()];
    if (!code) {
      throw new Error(`Unsupported currency for fees: ${currency}`);
    }
    return code;
  }

  /**
   * Get ledger code for gateway settlement
   */
  static getGatewaySettlementCode(gateway: string): number {
    const gatewayMap: Record<string, number> = {
      paystack: LedgerCode.GATEWAY_SETTLEMENT_PAYSTACK,
      flutterwave: LedgerCode.GATEWAY_SETTLEMENT_FLUTTERWAVE,
      stripe: LedgerCode.GATEWAY_SETTLEMENT_STRIPE,
      razorpay: LedgerCode.GATEWAY_SETTLEMENT_RAZORPAY,
      mercadopago: LedgerCode.GATEWAY_SETTLEMENT_MERCADOPAGO,
    };

    const code = gatewayMap[gateway.toLowerCase()];
    if (!code) {
      throw new Error(`Unsupported gateway: ${gateway}`);
    }
    return code;
  }

  /**
   * Combine ledger code with user ID to create account ID
   * Structure: [Ledger Code (32 bits)][User ID Hash (96 bits)]
   */
  private static combineWithUserId(ledgerCode: number, userId: string): bigint {
    // Hash the user ID to get a 96-bit value
    const userIdHash = this.hashToU96(userId);

    // Combine: (ledgerCode << 96) | userIdHash
    const ledgerCodeBig = BigInt(ledgerCode);
    return (ledgerCodeBig << 96n) | userIdHash;
  }

  /**
   * Generate a fixed account ID for platform accounts
   */
  private static generateFixedAccountId(identifier: string): bigint {
    const hash = crypto.createHash('sha256').update(identifier).digest();
    // Take first 16 bytes (128 bits) and convert to bigint
    const high = hash.readBigUInt64BE(0);
    const low = hash.readBigUInt64BE(8);
    return (high << 64n) | low;
  }

  /**
   * Hash a string to a 96-bit value
   */
  private static hashToU96(value: string): bigint {
    const hash = crypto.createHash('sha256').update(value).digest();
    // Take first 12 bytes (96 bits)
    const part1 = hash.readBigUInt64BE(0); // 64 bits
    const part2 = BigInt(hash.readUInt32BE(8)); // 32 bits
    return (part1 << 32n) | part2;
  }

  /**
   * Extract ledger code from account ID
   */
  static extractLedgerCode(accountId: bigint): number {
    // Ledger code is in upper 32 bits
    return Number(accountId >> 96n);
  }

  /**
   * Extract user ID portion from account ID
   */
  static extractUserIdHash(accountId: bigint): bigint {
    // User ID hash is in lower 96 bits
    const mask = (1n << 96n) - 1n;
    return accountId & mask;
  }

  /**
   * Parse account ID to get ledger code and user ID hash
   */
  static parseAccountId(accountId: bigint): {
    ledgerCode: number;
    userIdHash: bigint;
  } {
    return {
      ledgerCode: this.extractLedgerCode(accountId),
      userIdHash: this.extractUserIdHash(accountId),
    };
  }

  /**
   * Get currency from wallet account ID
   */
  static getCurrencyFromWalletAccountId(accountId: bigint): string | null {
    const ledgerCode = this.extractLedgerCode(accountId);

    for (const [currency, code] of Object.entries(this.CURRENCY_TO_WALLET_CODE)) {
      if (code === ledgerCode) {
        return currency;
      }
    }

    return null;
  }

  /**
   * Validate if account ID belongs to a user wallet
   */
  static isUserWalletAccount(accountId: bigint): boolean {
    const ledgerCode = this.extractLedgerCode(accountId);
    return ledgerCode >= 1000 && ledgerCode < 2000;
  }

  /**
   * Validate if account ID belongs to platform float
   */
  static isPlatformFloatAccount(accountId: bigint): boolean {
    const ledgerCode = this.extractLedgerCode(accountId);
    return ledgerCode >= 2000 && ledgerCode < 3000;
  }

  /**
   * Validate if account ID belongs to credit line
   */
  static isCreditLineAccount(accountId: bigint): boolean {
    const ledgerCode = this.extractLedgerCode(accountId);
    return ledgerCode >= 3000 && ledgerCode < 4000;
  }

  /**
   * Generate a deterministic account ID from a UUID string
   * Useful for migration from existing PostgreSQL wallet IDs
   */
  static fromWalletId(walletId: string, currency: string): bigint {
    const ledgerCode = this.getCurrencyWalletCode(currency);
    // Remove hyphens from UUID and convert to user ID
    const cleanId = walletId.replace(/-/g, '');
    return this.combineWithUserId(ledgerCode, cleanId);
  }
}
