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
var PaymentGatewayService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentGatewayService = void 0;
const common_1 = require("@nestjs/common");
const iso8583_parser_service_1 = require("../iso8583/iso8583-parser.service");
const transaction_switch_service_1 = require("../switch/transaction-switch.service");
const hsm_service_1 = require("../security/hsm.service");
const atm_pos_handler_service_1 = require("../terminals/atm-pos-handler.service");
let PaymentGatewayService = PaymentGatewayService_1 = class PaymentGatewayService {
    constructor(iso8583Parser, transactionSwitch, hsmService, atmPosHandler) {
        this.iso8583Parser = iso8583Parser;
        this.transactionSwitch = transactionSwitch;
        this.hsmService = hsmService;
        this.atmPosHandler = atmPosHandler;
        this.logger = new common_1.Logger(PaymentGatewayService_1.name);
    }
    async processPayment(request) {
        const startTime = Date.now();
        const transactionId = this.generateTransactionId();
        this.logger.log(`Processing payment: ${transactionId}`);
        try {
            this.validatePaymentRequest(request);
            const iso8583Message = this.buildISO8583FromPayment(request, transactionId);
            const response = await this.transactionSwitch.process(iso8583Message);
            const paymentResponse = this.parseISO8583ToPayment(response, transactionId);
            paymentResponse.processingTime = Date.now() - startTime;
            this.logger.log(`Payment ${paymentResponse.approved ? 'approved' : 'declined'}: ${transactionId} in ${paymentResponse.processingTime}ms`);
            this.sendWebhookNotification(request.merchantId, paymentResponse);
            return paymentResponse;
        }
        catch (error) {
            this.logger.error(`Payment failed: ${error.message}`, error.stack);
            return {
                transactionId,
                approved: false,
                responseCode: '96',
                responseMessage: 'Payment processing failed',
                processingTime: Date.now() - startTime,
                timestamp: new Date(),
            };
        }
    }
    async process3DSecure(request) {
        this.logger.log(`3D Secure authentication: ${request.cardNumber}`);
        try {
            const enrollmentCheck = await this.check3DSEnrollment(request.cardNumber);
            if (!enrollmentCheck.enrolled) {
                return {
                    authenticated: false,
                    eci: '07',
                    cavv: null,
                    xid: null,
                };
            }
            const authResponse = await this.initiate3DSAuth(request);
            return {
                authenticated: authResponse.success,
                eci: authResponse.eci,
                cavv: authResponse.cavv,
                xid: authResponse.xid,
                acsUrl: authResponse.acsUrl,
                paReq: authResponse.paReq,
            };
        }
        catch (error) {
            this.logger.error(`3DS failed: ${error.message}`);
            throw error;
        }
    }
    async processRefund(originalTransactionId, amount) {
        this.logger.log(`Processing refund for: ${originalTransactionId}`);
        try {
            const refundMessage = this.buildRefundMessage(originalTransactionId, amount);
            const response = await this.transactionSwitch.process(refundMessage);
            const refundResponse = this.parseISO8583ToPayment(response, this.generateTransactionId());
            return refundResponse;
        }
        catch (error) {
            this.logger.error(`Refund failed: ${error.message}`);
            throw error;
        }
    }
    async tokenizeCard(request) {
        this.logger.log(`Tokenizing card: ${this.maskPAN(request.cardNumber)}`);
        try {
            const token = this.generateToken();
            return {
                token,
                maskedCardNumber: this.maskPAN(request.cardNumber),
                cardType: this.getCardType(request.cardNumber),
                expiryMonth: request.expiryMonth,
                expiryYear: request.expiryYear,
            };
        }
        catch (error) {
            this.logger.error(`Tokenization failed: ${error.message}`);
            throw error;
        }
    }
    async processTokenPayment(request) {
        this.logger.log(`Processing token payment: ${request.token}`);
        try {
            const paymentRequest = Object.assign(Object.assign({}, request), { cardNumber: 'RETRIEVED_FROM_VAULT', expiryMonth: 'XX', expiryYear: 'XXXX', cvv: 'XXX' });
            return await this.processPayment(paymentRequest);
        }
        catch (error) {
            this.logger.error(`Token payment failed: ${error.message}`);
            throw error;
        }
    }
    validatePaymentRequest(request) {
        if (!this.validateLuhn(request.cardNumber)) {
            throw new Error('Invalid card number');
        }
        if (!this.validateExpiry(request.expiryMonth, request.expiryYear)) {
            throw new Error('Card expired');
        }
        if (!/^\d{3,4}$/.test(request.cvv)) {
            throw new Error('Invalid CVV');
        }
        if (request.amount <= 0) {
            throw new Error('Invalid amount');
        }
    }
    buildISO8583FromPayment(request, transactionId) {
        const message = {
            mti: '0200',
            fields: new Map(),
        };
        message.fields.set(2, request.cardNumber);
        message.fields.set(3, '000000');
        const amountCents = Math.round(request.amount * 100);
        message.fields.set(4, amountCents.toString().padStart(12, '0'));
        const now = new Date();
        message.fields.set(7, this.formatDateTime(now));
        message.fields.set(11, this.generateSTAN());
        message.fields.set(12, this.formatTime(now));
        message.fields.set(13, this.formatDate(now));
        message.fields.set(14, request.expiryYear.substring(2) + request.expiryMonth);
        message.fields.set(22, request.isEcommerce ? '012' : '051');
        message.fields.set(37, transactionId.substring(0, 12));
        message.fields.set(41, request.terminalId || 'GATEWAY1');
        message.fields.set(42, request.merchantId.padEnd(15, ' '));
        message.fields.set(49, request.currency || '840');
        if (request.cvv) {
            message.fields.set(48, `CVV2:${request.cvv}`);
        }
        return message;
    }
    parseISO8583ToPayment(iso8583, transactionId) {
        const responseCode = iso8583.fields.get(39) || '96';
        const authCode = iso8583.fields.get(38);
        return {
            transactionId,
            approved: responseCode === '00',
            responseCode,
            responseMessage: this.getResponseMessage(responseCode),
            authorizationCode: authCode,
            timestamp: new Date(),
        };
    }
    buildRefundMessage(originalTxnId, amount) {
        const message = {
            mti: '0200',
            fields: new Map(),
        };
        message.fields.set(3, '200000');
        message.fields.set(37, originalTxnId.substring(0, 12));
        return message;
    }
    async check3DSEnrollment(cardNumber) {
        return { enrolled: true };
    }
    async initiate3DSAuth(request) {
        return {
            success: true,
            eci: '05',
            cavv: 'MOCK_CAVV_VALUE',
            xid: 'MOCK_XID_VALUE',
            acsUrl: 'https://acs.bank.com/3ds',
            paReq: 'MOCK_PAREQ',
        };
    }
    async sendWebhookNotification(merchantId, response) {
        this.logger.debug(`Webhook notification sent to merchant ${merchantId}`);
    }
    generateTransactionId() {
        return 'TXN' + Date.now() + Math.random().toString(36).substring(2, 9).toUpperCase();
    }
    generateSTAN() {
        return Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
    }
    generateToken() {
        return 'tok_' + crypto.randomUUID().replace(/-/g, '');
    }
    formatDateTime(date) {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        const hour = date.getHours().toString().padStart(2, '0');
        const minute = date.getMinutes().toString().padStart(2, '0');
        const second = date.getSeconds().toString().padStart(2, '0');
        return month + day + hour + minute + second;
    }
    formatTime(date) {
        const hour = date.getHours().toString().padStart(2, '0');
        const minute = date.getMinutes().toString().padStart(2, '0');
        const second = date.getSeconds().toString().padStart(2, '0');
        return hour + minute + second;
    }
    formatDate(date) {
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const day = date.getDate().toString().padStart(2, '0');
        return month + day;
    }
    validateLuhn(cardNumber) {
        let sum = 0;
        let alternate = false;
        for (let i = cardNumber.length - 1; i >= 0; i--) {
            let digit = parseInt(cardNumber[i]);
            if (alternate) {
                digit *= 2;
                if (digit > 9)
                    digit -= 9;
            }
            sum += digit;
            alternate = !alternate;
        }
        return sum % 10 === 0;
    }
    validateExpiry(month, year) {
        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth() + 1;
        const expiryYear = parseInt('20' + year);
        const expiryMonth = parseInt(month);
        if (expiryYear < currentYear)
            return false;
        if (expiryYear === currentYear && expiryMonth < currentMonth)
            return false;
        return true;
    }
    maskPAN(pan) {
        if (pan.length < 13)
            return pan;
        return pan.substring(0, 6) + '******' + pan.substring(pan.length - 4);
    }
    getCardType(pan) {
        if (pan.startsWith('4'))
            return 'VISA';
        if (pan.startsWith('5'))
            return 'MASTERCARD';
        if (pan.startsWith('37'))
            return 'AMEX';
        if (pan.startsWith('6011'))
            return 'DISCOVER';
        return 'UNKNOWN';
    }
    getResponseMessage(code) {
        const messages = {
            '00': 'Approved',
            '05': 'Do not honor',
            '14': 'Invalid card number',
            '41': 'Lost card',
            '43': 'Stolen card',
            '51': 'Insufficient funds',
            '54': 'Expired card',
            '55': 'Incorrect PIN',
            '96': 'System error',
        };
        return messages[code] || 'Declined';
    }
};
exports.PaymentGatewayService = PaymentGatewayService;
exports.PaymentGatewayService = PaymentGatewayService = PaymentGatewayService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [iso8583_parser_service_1.ISO8583Parser,
        transaction_switch_service_1.TransactionSwitch,
        hsm_service_1.HSMService,
        atm_pos_handler_service_1.ATMPOSHandler])
], PaymentGatewayService);
//# sourceMappingURL=payment-gateway.service.js.map