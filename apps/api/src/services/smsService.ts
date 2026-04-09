import twilio from 'twilio';
import { query } from '@/config/database';
import { logger } from '@/utils/logger';

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const fromNumber = process.env.TWILIO_PHONE_NUMBER;

let client: ReturnType<typeof twilio> | null = null;

if (accountSid && authToken) {
  client = twilio(accountSid, authToken);
}

export interface SendSMSRequest {
  to: string;
  message: string;
  donorId?: string;
}

// Send SMS
export async function sendSMS(request: SendSMSRequest): Promise<boolean> {
  try {
    if (!client || !fromNumber) {
      logger.warn('Twilio is not configured. SMS will not be sent.');
      return false;
    }

    // Log SMS before sending
    await query(
      `INSERT INTO notification_logs (notification_type, recipient, body, donor_id, status, provider)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        'sms',
        request.to,
        request.message,
        request.donorId || null,
        'pending',
        'twilio',
      ]
    );

    // Send via Twilio
    const message = await client.messages.create({
      body: request.message,
      from: fromNumber,
      to: request.to,
    });

    // Update log with success
    await query(
      `UPDATE notification_logs
       SET status = $1, provider_message_id = $2, sent_at = CURRENT_TIMESTAMP
       WHERE recipient = $3 AND notification_type = 'sms' AND status = 'pending' AND body = $4`,
      ['sent', message.sid, request.to, request.message]
    );

    logger.info(`SMS sent to ${request.to}`);
    return true;
  } catch (error: any) {
    logger.error('SMS send error:', error);

    // Log error
    if (request.donorId) {
      await query(
        `INSERT INTO notification_logs (notification_type, recipient, body, donor_id, status, provider, error_message)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          'sms',
          request.to,
          request.message,
          request.donorId,
          'failed',
          'twilio',
          error.message,
        ]
      );
    }

    return false;
  }
}

// Send donation notification SMS
export async function sendDonationNotificationSMS(
  phone: string,
  donorName: string,
  amount: number,
  currency: string = 'USD',
  donorId?: string
): Promise<boolean> {
  try {
    const message = `Hi ${donorName}! 🎉 Thank you for your $${amount.toFixed(2)} ${currency} donation to Wissen-Haus! Your generosity empowers young people. https://wissen-haus.org`;

    return await sendSMS({
      to: phone,
      message,
      donorId,
    });
  } catch (error) {
    logger.error('Error sending donation SMS:', error);
    return false;
  }
}

// Send high-value donation alert SMS
export async function sendHighValueDonationAlertSMS(
  adminPhone: string,
  donorName: string,
  amount: number,
  currency: string = 'USD'
): Promise<boolean> {
  try {
    const message = `🎊 High-Value Donation Alert!\n${donorName} donated $${amount.toFixed(2)} ${currency} to Wissen-Haus! View details: https://wissen-haus.org/admin/donations`;

    return await sendSMS({
      to: adminPhone,
      message,
    });
  } catch (error) {
    logger.error('Error sending high-value donation alert:', error);
    return false;
  }
}

// Send test SMS
export async function sendTestSMS(phone: string): Promise<boolean> {
  try {
    const message = `Test SMS from Wissen-Haus. If you received this, SMS notifications are working correctly! 🎉`;

    return await sendSMS({
      to: phone,
      message,
    });
  } catch (error) {
    logger.error('Error sending test SMS:', error);
    return false;
  }
}

// Get SMS logs
export async function getSMSLogs(limit: number = 50, offset: number = 0) {
  try {
    const result = await query(
      `SELECT * FROM notification_logs
       WHERE notification_type = 'sms'
       ORDER BY created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) FROM notification_logs WHERE notification_type = $1',
      ['sms']
    );

    return {
      logs: result.rows,
      total: parseInt(countResult.rows[0].count),
    };
  } catch (error) {
    logger.error('Error fetching SMS logs:', error);
    throw error;
  }
}
