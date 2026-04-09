import { Router } from 'express';
import { sendContactFormEmail } from '@/services/emailService';
import { query } from '@/config/database';
import { logger } from '@/utils/logger';
import { v4 as uuidv4 } from 'uuid';

export const contactRouter = Router();

interface ContactRequest {
  name: string;
  email: string;
  subject: string;
  message: string;
  phone?: string;
}

// Submit contact form
contactRouter.post('/', async (req, res) => {
  try {
    const { name, email, subject, message, phone } = req.body as ContactRequest;

    // Validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        error: 'Missing required fields: name, email, subject, message',
      });
    }

    // Basic email validation
    if (!email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
      return res.status(400).json({
        error: 'Invalid email address',
      });
    }

    // Store contact message in database
    const contactId = uuidv4();
    await query(
      `INSERT INTO contact_messages (id, name, email, phone, subject, message, ip_address, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, CURRENT_TIMESTAMP)`,
      [
        contactId,
        name,
        email,
        phone || null,
        subject,
        message,
        req.ip || 'unknown',
      ]
    );

    // Send email notification
    try {
      await sendContactFormEmail({
        name,
        email,
        subject,
        message,
        phone,
      });
    } catch (emailError) {
      logger.warn('Failed to send contact form notification email:', emailError);
      // Don't fail the request if email fails, message is already saved
    }

    logger.info(`Contact form submitted: ${contactId} from ${email}`);

    return res.status(200).json({
      success: true,
      message: 'Thank you for your message. We will get back to you soon.',
      contactId,
    });
  } catch (error) {
    logger.error('Error submitting contact form:', error);
    return res.status(500).json({
      error: 'Failed to submit contact form. Please try again later.',
    });
  }
});
