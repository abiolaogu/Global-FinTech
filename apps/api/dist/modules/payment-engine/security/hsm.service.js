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
var HSMService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.HSMService = void 0;
const common_1 = require("@nestjs/common");
const crypto = require("crypto");
let HSMService = HSMService_1 = class HSMService {
    constructor() {
        this.logger = new common_1.Logger(HSMService_1.name);
        this.keys = new Map();
        this.hsmConnected = false;
        this.initialize();
    }
    async initialize() {
        this.logger.log('Initializing HSM connection...');
        await this.generateMasterKeys();
        this.hsmConnected = true;
        this.logger.log('HSM initialized successfully');
    }
    encryptPINBlock(pin, pan, pinKey) {
        try {
            const pinBlock = this.createPINBlock(pin, pan);
            const encrypted = this.tripleDesEncrypt(pinBlock, pinKey);
            return {
                pinBlock: encrypted,
            };
        }
        catch (error) {
            this.logger.error(`PIN encryption failed: ${error.message}`);
            throw error;
        }
    }
    decryptPINBlock(encryptedPINBlock, pinKey) {
        try {
            const decrypted = this.tripleDesDecrypt(encryptedPINBlock, pinKey);
            return decrypted;
        }
        catch (error) {
            this.logger.error(`PIN decryption failed: ${error.message}`);
            throw error;
        }
    }
    verifyPIN(encryptedPINBlock, pan, storedPIN, pinKey) {
        try {
            const decryptedBlock = this.decryptPINBlock(encryptedPINBlock, pinKey);
            const enteredPIN = this.extractPINFromBlock(decryptedBlock, pan);
            return enteredPIN === storedPIN;
        }
        catch (error) {
            this.logger.error(`PIN verification failed: ${error.message}`);
            return false;
        }
    }
    translatePIN(encryptedPINBlock, fromKey, toKey) {
        try {
            const decryptedBlock = this.tripleDesDecrypt(encryptedPINBlock, fromKey);
            const reencrypted = this.tripleDesEncrypt(decryptedBlock, toKey);
            return reencrypted;
        }
        catch (error) {
            this.logger.error(`PIN translation failed: ${error.message}`);
            throw error;
        }
    }
    generateCVV(pan, expiryDate, serviceCode) {
        try {
            const cvk = this.getKey('CVK');
            const data = pan + expiryDate + serviceCode;
            const encrypted = this.tripleDesEncrypt(data.padEnd(16, '0'), cvk.value);
            const cvv = encrypted.substring(0, 3);
            return cvv;
        }
        catch (error) {
            this.logger.error(`CVV generation failed: ${error.message}`);
            throw error;
        }
    }
    verifyCVV(pan, expiryDate, serviceCode, cvv) {
        try {
            const generatedCVV = this.generateCVV(pan, expiryDate, serviceCode);
            return generatedCVV === cvv;
        }
        catch (error) {
            this.logger.error(`CVV verification failed: ${error.message}`);
            return false;
        }
    }
    generateARPC(arqc, transactionData, issuerMasterKey) {
        try {
            const sessionKey = this.deriveSessionKey(issuerMasterKey, transactionData);
            const arpc = this.tripleDesEncrypt(arqc, sessionKey);
            return arpc.substring(0, 16);
        }
        catch (error) {
            this.logger.error(`ARPC generation failed: ${error.message}`);
            throw error;
        }
    }
    verifyARQC(arqc, transactionData, issuerMasterKey) {
        try {
            const sessionKey = this.deriveSessionKey(issuerMasterKey, transactionData);
            const decrypted = this.tripleDesDecrypt(arqc, sessionKey);
            return decrypted.length > 0;
        }
        catch (error) {
            this.logger.error(`ARQC verification failed: ${error.message}`);
            return false;
        }
    }
    generateMAC(data, macKey) {
        try {
            const hmac = crypto.createHmac('sha256', Buffer.from(macKey, 'hex'));
            hmac.update(data);
            const mac = hmac.digest('hex');
            return mac.substring(0, 16);
        }
        catch (error) {
            this.logger.error(`MAC generation failed: ${error.message}`);
            throw error;
        }
    }
    verifyMAC(data, mac, macKey) {
        try {
            const generatedMAC = this.generateMAC(data, macKey);
            return generatedMAC === mac;
        }
        catch (error) {
            this.logger.error(`MAC verification failed: ${error.message}`);
            return false;
        }
    }
    generateZPK() {
        try {
            const key = crypto.randomBytes(16).toString('hex').toUpperCase();
            const checkValue = this.tripleDesEncrypt('0'.repeat(16), key).substring(0, 6);
            return { key, checkValue };
        }
        catch (error) {
            this.logger.error(`ZPK generation failed: ${error.message}`);
            throw error;
        }
    }
    deriveKeyDUKPT(bdk, ksn) {
        try {
            const ksnBuffer = Buffer.from(ksn, 'hex');
            const bdkBuffer = Buffer.from(bdk, 'hex');
            const ipek = this.deriveIPEK(bdkBuffer, ksnBuffer);
            const sessionKey = this.deriveSessionKeyDUKPT(ipek, ksnBuffer);
            return sessionKey.toString('hex').toUpperCase();
        }
        catch (error) {
            this.logger.error(`DUKPT key derivation failed: ${error.message}`);
            throw error;
        }
    }
    async generateMasterKeys() {
        const keyTypes = ['ZMK', 'ZPK', 'PVK', 'CVK', 'TAK', 'BDK', 'IMK'];
        for (const keyType of keyTypes) {
            const { key, checkValue } = this.generateZPK();
            this.keys.set(keyType, {
                type: keyType,
                value: key,
                checkValue,
                created: new Date(),
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                status: 'active',
            });
            this.logger.log(`Generated ${keyType}: Check value ${checkValue}`);
        }
    }
    getKey(keyType) {
        const key = this.keys.get(keyType);
        if (!key) {
            throw new Error(`Key ${keyType} not found`);
        }
        if (key.status !== 'active') {
            throw new Error(`Key ${keyType} is not active`);
        }
        if (key.expiryDate < new Date()) {
            throw new Error(`Key ${keyType} has expired`);
        }
        return key;
    }
    createPINBlock(pin, pan) {
        const pinLength = pin.length.toString(16);
        const pinPart = ('0' + pinLength + pin).padEnd(16, 'F');
        const panPart = ('0000' + pan.substring(pan.length - 13, pan.length - 1)).substring(0, 16);
        const pinBlock = this.xorHex(pinPart, panPart);
        return pinBlock;
    }
    extractPINFromBlock(pinBlock, pan) {
        const panPart = ('0000' + pan.substring(pan.length - 13, pan.length - 1)).substring(0, 16);
        const pinPart = this.xorHex(pinBlock, panPart);
        const pinLength = parseInt(pinPart.substring(1, 2), 16);
        const pin = pinPart.substring(2, 2 + pinLength);
        return pin;
    }
    tripleDesEncrypt(data, key) {
        const cipher = crypto.createCipheriv('des-ede3', Buffer.from(key, 'hex'), Buffer.alloc(0));
        cipher.setAutoPadding(false);
        let encrypted = cipher.update(data, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        return encrypted.toUpperCase();
    }
    tripleDesDecrypt(encryptedData, key) {
        const decipher = crypto.createDecipheriv('des-ede3', Buffer.from(key, 'hex'), Buffer.alloc(0));
        decipher.setAutoPadding(false);
        let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    xorHex(hex1, hex2) {
        const buf1 = Buffer.from(hex1, 'hex');
        const buf2 = Buffer.from(hex2, 'hex');
        const result = Buffer.alloc(buf1.length);
        for (let i = 0; i < buf1.length; i++) {
            result[i] = buf1[i] ^ buf2[i];
        }
        return result.toString('hex').toUpperCase();
    }
    deriveSessionKey(masterKey, data) {
        const hash = crypto.createHash('sha256');
        hash.update(masterKey + data);
        const derived = hash.digest('hex');
        return derived.substring(0, 32);
    }
    deriveIPEK(bdk, ksn) {
        const ksn8 = ksn.slice(0, 8);
        const ksnMask = Buffer.from([0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xE0, 0x00]);
        const maskedKSN = Buffer.alloc(8);
        for (let i = 0; i < 8; i++) {
            maskedKSN[i] = ksn8[i] & ksnMask[i];
        }
        const cipher = crypto.createCipheriv('des-ede3', bdk, Buffer.alloc(0));
        const ipek = cipher.update(maskedKSN);
        return ipek;
    }
    deriveSessionKeyDUKPT(ipek, ksn) {
        const cipher = crypto.createCipheriv('des-ede3', ipek, Buffer.alloc(0));
        const sessionKey = cipher.update(ksn.slice(0, 8));
        return sessionKey;
    }
    async rotateKeys() {
        this.logger.log('Starting key rotation...');
        for (const [keyType, keyData] of this.keys) {
            keyData.status = 'retired';
            const { key, checkValue } = this.generateZPK();
            this.keys.set(keyType, {
                type: keyType,
                value: key,
                checkValue,
                created: new Date(),
                expiryDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
                status: 'active',
            });
            this.logger.log(`Rotated ${keyType}: New check value ${checkValue}`);
        }
        this.logger.log('Key rotation completed');
    }
    getStatus() {
        const activeKeys = Array.from(this.keys.values()).filter((k) => k.status === 'active').length;
        return {
            connected: this.hsmConnected,
            keysLoaded: this.keys.size,
            activeKeys,
        };
    }
};
exports.HSMService = HSMService;
exports.HSMService = HSMService = HSMService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [])
], HSMService);
//# sourceMappingURL=hsm.service.js.map