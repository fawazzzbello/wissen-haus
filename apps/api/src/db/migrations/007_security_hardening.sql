-- Migration: Security Hardening
-- Version: 007
-- Description: Multi-factor authentication, audit logging, and encryption support

-- Multi-factor authentication (MFA) setup table
CREATE TABLE IF NOT EXISTS mfa_setup (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  mfa_type VARCHAR(50), -- 'totp', 'sms', 'email'
  secret VARCHAR(255), -- Encrypted TOTP secret
  backup_codes TEXT[], -- Array of backup codes
  enabled BOOLEAN DEFAULT FALSE,
  enabled_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, mfa_type)
);

-- Login attempts tracking (for rate limiting and security)
CREATE TABLE IF NOT EXISTS login_attempts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255),
  ip_address INET,
  success BOOLEAN DEFAULT FALSE,
  failure_reason VARCHAR(255), -- 'invalid_password', 'invalid_mfa', 'mfa_required', 'account_locked'
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Account lockout tracking
CREATE TABLE IF NOT EXISTS account_lockouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  reason VARCHAR(255), -- 'too_many_failed_attempts', 'suspicious_activity', 'manual'
  locked_until TIMESTAMP WITH TIME ZONE,
  created_by UUID, -- Admin who locked (if manual)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Audit log table for tracking all sensitive operations
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  action VARCHAR(100), -- 'user_created', 'donation_refunded', 'campaign_updated', 'mfa_enabled'
  resource_type VARCHAR(100), -- 'user', 'donation', 'campaign', 'mfa', 'password'
  resource_id VARCHAR(255), -- ID of the affected resource
  change_summary TEXT, -- What changed (sensitive data masked)
  status VARCHAR(50), -- 'success', 'failure'
  error_message TEXT, -- Error details if failed
  ip_address INET,
  user_agent TEXT,
  metadata JSONB, -- Additional context
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Encryption key rotation tracking
CREATE TABLE IF NOT EXISTS encryption_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key_version INTEGER, -- Version number for key rotation
  key_fingerprint VARCHAR(255), -- Hash of public key
  is_active BOOLEAN DEFAULT TRUE,
  rotation_scheduled_at TIMESTAMP WITH TIME ZONE,
  rotated_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Session security table
CREATE TABLE IF NOT EXISTS secure_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255), -- Hash of the session token
  ip_address INET,
  user_agent TEXT,
  device_fingerprint VARCHAR(255),
  is_active BOOLEAN DEFAULT TRUE,
  last_activity TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Password history (to prevent reusing recent passwords)
CREATE TABLE IF NOT EXISTS password_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  password_hash VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API rate limit tracking
CREATE TABLE IF NOT EXISTS rate_limit_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier VARCHAR(255), -- IP address, API key, or user ID
  endpoint VARCHAR(255),
  limit_type VARCHAR(50), -- 'ip', 'user', 'api_key'
  requests_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE,
  window_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Security events (suspicious activities)
CREATE TABLE IF NOT EXISTS security_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(100), -- 'brute_force_attempt', 'credential_stuffing', 'unusual_location', 'multiple_failures'
  severity VARCHAR(50), -- 'low', 'medium', 'high', 'critical'
  description TEXT,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  ip_address INET,
  email VARCHAR(255),
  metadata JSONB,
  action_taken VARCHAR(100), -- 'none', 'rate_limited', 'account_locked', 'notification_sent'
  resolved BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_mfa_setup_user_id ON mfa_setup(user_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_ip_address ON login_attempts(ip_address);
CREATE INDEX IF NOT EXISTS idx_login_attempts_created_at ON login_attempts(created_at);
CREATE INDEX IF NOT EXISTS idx_account_lockouts_user_id ON account_lockouts(user_id);
CREATE INDEX IF NOT EXISTS idx_account_lockouts_locked_until ON account_lockouts(locked_until);
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource_type ON audit_logs(resource_type);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at ON audit_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_secure_sessions_user_id ON secure_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_secure_sessions_token_hash ON secure_sessions(token_hash);
CREATE INDEX IF NOT EXISTS idx_password_history_user_id ON password_history(user_id);
CREATE INDEX IF NOT EXISTS idx_rate_limit_records_identifier ON rate_limit_records(identifier);
CREATE INDEX IF NOT EXISTS idx_rate_limit_records_endpoint ON rate_limit_records(endpoint);
CREATE INDEX IF NOT EXISTS idx_security_events_severity ON security_events(severity);
CREATE INDEX IF NOT EXISTS idx_security_events_created_at ON security_events(created_at);

-- Update users table to add security fields
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_enabled BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS mfa_verified BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_ip INET;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_locked BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS account_locked_until TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS failed_login_attempts INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_changed_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS two_factor_backup_used INTEGER DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS encryption_key_version INTEGER DEFAULT 1;

-- Clean up old audit logs periodically (30 days retention)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM audit_logs WHERE created_at < NOW() - INTERVAL '30 days';
  DELETE FROM login_attempts WHERE created_at < NOW() - INTERVAL '90 days';
  DELETE FROM rate_limit_records WHERE window_end < NOW();
END;
$$ LANGUAGE plpgsql;

-- Function to check account lockout status
CREATE OR REPLACE FUNCTION check_account_locked(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_locked BOOLEAN;
BEGIN
  SELECT account_locked INTO v_locked FROM users WHERE id = p_user_id;
  RETURN COALESCE(v_locked, FALSE);
END;
$$ LANGUAGE plpgsql;

-- Function to record login attempt
CREATE OR REPLACE FUNCTION record_login_attempt(p_email VARCHAR, p_ip_address INET, p_success BOOLEAN, p_reason VARCHAR, p_user_agent TEXT)
RETURNS void AS $$
BEGIN
  INSERT INTO login_attempts (email, ip_address, success, failure_reason, user_agent)
  VALUES (p_email, p_ip_address, p_success, p_reason, p_user_agent);
END;
$$ LANGUAGE plpgsql;

-- Function to log security event
CREATE OR REPLACE FUNCTION log_security_event(p_event_type VARCHAR, p_severity VARCHAR, p_description TEXT, p_user_id UUID, p_ip_address INET, p_email VARCHAR)
RETURNS void AS $$
BEGIN
  INSERT INTO security_events (event_type, severity, description, user_id, ip_address, email)
  VALUES (p_event_type, p_severity, p_description, p_user_id, p_ip_address, p_email);
END;
$$ LANGUAGE plpgsql;
