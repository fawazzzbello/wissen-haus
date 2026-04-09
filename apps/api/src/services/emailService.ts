import sgMail from '@sendgrid/mail';
import { v4 as uuidv4 } from 'uuid';
import { query } from '@/config/database';
import { logger } from '@/utils/logger';

sgMail.setApiKey(process.env.SENDGRID_API_KEY || '');

const FROM_EMAIL = process.env.SENDGRID_FROM_EMAIL || 'noreply@wissen-haus.org';
const FROM_NAME = process.env.SENDGRID_FROM_NAME || 'Wissen-Haus';

export interface EmailTemplate {
  subject: string;
  htmlContent: string;
  textContent: string;
}

export interface SendEmailRequest {
  to: string;
  subject: string;
  htmlContent: string;
  textContent?: string;
  donorId?: string;
}

// Donation confirmation template
export function getDonationConfirmationTemplate(
  donorName: string,
  amount: number,
  currency: string = 'USD'
): EmailTemplate {
  return {
    subject: '🎉 Thank You for Your Generous Donation!',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3052d5 0%, #4f7aff 100%); color: white; padding: 40px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px;">Thank You!</h1>
          <p style="margin: 10px 0 0 0; font-size: 18px;">Your donation means the world to us</p>
        </div>

        <div style="padding: 40px 20px; background-color: #f9fafb;">
          <p style="font-size: 16px; color: #333;">Hi ${donorName},</p>

          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            We are deeply grateful for your generous donation of <strong>${amount.toFixed(2)} ${currency}</strong> to Wissen-Haus Empowerment Foundation.
          </p>

          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Your contribution will directly support our mission to empower young people with the knowledge, skills, and mentorship they need to reach their full potential and create positive change in their communities.
          </p>

          <div style="background-color: white; border-left: 4px solid #3052d5; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #3052d5;">Your Impact</h3>
            <ul style="margin: 10px 0; padding-left: 20px; color: #666;">
              <li>Providing mentorship and guidance to young people</li>
              <li>Funding skills development programs</li>
              <li>Creating pathways for personal and professional growth</li>
              <li>Building a community of empowered youth leaders</li>
            </ul>
          </div>

          <p style="font-size: 14px; color: #999; margin-top: 30px;">
            Donation Reference: #${new Date().getTime()}<br/>
            Date: ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </p>

          <hr style="border: none; border-top: 1px solid #ddd; margin: 30px 0;">

          <p style="font-size: 14px; color: #666; margin: 0;">
            Questions? Contact us at <strong>info@wissen-haus.org</strong>
          </p>

          <p style="font-size: 12px; color: #999; margin: 10px 0 0 0;">
            Wissen-Haus Empowerment Foundation<br/>
            Empowering young people to reach their full potential
          </p>
        </div>
      </div>
    `,
    textContent: `Thank You for Your Donation!\n\nHi ${donorName},\n\nWe are deeply grateful for your generous donation of $${amount.toFixed(2)} ${currency} to Wissen-Haus Empowerment Foundation.\n\nYour contribution will directly support our mission to empower young people.\n\nThank you!\n\nWissen-Haus Team`,
  };
}

// Welcome email template
export function getWelcomeTemplate(donorName: string): EmailTemplate {
  return {
    subject: '🌟 Welcome to Wissen-Haus!',
    htmlContent: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3052d5 0%, #4f7aff 100%); color: white; padding: 40px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 32px;">Welcome to Wissen-Haus!</h1>
        </div>

        <div style="padding: 40px 20px; background-color: #f9fafb;">
          <p style="font-size: 16px; color: #333;">Hi ${donorName},</p>

          <p style="font-size: 16px; color: #666; line-height: 1.6;">
            Thank you for joining us in our mission to empower young people. You're now part of a community committed to creating meaningful change.
          </p>

          <div style="background-color: white; border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <h3 style="margin-top: 0; color: #333;">Learn More</h3>
            <p style="color: #666; margin: 10px 0;">
              Visit our website to learn about our programs, impact stories, and get involved.
            </p>
            <a href="https://wissen-haus.org" style="display: inline-block; background-color: #3052d5; color: white; padding: 10px 20px; text-decoration: none; border-radius: 4px; margin-top: 10px;">Visit Our Website</a>
          </div>

          <p style="font-size: 14px; color: #666; margin-top: 30px;">
            Questions? Reply to this email or contact us at info@wissen-haus.org
          </p>
        </div>
      </div>
    `,
    textContent: `Welcome to Wissen-Haus!\n\nHi ${donorName},\n\nThank you for joining us. Visit https://wissen-haus.org to learn more about our mission.`,
  };
}

