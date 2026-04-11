import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import path from 'path';
import bcrypt from 'bcrypt';
import { pool, initializeDatabase } from '@/config/database';
import { setupRoutes } from '@/routes';
import { errorHandler, requestLogger } from '@/middleware';
import { logger } from '@/utils/logger';

// Load environment variables
dotenv.config({
  path: path.resolve(__dirname, '../.env'),
});

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Middleware: Security Headers
app.use(helmet());

// Middleware: Trust proxy (for Railway and other reverse proxies)
app.set('trust proxy', 1);

// Middleware: CORS
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'https://www.wissenhaus.org',
  'https://wissenhaus.org',
  'https://wissenhaus.org/',
  'https://www.wissenhaus.org/',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      return callback(null, true);
    }

    // In development, allow all origins
    if (process.env.NODE_ENV === 'development') {
      return callback(null, true);
    }

    // Check if origin matches allowed origins (with or without trailing slash)
    const originWithoutTrailingSlash = origin.replace(/\/$/, '');
    const isAllowed = allowedOrigins.some((allowedOrigin) => {
      if (!allowedOrigin) return false;
      const normalizedAllowed = allowedOrigin.replace(/\/$/, '');
      return normalizedAllowed === originWithoutTrailingSlash;
    });

    if (isAllowed) {
      callback(null, true);
    } else {
      logger.warn(`CORS blocked request from: ${origin}`);
      callback(new Error(`CORS not allowed for origin: ${origin}`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Middleware: Webhook handler (raw body) - must come before json parser
app.post(
  '/api/donations/webhook/stripe',
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    (req as any).rawBody = req.body;
    next();
  },
  express.json()
);

// Middleware: Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Middleware: Request Logging
app.use(requestLogger);

// Middleware: Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// API Routes
setupRoutes(app);

// Error handling middleware (must be last)
app.use(errorHandler);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
  });
});

// Auto-seed default admin user if database is empty
async function ensureDefaultAdminUser() {
  try {
    const client = await pool.connect();
    try {
      // Check if users table has any records
      const result = await client.query('SELECT COUNT(*) FROM users');
      const userCount = parseInt(result.rows[0].count, 10);

      if (userCount === 0) {
        logger.info('⏳ Creating default admin user...');

        // Create default admin user
        const hashedPassword = await bcrypt.hash('admin@123456', 10);

        await client.query(
          `INSERT INTO users (email, password_hash, first_name, last_name, role, status)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            'admin@wissen-haus.org',
            hashedPassword,
            'Admin',
            'User',
            'super_admin',
            'active',
          ]
        );

        logger.info('✓ Created default admin user: admin@wissen-haus.org (password: admin@123456)');
      }
    } finally {
      client.release();
    }
  } catch (error: any) {
    // Don't fail startup if seeding fails, just log it
    logger.warn('⚠ Could not ensure default admin user:', error.message);
  }
}

// Initialize database and start server
async function startServer() {
  let dbReady = false;

  // Try to initialize database
  try {
    const client = await pool.connect();
    await client.query('SELECT NOW()');
    client.release();
    logger.info('✓ Database connection successful');

    await initializeDatabase();
    logger.info('✓ Database schema initialized');

    // Ensure default admin user exists
    await ensureDefaultAdminUser();

    dbReady = true;
  } catch (error: any) {
    logger.warn('⚠ Database connection failed at startup:', error.message);
    logger.info('Server will continue without database. Reconnection will be attempted on requests.');
  }

  // Start Express server regardless of database status
  app.listen(PORT, () => {
    logger.info(`✓ Server running on http://localhost:${PORT}`);
    logger.info(`✓ Environment: ${NODE_ENV}`);
    logger.info(`✓ Database ready: ${dbReady}`);
  });
}

startServer();

// Graceful shutdown
process.on('SIGINT', async () => {
  logger.info('Shutting down gracefully...');
  await pool.end();
  process.exit(0);
});

export default app;
