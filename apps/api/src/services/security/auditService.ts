import { pool } from '@/config/database';
import { EncryptionService } from './encryptionService';
import { logger } from '@/utils/logger';
import { Request } from 'express';

export interface AuditLogEntry {
  userId?: string;
  action: string;
  resourceType: string;
  resourceId?: string;
  changeSummary?: string;
  status: 'success' | 'failure';
  errorMessage?: string;
  ipAddress?: string;
  userAgent?: string;
  metadata?: any;
}

export class AuditService {
  /**
   * Log an action to audit trail
   */
  static async log(entry: AuditLogEntry, req?: Request): Promise<string> {
    try {
      const ipAddress = this.getClientIP(req);
      const userAgent = req?.headers['user-agent'] || 'unknown';

      // Mask sensitive data in change summary
      const maskedSummary = entry.changeSummary
        ? EncryptionService.maskSensitiveData(JSON.parse(entry.changeSummary))
        : null;

      const result = await pool.query(
        `INSERT INTO audit_logs
         (user_id, action, resource_type, resource_id, change_summary, status, error_message, ip_address, user_agent, metadata)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
         RETURNING id`,
        [
          entry.userId || null,
          entry.action,
          entry.resourceType,
          entry.resourceId || null,
          maskedSummary ? JSON.stringify(maskedSummary) : entry.changeSummary,
          entry.status,
          entry.errorMessage || null,
          ipAddress,
          userAgent,
          entry.metadata ? JSON.stringify(entry.metadata) : null,
        ]
      );

      const logId = result.rows[0].id;
      logger.info(`✓ Audit log created: ${entry.action} (${logId})`);

      return logId;
    } catch (error: any) {
      logger.error('Audit log error:', error.message);
      // Don't throw - audit logging should not break the application
      return '';
    }
  }

  /**
   * Get audit logs for user
   */
  static async getAuditLogsForUser(userId: string, limit: number = 50, offset: number = 0) {
    try {
      const result = await pool.query(
        `SELECT * FROM audit_logs
         WHERE user_id = $1
         ORDER BY created_at DESC
         LIMIT $2 OFFSET $3`,
        [userId, limit, offset]
      );

      const countResult = await pool.query(
        `SELECT COUNT(*) as total FROM audit_logs WHERE user_id = $1`,
        [userId]
      );

      return {
        logs: result.rows,
        total: parseInt(countResult.rows[0].total, 10),
        limit,
        offset,
      };
    } catch (error: any) {
      logger.error('Get audit logs error:', error.message);
      throw new Error('Failed to fetch audit logs');
    }
  }

  /**
   * Get audit logs for resource
   */
  static async getAuditLogsForResource(resourceType: string, resourceId: string, limit: number = 50) {
    try {
      const result = await pool.query(
        `SELECT * FROM audit_logs
         WHERE resource_type = $1 AND resource_id = $2
         ORDER BY created_at DESC
         LIMIT $3`,
        [resourceType, resourceId, limit]
      );

      return result.rows;
    } catch (error: any) {
      logger.error('Get resource audit logs error:', error.message);
      throw new Error('Failed to fetch audit logs');
    }
  }

  /**
   * Get recent audit logs (admin view)
   */
  static async getRecentAuditLogs(limit: number = 100, offset: number = 0) {
    try {
      const result = await pool.query(
        `SELECT * FROM audit_logs
         ORDER BY created_at DESC
         LIMIT $1 OFFSET $2`,
        [limit, offset]
      );

      const countResult = await pool.query(`SELECT COUNT(*) as total FROM audit_logs`);

      return {
        logs: result.rows,
        total: parseInt(countResult.rows[0].total, 10),
        limit,
        offset,
      };
    } catch (error: any) {
      logger.error('Get recent audit logs error:', error.message);
      throw new Error('Failed to fetch audit logs');
    }
  }

  /**
   * Search audit logs
   */
  static async searchAuditLogs(
    action?: string,
    resourceType?: string,
    status?: string,
    startDate?: Date,
    endDate?: Date,
    limit: number = 50
  ) {
    try {
      let query = `SELECT * FROM audit_logs WHERE 1=1`;
      const params: any[] = [];

      if (action) {
        query += ` AND action = $${params.length + 1}`;
        params.push(action);
      }

      if (resourceType) {
        query += ` AND resource_type = $${params.length + 1}`;
        params.push(resourceType);
      }

      if (status) {
        query += ` AND status = $${params.length + 1}`;
        params.push(status);
      }

      if (startDate) {
        query += ` AND created_at >= $${params.length + 1}`;
        params.push(startDate);
      }

      if (endDate) {
        query += ` AND created_at <= $${params.length + 1}`;
        params.push(endDate);
      }

      query += ` ORDER BY created_at DESC LIMIT $${params.length + 1}`;
      params.push(limit);

      const result = await pool.query(query, params);

      return result.rows;
    } catch (error: any) {
      logger.error('Search audit logs error:', error.message);
      throw new Error('Failed to search audit logs');
    }
  }

  /**
   * Common helper: log user authentication
   */
  static async logAuthEvent(
    userId: string | undefined,
    email: string,
    success: boolean,
    reason?: string,
    req?: Request
  ) {
    return this.log({
      userId,
      action: success ? 'user_login' : 'user_login_failed',
      resourceType: 'user',
      resourceId: userId || email,
      status: success ? 'success' : 'failure',
      errorMessage: reason,
    }, req);
  }

  /**
   * Log resource change
   */
  static async logResourceChange(
    userId: string,
    action: string,
    resourceType: string,
    resourceId: string,
    changeSummary: any,
    req?: Request
  ) {
    return this.log({
      userId,
      action,
      resourceType,
      resourceId,
      changeSummary: typeof changeSummary === 'string' ? changeSummary : JSON.stringify(changeSummary),
      status: 'success',
    }, req);
  }

  /**
   * Get client IP address from request
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
