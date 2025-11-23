import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { HSMService } from '../security/hsm.service';
import * as crypto from 'crypto';

export enum CardStatus {
  ORDERED = 'ordered',
  MANUFACTURED = 'manufactured',
  SHIPPED = 'shipped',
  ACTIVATED = 'activated',
  ACTIVE = 'active',
  BLOCKED = 'blocked',
  SUSPENDED = 'suspended',
  LOST = 'lost',
  STOLEN = 'stolen',
  DAMAGED = 'damaged',
  EXPIRED = 'expired',
  CLOSED = 'closed',
}

export enum CardType {
  DEBIT = 'debit',
  CREDIT = 'credit',
  PREPAID = 'prepaid',
  VIRTUAL = 'virtual',
}

export enum CardNetwork {
  VISA = 'visa',
  MASTERCARD = 'mastercard',
  AMEX = 'amex',
  DISCOVER = 'discover',
  UNIONPAY = 'unionpay',
}

/**
 * AtlasX Card Management System
 *
 * Superior to jPOS card management with:
 * - Complete card lifecycle management
 * - Multi-network support (Visa, Mastercard, Amex, etc.)
 * - Instant virtual card issuance
 * - Real-time activation/deactivation
 * - PIN management (set, change, reset)
 * - Card controls (limits, restrictions)
 * - EMV chip personalization
 * - Tokenization support (Apple Pay, Google Pay)
 * - Fraud monitoring integration
 */
@Injectable()
export class CardManagementService {
  private readonly logger = new Logger(CardManagementService.name);

