# Wissen-Haus Empowerment Foundation

A comprehensive charity platform system for Wissen-Haus Empowerment Foundation, a youth-focused non-profit organization committed to empowering young people to reach their full potential.

## 🎯 Mission

To empower young people through access to knowledge, skills development, mentorship, and opportunities that foster personal growth, leadership, and sustainable success.

## 👀 Vision

To see a world where young people are empowered, self-reliant, and equipped to shape their own futures and positively impact their communities.

## 🏗️ Project Structure

```
wissen-haus/
├── apps/
│   ├── api/           # Express.js backend
│   └── web/           # Next.js frontend
├── packages/          # Shared code (types, utilities)
├── docker-compose.yml # Local development environment
└── package.json       # Root monorepo configuration
```

## 🚀 Features

### Phase 1: Core Infrastructure ✅
- [x] Monorepo structure with pnpm workspaces
- [x] Express.js backend with TypeScript
- [x] Next.js frontend with TypeScript
- [x] PostgreSQL database with migrations
- [x] Docker Compose for local development
- [x] Basic middleware (logging, error handling, CORS)
- [x] Health check endpoints

### Phase 2: Authentication (In Progress)
- [ ] JWT authentication and password hashing
- [ ] User registration and login endpoints
- [ ] Role-based access control (RBAC)
- [ ] Admin login page
- [ ] Protected admin dashboard

### Phase 3: Donations & Payments
- [ ] Stripe integration for payments
- [ ] Donation checkout flow
- [ ] One-time and recurring donations
- [ ] Payment webhook handling
- [ ] Donation tracking and analytics

### Phase 4: Notifications
- [ ] SendGrid email integration
- [ ] Twilio SMS integration
- [ ] Donation confirmation emails
- [ ] High-value donation SMS alerts
- [ ] Notification template system
- [ ] Notification logging

### Phase 5: Admin Features
- [ ] User management system
- [ ] Content management system (CMS)
- [ ] Organization settings
- [ ] Donation reporting and export
- [ ] Activity audit logs

### Phase 6: Public Website
- [ ] Landing page with hero section
- [ ] About, mission, and vision pages
- [ ] Impact statistics
- [ ] Contact page
- [ ] FAQ section
- [ ] SEO optimization

### Phase 7: Testing & Quality
- [ ] Unit tests for services
- [ ] Integration tests for APIs
- [ ] E2E tests for critical flows
- [ ] Security audit
- [ ] Performance optimization

### Phase 8: Deployment
- [ ] Production environment setup
- [ ] Monitoring and error tracking
- [ ] CI/CD automation
- [ ] Logging and alerting
- [ ] Database backups

## 📋 Prerequisites

- Node.js 18.0.0 or higher
- npm 9.0.0 or higher
- Docker and Docker Compose
- PostgreSQL 14+ (via Docker)
- Redis (optional, via Docker)

## 🛠️ Installation

### 1. Clone the repository

```bash
git clone https://github.com/fawazzzbello/wissen-haus.git
cd wissen-haus
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

```bash
# Backend
cp apps/api/.env.example apps/api/.env
# Edit apps/api/.env with your configuration

# Frontend
cp apps/web/.env.example apps/web/.env.local
# Edit apps/web/.env.local with your configuration
```

### 4. Start Docker services

```bash
docker-compose up -d
```

### 5. Run database migrations

```bash
npm run migrate
```

### 6. Seed the database (optional)

```bash
npm run seed
```

### 7. Start development servers

```bash
npm run dev
```

## 📦 Development Commands

### Root Level
```bash
npm run dev          # Start all apps in development mode
npm run build        # Build all apps
npm run test         # Run tests in all apps
npm run lint         # Lint all apps
npm run migrate      # Run database migrations
npm run seed         # Seed the database
```

### Backend (apps/api)
```bash
npm run dev -w apps/api          # Start API in dev mode
npm run build -w apps/api        # Build API
npm run test -w apps/api         # Run API tests
npm run migrate -w apps/api      # Run migrations
npm run seed -w apps/api         # Seed database
```

### Frontend (apps/web)
```bash
npm run dev -w apps/web          # Start web in dev mode
npm run build -w apps/web        # Build web
npm run test -w apps/web         # Run web tests
```

## 🔌 API Endpoints (Phase 1 - Health Check)

### Health Check
- `GET /health` - Server health status
- `GET /api/health` - API health status

## 🗄️ Database Schema

The database includes the following tables:
- **users** - Admin users with roles and permissions
- **donors** - Donor information and history
- **donations** - Donation transactions and status
- **content_pages** - CMS pages (homepage, about, etc.)
- **settings** - Organization configuration
- **notification_logs** - Email/SMS delivery tracking
- **activity_logs** - Audit trail of actions
- **donation_events** - Donation event history

## 🔐 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- CORS configuration
- Helmet.js for security headers
- Rate limiting on API endpoints
- SQL injection prevention
- XSS protection
- CSRF tokens (to be implemented)

## 📊 Architecture

### Backend (Express.js + PostgreSQL)
- RESTful API architecture
- Service-based business logic
- Middleware for cross-cutting concerns
- Error handling and logging
- Database migrations system

### Frontend (Next.js + React)
- App Router for file-based routing
- Component-based architecture
- Tailwind CSS for styling
- TypeScript for type safety
- API client utilities

### Database
- PostgreSQL with ACID compliance
- UUID for primary keys
- Automated timestamps
- Proper indexing for performance
- Audit trail for compliance

## 📚 Documentation

- [Architecture Overview](./ARCHITECTURE.md) - System design and components
- [API Documentation](./API.md) - Endpoint specifications
- [Deployment Guide](./DEPLOYMENT.md) - Production setup

## 🧪 Testing

### Unit Tests
```bash
npm run test -w apps/api
npm run test -w apps/web
```

### Integration Tests
```bash
npm run test -w apps/api
```

### E2E Tests (Phase 7)
```bash
npm run test:e2e
```

## 🚢 Deployment

### Development
```bash
docker-compose up -d
npm install
npm run migrate
npm run dev
```

### Staging
- See [DEPLOYMENT.md](./DEPLOYMENT.md)

### Production
- See [DEPLOYMENT.md](./DEPLOYMENT.md)

## 📝 Environment Variables

### Backend (apps/api/.env)
```
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://...
JWT_SECRET=your_secret_key
STRIPE_SECRET_KEY=sk_test_...
SENDGRID_API_KEY=SG_...
TWILIO_ACCOUNT_SID=...
```

See `apps/api/.env.example` for complete list.

### Frontend (apps/web/.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:5000
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

See `apps/web/.env.example` for complete list.

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes and commit: `git commit -am 'Add feature'`
3. Push to the branch: `git push origin feature/your-feature`
4. Submit a pull request

## 📧 Contact

- Email: info@wissen-haus.org
- Website: www.wissen-haus.org
- Phone: +1 (555) 123-4567

## 📄 License

This project is proprietary and confidential. Unauthorized copying is prohibited.

## 🙏 Acknowledgments

Built with ❤️ for the youth and communities of Wissen-Haus Empowerment Foundation.

---

**Status**: Phase 1 Complete ✅ | Moving to Phase 2: Authentication
