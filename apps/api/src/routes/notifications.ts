import { Router } from 'express';
import {
  getNotificationLogs,
  sendTestEmail,
  sendTestSmsHandler,
  getEmailSettings,
  updateEmailSettings,
  getSmsSettings,
  updateSmsSettings,
} from '@/controllers/notificationController';
import { authenticate, adminOnly } from '@/middleware/auth';

export const notificationRouter = Router();

// Logs
notificationRouter.get('/logs', authenticate, adminOnly, getNotificationLogs);

// Email routes
notificationRouter.get('/email/settings', authenticate, adminOnly, getEmailSettings);
notificationRouter.post('/email/settings', authenticate, adminOnly, updateEmailSettings);
notificationRouter.post('/email/test', authenticate, adminOnly, sendTestEmail);

// SMS routes
notificationRouter.get('/sms/settings', authenticate, adminOnly, getSmsSettings);
notificationRouter.post('/sms/settings', authenticate, adminOnly, updateSmsSettings);
notificationRouter.post('/sms/test', authenticate, adminOnly, sendTestSmsHandler);
