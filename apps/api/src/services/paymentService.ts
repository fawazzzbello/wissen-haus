import Stripe from 'stripe';
import { v4 as uuidv4 } from 'uuid';
import { query } from '@/config/database';
import { logger } from '@/utils/logger';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2023-10-16',
});

export interface CreateDonationRequest {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  country?: string;
  amount: number; // in cents
  currency: string;
  description?: string;
  type: 'one_time' | 'recurring';
  recurringFrequency?: 'monthly' | 'yearly';
}

export interface PaymentSession {
  sessionId: string;
  clientSecret: string;
  publishableKey: string;
}

export interface DonationRecord {
  id: string;
  donorId: string;
  amount: number;
  currency: string;
  status: string;
  stripePaymentIntentId: string;
  createdAt: Date;
}

// Create or update donor
async function createOrUpdateDonor(
  email: string,
  firstName: string,
  lastName: string,
  phone?: string,
  country?: string
) {
  try {
    // Check if donor exists
    const result = await query(
      'SELECT id, stripe_customer_id FROM donors WHERE email = $1',
      [email]
    );

    let donorId: string;
    let stripeCustomerId: string | null = null;

    if (result.rows.length > 0) {
      donorId = result.rows[0].id;
      stripeCustomerId = result.rows[0].stripe_customer_id;
    } else {
      // Create new donor
      donorId = uuidv4();
      const insertResult = await query(
        `INSERT INTO donors (id, email, first_name, last_name, phone, country)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING id`,
        [donorId, email, firstName, lastName, phone || null, country || null]
      );
      donorId = insertResult.rows[0].id;
    }

    // Create or retrieve Stripe customer
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email,
        name: `${firstName} ${lastName}`,
        phone: phone,
        address: country ? { country } : undefined,
      });
      stripeCustomerId = customer.id;

      // Update donor with Stripe customer ID
      await query(
        'UPDATE donors SET stripe_customer_id = $1 WHERE id = $2',
        [stripeCustomerId, donorId]
      );
    }

    return { donorId, stripeCustomerId };
  } catch (error) {
    logger.error('Error creating/updating donor:', error);
    throw error;
  }
}

// Create checkout session
export async function createCheckoutSession(
  req: CreateDonationRequest
): Promise<PaymentSession> {
  try {
    const { email, firstName, lastName, phone, country, amount, currency, description, type } = req;

    // Create or update donor
    const { stripeCustomerId } = await createOrUpdateDonor(
      email,
      firstName,
      lastName,
      phone,
      country
    );

    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: currency.toLowerCase(),
      customer: stripeCustomerId,
      description: description || 'Donation to Wissen-Haus',
      metadata: {
        type,
        donor_email: email,
        donor_name: `${firstName} ${lastName}`,
      },
    });

    return {
      sessionId: paymentIntent.id,
      clientSecret: paymentIntent.client_secret || '',
      publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    };
  } catch (error) {
    logger.error('Error creating checkout session:', error);
    throw error;
  }
}

// Handle payment success webhook
export async function handlePaymentIntentSucceeded(paymentIntent: any): Promise<void> {
  try {
    const { id: stripePaymentIntentId, amount, currency, customer: stripeCustomerId, metadata } = paymentIntent;

    // Find donor by Stripe customer ID
    const donorResult = await query(
      'SELECT id FROM donors WHERE stripe_customer_id = $1',
      [stripeCustomerId]
    );

    if (donorResult.rows.length === 0) {
      logger.warn(`Donor not found for Stripe customer: ${stripeCustomerId}`);
      return;
    }

    const donorId = donorResult.rows[0].id;

    // Check if donation already exists
    const existingDonation = await query(
      'SELECT id FROM donations WHERE stripe_payment_intent_id = $1',
      [stripePaymentIntentId]
    );

    if (existingDonation.rows.length > 0) {
      logger.warn(`Donation already recorded for payment intent: ${stripePaymentIntentId}`);
      return;
    }

    // Create donation record
    const donationId = uuidv4();
    await query(
      `INSERT INTO donations (
        id, donor_id, amount, currency, donation_type, status,
        stripe_payment_intent_id, description, processed_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)`,
      [
        donationId,
        donorId,
        amount / 100, // Convert from cents
        currency,
        metadata?.type || 'one_time',
        'completed',
        stripePaymentIntentId,
        metadata?.donor_name ? `Donation from ${metadata.donor_name}` : 'Donation',
      ]
    );

    // Update donor statistics
    await query(
      `UPDATE donors SET
        total_donated = total_donated + $1,
        donation_count = donation_count + 1,
        last_donation_at = CURRENT_TIMESTAMP
      WHERE id = $2`,
      [amount / 100, donorId]
    );

    // Log donation event
    await query(
      `INSERT INTO donation_events (donation_id, event_type, details)
       VALUES ($1, $2, $3)`,
      [
        donationId,
        'payment_completed',
        JSON.stringify({
          amount,
          currency,
          stripePaymentIntentId,
          timestamp: new Date().toISOString(),
        }),
      ]
    );

    logger.info(`Donation recorded: ${donationId} from ${stripeCustomerId}`);
  } catch (error) {
    logger.error('Error handling payment success:', error);
    throw error;
  }
}