// Send email
export async function sendEmail(request: SendEmailRequest): Promise<boolean> {
  try {
    const message = {
      to: request.to,
      from: `${FROM_NAME} <${FROM_EMAIL}>`,
      subject: request.subject,
      html: request.htmlContent,
      text: request.textContent || request.htmlContent.replace(/<[^>]*>/g, ''),
    };

    // Log email before sending
    const logId = uuidv4();
    await logNotification({
      notificationType: 'email',
      recipient: request.to,
      subject: request.subject,
      body: request.htmlContent,
      donorId: request.donorId,
      status: 'pending',
      providerMessageId: logId,
    });

    // Send via SendGrid
    const sendResponse = await sgMail.send(message);

    // Update log with success
    await query(
      `UPDATE notification_logs
       SET status = $1, provider = $2, provider_message_id = $3, sent_at = CURRENT_TIMESTAMP
       WHERE provider_message_id = $4`,
      ['sent', 'sendgrid', sendResponse[0].headers['x-message-id'] || logId, logId]
    );

    logger.info(`Email sent to ${request.to}`);
    return true;
  } catch (error: any) {
    logger.error('Email send error:', error);

    // Log error
    if (request.donorId) {
      await query(
        `INSERT INTO notification_logs (notification_type, recipient, subject, body, donor_id, status, provider, error_message)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          'email',
          request.to,
          request.subject,
          request.htmlContent,
          request.donorId,
          'failed',
          'sendgrid',
          error.message,
        ]
      );
    }

    return false;
  }
}

// Send donation confirmation email
export async function sendDonationConfirmationEmail(
  donorEmail: string,
  donorName: string,
  amount: number,
  currency: string,
  donorId?: string
): Promise<boolean> {
  try {
    const template = getDonationConfirmationTemplate(donorName, amount, currency);

    return await sendEmail({
      to: donorEmail,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      donorId,
    });
  } catch (error) {
    logger.error('Error sending donation confirmation:', error);
    return false;
  }
}

// Send welcome email
export async function sendWelcomeEmail(
  donorEmail: string,
  donorName: string,
  donorId?: string
): Promise<boolean> {
  try {
    const template = getWelcomeTemplate(donorName);

    return await sendEmail({
      to: donorEmail,
      subject: template.subject,
      htmlContent: template.htmlContent,
      textContent: template.textContent,
      donorId,
    });
  } catch (error) {
    logger.error('Error sending welcome email:', error);
    return false;
  }
}

// Log notification
export async function logNotification(data: {
  notificationType: 'email' | 'sms';
  recipient: string;
  subject?: string;
  body: string;
  donorId?: string;
  status: 'pending' | 'sent' | 'failed';
  provider?: string;
  providerMessageId?: string;
  errorMessage?: string;
}) {
  try {
    await query(
      `INSERT INTO notification_logs (
        notification_type, recipient, subject, body, donor_id, status, provider, provider_message_id, error_message
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
      [
        data.notificationType,
        data.recipient,
        data.subject || null,
        data.body,
        data.donorId || null,
        data.status,
        data.provider || null,
        data.providerMessageId || null,
        data.errorMessage || null,
      ]
    );
  } catch (error) {
    logger.error('Error logging notification:', error);
  }
}

// Send contact form notification email to admin
export async function sendContactFormEmail(data: {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
}): Promise<boolean> {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #3052d5 0%, #4f7aff 100%); color: white; padding: 40px 20px; text-align: center;">
          <h1 style="margin: 0; font-size: 28px;">New Contact Form Submission</h1>
        </div>

        <div style="padding: 40px 20px; background-color: #f9fafb;">
          <h3 style="color: #333; margin-top: 0;">Submitted by: ${data.name}</h3>

          <div style="background-color: white; border: 1px solid #ddd; padding: 20px; margin: 20px 0; border-radius: 4px;">
            <p><strong>Email:</strong> <a href="mailto:${data.email}">${data.email}</a></p>
            ${data.phone ? `<p><strong>Phone:</strong> ${data.phone}</p>` : ''}
            <p><strong>Subject:</strong> ${data.subject}</p>
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; color: #666;">${data.message}</p>
          </div>

          <div style="background-color: #f0f0f0; padding: 15px; border-radius: 4px; font-size: 12px; color: #666;">
            <p style="margin: 0;">This is an automated message. Someone from the team will review and respond shortly.</p>
          </div>
        </div>
      </div>
    `;

    return await sendEmail({
      to: process.env.CONTACT_FORM_RECIPIENT_EMAIL || 'info@wissen-haus.org',
      subject: `New Contact Form: ${data.subject}`,
      htmlContent,
      textContent: `New Contact Form Submission\n\nName: ${data.name}\nEmail: ${data.email}\n${data.phone ? `Phone: ${data.phone}\n` : ''}Subject: ${data.subject}\n\nMessage:\n${data.message}`,
    });
  } catch (error) {
    logger.error('Error sending contact form email:', error);
    return false;
  }
}
