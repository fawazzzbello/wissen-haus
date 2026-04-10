-- Migration: Add payment and subscription tracking tables
-- Version: 004
-- Description: Enhanced payment processing with subscriptions and webhook logging

-- Add subscription table for recurring donations
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES donors(id) ON DELETE CASCADE,
  stripe_subscription_id VARCHAR(255) UNIQUE NOT NULL,
  stripe_customer_id VARCHAR(255) NOT NULL,
  plan_amount_cents BIGINT NOT NULL,
  currency VARCHAR(3) DEFAULT 'USD',
  frequency VARCHAR(50), -- 'monthly', 'yearly', etc
  status VARCHAR(50) DEFAULT 'active', -- 'active', 'paused', 'cancelled', 'expired'
  next_billing_date TIMESTAMP WITH TIME ZONE,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add webhook event logging table
CREATE TABLE IF NOT EXISTS webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100) NOT NULL,
  provider VARCHAR(50) DEFAULT 'stripe', -- 'stripe', 'paypal', etc
  event_id VARCHAR(255) UNIQUE NOT NULL,
  payload JSONB,
  processed BOOLEAN DEFAULT FALSE,
  error_message TEXT,
  retry_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  processed_at TIMESTAMP WITH TIME ZONE
);

-- Enhance donations table with additional fields
ALTER TABLE donations ADD COLUMN IF NOT EXISTS subscription_id UUID REFERENCES subscriptions(id);
ALTER TABLE donations ADD COLUMN IF NOT EXISTS is_recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS payment_intent_id VARCHAR(255);
ALTER TABLE donations ADD COLUMN IF NOT EXISTS refund_id VARCHAR(255);
ALTER TABLE donations ADD COLUMN IF NOT EXISTS refund_reason TEXT;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS refunded_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE donations ADD COLUMN IF NOT EXISTS refund_amount_cents BIGINT;

-- Add payment method table for storing customer payment methods
CREATE TABLE IF NOT EXISTS payment_methods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES donors(id) ON DELETE CASCADE,
  stripe_payment_method_id VARCHAR(255) UNIQUE NOT NULL,
  card_brand VARCHAR(50), -- 'visa', 'mastercard', etc
  card_last_four VARCHAR(4),
  card_exp_month INTEGER,
  card_exp_year INTEGER,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add payment retry table for failed payments
CREATE TABLE IF NOT EXISTS payment_retries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donation_id UUID REFERENCES donations(id) ON DELETE CASCADE,
  stripe_charge_id VARCHAR(255),
  attempt_number INTEGER DEFAULT 1,
  error_code VARCHAR(100),
  error_message TEXT,
  next_retry_at TIMESTAMP WITH TIME ZONE,
  status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'succeeded', 'failed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_donor_id ON subscriptions(donor_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX IF NOT EXISTS idx_webhook_events_processed ON webhook_events(processed);
CREATE INDEX IF NOT EXISTS idx_payment_methods_donor_id ON payment_methods(donor_id);
CREATE INDEX IF NOT EXISTS idx_payment_retries_status ON payment_retries(status);
CREATE INDEX IF NOT EXISTS idx_donations_subscription_id ON donations(subscription_id);
CREATE INDEX IF NOT EXISTS idx_donations_refund_id ON donations(refund_id);

-- Add updated_at trigger for subscriptions
CREATE OR REPLACE FUNCTION update_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER subscriptions_updated_at_trigger
BEFORE UPDATE ON subscriptions
FOR EACH ROW
EXECUTE FUNCTION update_subscriptions_updated_at();

-- Add updated_at trigger for payment_methods
CREATE OR REPLACE FUNCTION update_payment_methods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_methods_updated_at_trigger
BEFORE UPDATE ON payment_methods
FOR EACH ROW
EXECUTE FUNCTION update_payment_methods_updated_at();

-- Add updated_at trigger for payment_retries
CREATE OR REPLACE FUNCTION update_payment_retries_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER payment_retries_updated_at_trigger
BEFORE UPDATE ON payment_retries
FOR EACH ROW
EXECUTE FUNCTION update_payment_retries_updated_at();
