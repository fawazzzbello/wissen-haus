import { Router, Request, Response } from 'express';
import {
  createDonationCheckout,
  handleStripeWebhook,
  listDonations,
  getDonation,
  getDonationStatistics,
  processRefund,
} from '@/controllers/donationController';
import { authenticate, adminOnly } from '@/middleware/auth';

export const donationRouter = Router();

// Public donation routes
donationRouter.post('/create-checkout-session', createDonationCheckout);

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
