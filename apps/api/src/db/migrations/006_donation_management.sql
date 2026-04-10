-- Migration: Add donation management, campaigns, and batch reporting
-- Version: 006
-- Description: Campaign management, enhanced donation tracking, and batch reporting

-- Donation campaigns table
CREATE TABLE IF NOT EXISTS donation_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  goal_amount_cents BIGINT,
  current_amount_cents BIGINT DEFAULT 0,
  status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'active', 'paused', 'closed', 'archived'
  campaign_type VARCHAR(50), -- 'general', 'emergency', 'specific_project', 'recurring'
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  target_donors INTEGER,
  current_donor_count INTEGER DEFAULT 0,
  image_url VARCHAR(2048),
  impact_statement TEXT,
  metadata JSONB,
  created_by UUID, -- Admin user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Campaign milestones table
CREATE TABLE IF NOT EXISTS campaign_milestones (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID REFERENCES donation_campaigns(id) ON DELETE CASCADE,
  milestone_number INTEGER,
  target_amount_cents BIGINT,
  current_amount_cents BIGINT DEFAULT 0,
  description TEXT,
  reward_description TEXT, -- What donors get at this milestone
  achieved_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donation details table (enhanced)
-- Adds campaign tracking, source attribution, and metadata
ALTER TABLE donations ADD COLUMN IF NOT EXISTS campaign_id UUID REFERENCES donation_campaigns(id);
ALTER TABLE donations ADD COLUMN IF NOT EXISTS donation_source VARCHAR(50), -- 'website', 'email', 'event', 'referral', 'phone'
ALTER TABLE donations ADD COLUMN IF NOT EXISTS donor_name_at_time VARCHAR(255); -- Preserve donor name at time of donation
ALTER TABLE donations ADD COLUMN IF NOT EXISTS notes TEXT; -- Admin notes
ALTER TABLE donations ADD COLUMN IF NOT EXISTS impact_message TEXT; -- Message about impact of donation
ALTER TABLE donations ADD COLUMN IF NOT EXISTS tax_deductible BOOLEAN DEFAULT TRUE;

-- Batch reporting table
CREATE TABLE IF NOT EXISTS batch_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_type VARCHAR(50), -- 'daily', 'weekly', 'monthly', 'quarterly', 'annual'
  period_start TIMESTAMP WITH TIME ZONE,
  period_end TIMESTAMP WITH TIME ZONE,
  total_donations BIGINT,
  total_amount_cents BIGINT,
  donor_count INTEGER,
  new_donors INTEGER,
  recurring_donors INTEGER,
  average_donation_cents BIGINT,
  largest_donation_cents BIGINT,
  top_campaign_id UUID REFERENCES donation_campaigns(id),
  top_campaign_amount_cents BIGINT,
  summary_data JSONB, -- Detailed metrics as JSON
  generated_by UUID, -- Admin user ID
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donor preferences table
CREATE TABLE IF NOT EXISTS donor_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES donors(id) ON DELETE CASCADE UNIQUE,
  communication_frequency VARCHAR(50), -- 'weekly', 'monthly', 'quarterly', 'never'
  prefers_email BOOLEAN DEFAULT TRUE,
  prefers_phone BOOLEAN DEFAULT FALSE,
  prefers_sms BOOLEAN DEFAULT FALSE,
  anonymous_donation BOOLEAN DEFAULT FALSE,
  receive_impact_reports BOOLEAN DEFAULT TRUE,
  receive_newsletters BOOLEAN DEFAULT TRUE,
  receive_event_invitations BOOLEAN DEFAULT TRUE,
  marketing_consent BOOLEAN DEFAULT TRUE,
  unsubscribe_date TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Donor notes table
CREATE TABLE IF NOT EXISTS donor_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  donor_id UUID REFERENCES donors(id) ON DELETE CASCADE,
  note_type VARCHAR(50), -- 'internal', 'follow_up', 'thank_you', 'issue', 'other'
  content TEXT NOT NULL,
  created_by UUID, -- Admin user ID
  is_internal BOOLEAN DEFAULT TRUE, -- Not visible to donor
  follow_up_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Batch processing log
CREATE TABLE IF NOT EXISTS batch_processing_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  batch_type VARCHAR(50), -- 'thank_you_emails', 'reports', 'tax_letters', 'reconciliation'
  status VARCHAR(50), -- 'pending', 'processing', 'completed', 'failed'
  total_items INTEGER,
  processed_items INTEGER,
  failed_items INTEGER,
  error_message TEXT,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_donation_campaigns_status ON donation_campaigns(status);
CREATE INDEX IF NOT EXISTS idx_donation_campaigns_created_at ON donation_campaigns(created_at);
CREATE INDEX IF NOT EXISTS idx_campaign_milestones_campaign_id ON campaign_milestones(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_campaign_id ON donations(campaign_id);
CREATE INDEX IF NOT EXISTS idx_donations_donation_source ON donations(donation_source);
CREATE INDEX IF NOT EXISTS idx_batch_reports_period ON batch_reports(period_start, period_end);
CREATE INDEX IF NOT EXISTS idx_donor_preferences_donor_id ON donor_preferences(donor_id);
CREATE INDEX IF NOT EXISTS idx_donor_notes_donor_id ON donor_notes(donor_id);
CREATE INDEX IF NOT EXISTS idx_batch_processing_logs_status ON batch_processing_logs(status);

-- Add updated_at triggers
CREATE OR REPLACE FUNCTION update_donation_campaigns_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER donation_campaigns_updated_at_trigger
BEFORE UPDATE ON donation_campaigns
FOR EACH ROW
EXECUTE FUNCTION update_donation_campaigns_updated_at();

CREATE OR REPLACE FUNCTION update_donor_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER donor_preferences_updated_at_trigger
BEFORE UPDATE ON donor_preferences
FOR EACH ROW
EXECUTE FUNCTION update_donor_preferences_updated_at();

-- Function to update campaign totals when donations are added
CREATE OR REPLACE FUNCTION update_campaign_totals()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.campaign_id IS NOT NULL AND NEW.status = 'completed' THEN
    UPDATE donation_campaigns
    SET current_amount_cents = current_amount_cents + NEW.amount_cents,
        current_donor_count = (SELECT COUNT(DISTINCT donor_id) FROM donations WHERE campaign_id = NEW.campaign_id AND status = 'completed')
    WHERE id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_campaign_totals_trigger
AFTER INSERT ON donations
FOR EACH ROW
EXECUTE FUNCTION update_campaign_totals();

-- Function to update milestone progress
CREATE OR REPLACE FUNCTION update_milestone_progress()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.campaign_id IS NOT NULL THEN
    UPDATE campaign_milestones
    SET current_amount_cents = (
      SELECT COALESCE(SUM(amount_cents), 0)
      FROM donations
      WHERE campaign_id = NEW.campaign_id AND status = 'completed'
    )
    WHERE campaign_id = NEW.campaign_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_milestone_progress_trigger
AFTER INSERT OR UPDATE ON donations
FOR EACH ROW
EXECUTE FUNCTION update_milestone_progress();
