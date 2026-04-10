import { pool } from '@/config/database';
import { logger } from '@/utils/logger';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlTemplate: string;
  textTemplate?: string;
  templateVariables: string[];
  description?: string;
  category?: string;
  isActive: boolean;
}

/**
 * Email Template Service
 * Manages email templates and variable substitution
 */
export class EmailTemplateService {
  /**
   * Get template by name
   */
  async getTemplate(name: string): Promise<EmailTemplate | null> {
    try {
      const result = await pool.query(
        `SELECT id, name, subject, html_template, text_template, template_variables, description, category, is_active
         FROM email_templates WHERE name = $1 AND is_active = TRUE`,
        [name]
      );

      if (result.rows.length === 0) {
        return null;
      }

      const row = result.rows[0];
      return {
        id: row.id,
        name: row.name,
        subject: row.subject,
        htmlTemplate: row.html_template,
        textTemplate: row.text_template,
        templateVariables: row.template_variables || [],
        description: row.description,
        category: row.category,
        isActive: row.is_active,
      };
    } catch (error: any) {
      logger.error('Get template error:', error.message);
      throw new Error(`Failed to get template: ${error.message}`);
    }
  }

  /**
   * Render template with variables
   */
  renderTemplate(
    template: string,
    variables: Record<string, any>
  ): string {
    let rendered = template;

    for (const [key, value] of Object.entries(variables)) {
      const placeholder = new RegExp(`\\{${key}\\}`, 'g');
      rendered = rendered.replace(placeholder, String(value || ''));
    }

    return rendered;
  }

  /**
   * Create template
   */
  async createTemplate(
    name: string,
    subject: string,
    htmlTemplate: string,
    templateVariables: string[],
    textTemplate?: string,
    description?: string,
    category?: string
  ): Promise<EmailTemplate> {
    try {
      const result = await pool.query(
        `INSERT INTO email_templates (name, subject, html_template, text_template, template_variables, description, category)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         RETURNING id, name, subject, html_template, text_template, template_variables, description, category, is_active`,
        [name, subject, htmlTemplate, textTemplate || null, templateVariables, description || null, category || null]
      );

      const row = result.rows[0];
      logger.info(`✓ Created email template: ${name}`);

      return {
        id: row.id,
        name: row.name,
        subject: row.subject,
        htmlTemplate: row.html_template,
        textTemplate: row.text_template,
        templateVariables: row.template_variables,
        description: row.description,
        category: row.category,
        isActive: row.is_active,
      };
    } catch (error: any) {
      logger.error('Create template error:', error.message);
      throw new Error(`Failed to create template: ${error.message}`);
    }
  }

