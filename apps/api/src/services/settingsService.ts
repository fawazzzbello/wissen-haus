import { pool } from '@/config/database';
import { logger } from '@/utils/logger';

export interface SiteSettings {
  [key: string]: string | null;
}

export async function getAllSettings(): Promise<SiteSettings> {
  try {
    const result = await pool.query(
      `SELECT setting_key, setting_value FROM site_settings ORDER BY setting_key`
    );

    const settings: SiteSettings = {};
    result.rows.forEach(row => {
      settings[row.setting_key] = row.setting_value;
    });

    return settings;
  } catch (error: any) {
    logger.error('Error fetching settings:', error);
    return {};
  }
}

export async function getSetting(key: string): Promise<string | null> {
  try {
    const result = await pool.query(
      `SELECT setting_value FROM site_settings WHERE setting_key = $1`,
      [key]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0].setting_value;
  } catch (error: any) {
    logger.error(`Error fetching setting ${key}:`, error);
    return null;
  }
}

export async function updateSetting(key: string, value: string, userId?: string): Promise<boolean> {
  try {
    const result = await pool.query(
      `INSERT INTO site_settings (setting_key, setting_value, updated_by, updated_at)
       VALUES ($1, $2, $3, NOW())
       ON CONFLICT (setting_key) DO UPDATE SET
         setting_value = $2,
         updated_by = $3,
         updated_at = NOW()
       RETURNING id`,
      [key, value, userId || null]
    );

    return result.rows.length > 0;
  } catch (error: any) {
    logger.error(`Error updating setting ${key}:`, error);
    return false;
  }
}

export async function ensureSettingsTable(): Promise<void> {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS site_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        setting_key VARCHAR(100) NOT NULL UNIQUE,
        setting_value TEXT,
        setting_type VARCHAR(50) DEFAULT 'string',
        description TEXT,
        updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS idx_site_settings_key ON site_settings(setting_key);
    `);
  } catch (error: any) {
    logger.warn('Could not create settings table:', error.message);
  }
}
