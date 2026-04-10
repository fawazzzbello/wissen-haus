import { pool } from '@/config/database';
import { getRedis } from '@/config/redis';
import { logger } from '@/utils/logger';
import axios from 'axios';

export interface HealthStatus {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  responseTimeMs: number;
  message?: string;
  details?: any;
}

export class HealthCheckService {
  /**
   * Check database connectivity
   */
  static async checkDatabase(): Promise<HealthStatus> {
    const startTime = Date.now();
    try {
      const result = await pool.query('SELECT NOW()');
      const responseTimeMs = Date.now() - startTime;

      const status: HealthStatus = {
        name: 'database',
        status: 'healthy',
        responseTimeMs,
        message: 'Database connection successful',
      };

      await this.recordHealthCheck(status);
      return status;
    } catch (error: any) {
      const responseTimeMs = Date.now() - startTime;

      const status: HealthStatus = {
        name: 'database',
        status: 'unhealthy',
        responseTimeMs,
        message: error.message,
      };

      await this.recordHealthCheck(status);
      return status;
    }
  }

  /**
   * Check Redis connectivity
   */
  static async checkRedis(): Promise<HealthStatus> {
    const startTime = Date.now();
    try {
      const redis = await getRedis();
      const responseTimeMs = Date.now() - startTime;

      if (!redis) {
        const status: HealthStatus = {
          name: 'redis',
          status: 'unhealthy',
          responseTimeMs,
          message: 'Redis not initialized',
        };
        await this.recordHealthCheck(status);
        return status;
      }

      await redis.ping();

      const status: HealthStatus = {
        name: 'redis',
        status: 'healthy',
        responseTimeMs,
        message: 'Redis connection successful',
      };

      await this.recordHealthCheck(status);
      return status;
    } catch (error: any) {
      const responseTimeMs = Date.now() - startTime;

      const status: HealthStatus = {
        name: 'redis',
        status: 'unhealthy',
        responseTimeMs,
        message: error.message,
      };

      await this.recordHealthCheck(status);
      return status;
    }
  }

  /**
   * Check database connection pool status
   */
  static async checkDatabasePool(): Promise<HealthStatus> {
    try {
      const client = await pool.connect();
      const responseTimeMs = 0;

      client.release();

      const status: HealthStatus = {
        name: 'database_pool',
        status: 'healthy',
        responseTimeMs,
        message: 'Connection pool operational',
        details: {
          availableConnections: pool.totalCount - pool.waitingCount,
          totalConnections: pool.totalCount,
        },
      };

      await this.recordHealthCheck(status);
      return status;
    } catch (error: any) {
      const status: HealthStatus = {
        name: 'database_pool',
        status: 'unhealthy',
        responseTimeMs: 0,
        message: error.message,
      };

      await this.recordHealthCheck(status);
      return status;
    }
  }

  /**
   * Check external service (e.g., payment gateway)
   */
  static async checkExternalService(
    serviceName: string,
    url: string,
    timeout: number = 5000
  ): Promise<HealthStatus> {
    const startTime = Date.now();
    try {
      await axios.get(url, { timeout });
      const responseTimeMs = Date.now() - startTime;

      const status: HealthStatus = {
        name: serviceName,
        status: 'healthy',
        responseTimeMs,
        message: `${serviceName} is responding`,
      };

      await this.recordHealthCheck(status);
      return status;
    } catch (error: any) {
      const responseTimeMs = Date.now() - startTime;

      const status: HealthStatus = {
        name: serviceName,
        status: 'unhealthy',
        responseTimeMs,
        message: error.message,
      };

      await this.recordHealthCheck(status);
      return status;
    }
  }

  /**
   * Full system health check
   */
  static async getFullHealthStatus(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    checks: HealthStatus[];
    timestamp: Date;
  }> {
    const checks = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkDatabasePool(),
    ]);

    // Determine overall status
    const hasUnhealthy = checks.some((c) => c.status === 'unhealthy');
    const hasDegraded = checks.some((c) => c.status === 'degraded');

    let overallStatus: 'healthy' | 'degraded' | 'unhealthy';
    if (hasUnhealthy) {
      overallStatus = 'unhealthy';
    } else if (hasDegraded) {
      overallStatus = 'degraded';
    } else {
      overallStatus = 'healthy';
    }

    return {
      status: overallStatus,
      checks,
      timestamp: new Date(),
    };
  }

  /**
   * Check if system is ready (all critical services)
   */
  static async isReady(): Promise<boolean> {
    const status = await this.getFullHealthStatus();
    return status.status !== 'unhealthy';
  }

  /**
   * Record health check in database
   */
  private static async recordHealthCheck(status: HealthStatus): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO health_checks (service_name, status, response_time_ms, error_message, details)
         VALUES ($1, $2, $3, $4, $5)`,
        [
          status.name,
          status.status,
          status.responseTimeMs,
          status.message || null,
          status.details ? JSON.stringify(status.details) : null,
        ]
      );
    } catch (error: any) {
      logger.debug('Record health check error:', error.message);
    }
  }

  /**
   * Get health check history
   */
  static async getHealthHistory(serviceName: string, limit: number = 100) {
    try {
      const result = await pool.query(
        `SELECT * FROM health_checks
         WHERE service_name = $1
         ORDER BY created_at DESC
         LIMIT $2`,
        [serviceName, limit]
      );

      return result.rows;
    } catch (error: any) {
      logger.error('Get health history error:', error.message);
      return [];
    }
  }

  /**
   * Get uptime percentage
   */
  static async getUptimePercentage(serviceName: string, hoursBack: number = 24): Promise<number> {
    try {
      const result = await pool.query(
        `SELECT
          COUNT(CASE WHEN status = 'healthy' THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100 as uptime
         FROM health_checks
         WHERE service_name = $1
           AND created_at > NOW() - (INTERVAL '1 hour' * $2)`,
        [serviceName, hoursBack]
      );

      return result.rows[0]?.uptime || 0;
    } catch (error: any) {
      logger.error('Get uptime error:', error.message);
      return 0;
    }
  }

  /**
   * Get system metrics
   */
  static async getSystemMetrics() {
    try {
      const dbPool = {
        totalConnections: pool.totalCount,
        availableConnections: pool.totalCount - pool.waitingCount,
        waitingRequests: pool.waitingCount,
      };

      const redis = await getRedis();
      let redisInfo = null;
      if (redis) {
        redisInfo = await redis.info();
      }

      return {
        database: dbPool,
        redis: redisInfo,
        timestamp: new Date(),
      };
    } catch (error: any) {
      logger.error('Get system metrics error:', error.message);
      return {};
    }
  }
}
