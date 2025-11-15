import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AMLCheckEntity } from './entities/aml-check.entity';
import { UserEntity } from '../users/entities/user.entity';
import { PaymentEntity } from '../payments/entities/payment.entity';
import Decimal from 'decimal.js';

export interface AMLCheckResult {
  passed: boolean;
  flags: string[];
  sanctionsMatch: boolean;
  pepMatch: boolean; // Politically Exposed Person
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH';
  requiresReview: boolean;
}

@Injectable()
export class AMLService {
  private readonly logger = new Logger(AMLService.name);

  // Mock sanctions lists - in production, integrate with OFAC, EU, UN lists
  private readonly sanctionedCountries = [
    'KP', // North Korea
    'IR', // Iran
    'SY', // Syria
    'CU', // Cuba
  ];

  private readonly highRiskCountries = [
    'AF', // Afghanistan
    'MM', // Myanmar
    'YE', // Yemen
  ];

  constructor(
    @InjectRepository(AMLCheckEntity)
    private readonly amlCheckRepository: Repository<AMLCheckEntity>,
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    @InjectRepository(PaymentEntity)
    private readonly paymentRepository: Repository<PaymentEntity>,
  ) {}

  async checkTransaction(
    userId: string,
    amount: string,
    currency: string,
    transactionType: string,
    counterpartyId?: string,
  ): Promise<AMLCheckResult> {
    this.logger.log(`Running AML check for user ${userId}, amount ${amount} ${currency}`);

    const flags: string[] = [];
    let sanctionsMatch = false;
    let pepMatch = false;
    let requiresReview = false;

    // 1. Check if user is on sanctions list
    const user = await this.userRepository.findOne({ where: { userId } });
    if (!user) {
      flags.push('User not found');
      return {
        passed: false,
        flags,
        sanctionsMatch: false,
        pepMatch: false,
        riskRating: 'HIGH',
        requiresReview: true,
      };
    }

    // Check sanctions
    sanctionsMatch = await this.checkSanctionsList(user);
    if (sanctionsMatch) {
      flags.push('User matches sanctions list');
    }

    // Check PEP status
    pepMatch = await this.checkPEPStatus(user);
    if (pepMatch) {
      flags.push('User is a Politically Exposed Person');
      requiresReview = true;
    }

    // 2. Check transaction amount thresholds
    const amountDecimal = new Decimal(amount);

    // Report transactions >= $10,000 USD equivalent
    if (amountDecimal.greaterThanOrEqualTo(10000) && currency === 'USD') {
      flags.push('Large transaction (>= $10,000) requires CTR filing');
      requiresReview = true;
    }

    // 3. Check for structuring (multiple transactions just below reporting threshold)
    const structuringDetected = await this.checkStructuring(userId, amount, currency);
    if (structuringDetected) {
      flags.push('Potential structuring detected');
      requiresReview = true;
    }

    // 4. Check cumulative daily transaction volume
    const dailyVolume = await this.getDailyVolume(userId, currency);
    if (dailyVolume.plus(amountDecimal).greaterThan(50000)) {
      flags.push('High daily transaction volume');
      requiresReview = true;
    }

    // 5. Check country risk
    const countryRisk = this.checkCountryRisk(user.country);
    if (countryRisk === 'HIGH') {
      flags.push('Transaction involves high-risk jurisdiction');
      requiresReview = true;
    }
    if (countryRisk === 'SANCTIONED') {
      flags.push('Transaction involves sanctioned jurisdiction');
      sanctionsMatch = true;
    }

    // 6. Check counterparty if provided
    if (counterpartyId) {
      const counterpartyCheck = await this.checkCounterparty(counterpartyId);
      if (counterpartyCheck.sanctioned) {
        flags.push('Counterparty matches sanctions list');
        sanctionsMatch = true;
      }
      if (counterpartyCheck.highRisk) {
        flags.push('Counterparty is high-risk');
        requiresReview = true;
      }
    }

    // 7. Check for unusual patterns
    const unusualPattern = await this.checkUnusualPatterns(userId, transactionType);
    if (unusualPattern) {
      flags.push('Unusual transaction pattern detected');
      requiresReview = true;
    }

    // Determine risk rating
    const riskRating = this.determineRiskRating(flags, sanctionsMatch, pepMatch);

    // Determine if transaction passed
    const passed = !sanctionsMatch && riskRating !== 'HIGH';

    // Save AML check
    const amlCheck = this.amlCheckRepository.create({
      userId,
      transactionType,
      amount,
      currency,
      passed,
      flags: flags.length > 0 ? flags : null,
      sanctionsMatch,
      pepMatch,
      riskRating,
      requiresReview,
      counterpartyId,
    });

    await this.amlCheckRepository.save(amlCheck);

    return {
      passed,
      flags,
      sanctionsMatch,
      pepMatch,
      riskRating,
      requiresReview,
    };
  }

