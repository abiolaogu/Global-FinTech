import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly saltLength = 64;
  private readonly tagLength = 16;
  private readonly masterKey: Buffer;

  constructor(private readonly configService: ConfigService) {
    const key = this.configService.get<string>('ENCRYPTION_KEY');
    if (!key) {
      throw new Error('ENCRYPTION_KEY must be set in environment variables');
    }
    this.masterKey = Buffer.from(key, 'hex');

    if (this.masterKey.length !== this.keyLength) {
      throw new Error(`ENCRYPTION_KEY must be ${this.keyLength * 2} hex characters (${this.keyLength} bytes)`);
    }
  }

  /**
   * Encrypt sensitive data (PII, PAN, etc.)
   */
  encrypt(plaintext: string): string {
    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.masterKey, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const tag = cipher.getAuthTag();

    // Return: iv:encrypted:tag (all in hex)
    return `${iv.toString('hex')}:${encrypted}:${tag.toString('hex')}`;
  }

  /**
   * Decrypt sensitive data
   */
  decrypt(ciphertext: string): string {
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

  /**
   * Hash password with salt (for user passwords)
   */
  async hashPassword(password: string): Promise<string> {
    const salt = crypto.randomBytes(this.saltLength);
    const hash = await this.pbkdf2(password, salt);

    // Return: salt:hash (both in hex)
    return `${salt.toString('hex')}:${hash.toString('hex')}`;
  }

  /**
   * Verify password against hash
   */
  async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    const parts = storedHash.split(':');
    if (parts.length !== 2) {
      throw new Error('Invalid hash format');
    }

    const salt = Buffer.from(parts[0], 'hex');
    const hash = Buffer.from(parts[1], 'hex');

    const derivedHash = await this.pbkdf2(password, salt);

    return crypto.timingSafeEqual(hash, derivedHash);
  }

  /**
   * Generate secure random token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash data (one-way) - useful for tokens, identifiers
   */
  hash(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /**
   * Generate HMAC for data integrity/authentication
   */
  hmac(data: string, secret?: string): string {
    const key = secret ? Buffer.from(secret) : this.masterKey;
    return crypto.createHmac('sha256', key).update(data).digest('hex');
  }

  /**
   * Verify HMAC
   */
  verifyHmac(data: string, signature: string, secret?: string): boolean {
    const expectedSignature = this.hmac(data, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature),
    );
  }

  /**
   * Encrypt card PAN (Primary Account Number)
   * Returns tokenized version for storage
   */
  encryptCardPAN(pan: string): { token: string; lastFour: string; bin: string } {
    const encrypted = this.encrypt(pan);
    const token = this.hash(encrypted);
    const lastFour = pan.slice(-4);
    const bin = pan.slice(0, 6); // Bank Identification Number

    return { token, lastFour, bin };
  }

  /**
   * Mask sensitive data for logging
   */
  maskSensitiveData(data: string, visibleChars: number = 4): string {
    if (data.length <= visibleChars) {
      return '*'.repeat(data.length);
    }
    const visible = data.slice(-visibleChars);
    const masked = '*'.repeat(data.length - visibleChars);
    return masked + visible;
  }

  /**
   * PBKDF2 key derivation
   */
  private pbkdf2(password: string, salt: Buffer): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      crypto.pbkdf2(
        password,
        salt,
        100000, // iterations
        64, // key length
        'sha512',
        (err, derivedKey) => {
          if (err) reject(err);
          else resolve(derivedKey);
        },
      );
    });
  }
}
