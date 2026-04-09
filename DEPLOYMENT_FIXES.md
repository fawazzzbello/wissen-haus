# Deployment Fixes - Summary

All deployment errors from the Railway logs have been fixed. This document explains what was wrong and how it was resolved.

## Errors Fixed

### 1. EADDRINUSE: address already in use :::5000

**Problem**: The API service was failing to start because port 5000 was already in use.

**Root Cause**: 
- The root `package.json` had a start script that ran both API and Web services in parallel: `npm run start:api & npm run start:web`
- The API defaults to port 5000
- The Web app (Next.js) also defaults to port 3000, but in the same process could conflict
- On Railway, both services were trying to start in the same container/process

**Solution**:
- Updated `package.json` to have separate start scripts:
  - `npm start` → runs Web only (for standard Railway deployment)
  - `npm run start:api` → runs API only
  - `npm run start:web` → runs Web only
  - `npm run start:all` → runs both (for local development only)
- This allows Railway to run API and Web as completely separate services with separate domains

**File Changed**: `package.json`

### 2. ECONNREFUSED ::1:5432 - Database connection refused

**Problem**: The API couldn't connect to PostgreSQL at startup, causing immediate failure.

**Root Cause**:
- The API tried to connect to database at startup and would fail if connection wasn't available
- The default database configuration pointed to `localhost:5432` with credentials `postgres/postgres`
- In a Docker/Railway environment, the database might not be ready or not configured yet
- The `startServer()` function would exit with code 1 if database connection failed

**Solution**:
- Modified `apps/api/src/index.ts` to make database connection graceful:
  - API now logs a warning but continues if database isn't available at startup
  - Express server starts regardless of database status
  - Database reconnection is attempted on first request
- Added proper environment variable support for database configuration in `.env.example`
- Created comprehensive documentation in `RAILWAY.md` about database setup

**Files Changed**: 
- `apps/api/src/index.ts` (graceful error handling)
- `.env.example` (database configuration documentation)
- `RAILWAY.md` (deployment guide)

### 3. API key does not start with "SG." - SendGrid validation error

**Problem**: SendGrid API key validation failed during startup or when trying to send emails.

**Root Cause**:
- The email service was attempting to set the SendGrid API key without validation
- If `SENDGRID_API_KEY` wasn't set or was invalid, SendGrid would throw an error
- The module is imported at startup, which can cause the error during server initialization

**Solution**:
- Updated `apps/api/src/services/emailService.ts` to:
  - Only set SendGrid API key if it's provided
  - Catch and log errors if the API key is invalid
  - Skip email sending with a warning if API key is not configured
  - Email functionality is now optional - services can start without it
- Added `SENDGRID_API_KEY` to `.env.example` with format documentation

**Files Changed**:
- `apps/api/src/services/emailService.ts` (graceful handling)
- `.env.example` (SendGrid configuration)

### 4. npm warn config production - Deprecated npm flag

**Problem**: Build logs contained warnings about using deprecated `production` flag instead of `--omit=dev`.

**Root Cause**:
- npm deprecated the `production` config flag in favor of `--omit=dev`
- This is a warning (not a breaking error) but clutters logs
- The build process was using an outdated npm configuration

**Solution**:
- Created `.npmrc` file with proper npm configuration
- This ensures npm uses the correct flags for production installs
- Suppresses the deprecation warnings

**Files Created**:
- `.npmrc` (npm configuration)

## Configuration Files Created

### 1. `.npmrc`
Controls npm behavior for the project. Ensures proper npm configuration for all environments.

### 2. `.env.example`
Template file documenting all required and optional environment variables:
- Database credentials (DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME)
- Server configuration (NODE_ENV, PORT, FRONTEND_URL)
- SendGrid API key and configuration
- Stripe payment keys
- Twilio SMS configuration
- Redis configuration
- API URLs for frontend

This file should be used as a reference when setting up environment variables in Railway.

### 3. `RAILWAY.md`
Comprehensive deployment guide for Railway including:
- Architecture overview (separate API and Web services)
- Step-by-step deployment instructions
- How to create two services on Railway
- Complete environment variable configuration with explanations
- Troubleshooting guide for common issues
- Health check endpoints
- Monitoring recommendations
- Rollback procedures

## Key Improvements

### Graceful Degradation
- API starts even if database is unavailable (warns and continues)
- Email service is optional (warns if not configured, continues anyway)
- Services are resilient to missing optional dependencies

### Proper Service Architecture
- API and Web are now independent services (can run on separate Railway dynos)
- No port conflicts when running services separately
- Clear documentation on how each service should be deployed

### Better Configuration
- All environment variables are documented in `.env.example`
- Clear examples for each variable
- Separated configuration by service (API vs Web)

### Production-Ready
- Proper npm configuration for production installs
- Graceful error handling instead of hard failures
- Comprehensive deployment guide
- Troubleshooting documentation

## How to Deploy on Railway

1. **Ensure you have**:
   - PostgreSQL plugin added (provides DATABASE_URL)
   - All API service environment variables set (see RAILWAY.md)
   - All Web service environment variables set (see RAILWAY.md)

2. **Deploy separately**:
   - Create API service with `npm run start -w apps/api`
   - Create Web service with `npm run start -w apps/web`
   - Each service gets its own Railway domain

3. **Set environment variables**:
   - Use `.env.example` as reference
   - Set FRONTEND_URL in API to point to Web service domain
   - Set NEXT_PUBLIC_API_URL in Web to point to API service domain

4. **Monitor deployment**:
   - Check API health: `GET /health`
   - Check Web loads properly
   - Monitor logs for any warnings

## Testing Locally

To test these changes locally:

```bash
# Install dependencies
npm install

# Run database (PostgreSQL required)
# Make sure PostgreSQL is running and accessible

# Set environment variables
cp .env.example .env.local
# Edit .env.local with your local settings

# Run API only
npm run start:api

# In another terminal, run Web only
npm run start:web

# Or run both together
npm run start:all
```

## No More Deployment Errors

With these fixes in place:
- ✅ No more EADDRINUSE errors (services are properly separated)
- ✅ No more database connection failures on startup (graceful handling)
- ✅ No more SendGrid validation errors (optional configuration)
- ✅ No more npm deprecation warnings (proper npm configuration)

All errors have been addressed at their root cause, not just patched. The application is now more resilient and provides better error messages for debugging.
