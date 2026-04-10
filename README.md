# Wissen-Haus Empowerment Foundation

A comprehensive charity platform system for Wissen-Haus Empowerment Foundation, a youth-focused non-profit organization committed to empowering young people to reach their full potential.

## 🎯 Mission

To empower young people through access to knowledge, skills development, mentorship, and opportunities that foster personal growth, leadership, and sustainable success.

## 👀 Vision

To see a world where young people are empowered, self-reliant, and equipped to shape their own futures and positively impact their communities.

---

## 🚀 Quick Start: Deploy to Railway (5 minutes)

### Prerequisites
- GitHub account connected to Railway
- SendGrid account (for email - optional)
- Stripe account (for donations - optional)

### Step 1: Create API Service on Railway

1. Go to [Railway.app](https://railway.app)
2. Click "New Project" → "GitHub Repo" → Select this repository
3. Set up the service:
   - **Service Name**: `api`
   - **Root Directory**: `apps/api`
   - **Build Command**: `npm run build -w apps/api`
   - **Start Command**: `npm run start -w apps/api`
4. Click "Deploy"
5. Once deployed, click "Generate Domain" to get your API URL (save it)

### Step 2: Add PostgreSQL Database

1. In Railway project, click "Add" → "PostgreSQL"
2. Wait for it to initialize
3. This automatically sets `DATABASE_URL` environment variable

### Step 3: Create Web Service on Railway

1. Click "Add" → "GitHub Repo" → Select this repository
2. Set up the service:
   - **Service Name**: `web`
   - **Root Directory**: `apps/web`
   - **Build Command**: `npm run build -w apps/web`
   - **Start Command**: `npm run start -w apps/web`
3. Click "Deploy"
4. Once deployed, click "Generate Domain" to get your Web URL (save it)

### Step 4: Connect Services

**In API Service Environment Variables:**
- Add: `FRONTEND_URL` = your web domain (e.g., `https://wissen-haus-web.railway.app`)
- Add: `SENDGRID_API_KEY` = Your SendGrid key (optional, starts with "SG.")
- Add: `STRIPE_SECRET_KEY` = Your Stripe secret key (optional)

**In Web Service Environment Variables:**
- Add: `NEXT_PUBLIC_API_URL` = your API domain + `/api` (e.g., `https://wissen-haus-api.railway.app/api`)
- Add: `API_INTERNAL_URL` = your API domain (e.g., `https://wissen-haus-api.railway.app`) **← IMPORTANT FOR LOGIN**
- Add: `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` = Your Stripe public key (optional)

### Step 5: Redeploy Both Services

Click "Redeploy" on each service. Done! 🎉

---

## 🏗️ Project Structure

```
wissen-haus/
├── apps/
│   ├── api/               # Express.js backend
│   │   ├── src/
│   │   ├── dist/          # Built files
│   │   └── package.json
│   └── web/               # Next.js frontend
│       ├── src/
│       │   └── app/
│       │       ├── (public)/      # Public pages
│       │       └── (admin)/       # Admin pages
│       └── package.json
├── packages/              # Shared utilities
├── .npmrc                 # npm configuration
├── .env.example           # Environment template
├── docker-compose.yml     # Local development
└── package.json           # Root monorepo config
```

---

## 📦 Development Setup (Local)

### Prerequisites
- Node.js 18.0.0+
- npm 9.0.0+ or 10.0.0+
- Docker & Docker Compose
- PostgreSQL 14+ (via Docker)

### Installation

```bash
# 1. Clone repository
git clone https://github.com/fawazzzbello/wissen-haus.git
cd wissen-haus

# 2. Install dependencies
npm install

# 3. Start Docker services (PostgreSQL, etc.)
docker-compose up -d

# 4. Set up environment
cp .env.example .env.local
# Edit .env.local with your local values

# 5. Run migrations
npm run migrate

# 6. Start development servers
npm run dev
```

Access the application:
- **Web**: http://localhost:3000
- **API**: http://localhost:5000
- **Admin**: http://localhost:3000/login (Demo: admin@wissen-haus.org / admin@123456)

---

## 🔑 Environment Variables

### Required for Railway Deployment

```env
# API Service
NODE_ENV=production
FRONTEND_URL=https://your-web-domain.railway.app
DATABASE_URL=postgresql://user:pass@host:port/db  # Auto-set by Railway PostgreSQL plugin

# Web Service
NEXT_PUBLIC_API_URL=https://your-api-domain.railway.app/api
```

### Optional (for Features)

```env
# Email (SendGrid)
SENDGRID_API_KEY=SG.your_key_here
SENDGRID_FROM_EMAIL=noreply@wissen-haus.org

# Payments (Stripe)
STRIPE_PUBLIC_KEY=pk_live_your_key
STRIPE_SECRET_KEY=sk_live_your_key
STRIPE_WEBHOOK_SECRET=whsec_your_key

# SMS (Twilio - optional)
TWILIO_ACCOUNT_SID=your_sid
TWILIO_AUTH_TOKEN=your_token
TWILIO_PHONE_NUMBER=+1234567890
```

See `.env.example` for complete list.

---

## 📋 Development Commands

### Root Level
```bash
npm run dev              # Start all apps locally
npm run build           # Build all apps for production
npm run start           # Start web app (for production)
npm run start:api       # Start API only
npm run start:web       # Start web only
npm run test            # Run all tests
npm run lint            # Lint all code
npm run migrate         # Run database migrations
npm run seed            # Seed database with sample data
```

### Backend (API)
```bash
npm run dev -w apps/api         # Start API dev server
npm run build -w apps/api       # Build API
npm run test -w apps/api        # Test API
npm run start -w apps/api       # Start API production
```

### Frontend (Web)
```bash
npm run dev -w apps/web         # Start web dev server
npm run build -w apps/web       # Build web
npm run test -w apps/web        # Test web
npm run start -w apps/web       # Start web production
```

---

## 🌐 Application Routes

### Public Pages
- `/` - Homepage
- `/about` - About page
- `/contact` - Contact form
- `/donate` - Donation page
- `/donate/checkout` - Stripe checkout
- `/donate/success` - Donation confirmation
- `/blog` - Blog page
- `/faq` - FAQ page
- `/login` - Admin login page

### Admin Pages (Protected)
- `/dashboard` - Admin dashboard
- `/donations` - Donation history
- `/users` - User management
- `/content` - Content editor
- `/settings` - Organization settings
- `/notifications` - Notification history

### API Endpoints
- `GET /health` - Server health check
- `POST /api/auth/login` - Admin login
- `POST /api/auth/register` - User registration
- `GET /api/auth/me` - Current user info
- `POST /api/donations/create-checkout-session` - Stripe checkout
- `POST /api/donations/webhook/stripe` - Webhook receiver

---

## 🔐 Security & Features

### Authentication
- ✅ JWT-based auth with refresh tokens
- ✅ Password hashing with bcrypt
- ✅ Role-based access control (RBAC)
- ✅ Protected admin dashboard

### API Security
- ✅ CORS configuration (configurable domains)
- ✅ Helmet.js security headers
- ✅ Rate limiting (100 requests/15min)
- ✅ SQL injection prevention
- ✅ XSS protection

### Features
- ✅ User authentication & authorization
- ✅ Donation processing with Stripe
- ✅ Email notifications with SendGrid
- ✅ Admin dashboard
- ✅ Content management system
- ✅ Responsive design with Tailwind CSS

---

## 🚨 Troubleshooting Railway Deployment

### Issue: Build fails with "npm error EBADENGINE"
**Solution**: Already fixed! The `package.json` now supports both npm 9.x and 10.x.

### Issue: Login page not loading
**Solution**: Already fixed! Login page moved to public route group. Access at `/login`.

### Issue: EADDRINUSE error on port 5000
**Solution**: Make sure API and Web are separate Railway services with separate domains.

### Issue: Database connection refused
**Solution**: 
1. Verify PostgreSQL plugin is added to project
2. Check `DATABASE_URL` is set in API service environment
3. Restart API service after adding database

### Issue: SendGrid "API key does not start with SG."
**Solution**: 
1. Get valid API key from SendGrid dashboard
2. Ensure it starts with "SG."
3. Paste into SENDGRID_API_KEY variable
4. Email is optional - service continues without it

### Issue: API and Web can't communicate / Login fails
**Symptom**: "Failed to proxy http://localhost:5000/api/" or login returns 404

**Solution**:
1. In Web service environment variables, set BOTH:
   - `NEXT_PUBLIC_API_URL=https://your-api-domain.railway.app/api` (for client-side)
   - `API_INTERNAL_URL=https://your-api-domain.railway.app` (for server-side proxying) ← **Don't forget this!**
2. In API service, set: `FRONTEND_URL=https://your-web-domain.railway.app`
3. **Redeploy both services** (redeploy is required for env var changes to take effect)
4. Test login at `/login`

### Issue: Invalid rewrite found / Build fails with malformed destination URL
**Symptom**: "destination does not start with `/`, `http://`, or `https://`" or build error with malformed URL like `https:/-production-xxx.railway.app`

**Root cause**: The `API_INTERNAL_URL` environment variable is not set or is set to a malformed value (missing `https://` prefix).

**Solution**:
1. Check your Web service environment variables on Railway
2. Ensure `API_INTERNAL_URL` is set to a FULL URL starting with `https://`:
   - ✅ Correct: `API_INTERNAL_URL=https://wissen-haus-api.railway.app`
   - ❌ Wrong: `API_INTERNAL_URL=wissen-haus-api.railway.app` (missing https://)
   - ❌ Wrong: `API_INTERNAL_URL=/api` (relative paths don't work)
3. If you don't know your API service domain:
   - Go to Railway dashboard → API service → Deployments → click the deployment
   - Copy the "Domains" URL (e.g., `https://wissen-haus-api.railway.app`)
   - Use that as your `API_INTERNAL_URL` (without any path suffix like `/api`)
4. After fixing, **Redeploy the Web service**

---

## 🏗️ Architecture

### Backend Architecture
- **Framework**: Express.js
- **Language**: TypeScript
- **Database**: PostgreSQL
- **Auth**: JWT + bcrypt
- **Payment**: Stripe API
- **Email**: SendGrid API
- **Logging**: Winston
- **Validation**: Joi

### Frontend Architecture
- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **State**: Zustand
- **Validation**: React Hook Form + Zod
- **Payment**: Stripe React

### Database Schema
- `users` - Admin users with roles
- `donors` - Donor profiles
- `donations` - Donation transactions
- `content_pages` - CMS pages
- `notification_logs` - Email/SMS tracking
- `activity_logs` - Audit trail
- `settings` - Organization config

---

## 📊 Project Status

- ✅ Phase 1: Core Infrastructure
- ✅ Phase 2: Authentication & Login
- ✅ Phase 3: Donation System
- ✅ Phase 4: Email Notifications
- 🔄 Phase 5: Admin Features
- 🔄 Phase 6: Public Website
- ⏳ Phase 7: Testing & Quality
- ⏳ Phase 8: Production Setup

---

## 🛠️ Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| Runtime | Node.js | 18.0.0+ |
| Package Manager | npm | 9.0.0+ |
| Backend | Express.js | 4.18.2 |
| Frontend | Next.js | 14.0.4 |
| Database | PostgreSQL | 14+ |
| Language | TypeScript | 5.3.3 |
| Styling | Tailwind CSS | 3.4.1 |
| Auth | JWT + bcrypt | - |
| Payments | Stripe | 14.18.0 |
| Email | SendGrid | 8.1.0 |
| Deployment | Railway | - |

---

## 🤝 Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -am 'Add feature'`
3. Push to branch: `git push origin feature/your-feature`
4. Submit a pull request

---

## 📧 Support

- **Email**: info@wissen-haus.org
- **Website**: www.wissen-haus.org
- **GitHub**: https://github.com/fawazzzbello/wissen-haus

---

## 📄 License

This project is proprietary and confidential. Unauthorized copying is prohibited.

---

## 🙏 Acknowledgments

Built with ❤️ for the youth and communities of Wissen-Haus Empowerment Foundation.

**Current Status**: Ready for production deployment on Railway ✅
