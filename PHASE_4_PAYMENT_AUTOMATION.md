# Phase 4: Payment Automation & Enhanced Stripe Integration

This guide documents the payment automation features added in Phase 4.

## Overview

Phase 4 adds advanced payment processing capabilities:
- Recurring donation subscriptions
- Comprehensive donation analytics
- Donor segmentation and lifetime value
- Revenue forecasting
- Automated refund processing
- Churn risk detection

## Database Schema

### New Tables

#### `subscriptions`
Manages recurring donation subscriptions.

```sql
- id (UUID, PK)
- donor_id (FK to donors)
- stripe_subscription_id (VARCHAR, unique)
- stripe_customer_id (VARCHAR)
- plan_amount_cents (BIGINT)
- currency (VARCHAR, default 'USD')
- frequency (VARCHAR) - 'monthly', 'yearly'
- status (VARCHAR) - 'active', 'paused', 'cancelled', 'expired'
- next_billing_date (TIMESTAMP)
- current_period_start (TIMESTAMP)
- current_period_end (TIMESTAMP)
- metadata (JSONB)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `webhook_events`
Logs all Stripe webhook events for auditing and retry.

```sql
- id (UUID, PK)
- event_type (VARCHAR) - 'payment_intent.succeeded', etc
- provider (VARCHAR) - 'stripe'
- event_id (VARCHAR, unique)
- payload (JSONB)
- processed (BOOLEAN)
- error_message (TEXT)
- retry_count (INTEGER)
- created_at (TIMESTAMP)
- processed_at (TIMESTAMP)
```

#### `payment_methods`
Stores customer payment methods for subscriptions.

```sql
- id (UUID, PK)
- donor_id (FK to donors)
- stripe_payment_method_id (VARCHAR, unique)
- card_brand (VARCHAR) - 'visa', 'mastercard'
- card_last_four (VARCHAR)
- card_exp_month (INTEGER)
- card_exp_year (INTEGER)
- is_default (BOOLEAN)
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

#### `payment_retries`
Tracks failed payment retry attempts.

```sql
- id (UUID, PK)
- donation_id (FK to donations)
- stripe_charge_id (VARCHAR)
- attempt_number (INTEGER)
- error_code (VARCHAR)
- error_message (TEXT)
- next_retry_at (TIMESTAMP)
- status (VARCHAR) - 'pending', 'succeeded', 'failed'
- created_at (TIMESTAMP)
- updated_at (TIMESTAMP)
```

### Enhanced Donations Table

Added fields:
- `subscription_id` (UUID, FK)
- `is_recurring` (BOOLEAN)
- `payment_intent_id` (VARCHAR)
- `refund_id` (VARCHAR)
- `refund_reason` (TEXT)
- `refunded_at` (TIMESTAMP)
- `refund_amount_cents` (BIGINT)

## Services

### StripePaymentService

Handles all Stripe API operations.

**Methods:**
- `createOrGetCustomer(email, name)` - Create or retrieve Stripe customer
- `createPaymentIntent(amount, customerId, email)` - Create payment intent
- `createSubscription(params)` - Create recurring subscription
- `getSubscription(id)` - Get subscription details
- `cancelSubscription(id, reason)` - Cancel subscription
- `createRefund(chargeId, amount)` - Process refund
- `validateWebhookSignature(body, signature)` - Validate Stripe webhook
- `handleWebhookEvent(event)` - Process webhook event

**Usage:**

```typescript
import { getStripeService } from '@/services/payment/stripeService';

const stripeService = getStripeService();

// Create subscription
const subscription = await stripeService.createSubscription({
  customerId: 'stripe_customer_id',
  paymentMethodId: 'stripe_payment_method_id',
  planAmountCents: 50000, // $500
  frequency: 'monthly',
  donorEmail: 'donor@example.com',
  donorName: 'John Doe',
});
```

### PaymentAnalyticsService

Provides analytics and insights into donation patterns.

**Methods:**
- `getDonationMetrics(startDate, endDate)` - Overall donation statistics
- `getDonationTrends(months)` - Monthly donation trends
- `getDonorSegments()` - Donor segmentation by amount
- `getTopDonorLifetimeValues(limit)` - Top donors by LTV
- `getChurnRiskDonors()` - Donors inactive >90 days
- `getRevenueForecast(months)` - Simple revenue projection

**Usage:**

