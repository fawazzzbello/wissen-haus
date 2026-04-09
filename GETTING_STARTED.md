# Getting Started with Wissen-Haus Platform

A comprehensive guide to set up and test the Wissen-Haus Empowerment Foundation charity platform locally.

## 🚀 Quick Start (5 minutes)

### 1. Start Docker Services
```bash
docker-compose up -d
```

This starts:
- PostgreSQL database on localhost:5432
- Redis cache on localhost:6379

### 2. Install Dependencies
```bash
npm install
```

### 3. Set Up Environment Variables

**Backend** (`apps/api/.env`):
```bash
cp apps/api/.env.example apps/api/.env
```

Edit `apps/api/.env` and set:
- `STRIPE_SECRET_KEY` - Get from https://dashboard.stripe.com (test mode)
- `SENDGRID_API_KEY` - Get from https://sendgrid.com
- `TWILIO_ACCOUNT_SID` - Get from https://www.twilio.com
- `TWILIO_AUTH_TOKEN` - Get from https://www.twilio.com
- `TWILIO_PHONE_NUMBER` - Your Twilio phone number

**Frontend** (`apps/web/.env.local`):
```bash
cp apps/web/.env.local.example apps/web/.env.local
```

Edit `apps/web/.env.local` and set:
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Your Stripe publishable key (test mode)

### 4. Initialize Database
```bash
npm run migrate
```

### 5. Seed Sample Data
```bash
npm run seed
```

Creates admin user:
- **Email:** admin@wissen-haus.org
- **Password:** admin@123456

### 6. Start Development Servers
```bash
npm run dev
```

This starts:
- Backend API: http://localhost:5000
- Frontend: http://localhost:3000

## 🧪 Testing the System

### Test Admin Dashboard
1. Go to http://localhost:3000/admin/login
2. Log in with credentials from seeding
3. View dashboard with sample statistics
4. Navigate to different admin sections (donations, users, settings, etc.)

### Test Donation Flow (No Stripe Required)
1. Go to http://localhost:3000/donate
2. Fill in donation form (any details work for testing)
3. Click "Proceed to Payment"
4. On checkout page, note the client secret (payment setup would go here)

### Test API Endpoints (with curl or Postman)

**Health Check:**
```bash
curl http://localhost:5000/api/health
```

**Register User:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "newadmin@test.com",
    "password": "SecurePassword123",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@wissen-haus.org",
    "password": "admin@123456"
  }'
```

**Get Current User (replace TOKEN with access token from login):**
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/auth/me
```

**Create Donation Checkout Session:**
```bash
curl -X POST http://localhost:5000/api/donations/create-checkout-session \
  -H "Content-Type: application/json" \
  -d '{
    "email": "donor@example.com",
    "firstName": "Jane",
    "lastName": "Smith",
    "phone": "+1234567890",
    "amount": 100,
    "currency": "USD"
  }'
```

**Send Test Email:**
```bash
curl -X POST http://localhost:5000/api/notifications/email/test \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

**Send Test SMS:**
```bash
curl -X POST http://localhost:5000/api/notifications/sms/test \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"phone": "+1234567890"}'
```

**Get Notification Logs:**
```bash
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/notifications/logs
```

## 📁 Project Structure

```
wissen-haus/
├── apps/
│   ├── api/              # Express.js backend
│   │   ├── src/
│   │   │   ├── services/  # Business logic
│   │   │   ├── controllers/ # Route handlers
│   │   │   ├── routes/    # API endpoints
│   │   │   ├── middleware/ # Auth, logging, etc.
│   │   │   ├── config/    # Database, env
│   │   │   └── db/        # Migrations, schema
│   │   └── package.json
│   │
│   └── web/              # Next.js frontend
│       ├── src/
│       │   ├── app/      # Pages and layouts
│       │   ├── components/ # Reusable components
│       │   ├── lib/      # Utilities, API clients
│       │   └── styles/   # CSS
│       └── package.json
│
├── docker-compose.yml    # PostgreSQL + Redis
├── package.json          # Root workspace config
├── README.md            # Overview
└── GETTING_STARTED.md   # This file
```

## 🔑 Key Features Implemented

### Phase 1: Infrastructure ✅
- Monorepo structure with npm workspaces
- Express.js backend with TypeScript
- Next.js frontend with TypeScript
- PostgreSQL database with migrations
- Docker Compose for development
- Logging and error handling

### Phase 2: Authentication ✅
- JWT token generation and verification
- User registration and login
- Password hashing with bcrypt
- Role-based access control
- Admin dashboard
- Protected routes

### Phase 3: Donations & Payments ✅
- Stripe integration
- Donation checkout flow
- Payment intent handling
- Webhook processing
- Donor tracking
- Donation statistics

### Phase 4: Notifications ✅
- SendGrid email integration
- Twilio SMS integration
- Donation confirmation emails
- SMS notifications
- Notification logging
- Settings management

### Phases 5-8: Placeholder Pages
- User management endpoints
- Content management system
- Public website pages
- Testing setup
- Monitoring configuration

## 🔧 Development Commands

```bash
# Start everything
npm run dev

