import { Express } from 'express';
import { healthRouter } from './health';
import { authRouter } from './auth';
import { userRouter } from './users';
import { donationRouter } from './donations';
import { contentRouter } from './content';
import { notificationRouter } from './notifications';
import { contactRouter } from './contact';
import { aiRouter } from './ai';

export function setupRoutes(app: Express) {
  // Root endpoint - API info
  app.get('/', (req, res) => {
    res.json({
      name: 'Wissen-Haus Charity Platform API',
      version: '1.0.0',
      status: 'operational',
      endpoints: {
        health: '/health',
        auth: '/api/auth',
        users: '/api/users',
        donations: '/api/donations',
        content: '/api/content',
        contact: '/api/contact',
        notifications: '/api/notifications',
      },
      documentation: 'https://github.com/fawazzzbello/wissen-haus',
    });
  });

  // Health check
  app.use('/api/health', healthRouter);

  // Auth routes
  app.use('/api/auth', authRouter);

  // User management routes
  app.use('/api/users', userRouter);

  // Donation routes
  app.use('/api/donations', donationRouter);

  // Content routes
  app.use('/api/content', contentRouter);

  // Contact routes
  app.use('/api/contact', contactRouter);

  // Notification routes
  app.use('/api/notifications', notificationRouter);

  // AI routes
  app.use('/api/ai', aiRouter);
}
