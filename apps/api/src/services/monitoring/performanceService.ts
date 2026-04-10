import { pool } from '@/config/database';
import { logger } from '@/utils/logger';
import { Request, Response } from 'express';

export class PerformanceService {
  /**
   * Record API request performance
   */
  static async recordRequest(
    req: Request,
    res: Response,
    responseTimeMs: number,
    dbQueryCount: number = 0,
    cacheHit: boolean = false
  ): Promise<void> {
    try {
      const statusCode = res.statusCode;
      const endpoint = req.path;
      const method = req.method;

      await pool.query(
        `INSERT INTO performance_metrics
         (endpoint, method, response_time_ms, status_code, db_query_count, cache_hit, user_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          endpoint,
          method,
          responseTimeMs,
          statusCode,
          dbQueryCount,
          cacheHit,
          (req as any).user?.userId || null,
        ]
      );

      // Alert on slow requests
      if (responseTimeMs > 5000) {
        logger.warn(
          `⚠ Slow request: ${method} ${endpoint} (${responseTimeMs}ms)`
        );
      }
    } catch (error: any) {
      logger.debug('Record performance error:', error.message);
    }
  }

  /**
   * Record slow query
   */
  static async recordSlowQuery(
    queryText: string,
    executionTimeMs: number
  ): Promise<void> {
    try {
      if (executionTimeMs < 1000) return; // Only record queries over 1 second

      const queryHash = this.hashQuery(queryText);

      await pool.query(
        `INSERT INTO slow_queries (query_hash, query_text, execution_time_ms, execution_count, last_executed)
         VALUES ($1, $2, $3, 1, NOW())
         ON CONFLICT (query_hash) DO UPDATE
         SET execution_count = slow_queries.execution_count + 1,
             last_executed = NOW(),
             execution_time_ms = GREATEST(slow_queries.execution_time_ms, $3)`,
        [queryHash, queryText.substring(0, 1000), executionTimeMs]
      );

      logger.warn(`⚠ Slow query detected: ${executionTimeMs}ms`);
    } catch (error: any) {
      logger.debug('Record slow query error:', error.message);
    }
  }

  /**
   * Get endpoint performance statistics
   */
  static async getEndpointStats(endpoint: string, hoursBack: number = 24) {
    try {
      const result = await pool.query(
        `SELECT
          endpoint,
          ROUND(AVG(response_time_ms)::NUMERIC, 2) as avg_response_time_ms,
          MIN(response_time_ms) as min_response_time_ms,
          MAX(response_time_ms) as max_response_time_ms,
          COUNT(*) as request_count,
          COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count,
          ROUND((COUNT(CASE WHEN cache_hit THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100), 2) as cache_hit_rate
         FROM performance_metrics
         WHERE endpoint = $1
           AND created_at > NOW() - (INTERVAL '1 hour' * $2)
         GROUP BY endpoint`,
        [endpoint, hoursBack]
      );

      return result.rows[0] || null;
    } catch (error: any) {
      logger.error('Get endpoint stats error:', error.message);
      return null;
    }
  }

  /**
   * Get slowest endpoints
   */
  static async getSlowestEndpoints(minAvgMs: number = 500, hoursBack: number = 24) {
    try {
      const result = await pool.query(
        `SELECT
          endpoint,
          method,
          ROUND(AVG(response_time_ms)::NUMERIC, 2) as avg_response_time_ms,
          COUNT(*) as request_count
         FROM performance_metrics
         WHERE created_at > NOW() - (INTERVAL '1 hour' * $1)
         GROUP BY endpoint, method
         HAVING AVG(response_time_ms) > $2
         ORDER BY AVG(response_time_ms) DESC
         LIMIT 20`,
        [hoursBack, minAvgMs]
      );

      return result.rows;
    } catch (error: any) {
      logger.error('Get slowest endpoints error:', error.message);
      return [];
    }
  }

  /**
   * Get slowest queries
   */
  static async getSlowestQueries(limit: number = 10) {
    try {
      const result = await pool.query(
        `SELECT
          query_hash,
          query_text,
          execution_time_ms,
          execution_count,
          last_executed,
          is_indexed
         FROM slow_queries
         ORDER BY execution_time_ms DESC
         LIMIT $1`,
        [limit]
      );

      return result.rows;
    } catch (error: any) {
      logger.error('Get slowest queries error:', error.message);
      return [];
    }
  }

  /**
   * Get error rate by endpoint
   */
  static async getErrorRates(hoursBack: number = 24) {
    try {
      const result = await pool.query(
        `SELECT
          endpoint,
          method,
          COUNT(*) as total_requests,
          COUNT(CASE WHEN status_code >= 400 THEN 1 END) as error_count,
          ROUND((COUNT(CASE WHEN status_code >= 400 THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100), 2) as error_rate
         FROM performance_metrics
         WHERE created_at > NOW() - (INTERVAL '1 hour' * $1)
         GROUP BY endpoint, method
         HAVING COUNT(CASE WHEN status_code >= 400 THEN 1 END) > 0
         ORDER BY error_rate DESC`,
        [hoursBack]
      );

      return result.rows;
    } catch (error: any) {
      logger.error('Get error rates error:', error.message);
      return [];
    }
  }

  /**
   * Get cache hit rates
   */
  static async getCacheHitRates(hoursBack: number = 24) {
    try {
      const result = await pool.query(
        `SELECT
          ROUND((COUNT(CASE WHEN cache_hit THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100), 2) as cache_hit_rate,
          COUNT(*) as total_requests,
          COUNT(CASE WHEN cache_hit THEN 1 END) as cache_hits
         FROM performance_metrics
         WHERE created_at > NOW() - (INTERVAL '1 hour' * $1)`,
        [hoursBack]
      );

      return result.rows[0] || null;
    } catch (error: any) {
      logger.error('Get cache hit rate error:', error.message);
      return null;
    }
  }

  /**
   * Get overall system performance summary
   */
  static async getPerformanceSummary(hoursBack: number = 24) {
    try {
      const endpoints = await this.getSlowestEndpoints(100, hoursBack);
      const errors = await this.getErrorRates(hoursBack);
      const cacheStats = await this.getCacheHitRates(hoursBack);
      const slowQueries = await this.getSlowestQueries(5);

      return {
        summary: {
          timeframe: `Last ${hoursBack} hours`,
          timestamp: new Date(),
        },
        slowestEndpoints: endpoints.slice(0, 5),
        errorRates: errors.slice(0, 5),
        cachePerformance: cacheStats,
        slowestQueries: slowQueries,
      };
    } catch (error: any) {
      logger.error('Get performance summary error:', error.message);
      return {};
    }
  }

  /**
   * Hash query for grouping
   */
  private static hashQuery(query: string): string {
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(query).digest('hex');
  }

  /**
   * Clean up old performance data
   */
  static async cleanupOldData(): Promise<void> {
    try {
      const result = await pool.query(
        `DELETE FROM performance_metrics WHERE created_at < NOW() - INTERVAL '90 days'`
      );

      logger.info(`✓ Cleaned up ${result.rowCount} old performance metrics`);
    } catch (error: any) {
      logger.error('Cleanup old data error:', error.message);
    }
  }
}
