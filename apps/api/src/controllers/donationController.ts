import { Request, Response } from 'express';
import {
  createCheckoutSession,
  verifyWebhookSignature,
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
  getDonations,
  getDonationById,
  getDonationStats,
  refundDonation,
} from '@/services/paymentService';
import { logger } from '@/utils/logger';

// Create checkout session for donation
export async function createDonationCheckout(req: Request, res: Response) {
  try {
    const { email, firstName, lastName, phone, country, amount, currency, description, type } = req.body;

    // Validation
    if (!email || !firstName || !lastName || !amount) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email, first name, last name, and amount are required',
        },
      });
    }

    if (amount < 100) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Minimum donation is $1.00',
        },
      });
    }

    const session = await createCheckoutSession({
      email,
      firstName,
      lastName,
      phone,
      country,
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency || 'USD',
      description,
      type: type || 'one_time',
    });

    res.json(session);
  } catch (error: any) {
    logger.error('Create checkout session error:', error);
    res.status(500).json({
      error: {
        code: 'CHECKOUT_FAILED',
        message: error.message || 'Failed to create checkout session',
      },
    });
  }
}

// Handle Stripe webhook
export async function handleStripeWebhook(req: Request, res: Response) {
  try {
    const signature = req.headers['stripe-signature'] as string;
    if (!signature) {
      return res.status(400).json({
        error: {
          code: 'MISSING_SIGNATURE',
          message: 'Missing Stripe signature',
        },
      });
    }

    // Get raw body as string
    const rawBody = (req as any).rawBody || '';

    // Verify webhook signature
    const event = verifyWebhookSignature(rawBody, signature);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      case 'payment_intent.canceled':
        logger.info(`Payment canceled: ${event.data.object.id}`);
        break;

      default:
        logger.debug(`Unhandled event type: ${event.type}`);
    }

    // Acknowledge receipt of event
    res.json({ received: true });
  } catch (error: any) {
    logger.error('Webhook error:', error);
    res.status(400).json({
      error: {
        code: 'WEBHOOK_ERROR',
        message: error.message || 'Webhook processing failed',
      },
    });
  }
}

// Get all donations (admin)
export async function listDonations(req: Request, res: Response) {
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
    const status = req.query.status as string;

    const result = await getDonations(limit, offset, status);

    res.json(result);
  } catch (error: any) {
    logger.error('List donations error:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch donations',
      },
    });
  }
}

// Get single donation
export async function getDonation(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const donation = await getDonationById(id);

    if (!donation) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Donation not found',
        },
      });
    }

    res.json({ donation });
  } catch (error: any) {
    logger.error('Get donation error:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch donation',
      },
    });
  }
}

// Get donation statistics
export async function getDonationStatistics(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const stats = await getDonationStats();

    res.json(stats);
  } catch (error: any) {
    logger.error('Get stats error:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch statistics',
      },
    });
  }
}

// Process refund (admin)
export async function processRefund(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const { id } = req.params;
    const { reason } = req.body;

    await refundDonation(id, reason);

    res.json({
      message: 'Donation refunded successfully',
    });
  } catch (error: any) {
    logger.error('Refund error:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: error.message,
        },
      });
    }

    res.status(500).json({
      error: {
        code: 'REFUND_FAILED',
        message: error.message || 'Failed to process refund',
      },
    });
  }
}
