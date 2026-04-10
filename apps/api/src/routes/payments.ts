import { Router } from 'express';
import {
  createSubscription,
  cancelSubscription,
  createRefund,
  getAnalyticsMetrics,
  getAnalyticsTrends,
  getAnalyticsSegments,
  getAnalyticsLifetimeValues,
  getChurnRiskDonors,
  getRevenueForecast,
  handleStripeWebhook,
} from '@/controllers/paymentController';
import { authMiddleware, adminOnly } from '@/middleware/auth';
import express from 'express';

const router = Router();

/**
 * Payment Routes
 * Subscription and analytics endpoints
 */

/**
 * POST /api/payments/subscriptions
 * Create a recurring donation subscription
 */
router.post('/subscriptions', authMiddleware, adminOnly, createSubscription);

/**
 * POST /api/payments/subscriptions/:subscriptionId/cancel
 * Cancel a subscription
 */
router.post('/subscriptions/:subscriptionId/cancel', authMiddleware, adminOnly, cancelSubscription);

/**
 * POST /api/payments/refunds
 * Create a refund for a donation
 */
router.post('/refunds', authMiddleware, adminOnly, createRefund);

/**
 * Analytics Endpoints
 */

/**
 * GET /api/payments/analytics/metrics
 * Get donation metrics
 */
router.get('/analytics/metrics', authMiddleware, adminOnly, getAnalyticsMetrics);

/**
 * GET /api/payments/analytics/trends
 * Get donation trends (monthly)
 * Query: ?months=12 (default 12)
 */
router.get('/analytics/trends', authMiddleware, adminOnly, getAnalyticsTrends);

/**
 * GET /api/payments/analytics/segments
 * Get donor segmentation by donation amount
 */
router.get('/analytics/segments', authMiddleware, adminOnly, getAnalyticsSegments);

/**
 * GET /api/payments/analytics/lifetime-values
 * Get top donors by lifetime value
 * Query: ?limit=20 (default 20)
 */
router.get('/analytics/lifetime-values', authMiddleware, adminOnly, getAnalyticsLifetimeValues);

/**
 * GET /api/payments/analytics/churn-risk
 * Get donors at risk of churning (inactive >90 days)
 */
router.get('/analytics/churn-risk', authMiddleware, adminOnly, getChurnRiskDonors);

/**
 * GET /api/payments/analytics/forecast
 * Get revenue forecast
 * Query: ?months=6 (default 6)
 */
router.get('/analytics/forecast', authMiddleware, adminOnly, getRevenueForecast);

/**
 * POST /api/payments/webhook/stripe
 * Handle Stripe webhook events (no auth required)
 */
router.post(
  '/webhook/stripe',
  express.raw({ type: 'application/json' }),
  handleStripeWebhook
);

export { router as paymentRouter };
