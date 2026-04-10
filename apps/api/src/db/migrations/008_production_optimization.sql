-- Migration: Production Optimization
-- Version: 008
-- Description: Performance monitoring, metrics, and optimization infrastructure

-- Performance metrics table
CREATE TABLE IF NOT EXISTS performance_metrics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  metric_name VARCHAR(100), -- 'api_response_time', 'db_query_time', 'cache_hit_rate'
  endpoint VARCHAR(255), -- API endpoint path
  method VARCHAR(10), -- HTTP method (GET, POST, etc.)
  response_time_ms INTEGER, -- Response time in milliseconds
  status_code INTEGER, -- HTTP status code
  db_query_count INTEGER, -- Number of database queries
  cache_hit BOOLEAN, -- Whether response was cached
  user_id UUID, -- Optional user ID for tracking
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Query performance tracking
CREATE TABLE IF NOT EXISTS slow_queries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash VARCHAR(64), -- Hash of query for grouping
  query_text TEXT, -- The actual query (truncated)
  execution_time_ms INTEGER, -- Execution time
  execution_count INTEGER DEFAULT 1, -- How many times executed
  last_executed TIMESTAMP WITH TIME ZONE,
  is_indexed BOOLEAN DEFAULT FALSE, -- Whether it uses indexes
  suggestion TEXT, -- Performance improvement suggestion
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Cache statistics
CREATE TABLE IF NOT EXISTS cache_statistics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cache_key VARCHAR(255),
  hit_count INTEGER DEFAULT 0,
  miss_count INTEGER DEFAULT 0,
  eviction_count INTEGER DEFAULT 0,
  size_bytes BIGINT,
  ttl_seconds INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Service health check logs
CREATE TABLE IF NOT EXISTS health_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  service_name VARCHAR(100), -- 'database', 'redis', 'smtp', 'payment_gateway'
  status VARCHAR(20), -- 'healthy', 'degraded', 'unhealthy'
  response_time_ms INTEGER,
  error_message TEXT,
  details JSONB, -- Additional health information
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- API request logs (for analytics and debugging)
CREATE TABLE IF NOT EXISTS api_request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID,
  method VARCHAR(10),
  endpoint VARCHAR(255),
  status_code INTEGER,
  response_time_ms INTEGER,
  request_size_bytes INTEGER,
  response_size_bytes INTEGER,
  error_message TEXT,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Database maintenance logs
CREATE TABLE IF NOT EXISTS maintenance_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  maintenance_type VARCHAR(100), -- 'index_rebuild', 'vacuum', 'analyze', 'backup'
  table_name VARCHAR(255),
  status VARCHAR(50), -- 'pending', 'running', 'completed', 'failed'
  duration_ms INTEGER,
  rows_affected BIGINT,
  error_message TEXT,
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Resource usage tracking
CREATE TABLE IF NOT EXISTS resource_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  resource_type VARCHAR(50), -- 'memory', 'cpu', 'disk', 'connections'
  current_usage BIGINT,
  max_capacity BIGINT,
  usage_percentage INTEGER,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Query execution plan cache (for EXPLAIN ANALYZE results)
CREATE TABLE IF NOT EXISTS query_execution_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  query_hash VARCHAR(64),
  execution_plan TEXT,
  plan_analyzed_at TIMESTAMP WITH TIME ZONE,
  recommendations TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_performance_metrics_endpoint ON performance_metrics(endpoint);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_created_at ON performance_metrics(created_at);
CREATE INDEX IF NOT EXISTS idx_performance_metrics_response_time ON performance_metrics(response_time_ms);
CREATE INDEX IF NOT EXISTS idx_slow_queries_query_hash ON slow_queries(query_hash);
CREATE INDEX IF NOT EXISTS idx_slow_queries_execution_time ON slow_queries(execution_time_ms);
CREATE INDEX IF NOT EXISTS idx_cache_statistics_cache_key ON cache_statistics(cache_key);
CREATE INDEX IF NOT EXISTS idx_health_checks_service_name ON health_checks(service_name);
CREATE INDEX IF NOT EXISTS idx_health_checks_created_at ON health_checks(created_at);
CREATE INDEX IF NOT EXISTS idx_api_request_logs_user_id ON api_request_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_request_logs_endpoint ON api_request_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_api_request_logs_created_at ON api_request_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_maintenance_logs_status ON maintenance_logs(status);
CREATE INDEX IF NOT EXISTS idx_resource_usage_timestamp ON resource_usage(timestamp);

