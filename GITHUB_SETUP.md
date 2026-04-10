# GitHub Actions & Secrets Setup Guide

This guide walks you through setting up GitHub Actions secrets required for automated deployment to Railway.

## Step 1: Get Railway Credentials

### Option A: Using Railway CLI (Recommended)
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Get your project token
railway token

# Get your project ID
railway project
```

### Option B: From Railway Dashboard
1. Go to https://railway.app/dashboard
2. Select your project
3. Go to Settings → Tokens
4. Create new token (copy it)
5. Go to Settings → General
6. Copy the Project ID

---

## Step 2: Add GitHub Secrets

1. Go to your GitHub repository
2. Click **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**

### Add These Secrets:

#### `RAILWAY_TOKEN`
- **Value**: Your Railway authentication token
- **How to get**: `railway token` or from Railway dashboard Settings → Tokens
- **Keep safe**: This is like a password - never commit it

#### `RAILWAY_PROJECT_ID`
- **Value**: Your Railway project ID
- **How to get**: `railway project` or from Railway dashboard Settings → General
- **Example**: `00000000-0000-0000-0000-000000000000`

#### `RAILWAY_API_URL` (Optional)
- **Value**: Your deployed API domain
- **Example**: `https://wissen-haus-api.railway.app`
- **Purpose**: Used by deployment verification workflow

#### `RAILWAY_WEB_URL` (Optional)
- **Value**: Your deployed Web domain
- **Example**: `https://wissen-haus-web.railway.app`
- **Purpose**: Used by deployment verification workflow

#### `SLACK_WEBHOOK` (Optional)
- **Value**: Your Slack webhook URL for deployment notifications
- **How to get**: Create incoming webhook in Slack
- **Purpose**: Get notifications when deployments succeed/fail

---

## Step 3: Verify Secrets Are Set

1. Go to **Settings** → **Secrets and variables** → **Actions**
2. You should see your secrets listed (values hidden)
3. You can edit or delete them anytime

---

## Step 4: Test the Workflows

### Test CI/CD Workflow
```bash
# Push any code change to trigger test workflow
git add .
git commit -m "Test GitHub Actions"
git push origin claude/charity-platform-system-SiQB8
```

Check the **Actions** tab to see:
- ✅ Test workflow running
- ✅ Code being linted
- ✅ Tests running
- ✅ Type checks passing

### Test Deployment Workflow
```bash
# Push to main to trigger deployment (if configured)
# Or manually trigger from Actions tab
```

---

## Troubleshooting

### "Repository Secret Not Found"
- Verify secret names match exactly (case-sensitive)
- Check **Settings** → **Secrets** to confirm they're added
- Try deleting and re-adding the secret

### "RAILWAY_TOKEN Invalid"
- Verify token is not expired
- Get a new token from `railway token` or Railway dashboard
- Update the secret with new token

### "Deployment Fails - Permission Denied"
- Verify `RAILWAY_TOKEN` has access to the project
- Verify `RAILWAY_PROJECT_ID` is correct
- Check that token is not for a different project

### "API Health Check Fails"
- Verify `RAILWAY_API_URL` is set correctly
- Check that API service is healthy in Railway dashboard
- Wait 1-2 minutes after deployment for service to start

---

## Understanding the Workflows

### test.yml (Tests & Quality Checks)
Runs on:
- Every push to any branch
- Pull requests to main or develop

What it does:
1. Runs linting on API and Web
2. Runs type checks
3. Runs unit tests
4. Scans for secrets

### deploy-railway.yml (Deployment)
Runs on:
- Push to main branch (auto-deploy to production)
- Push to develop branch (auto-deploy to staging)
- Manual trigger from Actions tab

What it does:
1. Builds API and Web
2. Deploys to Railway
3. Runs health checks
4. Verifies deployment
5. Sends Slack notification (if configured)

### build-docker.yml (Docker Build)
Runs on:
- Push to main, develop, or tags
- Manual trigger from Actions tab

What it does:
1. Builds Docker images for API and Web
2. Pushes to GitHub Container Registry
3. Tags with branch/version info

---

## Manual Deployment (Without GitHub Actions)

If you need to deploy without GitHub Actions:

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy API
railway up --service api

# Deploy Web
railway up --service web

# Check status
railway status
```

---

## Security Best Practices

1. **Never commit secrets** to git
2. **Rotate tokens** periodically
3. **Use different tokens** for different projects
4. **Limit token scope** if Railway supports it
5. **Monitor deployment** history for suspicious activity
6. **Enable branch protection** on main branch
7. **Require PR reviews** before merging to main

---

## Next Steps

1. ✅ Add all required secrets from Step 2
2. ✅ Push code to trigger test workflow
3. ✅ Verify tests pass in Actions tab
4. ✅ Check Railway dashboard for deployment
5. ✅ Verify app is accessible at Railway URL
6. ✅ Set up monitoring/alerting

---

## CI/CD Status Badge

Add this to your README.md to show CI/CD status:

```markdown
[![Tests & Quality Checks](https://github.com/fawazzzbello/wissen-haus/actions/workflows/test.yml/badge.svg)](https://github.com/fawazzzbello/wissen-haus/actions/workflows/test.yml)
[![Deploy to Railway](https://github.com/fawazzzbello/wissen-haus/actions/workflows/deploy-railway.yml/badge.svg)](https://github.com/fawazzzbello/wissen-haus/actions/workflows/deploy-railway.yml)
```

