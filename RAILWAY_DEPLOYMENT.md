# Railway.com Deployment Guide

Complete guide to deploy Wissen-Haus to Railway.com

## 📋 Prerequisites

1. **Railway Account** - Sign up at https://railway.app
2. **Git Repository** - Push code to GitHub (https://github.com/your-username/wissen-haus)
3. **PostgreSQL Database** - Railway provides PostgreSQL
4. **Environment Variables** - All external API keys

## 🚀 Step-by-Step Deployment

### Step 1: Connect GitHub Repository

1. Log in to Railway Dashboard
2. Click "New Project"
3. Select "Deploy from GitHub"
4. Authorize Railway to access your GitHub account
5. Select `wissen-haus` repository
6. Click "Deploy"

**Railway will automatically:**
- Detect the monorepo structure
- Install dependencies
- Build the project
- Run migrations (if configured)
- Start the application

### Step 2: Create PostgreSQL Database

1. In Railway Dashboard, click "Add Service"
2. Select "PostgreSQL"
3. Railway creates a database automatically
4. Copy the connection string

### Step 3: Configure Environment Variables

In Railway Dashboard, set these environment variables:

#### Database
```
DATABASE_URL=<Railway PostgreSQL connection string>
```

#### JWT Secrets (Generate random 32+ char strings)
```
JWT_SECRET=<random-string-32-chars-minimum>
JWT_REFRESH_SECRET=<random-string-32-chars-minimum>
```

#### Stripe (Get from https://dashboard.stripe.com)
```
STRIPE_SECRET_KEY=sk_live_xxxxxxxxxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxxxxxxxxxxx
```

#### SendGrid (Get from https://sendgrid.com)
```
SENDGRID_API_KEY=SG.xxxxxxxxxxxx
SENDGRID_FROM_EMAIL=noreply@wissen-haus.org
SENDGRID_FROM_NAME=Wissen-Haus
```

#### Twilio (Get from https://www.twilio.com)
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=xxxxxxxxxxxx
TWILIO_PHONE_NUMBER=+1xxxxxxxxxx
```

#### Application
```
NODE_ENV=production
PORT=5000
FRONTEND_URL=https://<your-railway-domain>
NEXT_PUBLIC_API_URL=https://<your-railway-domain>/api
```

### Step 4: Generate Security Secrets

Generate strong random secrets using OpenSSL:

```bash
# Generate JWT_SECRET
openssl rand -base64 32

# Generate JWT_REFRESH_SECRET
openssl rand -base64 32
```

### Step 5: Configure Custom Domain (Optional)

1. In Railway Dashboard, go to your project
2. Click "Settings"
3. Under "Domains", add your custom domain
4. Update DNS records as instructed by Railway

## 🔄 Deployment Process

### Automatic Deployments

Railway automatically deploys when:
- You push to the main branch (configure in settings)
- You manually trigger deployment from dashboard

### Manual Deployment

1. Dashboard → Your Project
2. Click "Deploy"
3. Select branch to deploy
4. Monitor logs in real-time

### View Deployment Logs

```bash
# Using Railway CLI
railway logs

# Or view in dashboard → Deployments tab
```

## ✅ Post-Deployment Verification

### 1. Check Health Endpoints

```bash
# API health
curl https://<your-domain>/api/health

# Both should return 200 OK
```

### 2. Test Authentication

```bash
# Login with demo credentials
curl -X POST https://<your-domain>/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@wissen-haus.org",
    "password": "admin@123456"
  }'
```

### 3. Access Admin Dashboard

Visit: `https://<your-domain>/admin/login`
- Email: `admin@wissen-haus.org`
- Password: `admin@123456`

### 4. Test Donation Flow

1. Visit: `https://<your-domain>/donate`
2. Fill in donation form
3. Proceed through payment flow (test Stripe)

### 5. Verify Database Connection

```bash
# Check if migrations ran
# If you see data in tables, database is working
```

### 6. Monitor Application Logs

Railway Dashboard → Deployments → Logs

Look for:
- ✅ "Server running on..."
- ✅ "Database connection successful"
- ✅ No error messages

## 🔧 Common Issues & Solutions

### Issue: Build Fails

**Problem:** "Cannot find module" errors

**Solution:**
1. Ensure `package.json` scripts exist
2. Check build logs: Railway → Deployments → Logs
3. Verify all dependencies are in `package.json`
4. Rebuild: Railway → Deployments → Redeploy

### Issue: Database Connection Fails

**Problem:** "Cannot connect to database"

**Solution:**
1. Verify `DATABASE_URL` is set in environment
2. Check PostgreSQL service is running
3. Verify IP whitelist (Railway allows all by default)
4. Test connection string locally

### Issue: Environment Variables Not Working

**Problem:** "undefined" errors or 500 errors

**Solution:**
1. Verify all required env vars are set
2. Use only these variable names (case-sensitive):
   - `JWT_SECRET`
   - `JWT_REFRESH_SECRET`
   - `STRIPE_SECRET_KEY`
   - etc.
3. Redeploy after adding variables
4. Check logs for specific missing variables

### Issue: Frontend/API Connection Fails

**Problem:** "Cannot reach API" errors

