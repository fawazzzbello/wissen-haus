import { Pool, PoolClient } from 'pg';
import { logger } from '@/utils/logger';
import fs from 'fs';
import path from 'path';

const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'wissen_haus_db',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
});

pool.on('error', (err) => {
  logger.error('Unexpected error on idle client', err);
  process.exit(-1);
});

export async function initializeDatabase(): Promise<void> {
  const client = await pool.connect();
  try {
    // Read and execute the main schema file
    const schemaPath = path.join(__dirname, '../db/migrations/001_init_schema.sql');
    if (fs.existsSync(schemaPath)) {
      const schema = fs.readFileSync(schemaPath, 'utf-8');
      await client.query(schema);
      logger.info('✓ Main schema initialized');
    }

    // Execute other migration files in order
    const migrationsDir = path.join(__dirname, '../db/migrations');
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
        // Skip if migration already applied
        if (!error.message.includes('already exists')) {
          throw error;
        }
      }
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