  private async checkSanctionsList(user: UserEntity): Promise<boolean> {
    // In production, check against:
    // - OFAC SDN (Specially Designated Nationals)
    // - EU Consolidated List
    // - UN Sanctions List
    // - HMT Sanctions List

    // Simple mock check based on name and country
    if (this.sanctionedCountries.includes(user.country)) {
      return true;
    }

    // In production, use fuzzy matching against sanctions databases
    return false;
  }

  private async checkPEPStatus(user: UserEntity): Promise<boolean> {
    // In production, check against PEP databases like:
    // - World-Check
    // - Dow Jones Risk & Compliance
    // - LexisNexis

    // Mock check - in reality, this would be set during KYC
    return user.metadata?.isPEP === true;
  }

  private async checkStructuring(
    userId: string,
    amount: string,
    currency: string,
  ): Promise<boolean> {
    // Check for multiple transactions just below $10,000 threshold
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

    const recentTransactions = await this.paymentRepository.find({
      where: {
        userId,
        currency,
        createdAt: { $gte: oneDayAgo } as any,
      },
    });

    // Look for pattern of transactions between $9,000 - $9,999
    const suspiciousTransactions = recentTransactions.filter((tx) => {
      const amt = new Decimal(tx.amount);
      return amt.greaterThanOrEqualTo(9000) && amt.lessThan(10000);
    });

    return suspiciousTransactions.length >= 3;
  }

  private async getDailyVolume(userId: string, currency: string): Promise<Decimal> {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const transactions = await this.paymentRepository.find({
      where: {
        userId,
        currency,
        createdAt: { $gte: todayStart } as any,
      },
    });

    return transactions.reduce((sum, tx) => sum.plus(tx.amount), new Decimal(0));
  }

  private checkCountryRisk(countryCode: string): 'LOW' | 'MEDIUM' | 'HIGH' | 'SANCTIONED' {
    if (this.sanctionedCountries.includes(countryCode)) {
      return 'SANCTIONED';
    }
    if (this.highRiskCountries.includes(countryCode)) {
      return 'HIGH';
    }
    return 'LOW';
  }

  private async checkCounterparty(
    counterpartyId: string,
  ): Promise<{ sanctioned: boolean; highRisk: boolean }> {
    const counterparty = await this.userRepository.findOne({
      where: { userId: counterpartyId },
    });

    if (!counterparty) {
      return { sanctioned: false, highRisk: true };
    }

    const sanctioned = await this.checkSanctionsList(counterparty);
    const countryRisk = this.checkCountryRisk(counterparty.country);
    const highRisk =
      countryRisk === 'HIGH' || countryRisk === 'SANCTIONED' || counterparty.metadata?.isPEP;

    return { sanctioned, highRisk };
  }

  private async checkUnusualPatterns(userId: string, transactionType: string): Promise<boolean> {
    // Check for sudden changes in transaction patterns
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const recentTransactions = await this.paymentRepository.find({
      where: {
        userId,
        createdAt: { $gte: last30Days } as any,
      },
    });

    // Check for dormant account suddenly active
    if (recentTransactions.length === 0) {
      const user = await this.userRepository.findOne({ where: { userId } });
      const accountAge = Date.now() - user.createdAt.getTime();
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

      // Account older than 30 days but no recent transactions
      if (accountAge > thirtyDaysMs) {
        return true;
      }
    }

    return false;
  }

  private determineRiskRating(
    flags: string[],
    sanctionsMatch: boolean,
    pepMatch: boolean,
  ): 'LOW' | 'MEDIUM' | 'HIGH' {
    if (sanctionsMatch) {
      return 'HIGH';
    }

    if (pepMatch || flags.length >= 3) {
      return 'HIGH';
    }

    if (flags.length >= 1) {
      return 'MEDIUM';
    }

    return 'LOW';
  }

  async getAMLHistory(userId: string, limit: number = 50) {
    return this.amlCheckRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' as any },
      take: limit,
    });
  }

  async getTransactionsRequiringReview(limit: number = 100) {
    return this.amlCheckRepository.find({
      where: { requiresReview: true },
      order: { createdAt: 'DESC' as any },
      take: limit,
    });
  }

  async getSanctionsMatches(limit: number = 100) {
    return this.amlCheckRepository.find({
      where: { sanctionsMatch: true },
      order: { createdAt: 'DESC' as any },
      take: limit,
    });
  }
}
