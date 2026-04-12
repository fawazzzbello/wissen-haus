import { Router, Request, Response } from 'express';
import { authenticate } from '@/middleware/auth';
import {
  getHomepageSections,
  getHomepageSection,
  updateHomepageSection,
  reorderHomepageSections,
} from '@/controllers/homepageController';

export const homepageRouter = Router();

// Public routes
homepageRouter.get('/', getHomepageSections);
homepageRouter.get('/:sectionName', getHomepageSection);

// Admin routes (require authentication)
homepageRouter.put('/:sectionName', authenticate, updateHomepageSection);
homepageRouter.post('/reorder', authenticate, reorderHomepageSections);
