import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { FraudCheckEntity } from './entities/fraud-check.entity';
import { UserEntity } from '../users/entities/user.entity';
import { PaymentEntity } from '../payments/entities/payment.entity';
import Decimal from 'decimal.js';

export interface FraudCheckResult {
  riskScore: number; // 0-100
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  checks: {
    velocityCheck: boolean;
    amountCheck: boolean;
    geoCheck: boolean;
    deviceCheck: boolean;
    behaviorCheck: boolean;
  };
  shouldBlock: boolean;
  reasons: string[];
}

@Injectable()
export class FraudService {
  private readonly logger = new Logger(FraudService.name);

  constructor(
    @InjectRepository(FraudCheckEntity)
    private readonly fraudCheckRepository: Repository<FraudCheckEntity>,
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
    metadata?: {
      ipAddress?: string;
      deviceId?: string;
      location?: { lat: number; lon: number };
      merchantCategory?: string;
    },
  ): Promise<FraudCheckResult> {
    this.logger.log(`Running fraud check for user ${userId}, amount ${amount} ${currency}`);

    const checks = {
      velocityCheck: await this.checkVelocity(userId, transactionType),
      amountCheck: await this.checkAmount(userId, amount, currency),
      geoCheck: await this.checkGeolocation(userId, metadata?.location),
      deviceCheck: await this.checkDevice(userId, metadata?.deviceId),
      behaviorCheck: await this.checkBehavior(userId, amount, transactionType),
    };

    const riskScore = this.calculateRiskScore(checks, amount);
    const riskLevel = this.determineRiskLevel(riskScore);
    const shouldBlock = riskScore >= 80; // Block if score >= 80
    const reasons = this.generateReasons(checks, riskScore);

    // Save fraud check result
    const fraudCheck = this.fraudCheckRepository.create({
      userId,
      transactionType,
      amount,
      currency,
      riskScore,
      riskLevel,
      shouldBlock,
      metadata: {
        checks,
        reasons,
        ipAddress: metadata?.ipAddress,
        deviceId: metadata?.deviceId,
        location: metadata?.location,
      },
    });

    await this.fraudCheckRepository.save(fraudCheck);

    return {
      riskScore,
      riskLevel,
      checks,
      shouldBlock,
      reasons,
    };
  }

