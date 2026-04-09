# Railway.com Deployment Troubleshooting & Fix Guide

## 🔴 Common Issues with 3 Services

You likely have 3 separate Railway services that are:
1. **api** - Express backend
2. **wissen-haus** - Possibly the root/monorepo
3. **web** - Next.js frontend

The errors are likely because:
- Services aren't finding each other
- Environment variables aren't set
- Database migrations not running
- Port conflicts
- Missing dependencies

---

## 🔧 STEP-BY-STEP FIX

### STEP 1: View Deployment Logs

First, check what's actually failing:

```bash
# For each service in Railway Dashboard:
# Service → Deployments → View Logs

# Look for errors like:
# - "Cannot connect to database"
# - "Cannot find module"
# - "Port already in use"
# - "Environment variable undefined"
```

**What to look for:**
- Error messages at top of logs
- Failed npm scripts
- Database connection errors
- Port binding failures

---

### STEP 2: Delete Incorrect Services

You likely only need **2 services**, not 3:

**Go to Railway Dashboard:**
1. Click on each service
2. Settings → Danger Zone → Delete Service

**Keep ONLY:**
- ✅ **PostgreSQL** (database)
- ✅ **api** (Express backend)
- ✅ **web** (Next.js frontend)

**Delete if exists:**
- ❌ wissen-haus (if it's a duplicate/root service)
- ❌ Any other monorepo entry

---

### STEP 3: Configure PostgreSQL Service

1. **Railway Dashboard → PostgreSQL**
2. Get the connection string:
   - Click the service
   - Click "Connect" 
   - Copy the full `DATABASE_URL`

This should look like:
```
postgresql://postgres:password@host:port/railway
```

---

### STEP 4: Set Environment Variables for API Service

**Railway Dashboard → api service → Variables**

Add **ALL** these variables:

```env
# Database (CRITICAL)
DATABASE_URL=<paste-from-postgresql-connect>
NODE_ENV=production

# JWT (Generate new random strings)
JWT_SECRET=<generate-random-32-chars>
JWT_REFRESH_SECRET=<generate-random-32-chars>

# Third-party APIs (REQUIRED)
STRIPE_SECRET_KEY=sk_test_xxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxx
SENDGRID_API_KEY=SG.xxxx
TWILIO_ACCOUNT_SID=ACxxxx
TWILIO_AUTH_TOKEN=xxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx

# URLs
FRONTEND_URL=https://<your-web-domain>
PORT=5000
LOG_LEVEL=debug
```

---

### STEP 5: Set Environment Variables for WEB Service

**Railway Dashboard → web service → Variables**

Add **ALL** these variables:

```env
NODE_ENV=production
NEXT_PUBLIC_API_URL=https://<your-api-domain>/api
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxxx
```

**Important:** Get the API domain from Railway:
- Railway Dashboard → api service → Deployments
- Look for the domain URL (like `api-production-xxxx.railway.app`)

---

### STEP 6: Fix Build & Start Commands

#### For API Service:

**Railway Dashboard → api service → Settings → Build Command:**
```bash
npm run build
```

**Railway Dashboard → api service → Settings → Start Command:**
```bash
npm run start:api
```

#### For WEB Service:

**Railway Dashboard → web service → Settings → Build Command:**
```bash
npm run build -w apps/web
```

**Railway Dashboard → web service → Settings → Start Command:**
```bash
npm run start:web
```

---

### STEP 7: Enable Service Communication

Services need to communicate with the **internal Railway network**.

**For each service:**
1. Settings → Network
2. Note the internal URL (looks like `api.railway.internal:5000`)

**This allows:**
- Web service to reach API via Railway internal network
- No need for public internet traffic between services

---

### STEP 8: Update API Endpoint in Frontend

Since services are on private network, web needs to communicate via the **public domain**:

**Verify in web service environment:**
```
NEXT_PUBLIC_API_URL=https://<your-api-public-domain>/api
```

Example:
```
NEXT_PUBLIC_API_URL=https://wissen-haus-api-production.railway.app/api
```

---

### STEP 9: Run Database Migrations

Migrations need to run **once** when database is created:

**Option A: Via Railway Dashboard**
1. Go to api service → Deployments
2. Click on latest deployment
3. Check logs for "migrations"

**Option B: Via Command Line (if you have Railway CLI)**
```bash
railway login
railway link  # Select your project
railway run npm run migrate
```

**Option C: Manual via PostgreSQL Client**
```bash
# Get your DATABASE_URL from Railway
psql $DATABASE_URL < apps/api/src/db/migrations/001_init_schema.sql
```

---

### STEP 10: Redeploy Everything

1. **In Railway Dashboard:**
   - api service → Deployments → Redeploy Latest
   - web service → Deployments → Redeploy Latest

2. **Or via Git Push:**
   ```bash
   git push origin <your-branch>
   ```
   Railway will auto-redeploy

3. **Watch the logs:**
   - Click on deployment
   - View logs in real-time
   - Look for "Server running on..." for API
   - Look for "started server on..." for Web

---

## ✅ Verification Checklist

After deployment, verify each service:

### Check API Service

```bash
# 1. Test health check
curl https://<api-domain>/api/health

# Response should be:
{
  "status": "ok",
  "timestamp": "2026-04-09T...",
  "service": "wissen-haus-api"
}

# 2. Test login endpoint
curl -X POST https://<api-domain>/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@wissen-haus.org","password":"admin@123456"}'

# Should return user and tokens
```

### Check WEB Service

```bash
# 1. Visit your domain
https://<web-domain>

# Should show landing page

# 2. Try admin login
https://<web-domain>/admin/login

# Should show login form

# 3. Check browser console
# Should show no API errors
```

### Check Database

```bash
# Verify tables exist (via PostgreSQL client)
psql $DATABASE_URL -c "\dt"

# Should show 8 tables:
# - users
# - donors
# - donations
# - content_pages
# - notification_logs
# - settings
# - activity_logs
# - donation_events
```

---

## 🔍 Common Error Solutions

### Error: "Cannot connect to database"

**Fix:**
1. Verify `DATABASE_URL` is set
2. Copy the exact string from PostgreSQL service
3. Redeploy api service
4. Check it in logs: `Database connection successful`

### Error: "Cannot find module"

**Fix:**
1. Verify build command includes `-w apps/api`
2. Check all dependencies in `apps/api/package.json`
3. Run `npm install` locally to verify no issues
4. Commit and redeploy

### Error: "Port already in use"

**Fix:**
1. Only one API service should exist
2. Delete duplicate services
3. Ensure PORT=5000 in environment
4. Redeploy

### Error: "Cannot reach API from Web"

**Fix:**
1. Verify `NEXT_PUBLIC_API_URL` is set in web service
2. Use the public domain of API service (from Railway)
3. Example: `https://api-production-xxxx.railway.app/api`
4. Rebuild and redeploy web service

### Error: "Environment variables undefined"

**Fix:**
1. Add ALL variables from Step 4 and 5
2. Verify no typos in variable names
3. Generate new JWT secrets: `openssl rand -base64 32`
4. Redeploy after adding variables

### Error: "Cannot POST /api/auth/login"

**Fix:**
1. Verify API service is running: check logs
2. Verify `NEXT_PUBLIC_API_URL` is correct in web
3. Check browser Network tab for actual request URL
4. Verify database is connected: `npm run migrate` was run

---

## 🚀 Complete Fresh Deployment Process

If everything is broken, start over cleanly:

### 1. Clean Up Railway

```bash
# Delete these services:
# - api (old)
# - web (old)  
# - wissen-haus (if exists)
# Keep: PostgreSQL
```

### 2. Start Fresh

```bash
# Terminal on your machine
git push origin main  # Or your branch

# Railway will see the push and auto-create services
# If not, manually:
# Dashboard → New Service → GitHub → select wissen-haus repo
```

### 3. Configure PostgreSQL First

1. Create PostgreSQL service
2. Note the `DATABASE_URL`

### 4. Create API Service

1. GitHub repo → Select folder: `apps/api`
2. Build: `npm run build`
3. Start: `node dist/index.js`
4. Add environment variables (Step 4)

### 5. Create WEB Service

1. GitHub repo → Select folder: `apps/web`
2. Build: `npm run build`
3. Start: `npm run start`
4. Add environment variables (Step 5)

### 6. Test Everything

1. Health check API: `curl https://<api-domain>/api/health`
2. Visit web: `https://<web-domain>`
3. Try admin login

---

## 📋 Environment Variable Template

Copy and fill in:

```env
# DATABASE
DATABASE_URL=postgresql://postgres:password@host:port/railway

# APPLICATION
NODE_ENV=production
PORT=5000
LOG_LEVEL=info

# JWT SECRETS (Generate: openssl rand -base64 32)
JWT_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
JWT_REFRESH_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# STRIPE (Get from https://dashboard.stripe.com)
STRIPE_SECRET_KEY=[YOUR_STRIPE_SECRET_KEY_FROM_DASHBOARD]
STRIPE_WEBHOOK_SECRET=[YOUR_STRIPE_WEBHOOK_SECRET_FROM_DASHBOARD]
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=[YOUR_STRIPE_PUBLISHABLE_KEY_FROM_DASHBOARD]

# SENDGRID (Get from https://sendgrid.com)
SENDGRID_API_KEY=[YOUR_SENDGRID_API_KEY_FROM_DASHBOARD]
SENDGRID_FROM_EMAIL=noreply@wissen-haus.org
SENDGRID_FROM_NAME=Wissen-Haus

# TWILIO (Get from https://www.twilio.com)
TWILIO_ACCOUNT_SID=[YOUR_TWILIO_ACCOUNT_SID_FROM_DASHBOARD]
TWILIO_AUTH_TOKEN=[YOUR_TWILIO_AUTH_TOKEN_FROM_DASHBOARD]
TWILIO_PHONE_NUMBER=+1[YOUR_TWILIO_PHONE_NUMBER]

# URLs
FRONTEND_URL=https://<your-web-domain>
NEXT_PUBLIC_API_URL=https://<your-api-domain>/api
```

---

## 🎯 Quick Diagnostic

Run this to understand your current setup:

```bash
# In Railway Dashboard, for each service, check:

# API Service:
echo "=== API Service ==="
echo "Build Command: npm run build"
echo "Start Command: npm run start:api"
echo "Environment: NODE_ENV=production, DATABASE_URL=set, JWT_SECRET=set"

# WEB Service:
echo "=== WEB Service ==="
echo "Build Command: npm run build -w apps/web"
echo "Start Command: npm run start:web"
echo "Environment: NEXT_PUBLIC_API_URL=<api-domain>"

# PostgreSQL:
echo "=== PostgreSQL ==="
echo "Status: Connected"
echo "Has DATABASE_URL: Yes"
```

---

## 📞 Still Having Issues?

1. **Check logs** - Railway Dashboard → Service → Deployments → Logs
2. **Look for the actual error message** (not just "Error")
3. **Verify environment variables** - Settings → Variables
4. **Check build output** - Look for npm errors
5. **Test database** - Can you connect with psql?
6. **Test API locally** - Does it work on localhost:5000?

Share the **actual error message from logs** and I can help specifically!

---

## 🎓 Preventive: Correct Setup for Next Time

**One configuration that prevents all these issues:**

Create a single **root service** on Railway that handles both:
- Build: `npm run build --workspaces`
- Start: Use Procfile with both processes

Or use **separate services** with these **exact** settings:

**API Service:**
- Root directory: `.`
- Build: `npm run build -w apps/api`
- Start: `npm run start:api`
- Variables: All from Step 4

**WEB Service:**
- Root directory: `.`
- Build: `npm run build -w apps/web`
- Start: `npm run start:web`
- Variables: All from Step 5

This ensures Railway understands the monorepo structure.

---

**Try these steps and let me know which error you see in the logs. I can help fix the specific error!** 🚀
