# Railway Deployment Checklist

Use this checklist when deploying the Wissen-Haus application to Railway.

## Prerequisites

- [ ] Railway account at [railway.app](https://railway.app)
- [ ] GitHub account with access to this repository
- [ ] SendGrid account (for email) - [sendgrid.com](https://sendgrid.com)
- [ ] Stripe account (for payments) - [stripe.com](https://stripe.com)

## Step 1: Create Railway Project

- [ ] Create new project on Railway
- [ ] Connect GitHub repository (fawazzzbello/wissen-haus)
- [ ] Authorize Railway to access your GitHub account

## Step 2: Add PostgreSQL Database

- [ ] Click "Add" button in Railway
- [ ] Select "PostgreSQL"
- [ ] Wait for database to initialize
- [ ] Verify `DATABASE_URL` environment variable is created

## Step 3: Create API Service

- [ ] Click "Add" button → "GitHub Repo"
- [ ] Set "Root Directory" to `apps/api`
- [ ] Set "Build Command" to: `npm run build -w apps/api`
- [ ] Set "Start Command" to: `npm run start -w apps/api`
- [ ] Set "PORT" variable to: `5000`
- [ ] **DO NOT** generate public URL yet (configure environment variables first)

## Step 4: Create Web Service

- [ ] Click "Add" button → "GitHub Repo"
- [ ] Set "Root Directory" to `apps/web`
- [ ] Set "Build Command" to: `npm run build -w apps/web`
- [ ] Set "Start Command" to: `npm run start -w apps/web`
- [ ] Set "PORT" variable to: `3000`
- [ ] **DO NOT** generate public URL yet (configure environment variables first)

## Step 5: Configure API Service Environment Variables

In the API service, set these environment variables:

### Database (auto-generated, verify these are set)
- [ ] `DATABASE_URL` - Set automatically by Railway PostgreSQL plugin

### Or use individual variables
- [ ] `DB_HOST` - Your Railway PostgreSQL host
- [ ] `DB_PORT` - 5432
- [ ] `DB_USER` - postgres
- [ ] `DB_PASSWORD` - Your database password
- [ ] `DB_NAME` - wissen_haus_db

### Server Configuration
- [ ] `NODE_ENV` - Set to: `production`
- [ ] `PORT` - Set to: `5000`
- [ ] `FRONTEND_URL` - Set to: `https://your-web-service.railway.app` (you'll get this URL later)

### Email Configuration
- [ ] `SENDGRID_API_KEY` - Get from [SendGrid API Keys](https://app.sendgrid.com/settings/api_keys)
  - Must start with `SG.`
  - Keep secret!
- [ ] `SENDGRID_FROM_EMAIL` - Set to: `noreply@wissen-haus.org`
- [ ] `SENDGRID_FROM_NAME` - Set to: `Wissen-Haus`

### Payment Configuration
- [ ] `STRIPE_PUBLIC_KEY` - Get from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
- [ ] `STRIPE_SECRET_KEY` - Get from [Stripe Dashboard](https://dashboard.stripe.com/apikeys)
  - Keep secret!
- [ ] `STRIPE_WEBHOOK_SECRET` - Configure after webhook setup

### Optional: SMS Configuration
- [ ] `TWILIO_ACCOUNT_SID` - From Twilio Console (optional)
- [ ] `TWILIO_AUTH_TOKEN` - From Twilio Console (optional)
- [ ] `TWILIO_PHONE_NUMBER` - Your Twilio number (optional)

### Contact Form
- [ ] `CONTACT_FORM_RECIPIENT_EMAIL` - Set to: `admin@wissen-haus.org`

## Step 6: Configure Web Service Environment Variables

In the Web service, set these environment variables:

### API Configuration
- [ ] `NEXT_PUBLIC_API_URL` - Set to: `https://your-api-service.railway.app/api`
  - Replace `your-api-service` with your actual API service domain
- [ ] `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` - Same as API's `STRIPE_PUBLIC_KEY`

### Server
- [ ] `PORT` - Set to: `3000`

## Step 7: Generate Public Domains

For each service:
- [ ] Click the service
- [ ] Click "Networking" or "Domain" section
- [ ] Click "Generate Domain"
- [ ] Copy the generated domain

Services will now have URLs like:
- API: `https://wissen-haus-api-xyz123.railway.app`
- Web: `https://wissen-haus-web-xyz123.railway.app`

## Step 8: Update Cross-Service References

Now that you have the actual domains:

### Update API Service
- [ ] Go to API service environment variables
- [ ] Update `FRONTEND_URL` to actual Web domain
  - Example: `https://wissen-haus-web-xyz123.railway.app`

### Update Web Service
- [ ] Go to Web service environment variables
- [ ] Update `NEXT_PUBLIC_API_URL` to actual API domain
  - Example: `https://wissen-haus-api-xyz123.railway.app/api`

## Step 9: Trigger Deployments

- [ ] In Railway dashboard, trigger redeploy for API service
- [ ] In Railway dashboard, trigger redeploy for Web service
- [ ] Monitor deployment logs for any errors

## Step 10: Verify Deployment

### API Service
- [ ] Open `https://your-api-domain.railway.app/health`
- [ ] Should return JSON with status: "ok"
- [ ] Check logs for any warnings

### Web Service
- [ ] Open `https://your-web-domain.railway.app`
- [ ] Should load the Wissen-Haus homepage
- [ ] Check that styles and images load correctly

### Database
- [ ] Check API logs for "Database schema initialized"
- [ ] Login page should work (if using database)

### Email (Optional)
- [ ] If configured, test sending a confirmation email
- [ ] Check SendGrid dashboard for delivery status

## Post-Deployment

### Configure Stripe Webhook
- [ ] In Stripe Dashboard, go to "Webhooks"
- [ ] Add endpoint: `https://your-api-domain.railway.app/api/donations/webhook/stripe`
- [ ] Select events: `payment_intent.succeeded`, `charge.refunded`
- [ ] Copy webhook signing secret
- [ ] Update `STRIPE_WEBHOOK_SECRET` in API environment variables
- [ ] Redeploy API service

### Set Up Domain Names
- [ ] Register custom domain (optional)
- [ ] Configure DNS to point to Railway domains
- [ ] Update `FRONTEND_URL` and `NEXT_PUBLIC_API_URL` if using custom domains

### Monitor Services
- [ ] Set up Railway alerts
- [ ] Monitor API logs daily
- [ ] Monitor database performance
- [ ] Check error rates

### Backup Database
- [ ] Set up automatic PostgreSQL backups
- [ ] Keep backup copies securely

## Troubleshooting

If something goes wrong:

1. **Check logs**: Railway dashboard shows real-time logs
2. **Verify environment variables**: Double-check all env vars are set correctly
3. **Restart services**: Use Railway "Redeploy" button
4. **Check database**: Verify PostgreSQL is running and accessible
5. **Test health endpoints**: Verify API is responding
6. **See detailed guide**: Check `RAILWAY.md` for more troubleshooting

## Common Issues & Solutions

### API won't start
- Check `DATABASE_URL` or database credentials
- Check `SENDGRID_API_KEY` format (should start with "SG.")
- View API logs for specific error

### Web won't load
- Check `NEXT_PUBLIC_API_URL` is correct
- Check `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` is set
- View Web logs for specific error

### Database connection error
- Verify PostgreSQL service is running
- Check database credentials are correct
- Verify firewall allows connection

### API key errors
- SendGrid: Verify API key starts with "SG."
- Stripe: Verify keys are from production (not test)
- Check keys don't have extra spaces or quotes

## Need More Help?

- Detailed guide: See `RAILWAY.md`
- Deployment fixes: See `DEPLOYMENT_FIXES.md`
- Environment template: See `.env.example`
- General Railway docs: [docs.railway.app](https://docs.railway.app)