// Handle payment failure webhook
export async function handlePaymentIntentFailed(paymentIntent: any): Promise<void> {
  try {
    const { id: stripePaymentIntentId, customer: stripeCustomerId, last_payment_error } = paymentIntent;

    // Find donor by Stripe customer ID
    const donorResult = await query(
      'SELECT id FROM donors WHERE stripe_customer_id = $1',
      [stripeCustomerId]
    );

    if (donorResult.rows.length === 0) {
      logger.warn(`Donor not found for Stripe customer: ${stripeCustomerId}`);
      return;
    }

    const donorId = donorResult.rows[0].id;

    // Create failed donation record
    const donationId = uuidv4();
    await query(
      `INSERT INTO donations (
        id, donor_id, amount, currency, donation_type, status,
        stripe_payment_intent_id, description, created_at
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, CURRENT_TIMESTAMP)`,
      [
        donationId,
        donorId,
        paymentIntent.amount / 100,
        paymentIntent.currency,
        'one_time',
        'failed',
        stripePaymentIntentId,
        `Failed donation attempt: ${last_payment_error?.message || 'Unknown error'}`,
      ]
    );

    logger.warn(`Payment failed: ${stripePaymentIntentId} - ${last_payment_error?.message}`);
  } catch (error) {
    logger.error('Error handling payment failure:', error);
  }
}

// Verify webhook signature
export function verifyWebhookSignature(
  body: string,
  signature: string
): any {
  try {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    return event;
  } catch (error) {
    logger.error('Webhook signature verification failed:', error);
    throw error;
  }
}

// Get donation by ID
export async function getDonationById(donationId: string): Promise<DonationRecord | null> {
  try {
    const result = await query(
      `SELECT id, donor_id, amount, currency, status, stripe_payment_intent_id, created_at
       FROM donations WHERE id = $1`,
      [donationId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    logger.error('Error fetching donation:', error);
    throw error;
  }
}

// Get donations with pagination
export async function getDonations(
  limit: number = 50,
  offset: number = 0,
  status?: string
) {
  try {
    let query_str = 'SELECT * FROM donations';
    const params: any[] = [];

    if (status) {
      query_str += ' WHERE status = $1';
      params.push(status);
    }

    query_str += ' ORDER BY created_at DESC LIMIT $' + (params.length + 1) + ' OFFSET $' + (params.length + 2);
    params.push(limit, offset);

    const result = await query(query_str, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) FROM donations';
    if (status) {
      countQuery += ' WHERE status = $1';
    }

    const countResult = await query(countQuery, status ? [status] : []);
    const total = parseInt(countResult.rows[0].count);

    return {
      donations: result.rows,
      total,
      limit,
      offset,
    };
  } catch (error) {
    logger.error('Error fetching donations:', error);
    throw error;
  }
}

// Get donation statistics
export async function getDonationStats() {
  try {
    const result = await query(`
      SELECT
        COUNT(*) as total_donations,
        SUM(amount) as total_amount,
        AVG(amount) as average_amount,
        COUNT(DISTINCT donor_id) as unique_donors,
        SUM(CASE WHEN donation_type = 'recurring' THEN 1 ELSE 0 END) as recurring_count
      FROM donations
      WHERE status = 'completed'
    `);

    return result.rows[0];
  } catch (error) {
    logger.error('Error fetching donation stats:', error);
    throw error;
  }
}

// Refund donation
export async function refundDonation(donationId: string, reason?: string): Promise<void> {
  try {
    // Get donation details
    const donation = await getDonationById(donationId);
    if (!donation) {
      throw new Error('Donation not found');
    }

    if (donation.status !== 'completed') {
      throw new Error('Only completed donations can be refunded');
    }

    // Process refund with Stripe
    await stripe.refunds.create({
      payment_intent: donation.stripe_payment_intent_id,
      reason: reason ? 'requested_by_customer' : undefined,
      metadata: {
        donation_id: donationId,
        refund_reason: reason,
      },
    });

    // Update donation status
    await query(
      'UPDATE donations SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['refunded', donationId]
    );

    logger.info(`Donation refunded: ${donationId}`);
  } catch (error) {
    logger.error('Error refunding donation:', error);
    throw error;
  }
}
