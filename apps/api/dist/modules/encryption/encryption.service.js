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
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.EncryptionService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const crypto = require("crypto");
let EncryptionService = class EncryptionService {
    constructor(configService) {
        this.configService = configService;
        this.algorithm = 'aes-256-gcm';
        this.keyLength = 32;
        this.ivLength = 16;
        this.saltLength = 64;
        this.tagLength = 16;
        const key = this.configService.get('ENCRYPTION_KEY');
        if (!key) {
            throw new Error('ENCRYPTION_KEY must be set in environment variables');
        }
        this.masterKey = Buffer.from(key, 'hex');
        if (this.masterKey.length !== this.keyLength) {
            throw new Error(`ENCRYPTION_KEY must be ${this.keyLength * 2} hex characters (${this.keyLength} bytes)`);
        }
    }
    encrypt(plaintext) {
        const iv = crypto.randomBytes(this.ivLength);
        const cipher = crypto.createCipheriv(this.algorithm, this.masterKey, iv);
        let encrypted = cipher.update(plaintext, 'utf8', 'hex');
        encrypted += cipher.final('hex');
        const tag = cipher.getAuthTag();
        return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
    }
    decrypt(ciphertext) {
        const parts = ciphertext.split(':');
        if (parts.length !== 3) {
            throw new Error('Invalid ciphertext format');
        }
        const iv = Buffer.from(parts[0], 'hex');
        const encrypted = parts[1];
        const tag = Buffer.from(parts[2], 'hex');
        const decipher = crypto.createDecipheriv(this.algorithm, this.masterKey, iv);
        decipher.setAuthTag(tag);
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
    async hashPassword(password) {
        const salt = crypto.randomBytes(this.saltLength);
        const hash = await this.pbkdf2(password, salt);
        return `${salt.toString('hex')}:${hash.toString('hex')}`;
    }
    async verifyPassword(password, storedHash) {
        const parts = storedHash.split(':');
        if (parts.length !== 2) {
            throw new Error('Invalid hash format');
        }
        const salt = Buffer.from(parts[0], 'hex');
        const hash = Buffer.from(parts[1], 'hex');
        const derivedHash = await this.pbkdf2(password, salt);
        return crypto.timingSafeEqual(hash, derivedHash);
    }
    generateToken(length = 32) {
        return crypto.randomBytes(length).toString('hex');
    }
    hash(data) {
        return crypto.createHash('sha256').update(data).digest('hex');
    }
    hmac(data, secret) {
        const key = secret ? Buffer.from(secret) : this.masterKey;
        return crypto.createHmac('sha256', key).update(data).digest('hex');
    }
    verifyHmac(data, signature, secret) {
        const expectedSignature = this.hmac(data, secret);
        return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature));
    }
    encryptCardPAN(pan) {
        const encrypted = this.encrypt(pan);
        const token = this.hash(encrypted);
        const lastFour = pan.slice(-4);
        const bin = pan.slice(0, 6);
        return { token, lastFour, bin };
    }
    maskSensitiveData(data, visibleChars = 4) {
        if (data.length <= visibleChars) {
            return '*'.repeat(data.length);
        }
        const visible = data.slice(-visibleChars);
        const masked = '*'.repeat(data.length - visibleChars);
        return masked + visible;
    }
    pbkdf2(password, salt) {
        return new Promise((resolve, reject) => {
            crypto.pbkdf2(password, salt, 100000, 64, 'sha512', (err, derivedKey) => {
                if (err)
                    reject(err);
                else
                    resolve(derivedKey);
            });
        });
    }
};
exports.EncryptionService = EncryptionService;
exports.EncryptionService = EncryptionService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [typeof (_a = typeof config_1.ConfigService !== "undefined" && config_1.ConfigService) === "function" ? _a : Object])
], EncryptionService);
//# sourceMappingURL=encryption.service.js.map