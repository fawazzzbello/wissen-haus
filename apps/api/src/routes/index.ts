import { Express } from 'express';
import { healthRouter } from './health';
import { authRouter } from './auth';
import { userRouter } from './users';
import { donationRouter } from './donations';
import { contentRouter } from './content';
import { notificationRouter } from './notifications';
import { contactRouter } from './contact';

export function setupRoutes(app: Express) {
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
}