# Build all apps
npm run build

# Run tests
npm run test

# Database
npm run migrate      # Run migrations
npm run seed        # Seed initial data

# Individual app commands
npm run dev -w apps/api      # Backend only
npm run dev -w apps/web      # Frontend only
npm run build -w apps/api    # Build backend
npm run build -w apps/web    # Build frontend
```

## 🗄️ Database

### Access PostgreSQL
```bash
docker exec -it wissen_haus_postgres psql -U postgres -d wissen_haus_db
```

### Key Tables
- `users` - Admin users
- `donors` - Donation information
- `donations` - Donation transactions
- `content_pages` - CMS content
- `notification_logs` - Email/SMS tracking
- `settings` - Configuration
- `activity_logs` - Audit trail

## 🔐 Security Notes

### In Development
- JWT tokens expire every 15 minutes
- Passwords are hashed with bcrypt (10 rounds)
- CORS is enabled for localhost:3000
- Rate limiting is set to 100 requests per 15 minutes

### For Production
1. Update all `.env` variables with production values
2. Use environment variable management (AWS Secrets Manager, etc.)
3. Enable HTTPS/TLS
4. Configure proper CORS origins
5. Implement WAF and DDoS protection
6. Set up backup and disaster recovery
7. Enable monitoring and alerting

## 🐛 Troubleshooting

### PostgreSQL Connection Error
```bash
# Check if Docker is running
docker-compose ps

# Restart services
docker-compose down
docker-compose up -d

# Check logs
docker-compose logs postgres
```

### API Not Starting
```bash
# Check if port 5000 is in use
lsof -i :5000

# Check environment variables
cat apps/api/.env

# Run migrations
npm run migrate
```

### Frontend Not Loading
```bash
# Clear Next.js cache
rm -rf apps/web/.next

# Clear node_modules if needed
rm -rf apps/web/node_modules
npm install

# Restart dev server
npm run dev -w apps/web
```

## 📚 Next Steps

### To Test with Stripe
1. Get test keys from https://dashboard.stripe.com
2. Update `STRIPE_SECRET_KEY` and `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
3. Use Stripe test cards: https://stripe.com/docs/testing

### To Test Email Notifications
1. Get SendGrid API key from https://sendgrid.com
2. Add to `SENDGRID_API_KEY`
3. Use `/api/notifications/email/test` endpoint

### To Test SMS Notifications
1. Get Twilio credentials from https://www.twilio.com
2. Add to `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_PHONE_NUMBER`
3. Use `/api/notifications/sms/test` endpoint

## 📞 API Documentation

Full API documentation available in code comments. Key endpoints:

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `POST /api/auth/refresh` - Refresh token
- `POST /api/auth/logout` - Logout
- `GET /api/auth/me` - Get current user

### Donations
- `POST /api/donations/create-checkout-session` - Start donation
- `GET /api/donations` - List donations (admin)
- `GET /api/donations/stats` - Get statistics

### Notifications
- `GET /api/notifications/logs` - View notification logs
- `POST /api/notifications/email/test` - Send test email
- `POST /api/notifications/sms/test` - Send test SMS

## 📖 Learn More

- [README.md](./README.md) - Project overview
- [Architecture Overview](./ARCHITECTURE.md) - System design
- Code comments throughout the codebase

## ✅ Verification Checklist

- [ ] Docker services running (`docker-compose ps`)
- [ ] Dependencies installed (`npm install`)
- [ ] Database migrated (`npm run migrate`)
- [ ] Sample data seeded (`npm run seed`)
- [ ] Backend running on :5000
- [ ] Frontend running on :3000
- [ ] Admin dashboard accessible
- [ ] API endpoints responding
- [ ] Database connected

Once all checks pass, your Wissen-Haus platform is ready for testing! 🎉

---

For issues or questions, check the troubleshooting section or review the code comments.