**Solution:**
1. Ensure `NEXT_PUBLIC_API_URL` points to correct domain
2. Check CORS is enabled (should be by default)
3. Verify API is running (check health endpoint)
4. Check browser console for specific errors

## 📊 Monitoring & Debugging

### View Logs

```bash
# Real-time logs
railway logs --follow

# Specific number of lines
railway logs --lines 100

# Filter by service
railway logs --service api
railway logs --service web
```

### Monitor Metrics

Railway Dashboard shows:
- **CPU Usage** - Should be < 50% normally
- **Memory Usage** - Should be < 512MB
- **Network** - Bandwidth used
- **Build Time** - How long deployments take

### Enable Debug Logging

Set in environment variables:
```
LOG_LEVEL=debug
NODE_ENV=development  # (temporary, for debugging only)
```

## 🔐 Security Checklist

Before going live:

- [ ] Change demo admin password
- [ ] Use production Stripe keys (not test)
- [ ] Use production SendGrid API key
- [ ] Use production Twilio credentials
- [ ] Generate strong random JWT secrets
- [ ] Enable HTTPS (Railway does this automatically)
- [ ] Set up regular database backups
- [ ] Configure error tracking (Sentry)
- [ ] Review CORS settings
- [ ] Test webhook security
- [ ] Enable rate limiting (already configured)
- [ ] Rotate API keys regularly

## 📈 Scaling & Performance

### Initial Configuration

- **Replicas:** 1 (default)
- **Memory:** 512MB (minimum)
- **CPU:** Shared (auto-scaling)

### Scale Up When

- CPU usage consistently > 80%
- Memory usage consistently > 80%
- Response times > 200ms
- Frequent 502 errors

### To Scale Up

Railway Dashboard → Project Settings → Resources

```bash
# Or via CLI
railway scale api 2  # 2 replicas of API
railway scale web 2  # 2 replicas of web
```

## 💾 Database Backups

Railway PostgreSQL automatically backs up every day.

### Manual Backup

```bash
# Via Railway CLI
railway postgres backup

# Via Dashboard
Project → PostgreSQL → Backups
```

### Restore from Backup

Railway Dashboard → PostgreSQL → Backups → Restore

## 🚨 Incident Response

### If Application Goes Down

1. **Check Status**
   ```bash
   railway status
   ```

2. **View Logs**
   ```bash
   railway logs --lines 50 --follow
   ```

3. **Restart Services**
   ```bash
   railway redeploy
   ```

4. **Check Database**
   - Railway Dashboard → PostgreSQL → Health

5. **Verify Environment Variables**
   - Dashboard → Project Settings → Variables

### If Database Is Down

1. Check Railway status page
2. Verify backup is available
3. Consider rollback if needed
4. Contact Railway support if persistent

## 📞 Getting Help

### Railway Support

- Documentation: https://docs.railway.app
- Status: https://status.railway.app
- Support: Railway Dashboard → Help

### Debugging Tools

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# View all commands
railway help
```

## 🎯 Production Checklist

Before launch:

- [ ] All environment variables configured
- [ ] Database migrations run successfully
- [ ] Admin user created (change default password)
- [ ] Email notifications working
- [ ] SMS notifications working (if enabled)
- [ ] Stripe webhooks configured
- [ ] Donation flow tested end-to-end
- [ ] Error tracking (Sentry) configured
- [ ] Monitoring alerts set up
- [ ] Database backups working
- [ ] SSL certificate active (automatic)
- [ ] Custom domain configured
- [ ] Analytics/tracking setup (optional)
- [ ] Rate limiting verified
- [ ] Security headers verified
- [ ] CORS properly configured

## 🚀 Continuous Deployment

Railway automatically redeploys when:
1. Code pushed to main branch
2. Environment variables changed
3. Dependencies updated
4. Manual redeploy triggered

### Branch-Specific Deployments

Railway Dashboard → Settings → Deployments

Configure which branches auto-deploy.

## 📊 Monitoring & Alerts

### Email Notifications

Railway can notify you on:
- Deployment success/failure
- Database errors
- Service crashes

Configure: Dashboard → Settings → Notifications

### Custom Alerts (Sentry)

1. Set up Sentry account: https://sentry.io
2. Add to environment:
   ```
   SENTRY_DSN=https://xxxxx@sentry.io/xxxx
   ```
3. Automatic error tracking and alerts

## 💡 Tips & Best Practices

1. **Keep Database Separate**
   - Don't deploy database with code
   - Use Railway PostgreSQL service

2. **Environment Variables**
   - Never commit to git
   - Use Railway Dashboard to manage
   - Rotate regularly

3. **Scaling Strategy**
   - Start with 1 replica
   - Monitor metrics
   - Scale gradually

4. **Zero-Downtime Deployments**
   - Railway handles gracefully
   - Existing requests complete
   - New requests wait for new version

5. **Cost Optimization**
   - Monitor usage
   - Remove unused services
   - Check logs for errors

## 🎓 Learn More

- Railway Docs: https://docs.railway.app
- Next.js Guide: https://nextjs.org/docs/deployment/railway
- Express on Railway: https://docs.railway.app/guides/express
- PostgreSQL Guide: https://docs.railway.app/databases/postgresql

---

**Deployment is complete!** 🎉

Your Wissen-Haus platform is now live on Railway.com. Monitor the application and make adjustments as needed.
