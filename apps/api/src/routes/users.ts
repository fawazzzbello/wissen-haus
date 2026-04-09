import { Router } from 'express';
import {
  listUsers,
  getUser,
  createNewUser,
  updateUserProfile,
  deleteUserHandler,
  resetPassword,
} from '@/controllers/userController';
import { authenticate, adminOnly, superAdminOnly } from '@/middleware/auth';

export const userRouter = Router();

// Protected routes
userRouter.get('/', authenticate, adminOnly, listUsers);
userRouter.post('/', authenticate, superAdminOnly, createNewUser);
userRouter.get('/:id', authenticate, adminOnly, getUser);
userRouter.put('/:id', authenticate, updateUserProfile);
userRouter.delete('/:id', authenticate, superAdminOnly, deleteUserHandler);
userRouter.post('/:id/reset-password', authenticate, superAdminOnly, resetPassword);
