import { Pool, PoolClient } from 'pg';
import { logger } from '@/utils/logger';
import fs from 'fs';
import path from 'path';

// Parse DATABASE_URL (used by Railway) or fall back to individual env vars (used locally)
const getDatabaseConfig = () => {
  if (process.env.DATABASE_URL) {
    // Railway provides DATABASE_URL in format: postgres://user:password@host:port/database
    logger.info('🔗 Using DATABASE_URL configuration (Railway environment)');
    return { connectionString: process.env.DATABASE_URL };
  } else {
    // Local development uses individual variables
    logger.info('🔗 Using individual DB_* configuration (Local development)');
    return {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'wissen_haus_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    };
  }
};

const pool = new Pool(getDatabaseConfig());

pool.on('error', (err) => {
  logger.error('❌ Unexpected error on idle client:', err.message);
  logger.error('Connection details - Host:', getDatabaseConfig().connectionString ? '[DATABASE_URL set]' : getDatabaseConfig().host);
  // Don't exit immediately - let the connection try to reconnect
});

export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    // Read and execute the main schema file
    const schemaPath = path.join(__dirname, '../db/migrations/001_init_schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      try {
        await client.query(schema);
        logger.info('✓ Main schema initialized');
      } catch (error: any) {
        // Skip if schema objects already exist (table, trigger, constraint, etc.)
        const alreadyExistsErrors = [
          'already exists',
          'duplicate key',
          'constraint',
          '42P07', // duplicate table
          '42710', // duplicate trigger
          '42712', // duplicate object
        ];

        const isExpectedError = alreadyExistsErrors.some(err =>
          error.message?.includes(err) || error.code === err.substring(0, 5)
        );

        if (!isExpectedError) {
          throw error;
        }
        logger.info('✓ Main schema already initialized');
      }
    }

    // Execute other migration files in order
    const migrationsDir = path.join(__dirname, '../db/migrations');
    if (fs.existsSync(migrationsDir)) {
      const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql') && f !== '001_init_schema.sql')
        .sort();

      for (const file of files) {
        const filePath = path.join(migrationsDir, file);
        const migration = fs.readFileSync(filePath, 'utf-8');

        try {
          await client.query(migration);
          logger.info(`✓ Migration ${file} executed`);
        } catch (error: any) {
          // Skip expected errors from migrations
          const expectedErrors = [
            'already exists',
            'duplicate',
            'constraint',
            '42P07', // duplicate table
            '42710', // duplicate trigger
            '42712', // duplicate object
          ];

          const isExpectedError = expectedErrors.some(err =>
            error.message?.includes(err) || error.code?.includes(err)
          );

          if (!isExpectedError) {
            // Log the error but continue - tables may already exist from previous deployments
            logger.warn(`⚠ Migration ${file} warning:`, error.message?.substring(0, 100));
          } else {
            logger.info(`⚠ Migration ${file} already applied`);
          }
        }
      }
    } else {
      logger.warn('⚠ Migrations directory not found - skipping database initialization');
    }
  } finally {
    client.release();
  }
}

export async function query(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    logger.debug(`Executed query in ${duration}ms`);
    return result;
  } catch (error) {
    logger.error('Database query error:', error);
    throw error;
  }
}

export async function getClient(): Promise<PoolClient> {
  return pool.connect();
}

export { pool };
