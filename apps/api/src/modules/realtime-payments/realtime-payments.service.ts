import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { RealtimePaymentEntity } from './entities/realtime-payment.entity';
import { PaymentRailConnectionEntity } from './entities/payment-rail-connection.entity';
import { EventEmitter2 } from '@nestjs/event-emitter';
import Decimal from 'decimal.js';
import * as crypto from 'crypto';
import axios from 'axios';

export interface InitiatePaymentDto {
  senderUserId: string;
  receiverUserId: string;
  amount: string;
  currency: string;
  railType: 'upi' | 'pix' | 'fednow' | 'sepa_instant' | 'faster_payments' | 'ach_realtime';
  description?: string;
  reference?: string;
  senderRailId: string; // UPI VPA, Pix key, account number, etc.
  receiverRailId: string;
}

export interface RegisterRailConnectionDto {
  partnerId?: string;
  railType: 'upi' | 'pix' | 'fednow' | 'sepa_instant' | 'faster_payments' | 'ach_realtime';
  country: string;
  credentials: {
    apiKey?: string;
    apiSecret?: string;
    merchantId?: string;
    certificatePath?: string;
    [key: string]: any;
  };
  configuration?: any;
  isLive: boolean;
}

@Injectable()
export class RealtimePaymentsService {
  private readonly logger = new Logger(RealtimePaymentsService.name);

  // Fee configuration (basis points = 1/100th of a percent)
  private readonly feeConfig = {
    upi: { fixed: '0', bps: 0 }, // Free in India
    pix: { fixed: '0', bps: 0 }, // Free in Brazil
    fednow: { fixed: '0.045', bps: 0 }, // $0.045 per transaction
    sepa_instant: { fixed: '0.20', bps: 0 }, // €0.20 typical
    faster_payments: { fixed: '0', bps: 0 }, // Free in UK
    ach_realtime: { fixed: '0.29', bps: 0 }, // $0.29 typical
  };