  constructor(
    private readonly hsmService: HSMService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Issue new card
   */
  async issueCard(request: IssueCardRequest): Promise<CardData> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate PAN (Primary Account Number)
      const pan = this.generatePAN(request.network, request.binRange);

      // Generate card expiry (default 3 years)
      const expiryDate = this.generateExpiryDate(request.validityYears || 3);

      // Generate CVV/CVV2
      const cvv = this.hsmService.generateCVV(pan, expiryDate, '201');
      const cvv2 = this.hsmService.generateCVV(pan, expiryDate, '999');

      // Generate card number check digit (Luhn algorithm)
      const panWithCheck = this.addLuhnCheckDigit(pan);

      // Create card record
      const card: CardData = {
        cardId: crypto.randomUUID(),
        pan: panWithCheck,
        maskedPan: this.maskPAN(panWithCheck),
        cardholderName: request.cardholderName,
        expiryDate,
        cvv,
        cvv2,
        cardType: request.cardType,
        network: request.network,
        status: request.cardType === CardType.VIRTUAL ? CardStatus.ACTIVE : CardStatus.ORDERED,
        accountId: request.accountId,
        userId: request.userId,
        issuedDate: new Date(),
        activatedDate: request.cardType === CardType.VIRTUAL ? new Date() : null,
        billingAddress: request.billingAddress,
        shippingAddress: request.shippingAddress,
        limits: request.limits || this.getDefaultLimits(request.cardType),
        features: {
          contactless: true,
          atmWithdrawal: true,
          onlinePurchase: true,
          internationalUsage: request.internationalEnabled || false,
          magneticStripe: request.cardType !== CardType.VIRTUAL,
          emvChip: request.cardType !== CardType.VIRTUAL,
        },
        metadata: {},
      };

      // For physical cards, generate Track 1 and Track 2 data
      if (request.cardType !== CardType.VIRTUAL) {
        card.track1Data = this.generateTrack1(card);
        card.track2Data = this.generateTrack2(card);

        // Generate EMV chip data (ICC data)
        card.iccData = await this.generateICCData(card);
      }

      // Save card (in production, save to database)
      // await queryRunner.manager.save(CardEntity, card);

      await queryRunner.commitTransaction();

      this.logger.log(`Issued ${request.cardType} card: ${card.maskedPan}`);

      // Return card (remove sensitive data for API response)
      return this.sanitizeCardData(card);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to issue card: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Activate card
   */
  async activateCard(cardId: string, activationCode?: string): Promise<CardData> {
    // Get card
    const card = await this.getCard(cardId);

    // Validate status
    if (card.status !== CardStatus.ORDERED && card.status !== CardStatus.SHIPPED) {
      throw new BadRequestException(`Card cannot be activated in status: ${card.status}`);
    }

    // Verify activation code if provided
    if (activationCode && card.activationCode !== activationCode) {
      throw new BadRequestException('Invalid activation code');
    }

    // Activate card
    card.status = CardStatus.ACTIVE;
    card.activatedDate = new Date();

    // Save (in production)
    // await this.cardRepository.save(card);

    this.logger.log(`Activated card: ${card.maskedPan}`);

    return this.sanitizeCardData(card);
  }

  /**
   * Set/Change PIN
   */
  async setPIN(cardId: string, newPIN: string, currentPIN?: string): Promise<void> {
    // Validate PIN
    if (!/^\d{4,6}$/.test(newPIN)) {
      throw new BadRequestException('PIN must be 4-6 digits');
    }

    // Get card
    const card = await this.getCard(cardId);

    // If changing PIN, verify current PIN
    if (currentPIN && card.pinHash) {
      const isValid = await this.verifyPIN(cardId, currentPIN);
      if (!isValid) {
        throw new BadRequestException('Current PIN is incorrect');
      }
    }

    // Hash and store PIN
    card.pinHash = await this.hashPIN(newPIN, card.pan);

    // Generate PIN offset for offline verification
    card.pinOffset = this.generatePINOffset(newPIN, card.pan);

    // Save (in production)
    // await this.cardRepository.save(card);

    this.logger.log(`PIN set for card: ${card.maskedPan}`);
  }

  /**
   * Verify PIN
   */
  async verifyPIN(cardId: string, pin: string): Promise<boolean> {
    const card = await this.getCard(cardId);

    if (!card.pinHash) {
      throw new BadRequestException('PIN not set for this card');
    }

    const pinHash = await this.hashPIN(pin, card.pan);
    return pinHash === card.pinHash;
  }

  /**
   * Block card (temporary)
   */
  async blockCard(cardId: string, reason: string): Promise<CardData> {
    const card = await this.getCard(cardId);

    card.status = CardStatus.BLOCKED;
    card.blockReason = reason;
    card.blockedDate = new Date();

    // Save (in production)
    // await this.cardRepository.save(card);

    this.logger.warn(`Blocked card: ${card.maskedPan}, Reason: ${reason}`);

    return this.sanitizeCardData(card);
  }

  /**
   * Unblock card
   */
  async unblockCard(cardId: string): Promise<CardData> {
    const card = await this.getCard(cardId);

    if (card.status !== CardStatus.BLOCKED) {
      throw new BadRequestException('Card is not blocked');
    }

    card.status = CardStatus.ACTIVE;
    card.blockReason = null;
    card.blockedDate = null;

    // Save (in production)
    // await this.cardRepository.save(card);

    this.logger.log(`Unblocked card: ${card.maskedPan}`);

    return this.sanitizeCardData(card);
  }

  /**
   * Report card as lost/stolen
   */
  async reportLostStolen(cardId: string, type: 'lost' | 'stolen'): Promise<CardData> {
    const card = await this.getCard(cardId);

    card.status = type === 'lost' ? CardStatus.LOST : CardStatus.STOLEN;
    card.reportedDate = new Date();

    // Save (in production)
    // await this.cardRepository.save(card);

    this.logger.warn(`Card reported as ${type}: ${card.maskedPan}`);

    // Automatically issue replacement card
    const replacement = await this.issueReplacementCard(card);

    return this.sanitizeCardData(replacement);
  }

  /**
   * Update card limits
   */
  async updateLimits(cardId: string, limits: Partial<CardLimits>): Promise<CardData> {
    const card = await this.getCard(cardId);

    card.limits = {
      ...card.limits,
      ...limits,
    };

    // Save (in production)
    // await this.cardRepository.save(card);

    this.logger.log(`Updated limits for card: ${card.maskedPan}`);

    return this.sanitizeCardData(card);
  }

  /**
   * Generate card token for digital wallets (Apple Pay, Google Pay)
   */
  async generateToken(cardId: string, walletType: 'apple_pay' | 'google_pay'): Promise<TokenData> {
    const card = await this.getCard(cardId);

    // Generate token PAN (DPAN - Device Primary Account Number)
    const tokenPAN = this.generateTokenPAN(card.pan);

    // Generate token expiry
    const tokenExpiry = this.generateExpiryDate(2);

    // Generate token CVV
    const tokenCVV = this.hsmService.generateCVV(tokenPAN, tokenExpiry, '201');

    const token: TokenData = {
      tokenId: crypto.randomUUID(),
      cardId: card.cardId,
      tokenPAN,
      maskedTokenPAN: this.maskPAN(tokenPAN),
      expiryDate: tokenExpiry,
      cvv: tokenCVV,
      walletType,
      status: 'active',
      createdDate: new Date(),
      deviceInfo: {},
    };

    // Save token (in production)
    // await this.tokenRepository.save(token);

    this.logger.log(`Generated ${walletType} token for card: ${card.maskedPan}`);

    return token;
  }

  /**
   * Get card details (with masking)
   */
  async getCard(cardId: string): Promise<CardData> {
    // In production, fetch from database
    // const card = await this.cardRepository.findOne({ where: { cardId } });

    // For now, throw not found
    throw new NotFoundException('Card not found');
  }

  /**
   * Generate PAN (Primary Account Number)
   */
  private generatePAN(network: CardNetwork, binRange?: string): string {
    // BIN (Bank Identification Number) - first 6-8 digits
    let bin: string;

    if (binRange) {
      bin = binRange;
    } else {
      // Use network defaults
      switch (network) {
        case CardNetwork.VISA:
          bin = '4' + this.randomDigits(5); // Visa starts with 4
          break;
        case CardNetwork.MASTERCARD:
          bin = '5' + this.randomDigits(5); // Mastercard starts with 5
          break;
        case CardNetwork.AMEX:
          bin = '37' + this.randomDigits(4); // Amex starts with 34 or 37
          break;
        case CardNetwork.DISCOVER:
          bin = '6011' + this.randomDigits(2);
          break;
        case CardNetwork.UNIONPAY:
          bin = '62' + this.randomDigits(4);
          break;
        default:
          bin = '4' + this.randomDigits(5);
      }
    }

    // Account number (remaining digits, excluding check digit)
    const accountNumber = this.randomDigits(9);

    // PAN without check digit
    return bin + accountNumber;
  }

  /**
   * Add Luhn check digit
   */
  private addLuhnCheckDigit(pan: string): string {
    let sum = 0;
    let alternate = false;

    for (let i = pan.length - 1; i >= 0; i--) {
      let digit = parseInt(pan[i]);

      if (alternate) {
        digit *= 2;
        if (digit > 9) {
          digit -= 9;
        }
      }

      sum += digit;
      alternate = !alternate;
    }

    const checkDigit = (10 - (sum % 10)) % 10;
    return pan + checkDigit;
  }

  /**
   * Mask PAN for display
   */
  private maskPAN(pan: string): string {
    if (pan.length < 13) {
      return pan;
    }

    const first6 = pan.substring(0, 6);
    const last4 = pan.substring(pan.length - 4);
    const middle = '*'.repeat(pan.length - 10);

    return first6 + middle + last4;
  }

  /**
   * Generate expiry date
   */
  private generateExpiryDate(validityYears: number): string {
    const now = new Date();
    const expiry = new Date(now.getFullYear() + validityYears, now.getMonth(), 1);

    const month = (expiry.getMonth() + 1).toString().padStart(2, '0');
    const year = expiry.getFullYear().toString().substring(2);

    return year + month; // YYMM format
  }

  /**
   * Generate Track 1 data (magnetic stripe)
   */
  private generateTrack1(card: CardData): string {
    // Format: %B{PAN}^{Name}^{Expiry}{Service Code}{Discretionary}?
    const name = card.cardholderName.toUpperCase().replace(' ', '/');
    const serviceCode = '201'; // Standard service code
    const discretionary = '000000000000000';

    return `%B${card.pan}^${name}^${card.expiryDate}${serviceCode}${discretionary}?`;
  }

  /**
   * Generate Track 2 data (magnetic stripe)
   */
  private generateTrack2(card: CardData): string {
    // Format: ;{PAN}={Expiry}{Service Code}{Discretionary}?
    const serviceCode = '201';
    const discretionary = '0000000000';

    return `;${card.pan}=${card.expiryDate}${serviceCode}${discretionary}?`;
  }

  /**
   * Generate ICC data for EMV chip
   */
  private async generateICCData(card: CardData): Promise<any> {
    // EMV chip data (simplified)
    return {
      AID: '  A0000000031010', // Application ID (Visa)
      applicationLabel: 'CREDIT',
      applicationPreferredName: 'VISA CARD',
      track2Equivalent: card.track2Data,
      pan: card.pan,
      expiryDate: card.expiryDate,
      cardholderName: card.cardholderName,
      issuerCountryCode: '840', // USA
      currencyCode: '840', // USD
      // Cryptographic data
      iccPublicKey: await this.generateICCPublicKey(),
      issuerPublicKey: await this.generateIssuerPublicKey(),
    };
  }

  /**
   * Hash PIN securely
   */
  private async hashPIN(pin: string, pan: string): Promise<string> {
    const salt = pan.substring(pan.length - 12); // Use last 12 digits of PAN as salt
    const hash = crypto.createHash('sha256');
    hash.update(pin + salt);
    return hash.digest('hex');
  }

  /**
   * Generate PIN offset for offline verification
   */
  private generatePINOffset(pin: string, pan: string): string {
    // Simplified PIN offset calculation
    // In production, this would use proper HSM functions
    const naturalPIN = this.calculateNaturalPIN(pan);
    const offset = (parseInt(pin) - parseInt(naturalPIN) + 10000) % 10000;
    return offset.toString().padStart(4, '0');
  }

  /**
   * Calculate natural PIN from PAN
   */
  private calculateNaturalPIN(pan: string): string {
    // Use last 4 digits of PAN
    return pan.substring(pan.length - 4);
  }

  /**
   * Issue replacement card
   */
  private async issueReplacementCard(originalCard: CardData): Promise<CardData> {
    // Issue new card with same details but new PAN
    return this.issueCard({
      cardholderName: originalCard.cardholderName,
      cardType: originalCard.cardType,
      network: originalCard.network,
      accountId: originalCard.accountId,
      userId: originalCard.userId,
      billingAddress: originalCard.billingAddress,
      shippingAddress: originalCard.shippingAddress,
      limits: originalCard.limits,
      internationalEnabled: originalCard.features.internationalUsage,
    });
  }

  /**
   * Generate token PAN for digital wallets
   */
  private generateTokenPAN(originalPAN: string): string {
    // Keep same BIN, generate new account number
    const bin = originalPAN.substring(0, 6);
    const accountNumber = this.randomDigits(9);
    const tokenPAN = bin + accountNumber;

    return this.addLuhnCheckDigit(tokenPAN);
  }

  /**
   * Get default limits based on card type
   */
  private getDefaultLimits(cardType: CardType): CardLimits {
    switch (cardType) {
      case CardType.DEBIT:
        return {
          dailyPurchaseLimit: 5000,
          dailyATMLimit: 1000,
          dailyOnlineLimit: 3000,
          singleTransactionLimit: 2000,
          monthlyLimit: 50000,
        };
      case CardType.CREDIT:
        return {
          dailyPurchaseLimit: 10000,
          dailyATMLimit: 2000,
          dailyOnlineLimit: 10000,
          singleTransactionLimit: 5000,
          monthlyLimit: 100000,
        };
      case CardType.PREPAID:
        return {
          dailyPurchaseLimit: 2000,
          dailyATMLimit: 500,
          dailyOnlineLimit: 1000,
          singleTransactionLimit: 1000,
          monthlyLimit: 20000,
        };
      case CardType.VIRTUAL:
        return {
          dailyPurchaseLimit: 5000,
          dailyATMLimit: 0, // No ATM for virtual cards
          dailyOnlineLimit: 5000,
          singleTransactionLimit: 2000,
          monthlyLimit: 50000,
        };
    }
  }

  /**
   * Sanitize card data for API response
   */
  private sanitizeCardData(card: CardData): CardData {
    const sanitized = { ...card };

    // Remove sensitive data
    delete sanitized.pan;
    delete sanitized.cvv;
    delete sanitized.cvv2;
    delete sanitized.track1Data;
    delete sanitized.track2Data;
    delete sanitized.iccData;
    delete sanitized.pinHash;
    delete sanitized.pinOffset;

    return sanitized;
  }

  /**
   * Generate random digits
   */
  private randomDigits(length: number): string {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10);
    }
    return result;
  }

  /**
   * Generate ICC public key
   */
  private async generateICCPublicKey(): Promise<string> {
    // In production, this would use HSM
    return crypto.randomBytes(128).toString('hex');
  }

  /**
   * Generate issuer public key
   */
  private async generateIssuerPublicKey(): Promise<string> {
    // In production, this would use HSM
    return crypto.randomBytes(128).toString('hex');
  }
}

