import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { PaymentGatewayEntity } from './entities/payment-gateway.entity';
import { PaymentTransactionEntity } from './entities/payment-transaction.entity';
import { WalletsService } from '../wallets/wallets.service';
import { SplitPaymentsService } from '../split-payments/split-payments.service';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import * as crypto from 'crypto';
import Decimal from 'decimal.js';

export interface InitiatePaymentDto {
  userId?: string;
  merchantId?: string;
  amount: string;
  currency: string;
  paymentMethod?: string;
  description?: string;
  customer?: {
    email: string;
    name?: string;
    phone?: string;
  };
  callbackUrl?: string;
  redirectUrl?: string;
  splitConfigurationId?: string;
  metadata?: Record<string, any>;
}

export interface VerifyPaymentDto {
  reference: string;
  provider: string;
}

@Injectable()
export class PaymentGatewaysService {
  private readonly logger = new Logger(PaymentGatewaysService.name);

  // Provider configurations with failover support
  private readonly providerConfigs = {
    paystack: {
      name: 'Paystack',
      apiUrl: 'https://api.paystack.co',
      apiKey: process.env.PAYSTACK_SECRET_KEY,
      publicKey: process.env.PAYSTACK_PUBLIC_KEY,
      supportedCurrencies: ['NGN', 'GHS', 'ZAR', 'USD'],
      supportedCountries: ['NG', 'GH', 'ZA', 'KE'],
      paymentMethods: ['card', 'bank', 'bank_transfer', 'ussd', 'qr', 'mobile_money'],
      feePercentage: 1.5,
      feeCap: 2000, // NGN
    },
    flutterwave: {
      name: 'Flutterwave',
      apiUrl: 'https://api.flutterwave.com/v3',
      apiKey: process.env.FLUTTERWAVE_SECRET_KEY,
      publicKey: process.env.FLUTTERWAVE_PUBLIC_KEY,
      supportedCurrencies: ['NGN', 'USD', 'GBP', 'EUR', 'GHS', 'KES', 'UGX', 'TZS', 'ZAR', 'RWF'],
      supportedCountries: ['NG', 'GH', 'KE', 'UG', 'TZ', 'ZA', 'RW'],
      paymentMethods: ['card', 'account', 'ussd', 'mpesa', 'ghana_mobile_money', 'uganda_mobile_money', 'bank_transfer'],
      feePercentage: 1.4,
    },
    stripe: {
      name: 'Stripe',
      apiUrl: 'https://api.stripe.com/v1',
      apiKey: process.env.STRIPE_SECRET_KEY,
      publicKey: process.env.STRIPE_PUBLIC_KEY,
      supportedCurrencies: ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'],
      supportedCountries: ['US', 'GB', 'CA', 'AU', 'DE', 'FR', 'IT', 'ES'],
      paymentMethods: ['card', 'apple_pay', 'google_pay', 'bank_transfer', 'sepa_debit'],
      feePercentage: 2.9,
      feeFixed: 0.30,
    },
    razorpay: {
      name: 'Razorpay',
      apiUrl: 'https://api.razorpay.com/v1',
      apiKey: process.env.RAZORPAY_KEY_ID,
      secretKey: process.env.RAZORPAY_KEY_SECRET,
      supportedCurrencies: ['INR'],
      supportedCountries: ['IN'],
      paymentMethods: ['card', 'netbanking', 'wallet', 'upi', 'emi'],
      feePercentage: 2.0,
    },
    payu: {
      name: 'PayU',
      apiUrl: 'https://secure.payu.com/api/v2_1',
      apiKey: process.env.PAYU_API_KEY,
      supportedCurrencies: ['PLN', 'CZK', 'RON', 'HUF', 'UAH'],
      supportedCountries: ['PL', 'CZ', 'RO', 'HU', 'UA'],
      paymentMethods: ['card', 'bank_transfer', 'cash', 'installments'],
      feePercentage: 1.9,
    },
    mercadopago: {
      name: 'Mercado Pago',
      apiUrl: 'https://api.mercadopago.com/v1',
      apiKey: process.env.MERCADOPAGO_ACCESS_TOKEN,
      supportedCurrencies: ['BRL', 'ARS', 'MXN', 'CLP', 'COP', 'PEN', 'UYU'],
      supportedCountries: ['BR', 'AR', 'MX', 'CL', 'CO', 'PE', 'UY'],
      paymentMethods: ['credit_card', 'debit_card', 'ticket', 'bank_transfer', 'pix'],
      feePercentage: 3.99,
    },
    khalti: {
      name: 'Khalti',
      apiUrl: 'https://khalti.com/api/v2',
      apiKey: process.env.KHALTI_SECRET_KEY,
      supportedCurrencies: ['NPR'],
      supportedCountries: ['NP'],
      paymentMethods: ['khalti', 'ebanking', 'mobile_banking', 'connect_ips', 'sct'],
      feePercentage: 2.5,
    },
    paymongo: {
      name: 'PayMongo',
      apiUrl: 'https://api.paymongo.com/v1',
      apiKey: process.env.PAYMONGO_SECRET_KEY,
      supportedCurrencies: ['PHP'],
      supportedCountries: ['PH'],
      paymentMethods: ['card', 'gcash', 'grab_pay', 'paymaya'],
      feePercentage: 2.9,
      feeFixed: 15,
    },
  };

