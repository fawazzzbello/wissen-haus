import { Request, Response } from 'express';
import { getEmailService } from '@/services/email/emailService';
import { getEmailTemplateService } from '@/services/email/templateService';
import { getEmailQueue } from '@/queue/emailQueue';
import { logger } from '@/utils/logger';

/**
 * Email Controller
 * Handles email management and campaign endpoints
 */

/**
 * POST /api/emails/send
 * Send a custom email
 */
export async function sendEmail(req: Request, res: Response) {
  try {
    const { to, toName, subject, html, text, templateName, templateVariables, priority } = req.body;

    if (!to || (!subject && !templateName)) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: to, and either subject or templateName',
      });
    }

    const emailService = getEmailService();
    const emailId = await emailService.sendTemplatedEmail({
      to,
      toName,
      subject,
      html,
      text,
      templateName,
      templateVariables,
      priority: priority as 'high' | 'normal' | 'low',
    });

    res.json({
      success: true,
      data: {
        emailId,
        recipient: to,
        status: 'queued',
      },
    });
  } catch (error: any) {
    logger.error('Send email error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to send email',
      message: error.message,
    });
  }
}

/**
 * GET /api/emails/templates
 * List all email templates
 */
export async function listTemplates(req: Request, res: Response) {
  try {
    const { category } = req.query;
    const templateService = getEmailTemplateService();
    const templates = await templateService.listTemplates(category as string | undefined);

    res.json({
      success: true,
      data: templates,
    });
  } catch (error: any) {
    logger.error('List templates error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to list templates',
      message: error.message,
    });
  }
}

/**
 * GET /api/emails/templates/:name
 * Get a specific template
 */
export async function getTemplate(req: Request, res: Response) {
  try {
    const { name } = req.params;
    const templateService = getEmailTemplateService();
    const template = await templateService.getTemplate(name);

    if (!template) {
      return res.status(404).json({
        success: false,
        error: `Template not found: ${name}`,
      });
    }

    res.json({
      success: true,
      data: template,
    });
  } catch (error: any) {
    logger.error('Get template error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get template',
      message: error.message,
    });
  }
}

/**
 * POST /api/emails/templates
 * Create a new email template
 */
export async function createTemplate(req: Request, res: Response) {
  try {
    const { name, subject, htmlTemplate, templateVariables, textTemplate, description, category } =
      req.body;

    if (!name || !subject || !htmlTemplate || !templateVariables) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: name, subject, htmlTemplate, templateVariables',
      });
    }

    const templateService = getEmailTemplateService();
    const template = await templateService.createTemplate(
      name,
      subject,
      htmlTemplate,
      templateVariables,
      textTemplate,
      description,
      category
    );

    res.status(201).json({
      success: true,
      data: template,
    });
  } catch (error: any) {
    logger.error('Create template error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create template',
      message: error.message,
    });
  }
}

/**
 * GET /api/emails/queue/stats
 * Get email queue statistics
 */
export async function getQueueStats(req: Request, res: Response) {
  try {
    const queue = getEmailQueue();
    const stats = await queue.getStats();

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    logger.error('Get queue stats error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get queue stats',
      message: error.message,
    });
  }
}

/**
 * POST /api/emails/queue/clear-failed
 * Clear failed email jobs from queue
 */
export async function clearFailedEmails(req: Request, res: Response) {
  try {
    const queue = getEmailQueue();
    const cleared = await queue.clearFailed();

    res.json({
      success: true,
      data: {
        cleared,
        message: `Cleared ${cleared} failed email jobs`,
      },
    });
  } catch (error: any) {
    logger.error('Clear failed emails error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to clear failed emails',
      message: error.message,
    });
  }
}

/**
 * POST /api/emails/queue/cleanup
 * Clean old completed email jobs
 */
export async function cleanupQueue(req: Request, res: Response) {
  try {
    const { maxAgeHours = 24 } = req.body;
    const maxAge = maxAgeHours * 3600000; // Convert hours to milliseconds

    const queue = getEmailQueue();
    const cleaned = await queue.cleanOldJobs(maxAge);

    res.json({
      success: true,
      data: {
        cleaned,
        message: `Cleaned ${cleaned} old email jobs`,
      },
    });
  } catch (error: any) {
    logger.error('Cleanup queue error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to cleanup queue',
      message: error.message,
    });
  }
}

/**
 * POST /api/emails/send-bulk
 * Send emails to multiple recipients
 */
export async function sendBulkEmails(req: Request, res: Response) {
  try {
    const { emails } = req.body;

    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid field: emails (must be non-empty array)',
      });
    }

    const emailService = getEmailService();
    const emailIds = await emailService.sendBatch(emails);

    res.json({
      success: true,
      data: {
        sent: emailIds.length,
        total: emails.length,
        emailIds,
        status: 'queued',
      },
    });
  } catch (error: any) {
    logger.error('Send bulk emails error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to send bulk emails',
      message: error.message,
    });
  }
}

/**
 * POST /api/emails/test-smtp
 * Test SMTP configuration
 */
export async function testSMTP(req: Request, res: Response) {
  try {
    // Get appropriate service and test
    const emailService = getEmailService();

    // Send test email
    const testEmail = await emailService.sendRawEmail(
      process.env.ADMIN_EMAIL || 'admin@wissen-haus.org',
      '[Test] SMTP Configuration',
      '<p>This is a test email from Wissen-Haus.</p>',
      'This is a test email from Wissen-Haus.'
    );

    res.json({
      success: true,
      data: {
        message: 'Test email queued',
        emailId: testEmail,
        recipient: process.env.ADMIN_EMAIL || 'admin@wissen-haus.org',
      },
    });
  } catch (error: any) {
    logger.error('Test SMTP error:', error.message);
    res.status(500).json({
      success: false,
      error: 'SMTP test failed',
      message: error.message,
    });
  }
}
