# Phase 8: Production Optimization

Comprehensive performance optimization, caching, monitoring, and production-ready infrastructure.

## Overview

Phase 8 adds:
- Redis-based distributed caching
- Performance metrics collection
- Health monitoring and status pages
- Query optimization and slow query detection
- API response caching strategies
- Database optimization utilities
- Materialized views for fast dashboard queries
- Request logging and analytics
- System resource monitoring
- Comprehensive observability

## Caching Strategy

### CacheService
Unified caching interface with Redis backend.

**Key Features:**
- Automatic TTL management
- Cache invalidation patterns
- Hit/miss tracking for analytics
- Cache warming on startup
- Pattern-based deletion

**Cache Key Patterns:**
```
campaign:{id}:stats       # Campaign progress
campaigns:list:{status}   # Campaign listings
user:{id}:profile         # User preferences
donations:stats:total     # Aggregated stats
donations:daily:{date}    # Daily metrics
```

**Methods:**
```typescript
// Basic operations
get<T>(key: string): Promise<T | null>
set<T>(key, value, ttlSeconds?): Promise<void>
delete(key: string): Promise<void>
deletePattern(pattern: string): Promise<number>
clear(): Promise<void>

// Smart caching
getOrSet<T>(key, compute, ttlSeconds?): Promise<T>

// Invalidation
invalidateCampaignCache(campaignId)
invalidateUserCache(userId)
invalidateDonationStats()

// Analytics
getStats(): Promise<any>
warmCache(): Promise<void>
```

### TTL Strategy

**High Priority (5 minutes):**
- User profile information
- Campaign details
- Donation counts

**Medium Priority (1 hour):**
- Campaign statistics
- Donor preferences
- Dashboard metrics

**Low Priority (24 hours):**
- Campaign listings
- Aggregate statistics
- Report caches

## Performance Monitoring

### PerformanceService
Track and analyze API performance metrics.

**Tracked Metrics:**
- Response time per endpoint
- Database query count
- Cache hit rates
- HTTP status codes
- Error rates by endpoint

**Analysis Methods:**
```typescript
// Recording
recordRequest(req, res, responseTimeMs, dbQueryCount?, cacheHit?): Promise<void>
recordSlowQuery(queryText, executionTimeMs): Promise<void>

// Queries
getEndpointStats(endpoint, hoursBack?): Promise<Stats>
getSlowestEndpoints(minAvgMs?, hoursBack?): Promise<Endpoint[]>
getSlowestQueries(limit?): Promise<Query[]>
getErrorRates(hoursBack?): Promise<ErrorRate[]>
getCacheHitRates(hoursBack?): Promise<CacheStats>
getPerformanceSummary(hoursBack?): Promise<Summary>

// Maintenance
cleanupOldData(): Promise<void>
```

### Health Checking

**HealthCheckService** monitors system availability.

**Checks Performed:**
- Database connectivity and response time
- Redis connectivity
- Connection pool availability
- External service availability (payment gateway, SMTP)
- Overall system readiness

**Health Endpoints:**
```typescript
checkDatabase(): Promise<HealthStatus>
checkRedis(): Promise<HealthStatus>
checkDatabasePool(): Promise<HealthStatus>
checkExternalService(name, url, timeout?): Promise<HealthStatus>
getFullHealthStatus(): Promise<SystemHealth>
isReady(): Promise<boolean>

// Metrics
getHealthHistory(serviceName, limit?): Promise<HealthCheck[]>
getUptimePercentage(serviceName, hoursBack?): Promise<number>
getSystemMetrics(): Promise<Metrics>
```

## Database Schema

### New Tables

#### `performance_metrics`
Track all API request performance.

```sql
- id (UUID, PK)
- metric_name (VARCHAR) - Metric type
- endpoint (VARCHAR) - API endpoint path
- method (VARCHAR) - HTTP method
- response_time_ms (INTEGER) - Response time
- status_code (INTEGER) - HTTP status
- db_query_count (INTEGER) - Number of DB queries
- cache_hit (BOOLEAN) - Was response cached
- user_id (UUID) - Optional user tracking
- created_at (TIMESTAMP)
```

#### `slow_queries`
Track database queries exceeding threshold.

```sql
- id (UUID, PK)
- query_hash (VARCHAR) - Query hash for grouping
- query_text (TEXT) - Query (truncated)
- execution_time_ms (INTEGER) - Execution time
- execution_count (INTEGER) - Times executed
- last_executed (TIMESTAMP)
- is_indexed (BOOLEAN) - Uses indexes
- suggestion (TEXT) - Optimization hint
- created_at (TIMESTAMP)
```

#### `cache_statistics`
Cache performance analytics.

```sql
- id (UUID, PK)
- cache_key (VARCHAR)
- hit_count (INTEGER)
- miss_count (INTEGER)
- eviction_count (INTEGER)
- size_bytes (BIGINT)
- ttl_seconds (INTEGER)
- created_at, updated_at (TIMESTAMP)
```

#### `health_checks`
Service availability tracking.