  constructor(
    @InjectRepository(RealtimePaymentEntity)
    private readonly paymentRepository: Repository<RealtimePaymentEntity>,
    @InjectRepository(PaymentRailConnectionEntity)
    private readonly connectionRepository: Repository<PaymentRailConnectionEntity>,
    private readonly dataSource: DataSource,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  /**
   * Register a payment rail connection
   */
  async registerRailConnection(dto: RegisterRailConnectionDto): Promise<PaymentRailConnectionEntity> {
    this.logger.log(`Registering ${dto.railType} connection for ${dto.country}`);

    // Encrypt credentials
    const credentialsEncrypted = this.encryptCredentials(JSON.stringify(dto.credentials));

    // Determine rail name and API endpoint
    const railInfo = this.getRailInfo(dto.railType, dto.country);

    const connection = this.connectionRepository.create({
      partnerId: dto.partnerId || null,
      railType: dto.railType,
      railName: railInfo.name,
      country: dto.country,
      credentialsEncrypted,
      apiEndpoint: railInfo.endpoint,
      configuration: dto.configuration || {},
      status: 'pending',
      isLive: dto.isLive,
    });

    const savedConnection = await this.connectionRepository.save(connection);

    // Test connection
    await this.testConnection(savedConnection.connectionId);

    this.logger.log(`Payment rail connection registered: ${savedConnection.connectionId}`);

    return savedConnection;
  }

  /**
   * Initiate a real-time payment
   */
  async initiatePayment(dto: InitiatePaymentDto): Promise<RealtimePaymentEntity> {
    this.logger.log(
      `Initiating ${dto.railType} payment: ${dto.amount} ${dto.currency} from ${dto.senderUserId} to ${dto.receiverUserId}`,
    );

    const startTime = Date.now();

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Get active connection for this rail type
      const connection = await queryRunner.manager.findOne(PaymentRailConnectionEntity, {
        where: {
          railType: dto.railType,
          status: 'active' as any,
        },
      });

      if (!connection) {
        throw new BadRequestException(`No active ${dto.railType} connection found`);
      }

      // Calculate fee
      const fee = this.calculateFee(dto.railType, new Decimal(dto.amount));

      // Create payment record
      const payment = queryRunner.manager.create(RealtimePaymentEntity, {
        senderUserId: dto.senderUserId,
        receiverUserId: dto.receiverUserId,
        railType: dto.railType,
        connectionId: connection.connectionId,
        amount: dto.amount,
        currency: dto.currency,
        description: dto.description,
        reference: dto.reference,
        senderRailId: dto.senderRailId,
        receiverRailId: dto.receiverRailId,
        status: 'pending',
        feeAmount: fee.toString(),
        initiatedAt: new Date(),
      });

      await queryRunner.manager.save(payment);

      // Process payment through the rail
      const result = await this.processPaymentThroughRail(payment, connection);

      // Update payment status
      payment.status = result.success ? 'completed' : 'failed';
      payment.externalTransactionId = result.externalId;
      payment.errorCode = result.errorCode;
      payment.errorMessage = result.errorMessage;
      payment.processingTimeMs = Date.now() - startTime;

      if (result.success) {
        payment.completedAt = new Date();
      } else {
        payment.failedAt = new Date();
      }

      await queryRunner.manager.save(payment);

      await queryRunner.commitTransaction();

      // Emit event
      this.eventEmitter.emit('payment.realtime_completed', {
        paymentId: payment.paymentId,
        railType: dto.railType,
        amount: dto.amount,
        currency: dto.currency,
        status: payment.status,
        processingTimeMs: payment.processingTimeMs,
      });

      this.logger.log(
        `Payment ${payment.status}: ${payment.paymentId} (${payment.processingTimeMs}ms)`,
      );

      return payment;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Payment failed: ${error.message}`);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Process payment through specific rail
   */
  private async processPaymentThroughRail(
    payment: RealtimePaymentEntity,
    connection: PaymentRailConnectionEntity,
  ): Promise<{
    success: boolean;
    externalId?: string;
    errorCode?: string;
    errorMessage?: string;
  }> {
    const credentials = this.decryptCredentials(connection.credentialsEncrypted);

    switch (payment.railType) {
      case 'upi':
        return this.processUpiPayment(payment, connection, credentials);

      case 'pix':
        return this.processPixPayment(payment, connection, credentials);

      case 'fednow':
        return this.processFedNowPayment(payment, connection, credentials);

      case 'sepa_instant':
        return this.processSepaInstantPayment(payment, connection, credentials);

      case 'faster_payments':
        return this.processFasterPayment(payment, connection, credentials);

      case 'ach_realtime':
        return this.processAchRealtimePayment(payment, connection, credentials);

      default:
        throw new BadRequestException(`Unsupported rail type: ${payment.railType}`);
    }
  }

  /**
   * Process UPI payment (India)
   */
  private async processUpiPayment(
    payment: RealtimePaymentEntity,
    connection: PaymentRailConnectionEntity,
    credentials: any,
  ): Promise<any> {
    this.logger.log(`Processing UPI payment: ${payment.senderRailId} -> ${payment.receiverRailId}`);

    try {
      // UPI API integration (using NPCI API)
      const response = await axios.post(
        connection.apiEndpoint + '/collect',
        {
          payerVPA: payment.senderRailId,
          payeeVPA: payment.receiverRailId,
          amount: payment.amount,
          currency: payment.currency,
          note: payment.description || '',
          merchantTxnId: payment.paymentId,
        },
        {
          headers: {
            'X-API-Key': credentials.apiKey,
            'X-Merchant-ID': credentials.merchantId,
          },
        },
      );

      return {
        success: response.data.status === 'SUCCESS',
        externalId: response.data.txnId,
        errorCode: response.data.errorCode,
        errorMessage: response.data.errorMessage,
      };
    } catch (error) {
      this.logger.error(`UPI payment error: ${error.message}`);
      return {
        success: false,
        errorCode: 'UPI_ERROR',
        errorMessage: error.message,
      };
    }
  }

  /**
   * Process Pix payment (Brazil)
   */
  private async processPixPayment(
    payment: RealtimePaymentEntity,
    connection: PaymentRailConnectionEntity,
    credentials: any,
  ): Promise<any> {
    this.logger.log(`Processing Pix payment: ${payment.senderRailId} -> ${payment.receiverRailId}`);

    try {
      // Pix API integration (using Banco Central do Brasil API)
      const response = await axios.post(
        connection.apiEndpoint + '/pix/v2/cob',
        {
          calendario: {
            expiracao: 3600, // 1 hour expiration
          },
          devedor: {
            chave: payment.senderRailId,
          },
          valor: {
            original: payment.amount,
          },
          chave: payment.receiverRailId,
          solicitacaoPagador: payment.description || '',
        },
        {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        success: response.data.status === 'ATIVA' || response.data.status === 'CONCLUIDA',
        externalId: response.data.txid,
      };
    } catch (error) {
      this.logger.error(`Pix payment error: ${error.message}`);
      return {
        success: false,
        errorCode: 'PIX_ERROR',
        errorMessage: error.message,
      };
    }
  }

  /**
   * Process FedNow payment (USA)
   */
  private async processFedNowPayment(
    payment: RealtimePaymentEntity,
    connection: PaymentRailConnectionEntity,
    credentials: any,
  ): Promise<any> {
    this.logger.log(`Processing FedNow payment`);

    try {
      // FedNow API integration (ISO 20022 messaging)
      const iso20022Message = this.buildIso20022Message(payment, 'fednow');

      const response = await axios.post(
        connection.apiEndpoint + '/payment',
        iso20022Message,
        {
          headers: {
            'X-API-Key': credentials.apiKey,
            'Content-Type': 'application/xml',
          },
        },
      );

      return {
        success: response.data.transactionStatus === 'ACCC', // AcceptedSettlementCompleted
        externalId: response.data.transactionId,
      };
    } catch (error) {
      this.logger.error(`FedNow payment error: ${error.message}`);
      return {
        success: false,
        errorCode: 'FEDNOW_ERROR',
        errorMessage: error.message,
      };
    }
  }

  /**
   * Process SEPA Instant payment (Europe)
   */
  private async processSepaInstantPayment(
    payment: RealtimePaymentEntity,
    connection: PaymentRailConnectionEntity,
    credentials: any,
  ): Promise<any> {
    this.logger.log(`Processing SEPA Instant payment`);

    try {
      // SEPA Instant API integration (ISO 20022 SCT Inst)
      const iso20022Message = this.buildIso20022Message(payment, 'sepa_instant');

      const response = await axios.post(
        connection.apiEndpoint + '/sepa-instant/payment',
        iso20022Message,
        {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
            'Content-Type': 'application/xml',
          },
        },
      );

      return {
        success: response.data.status === 'ACCC',
        externalId: response.data.endToEndId,
      };
    } catch (error) {
      this.logger.error(`SEPA Instant payment error: ${error.message}`);
      return {
        success: false,
        errorCode: 'SEPA_ERROR',
        errorMessage: error.message,
      };
    }
  }

  /**
   * Process Faster Payments (UK)
   */
  private async processFasterPayment(
    payment: RealtimePaymentEntity,
    connection: PaymentRailConnectionEntity,
    credentials: any,
  ): Promise<any> {
    this.logger.log(`Processing Faster Payment`);

    try {
      // Faster Payments API integration
      const response = await axios.post(
        connection.apiEndpoint + '/fps/payment',
        {
          debtorAccount: payment.senderRailId,
          creditorAccount: payment.receiverRailId,
          instructedAmount: {
            amount: payment.amount,
            currency: payment.currency,
          },
          remittanceInformation: payment.description || '',
          endToEndIdentification: payment.paymentId,
        },
        {
          headers: {
            Authorization: `Bearer ${credentials.accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        success: response.data.status === 'AcceptedSettlementCompleted',
        externalId: response.data.transactionId,
      };
    } catch (error) {
      this.logger.error(`Faster Payment error: ${error.message}`);
      return {
        success: false,
        errorCode: 'FPS_ERROR',
        errorMessage: error.message,
      };
    }
  }