  /**
   * List all templates
   */
  async listTemplates(category?: string): Promise<EmailTemplate[]> {
    try {
      let query = `SELECT id, name, subject, html_template, text_template, template_variables, description, category, is_active
                   FROM email_templates WHERE is_active = TRUE`;
      const params: any[] = [];

      if (category) {
        query += ` AND category = $1`;
        params.push(category);
      }

      query += ` ORDER BY name`;

      const result = await pool.query(query, params);

      return result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        subject: row.subject,
        htmlTemplate: row.html_template,
        textTemplate: row.text_template,
        templateVariables: row.template_variables || [],
        description: row.description,
        category: row.category,
        isActive: row.is_active,
      }));
    } catch (error: any) {
      logger.error('List templates error:', error.message);
      throw new Error(`Failed to list templates: ${error.message}`);
    }
  }

  /**
   * Initialize default templates
   */
  async initializeDefaultTemplates(): Promise<void> {
    try {
      const templates = [
        {
          name: 'welcome_donor',
          subject: 'Welcome to Wissen-Haus!',
          htmlTemplate: `
            <h1>Welcome {donor_name}!</h1>
            <p>Thank you for joining Wissen-Haus Empowerment Foundation.</p>
            <p>We're committed to empowering young people through knowledge, skills development, and mentorship.</p>
            <p>Visit us: <a href="https://wissen-haus.org">wissen-haus.org</a></p>
          `,
          textTemplate: `Welcome {donor_name}!\n\nThank you for joining Wissen-Haus Empowerment Foundation.`,
          templateVariables: ['donor_name'],
          category: 'transaction',
          description: 'Welcome email for new donors',
        },
        {
          name: 'donation_receipt',
          subject: 'Receipt for your {amount} donation',
          htmlTemplate: `
            <h1>Thank You, {donor_name}!</h1>
            <p>We received your donation of <strong>{amount}</strong>.</p>
            <p>Your generosity will make a real difference in the lives of young people.</p>
            <p><strong>Receipt Number:</strong> {receipt_id}</p>
            <p><strong>Date:</strong> {date}</p>
            <p>Tax deductible receipt: See attached PDF</p>
          `,
          textTemplate: `Thank you {donor_name}!\n\nReceipt: {receipt_id}\nAmount: {amount}\nDate: {date}`,
          templateVariables: ['donor_name', 'amount', 'receipt_id', 'date'],
          category: 'transaction',
          description: 'Donation receipt',
        },
        {
          name: 'subscription_confirmation',
          subject: 'Subscription Confirmed: {amount}/month',
          htmlTemplate: `
            <h1>Subscription Confirmed!</h1>
            <p>Thank you {donor_name}! Your {frequency} donation of {amount} is now active.</p>
            <p>Next billing date: {next_date}</p>
            <p>You can manage your subscription in your account dashboard.</p>
          `,
          textTemplate: `Subscription confirmed!\n\n{amount}/{frequency}\nNext billing: {next_date}`,
          templateVariables: ['donor_name', 'amount', 'frequency', 'next_date'],
          category: 'transaction',
          description: 'Recurring donation confirmation',
        },
        {
          name: 'monthly_impact_report',
          subject: 'Your Impact This Month',
          htmlTemplate: `
            <h1>Your Impact, {donor_name}</h1>
            <p>This month, thanks to donors like you:</p>
            <ul>
              <li>{impact_metric_1}</li>
              <li>{impact_metric_2}</li>
              <li>{impact_metric_3}</li>
            </ul>
            <p>Read full report: <a href="{report_url}">View Full Report</a></p>
          `,
          textTemplate: `Your Impact This Month\n\n{impact_metric_1}\n{impact_metric_2}\n{impact_metric_3}`,
          templateVariables: ['donor_name', 'impact_metric_1', 'impact_metric_2', 'impact_metric_3', 'report_url'],
          category: 'campaign',
          description: 'Monthly impact report for donors',
        },
        {
          name: 'reengagement_campaign',
          subject: 'We miss you, {donor_name}!',
          htmlTemplate: `
            <h1>We Miss You!</h1>
            <p>It's been {months_since_donation} months since your last donation to Wissen-Haus.</p>
            <p>The young people we serve are still making great progress, thanks to supporters like you.</p>
            <p><a href="{donation_url}">Make a donation today</a></p>
          `,
          textTemplate: `We miss you {donor_name}!\n\nMake a donation: {donation_url}`,
          templateVariables: ['donor_name', 'months_since_donation', 'donation_url'],
          category: 'campaign',
          description: 'Re-engagement campaign for inactive donors',
        },
      ];

      for (const template of templates) {
        const exists = await this.getTemplate(template.name);
        if (!exists) {
          await this.createTemplate(
            template.name,
            template.subject,
            template.htmlTemplate,
            template.templateVariables,
            template.textTemplate,
            template.description,
            template.category
          );
        }
      }

      logger.info('✓ Default email templates initialized');
    } catch (error: any) {
      logger.error('Initialize templates error:', error.message);
      // Don't throw - allow app to continue without templates
    }
  }
}

// Singleton instance
let templateService: EmailTemplateService | null = null;

export function getEmailTemplateService(): EmailTemplateService {
  if (!templateService) {
    templateService = new EmailTemplateService();
  }
  return templateService;
}
