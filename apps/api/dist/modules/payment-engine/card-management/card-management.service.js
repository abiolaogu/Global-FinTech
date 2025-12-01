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
var CardManagementService_1;
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CardManagementService = exports.CardNetwork = exports.CardType = exports.CardStatus = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("typeorm");
const hsm_service_1 = require("../security/hsm.service");
const crypto = require("crypto");
var CardStatus;
(function (CardStatus) {
    CardStatus["ORDERED"] = "ordered";
    CardStatus["MANUFACTURED"] = "manufactured";
    CardStatus["SHIPPED"] = "shipped";
    CardStatus["ACTIVATED"] = "activated";
    CardStatus["ACTIVE"] = "active";
    CardStatus["BLOCKED"] = "blocked";
    CardStatus["SUSPENDED"] = "suspended";
    CardStatus["LOST"] = "lost";
    CardStatus["STOLEN"] = "stolen";
    CardStatus["DAMAGED"] = "damaged";
    CardStatus["EXPIRED"] = "expired";
    CardStatus["CLOSED"] = "closed";
})(CardStatus || (exports.CardStatus = CardStatus = {}));
var CardType;
(function (CardType) {
    CardType["DEBIT"] = "debit";
    CardType["CREDIT"] = "credit";
    CardType["PREPAID"] = "prepaid";
    CardType["VIRTUAL"] = "virtual";
})(CardType || (exports.CardType = CardType = {}));
var CardNetwork;
(function (CardNetwork) {
    CardNetwork["VISA"] = "visa";
    CardNetwork["MASTERCARD"] = "mastercard";
    CardNetwork["AMEX"] = "amex";
    CardNetwork["DISCOVER"] = "discover";
    CardNetwork["UNIONPAY"] = "unionpay";
})(CardNetwork || (exports.CardNetwork = CardNetwork = {}));
let CardManagementService = CardManagementService_1 = class CardManagementService {
    constructor(hsmService, dataSource) {
        this.hsmService = hsmService;
        this.dataSource = dataSource;
        this.logger = new common_1.Logger(CardManagementService_1.name);
    }
    async issueCard(request) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.connect();
        await queryRunner.startTransaction();
        try {
            const pan = this.generatePAN(request.network, request.binRange);
            const expiryDate = this.generateExpiryDate(request.validityYears || 3);
            const cvv = this.hsmService.generateCVV(pan, expiryDate, '201');
            const cvv2 = this.hsmService.generateCVV(pan, expiryDate, '999');
            const panWithCheck = this.addLuhnCheckDigit(pan);
            const card = {
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
            if (request.cardType !== CardType.VIRTUAL) {
                card.track1Data = this.generateTrack1(card);
                card.track2Data = this.generateTrack2(card);
                card.iccData = await this.generateICCData(card);
            }
            await queryRunner.commitTransaction();
            this.logger.log(`Issued ${request.cardType} card: ${card.maskedPan}`);
            return this.sanitizeCardData(card);
        }
        catch (error) {
            await queryRunner.rollbackTransaction();
            this.logger.error(`Failed to issue card: ${error.message}`);
            throw error;
        }
        finally {
            await queryRunner.release();
        }
    }
    async activateCard(cardId, activationCode) {
        const card = await this.getCard(cardId);
        if (card.status !== CardStatus.ORDERED && card.status !== CardStatus.SHIPPED) {
            throw new common_1.BadRequestException(`Card cannot be activated in status: ${card.status}`);
        }
        if (activationCode && card.activationCode !== activationCode) {
            throw new common_1.BadRequestException('Invalid activation code');
        }
        card.status = CardStatus.ACTIVE;
        card.activatedDate = new Date();
        this.logger.log(`Activated card: ${card.maskedPan}`);
        return this.sanitizeCardData(card);
    }
    async setPIN(cardId, newPIN, currentPIN) {
        if (!/^\d{4,6}$/.test(newPIN)) {
            throw new common_1.BadRequestException('PIN must be 4-6 digits');
        }
        const card = await this.getCard(cardId);
        if (currentPIN && card.pinHash) {
            const isValid = await this.verifyPIN(cardId, currentPIN);
            if (!isValid) {
                throw new common_1.BadRequestException('Current PIN is incorrect');
            }
        }
        card.pinHash = await this.hashPIN(newPIN, card.pan);
        card.pinOffset = this.generatePINOffset(newPIN, card.pan);
        this.logger.log(`PIN set for card: ${card.maskedPan}`);
    }
    async verifyPIN(cardId, pin) {
        const card = await this.getCard(cardId);
        if (!card.pinHash) {
            throw new common_1.BadRequestException('PIN not set for this card');
        }
        const pinHash = await this.hashPIN(pin, card.pan);
        return pinHash === card.pinHash;
    }
    async blockCard(cardId, reason) {
        const card = await this.getCard(cardId);
        card.status = CardStatus.BLOCKED;
        card.blockReason = reason;
        card.blockedDate = new Date();
        this.logger.warn(`Blocked card: ${card.maskedPan}, Reason: ${reason}`);
        return this.sanitizeCardData(card);
    }
    async unblockCard(cardId) {
        const card = await this.getCard(cardId);
        if (card.status !== CardStatus.BLOCKED) {
            throw new common_1.BadRequestException('Card is not blocked');
        }
        card.status = CardStatus.ACTIVE;
        card.blockReason = null;
        card.blockedDate = null;
        this.logger.log(`Unblocked card: ${card.maskedPan}`);
        return this.sanitizeCardData(card);
    }
    async reportLostStolen(cardId, type) {
        const card = await this.getCard(cardId);
        card.status = type === 'lost' ? CardStatus.LOST : CardStatus.STOLEN;
        card.reportedDate = new Date();
        this.logger.warn(`Card reported as ${type}: ${card.maskedPan}`);
        const replacement = await this.issueReplacementCard(card);
        return this.sanitizeCardData(replacement);
    }
    async updateLimits(cardId, limits) {
        const card = await this.getCard(cardId);
        card.limits = Object.assign(Object.assign({}, card.limits), limits);
        this.logger.log(`Updated limits for card: ${card.maskedPan}`);
        return this.sanitizeCardData(card);
    }
    async generateToken(cardId, walletType) {
        const card = await this.getCard(cardId);
        const tokenPAN = this.generateTokenPAN(card.pan);
        const tokenExpiry = this.generateExpiryDate(2);
        const tokenCVV = this.hsmService.generateCVV(tokenPAN, tokenExpiry, '201');
        const token = {
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
        this.logger.log(`Generated ${walletType} token for card: ${card.maskedPan}`);
        return token;
    }
    async getCard(cardId) {
        throw new common_1.NotFoundException('Card not found');
    }
    generatePAN(network, binRange) {
        let bin;
        if (binRange) {
            bin = binRange;
        }
        else {
            switch (network) {
                case CardNetwork.VISA:
                    bin = '4' + this.randomDigits(5);
                    break;
                case CardNetwork.MASTERCARD:
                    bin = '5' + this.randomDigits(5);
                    break;
                case CardNetwork.AMEX:
                    bin = '37' + this.randomDigits(4);
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
        const accountNumber = this.randomDigits(9);
        return bin + accountNumber;
    }
    addLuhnCheckDigit(pan) {
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
    maskPAN(pan) {
        if (pan.length < 13) {
            return pan;
        }
        const first6 = pan.substring(0, 6);
        const last4 = pan.substring(pan.length - 4);
        const middle = '*'.repeat(pan.length - 10);
        return first6 + middle + last4;
    }
    generateExpiryDate(validityYears) {
        const now = new Date();
        const expiry = new Date(now.getFullYear() + validityYears, now.getMonth(), 1);
        const month = (expiry.getMonth() + 1).toString().padStart(2, '0');
        const year = expiry.getFullYear().toString().substring(2);
        return year + month;
    }
    generateTrack1(card) {
        const name = card.cardholderName.toUpperCase().replace(' ', '/');
        const serviceCode = '201';
        const discretionary = '000000000000000';
        return `%B${card.pan}^${name}^${card.expiryDate}${serviceCode}${discretionary}?`;
    }
    generateTrack2(card) {
        const serviceCode = '201';
        const discretionary = '0000000000';
        return `;${card.pan}=${card.expiryDate}${serviceCode}${discretionary}?`;
    }
    async generateICCData(card) {
        return {
            AID: '  A0000000031010',
            applicationLabel: 'CREDIT',
            applicationPreferredName: 'VISA CARD',
            track2Equivalent: card.track2Data,
            pan: card.pan,
            expiryDate: card.expiryDate,
            cardholderName: card.cardholderName,
            issuerCountryCode: '840',
            currencyCode: '840',
            iccPublicKey: await this.generateICCPublicKey(),
            issuerPublicKey: await this.generateIssuerPublicKey(),
        };
    }
    async hashPIN(pin, pan) {
        const salt = pan.substring(pan.length - 12);
        const hash = crypto.createHash('sha256');
        hash.update(pin + salt);
        return hash.digest('hex');
    }
    generatePINOffset(pin, pan) {
        const naturalPIN = this.calculateNaturalPIN(pan);
        const offset = (parseInt(pin) - parseInt(naturalPIN) + 10000) % 10000;
        return offset.toString().padStart(4, '0');
    }
    calculateNaturalPIN(pan) {
        return pan.substring(pan.length - 4);
    }
    async issueReplacementCard(originalCard) {
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
    generateTokenPAN(originalPAN) {
        const bin = originalPAN.substring(0, 6);
        const accountNumber = this.randomDigits(9);
        const tokenPAN = bin + accountNumber;
        return this.addLuhnCheckDigit(tokenPAN);
    }
    getDefaultLimits(cardType) {
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
                    dailyATMLimit: 0,
                    dailyOnlineLimit: 5000,
                    singleTransactionLimit: 2000,
                    monthlyLimit: 50000,
                };
        }
    }
    sanitizeCardData(card) {
        const sanitized = Object.assign({}, card);
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
    randomDigits(length) {
        let result = '';
        for (let i = 0; i < length; i++) {
            result += Math.floor(Math.random() * 10);
        }
        return result;
    }
    async generateICCPublicKey() {
        return crypto.randomBytes(128).toString('hex');
    }
    async generateIssuerPublicKey() {
        return crypto.randomBytes(128).toString('hex');
    }
};
exports.CardManagementService = CardManagementService;
exports.CardManagementService = CardManagementService = CardManagementService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [hsm_service_1.HSMService, typeof (_a = typeof typeorm_1.DataSource !== "undefined" && typeorm_1.DataSource) === "function" ? _a : Object])
], CardManagementService);
//# sourceMappingURL=card-management.service.js.map