-- Function to calculate average response time by endpoint
CREATE OR REPLACE FUNCTION get_endpoint_performance(p_endpoint VARCHAR, p_hours INTEGER DEFAULT 24)
RETURNS TABLE (
  endpoint VARCHAR,
  avg_response_time_ms NUMERIC,
  min_response_time_ms INTEGER,
  max_response_time_ms INTEGER,
  request_count BIGINT,
  error_count BIGINT,
  cache_hit_rate NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pm.endpoint,
    ROUND(AVG(pm.response_time_ms)::NUMERIC, 2),
    MIN(pm.response_time_ms),
    MAX(pm.response_time_ms),
    COUNT(*)::BIGINT,
    COUNT(CASE WHEN pm.status_code >= 400 THEN 1 END)::BIGINT,
    ROUND((COUNT(CASE WHEN pm.cache_hit THEN 1 END)::NUMERIC / COUNT(*)::NUMERIC * 100), 2)
  FROM performance_metrics pm
  WHERE pm.endpoint = p_endpoint
    AND pm.created_at > NOW() - (p_hours || ' hours')::INTERVAL
  GROUP BY pm.endpoint;
END;
$$ LANGUAGE plpgsql;

-- Function to identify slow endpoints
CREATE OR REPLACE FUNCTION get_slow_endpoints(p_min_avg_ms INTEGER DEFAULT 500, p_hours INTEGER DEFAULT 24)
RETURNS TABLE (
  endpoint VARCHAR,
  avg_response_time_ms NUMERIC,
  request_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    pm.endpoint,
    ROUND(AVG(pm.response_time_ms)::NUMERIC, 2),
    COUNT(*)::BIGINT
  FROM performance_metrics pm
  WHERE pm.created_at > NOW() - (p_hours || ' hours')::INTERVAL
  GROUP BY pm.endpoint
  HAVING AVG(pm.response_time_ms) > p_min_avg_ms
  ORDER BY AVG(pm.response_time_ms) DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up old logs (retention policy)
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
  -- Keep 90 days of performance metrics
  DELETE FROM performance_metrics WHERE created_at < NOW() - INTERVAL '90 days';

  -- Keep 90 days of API request logs
  DELETE FROM api_request_logs WHERE created_at < NOW() - INTERVAL '90 days';

  -- Keep 30 days of health checks
  DELETE FROM health_checks WHERE created_at < NOW() - INTERVAL '30 days';

  -- Keep 365 days of maintenance logs
  DELETE FROM maintenance_logs WHERE created_at < NOW() - INTERVAL '365 days';

  -- Keep 7 days of resource usage
  DELETE FROM resource_usage WHERE timestamp < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- Function to vacuum and analyze all tables
CREATE OR REPLACE FUNCTION optimize_all_tables()
RETURNS TABLE (
  table_name VARCHAR,
  status VARCHAR
) AS $$
DECLARE
  v_table RECORD;
BEGIN
  FOR v_table IN SELECT tablename FROM pg_tables WHERE schemaname = 'public' LOOP
    EXECUTE 'VACUUM ANALYZE ' || v_table.tablename;
    INSERT INTO maintenance_logs (maintenance_type, table_name, status)
    VALUES ('vacuum', v_table.tablename, 'completed');

    RETURN QUERY SELECT v_table.tablename::VARCHAR, 'completed'::VARCHAR;
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create materialized view for donation statistics (for fast dashboard queries)
CREATE MATERIALIZED VIEW IF NOT EXISTS donation_stats_cache AS
SELECT
  COUNT(*) as total_donations,
  SUM(amount_cents) as total_amount_cents,
  COUNT(DISTINCT donor_id) as unique_donors,
  AVG(amount_cents) as avg_donation_cents,
  MAX(amount_cents) as max_donation_cents,
  MIN(amount_cents) as min_donation_cents,
  NOW() as cached_at
FROM donations
WHERE status = 'completed';

-- Create index on materialized view
CREATE INDEX IF NOT EXISTS idx_donation_stats_cache_cached_at ON donation_stats_cache(cached_at);

-- Create materialized view for campaign statistics
CREATE MATERIALIZED VIEW IF NOT EXISTS campaign_stats_cache AS
SELECT
  c.id,
  c.name,
  c.status,
  c.goal_amount_cents,
  c.current_amount_cents,
  c.current_donor_count,
  CASE
    WHEN c.goal_amount_cents > 0 THEN ROUND((c.current_amount_cents::NUMERIC / c.goal_amount_cents * 100), 2)
    ELSE 0
  END as progress_percentage,
  COUNT(DISTINCT d.donor_id) as donor_count,
  NOW() as cached_at
FROM donation_campaigns c
LEFT JOIN donations d ON c.id = d.campaign_id AND d.status = 'completed'
WHERE c.status IN ('active', 'paused')
GROUP BY c.id, c.name, c.status, c.goal_amount_cents, c.current_amount_cents, c.current_donor_count;

-- Create index on campaign stats
CREATE INDEX IF NOT EXISTS idx_campaign_stats_cache_id ON campaign_stats_cache(id);
CREATE INDEX IF NOT EXISTS idx_campaign_stats_cache_status ON campaign_stats_cache(status);

-- Add optimization-related columns to existing tables
ALTER TABLE api_request_logs ADD COLUMN IF NOT EXISTS cache_key VARCHAR(255);
ALTER TABLE api_request_logs ADD COLUMN IF NOT EXISTS cache_hit BOOLEAN;

-- Create trigger to log slow queries
CREATE OR REPLACE FUNCTION log_slow_query()
RETURNS trigger AS $$
BEGIN
  INSERT INTO slow_queries (query_hash, query_text, execution_time_ms)
  VALUES (
    encode(digest(NEW.query_text, 'sha256'), 'hex'),
    substring(NEW.query_text, 1, 1000),
    NEW.execution_time_ms
  )
  ON CONFLICT (query_hash) DO UPDATE
  SET execution_count = slow_queries.execution_count + 1,
      last_executed = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
