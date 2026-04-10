import { Request, Response } from 'express';
import { getStripeService } from '@/services/payment/stripeService';
import { getPaymentAnalyticsService } from '@/services/payment/analyticsService';
import { pool } from '@/config/database';
import { logger } from '@/utils/logger';

/**
 * Payment Controller
 * Handles payment-related endpoints
 */

/**
 * POST /api/payments/create-subscription
 * Create a recurring donation subscription
 */
export async function createSubscription(req: Request, res: Response) {
  try {
    const { donorId, donorEmail, donorName, amountCents, frequency } = req.body;

    if (!donorId || !donorEmail || !amountCents || !frequency) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: donorId, donorEmail, amountCents, frequency',
      });
    }

    if (!['monthly', 'yearly'].includes(frequency)) {
      return res.status(400).json({
        success: false,
        error: 'frequency must be "monthly" or "yearly"',
      });
    }

    const stripeService = getStripeService();

    // Create or get Stripe customer
    const customerId = await stripeService.createOrGetCustomer(donorEmail, donorName);

    // Create subscription
    const subscription = await stripeService.createSubscription({
      customerId,
      paymentMethodId: '', // Will be set by payment method
      planAmountCents: amountCents,
      frequency,
      donorEmail,
      donorName,
    });

    // Save to database
    const client = await pool.connect();
    try {
      await client.query(
        `INSERT INTO subscriptions (donor_id, stripe_subscription_id, stripe_customer_id, plan_amount_cents, frequency, status)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [donorId, subscription.stripeSubscriptionId, customerId, amountCents, frequency, 'active']
      );
    } finally {
      client.release();
    }

    res.json({
      success: true,
      data: subscription,
    });
  } catch (error: any) {
    logger.error('Create subscription error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create subscription',
      message: error.message,
    });
  }
}

/**
 * POST /api/payments/cancel-subscription/:subscriptionId
 * Cancel a recurring donation subscription
 */
export async function cancelSubscription(req: Request, res: Response) {
  try {
    const { subscriptionId } = req.params;

    if (!subscriptionId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required parameter: subscriptionId',
      });
    }

    const stripeService = getStripeService();
    const subscription = await stripeService.cancelSubscription(subscriptionId, {
      reason: 'cancellation_requested',
    });

    // Update database
    const client = await pool.connect();
    try {
      await client.query(`UPDATE subscriptions SET status = $1 WHERE stripe_subscription_id = $2`, [
        subscription.status,
        subscriptionId,
      ]);
    } finally {
      client.release();
    }

    res.json({
      success: true,
      data: {
        subscriptionId,
        status: subscription.status,
        cancelledAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    logger.error('Cancel subscription error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to cancel subscription',
      message: error.message,
    });
  }
}

/**
 * POST /api/payments/refund
 * Create a refund for a donation
 */
export async function createRefund(req: Request, res: Response) {
  try {
    const { donationId, chargeId, amountCents } = req.body;

    if (!chargeId) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: chargeId',
      });
    }

    const stripeService = getStripeService();
    const refund = await stripeService.createRefund(chargeId, amountCents);

    // Update donation
    if (donationId) {
      const client = await pool.connect();
      try {
        await client.query(
          `UPDATE donations SET refund_id = $1, refund_amount_cents = $2, refunded_at = NOW(), status = 'refunded'
           WHERE id = $3`,
          [refund.id, amountCents || 0, donationId]
        );
      } finally {
        client.release();
      }
    }

    res.json({
      success: true,
      data: {
        refundId: refund.id,
        chargeId: refund.charge,
        amount: refund.amount,
        status: refund.status,
      },
    });
  } catch (error: any) {
    logger.error('Create refund error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to create refund',
      message: error.message,
    });
  }
}

/**
 * GET /api/payments/analytics/metrics
 * Get donation metrics and statistics
 */
export async function getAnalyticsMetrics(req: Request, res: Response) {
  try {
    const analyticsService = getPaymentAnalyticsService();
    const metrics = await analyticsService.getDonationMetrics();

    res.json({
      success: true,
      data: metrics,
    });
  } catch (error: any) {
    logger.error('Get analytics metrics error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics metrics',
      message: error.message,
    });
  }
}

/**
 * GET /api/payments/analytics/trends
 * Get donation trends over time
 */
export async function getAnalyticsTrends(req: Request, res: Response) {
  try {
    const { months = 12 } = req.query;
    const analyticsService = getPaymentAnalyticsService();
    const trends = await analyticsService.getDonationTrends(parseInt(months as string, 10));

    res.json({
      success: true,
      data: trends,
    });
  } catch (error: any) {
    logger.error('Get analytics trends error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get analytics trends',
      message: error.message,
    });
  }
}

/**
 * GET /api/payments/analytics/segments
 * Get donor segmentation
 */
export async function getAnalyticsSegments(req: Request, res: Response) {
  try {
    const analyticsService = getPaymentAnalyticsService();
    const segments = await analyticsService.getDonorSegments();

    res.json({
      success: true,
      data: segments,
    });
  } catch (error: any) {
    logger.error('Get analytics segments error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get donor segments',
      message: error.message,
    });
  }
}

/**
 * GET /api/payments/analytics/lifetime-values
 * Get top donors by lifetime value
 */
export async function getAnalyticsLifetimeValues(req: Request, res: Response) {
  try {
    const { limit = 20 } = req.query;
    const analyticsService = getPaymentAnalyticsService();
    const ltv = await analyticsService.getTopDonorLifetimeValues(parseInt(limit as string, 10));

    res.json({
      success: true,
      data: ltv,
    });
  } catch (error: any) {
    logger.error('Get lifetime values error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get lifetime values',
      message: error.message,
    });
  }
}

/**
 * GET /api/payments/analytics/churn-risk
 * Get donors at risk of churning
 */
export async function getChurnRiskDonors(req: Request, res: Response) {
  try {
    const analyticsService = getPaymentAnalyticsService();
    const churnRisk = await analyticsService.getChurnRiskDonors();

    res.json({
      success: true,
      data: churnRisk,
    });
  } catch (error: any) {
    logger.error('Get churn risk donors error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get churn risk donors',
      message: error.message,
    });
  }
}

/**
 * GET /api/payments/analytics/forecast
 * Get revenue forecast
 */
export async function getRevenueForecast(req: Request, res: Response) {
  try {
    const { months = 6 } = req.query;
    const analyticsService = getPaymentAnalyticsService();
    const forecast = await analyticsService.getRevenueForecast(parseInt(months as string, 10));

    res.json({
      success: true,
      data: forecast,
    });
  } catch (error: any) {
    logger.error('Get revenue forecast error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get revenue forecast',
      message: error.message,
    });
  }
}

/**
 * POST /api/payments/webhook/stripe
 * Handle Stripe webhook events
 */
export async function handleStripeWebhook(req: Request, res: Response) {
  try {
    const signature = req.headers['stripe-signature'] as string;

    if (!signature) {
      return res.status(400).json({
        success: false,
        error: 'Missing Stripe signature',
      });
    }

    const stripeService = getStripeService();
    const event = stripeService.validateWebhookSignature(req.body as any, signature) as any;

    // Handle the event
    await stripeService.handleWebhookEvent(event as any);

    res.json({
      success: true,
      received: true,
    });
  } catch (error: any) {
    logger.error('Stripe webhook error:', error.message);
    res.status(400).json({
      success: false,
      error: 'Webhook processing failed',
      message: error.message,
    });
  }
}