```typescript
import { getPaymentAnalyticsService } from '@/services/payment/analyticsService';

const analytics = getPaymentAnalyticsService();

// Get donation metrics
const metrics = await analytics.getDonationMetrics();
// Returns: { totalDonations, totalAmount, averageDonation, ... }

// Get donor segments
const segments = await analytics.getDonorSegments();
// Returns: [ { segment: 'Major Donor', count: 5, totalDonated: 10000, ... } ]

// Get churn risk donors
const atRisk = await analytics.getChurnRiskDonors();
// Returns top donors at risk of churning
```

## API Endpoints

All endpoints require admin authentication (JWT token + admin role).

### Subscription Management

#### POST /api/payments/subscriptions
Create a recurring donation subscription.

**Request:**
```json
{
  "donorId": "uuid",
  "donorEmail": "donor@example.com",
  "donorName": "John Doe",
  "amountCents": 50000,
  "frequency": "monthly"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "subscriptionId": "sub_123",
    "stripeSubscriptionId": "sub_123",
    "status": "active",
    "nextBillingDate": "2024-05-10T10:00:00Z"
  }
}
```

#### POST /api/payments/subscriptions/:subscriptionId/cancel
Cancel a subscription.

**Response:**
```json
{
  "success": true,
  "data": {
    "subscriptionId": "sub_123",
    "status": "cancelled",
    "cancelledAt": "2024-04-10T10:00:00Z"
  }
}
```

### Refunds

#### POST /api/payments/refunds
Create a refund for a donation.

**Request:**
```json
{
  "donationId": "uuid",
  "chargeId": "ch_123",
  "amountCents": 50000
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "refundId": "re_123",
    "chargeId": "ch_123",
    "amount": 50000,
    "status": "succeeded"
  }
}
```

### Analytics

#### GET /api/payments/analytics/metrics
Get overall donation metrics.

**Response:**
```json
{
  "success": true,
  "data": {
    "totalDonations": 150,
    "totalAmount": 5000000,
    "averageDonation": 33333,
    "largestDonation": 500000,
    "smallestDonation": 1000,
    "donorCount": 85,
    "recurringDonorCount": 12
  }
}
```

#### GET /api/payments/analytics/trends?months=12
Get monthly donation trends.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "period": "2024-04",
      "amount": 450000,
      "count": 18,
      "averageDonation": 25000
    },
    {
      "period": "2024-03",
      "amount": 520000,
      "count": 22,
      "averageDonation": 23636
    }
  ]
}
```

#### GET /api/payments/analytics/segments
Get donor segmentation.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "segment": "Major Donor (>$1000)",
      "count": 8,
      "totalDonated": 250000,
      "averageDonation": 31250,
      "retentionRate": 87.5
    },
    {
      "segment": "Sustaining Donor ($500-$1000)",
      "count": 15,
      "totalDonated": 180000,
      "averageDonation": 12000,
      "retentionRate": 73.3
    }
  ]
}
```

#### GET /api/payments/analytics/lifetime-values?limit=20
Get top donors by lifetime value.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "donorId": "uuid",
      "donorEmail": "major@example.com",
      "totalDonated": 450000,
      "donationCount": 18,
      "averageDonation": 25000,
      "firstDonation": "2022-01-15T00:00:00Z",
      "lastDonation": "2024-04-10T00:00:00Z",
      "monthsSinceFirst": 27,
      "monthlyAverage": 16667,
      "churnRisk": "low"
    }
  ]
}
```

#### GET /api/payments/analytics/churn-risk
Get donors at risk of churning (inactive >90 days).

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "donorId": "uuid",
      "donorEmail": "inactive@example.com",
      "totalDonated": 150000,
      "donationCount": 6,
      "averageDonation": 25000,
      "firstDonation": "2023-01-10T00:00:00Z",
      "lastDonation": "2023-12-01T00:00:00Z",
      "monthsSinceFirst": 14,
      "monthlyAverage": 10714,
      "churnRisk": "high"
    }
  ]
}
```