```sql
- id (UUID, PK)
- service_name (VARCHAR) - 'database', 'redis', 'smtp', etc.
- status (VARCHAR) - 'healthy', 'degraded', 'unhealthy'
- response_time_ms (INTEGER)
- error_message (TEXT)
- details (JSONB)
- created_at (TIMESTAMP)
```

#### `api_request_logs`
Detailed request analytics.

```sql
- id (UUID, PK)
- user_id (UUID)
- method, endpoint (VARCHAR)
- status_code (INTEGER)
- response_time_ms (INTEGER)
- request_size_bytes, response_size_bytes (INTEGER)
- error_message (TEXT)
- ip_address (INET)
- user_agent (TEXT)
- created_at (TIMESTAMP)
```

#### `maintenance_logs`
Database optimization operations.

```sql
- id (UUID, PK)
- maintenance_type (VARCHAR) - 'index_rebuild', 'vacuum', 'analyze', 'backup'
- table_name (VARCHAR)
- status (VARCHAR) - 'pending', 'running', 'completed', 'failed'
- duration_ms (INTEGER)
- rows_affected (BIGINT)
- completed_at (TIMESTAMP)
```

#### `resource_usage`
System resource monitoring.

```sql
- id (UUID, PK)
- resource_type (VARCHAR) - 'memory', 'cpu', 'disk', 'connections'
- current_usage (BIGINT)
- max_capacity (BIGINT)
- usage_percentage (INTEGER)
- timestamp (TIMESTAMP)
```

### Materialized Views

#### `donation_stats_cache`
Precomputed donation statistics.

```sql
- total_donations (COUNT)
- total_amount_cents (SUM)
- unique_donors (COUNT DISTINCT)
- avg_donation_cents (AVG)
- max_donation_cents (MAX)
- min_donation_cents (MIN)
- cached_at (TIMESTAMP)
```

**Refresh Strategy:** Hourly or after major donation

#### `campaign_stats_cache`
Campaign progress precomputation.

```sql
- id, name, status
- goal_amount_cents, current_amount_cents
- progress_percentage (CALCULATED)
- donor_count (CALCULATED)
- cached_at (TIMESTAMP)
```

**Refresh Strategy:** Every 5 minutes or after campaign updates

## Optimization Features

### Query Optimization

**Database Functions:**
- `get_endpoint_performance()` - Performance metrics by endpoint
- `get_slow_endpoints()` - Identify bottleneck endpoints
- `optimize_all_tables()` - VACUUM ANALYZE all tables
- `cleanup_old_logs()` - Remove retention-expired data

**Automatic Indexing:**
- Indexes on all foreign keys
- Indexes on frequently filtered columns
- Composite indexes for common queries
- Indexes on timestamp columns for time-range queries

**Query Strategies:**
- Use EXPLAIN ANALYZE to identify missing indexes
- Connection pooling (PgBouncer ready)
- Prepared statements for all parameterized queries
- Query result caching via Redis

### Request-Level Caching

**Cacheable Endpoints:**
```
GET /api/donations/campaigns/list
GET /api/donations/campaigns/:id/stats
GET /api/donations/donors/:donorId/preferences
GET /api/users/:id
GET /api/content/*
```

**Non-Cacheable:**
```
POST / PUT / DELETE requests
Requests with Authorization headers for users
Real-time data endpoints
```

### Asset Optimization

**Static Assets:**
- Gzip compression
- Cache headers (max-age)
- ETag support
- CDN-ready (CloudFront, Cloudflare)

**Database Results:**
- Pagination for large result sets
- Projection (select only needed fields)
- Denormalization for read-heavy tables
- Materialized views for aggregates

## Monitoring & Observability

### Metrics Dashboard

**Key Metrics:**
- Average response time (by endpoint)
- Error rate (4xx, 5xx)
- Cache hit rate
- Database connection pool usage
- Request throughput (requests/minute)
- 95th percentile response time

### Alerting Thresholds

**Critical (immediate action):**
- Any service: unhealthy status
- Response time: >10 seconds
- Error rate: >5%
- Database: unavailable

**Warning (investigate):**
- Response time: >5 seconds
- Error rate: >1%
- Cache hit rate: <70%
- Slow query: >1 second

### Logging Strategy

**Production Logs:**
- Info: Service startup, key operations
- Warn: Performance degradation, retry attempts
- Error: Failed operations, exceptions
- Debug: Query execution, cache operations (dev only)

**Log Retention:**
- Performance metrics: 90 days
- API request logs: 90 days
- Health checks: 30 days
- Resource usage: 7 days
- Maintenance logs: 365 days

## Implementation Examples

### Cache Campaign Stats
```typescript
import { CacheService } from '@/services/caching';
import { getDonationManagementService } from '@/services/donation/donationManagementService';

// Automatic cache with getOrSet
const stats = await CacheService.getOrSet(
  `campaign:${campaignId}:stats`,
  async () => {
    const service = getDonationManagementService();
    return service.getCampaignStats(campaignId);
  },
  3600 // 1 hour TTL
);
```