  constructor(
    @InjectRepository(PaymentGatewayEntity)
    private readonly gatewayRepository: Repository<PaymentGatewayEntity>,
    @InjectRepository(PaymentTransactionEntity)
    private readonly transactionRepository: Repository<PaymentTransactionEntity>,
    private readonly walletsService: WalletsService,
    private readonly splitPaymentsService: SplitPaymentsService,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Initiate a payment
   */
  async initiatePayment(dto: InitiatePaymentDto, provider: string): Promise<PaymentTransactionEntity> {
    this.logger.log(`Initiating payment via ${provider}: ${dto.amount} ${dto.currency}`);

    // Select appropriate gateway
    const gateway = await this.selectGateway(provider, dto.currency);

    const reference = this.generateReference();
    const amount = new Decimal(dto.amount);

    // Calculate fee
    const fee = this.calculateFee(provider, amount, dto.currency);
    const netAmount = amount.minus(fee);

    // Create transaction record
    const transaction = this.transactionRepository.create({
      transactionId: uuidv4(),
      userId: dto.userId,
      merchantId: dto.merchantId,
      gatewayId: gateway.gatewayId,
      provider,
      amount: amount.toString(),
      currency: dto.currency,
      status: 'pending',
      reference,
      paymentMethod: dto.paymentMethod || 'card',
      description: dto.description,
      customer: dto.customer,
      fee: fee.toString(),
      netAmount: netAmount.toString(),
      callbackUrl: dto.callbackUrl,
      redirectUrl: dto.redirectUrl,
      metadata: dto.metadata || {},
    });

    await this.transactionRepository.save(transaction);

    // Initialize payment with provider
    const providerResponse = await this.initializePaymentWithProvider(
      provider,
      transaction,
      dto,
    );

    // Update transaction with provider response
    transaction.providerReference = providerResponse.reference;
    transaction.authorizationUrl = providerResponse.authorizationUrl;
    transaction.accessCode = providerResponse.accessCode;
    transaction.providerResponse = providerResponse.rawResponse;

    await this.transactionRepository.save(transaction);

    this.eventEmitter.emit('payment.initiated', {
      transactionId: transaction.transactionId,
      reference,
      provider,
      amount: dto.amount,
      currency: dto.currency,
    });

    this.logger.log(`Payment initiated: ${transaction.transactionId}`);

    return transaction;
  }

  /**
   * Initialize payment with Paystack
   */
  private async initializePaymentWithPaystack(
    transaction: PaymentTransactionEntity,
    dto: InitiatePaymentDto,
  ): Promise<any> {
    const config = this.providerConfigs.paystack;

    try {
      const response = await axios.post(
        `${config.apiUrl}/transaction/initialize`,
        {
          email: dto.customer?.email || `${dto.userId}@platform.com`,
          amount: Math.round(parseFloat(dto.amount) * 100), // Convert to kobo
          currency: dto.currency,
          reference: transaction.reference,
          callback_url: dto.callbackUrl,
          metadata: {
            ...dto.metadata,
            userId: dto.userId,
            transactionId: transaction.transactionId,
          },
          channels: dto.paymentMethod ? [dto.paymentMethod] : undefined,
        },
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (!response.data.status) {
        throw new BadRequestException(response.data.message);
      }

      return {
        reference: transaction.reference,
        authorizationUrl: response.data.data.authorization_url,
        accessCode: response.data.data.access_code,
        rawResponse: response.data,
      };
    } catch (error) {
      this.logger.error(`Paystack initialization failed: ${error.message}`);
      throw new BadRequestException(error.response?.data?.message || error.message);
    }
  }

  /**
   * Initialize payment with Flutterwave
   */
  private async initializePaymentWithFlutterwave(
    transaction: PaymentTransactionEntity,
    dto: InitiatePaymentDto,
  ): Promise<any> {
    const config = this.providerConfigs.flutterwave;

    try {
      const response = await axios.post(
        `${config.apiUrl}/payments`,
        {
          tx_ref: transaction.reference,
          amount: dto.amount,
          currency: dto.currency,
          redirect_url: dto.callbackUrl || dto.redirectUrl,
          payment_options: dto.paymentMethod || 'card,account,ussd,mpesa',
          customer: {
            email: dto.customer?.email || `${dto.userId}@platform.com`,
            name: dto.customer?.name || 'Customer',
            phonenumber: dto.customer?.phone,
          },
          customizations: {
            title: 'Payment',
            description: dto.description || 'Payment',
          },
          meta: {
            ...dto.metadata,
            userId: dto.userId,
            transactionId: transaction.transactionId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.data.status !== 'success') {
        throw new BadRequestException(response.data.message);
      }

      return {
        reference: transaction.reference,
        authorizationUrl: response.data.data.link,
        accessCode: response.data.data.link,
        rawResponse: response.data,
      };
    } catch (error) {
      this.logger.error(`Flutterwave initialization failed: ${error.message}`);
      throw new BadRequestException(error.response?.data?.message || error.message);
    }
  }

  /**
   * Initialize payment with Stripe
   */
  private async initializePaymentWithStripe(
    transaction: PaymentTransactionEntity,
    dto: InitiatePaymentDto,
  ): Promise<any> {
    const config = this.providerConfigs.stripe;

    try {
      // Create payment intent
      const response = await axios.post(
        `${config.apiUrl}/payment_intents`,
        new URLSearchParams({
          amount: Math.round(parseFloat(dto.amount) * 100).toString(),
          currency: dto.currency.toLowerCase(),
          'metadata[userId]': dto.userId || '',
          'metadata[transactionId]': transaction.transactionId,
          'metadata[reference]': transaction.reference,
        }),
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        },
      );

      return {
        reference: transaction.reference,
        authorizationUrl: `https://checkout.stripe.com/${response.data.client_secret}`,
        accessCode: response.data.client_secret,
        rawResponse: response.data,
      };
    } catch (error) {
      this.logger.error(`Stripe initialization failed: ${error.message}`);
      throw new BadRequestException(error.response?.data?.message || error.message);
    }
  }

  /**
   * Route to appropriate provider
   */
  private async initializePaymentWithProvider(
    provider: string,
    transaction: PaymentTransactionEntity,
    dto: InitiatePaymentDto,
  ): Promise<any> {
    switch (provider) {
      case 'paystack':
        return this.initializePaymentWithPaystack(transaction, dto);
      case 'flutterwave':
        return this.initializePaymentWithFlutterwave(transaction, dto);
      case 'stripe':
        return this.initializePaymentWithStripe(transaction, dto);
      case 'razorpay':
      case 'payu':
      case 'mercadopago':
      case 'khalti':
      case 'paymongo':
        // Implement similar methods for other providers
        throw new BadRequestException(`Provider ${provider} payment initialization not yet implemented`);
      default:
        throw new BadRequestException(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Verify payment
   */
  async verifyPayment(dto: VerifyPaymentDto): Promise<PaymentTransactionEntity> {
    this.logger.log(`Verifying payment: ${dto.reference} via ${dto.provider}`);

    const transaction = await this.transactionRepository.findOne({
      where: { reference: dto.reference },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    if (transaction.status === 'success') {
      return transaction; // Already verified
    }

    // Verify with provider
    const verification = await this.verifyPaymentWithProvider(dto.provider, dto.reference);

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update transaction
      transaction.status = verification.success ? 'success' : 'failed';
      transaction.providerResponse = verification.data;

      if (verification.success) {
        transaction.paidAt = new Date();

        // Credit merchant wallet if applicable
        if (transaction.merchantId) {
          const merchantWallets = await this.walletsService.getUserWallets(transaction.merchantId);
          const merchantWallet = merchantWallets.find(w => w.currency === transaction.currency);

          if (merchantWallet) {
            await this.walletsService.creditWallet(
              {
                walletId: merchantWallet.walletId,
                amount: transaction.netAmount,
                category: 'payment_received',
                description: transaction.description || 'Payment received',
                metadata: {
                  transactionId: transaction.transactionId,
                  reference: transaction.reference,
                  customer: transaction.customer,
                },
                externalTransactionId: transaction.providerReference,
                paymentMethod: transaction.paymentMethod,
                paymentGateway: transaction.provider,
              },
              queryRunner,
            );

            // Process split payment if configured
            if (transaction.metadata?.splitConfigurationId) {
              await this.splitPaymentsService.applySplitConfiguration(
                transaction.metadata.splitConfigurationId,
                transaction.transactionId,
                transaction.merchantId,
                transaction.amount,
                transaction.currency,
              );
            }
          }
        }
      } else {
        transaction.failedAt = new Date();
        transaction.failureReason = verification.message;
        transaction.errorCode = verification.errorCode;
      }

      await queryRunner.manager.save(transaction);

      await queryRunner.commitTransaction();

      this.eventEmitter.emit('payment.verified', {
        transactionId: transaction.transactionId,
        reference: dto.reference,
        status: transaction.status,
      });

      this.logger.log(`Payment verified: ${transaction.transactionId} - ${transaction.status}`);

      return transaction;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Payment verification failed: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Verify payment with Paystack
   */
  private async verifyPaymentWithPaystack(reference: string): Promise<any> {
    const config = this.providerConfigs.paystack;

    try {
      const response = await axios.get(
        `${config.apiUrl}/transaction/verify/${reference}`,
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
          },
        },
      );

      return {
        success: response.data.status && response.data.data.status === 'success',
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      this.logger.error(`Paystack verification failed: ${error.message}`);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Verify payment with Flutterwave
   */
  private async verifyPaymentWithFlutterwave(reference: string): Promise<any> {
    const config = this.providerConfigs.flutterwave;

    try {
      const response = await axios.get(
        `${config.apiUrl}/transactions/verify_by_reference?tx_ref=${reference}`,
        {
          headers: {
            Authorization: `Bearer ${config.apiKey}`,
          },
        },
      );

      return {
        success: response.data.status === 'success' && response.data.data.status === 'successful',
        data: response.data.data,
        message: response.data.message,
      };
    } catch (error) {
      this.logger.error(`Flutterwave verification failed: ${error.message}`);
      return {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Route verification to appropriate provider
   */
  private async verifyPaymentWithProvider(provider: string, reference: string): Promise<any> {
    switch (provider) {
      case 'paystack':
        return this.verifyPaymentWithPaystack(reference);
      case 'flutterwave':
        return this.verifyPaymentWithFlutterwave(reference);
      case 'stripe':
      case 'razorpay':
      case 'payu':
      case 'mercadopago':
      case 'khalti':
      case 'paymongo':
        throw new BadRequestException(`Provider ${provider} verification not yet implemented`);
      default:
        throw new BadRequestException(`Unknown provider: ${provider}`);
    }
  }

  /**
   * Select best gateway for currency
   */
  private async selectGateway(provider: string, currency: string): Promise<PaymentGatewayEntity> {
    const gateway = await this.gatewayRepository.findOne({
      where: {
        provider,
        isActive: true,
        isLive: true,
      },
    });

    if (!gateway) {
      // Create platform-level gateway if not exists
      return this.createPlatformGateway(provider, currency);
    }

    return gateway;
  }

  /**
   * Create platform-level gateway
   */
  private async createPlatformGateway(provider: string, currency: string): Promise<PaymentGatewayEntity> {
    const config = this.providerConfigs[provider];

    const gateway = this.gatewayRepository.create({
      gatewayId: uuidv4(),
      userId: null, // Platform-level
      provider,
      name: `${config.name} (Platform)`,
      description: `Platform ${config.name} gateway`,
      credentialsEncrypted: this.encryptCredentials(JSON.stringify({
        apiKey: config.apiKey,
        publicKey: config.publicKey || config.apiKey,
        secretKey: config.secretKey,
      })),
      isLive: true,
      isActive: true,
      supportedCurrencies: config.supportedCurrencies,
      supportedCountries: config.supportedCountries,
      supportedPaymentMethods: config.paymentMethods,
      feeConfiguration: {
        type: 'platform',
      },
      totalProcessed: '0',
      transactionCount: 0,
      healthStatus: 'healthy',
    });

    return this.gatewayRepository.save(gateway);
  }

  /**
   * Calculate payment fee
   */
  private calculateFee(provider: string, amount: Decimal, currency: string): Decimal {
    const config = this.providerConfigs[provider];
    if (!config) return new Decimal(0);

    const percentageFee = amount.times(config.feePercentage).dividedBy(100);
    const fixedFee = new Decimal(config.feeFixed || 0);
    let totalFee = percentageFee.plus(fixedFee);

    // Apply fee cap if exists
    if (config.feeCap) {
      const cap = new Decimal(config.feeCap);
      totalFee = Decimal.min(totalFee, cap);
    }

    return totalFee;
  }

  /**
   * Generate unique reference
   */
  private generateReference(): string {
    return `PAY-${Date.now()}-${crypto.randomBytes(8).toString('hex').toUpperCase()}`;
  }

  /**
   * Encrypt credentials
   */
  private encryptCredentials(data: string): string {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || '0'.repeat(64), 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
  }

  /**
   * Get transaction
   */
  async getTransaction(transactionId: string): Promise<PaymentTransactionEntity> {
    const transaction = await this.transactionRepository.findOne({
      where: { transactionId },
    });

    if (!transaction) {
      throw new NotFoundException('Transaction not found');
    }

    return transaction;
  }

  /**
   * Get user transactions
   */
  async getUserTransactions(
    userId: string,
    limit: number = 50,
    offset: number = 0,
  ): Promise<PaymentTransactionEntity[]> {
    return this.transactionRepository.find({
      where: { userId },
      order: { createdAt: 'DESC' },
      take: limit,
      skip: offset,
    });
  }
}
