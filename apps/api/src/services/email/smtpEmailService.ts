import nodemailer from 'nodemailer';
import { logger } from '@/utils/logger';

export interface EmailOptions {
  to: string;
  subject: string;
  html?: string;
  text?: string;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
}

export interface EmailResult {
  messageId: string;
  success: boolean;
  timestamp: Date;
}

/**
 * SMTP Email Service
 * Sends emails via SMTP (Gmail, custom server, etc)
 */
export class SMTPEmailService {
  private transporter: nodemailer.Transporter | null = null;
  private isConfigured: boolean = false;

  constructor() {
    this.initialize();
  }

  private initialize(): void {
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || '587');
    const user = process.env.SMTP_USER;
    const pass = process.env.SMTP_PASS;
    const fromEmail = process.env.EMAIL_FROM || 'noreply@wissen-haus.org';
    const fromName = process.env.EMAIL_FROM_NAME || 'Wissen-Haus';

    if (!host || !user || !pass) {
      logger.warn('⚠ SMTP not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS');
      this.isConfigured = false;
      return;
    }

    try {
      this.transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: {
          user,
          pass,
        },
        from: `${fromName} <${fromEmail}>`,
      });

      logger.info(`✓ SMTP configured: ${host}:${port}`);
      this.isConfigured = true;
    } catch (error: any) {
      logger.error('Failed to configure SMTP:', error.message);
      this.isConfigured = false;
    }
  }

  /**
   * Check if SMTP is configured
   */
  isAvailable(): boolean {
    return this.isConfigured && !!this.transporter;
  }

  /**
   * Send a single email
   */
  async sendEmail(options: EmailOptions): Promise<EmailResult> {
    if (!this.transporter) {
      throw new Error('SMTP service not configured');
    }

    try {
      const result = await this.transporter.sendMail({
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        replyTo: options.replyTo,
        cc: options.cc,
        bcc: options.bcc,
      });

      logger.info(`✓ Email sent to ${options.to}: ${result.messageId}`);

      return {
        messageId: result.messageId,
        success: true,
        timestamp: new Date(),
      };
    } catch (error: any) {
      logger.error(`Failed to send email to ${options.to}:`, error.message);
      throw new Error(`Email send failed: ${error.message}`);
    }
  }

  /**
   * Send batch emails
   */
  async sendBatch(emails: EmailOptions[]): Promise<EmailResult[]> {
    const results: EmailResult[] = [];

    for (const email of emails) {
      try {
        const result = await this.sendEmail(email);
        results.push(result);
      } catch (error: any) {
        logger.warn(`Skipped email to ${email.to}: ${error.message}`);
        results.push({
          messageId: '',
          success: false,
          timestamp: new Date(),
        });
      }
    }

    return results;
  }

  /**
   * Verify SMTP configuration
   */
  async verify(): Promise<boolean> {
    if (!this.transporter) {
      return false;
    }

    try {
      await this.transporter.verify();
      logger.info('✓ SMTP connection verified');
      return true;
    } catch (error: any) {
      logger.error('SMTP verification failed:', error.message);
      return false;
    }
  }
}

// Singleton instance
let smtpService: SMTPEmailService | null = null;

export function getSMTPEmailService(): SMTPEmailService {
  if (!smtpService) {
    smtpService = new SMTPEmailService();
  }
  return smtpService;
}