  private async checkVelocity(userId: string, transactionType: string): Promise<boolean> {
    // Check transaction velocity (number of transactions in last hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentTransactions = await this.paymentRepository.count({
      where: {
        userId,
        transactionType,
        createdAt: { $gte: oneHourAgo } as any,
      },
    });

    // Flag if more than 10 transactions in last hour
    return recentTransactions <= 10;
  }

  private async checkAmount(
    userId: string,
    amount: string,
    currency: string,
  ): Promise<boolean> {
    // Check if amount is significantly higher than user's typical transaction
    const last30Days = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const recentTransactions = await this.paymentRepository.find({
      where: {
        userId,
        currency,
        createdAt: { $gte: last30Days } as any,
      },
      select: ['amount'],
    });

    if (recentTransactions.length === 0) {
      // New user - be cautious with large amounts
      return new Decimal(amount).lessThanOrEqualTo(1000);
    }

    // Calculate average transaction amount
    const totalAmount = recentTransactions.reduce(
      (sum, tx) => sum.plus(tx.amount),
      new Decimal(0),
    );
    const avgAmount = totalAmount.dividedBy(recentTransactions.length);

    // Flag if amount is more than 3x average
    const threshold = avgAmount.times(3);
    return new Decimal(amount).lessThanOrEqualTo(threshold);
  }

  private async checkGeolocation(
    userId: string,
    location?: { lat: number; lon: number },
  ): Promise<boolean> {
    if (!location) {
      return true; // No location data, can't check
    }

    // Check if location is drastically different from recent transactions
    // In production, this would use a geolocation service to check:
    // 1. If user suddenly appears in a different country
    // 2. If travel time is impossible (e.g., NYC to Tokyo in 2 hours)

    // For now, simple check
    const recentFraudChecks = await this.fraudCheckRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' as any },
      take: 5,
    });

    if (recentFraudChecks.length === 0) {
      return true;
    }

    // Check if location changed drastically
    const lastLocation = recentFraudChecks[0].metadata?.location;
    if (!lastLocation) {
      return true;
    }

    const distance = this.calculateDistance(
      location.lat,
      location.lon,
      lastLocation.lat,
      lastLocation.lon,
    );

    // Flag if more than 500km from last transaction in less than 1 hour
    const timeDiff = Date.now() - recentFraudChecks[0].createdAt.getTime();
    const oneHour = 60 * 60 * 1000;

    return !(distance > 500 && timeDiff < oneHour);
  }

  private async checkDevice(userId: string, deviceId?: string): Promise<boolean> {
    if (!deviceId) {
      return true; // No device data
    }

    // Check if device is recognized
    const recentFraudChecks = await this.fraudCheckRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' as any },
      take: 20,
    });

    const knownDevices = recentFraudChecks
      .map((check) => check.metadata?.deviceId)
      .filter(Boolean);

    return knownDevices.includes(deviceId);
  }

  private async checkBehavior(
    userId: string,
    amount: string,
    transactionType: string,
  ): Promise<boolean> {
    // Check if transaction pattern matches user's typical behavior
    const user = await this.userRepository.findOne({ where: { userId } });

    if (!user) {
      return false;
    }

    // Check account age
    const accountAge = Date.now() - user.createdAt.getTime();
    const oneDayMs = 24 * 60 * 60 * 1000;

    // New accounts (< 24 hours) with large transactions are risky
    if (accountAge < oneDayMs && new Decimal(amount).greaterThan(500)) {
      return false;
    }

    // Check if user's KYC is verified
    if (!user.kycVerified && new Decimal(amount).greaterThan(1000)) {
      return false;
    }

    return true;
  }

  private calculateRiskScore(
    checks: {
      velocityCheck: boolean;
      amountCheck: boolean;
      geoCheck: boolean;
      deviceCheck: boolean;
      behaviorCheck: boolean;
    },
    amount: string,
  ): number {
    let score = 0;

    // Each failed check adds to risk score
    if (!checks.velocityCheck) score += 25;
    if (!checks.amountCheck) score += 20;
    if (!checks.geoCheck) score += 20;
    if (!checks.deviceCheck) score += 15;
    if (!checks.behaviorCheck) score += 20;

    // Higher amounts increase risk slightly
    const amountDecimal = new Decimal(amount);
    if (amountDecimal.greaterThan(10000)) {
      score += 10;
    } else if (amountDecimal.greaterThan(5000)) {
      score += 5;
    }

    return Math.min(score, 100);
  }

  private determineRiskLevel(riskScore: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (riskScore >= 80) return 'CRITICAL';
    if (riskScore >= 60) return 'HIGH';
    if (riskScore >= 40) return 'MEDIUM';
    return 'LOW';
  }

  private generateReasons(
    checks: {
      velocityCheck: boolean;
      amountCheck: boolean;
      geoCheck: boolean;
      deviceCheck: boolean;
      behaviorCheck: boolean;
    },
    riskScore: number,
  ): string[] {
    const reasons: string[] = [];

    if (!checks.velocityCheck) {
      reasons.push('Unusual transaction velocity detected');
    }
    if (!checks.amountCheck) {
      reasons.push('Transaction amount significantly higher than typical');
    }
    if (!checks.geoCheck) {
      reasons.push('Suspicious geolocation change detected');
    }
    if (!checks.deviceCheck) {
      reasons.push('Unrecognized device');
    }
    if (!checks.behaviorCheck) {
      reasons.push('Unusual transaction behavior');
    }

    if (reasons.length === 0 && riskScore > 0) {
      reasons.push('Overall risk assessment elevated');
    }

    return reasons;
  }

  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    // Haversine formula to calculate distance between two coordinates
    const R = 6371; // Earth's radius in km
    const dLat = this.degreesToRadians(lat2 - lat1);
    const dLon = this.degreesToRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.degreesToRadians(lat1)) *
        Math.cos(this.degreesToRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  private degreesToRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  async getFraudHistory(userId: string, limit: number = 50) {
    return this.fraudCheckRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' as any },
      take: limit,
    });
  }

  async getFlaggedTransactions(limit: number = 100) {
    return this.fraudCheckRepository.find({
      where: { shouldBlock: true },
      order: { createdAt: 'DESC' as any },
      take: limit,
    });
  }
}
