import Stripe from 'stripe';
import { pool } from '@/config/database';
import { logger } from '@/utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export interface CreateSubscriptionParams {
  customerId: string;
  paymentMethodId: string;
  planAmountCents: number;
  frequency: 'monthly' | 'yearly';
  donorEmail: string;
  donorName: string;
}

export interface PaymentIntentResult {
  clientSecret: string;
  paymentIntentId: string;
}

export interface SubscriptionResult {
  subscriptionId: string;
  stripeSubscriptionId: string;
  status: string;
  nextBillingDate: string;
}

/**
 * Stripe Payment Service
 * Handles all Stripe API operations
 */
export class StripePaymentService {
  /**
   * Create or get Stripe customer
   */
  async createOrGetCustomer(email: string, donorName?: string): Promise<string> {
    try {
      // Check if customer exists
      const existingCustomers = await stripe.customers.list({
        email,
        limit: 1,
      });

      if (existingCustomers.data.length > 0) {
        return existingCustomers.data[0].id;
      }

      // Create new customer
      const customer = await stripe.customers.create({
        email,
        name: donorName || email,
        metadata: {
          created_via: 'wissen_haus_api',
        },
      });

      logger.info(`✓ Created Stripe customer: ${customer.id}`);
      return customer.id;
    } catch (error: any) {
      logger.error('Stripe customer creation error:', error.message);
      throw new Error(`Failed to create Stripe customer: ${error.message}`);
    }
  }

  /**
   * Create a payment intent for one-time donations
   */
  async createPaymentIntent(
    amountCents: number,
    customerId: string,
    donorEmail: string
  ): Promise<PaymentIntentResult> {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: amountCents,
        currency: 'usd',
        customer: customerId,
        receipt_email: donorEmail,
        metadata: {
          organization: 'wissen_haus',
          type: 'donation',
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      logger.info(`✓ Created payment intent: ${paymentIntent.id}`);
      return {
        clientSecret: paymentIntent.client_secret || '',
        paymentIntentId: paymentIntent.id,
      };
    } catch (error: any) {
      logger.error('Payment intent creation error:', error.message);
      throw new Error(`Failed to create payment intent: ${error.message}`);
    }
  }

  /**
   * Create a subscription for recurring donations
   */
  async createSubscription(params: CreateSubscriptionParams): Promise<SubscriptionResult> {
    try {
      const priceData =
        params.frequency === 'monthly'
          ? {
              currency: 'usd',
              unit_amount: params.planAmountCents,
              recurring: {
                interval: 'month' as const,
              },
            }
          : {
              currency: 'usd',
              unit_amount: params.planAmountCents,
              recurring: {
                interval: 'year' as const,
              },
            };

      // Create product (reuse if exists)
      const products = await stripe.products.list({
        limit: 1,
        shippable: false,
      });

      let productId = products.data[0]?.id;
      if (!productId) {
        const product = await stripe.products.create({
          name: 'Wissen-Haus Donation',
          type: 'service',
          metadata: {
            organization: 'wissen_haus',
          },
        });
        productId = product.id;
      }

      // Create price
      const price = await stripe.prices.create({
        product: productId,
        ...priceData,
      });

      // Create subscription
      const subscription = await stripe.subscriptions.create({
        customer: params.customerId,
        items: [
          {
            price: price.id,
          },
        ],
        payment_settings: {
          payment_method_types: ['card'],
          save_default_payment_method: 'on_subscription',
        },
        metadata: {
          organization: 'wissen_haus',
          donor_email: params.donorEmail,
          donor_name: params.donorName,
        },
        expand: ['latest_invoice.payment_intent'],
      });

      logger.info(`✓ Created subscription: ${subscription.id}`);
      return {
        subscriptionId: subscription.id,
        stripeSubscriptionId: subscription.id,
        status: subscription.status,
        nextBillingDate: new Date(subscription.current_period_end * 1000).toISOString(),
      };
    } catch (error: any) {
      logger.error('Subscription creation error:', error.message);
      throw new Error(`Failed to create subscription: ${error.message}`);
    }
  }

  /**
   * Get subscription details
   */
  async getSubscription(subscriptionId: string): Promise<Stripe.Subscription> {
    try {
      return await stripe.subscriptions.retrieve(subscriptionId);
    } catch (error: any) {
      logger.error('Get subscription error:', error.message);
      throw new Error(`Failed to get subscription: ${error.message}`);
    }
  }