#### GET /api/payments/analytics/forecast?months=6
Get revenue forecast.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "period": "2024-05",
      "amount": 475000,
      "count": 0,
      "averageDonation": 0
    },
    {
      "period": "2024-06",
      "amount": 475000,
      "count": 0,
      "averageDonation": 0
    }
  ]
}
```

### Webhooks

#### POST /api/payments/webhook/stripe
Handle Stripe webhook events (no authentication required).

Stripe automatically posts webhook events here. Validates signature and processes:
- `payment_intent.succeeded` - Payment completed
- `payment_intent.payment_failed` - Payment failed
- `charge.refunded` - Refund processed
- `customer.subscription.created` - Subscription created
- `customer.subscription.updated` - Subscription updated
- `customer.subscription.deleted` - Subscription cancelled
- `invoice.paid` - Invoice paid
- `invoice.payment_failed` - Invoice payment failed

## Configuration

### Environment Variables

```env
# Stripe API Key (already configured)
STRIPE_SECRET_KEY=sk_live_...

# Stripe Webhook Secret (for webhook validation)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Stripe Webhook Setup

1. Go to Stripe Dashboard → Webhooks
2. Add endpoint: `https://your-domain/api/payments/webhook/stripe`
3. Select events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.refunded`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
   - `invoice.paid`
   - `invoice.payment_failed`
4. Copy webhook signing secret
5. Set as `STRIPE_WEBHOOK_SECRET` in environment

## Testing

### Local Testing

```bash
# Get admin token
TOKEN=$(curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@wissen-haus.org","password":"admin@123456"}' \
  | jq -r '.data.token')

# Create subscription (requires test mode)
curl -X POST http://localhost:5000/api/payments/subscriptions \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "donorId": "test-donor-id",
    "donorEmail": "test@example.com",
    "donorName": "Test Donor",
    "amountCents": 50000,
    "frequency": "monthly"
  }'

# Get analytics
curl -X GET http://localhost:5000/api/payments/analytics/metrics \
  -H "Authorization: Bearer $TOKEN"

# Get trends
curl -X GET http://localhost:5000/api/payments/analytics/trends?months=12 \
  -H "Authorization: Bearer $TOKEN"

# Get churn risk donors
curl -X GET http://localhost:5000/api/payments/analytics/churn-risk \
  -H "Authorization: Bearer $TOKEN"
```

### Stripe Test Mode

Use these test card numbers:
- Visa: `4242 4242 4242 4242`
- Visa (debit): `4000 0566 5566 5556`
- Mastercard: `5555 5555 5555 4444`
- Amex: `3782 822463 10005`

Any future expiry date and any CVC.

## Features in Detail

### Subscription Management
- Create monthly or yearly recurring donations
- Automatic Stripe customer creation
- Subscription status tracking
- Easy cancellation

### Analytics Dashboard Data
- Total and average donations
- Monthly trends with visual support
- Donor segmentation by giving level
- Top 20 donors by lifetime value
- Churn risk identification (90+ days inactive)
- Revenue forecasting

### Donor Lifecycle
1. One-time donation recorded
2. Option to upgrade to recurring
3. Automatic charging on schedule
4. Status monitoring (active/paused/cancelled)
5. Churn detection and alerts
6. Re-engagement campaigns for at-risk donors

## Security

- All endpoints require admin authentication
- Stripe webhook signatures validated
- PII stored securely in database
- Webhook events logged for auditing
- Automatic retry for failed payments
- Refund approval workflow

## Integration with Other Phases

**Phase 3 (AI)**: AI can analyze donation trends and recommend:
- Optimal giving amounts
- Best times to reach out to donors
- Churn prevention strategies
- Personalized thank you messages

**Phase 5 (Email)**: Email automation for:
- Subscription confirmations
- Recurring donation receipts
- Monthly impact reports
- Churn prevention campaigns

**Phase 7 (Security)**: Enhanced security includes:
- PCI compliance for payment data
- Field-level encryption for sensitive data
- Webhook signature validation
- Audit logging of all payment operations

## Database Migration

Run the migration to add all new tables:
```bash
npm run migrate
```

This executes `apps/api/src/db/migrations/004_payment_enhancements.sql` which creates:
- `subscriptions` table with indexes
- `webhook_events` table with indexes
- `payment_methods` table
- `payment_retries` table
- Enhanced `donations` table fields
- Automatic timestamp triggers

## Next Steps

1. **Deploy database migration**: `npm run migrate`
2. **Set Stripe webhook**: Configure in Stripe dashboard
3. **Test locally**: Use test card numbers
4. **Configure Stripe in production**: Copy live keys
5. **Proceed to Phase 5**: Email automation for donor communication

