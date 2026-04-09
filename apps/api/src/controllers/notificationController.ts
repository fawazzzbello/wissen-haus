import { Request, Response } from 'express';
import {
  sendEmail,
  sendDonationConfirmationEmail,
  sendWelcomeEmail,
} from '@/services/emailService';
import {
  sendSMS,
  sendTestSMS,
  getSMSLogs,
} from '@/services/smsService';
import { query } from '@/config/database';
import { logger } from '@/utils/logger';

// Get notification logs
export async function getNotificationLogs(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const type = req.query.type as string;

    let query_str = 'SELECT * FROM notification_logs';
    const params: any[] = [];

    if (type) {
      query_str += ' WHERE notification_type = $1';
      params.push(type);
    }

    query_str += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await query(query_str, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM notification_logs';
    if (type) {
      countQuery += ' WHERE notification_type = $1';
    }

    const countResult = await query(countQuery, type ? [type] : []);
    const total = parseInt(countResult.rows[0].count);

    res.json({
      logs: result.rows,
      total,
      limit,
      offset,
    });
  } catch (error: any) {
    logger.error('Get notification logs error:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch notification logs',
      },
    });
  }
}

// Send test email
export async function sendTestEmail(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email is required',
        },
      });
    }

    const success = await sendEmail({
      to: email,
      subject: 'Test Email from Wissen-Haus',
      htmlContent: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h1 style="color: #3052d5;">Test Email</h1>
          <p>This is a test email from Wissen-Haus Empowerment Foundation.</p>
          <p>If you received this, email notifications are working correctly! 🎉</p>
        </div>
      `,
    });

    if (success) {
      res.json({ message: 'Test email sent successfully' });
    } else {
      res.status(500).json({
        error: {
          code: 'SEND_FAILED',
          message: 'Failed to send test email',
        },
      });
    }
  } catch (error: any) {
    logger.error('Send test email error:', error);
    res.status(500).json({
      error: {
        code: 'SEND_FAILED',
        message: 'Failed to send test email',
      },
    });
  }
}

// Send test SMS
export async function sendTestSmsHandler(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Phone number is required',
        },
      });
    }

    const success = await sendTestSMS(phone);

    if (success) {
      res.json({ message: 'Test SMS sent successfully' });
    } else {
      res.status(500).json({
        error: {
          code: 'SEND_FAILED',
          message: 'Failed to send test SMS',
        },
      });
    }
  } catch (error: any) {
    logger.error('Send test SMS error:', error);
    res.status(500).json({
      error: {
        code: 'SEND_FAILED',
        message: 'Failed to send test SMS',
      },
    });
  }
}

// Get email notification settings
export async function getEmailSettings(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const result = await query(
      `SELECT * FROM settings
       WHERE setting_key LIKE 'email_%' OR setting_key LIKE '%email%'
       ORDER BY setting_key`
    );

    res.json({ settings: result.rows });
  } catch (error: any) {
    logger.error('Get email settings error:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch email settings',
      },
    });
  }
}

// Update email settings
export async function updateEmailSettings(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid settings format',
        },
      });
    }

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      await query(
        `INSERT INTO settings (setting_key, setting_value, data_type, updated_by)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (setting_key) DO UPDATE
         SET setting_value = $2, updated_by = $4, updated_at = CURRENT_TIMESTAMP`,
        [key, String(value), typeof value, req.user.userId]
      );
    }

    res.json({ message: 'Email settings updated successfully' });
  } catch (error: any) {
    logger.error('Update email settings error:', error);
    res.status(500).json({
      error: {
        code: 'UPDATE_FAILED',
        message: 'Failed to update email settings',
      },
    });
  }
}

// Get SMS notification settings
export async function getSmsSettings(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const result = await query(
      `SELECT * FROM settings
       WHERE setting_key LIKE 'twilio_%' OR setting_key LIKE 'sms_%'
       ORDER BY setting_key`
    );

    res.json({ settings: result.rows });
  } catch (error: any) {
    logger.error('Get SMS settings error:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch SMS settings',
      },
    });
  }
}

// Update SMS settings
export async function updateSmsSettings(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const { settings } = req.body;

    if (!settings || typeof settings !== 'object') {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid settings format',
        },
      });
    }

    // Update each setting
    for (const [key, value] of Object.entries(settings)) {
      await query(
        `INSERT INTO settings (setting_key, setting_value, data_type, updated_by)
         VALUES ($1, $2, $3, $4)
         ON CONFLICT (setting_key) DO UPDATE
         SET setting_value = $2, updated_by = $4, updated_at = CURRENT_TIMESTAMP`,
        [key, String(value), typeof value, req.user.userId]
      );
    }

    res.json({ message: 'SMS settings updated successfully' });
  } catch (error: any) {
    logger.error('Update SMS settings error:', error);
    res.status(500).json({
      error: {
        code: 'UPDATE_FAILED',
        message: 'Failed to update SMS settings',
      },
    });
  }
}