  /**
   * Cancel a subscription
   */
  async cancelSubscription(
    subscriptionId: string,
    cancellationDetails?: { reason: 'cancellation_requested' | string }
  ): Promise<Stripe.Subscription> {
    try {
      const subscription = await stripe.subscriptions.update(subscriptionId, {
        cancellation_details: cancellationDetails,
      });

      const canceled = await stripe.subscriptions.del(subscriptionId);

      logger.info(`✓ Cancelled subscription: ${subscriptionId}`);
      return canceled;
    } catch (error: any) {
      logger.error('Cancel subscription error:', error.message);
      throw new Error(`Failed to cancel subscription: ${error.message}`);
    }
  }

  /**
   * Create a refund
   */
  async createRefund(chargeId: string, amountCents?: number): Promise<Stripe.Refund> {
    try {
      const refund = await stripe.refunds.create({
        charge: chargeId,
        amount: amountCents,
        reason: 'requested_by_customer',
      });

      logger.info(`✓ Created refund: ${refund.id}`);
      return refund;
    } catch (error: any) {
      logger.error('Refund creation error:', error.message);
      throw new Error(`Failed to create refund: ${error.message}`);
    }
  }

  /**
   * Validate webhook signature
   */
  validateWebhookSignature(body: Buffer, signature: string): Record<string, any> {
    try {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
      const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      return event;
    } catch (error: any) {
      logger.error('Webhook validation error:', error.message);
      throw new Error(`Invalid webhook signature: ${error.message}`);
    }
  }

  /**
   * Handle webhook events
   */
  async handleWebhookEvent(event: Stripe.Event): Promise<void> {
    const client = await pool.connect();

    try {
      // Log webhook event
      await client.query(
        `INSERT INTO webhook_events (event_type, event_id, payload) VALUES ($1, $2, $3)`,
        [event.type, event.id, JSON.stringify(event.data)]
      );

      switch (event.type) {
        case 'payment_intent.succeeded':
          await this.handlePaymentIntentSucceeded(event.data.object as Stripe.PaymentIntent);
          break;

        case 'payment_intent.payment_failed':
          await this.handlePaymentIntentFailed(event.data.object as Stripe.PaymentIntent);
          break;

        case 'charge.refunded':
          await this.handleChargeRefunded(event.data.object as Stripe.Charge);
          break;

        case 'customer.subscription.created':
          logger.info('✓ Subscription created via webhook');
          break;

        case 'customer.subscription.updated':
          logger.info('✓ Subscription updated via webhook');
          break;

        case 'customer.subscription.deleted':
          await this.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
          break;

        case 'invoice.paid':
          logger.info('✓ Invoice paid via webhook');
          break;

        case 'invoice.payment_failed':
          await this.handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
          break;

        default:
          logger.debug(`Unhandled webhook event: ${event.type}`);
      }

      // Mark as processed
      await client.query(
        `UPDATE webhook_events SET processed = TRUE, processed_at = NOW() WHERE event_id = $1`,
        [event.id]
      );
    } catch (error: any) {
      logger.error('Webhook handling error:', error.message);
      await client.query(
        `UPDATE webhook_events SET error_message = $1, retry_count = retry_count + 1 WHERE event_id = $2`,
        [error.message, event.id]
      );
    } finally {
      client.release();
    }
  }

  private async handlePaymentIntentSucceeded(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    logger.info(`✓ Payment intent succeeded: ${paymentIntent.id}`);
    // Update donation status in database
  }

  private async handlePaymentIntentFailed(paymentIntent: Stripe.PaymentIntent): Promise<void> {
    logger.warn(`⚠ Payment intent failed: ${paymentIntent.id}`);
    // Update donation status and schedule retry
  }

  private async handleChargeRefunded(charge: Stripe.Charge): Promise<void> {
    logger.info(`✓ Charge refunded: ${charge.id}`);
    // Update donation refund status
  }

  private async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    logger.info(`✓ Subscription deleted: ${subscription.id}`);
    // Update subscription status in database
  }

  private async handleInvoicePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    logger.warn(`⚠ Invoice payment failed: ${invoice.id}`);
    // Schedule retry for subscription payment
  }
}

// Singleton instance
let stripeService: StripePaymentService | null = null;

export function getStripeService(): StripePaymentService {
  if (!stripeService) {
    stripeService = new StripePaymentService();
  }
  return stripeService;
}
