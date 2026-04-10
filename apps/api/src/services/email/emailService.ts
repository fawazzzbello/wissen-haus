import { v4 as uuid } from 'uuid';
import { logger } from '@/utils/logger';
import { getSMTPEmailService } from './smtpEmailService';
import { getEmailTemplateService } from './templateService';
import { getEmailQueue, EmailJobData } from '@/queue/emailQueue';

export interface SendEmailOptions {
  to: string;
  toName?: string;
  subject?: string;
  html?: string;
  text?: string;
  templateName?: string;
  templateVariables?: Record<string, any>;
  cc?: string[];
  bcc?: string[];
  priority?: 'high' | 'normal' | 'low';
  scheduledFor?: Date;
}

export interface SendDonationReceiptOptions {
  to: string;
  donorName: string;
  amount: string;
  receiptId: string;
  date: string;
}

export interface SendSubscriptionConfirmationOptions {
  to: string;
  donorName: string;
  amount: string;
  frequency: string;
  nextBillingDate: string;
}

export interface SendMonthlyReportOptions {
  to: string;
  donorName: string;
  metrics: string[];
  reportUrl: string;
}

/**
 * Unified Email Service
 * Handles template rendering and queue management
 */
export class EmailService {
  /**
   * Send email using template
   */
  async sendTemplatedEmail(options: SendEmailOptions): Promise<string> {
    try {
      let subject = options.subject;
      let html = options.html;
      let text = options.text;

      // If template specified, render it
      if (options.templateName) {
        const templateService = getEmailTemplateService();
        const template = await templateService.getTemplate(options.templateName);

        if (!template) {
          throw new Error(`Template not found: ${options.templateName}`);
        }

        subject = templateService.renderTemplate(template.subject, options.templateVariables || {});
        html = templateService.renderTemplate(template.htmlTemplate, options.templateVariables || {});
        if (template.textTemplate) {
          text = templateService.renderTemplate(template.textTemplate, options.templateVariables || {});
        }
      } else if (!subject) {
        throw new Error('Subject is required when not using a template');
      }

      // Queue email
      const jobId = uuid();
      const queue = getEmailQueue();

      const jobData: EmailJobData = {
        id: jobId,
        to: options.to,
        toName: options.toName,
        subject,
        html,
        text,
        templateVariables: options.templateVariables,
        priority: options.priority === 'high' ? 1 : options.priority === 'low' ? 10 : 5,
        scheduledFor: options.scheduledFor,
      };

      await queue.addEmail(jobData);

      logger.info(`✓ Email queued: ${options.to} (${jobId})`);
      return jobId;
    } catch (error: any) {
      logger.error('Send email error:', error.message);
      throw new Error(`Failed to send email: ${error.message}`);
    }
  }

  /**
   * Send donation receipt
   */
  async sendDonationReceipt(options: SendDonationReceiptOptions): Promise<string> {
    return this.sendTemplatedEmail({
      to: options.to,
      toName: options.donorName,
      templateName: 'donation_receipt',
      templateVariables: {
        donor_name: options.donorName,
        amount: options.amount,
        receipt_id: options.receiptId,
        date: options.date,
      },
      priority: 'high',
    });
  }

  /**
   * Send subscription confirmation
   */
  async sendSubscriptionConfirmation(
    options: SendSubscriptionConfirmationOptions
  ): Promise<string> {
    return this.sendTemplatedEmail({
      to: options.to,
      toName: options.donorName,
      templateName: 'subscription_confirmation',
      templateVariables: {
        donor_name: options.donorName,
        amount: options.amount,
        frequency: options.frequency,
        next_date: options.nextBillingDate,
      },
      priority: 'high',
    });
  }

  /**
   * Send welcome email
   */
  async sendWelcome(email: string, name: string): Promise<string> {
    return this.sendTemplatedEmail({
      to: email,
      toName: name,
      templateName: 'welcome_donor',
      templateVariables: {
        donor_name: name,
      },
      priority: 'high',
    });
  }

  /**
   * Send monthly report
   */
  async sendMonthlyReport(options: SendMonthlyReportOptions): Promise<string> {
    return this.sendTemplatedEmail({
      to: options.to,
      toName: options.donorName,
      templateName: 'monthly_impact_report',
      templateVariables: {
        donor_name: options.donorName,
        impact_metric_1: options.metrics[0] || '',
        impact_metric_2: options.metrics[1] || '',
        impact_metric_3: options.metrics[2] || '',
        report_url: options.reportUrl,
      },
    });
  }

  /**
   * Send re-engagement campaign
   */
  async sendReengagementCampaign(
    email: string,
    donorName: string,
    monthsSince: number,
    donationUrl: string
  ): Promise<string> {
    return this.sendTemplatedEmail({
      to: email,
      toName: donorName,
      templateName: 'reengagement_campaign',
      templateVariables: {
        donor_name: donorName,
        months_since_donation: String(monthsSince),
        donation_url: donationUrl,
      },
    });
  }

  /**
   * Send raw email (custom)
   */
  async sendRawEmail(
    to: string,
    subject: string,
    html: string,
    text?: string,
    toName?: string
  ): Promise<string> {
    return this.sendTemplatedEmail({
      to,
      toName,
      subject,
      html,
      text,
    });
  }

  /**
   * Send batch emails
   */
  async sendBatch(emailsOptions: SendEmailOptions[]): Promise<string[]> {
    const ids: string[] = [];

    for (const options of emailsOptions) {
      try {
        const id = await this.sendTemplatedEmail(options);
        ids.push(id);
      } catch (error: any) {
        logger.warn(`Failed to queue email to ${options.to}:`, error.message);
      }
    }

    return ids;
  }

  /**
   * Get queue statistics
   */
  async getQueueStats(): Promise<any> {
    try {
      const queue = getEmailQueue();
      return await queue.getStats();
    } catch (error: any) {
      logger.error('Get queue stats error:', error.message);
      return { error: error.message };
    }
  }
}

// Singleton instance
let emailService: EmailService | null = null;

export function getEmailService(): EmailService {
  if (!emailService) {
    emailService = new EmailService();
  }
  return emailService;
}
