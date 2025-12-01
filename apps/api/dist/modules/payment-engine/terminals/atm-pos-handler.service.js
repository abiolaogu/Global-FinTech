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
var ATMPOSHandler_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.RESPONSE_CODES = exports.ATMPOSHandler = void 0;
const common_1 = require("@nestjs/common");
const iso8583_parser_service_1 = require("../iso8583/iso8583-parser.service");
const transaction_switch_service_1 = require("../switch/transaction-switch.service");
const hsm_service_1 = require("../security/hsm.service");
const card_management_service_1 = require("../card-management/card-management.service");
let ATMPOSHandler = ATMPOSHandler_1 = class ATMPOSHandler {
    constructor(iso8583Parser, transactionSwitch, hsmService, cardManagement) {
        this.iso8583Parser = iso8583Parser;
        this.transactionSwitch = transactionSwitch;
        this.hsmService = hsmService;
        this.cardManagement = cardManagement;
        this.logger = new common_1.Logger(ATMPOSHandler_1.name);
    }
    async processTransaction(message) {
        try {
            const mti = message.mti;
            switch (mti) {
                case '0100':
                    return await this.handleAuthorizationRequest(message);
                case '0200':
                    return await this.handleFinancialRequest(message);
                case '0400':
                    return await this.handleReversalRequest(message);
                case '0420':
                    return await this.handleReversalAdvice(message);
                case '0800':
                    return await this.handleNetworkManagement(message);
                default:
                    throw new Error(`Unsupported MTI: ${mti}`);
            }
        }
        catch (error) {
            this.logger.error(`Transaction processing failed: ${error.message}`);
            return this.buildErrorResponse(message, '96');
        }
    }
    async handleAuthorizationRequest(message) {
        const processingCode = message.fields.get(3);
        const pan = message.fields.get(2);
        const amount = message.fields.get(4);
        this.logger.debug(`Authorization request: PAN=${this.maskPAN(pan)}, Amount=${amount}`);
        try {
            const cardValidation = await this.validateCard(pan);
            if (!cardValidation.valid) {
                return this.buildResponse(message, cardValidation.responseCode);
            }
            if (message.fields.has(52)) {
                const pinBlock = message.fields.get(52);
                const pinValid = await this.verifyPIN(pan, pinBlock);
                if (!pinValid) {
                    return this.buildResponse(message, '55');
                }
            }
            const txnType = processingCode.substring(0, 2);
            switch (txnType) {
                case '31':
                    return await this.handleBalanceInquiry(message);
                case '00':
                case '01':
                case '09':
                    return await this.authorizeTransaction(message);
                default:
                    return this.buildResponse(message, '12');
            }
        }
        catch (error) {
            this.logger.error(`Authorization failed: ${error.message}`);
            return this.buildResponse(message, '96');
        }
    }
    async handleFinancialRequest(message) {
        const processingCode = message.fields.get(3);
        const pan = message.fields.get(2);
        const amount = message.fields.get(4);
        const stan = message.fields.get(11);
        this.logger.log(`Financial transaction: PAN=${this.maskPAN(pan)}, Amount=${amount}, STAN=${stan}`);
        try {
            const cardValidation = await this.validateCard(pan);
            if (!cardValidation.valid) {
                return this.buildResponse(message, cardValidation.responseCode);
            }
            const txnType = processingCode.substring(0, 2);
            if (['01', '09'].includes(txnType) && message.fields.has(52)) {
                const pinBlock = message.fields.get(52);
                const pinValid = await this.verifyPIN(pan, pinBlock);
                if (!pinValid) {
                    return this.buildResponse(message, '55');
                }
            }
            if (message.fields.has(55)) {
                const iccData = message.fields.get(55);
                const emvValidation = await this.validateEMV(iccData);
                if (!emvValidation.valid) {
                    return this.buildResponse(message, '57');
                }
            }
            switch (txnType) {
                case '00':
                    return await this.handlePurchase(message);
                case '01':
                    return await this.handleCashWithdrawal(message);
                case '09':
                    return await this.handlePurchaseWithCashback(message);
                case '20':
                    return await this.handleRefund(message);
                default:
                    return this.buildResponse(message, '12');
            }
        }
        catch (error) {
            this.logger.error(`Financial transaction failed: ${error.message}`);
            return this.buildResponse(message, '96');
        }
    }
    async handleReversalRequest(message) {
        const originalData = message.fields.get(90);
        const stan = message.fields.get(11);
        this.logger.warn(`Reversal request: STAN=${stan}`);
        try {
            const originalMTI = originalData.substring(0, 4);
            const originalSTAN = originalData.substring(4, 10);
            const response = this.buildResponse(message, '00');
            response.mti = '0410';
            return response;
        }
        catch (error) {
            this.logger.error(`Reversal failed: ${error.message}`);
            return this.buildResponse(message, '96');
        }
    }
    async handleReversalAdvice(message) {
        const stan = message.fields.get(11);
        this.logger.warn(`Reversal advice: STAN=${stan}`);
        const response = this.buildResponse(message, '00');
        response.mti = '0430';
        return response;
    }
    async handleNetworkManagement(message) {
        const networkMgmtCode = message.fields.get(70);
        switch (networkMgmtCode) {
            case '001':
                this.logger.log('Terminal sign-on');
                break;
            case '002':
                this.logger.log('Terminal sign-off');
                break;
            case '301':
                this.logger.debug('Echo test');
                break;
        }
        const response = this.buildResponse(message, '00');
        response.mti = '0810';
        return response;
    }
    async handleBalanceInquiry(message) {
        const pan = message.fields.get(2);
        const availableBalance = '000000500000';
        const ledgerBalance = '000000520000';
        const response = this.buildResponse(message, '00');
        response.mti = '0110';
        response.fields.set(54, `00${availableBalance}01${ledgerBalance}`);
        return response;
    }
    async authorizeTransaction(message) {
        const pan = message.fields.get(2);
        const amount = parseFloat(message.fields.get(4)) / 100;
        const limitsCheck = await this.checkTransactionLimits(pan, amount);
        if (!limitsCheck.approved) {
            return this.buildResponse(message, limitsCheck.responseCode);
        }
        const balanceCheck = await this.checkBalance(pan, amount);
        if (!balanceCheck.sufficient) {
            return this.buildResponse(message, '51');
        }
        const authCode = this.generateAuthorizationCode();
        const response = this.buildResponse(message, '00');
        response.mti = '0110';
        response.fields.set(38, authCode);
        return response;
    }
    async handlePurchase(message) {
        const pan = message.fields.get(2);
        const amount = parseFloat(message.fields.get(4)) / 100;
        const merchantId = message.fields.get(42);
        const authResponse = await this.authorizeTransaction(message);
        if (authResponse.fields.get(39) !== '00') {
            return authResponse;
        }
        const response = this.buildResponse(message, '00');
        response.mti = '0210';
        response.fields.set(38, this.generateAuthorizationCode());
        this.logger.log(`Purchase approved: PAN=${this.maskPAN(pan)}, Amount=${amount}, Merchant=${merchantId}`);
        return response;
    }
    async handleCashWithdrawal(message) {
        const pan = message.fields.get(2);
        const amount = parseFloat(message.fields.get(4)) / 100;
        const terminalId = message.fields.get(41);
        const limitCheck = await this.checkATMLimit(pan, amount);
        if (!limitCheck.approved) {
            return this.buildResponse(message, limitCheck.responseCode);
        }
        const authResponse = await this.authorizeTransaction(message);
        if (authResponse.fields.get(39) !== '00') {
            return authResponse;
        }
        const response = this.buildResponse(message, '00');
        response.mti = '0210';
        response.fields.set(38, this.generateAuthorizationCode());
        this.logger.log(`Cash withdrawal: PAN=${this.maskPAN(pan)}, Amount=${amount}, Terminal=${terminalId}`);
        return response;
    }
    async handlePurchaseWithCashback(message) {
        const purchaseAmount = parseFloat(message.fields.get(4)) / 100;
        let cashbackAmount = 0;
        if (message.fields.has(54)) {
            const additionalAmounts = message.fields.get(54);
            cashbackAmount = parseFloat(additionalAmounts.substring(2, 14)) / 100;
        }
        const totalAmount = purchaseAmount + cashbackAmount;
        const response = await this.handlePurchase(message);
        this.logger.log(`Purchase with cashback: Total=${totalAmount} (Purchase=${purchaseAmount}, Cashback=${cashbackAmount})`);
        return response;
    }
    async handleRefund(message) {
        const pan = message.fields.get(2);
        const amount = parseFloat(message.fields.get(4)) / 100;
        const response = this.buildResponse(message, '00');
        response.mti = '0210';
        response.fields.set(38, this.generateAuthorizationCode());
        this.logger.log(`Refund processed: PAN=${this.maskPAN(pan)}, Amount=${amount}`);
        return response;
    }
    async validateCard(pan) {
        if (!this.validateLuhn(pan)) {
            return { valid: false, responseCode: '14' };
        }
        return { valid: true, responseCode: '00' };
    }
    validateLuhn(pan) {
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
        return sum % 10 === 0;
    }
    async verifyPIN(pan, pinBlock) {
        try {
            const zpk = 'ABCDEF0123456789ABCDEF0123456789';
            const decryptedBlock = this.hsmService.decryptPINBlock(pinBlock, zpk);
            const pin = this.extractPIN(decryptedBlock, pan);
            return true;
        }
        catch (error) {
            this.logger.error(`PIN verification failed: ${error.message}`);
            return false;
        }
    }
    extractPIN(pinBlock, pan) {
        return pinBlock.substring(2, 6);
    }
    async validateEMV(iccData) {
        return { valid: true };
    }
    async checkTransactionLimits(pan, amount) {
        const dailyLimit = 5000;
        if (amount > dailyLimit) {
            return { approved: false, responseCode: '61' };
        }
        return { approved: true, responseCode: '00' };
    }
    async checkBalance(pan, amount) {
        const availableBalance = 10000;
        return { sufficient: amount <= availableBalance };
    }
    async checkATMLimit(pan, amount) {
        const atmDailyLimit = 1000;
        if (amount > atmDailyLimit) {
            return { approved: false, responseCode: '61' };
        }
        return { approved: true, responseCode: '00' };
    }
    generateAuthorizationCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 6; i++) {
            code += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return code;
    }
    buildResponse(request, responseCode) {
        const response = {
            mti: this.getResponseMTI(request.mti),
            fields: new Map(),
        };
        const fieldsToCopy = [2, 3, 4, 7, 11, 12, 13, 32, 37, 41, 42];
        for (const fieldId of fieldsToCopy) {
            if (request.fields.has(fieldId)) {
                response.fields.set(fieldId, request.fields.get(fieldId));
            }
        }
        response.fields.set(39, responseCode);
        if (responseCode === '00') {
            response.fields.set(38, this.generateAuthorizationCode());
        }
        return response;
    }
    buildErrorResponse(request, responseCode) {
        return this.buildResponse(request, responseCode);
    }
    getResponseMTI(requestMTI) {
        const first = requestMTI.substring(0, 2);
        const last = requestMTI.substring(2);
        const responseMTI = first.charAt(0) + '1' + last;
        return responseMTI;
    }
    maskPAN(pan) {
        if (!pan || pan.length < 13) {
            return pan;
        }
        return pan.substring(0, 6) + '****' + pan.substring(pan.length - 4);
    }
};
exports.ATMPOSHandler = ATMPOSHandler;
exports.ATMPOSHandler = ATMPOSHandler = ATMPOSHandler_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [iso8583_parser_service_1.ISO8583Parser,
        transaction_switch_service_1.TransactionSwitch,
        hsm_service_1.HSMService,
        card_management_service_1.CardManagementService])
], ATMPOSHandler);
exports.RESPONSE_CODES = {
    '00': 'Approved',
    '01': 'Refer to card issuer',
    '03': 'Invalid merchant',
    '04': 'Capture card',
    '05': 'Do not honor',
    '12': 'Invalid transaction',
    '13': 'Invalid amount',
    '14': 'Invalid card number',
    '30': 'Format error',
    '41': 'Lost card',
    '43': 'Stolen card',
    '51': 'Insufficient funds',
    '54': 'Expired card',
    '55': 'Incorrect PIN',
    '57': 'Transaction not permitted to cardholder',
    '61': 'Exceeds withdrawal limit',
    '62': 'Restricted card',
    '65': 'Exceeds withdrawal frequency',
    '91': 'Issuer unavailable',
    '96': 'System error',
};
//# sourceMappingURL=atm-pos-handler.service.js.map