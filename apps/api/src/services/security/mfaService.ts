import { pool } from '@/config/database';
import { EncryptionService } from './encryptionService';
import { logger } from '@/utils/logger';
import crypto from 'crypto';

// TOTP implementation
const speakeasy = require('speakeasy');
const QRCode = require('qrcode');

export class MFAService {
  /**
   * Generate TOTP secret and QR code for user
   */
  static async generateTOTPSecret(userId: string, email: string) {
    try {
      // Generate secret using speakeasy
      const secret = speakeasy.generateSecret({
        name: `Wissen-Haus (${email})`,
        issuer: 'Wissen-Haus',
        length: 32,
      });

      // Generate QR code
      const qrCode = await QRCode.toDataURL(secret.otpauth_url);

      // Encrypt and store secret
      const encryptedSecret = EncryptionService.encrypt(secret.base32);

      // Generate backup codes
      const backupCodes = this.generateBackupCodes(10);

      // Check if MFA setup already exists
      const existingSetup = await pool.query(
        `SELECT id FROM mfa_setup WHERE user_id = $1 AND mfa_type = 'totp'`,
        [userId]
      );

      if (existingSetup.rows.length > 0) {
        // Update existing setup
        await pool.query(
          `UPDATE mfa_setup SET secret = $1, backup_codes = $2, enabled = FALSE WHERE user_id = $3 AND mfa_type = 'totp'`,
          [encryptedSecret, backupCodes, userId]
        );
      } else {
        // Create new setup
        await pool.query(
          `INSERT INTO mfa_setup (user_id, mfa_type, secret, backup_codes, enabled)
           VALUES ($1, 'totp', $2, $3, FALSE)`,
          [userId, encryptedSecret, backupCodes]
        );
      }

      logger.info(`✓ Generated TOTP secret for user ${userId}`);

      return {
        secret: secret.base32,
        qrCode,
        backupCodes,
      };
    } catch (error: any) {
      logger.error('Generate TOTP secret error:', error.message);
      throw new Error('Failed to generate MFA secret');
    }
  }

  /**
   * Verify TOTP code
   */
  static async verifyTOTPCode(userId: string, code: string): Promise<boolean> {
    try {
      const result = await pool.query(
        `SELECT secret FROM mfa_setup WHERE user_id = $1 AND mfa_type = 'totp' AND enabled = TRUE`,
        [userId]
      );

      if (result.rows.length === 0) {
        return false;
      }

      const encryptedSecret = result.rows[0].secret;
      const secret = EncryptionService.decrypt(encryptedSecret);

      // Verify with time window of ±30 seconds (1 time step before/after)
      const isValid = speakeasy.totp.verify({
        secret,
        encoding: 'base32',
        token: code,
        window: 1,
      });

      if (isValid) {
        logger.info(`✓ TOTP verification successful for user ${userId}`);
      }

      return isValid;
    } catch (error: any) {
      logger.error('TOTP verification error:', error.message);
      return false;
    }
  }

  /**
   * Enable MFA for user
   */
  static async enableMFA(userId: string): Promise<void> {
    try {
      await pool.query(
        `UPDATE mfa_setup SET enabled = TRUE, enabled_at = NOW() WHERE user_id = $1 AND mfa_type = 'totp'`,
        [userId]
      );

      await pool.query(
        `UPDATE users SET mfa_enabled = TRUE, mfa_verified = TRUE WHERE id = $1`,
        [userId]
      );

      logger.info(`✓ MFA enabled for user ${userId}`);
    } catch (error: any) {
      logger.error('Enable MFA error:', error.message);
      throw new Error('Failed to enable MFA');
    }
  }

  /**
   * Disable MFA for user
   */
  static async disableMFA(userId: string): Promise<void> {
    try {
      await pool.query(
        `UPDATE mfa_setup SET enabled = FALSE WHERE user_id = $1 AND mfa_type = 'totp'`,
        [userId]
      );

      await pool.query(
        `UPDATE users SET mfa_enabled = FALSE, mfa_verified = FALSE WHERE id = $1`,
        [userId]
      );

      logger.info(`✓ MFA disabled for user ${userId}`);
    } catch (error: any) {
      logger.error('Disable MFA error:', error.message);
      throw new Error('Failed to disable MFA');
    }
  }

  /**
   * Check if user has MFA enabled
   */
  static async isMFAEnabled(userId: string): Promise<boolean> {
    try {
      const result = await pool.query(
        `SELECT mfa_enabled FROM users WHERE id = $1`,
        [userId]
      );

      return result.rows.length > 0 && result.rows[0].mfa_enabled;
    } catch (error: any) {
      logger.error('Check MFA error:', error.message);
      return false;
    }
  }

  /**
   * Use backup code
   */
  static async useBackupCode(userId: string, code: string): Promise<boolean> {
    try {
      const result = await pool.query(
        `SELECT backup_codes FROM mfa_setup WHERE user_id = $1 AND mfa_type = 'totp'`,
        [userId]
      );

      if (result.rows.length === 0) {
        return false;
      }

      const backupCodes = result.rows[0].backup_codes || [];
      const codeIndex = backupCodes.indexOf(code);

      if (codeIndex === -1) {
        return false;
      }

      // Remove used code
      backupCodes.splice(codeIndex, 1);

      await pool.query(
        `UPDATE mfa_setup SET backup_codes = $1 WHERE user_id = $2 AND mfa_type = 'totp'`,
        [backupCodes, userId]
      );

      // Track backup code usage
      await pool.query(
        `UPDATE users SET two_factor_backup_used = two_factor_backup_used + 1 WHERE id = $1`,
        [userId]
      );

      logger.info(`✓ Backup code used for user ${userId}`);
      return true;
    } catch (error: any) {
      logger.error('Use backup code error:', error.message);
      return false;
    }
  }

  /**
   * Get remaining backup codes
   */
  static async getBackupCodeCount(userId: string): Promise<number> {
    try {
      const result = await pool.query(
        `SELECT backup_codes FROM mfa_setup WHERE user_id = $1 AND mfa_type = 'totp'`,
        [userId]
      );

      if (result.rows.length === 0) {
        return 0;
      }

      const backupCodes = result.rows[0].backup_codes || [];
      return backupCodes.length;
    } catch (error: any) {
      logger.error('Get backup codes error:', error.message);
      return 0;
    }
  }

  /**
   * Generate backup codes (10 codes, 8 characters each)
   */
  private static generateBackupCodes(count: number): string[] {
    const codes: string[] = [];
    for (let i = 0; i < count; i++) {
      const code = crypto.randomBytes(4).toString('hex').toUpperCase();
      codes.push(`${code.substring(0, 4)}-${code.substring(4)}`);
    }
    return codes;
  }
}
