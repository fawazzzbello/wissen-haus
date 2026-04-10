import { Router } from 'express';
import {
  getProviders,
  generateContent,
  analyzeDonations,
  analyzeDonors,
  chat,
  generateReport,
} from '@/controllers/aiController';
import { authenticate, adminOnly } from '@/middleware/auth';

const router = Router();

/**
 * AI Service Routes
 * All routes require admin authentication
 */

/**
 * GET /api/ai/providers
 * Get list of available AI providers
 */
router.get('/providers', authenticate, adminOnly, getProviders);

/**
 * POST /api/ai/generate
 * Generate content using AI
 * Body: { prompt: string, context?: object }
 */
router.post('/generate', authenticate, adminOnly, generateContent);

/**
 * POST /api/ai/analyze-donations
 * Analyze donation data and provide insights
 * Body: { donations: array }
 */
router.post('/analyze-donations', authenticate, adminOnly, analyzeDonations);

/**
 * POST /api/ai/analyze-donors
 * Analyze donor data and provide insights
 * Body: { donors: array }
 */
router.post('/analyze-donors', authenticate, adminOnly, analyzeDonors);

/**
 * POST /api/ai/chat
 * Chat with AI assistant
 * Body: { messages: array<{role: 'user'|'assistant', content: string}> }
 */
router.post('/chat', authenticate, adminOnly, chat);

/**
 * POST /api/ai/generate-report
 * Generate a report using AI
 * Body: { reportType: string, data: array, customPrompt?: string }
 */
router.post('/generate-report', authenticate, adminOnly, generateReport);

export { router as aiRouter };
