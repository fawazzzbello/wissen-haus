# CRITICAL FIX: EADDRINUSE Error on Railway

## Problem

You're seeing this error during deployment:

```
Error: listen EADDRINUSE: address already in use :::5000
```

This means both the API and Web services are trying to use port 5000 simultaneously.

## Root Cause

Railway is running the entire application as a single service using the default `npm start` command, which (in the old configuration) tried to run both API and Web in parallel:

```bash
npm run start:api & npm run start:web
```

When both services run in the same container/process with the same PORT environment variable, they conflict on the same port.

## Solution

You have **TWO options**:

### Option 1: Separate Services (RECOMMENDED for Production)

Create **two completely separate Railway services**:

1. **API Service**
   - Root Directory: `apps/api`
   - Build Command: `npm run build -w apps/api`
   - Start Command: `npm run start:api`
   - Gets its own PORT (e.g., 5000)

2. **Web Service**
   - Root Directory: `apps/web`
   - Build Command: `npm run build -w apps/web`
   - Start Command: `npm run start:web`
   - Gets its own PORT (e.g., 3000)

**Benefits**:
- Each service gets its own domain
- Services can be scaled independently
- No port conflicts
- Production-grade setup

**How to set up**:
1. In Railway dashboard, remove current single service
2. Create two new services from GitHub
3. Configure each with their own start command
4. Generate separate public domains for each
5. Set environment variables appropriately for each

### Option 2: Quick Fix (Temporary)

If you only have one Railway service and can't easily create two:

1. Update the **Procfile** (if you have one) or **Start Command** to:
   ```bash
   npm run start:web
   ```
   
2. Deploy API separately:
   - Either as a separate Railway service
   - Or use Heroku/another provider for the API
   - Or use Railway's "Worker" feature for the API

3. Set `NEXT_PUBLIC_API_URL` in Web to point to your API's domain

**Current Status**: With the latest code changes, the npm scripts now explicitly set:
- `npm run start:api` → PORT=5000
- `npm run start:web` → PORT=3000

But these are ONLY used if you run them separately. If you run both in one container, there's still a conflict.

## Immediate Action Required

To fix this deployment right now:

1. **Go to your Railway dashboard**

2. **Option A - If you have ONE service**:
   - Go to Settings
   - Find the "Start Command" (it might show as a Procfile or default)
   - Change it to: `npm run start:web`
   - Deploy again
   - **Note**: API won't run! You'll need Option 1

3. **Option B - Create separate services (RECOMMENDED)**:
   - Delete or pause the current service
   - Create NEW → GitHub Repo → (select this repo)
   - Set Root Directory: `apps/api`
   - Build Command: `npm run build -w apps/api`
   - Start Command: `npm run start:api`
   - Deploy and get first public domain
   - Create another NEW → GitHub Repo
   - Set Root Directory: `apps/web`
   - Build Command: `npm run build -w apps/web`
   - Start Command: `npm run start:web`
   - Deploy and get second public domain
   - Update environment variables to link them together

## Understanding the Fix

The code changes I made help, but they're only effective if services are separated:

✅ **Explicit PORT assignment** in npm scripts
- `PORT=5000 npm run start:api`
- `PORT=3000 npm run start:web`

✅ **Graceful database startup**
- API continues even if DB unavailable
- Prevents cascading failures

✅ **Optional SendGrid configuration**
- Email service doesn't crash if key missing

❌ **Still requires service separation on Railway**
- Code can't fix architecture issues
- You need separate containers/services
- Each service needs separate start command

## Why This Happened

The original setup had:
```json
"start": "npm run start:api & npm run start:web"
```

This tried to run both services in parallel in the SAME process/container. When Railway (or any platform) runs a single service, this causes:

1. API starts on port 5000
2. Web tries to start on... port 5000 (Next.js default in production)
3. EADDRINUSE error

The `&` operator runs them in the background of the same shell, but they're both competing for the same port.

## Verification

After fixing, verify:

```bash
# API health check (should work)
curl https://your-api-domain.railway.app/health

# Web should load
curl https://your-web-domain.railway.app
```

## Still Having Issues?

1. **Check which command is being run**:
   - Go to Railway → Deployment logs
   - Look for the "Start Command" line
   - It should show either:
     - `npm run start:web` (if single service)
     - `npm run start:api` (if API service)
     - NOT `npm run start:api & npm run start:web`

2. **Verify PORT is set correctly**:
   - Railway usually sets `PORT` environment variable
   - Check in Railway → Environment Variables
   - Should be the assigned port (not hardcoded)

3. **Clear Railway cache**:
   - Go to settings
   - Redeploy with clean build
   - This forces rebuild of package.json changes

4. **Check logs for actual start command**:
   - Railway shows what command was executed
   - Verify it matches your configuration

## Summary

- **Short term**: Update Start Command to `npm run start:web` if using one service
- **Long term**: Create two separate Railway services (one for API, one for Web)
- **Code changes**: Already done (explicit PORT assignment, graceful startup)
- **Key insight**: EADDRINUSE is an architecture problem, not a code problem

See `RAILWAY.md` and `RAILWAY_DEPLOYMENT_CHECKLIST.md` for detailed setup instructions.
