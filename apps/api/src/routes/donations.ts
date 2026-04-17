import { Router, Request, Response } from 'express';
import {
  createDonationCheckout,
  handleStripeWebhook,
  listDonations,
  getDonation,
  getDonationStatistics,
  processRefund,
  createCampaign,
  getCampaignStats,
  listAllCampaigns,
  getCampaignDonations,
  linkDonationToCampaign,
  createCampaignMilestone,
  getDonorPrefs,
  updateDonorPrefs,
  addDonorNoteHandler,
  getDonorNotesHandler,
  generateBatchReportHandler,
  getBatchReportHandler,
  getImpactStatistics,
} from '@/controllers/donationController';
import { authenticate, adminOnly } from '@/middleware/auth';

export const donationRouter = Router();

// Public donation routes
donationRouter.post('/create-checkout-session', createDonationCheckout);
donationRouter.get('/impact-stats', getImpactStatistics);

// Stripe webhook (raw body required, no auth)
donationRouter.post('/webhook/stripe', (req: Request, res: Response) => {
  // Store raw body in custom property
  (req as any).rawBody = req.body;
  handleStripeWebhook(req, res);
});

// Admin routes
donationRouter.get('/', authenticate, adminOnly, listDonations);
donationRouter.get('/stats', authenticate, adminOnly, getDonationStatistics);
donationRouter.get('/:id', authenticate, adminOnly, getDonation);
donationRouter.post('/:id/refund', authenticate, adminOnly, processRefund);

// Campaign Management Routes (Admin only)
donationRouter.post('/campaigns/create', authenticate, adminOnly, createCampaign);
donationRouter.get('/campaigns/list', authenticate, adminOnly, listAllCampaigns);
donationRouter.get('/campaigns/:id/stats', authenticate, adminOnly, getCampaignStats);
donationRouter.get('/campaigns/:campaignId/donations', authenticate, adminOnly, getCampaignDonations);
donationRouter.post('/campaigns/link-donation', authenticate, adminOnly, linkDonationToCampaign);
donationRouter.post('/campaigns/milestones/create', authenticate, adminOnly, createCampaignMilestone);

// Donor Preferences Routes
donationRouter.get('/donors/:donorId/preferences', authenticate, getDonorPrefs);
donationRouter.put('/donors/:donorId/preferences', authenticate, updateDonorPrefs);

// Donor Notes Routes (Admin only)
donationRouter.post('/donors/:donorId/notes', authenticate, adminOnly, addDonorNoteHandler);
donationRouter.get('/donors/:donorId/notes', authenticate, adminOnly, getDonorNotesHandler);

// Batch Reporting Routes (Admin only)
donationRouter.post('/reports/batch', authenticate, adminOnly, generateBatchReportHandler);
donationRouter.get('/reports/:reportId', authenticate, adminOnly, getBatchReportHandler);
