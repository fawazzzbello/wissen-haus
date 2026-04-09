import { Express } from 'express';
import { healthRouter } from './health';
import { authRouter } from './auth';
import { donationRouter } from './donations';
import { notificationRouter } from './notifications';
// Import routers will be added in subsequent phases
// import { userRouter } from './users';
// import { contentRouter } from './content';
// import { settingsRouter } from './settings';

export function setupRoutes(app: Express) {
  // Health check
  app.use('/api/health', healthRouter);

  // Auth routes (Phase 2)
  app.use('/api/auth', authRouter);

  // Donation routes (Phase 3)
  app.use('/api/donations', donationRouter);

  // Notification routes (Phase 4)
  app.use('/api/notifications', notificationRouter);

  // User routes (Phase 5)
  // app.use('/api/users', userRouter);

  // Content routes (Phase 5)
  // app.use('/api/content', contentRouter);

  // Settings routes (Phase 5)
  // app.use('/api/settings', settingsRouter);
}
