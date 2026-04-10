import crypto from 'crypto';
import { logger } from '@/utils/logger';

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');
const ALGORITHM = 'aes-256-gcm';

export class EncryptionService {
  /**
   * Encrypt sensitive data
   */
  static encrypt(data: string): string {
    try {
      const iv = crypto.randomBytes(16);
      const key = Buffer.from(ENCRYPTION_KEY, 'hex');

      const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
      let encrypted = cipher.update(data, 'utf8', 'hex');
      encrypted += cipher.final('hex');

      const authTag = cipher.getAuthTag();

      // Combine IV + authTag + encrypted data
      return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error: any) {
      logger.error('Encryption error:', error.message);
      throw new Error('Failed to encrypt data');
    }
  }

  /**
   * Decrypt sensitive data
   */
  static decrypt(encryptedData: string): string {
    try {
      const [ivHex, authTagHex, encrypted] = encryptedData.split(':');

      const iv = Buffer.from(ivHex, 'hex');
      const authTag = Buffer.from(authTagHex, 'hex');
      const key = Buffer.from(ENCRYPTION_KEY, 'hex');

      const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error: any) {
      logger.error('Decryption error:', error.message);
      throw new Error('Failed to decrypt data');
    }
  }

  /**
   * Hash sensitive data (one-way)
   */
  static hash(data: string, algorithm: string = 'sha256'): string {
    return crypto.createHash(algorithm).update(data).digest('hex');
  }

  /**
   * Generate a random secure token
   */
  static generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash token for storage
   */
  static hashToken(token: string): string {
    return this.hash(token, 'sha256');
  }

  /**
   * Generate key fingerprint (for tracking key rotation)
   */
  static generateKeyFingerprint(): string {
    return this.hash(ENCRYPTION_KEY).substring(0, 32);
  }

  /**
   * Mask sensitive data for logging
   */
  static maskSensitiveData(data: any): any {
    if (typeof data !== 'object' || data === null) {
      return data;
    }

    const masked = { ...data };
    const sensitiveFields = ['password', 'token', 'secret', 'apiKey', 'creditCard', 'ssn'];

    for (const field of sensitiveFields) {
      if (field in masked) {
        const value = String(masked[field]);
        masked[field] = value.length > 4 ? `${value.substring(0, 2)}${'*'.repeat(value.length - 4)}${value.substring(value.length - 2)}` : '*'.repeat(value.length);
      }
    }

    return masked;
  }
}
