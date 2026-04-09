# Immediate Action: Fix EADDRINUSE Error NOW

## What You're Seeing

```
Error: listen EADDRINUSE: address already in use :::5000
```

Both API and Web are trying to use port 5000 in the same container.

## Fix It Right Now (2 Options)

### FASTEST FIX (5 minutes)

**If you have only ONE Railway service:**

1. Go to **Railway Dashboard** → Select your project
2. Click on the service
3. Go to **Settings** tab
4. Find **"Start Command"** field
5. Change it to:
   ```bash
   npm run start:web
   ```
6. Redeploy

✅ This stops the EADDRINUSE error
❌ But you still need the API running separately

---

### PROPER FIX (15 minutes, Recommended)

**Create two separate services on Railway:**

#### Step 1: Delete or disable current service
- Go to Railway → Settings
- Click "Remove Service" or pause it

#### Step 2: Create API service
1. Click "New" → "Service" → "GitHub Repo"
2. Select this repository
3. Fill in:
   - **Service Name**: `api`
   - **Root Directory**: `apps/api`
   - **Build Command**: `npm run build -w apps/api`
   - **Start Command**: `npm run start:api`
4. Click "Deploy"
5. Wait for deployment
6. Click "Generate Domain" to get public URL
7. Copy the domain (e.g., `https://wissen-haus-api-xyz.railway.app`)

#### Step 3: Create Web service
1. Click "New" → "Service" → "GitHub Repo"
2. Select this repository
3. Fill in:
   - **Service Name**: `web`
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build -w apps/web`
   - **Start Command**: `npm run start:web`
4. Click "Deploy"
5. Wait for deployment
6. Click "Generate Domain" to get public URL
7. Copy the domain (e.g., `https://wissen-haus-web-xyz.railway.app`)

#### Step 4: Link the services
1. **In API service settings**, set environment variable:
   - Key: `FRONTEND_URL`
   - Value: Your web domain (from Step 3)
   - Example: `https://wissen-haus-web-xyz.railway.app`
   - Click Redeploy

2. **In Web service settings**, set environment variables:
   - Key: `NEXT_PUBLIC_API_URL`
   - Value: Your API domain + `/api` (from Step 2)
   - Example: `https://wissen-haus-api-xyz.railway.app/api`
   - Click Redeploy

3. **In API service**, also ensure you have:
   - `DATABASE_URL` (from PostgreSQL plugin)
   - `SENDGRID_API_KEY` (optional, from SendGrid)
   - `STRIPE_SECRET_KEY` (optional, from Stripe)
   - Click Redeploy after adding

#### Step 5: Verify
- Open your Web domain: `https://wissen-haus-web-xyz.railway.app`
- Should see the Wissen-Haus homepage
- Should load without errors

---

## Which Option Should You Choose?

| Scenario | Choose |
|----------|--------|
| "I just want it working ASAP" | Option 1 (Fastest) |
| "I want it properly set up" | Option 2 (Proper) |
| "This is production" | Option 2 (Proper) |
| "I plan to scale later" | Option 2 (Proper) |

---

## After Fixing

### Check if it worked

1. **API Health Check**:
   ```
   curl https://your-api-domain.railway.app/health
   ```
   Should return: `{"status":"ok",...}`

2. **Web loads**:
   ```
   Open https://your-web-domain.railway.app in browser
   ```
   Should show Wissen-Haus homepage

3. **Check logs**:
   - Go to Railway → Service → Logs
   - Look for any errors
   - Should see "Server running on..." message

### If still having issues

- Go to `CRITICAL_FIX_EADDRINUSE.md` for detailed troubleshooting
- Check Railway logs for specific error messages
- Verify all environment variables are set correctly

---

## Understanding the Error

**What causes EADDRINUSE:**
1. Both API and Web try to start
2. Both default to port 5000 in your environment
3. First one (API) gets port 5000
4. Second one (Web) can't use 5000 → ERROR

**Why it happens on Railway:**
- Railway runs the `npm start` command
- Old code: `npm start` = `npm run start:api & npm run start:web`
- Both in same container trying to use same port

**What the fix does:**
- Option 1: Removes Web from the same container
- Option 2: Puts each in separate container with separate ports

---

## Need More Help?

- Full details: See `CRITICAL_FIX_EADDRINUSE.md`
- Step-by-step setup: See `RAILWAY_DEPLOYMENT_CHECKLIST.md`
- All changes explained: See `CODE_CHANGES.md`

**Do this first →** Then check the detailed guides if you have questions.
