import { ConfigService } from '@nestjs/config';
export declare class EncryptionService {
    private readonly configService;
    private readonly algorithm;
    private readonly keyLength;
    private readonly ivLength;
    private readonly saltLength;
    private readonly tagLength;
    private readonly masterKey;
    constructor(configService: ConfigService);
    encrypt(plaintext: string): string;
    decrypt(ciphertext: string): string;
    hashPassword(password: string): Promise<string>;
    verifyPassword(password: string, storedHash: string): Promise<boolean>;
    generateToken(length?: number): string;
    hash(data: string): string;
    hmac(data: string, secret?: string): string;
    verifyHmac(data: string, signature: string, secret?: string): boolean;
    encryptCardPAN(pan: string): {
        token: string;
        lastFour: string;
        bin: string;
    };
    maskSensitiveData(data: string, visibleChars?: number): string;
    private pbkdf2;
}
