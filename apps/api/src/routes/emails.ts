import { Router } from 'express';
import {
  sendEmail,
  listTemplates,
  getTemplate,
  createTemplate,
  getQueueStats,
  clearFailedEmails,
  cleanupQueue,
  sendBulkEmails,
  testSMTP,
} from '@/controllers/emailController';
import { authMiddleware, adminOnly } from '@/middleware/auth';

const router = Router();

/**
 * Email Management Routes
 * All routes require admin authentication
 */

/**
 * POST /api/emails/send
 * Send a custom or templated email
 */
router.post('/send', authMiddleware, adminOnly, sendEmail);

/**
 * POST /api/emails/send-bulk
 * Send emails to multiple recipients
 */
router.post('/send-bulk', authMiddleware, adminOnly, sendBulkEmails);

/**
 * Email Templates
 */

/**
 * GET /api/emails/templates
 * List all email templates
 * Query: ?category=transaction|campaign|notification|system
 */
router.get('/templates', authMiddleware, adminOnly, listTemplates);

/**
 * GET /api/emails/templates/:name
 * Get a specific template by name
 */
router.get('/templates/:name', authMiddleware, adminOnly, getTemplate);

/**
 * POST /api/emails/templates
 * Create a new email template
 */
router.post('/templates', authMiddleware, adminOnly, createTemplate);

/**
 * Queue Management
 */

/**
 * GET /api/emails/queue/stats
 * Get email queue statistics
 */
router.get('/queue/stats', authMiddleware, adminOnly, getQueueStats);

/**
 * POST /api/emails/queue/clear-failed
 * Clear failed email jobs
 */
router.post('/queue/clear-failed', authMiddleware, adminOnly, clearFailedEmails);

/**
 * POST /api/emails/queue/cleanup
 * Clean old completed email jobs
 * Body: { maxAgeHours: 24 }
 */
router.post('/queue/cleanup', authMiddleware, adminOnly, cleanupQueue);

/**
 * Testing
 */

/**
 * POST /api/emails/test-smtp
 * Send a test email to verify SMTP configuration
 */
router.post('/test-smtp', authMiddleware, adminOnly, testSMTP);

export { router as emailRouter };
