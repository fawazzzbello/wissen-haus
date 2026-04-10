import { pool } from '@/config/database';
import { logger } from '@/utils/logger';
import { Request } from 'express';

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_DURATION_MINUTES = 30;

export class AccountSecurityService {
  /**
   * Record a login attempt
   */
  static async recordLoginAttempt(
    email: string,
    success: boolean,
    failureReason?: string,
    req?: Request
  ): Promise<void> {
    try {
      const ipAddress = this.getClientIP(req);
      const userAgent = req?.headers['user-agent'] || 'unknown';

      await pool.query(
        `INSERT INTO login_attempts (email, ip_address, success, failure_reason, user_agent)
         VALUES ($1, $2, $3, $4, $5)`,
        [email, ipAddress, success, failureReason || null, userAgent]
      );

      if (success) {
        // Reset failed attempts on successful login
        const userResult = await pool.query(
          `SELECT id FROM users WHERE email = $1`,
          [email]
        );

        if (userResult.rows.length > 0) {
          await pool.query(
            `UPDATE users SET failed_login_attempts = 0, last_login = NOW(), last_login_ip = $1
             WHERE id = $2`,
            [ipAddress, userResult.rows[0].id]
          );
        }
      } else {
        // Increment failed attempts
        const userResult = await pool.query(
          `SELECT id, failed_login_attempts FROM users WHERE email = $1`,
          [email]
        );

        if (userResult.rows.length > 0) {
          const userId = userResult.rows[0].id;
          const failedAttempts = (userResult.rows[0].failed_login_attempts || 0) + 1;

          if (failedAttempts >= MAX_FAILED_ATTEMPTS) {
            // Lock account
            await this.lockAccount(userId, 'too_many_failed_attempts');
          } else {
            await pool.query(
              `UPDATE users SET failed_login_attempts = $1 WHERE id = $2`,
              [failedAttempts, userId]
            );
          }
        }
      }

      logger.info(`✓ Login attempt recorded for ${email} (success: ${success})`);
    } catch (error: any) {
      logger.error('Record login attempt error:', error.message);
      // Don't throw - continue with login process
    }
  }

  /**
   * Check if account is locked
   */
  static async isAccountLocked(userId: string): Promise<boolean> {
    try {
      const result = await pool.query(
        `SELECT account_locked, account_locked_until FROM users WHERE id = $1`,
        [userId]
      );

      if (result.rows.length === 0) {
        return false;
      }

      const { account_locked, account_locked_until } = result.rows[0];

      if (!account_locked) {
        return false;
      }

      // Check if lockout has expired
      if (account_locked_until && new Date(account_locked_until) < new Date()) {
        // Unlock account
        await pool.query(
          `UPDATE users SET account_locked = FALSE, account_locked_until = NULL WHERE id = $1`,
          [userId]
        );
        return false;
      }

      return true;
    } catch (error: any) {
      logger.error('Check account locked error:', error.message);
      return true; // Fail secure
    }
  }

  /**
   * Lock account (due to too many failed attempts or suspicious activity)
   */
  static async lockAccount(userId: string, reason: string, lockedBy?: string): Promise<void> {
    try {
      const lockedUntil = new Date();
      lockedUntil.setMinutes(lockedUntil.getMinutes() + LOCKOUT_DURATION_MINUTES);

      await pool.query(
        `UPDATE users
         SET account_locked = TRUE, account_locked_until = $1
         WHERE id = $2`,
        [lockedUntil, userId]
      );

      await pool.query(
        `INSERT INTO account_lockouts (user_id, reason, locked_until, created_by)
         VALUES ($1, $2, $3, $4)`,
        [userId, reason, lockedUntil, lockedBy || null]
      );

      logger.warn(`⚠ Account locked for user ${userId} (reason: ${reason})`);
    } catch (error: any) {
      logger.error('Lock account error:', error.message);
      throw new Error('Failed to lock account');
    }
  }

  /**
   * Unlock account (admin action)
   */
  static async unlockAccount(userId: string, unlockedBy: string): Promise<void> {
    try {
      await pool.query(
        `UPDATE users
         SET account_locked = FALSE, account_locked_until = NULL, failed_login_attempts = 0
         WHERE id = $1`,
        [userId]
      );

      logger.info(`✓ Account unlocked for user ${userId} by ${unlockedBy}`);
    } catch (error: any) {
      logger.error('Unlock account error:', error.message);
      throw new Error('Failed to unlock account');
    }
  }