  /**
   * Process ACH Real-Time payment (USA)
   */
  private async processAchRealtimePayment(
    payment: RealtimePaymentEntity,
    connection: PaymentRailConnectionEntity,
    credentials: any,
  ): Promise<any> {
    this.logger.log(`Processing ACH Real-Time payment`);

    try {
      // RTP Network API integration (The Clearing House)
      const response = await axios.post(
        connection.apiEndpoint + '/rtp/payment',
        {
          debtorAccount: payment.senderRailId,
          creditorAccount: payment.receiverRailId,
          amount: payment.amount,
          currency: payment.currency,
          remittanceData: payment.description || '',
          endToEndId: payment.paymentId,
        },
        {
          headers: {
            'X-API-Key': credentials.apiKey,
            'Content-Type': 'application/json',
          },
        },
      );

      return {
        success: response.data.status === 'COMPLETED',
        externalId: response.data.transactionId,
      };
    } catch (error) {
      this.logger.error(`ACH Real-Time payment error: ${error.message}`);
      return {
        success: false,
        errorCode: 'RTP_ERROR',
        errorMessage: error.message,
      };
    }
  }

  /**
   * Build ISO 20022 message for FedNow and SEPA Instant
   */
  private buildIso20022Message(payment: RealtimePaymentEntity, railType: string): string {
    // Simplified ISO 20022 pain.001 (Customer Credit Transfer Initiation)
    return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.001.001.09">
  <CstmrCdtTrfInitn>
    <GrpHdr>
      <MsgId>${payment.paymentId}</MsgId>
      <CreDtTm>${new Date().toISOString()}</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <CtrlSum>${payment.amount}</CtrlSum>
    </GrpHdr>
    <PmtInf>
      <PmtInfId>${payment.paymentId}</PmtInfId>
      <PmtMtd>TRF</PmtMtd>
      <ReqdExctnDt>${new Date().toISOString().split('T')[0]}</ReqdExctnDt>
      <Dbtr>
        <Nm>Sender</Nm>
      </Dbtr>
      <DbtrAcct>
        <Id>
          <Othr>
            <Id>${payment.senderRailId}</Id>
          </Othr>
        </Id>
      </DbtrAcct>
      <CdtTrfTxInf>
        <PmtId>
          <EndToEndId>${payment.paymentId}</EndToEndId>
        </PmtId>
        <Amt>
          <InstdAmt Ccy="${payment.currency}">${payment.amount}</InstdAmt>
        </Amt>
        <Cdtr>
          <Nm>Receiver</Nm>
        </Cdtr>
        <CdtrAcct>
          <Id>
            <Othr>
              <Id>${payment.receiverRailId}</Id>
            </Othr>
          </Id>
        </CdtrAcct>
        <RmtInf>
          <Ustrd>${payment.description || ''}</Ustrd>
        </RmtInf>
      </CdtTrfTxInf>
    </PmtInf>
  </CstmrCdtTrfInitn>
</Document>`;
  }

  /**
   * Test payment rail connection
   */
  async testConnection(connectionId: string): Promise<boolean> {
    const connection = await this.connectionRepository.findOne({
      where: { connectionId },
    });

    if (!connection) {
      throw new NotFoundException('Connection not found');
    }

    try {
      const credentials = this.decryptCredentials(connection.credentialsEncrypted);

      // Test API connectivity
      const response = await axios.get(connection.apiEndpoint + '/health', {
        headers: {
          'X-API-Key': credentials.apiKey,
        },
        timeout: 5000,
      });

      const isHealthy = response.status === 200;

      // Update connection status
      connection.status = isHealthy ? 'active' : 'error';
      connection.healthStatus = isHealthy ? 'healthy' : 'down';
      connection.lastHealthCheck = new Date();

      await this.connectionRepository.save(connection);

      return isHealthy;
    } catch (error) {
      this.logger.error(`Connection test failed: ${error.message}`);

      connection.status = 'error';
      connection.healthStatus = 'down';
      connection.lastHealthCheck = new Date();

      await this.connectionRepository.save(connection);

      return false;
    }
  }

  /**
   * Get payment by ID
   */
  async getPayment(paymentId: string): Promise<RealtimePaymentEntity> {
    const payment = await this.paymentRepository.findOne({
      where: { paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Payment not found');
    }

    return payment;
  }

  /**
   * Get user's payment history
   */
  async getUserPayments(
    userId: string,
    type: 'sent' | 'received' | 'all' = 'all',
    limit: number = 50,
  ): Promise<RealtimePaymentEntity[]> {
    const where: any = {};

    if (type === 'sent') {
      where.senderUserId = userId;
    } else if (type === 'received') {
      where.receiverUserId = userId;
    } else {
      // Use OR condition for 'all'
      return this.paymentRepository
        .createQueryBuilder('payment')
        .where('payment.senderUserId = :userId OR payment.receiverUserId = :userId', { userId })
        .orderBy('payment.createdAt', 'DESC')
        .take(limit)
        .getMany();
    }

    return this.paymentRepository.find({
      where,
      order: { createdAt: 'DESC' as any },
      take: limit,
    });
  }

  /**
   * Get payment statistics
   */
  async getPaymentStats(
    railType?: string,
    startDate?: Date,
    endDate?: Date,
  ): Promise<{
    totalPayments: number;
    totalVolume: string;
    successRate: number;
    avgProcessingTimeMs: number;
  }> {
    const query = this.paymentRepository.createQueryBuilder('payment');

    if (railType) {
      query.where('payment.railType = :railType', { railType });
    }

    if (startDate) {
      query.andWhere('payment.createdAt >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('payment.createdAt <= :endDate', { endDate });
    }

    const payments = await query.getMany();

    const totalPayments = payments.length;
    const totalVolume = payments.reduce(
      (sum, p) => sum.plus(p.amount),
      new Decimal(0),
    );
    const successful = payments.filter((p) => p.status === 'completed').length;
    const avgProcessingTime =
      payments.reduce((sum, p) => sum + (p.processingTimeMs || 0), 0) / totalPayments || 0;

    return {
      totalPayments,
      totalVolume: totalVolume.toString(),
      successRate: totalPayments > 0 ? (successful / totalPayments) * 100 : 0,
      avgProcessingTimeMs: Math.round(avgProcessingTime),
    };
  }

  // Helper methods

  private calculateFee(railType: string, amount: Decimal): Decimal {
    const config = this.feeConfig[railType];
    const fixedFee = new Decimal(config.fixed);
    const bpsFee = amount.times(config.bps).dividedBy(10000);

    return fixedFee.plus(bpsFee);
  }

  private getRailInfo(railType: string, country: string): { name: string; endpoint: string } {
    const railInfo: Record<string, any> = {
      upi: {
        name: 'UPI (Unified Payments Interface)',
        endpoint: 'https://api.npci.org.in/upi',
      },
      pix: {
        name: 'Pix (Banco Central do Brasil)',
        endpoint: 'https://pix.bcb.gov.br/api',
      },
      fednow: {
        name: 'FedNow (Federal Reserve)',
        endpoint: 'https://fednow.org/api',
      },
      sepa_instant: {
        name: 'SEPA Instant Credit Transfer',
        endpoint: 'https://api.sepainstant.eu',
      },
      faster_payments: {
        name: 'Faster Payments Service (UK)',
        endpoint: 'https://api.fasterpayments.org.uk',
      },
      ach_realtime: {
        name: 'RTP Network (The Clearing House)',
        endpoint: 'https://api.theclearinghouse.org/rtp',
      },
    };

    return railInfo[railType] || { name: railType, endpoint: '' };
  }

  private encryptCredentials(data: string): string {
    // AES-256-GCM encryption
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || '0'.repeat(64), 'hex');
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(algorithm, key, iv);

    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
  }

  private decryptCredentials(encrypted: string): any {
    const algorithm = 'aes-256-gcm';
    const key = Buffer.from(process.env.ENCRYPTION_KEY || '0'.repeat(64), 'hex');

    const parts = encrypted.split(':');
    const iv = Buffer.from(parts[0], 'hex');
    const encryptedData = parts[1];
    const tag = Buffer.from(parts[2], 'hex');

    const decipher = crypto.createDecipheriv(algorithm, key, iv);
    decipher.setAuthTag(tag);

    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  }
}
