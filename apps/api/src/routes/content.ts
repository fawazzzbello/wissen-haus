import { Router } from 'express';
import {
  getPublicPage,
  listContentPages,
  getContentPageById,
  createNewPage,
  updatePageContent,
  deletePageContent,
} from '@/controllers/contentController';
import { authenticate, adminOnly } from '@/middleware/auth';

export const contentRouter = Router();

// Public routes
contentRouter.get('/pages/:slug', getPublicPage);

// Admin routes
contentRouter.get('/admin/pages', authenticate, adminOnly, listContentPages);
contentRouter.post('/admin/pages', authenticate, adminOnly, createNewPage);
contentRouter.get('/admin/pages/:id', authenticate, adminOnly, getContentPageById);
contentRouter.put('/admin/pages/:id', authenticate, adminOnly, updatePageContent);
contentRouter.delete('/admin/pages/:id', authenticate, adminOnly, deletePageContent);