### Record Performance
```typescript
import { PerformanceService } from '@/services/monitoring';

// In middleware or controller
const startTime = Date.now();
const responseTimeMs = Date.now() - startTime;

await PerformanceService.recordRequest(
  req,
  res,
  responseTimeMs,
  dbQueryCount,
  fromCache
);
```

### Health Check Endpoint
```typescript
import { HealthCheckService } from '@/services/monitoring';

app.get('/api/health', async (req, res) => {
  const health = await HealthCheckService.getFullHealthStatus();
  const statusCode = health.status === 'healthy' ? 200 : 503;
  res.status(statusCode).json(health);
});

// Readiness check
app.get('/api/ready', async (req, res) => {
  const isReady = await HealthCheckService.isReady();
  res.status(isReady ? 200 : 503).json({ ready: isReady });
});
```

### Performance Analysis
```typescript
const performance = await PerformanceService.getPerformanceSummary(24);

console.log('Slowest endpoints:');
performance.slowestEndpoints.forEach(e => {
  console.log(`${e.endpoint}: ${e.avg_response_time_ms}ms`);
});

console.log('Cache hit rate:', performance.cachePerformance.cache_hit_rate);
```

## Deployment Optimization

### Environment Variables
```env
# Caching
REDIS_URL=redis://localhost:6379
CACHE_ENABLED=true
CACHE_DEFAULT_TTL=3600

# Performance
ENABLE_PERFORMANCE_TRACKING=true
SLOW_QUERY_THRESHOLD_MS=1000
SLOW_REQUEST_THRESHOLD_MS=5000

# Health Checks
HEALTH_CHECK_INTERVAL=30000
HEALTH_CHECK_TIMEOUT=5000
```

### Production Best Practices

**Scaling:**
- Horizontal scaling with stateless servers
- Redis cluster for distributed caching
- Read replicas for reporting queries
- Connection pooling to database

**Optimization:**
- Enable all indexes before production
- Warm cache on startup
- VACUUM ANALYZE weekly
- Monitor slow queries daily

**Monitoring:**
- Set up alerting for critical metrics
- Dashboard for real-time visibility
- Weekly performance reviews
- Quarterly optimization audits

## Database Migration

```bash
npm run migrate
```

Executes `008_production_optimization.sql` which creates:
- performance_metrics table
- slow_queries table
- cache_statistics table
- health_checks table
- api_request_logs table
- maintenance_logs table
- resource_usage table
- query_execution_plans table
- Materialized views (donation_stats, campaign_stats)
- Performance analysis functions
- Cleanup functions
- Indexes for all tables

## Integration Points

**Phase 4 (Payments):**
- Cache payment status
- Track payment processing time
- Monitor payment failures

**Phase 5 (Email):**
- Cache email templates
- Track email queue performance
- Monitor SMTP health

**Phase 6 (Donations):**
- Cache campaign statistics
- Cache donor preferences
- Monitor donation processing time

**Phase 7 (Security):**
- Track authentication performance
- Monitor failed login attempts
- Log security events

## Performance Benchmarks

**Target Response Times:**
- API endpoints: <500ms (95th percentile)
- Dashboard queries: <1s
- Search: <2s
- Cached responses: <50ms

**Target Hit Rates:**
- Cache hit rate: >85%
- Database index usage: >95%
- Uptime: >99.9%

## Next Steps

1. Run database migration: `npm run migrate`
2. Implement performance middleware
3. Enable cache warming on startup
4. Set up health check endpoints
5. Configure monitoring dashboard
6. Set up alerting rules
7. Begin performance baseline measurements
8. Production readiness testing

## Monitoring Tools Integration

**Prometheus (metrics export):**
```typescript
// Export metrics endpoint
app.get('/metrics', async (req, res) => {
  const perf = await PerformanceService.getPerformanceSummary();
  const health = await HealthCheckService.getFullHealthStatus();
  // Format for Prometheus
});
```

**ELK Stack (logging):**
- Elasticsearch for log storage
- Logstash for log processing
- Kibana for visualization
- Winston integration for structured logging

**Grafana Dashboards:**
- Response time trends
- Error rate by endpoint
- Cache performance
- System resources
- Uptime timeline

## Maintenance Windows

**Weekly:**
- Run VACUUM ANALYZE
- Review slow queries
- Check cache hit rates

**Monthly:**
- Rebuild large indexes
- Archive old logs
- Refresh materialized views

**Quarterly:**
- Performance optimization audit
- Database schema review
- Capacity planning

## Troubleshooting

**Slow Queries:**
1. Check `slow_queries` table
2. Run EXPLAIN ANALYZE
3. Create missing indexes
4. Consider denormalization

**Cache Issues:**
1. Check Redis connectivity
2. Verify TTL settings
3. Review cache eviction
4. Warm cache if needed

**Health Checks Failing:**
1. Check service availability
2. Verify connectivity
3. Review error messages
4. Check resource usage

This Phase 8 implementation provides comprehensive production-ready optimization and monitoring for the Wissen-Haus platform.
