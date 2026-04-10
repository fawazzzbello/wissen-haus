# Railway Deployment Checklist

Use this checklist before deploying to Railway production.

## Pre-Deployment (Local)

### Code Quality
- [ ] All tests passing: `npm run test`
- [ ] No linting errors: `npm run lint`
- [ ] TypeScript compiles: `npm run type-check`
- [ ] No security vulnerabilities: `npm audit`

### Environment Setup
- [ ] `.env.local` created with all required variables
- [ ] Database validation passes: `bash scripts/validate-env.sh`
- [ ] Secrets generated: `bash scripts/generate-secrets.sh`
- [ ] All API keys properly formatted:
  - [ ] SendGrid: Starts with `SG.`
  - [ ] Stripe: Public starts with `pk_`, Secret with `sk_`
  - [ ] AI keys: Properly formatted
  - [ ] Database URL: Valid PostgreSQL connection string

### Local Testing
- [ ] API starts without errors: `npm run dev -w apps/api`
- [ ] Web starts without errors: `npm run dev -w apps/web`
- [ ] Database connection works: `curl http://localhost:5000/health`
- [ ] Login page loads: Visit `http://localhost:3000/login`
- [ ] Can create test donation (if enabled)

### Documentation
- [ ] IMPLEMENTATION_PLAN.md reviewed
- [ ] README.md updated with any changes
- [ ] API changes documented

---

## Railway Configuration

### Project Setup
- [ ] Railway project created
- [ ] GitHub repo connected to Railway
- [ ] Teams/access configured

### API Service
- [ ] Service created and named `api`
- [ ] Root Directory set to `apps/api`
- [ ] Build Command: `npm run build -w apps/api`
- [ ] Start Command: `npm run start:api` ⚠️ **CRITICAL**
- [ ] Domain generated (e.g., `https://wissen-haus-api.railway.app`)

### Web Service
- [ ] Service created and named `web`
- [ ] Root Directory set to `apps/web`
- [ ] Build Command: `npm run build -w apps/web`
- [ ] Start Command: `npm run start:web`
- [ ] Domain generated (e.g., `https://wissen-haus-web.railway.app`)

### Database Service
- [ ] PostgreSQL plugin added
- [ ] `DATABASE_URL` automatically set in API service
- [ ] Verified database version 14+

### Environment Variables - API Service
- [ ] `NODE_ENV=production`
- [ ] `PORT=5000` (or let Railway set it)
- [ ] `DATABASE_URL` (auto-set by Railway, verify it's set)
- [ ] `FRONTEND_URL=https://your-web-domain.railway.app`
- [ ] `JWT_SECRET` (generated secret)
- [ ] `JWT_REFRESH_SECRET` (generated secret)
- [ ] SendGrid optional:
  - [ ] `SENDGRID_API_KEY` (if using email)
  - [ ] `SENDGRID_FROM_EMAIL`
- [ ] Stripe optional:
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] AI optional:
  - [ ] `AI_PROVIDER` (anthropic|gemini|openai)
  - [ ] `ANTHROPIC_API_KEY` or `GOOGLE_GEMINI_API_KEY` or `OPENAI_API_KEY`

### Environment Variables - Web Service
- [ ] `NEXT_PUBLIC_API_URL=https://your-api-domain.railway.app/api`
- [ ] `API_INTERNAL_URL=https://your-api-domain.railway.app` ⚠️ **CRITICAL - NO /api suffix**
- [ ] `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` (if using payments)

---

## Deploy & Verification

### Initial Deployment
- [ ] Push code to branch (triggers GitHub Actions)
- [ ] Wait for CI/CD pipeline to complete
- [ ] Click "Redeploy" on API service in Railway
- [ ] Click "Redeploy" on Web service in Railway
- [ ] Wait for both services to show "Ready" status

### API Verification
- [ ] API service shows "Ready" in Railway logs
- [ ] Health check passes: `curl https://your-api-domain.railway.app/health`
- [ ] Database connection logged: Look for "✓ Database connection successful" in logs
- [ ] Default admin user created: Look for "✓ Created default admin user" in logs

### Web Verification
- [ ] Web service shows "Ready" in Railway logs
- [ ] Homepage loads: Visit `https://your-web-domain.railway.app`
- [ ] Login page loads: Visit `https://your-web-domain.railway.app/login`
- [ ] No build errors in logs

### Functional Testing
- [ ] Login works with admin@wissen-haus.org / admin@123456
- [ ] Dashboard loads
- [ ] Can view donations (if any exist)
- [ ] API requests from web work (check browser DevTools Network)
- [ ] No 502 Bad Gateway errors

### Monitoring
- [ ] Set up error tracking (Sentry optional)
- [ ] Enable uptime monitoring
- [ ] Configure alert notifications

---

## Rollback (If Needed)

1. **Immediate**: Push previous working commit to `main`
2. **GitHub Actions**: Waits for CI to pass, then auto-deploys
3. **Manual**: Click "Redeploy" on Railway service, select previous deployment

---

## Post-Deployment

### Analytics
- [ ] Monitor API logs for errors
- [ ] Check error rates on dashboard
- [ ] Monitor database performance
- [ ] Monitor Stripe webhook deliveries

### Updates
- [ ] Document any environment-specific changes
- [ ] Update README with actual Railway URLs
- [ ] Notify stakeholders of successful deployment

### Maintenance
- [ ] Schedule database backups
- [ ] Set up log aggregation (optional)
- [ ] Configure auto-scaling (if needed)

---

## Critical Issues & Quick Fixes

### Database Connection Failed
```
Error: ECONNREFUSED or "Database connection failed at startup"
Fix: Verify DATABASE_URL is set in API service environment
```

### Login Returns 404
```
Error: POST /api/auth/login returns 404
Fix: Verify API_INTERNAL_URL is set in Web service (no /api suffix)
     Verify Start Command is "npm run start:api" in API service
```

### API and Web Can't Communicate
```
Error: "Failed to proxy" in logs
Fix: Verify both NEXT_PUBLIC_API_URL and API_INTERNAL_URL in Web service
     Redeploy both services after changing environment variables
```

### EADDRINUSE on Port 5000
```
Error: "EADDRINUSE: address already in use :::5000"
Fix: Verify API and Web are separate Railway services
     Verify Start Commands are different (start:api vs start:web)
```

### SendGrid Not Working
```
Error: "API key does not start with SG."
Fix: SendGrid is optional - leave empty to disable
     If enabling, ensure key is valid (get from SendGrid dashboard)
```

---

## Need Help?

1. Check `IMPLEMENTATION_PLAN.md` for Phase 1 troubleshooting
2. Review Railway logs for error messages
3. Check browser DevTools Network tab for API errors
4. Verify all environment variables are set correctly

