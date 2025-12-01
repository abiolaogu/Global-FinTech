"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
var RealtimePaymentsService_1;
var _a, _b, _c, _d;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RealtimePaymentsService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const realtime_payment_entity_1 = require("./entities/realtime-payment.entity");
const payment_rail_connection_entity_1 = require("./entities/payment-rail-connection.entity");
const event_emitter_1 = require("@nestjs/event-emitter");
const decimal_js_1 = require("decimal.js");
const crypto = require("crypto");
const axios_1 = require("axios");
let RealtimePaymentsService = RealtimePaymentsService_1 = class RealtimePaymentsService {
    constructor(paymentRepository, connectionRepository, dataSource, eventEmitter) {
        this.paymentRepository = paymentRepository;
        this.connectionRepository = connectionRepository;
        this.dataSource = dataSource;
        this.eventEmitter = eventEmitter;
        this.logger = new common_1.Logger(RealtimePaymentsService_1.name);
        this.feeConfig = {
            upi: { fixed: '0', bps: 0 },
            pix: { fixed: '0', bps: 0 },
            fednow: { fixed: '0.045', bps: 0 },
            sepa_instant: { fixed: '0.20', bps: 0 },
            faster_payments: { fixed: '0', bps: 0 },
            ach_realtime: { fixed: '0.29', bps: 0 },
        };
    }
    async registerRailConnection(dto) {
        this.logger.log(`Registering ${dto.railType} connection for ${dto.country}`);
        const credentialsEncrypted = this.encryptCredentials(JSON.stringify(dto.credentials));
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
        await this.testConnection(savedConnection.connectionId);
        this.logger.log(`Payment rail connection registered: ${savedConnection.connectionId}`);
        return savedConnection;
    }
    async initiatePayment(dto) {
        this.logger.log(`Initiating ${dto.railType} payment: ${dto.amount} ${dto.currency} from ${dto.senderUserId} to ${dto.receiverUserId}`);
        const startTime = Date.now();
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const connection = await queryRunner.manager.findOne(payment_rail_connection_entity_1.PaymentRailConnectionEntity, {
                where: {
                    railType: dto.railType,
                    status: 'active',
                },
            });
            if (!connection) {
                throw new common_1.BadRequestException(`No active ${dto.railType} connection found`);
            }
            const fee = this.calculateFee(dto.railType, new decimal_js_1.default(dto.amount));
            const payment = queryRunner.manager.create(realtime_payment_entity_1.RealtimePaymentEntity, {
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
            const result = await this.processPaymentThroughRail(payment, connection);
            payment.status = result.success ? 'completed' : 'failed';
            payment.externalTransactionId = result.externalId;
            payment.errorCode = result.errorCode;
            payment.errorMessage = result.errorMessage;
            payment.processingTimeMs = Date.now() - startTime;
            if (result.success) {
                payment.completedAt = new Date();
            }
            else {
                payment.failedAt = new Date();
            }
            await queryRunner.manager.save(payment);
            await queryRunner.commitTransaction();
            this.eventEmitter.emit('payment.realtime_completed', {
                paymentId: payment.paymentId,
                railType: dto.railType,
                amount: dto.amount,
                currency: dto.currency,
                status: payment.status,
                processingTimeMs: payment.processingTimeMs,
            });
            this.logger.log(`Payment ${payment.status}: ${payment.paymentId} (${payment.processingTimeMs}ms)`);
            return payment;
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Payment failed: ${error.message}`);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async processPaymentThroughRail(payment, connection) {
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
                throw new common_1.BadRequestException(`Unsupported rail type: ${payment.railType}`);
        }
    }
    async processUpiPayment(payment, connection, credentials) {
        this.logger.log(`Processing UPI payment: ${payment.senderRailId} -> ${payment.receiverRailId}`);
        try {
            const response = await axios_1.default.post(connection.apiEndpoint + '/collect', {
                payerVPA: payment.senderRailId,
                payeeVPA: payment.receiverRailId,
                amount: payment.amount,
                currency: payment.currency,
                note: payment.description || '',
                merchantTxnId: payment.paymentId,
            }, {
                headers: {
                    'X-API-Key': credentials.apiKey,
                    'X-Merchant-ID': credentials.merchantId,
                },
            });
            return {
                success: response.data.status === 'SUCCESS',
                externalId: response.data.txnId,
                errorCode: response.data.errorCode,
                errorMessage: response.data.errorMessage,
            };
        }
        catch (error) {
            this.logger.error(`UPI payment error: ${error.message}`);
            return {
                success: false,
                errorCode: 'UPI_ERROR',
                errorMessage: error.message,
            };
        }
    }
    async processPixPayment(payment, connection, credentials) {
        this.logger.log(`Processing Pix payment: ${payment.senderRailId} -> ${payment.receiverRailId}`);
        try {
            const response = await axios_1.default.post(connection.apiEndpoint + '/pix/v2/cob', {
                calendario: {
                    expiracao: 3600,
                },
                devedor: {
                    chave: payment.senderRailId,
                },
                valor: {
                    original: payment.amount,
                },
                chave: payment.receiverRailId,
                solicitacaoPagador: payment.description || '',
            }, {
                headers: {
                    Authorization: `Bearer ${credentials.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            return {
                success: response.data.status === 'ATIVA' || response.data.status === 'CONCLUIDA',
                externalId: response.data.txid,
            };
        }
        catch (error) {
            this.logger.error(`Pix payment error: ${error.message}`);
            return {
                success: false,
                errorCode: 'PIX_ERROR',
                errorMessage: error.message,
            };
        }
    }
    async processFedNowPayment(payment, connection, credentials) {
        this.logger.log(`Processing FedNow payment`);
        try {
            const iso20022Message = this.buildIso20022Message(payment, 'fednow');
            const response = await axios_1.default.post(connection.apiEndpoint + '/payment', iso20022Message, {
                headers: {
                    'X-API-Key': credentials.apiKey,
                    'Content-Type': 'application/xml',
                },
            });
            return {
                success: response.data.transactionStatus === 'ACCC',
                externalId: response.data.transactionId,
            };
        }
        catch (error) {
            this.logger.error(`FedNow payment error: ${error.message}`);
            return {
                success: false,
                errorCode: 'FEDNOW_ERROR',
                errorMessage: error.message,
            };
        }
    }
    async processSepaInstantPayment(payment, connection, credentials) {
        this.logger.log(`Processing SEPA Instant payment`);
        try {
            const iso20022Message = this.buildIso20022Message(payment, 'sepa_instant');
            const response = await axios_1.default.post(connection.apiEndpoint + '/sepa-instant/payment', iso20022Message, {
                headers: {
                    Authorization: `Bearer ${credentials.accessToken}`,
                    'Content-Type': 'application/xml',
                },
            });
            return {
                success: response.data.status === 'ACCC',
                externalId: response.data.endToEndId,
            };
        }
        catch (error) {
            this.logger.error(`SEPA Instant payment error: ${error.message}`);
            return {
                success: false,
                errorCode: 'SEPA_ERROR',
                errorMessage: error.message,
            };
        }
    }
    async processFasterPayment(payment, connection, credentials) {
        this.logger.log(`Processing Faster Payment`);
        try {
            const response = await axios_1.default.post(connection.apiEndpoint + '/fps/payment', {
                debtorAccount: payment.senderRailId,
                creditorAccount: payment.receiverRailId,
                instructedAmount: {
                    amount: payment.amount,
                    currency: payment.currency,
                },
                remittanceInformation: payment.description || '',
                endToEndIdentification: payment.paymentId,
            }, {
                headers: {
                    Authorization: `Bearer ${credentials.accessToken}`,
                    'Content-Type': 'application/json',
                },
            });
            return {
                success: response.data.status === 'AcceptedSettlementCompleted',
                externalId: response.data.transactionId,
            };
        }
        catch (error) {
            this.logger.error(`Faster Payment error: ${error.message}`);
            return {
                success: false,
                errorCode: 'FPS_ERROR',
                errorMessage: error.message,
            };
        }
    }
    async processAchRealtimePayment(payment, connection, credentials) {
        this.logger.log(`Processing ACH Real-Time payment`);
        try {
            const response = await axios_1.default.post(connection.apiEndpoint + '/rtp/payment', {
                debtorAccount: payment.senderRailId,
                creditorAccount: payment.receiverRailId,
                amount: payment.amount,
                currency: payment.currency,
                remittanceData: payment.description || '',
                endToEndId: payment.paymentId,
            }, {
                headers: {
                    'X-API-Key': credentials.apiKey,
                    'Content-Type': 'application/json',
                },
            });
            return {
                success: response.data.status === 'COMPLETED',
                externalId: response.data.transactionId,
            };
        }
        catch (error) {
            this.logger.error(`ACH Real-Time payment error: ${error.message}`);
            return {
                success: false,
                errorCode: 'RTP_ERROR',
                errorMessage: error.message,
            };
        }
    }
    buildIso20022Message(payment, railType) {
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
    async testConnection(connectionId) {
        const connection = await this.connectionRepository.findOne({
            where: { connectionId },
        });
        if (!connection) {
            throw new common_1.NotFoundException('Connection not found');
        }
        try {
            const credentials = this.decryptCredentials(connection.credentialsEncrypted);
            const response = await axios_1.default.get(connection.apiEndpoint + '/health', {
                headers: {
                    'X-API-Key': credentials.apiKey,
                },
                timeout: 5000,
            });
            const isHealthy = response.status === 200;
            connection.status = isHealthy ? 'active' : 'error';
            connection.healthStatus = isHealthy ? 'healthy' : 'down';
            connection.lastHealthCheck = new Date();
            await this.connectionRepository.save(connection);
            return isHealthy;
        }
        catch (error) {
            this.logger.error(`Connection test failed: ${error.message}`);
            connection.status = 'error';
            connection.healthStatus = 'down';
            connection.lastHealthCheck = new Date();
            await this.connectionRepository.save(connection);
            return false;
        }
    }
    async getPayment(paymentId) {
        const payment = await this.paymentRepository.findOne({
            where: { paymentId },
        });
        if (!payment) {
            throw new common_1.NotFoundException('Payment not found');
        }
        return payment;
    }
    async getUserPayments(userId, type = 'all', limit = 50) {
        const where = {};
        if (type === 'sent') {
            where.senderUserId = userId;
        }
        else if (type === 'received') {
            where.receiverUserId = userId;
        }
        else {
            return this.paymentRepository
                .createQueryBuilder('payment')
                .where('payment.senderUserId = :userId OR payment.receiverUserId = :userId', { userId })
                .orderBy('payment.createdAt', 'DESC')
                .take(limit)
                .getMany();
        }
        return this.paymentRepository.find({
            where,
            order: { createdAt: 'DESC' },
            take: limit,
        });
    }
    async getPaymentStats(railType, startDate, endDate) {
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
        const totalVolume = payments.reduce((sum, p) => sum.plus(p.amount), new decimal_js_1.default(0));
        const successful = payments.filter((p) => p.status === 'completed').length;
        const avgProcessingTime = payments.reduce((sum, p) => sum + (p.processingTimeMs || 0), 0) / totalPayments || 0;
        return {
            totalPayments,
            totalVolume: totalVolume.toString(),
            successRate: totalPayments > 0 ? (successful / totalPayments) * 100 : 0,
            avgProcessingTimeMs: Math.round(avgProcessingTime),
        };
    }
    calculateFee(railType, amount) {
        const config = this.feeConfig[railType];
        const fixedFee = new decimal_js_1.default(config.fixed);
        const bpsFee = amount.times(config.bps).dividedBy(10000);
        return fixedFee.plus(bpsFee);
    }
    getRailInfo(railType, country) {
        const railInfo = {
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
    encryptCredentials(data) {
        const algorithm = 'aes-256-gcm';
        const key = Buffer.from(process.env.ENCRYPTION_KEY || '0'.repeat(64), 'hex');
        const iv = crypto.randomBytes(16);
        const cipher = crypto.createCipheriv(algorithm, key, iv);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const tag = cipher.getAuthTag();
        return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
    }
    decryptCredentials(encrypted) {
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
};
exports.RealtimePaymentsService = RealtimePaymentsService;
exports.RealtimePaymentsService = RealtimePaymentsService = RealtimePaymentsService_1 = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(realtime_payment_entity_1.RealtimePaymentEntity)),
    __param(1, (0, typeorm_1.InjectRepository)(payment_rail_connection_entity_1.PaymentRailConnectionEntity)),
    __metadata("design:paramtypes", [typeof (_a = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _a : Object, typeof (_b = typeof typeorm_2.Repository !== "undefined" && typeorm_2.Repository) === "function" ? _b : Object, typeof (_c = typeof typeorm_2.DataSource !== "undefined" && typeorm_2.DataSource) === "function" ? _c : Object, typeof (_d = typeof event_emitter_1.EventEmitter2 !== "undefined" && event_emitter_1.EventEmitter2) === "function" ? _d : Object])
], RealtimePaymentsService);
//# sourceMappingURL=realtime-payments.service.js.map