  /**
   * Track suspicious activity
   */
  static async logSecurityEvent(
    eventType: string,
    severity: 'low' | 'medium' | 'high' | 'critical',
    description: string,
    userId?: string,
    ipAddress?: string,
    email?: string
  ): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO security_events (event_type, severity, description, user_id, ip_address, email)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [eventType, severity, description, userId || null, ipAddress || null, email || null]
      );

      logger.warn(`⚠ Security event: ${eventType} (${severity}) - ${description}`);
    } catch (error: any) {
      logger.error('Log security event error:', error.message);
    }
  }

  /**
   * Get login history for user
   */
  static async getLoginHistory(userId: string, limit: number = 20) {
    try {
      // Get user email first
      const userResult = await pool.query(
        `SELECT email FROM users WHERE id = $1`,
        [userId]
      );

      if (userResult.rows.length === 0) {
        return [];
      }

      const email = userResult.rows[0].email;

      const result = await pool.query(
        `SELECT ip_address, success, failure_reason, created_at
         FROM login_attempts
         WHERE email = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [email, limit]
      );

      return result.rows;
    } catch (error: any) {
      logger.error('Get login history error:', error.message);
      throw new Error('Failed to fetch login history');
    }
  }

  /**
   * Detect suspicious login patterns
   */
  static async detectSuspiciousActivity(userId: string, email: string, ipAddress: string): Promise<boolean> {
    try {
      // Check for multiple failed attempts from different IPs
      const recentFailures = await pool.query(
        `SELECT COUNT(DISTINCT ip_address) as unique_ips
         FROM login_attempts
         WHERE email = $1 AND success = FALSE AND created_at > NOW() - INTERVAL '1 hour'`,
        [email]
      );

      if (recentFailures.rows[0].unique_ips >= 3) {
        await this.logSecurityEvent(
          'multiple_failed_attempts',
          'high',
          `Multiple failed login attempts from different IPs in the last hour`,
          userId,
          ipAddress,
          email
        );
        return true;
      }

      // Check for rapid successive attempts
      const rapidAttempts = await pool.query(
        `SELECT COUNT(*) as count
         FROM login_attempts
         WHERE email = $1 AND created_at > NOW() - INTERVAL '5 minutes'`,
        [email]
      );

      if (rapidAttempts.rows[0].count >= 5) {
        await this.logSecurityEvent(
          'brute_force_attempt',
          'critical',
          `Potential brute force attack detected`,
          userId,
          ipAddress,
          email
        );
        return true;
      }

      return false;
    } catch (error: any) {
      logger.error('Detect suspicious activity error:', error.message);
      return false;
    }
  }

  /**
   * Enforce password history (prevent reuse)
   */
  static async addToPasswordHistory(userId: string, passwordHash: string): Promise<void> {
    try {
      // Keep last 5 passwords
      await pool.query(
        `INSERT INTO password_history (user_id, password_hash) VALUES ($1, $2)`,
        [userId, passwordHash]
      );

      // Delete old entries
      await pool.query(
        `DELETE FROM password_history
         WHERE user_id = $1
         AND id NOT IN (
           SELECT id FROM password_history
           WHERE user_id = $1
           ORDER BY created_at DESC
           LIMIT 5
         )`,
        [userId]
      );

      logger.info(`✓ Password history updated for user ${userId}`);
    } catch (error: any) {
      logger.error('Add password history error:', error.message);
    }
  }

  /**
   * Check if password was recently used
   */
  static async isPasswordRecentlyUsed(userId: string, passwordHash: string): Promise<boolean> {
    try {
      const result = await pool.query(
        `SELECT COUNT(*) as count FROM password_history
         WHERE user_id = $1 AND password_hash = $2
         AND created_at > NOW() - INTERVAL '90 days'`,
        [userId, passwordHash]
      );

      return result.rows[0].count > 0;
    } catch (error: any) {
      logger.error('Check password history error:', error.message);
      return false;
    }
  }

  /**
   * Get security events for user
   */
  static async getSecurityEvents(userId: string, limit: number = 50) {
    try {
      const result = await pool.query(
        `SELECT * FROM security_events
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [userId, limit]
      );

      return result.rows;
    } catch (error: any) {
      logger.error('Get security events error:', error.message);
      throw new Error('Failed to fetch security events');
    }
  }

  /**
   * Get client IP from request
   */
  private static getClientIP(req?: Request): string {
    if (!req) return 'unknown';

    return (
      (req.headers['x-forwarded-for'] as string)?.split(',')[0].trim() ||
      (req.socket.remoteAddress as string) ||
      'unknown'
    );
  }
}
