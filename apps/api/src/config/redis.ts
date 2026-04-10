import { createClient } from 'redis';
import { logger } from '@/utils/logger';

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

let redisClient: ReturnType<typeof createClient> | null = null;

async function initializeRedis() {
  if (redisClient) {
    return redisClient;
  }

  try {
    redisClient = createClient({
      url: REDIS_URL,
      socket: {
        reconnectStrategy: (retries: number) => {
          if (retries > 10) {
            logger.error('Redis max retries reached, stopping');
            return new Error('Redis max retries reached');
          }
          return Math.min(retries * 50, 500);
        },
      },
    });

    redisClient.on('error', (err: any) => {
      logger.error('Redis Client Error:', err);
    });

    redisClient.on('connect', () => {
      logger.info('✓ Redis connected');
    });

    await redisClient.connect();
    return redisClient;
  } catch (error: any) {
    logger.error('Failed to initialize Redis:', error.message);
    logger.warn('⚠ Redis is optional - caching will be disabled');
    return null;
  }
}

export async function getRedis() {
  if (!redisClient) {
    await initializeRedis();
  }
  return redisClient;
}

export { redisClient as redis };
