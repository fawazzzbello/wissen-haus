import { Router } from 'express';
import {
  getAllSiteSettings,
  getSiteSettings,
  updateSiteSettings,
  bulkUpdateSettings,
} from '@/controllers/settingsController';
import { authenticate, adminOnly } from '@/middleware/auth';

export const settingsRouter = Router();

// Public routes
settingsRouter.get('/', getAllSiteSettings);
settingsRouter.get('/:key', getSiteSettings);

// Admin routes
settingsRouter.put('/:key', authenticate, adminOnly, updateSiteSettings);
settingsRouter.post('/admin/bulk', authenticate, adminOnly, bulkUpdateSettings);