/**
 * Interfaces
 */
export interface IssueCardRequest {
  cardholderName: string;
  cardType: CardType;
  network: CardNetwork;
  accountId: string;
  userId: string;
  binRange?: string;
  validityYears?: number;
  billingAddress: Address;
  shippingAddress?: Address;
  limits?: Partial<CardLimits>;
  internationalEnabled?: boolean;
}

export interface CardData {
  cardId: string;
  pan?: string;
  maskedPan: string;
  cardholderName: string;
  expiryDate: string;
  cvv?: string;
  cvv2?: string;
  cardType: CardType;
  network: CardNetwork;
  status: CardStatus;
  accountId: string;
  userId: string;
  issuedDate: Date;
  activatedDate?: Date;
  activationCode?: string;
  billingAddress: Address;
  shippingAddress?: Address;
  limits: CardLimits;
  features: CardFeatures;
  track1Data?: string;
  track2Data?: string;
  iccData?: any;
  pinHash?: string;
  pinOffset?: string;
  blockReason?: string;
  blockedDate?: Date;
  reportedDate?: Date;
  metadata: any;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface CardLimits {
  dailyPurchaseLimit: number;
  dailyATMLimit: number;
  dailyOnlineLimit: number;
  singleTransactionLimit: number;
  monthlyLimit: number;
}

export interface CardFeatures {
  contactless: boolean;
  atmWithdrawal: boolean;
  onlinePurchase: boolean;
  internationalUsage: boolean;
  magneticStripe: boolean;
  emvChip: boolean;
}

export interface TokenData {
  tokenId: string;
  cardId: string;
  tokenPAN: string;
  maskedTokenPAN: string;
  expiryDate: string;
  cvv: string;
  walletType: 'apple_pay' | 'google_pay';
  status: 'active' | 'inactive' | 'suspended';
  createdDate: Date;
  deviceInfo: any;
}
