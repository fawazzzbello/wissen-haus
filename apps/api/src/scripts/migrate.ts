import { initializeDatabase } from '@/config/database';
import { logger } from '@/utils/logger';

async function runMigrations() {
  try {
    logger.info('Running database migrations...');
    await initializeDatabase();
    logger.info('✓ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    logger.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigrations();
