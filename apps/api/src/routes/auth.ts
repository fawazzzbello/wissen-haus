import { Router } from 'express';
import {
  register,
  login,
  getCurrentUser,
  refresh,
  logout,
  changeUserPassword,
} from '@/controllers/authController';
import { authenticate } from '@/middleware/auth';

export const authRouter = Router();

// Public routes
authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.post('/refresh', refresh);

// Protected routes
authRouter.post('/logout', authenticate, logout);
authRouter.get('/me', authenticate, getCurrentUser);
authRouter.post('/change-password', authenticate, changeUserPassword);
