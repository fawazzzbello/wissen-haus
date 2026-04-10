import Bull from 'bull';
import { logger } from '@/utils/logger';
import { getSMTPEmailService, EmailOptions } from '@/services/email/smtpEmailService';
import { pool } from '@/config/database';

export interface EmailJobData {
  id?: string;
  to: string;
  toName?: string;
  subject: string;
  html?: string;
  text?: string;
  templateId?: string;
  templateVariables?: Record<string, any>;
  priority?: number;
  scheduledFor?: Date;
  replyTo?: string;
  cc?: string[];
  bcc?: string[];
}

/**
 * Email Queue using Bull
 * Handles asynchronous email delivery with retries
 */
class EmailQueueManager {
  private queue: Bull.Queue<EmailJobData>;
  private processingInterval: NodeJS.Timeout | null = null;

  constructor() {
    // Create queue with Redis connection
    const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379';

    this.queue = new Bull('email', redisUrl, {
      settings: {
        maxStalledCount: 3,
        stalledInterval: 5000,
        guardInterval: 5000,
        retryProcessDelay: 60000, // Retry after 1 minute
      },
    });

    this.setupEventHandlers();
    this.startProcessor();

    logger.info('✓ Email queue initialized');
  }

  private setupEventHandlers(): void {
    this.queue.on('error', (error) => {
      logger.error('Email queue error:', error.message);
    });

    this.queue.on('failed', (job, error) => {
      logger.warn(`Email job ${job.id} failed:`, error.message);
    });

    this.queue.on('completed', (job) => {
      logger.info(`✓ Email job ${job.id} completed`);
    });

    this.queue.on('stalled', (job) => {
      logger.warn(`Email job ${job.id} stalled, retrying...`);
    });
  }

  private startProcessor(): void {
    this.queue.process(10, async (job) => {
      return this.processEmailJob(job);
    });
  }

  private async processEmailJob(job: Bull.Job<EmailJobData>): Promise<any> {
    try {
      const data = job.data;
      const smtpService = getSMTPEmailService();

      if (!smtpService.isAvailable()) {
        throw new Error('SMTP service not available');
      }

      // Prepare email
      const emailOptions: EmailOptions = {
        to: data.to,
        subject: data.subject,
        html: data.html,
        text: data.text,
        replyTo: data.replyTo,
        cc: data.cc,
        bcc: data.bcc,
      };

      // Send email
      const result = await smtpService.sendEmail(emailOptions);

      // Update queue record
      if (data.id) {
        const client = await pool.connect();
        try {
          await client.query(
            `UPDATE email_queue SET status = $1, sent_at = NOW(), attempt_count = attempt_count + 1
             WHERE id = $2`,
            ['sent', data.id]
          );
        } finally {
          client.release();
        }
      }

      logger.info(`✓ Email processed: ${result.messageId}`);
      return result;
    } catch (error: any) {
      logger.error('Email processing error:', error.message);

      // Update failed status
      if (job.data.id) {
        const client = await pool.connect();
        try {
          await client.query(
            `UPDATE email_queue SET status = $1, last_error = $2, attempt_count = attempt_count + 1
             WHERE id = $3`,
            [job.attemptsMade >= (job.opts.attempts || 5) ? 'failed' : 'pending', error.message, job.data.id]
          );
        } finally {
          client.release();
        }
      }

      throw error;
    }
  }

  /**
   * Add email to queue
   */
  async addEmail(jobData: EmailJobData, options?: Bull.JobOptions): Promise<Bull.Job<EmailJobData>> {
    try {
      const jobOptions: Bull.JobOptions = {
        priority: jobData.priority || 5,
        delay: jobData.scheduledFor
          ? Math.max(0, jobData.scheduledFor.getTime() - Date.now())
          : 0,
        attempts: 5,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: true,
        ...options,
      };

      const job = await this.queue.add(jobData, jobOptions);

      // Save to database
      if (jobData.id) {
        const client = await pool.connect();
        try {
          await client.query(
            `INSERT INTO email_queue (id, recipient_email, recipient_name, subject, html_content, text_content,
              template_variables, status, priority, scheduled_for)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
             ON CONFLICT (id) DO NOTHING`,
            [
              jobData.id,
              jobData.to,
              jobData.toName || null,
              jobData.subject,
              jobData.html || null,
              jobData.text || null,
              jobData.templateVariables ? JSON.stringify(jobData.templateVariables) : null,
              'pending',
              jobData.priority || 5,
              jobData.scheduledFor || null,
            ]
          );
        } finally {
          client.release();
        }
      }

      logger.info(`✓ Email added to queue: ${jobData.to}`);
      return job;
    } catch (error: any) {
      logger.error('Error adding email to queue:', error.message);
      throw new Error(`Failed to queue email: ${error.message}`);
    }
  }

  /**
   * Add multiple emails to queue
   */
  async addBatch(jobDataArray: EmailJobData[]): Promise<Bull.Job<EmailJobData>[]> {
    const jobs: Bull.Job<EmailJobData>[] = [];

    for (const jobData of jobDataArray) {
      try {
        const job = await this.addEmail(jobData);
        jobs.push(job);
      } catch (error: any) {
        logger.warn(`Failed to queue email to ${jobData.to}:`, error.message);
      }
    }

    logger.info(`✓ Added ${jobs.length} of ${jobDataArray.length} emails to queue`);
    return jobs;
  }

  /**
   * Get queue stats
   */
  async getStats(): Promise<{
    waiting: number;
    processing: number;
    completed: number;
    failed: number;
    delayed: number;
  }> {
    const counts = await this.queue.getJobCounts();

    return {
      waiting: counts.waiting,
      processing: counts.active,
      completed: counts.completed,
      failed: counts.failed,
      delayed: counts.delayed,
    };
  }

  /**
   * Clear failed emails
   */
  async clearFailed(): Promise<number> {
    const jobs = await this.queue.getFailed();
    let cleared = 0;

    for (const job of jobs) {
      await job.remove();
      cleared++;
    }

    logger.info(`✓ Cleared ${cleared} failed email jobs`);
    return cleared;
  }

  /**
   * Clean old completed jobs
   */
  async cleanOldJobs(maxAge: number = 86400000): Promise<number> {
    // Default: 24 hours
    const removed = await this.queue.clean(maxAge, undefined, 'completed');
    const count = Array.isArray(removed) ? removed.length : (removed as any);
    logger.info(`✓ Cleaned ${count} old email jobs`);
    return count;
  }

  /**
   * Shutdown queue gracefully
   */
  async shutdown(): Promise<void> {
    if (this.processingInterval) {
      clearInterval(this.processingInterval);
    }

    await this.queue.close();
    logger.info('✓ Email queue shutdown complete');
  }
}

// Singleton instance
let emailQueueManager: EmailQueueManager | null = null;

export function getEmailQueue(): EmailQueueManager {
  if (!emailQueueManager) {
    emailQueueManager = new EmailQueueManager();
  }
  return emailQueueManager;
}

export function setupEmailQueue(): EmailQueueManager {
  return getEmailQueue();
}
