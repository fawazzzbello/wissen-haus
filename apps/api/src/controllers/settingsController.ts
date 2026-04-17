import { Request, Response } from 'express';
import { getAllSettings, getSetting, updateSetting, ensureSettingsTable } from '@/services/settingsService';
import { logger } from '@/utils/logger';

// Get all site settings
export async function getAllSiteSettings(req: Request, res: Response) {
  try {
    await ensureSettingsTable();
    const settings = await getAllSettings();
    res.json({ settings });
  } catch (error: any) {
    logger.error('Get all settings error:', error);
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
}

// Get specific setting
export async function getSiteSettings(req: Request, res: Response) {
  try {
    const { key } = req.params;
    const value = await getSetting(key);

    if (value === null) {
      return res.status(404).json({ error: 'Setting not found' });
    }

    res.json({ setting: { key, value } });
  } catch (error: any) {
    logger.error('Get setting error:', error);
    res.status(500).json({ error: 'Failed to fetch setting' });
  }
}

// Update site setting (admin)
export async function updateSiteSettings(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { key } = req.params;
    const { value } = req.body;

    if (!key || value === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const success = await updateSetting(key, value, req.user.userId);

    if (!success) {
      return res.status(500).json({ error: 'Failed to update setting' });
    }

    res.json({ setting: { key, value }, message: 'Setting updated successfully' });
  } catch (error: any) {
    logger.error('Update setting error:', error);
    res.status(500).json({ error: 'Failed to update setting' });
  }
}

// Bulk update settings (admin)
export async function bulkUpdateSettings(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const updates = req.body; // { key: value, ... }

    const results = [];
    for (const [key, value] of Object.entries(updates)) {
      const success = await updateSetting(key, String(value), req.user.userId);
      results.push({ key, success });
    }

    const allSuccess = results.every(r => r.success);
    res.json({
      results,
      message: allSuccess ? 'All settings updated successfully' : 'Some settings failed to update',
    });
  } catch (error: any) {
    logger.error('Bulk update settings error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
}
