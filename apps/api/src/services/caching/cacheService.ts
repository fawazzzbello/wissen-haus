import { getRedis } from '@/config/redis';
import { logger } from '@/utils/logger';
import { pool } from '@/config/database';

export class CacheService {
  /**
   * Get value from cache
   */
  static async get<T>(key: string): Promise<T | null> {
    try {
      const redis = await getRedis();
      if (!redis) return null;

      const value = await redis.get(key);
      if (value) {
        logger.debug(`✓ Cache hit: ${key}`);
        await this.recordCacheHit(key);
        return JSON.parse(value) as T;
      }
      await this.recordCacheMiss(key);
      return null;
    } catch (error: any) {
      logger.warn(`Cache get error (${key}):`, error.message);
      return null;
    }
  }

  /**
   * Set value in cache with TTL
   */
  static async set<T>(key: string, value: T, ttlSeconds: number = 3600): Promise<void> {
    try {
      const redis = await getRedis();
      if (!redis) return;

      await redis.setEx(key, ttlSeconds, JSON.stringify(value));
      logger.debug(`✓ Cache set: ${key} (TTL: ${ttlSeconds}s)`);
      await this.recordCacheSize(key, JSON.stringify(value).length, ttlSeconds);
    } catch (error: any) {
      logger.warn(`Cache set error (${key}):`, error.message);
    }
  }

  /**
   * Delete from cache
   */
  static async delete(key: string): Promise<void> {
    try {
      const redis = await getRedis();
      if (!redis) return;

      await redis.del(key);
      logger.debug(`✓ Cache deleted: ${key}`);
    } catch (error: any) {
      logger.warn(`Cache delete error (${key}):`, error.message);
    }
  }

  /**
   * Delete multiple keys by pattern
   */
  static async deletePattern(pattern: string): Promise<number> {
    try {
      const redis = await getRedis();
      if (!redis) return 0;

      const keys = await redis.keys(pattern);
      if (keys.length === 0) return 0;

      await redis.del(keys);
      logger.debug(`✓ Deleted ${keys.length} cache entries matching ${pattern}`);
      return keys.length;
    } catch (error: any) {
      logger.warn(`Cache pattern delete error (${pattern}):`, error.message);
      return 0;
    }
  }

  /**
   * Clear all cache
   */
  static async clear(): Promise<void> {
    try {
      const redis = await getRedis();
      if (!redis) return;

      await redis.flushDb();
      logger.info('✓ Cache cleared');
    } catch (error: any) {
      logger.warn('Cache clear error:', error.message);
    }
  }

  /**
   * Get or set - fetch from cache or compute and cache
   */
  static async getOrSet<T>(
    key: string,
    compute: () => Promise<T>,
    ttlSeconds: number = 3600
  ): Promise<T> {
    try {
      // Try cache first
      const cached = await this.get<T>(key);
      if (cached !== null) {
        return cached;
      }

      // Compute and cache
      const value = await compute();
      await this.set(key, value, ttlSeconds);
      return value;
    } catch (error: any) {
      logger.error(`Cache getOrSet error (${key}):`, error.message);
      // If cache fails, still return computed value
      return await compute();
    }
  }

  /**
   * Cache invalidation helpers
   */

  /**
   * Invalidate campaign stats cache
   */
  static async invalidateCampaignCache(campaignId: string): Promise<void> {
    await this.deletePattern(`campaign:${campaignId}:*`);
    await this.deletePattern('campaigns:list:*');
  }

  /**
   * Invalidate user stats cache
   */
  static async invalidateUserCache(userId: string): Promise<void> {
    await this.deletePattern(`user:${userId}:*`);
  }

  /**
   * Invalidate donation stats
   */
  static async invalidateDonationStats(): Promise<void> {
    await this.deletePattern('donations:stats:*');
    await this.deletePattern('campaigns:stats:*');
  }

  /**
   * Get cache statistics
   */
  static async getStats(): Promise<any> {
    try {
      const redis = await getRedis();
      if (!redis) return {};

      const info = await redis.info('stats');
      const keys = await redis.keys('*');

      return {
        totalKeys: keys.length,
        info: info,
        timestamp: new Date(),
      };
    } catch (error: any) {
      logger.error('Get cache stats error:', error.message);
      return {};
    }
  }

  /**
   * Warm cache with common queries
   */
  static async warmCache(): Promise<void> {
    try {
      logger.info('Warming cache...');

      // Cache campaign list
      const campaigns = await pool.query(
        `SELECT id, name, goal_amount_cents, current_amount_cents, status
         FROM donation_campaigns WHERE status IN ('active', 'paused')
         ORDER BY created_at DESC LIMIT 20`
      );
      await this.set('campaigns:list:active', campaigns.rows, 3600);

      // Cache donor stats
      const donorStats = await pool.query(
        `SELECT COUNT(*) as total, SUM(amount_cents) as total_raised
         FROM donations WHERE status = 'completed'`
      );
      await this.set('donations:stats:total', donorStats.rows[0], 3600);

      logger.info('✓ Cache warmed successfully');
    } catch (error: any) {
      logger.error('Cache warming error:', error.message);
    }
  }

  /**
   * Record cache hit in database for analytics
   */
  private static async recordCacheHit(key: string): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO cache_statistics (cache_key, hit_count, miss_count)
         VALUES ($1, 1, 0)
         ON CONFLICT (cache_key) DO UPDATE
         SET hit_count = cache_statistics.hit_count + 1,
             updated_at = NOW()`,
        [key]
      );
    } catch (error: any) {
      // Silent fail for analytics
    }
  }

  /**
   * Record cache miss in database for analytics
   */
  private static async recordCacheMiss(key: string): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO cache_statistics (cache_key, hit_count, miss_count)
         VALUES ($1, 0, 1)
         ON CONFLICT (cache_key) DO UPDATE
         SET miss_count = cache_statistics.miss_count + 1,
             updated_at = NOW()`,
        [key]
      );
    } catch (error: any) {
      // Silent fail for analytics
    }
  }

  /**
   * Record cache size for monitoring
   */
  private static async recordCacheSize(key: string, sizeBytes: number, ttlSeconds: number): Promise<void> {
    try {
      await pool.query(
        `INSERT INTO cache_statistics (cache_key, size_bytes, ttl_seconds)
         VALUES ($1, $2, $3)
         ON CONFLICT (cache_key) DO UPDATE
         SET size_bytes = $2,
             ttl_seconds = $3,
             updated_at = NOW()`,
        [key, sizeBytes, ttlSeconds]
      );
    } catch (error: any) {
      // Silent fail for analytics
    }
  }
}
