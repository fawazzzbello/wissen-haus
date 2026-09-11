import { Request, Response } from 'express';
import {
  createCheckoutSession,
  verifyWebhookSignature,
  handlePaymentIntentSucceeded,
  handlePaymentIntentFailed,
  getDonations,
  getDonationById,
  getDonationStats,
  refundDonation,
} from '@/services/paymentService';
import { getDonationManagementService } from '@/services/donation/donationManagementService';
import { logger } from '@/utils/logger';
import { query } from '@/config/database';

// Create checkout session for donation
export async function createDonationCheckout(req: Request, res: Response) {
  try {
    const { email, firstName, lastName, phone, country, amount, currency, description, type } = req.body;

    // Validation
    if (!email || !firstName || !lastName || !amount) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Email, first name, last name, and amount are required',
        },
      });
    }

    if (amount < 100) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Minimum donation is $1.00',
        },
      });
    }

    const session = await createCheckoutSession({
      email,
      firstName,
      lastName,
      phone,
      country,
      amount: Math.round(amount * 100), // Convert to cents
      currency: currency || 'USD',
      description,
      type: type || 'one_time',
    });

    res.json(session);
  } catch (error: any) {
    logger.error('Create checkout session error:', error);
    res.status(500).json({
      error: {
        code: 'CHECKOUT_FAILED',
        message: 'Unable to create checkout session. Please try again.',
      },
    });
  }
}

// Handle Stripe webhook
export async function handleStripeWebhook(req: Request, res: Response) {
  try {
    const signature = req.headers['stripe-signature'] as string;
    if (!signature) {
      return res.status(400).json({
        error: {
          code: 'MISSING_SIGNATURE',
          message: 'Missing Stripe signature',
        },
      });
    }

    // Get raw body as string
    const rawBody = (req as any).rawBody || '';

    // Verify webhook signature
    const event = verifyWebhookSignature(rawBody, signature);

    // Handle different event types
    switch (event.type) {
      case 'payment_intent.succeeded':
        await handlePaymentIntentSucceeded(event.data.object);
        break;

      case 'payment_intent.payment_failed':
        await handlePaymentIntentFailed(event.data.object);
        break;

      case 'payment_intent.canceled':
        logger.info(`Payment canceled: ${event.data.object.id}`);
        break;

      default:
        logger.debug(`Unhandled event type: ${event.type}`);
    }

    // Acknowledge receipt of event
    res.json({ received: true });
  } catch (error: any) {
    logger.error('Webhook error:', error);
    res.status(400).json({
      error: {
        code: 'WEBHOOK_ERROR',
        message: error.message || 'Webhook processing failed',
      },
    });
  }
}

// Get all donations (admin)
export async function listDonations(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const limit = Math.min(parseInt(req.query.limit as string) || 50, 100);
    const offset = parseInt(req.query.offset as string) || 0;
    const status = req.query.status as string;

    const result = await getDonations(limit, offset, status);

    res.json(result);
  } catch (error: any) {
    logger.error('List donations error:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch donations',
      },
    });
  }
}

// Get single donation
export async function getDonation(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const donation = await getDonationById(id);

    if (!donation) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Donation not found',
        },
      });
    }

    res.json({ donation });
  } catch (error: any) {
    logger.error('Get donation error:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch donation',
      },
    });
  }
}

// Get donation statistics
export async function getDonationStatistics(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const stats = await getDonationStats();

    res.json(stats);
  } catch (error: any) {
    logger.error('Get stats error:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch statistics',
      },
    });
  }
}

// Process refund (admin)
export async function processRefund(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const { id } = req.params;
    const { reason } = req.body;

    await refundDonation(id, reason);

    res.json({
      message: 'Donation refunded successfully',
    });
  } catch (error: any) {
    logger.error('Refund error:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: error.message,
        },
      });
    }

    res.status(500).json({
      error: {
        code: 'REFUND_FAILED',
        message: error.message || 'Failed to process refund',
      },
    });
  }
}

// Campaign Management Functions

// Create a new campaign
export async function createCampaign(req: Request, res: Response) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const {
      name,
      description,
      goalAmountCents,
      campaignType,
      startDate,
      endDate,
      targetDonors,
      impactStatement,
    } = req.body;

    if (!name || !goalAmountCents || !campaignType) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Name, goal amount, and campaign type are required',
        },
      });
    }

    const donationService = getDonationManagementService();
    const campaignId = await donationService.createCampaign({
      name,
      description,
      goalAmountCents,
      campaignType,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      targetDonors,
      impactStatement,
      createdBy: req.user.userId,
    });

    res.status(201).json({
      success: true,
      data: {
        campaignId,
        message: 'Campaign created successfully',
      },
    });
  } catch (error: any) {
    logger.error('Create campaign error:', error);
    res.status(500).json({
      error: {
        code: 'CAMPAIGN_CREATION_FAILED',
        message: error.message || 'Failed to create campaign',
      },
    });
  }
}

// Get campaign stats
export async function getCampaignStats(req: Request, res: Response) {
  try {
    const { id } = req.params;

    const donationService = getDonationManagementService();
    const stats = await donationService.getCampaignStats(id);

    res.json({
      success: true,
      data: stats,
    });
  } catch (error: any) {
    logger.error('Get campaign stats error:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Campaign not found',
        },
      });
    }

    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: error.message || 'Failed to fetch campaign stats',
      },
    });
  }
}

// List all campaigns
export async function listAllCampaigns(req: Request, res: Response) {
  try {
    const status = req.query.status as string | undefined;

    const donationService = getDonationManagementService();
    const campaigns = await donationService.listCampaigns(status);

    res.json({
      success: true,
      data: campaigns,
    });
  } catch (error: any) {
    logger.error('List campaigns error:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: error.message || 'Failed to list campaigns',
      },
    });
  }
}

// Get donations for a campaign
export async function getCampaignDonations(req: Request, res: Response) {
  try {
    const { campaignId } = req.params;

    const donationService = getDonationManagementService();
    const donations = await donationService.getCampaignDonations(campaignId);

    res.json({
      success: true,
      data: donations,
    });
  } catch (error: any) {
    logger.error('Get campaign donations error:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: error.message || 'Failed to fetch campaign donations',
      },
    });
  }
}

// Add donation to campaign
export async function linkDonationToCampaign(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const { donationId, campaignId } = req.body;

    if (!donationId || !campaignId) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Donation ID and campaign ID are required',
        },
      });
    }

    const donationService = getDonationManagementService();
    await donationService.addDonationToCampaign(donationId, campaignId);

    res.json({
      success: true,
      message: 'Donation linked to campaign',
    });
  } catch (error: any) {
    logger.error('Link donation to campaign error:', error);
    res.status(500).json({
      error: {
        code: 'LINK_FAILED',
        message: error.message || 'Failed to link donation to campaign',
      },
    });
  }
}

// Create campaign milestone
export async function createCampaignMilestone(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const { campaignId, milestoneNumber, targetAmountCents, description, rewardDescription } = req.body;

    if (!campaignId || !milestoneNumber || !targetAmountCents) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Campaign ID, milestone number, and target amount are required',
        },
      });
    }

    const donationService = getDonationManagementService();
    const milestoneId = await donationService.createMilestone(
      campaignId,
      milestoneNumber,
      targetAmountCents,
      description,
      rewardDescription
    );

    res.status(201).json({
      success: true,
      data: {
        milestoneId,
        message: 'Milestone created successfully',
      },
    });
  } catch (error: any) {
    logger.error('Create milestone error:', error);
    res.status(500).json({
      error: {
        code: 'MILESTONE_CREATION_FAILED',
        message: error.message || 'Failed to create milestone',
      },
    });
  }
}

// Get donor preferences
export async function getDonorPrefs(req: Request, res: Response) {
  try {
    const { donorId } = req.params;

    const donationService = getDonationManagementService();
    const preferences = await donationService.getDonorPreferences(donorId);

    res.json({
      success: true,
      data: preferences,
    });
  } catch (error: any) {
    logger.error('Get donor preferences error:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: error.message || 'Failed to fetch donor preferences',
      },
    });
  }
}

// Update donor preferences
export async function updateDonorPrefs(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const { donorId } = req.params;
    const preferences = req.body;

    const donationService = getDonationManagementService();
    await donationService.updateDonorPreferences(donorId, preferences);

    res.json({
      success: true,
      message: 'Donor preferences updated successfully',
    });
  } catch (error: any) {
    logger.error('Update donor preferences error:', error);
    res.status(500).json({
      error: {
        code: 'UPDATE_FAILED',
        message: error.message || 'Failed to update donor preferences',
      },
    });
  }
}

// Add donor note
export async function addDonorNoteHandler(req: Request, res: Response) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const { donorId } = req.params;
    const { content, noteType, followUpDate } = req.body;

    if (!content) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Note content is required',
        },
      });
    }

    const donationService = getDonationManagementService();
    const noteId = await donationService.addDonorNote(
      donorId,
      content,
      req.user.userId,
      noteType || 'internal',
      followUpDate ? new Date(followUpDate) : undefined
    );

    res.status(201).json({
      success: true,
      data: {
        noteId,
        message: 'Donor note added successfully',
      },
    });
  } catch (error: any) {
    logger.error('Add donor note error:', error);
    res.status(500).json({
      error: {
        code: 'NOTE_CREATION_FAILED',
        message: error.message || 'Failed to add donor note',
      },
    });
  }
}

// Get donor notes
export async function getDonorNotesHandler(req: Request, res: Response) {
  try {
    const { donorId } = req.params;

    const donationService = getDonationManagementService();
    const notes = await donationService.getDonorNotes(donorId);

    res.json({
      success: true,
      data: notes,
    });
  } catch (error: any) {
    logger.error('Get donor notes error:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: error.message || 'Failed to fetch donor notes',
      },
    });
  }
}

// Generate batch report
export async function generateBatchReportHandler(req: Request, res: Response) {
  try {
    if (!req.user?.userId) {
      return res.status(401).json({
        error: {
          code: 'UNAUTHORIZED',
          message: 'Authentication required',
        },
      });
    }

    const { reportType, periodStart, periodEnd } = req.body;

    if (!reportType || !periodStart || !periodEnd) {
      return res.status(400).json({
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Report type, period start, and period end are required',
        },
      });
    }

    const donationService = getDonationManagementService();
    const reportId = await donationService.generateBatchReport(
      reportType,
      new Date(periodStart),
      new Date(periodEnd),
      req.user.userId
    );

    res.status(201).json({
      success: true,
      data: {
        reportId,
        message: 'Batch report generated successfully',
      },
    });
  } catch (error: any) {
    logger.error('Generate batch report error:', error);
    res.status(500).json({
      error: {
        code: 'REPORT_GENERATION_FAILED',
        message: error.message || 'Failed to generate batch report',
      },
    });
  }
}

// Get batch report
export async function getBatchReportHandler(req: Request, res: Response) {
  try {
    const { reportId } = req.params;

    const donationService = getDonationManagementService();
    const report = await donationService.getBatchReport(reportId);

    res.json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    logger.error('Get batch report error:', error);

    if (error.message.includes('not found')) {
      return res.status(404).json({
        error: {
          code: 'NOT_FOUND',
          message: 'Report not found',
        },
      });
    }

    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: error.message || 'Failed to fetch batch report',
      },
    });
  }
}

// Create manual donation (admin only)
export async function createManualDonation(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({
        error: { code: 'UNAUTHORIZED', message: 'Authentication required' },
      });
    }

    const { donorName, donorEmail, amount, donationType = 'one_time' } = req.body;

    // Validate
    if (!donorName || !donorEmail || !amount || amount <= 0) {
      return res.status(400).json({
        error: { code: 'VALIDATION_ERROR', message: 'Invalid donation data' },
      });
    }

    // Split name into first and last
    const [firstName, ...lastNameParts] = donorName.trim().split(' ');
    const lastName = lastNameParts.join(' ') || '';

    // Get or create donor
    let donorResult = await query('SELECT id FROM donors WHERE email = $1', [donorEmail]);

    let donorId = donorResult.rows[0]?.id;
    if (!donorId) {
      const createDonorResult = await query(
        'INSERT INTO donors (email, first_name, last_name) VALUES ($1, $2, $3) RETURNING id',
        [donorEmail, firstName, lastName]
      );
      donorId = createDonorResult.rows[0].id;
    }

    // Create donation
    const donationResult = await query(
      `INSERT INTO donations (donor_id, amount, donation_type, status, currency, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING id, amount, donation_type, status, created_at`,
      [donorId, amount, donationType, 'completed', 'USD']
    );

    const donation = donationResult.rows[0];

    res.status(201).json({
      success: true,
      data: {
        id: donation.id,
        amount: donation.amount,
        type: donation.donation_type,
        status: donation.status,
        createdAt: donation.created_at,
      },
    });
  } catch (error: any) {
    logger.error('Create manual donation error:', error);
    res.status(500).json({
      error: {
        code: 'CREATE_FAILED',
        message: error.message || 'Failed to create donation',
      },
    });
  }
}

// Get impact statistics (real data from database)
export async function getImpactStatistics(req: Request, res: Response) {
  try {
    const donationsResult = await query(`
      SELECT
        SUM(amount) as total_raised,
        COUNT(DISTINCT donor_id) as unique_donors
      FROM donations
      WHERE status = 'completed'
    `);

    const settingsResult = await query(`
      SELECT setting_key, setting_value
      FROM site_settings
      WHERE setting_key IN ('stat1_value', 'stat2_value', 'stat3_value', 'stat4_value')
      ORDER BY setting_key
    `);

    const statMap: { [key: string]: string } = {};
    settingsResult.rows.forEach((row: any) => {
      statMap[row.setting_key] = row.setting_value;
    });

    const stats = {
      totalRaised: parseFloat(donationsResult.rows[0]?.total_raised || 0),
      uniqueDonors: parseInt(donationsResult.rows[0]?.unique_donors || 0),
      stat1: {
        value: statMap['stat1_value'] || '5,000+',
        label: 'Students Reached'
      },
      stat2: {
        value: statMap['stat2_value'] || '500+',
        label: 'Active Mentors'
      },
      stat3: {
        value: statMap['stat3_value'] || '95%',
        label: 'Success Rate'
      },
      stat4: {
        value: statMap['stat4_value'] || '20+',
        label: 'Communities'
      },
    };

    res.json(stats);
  } catch (error: any) {
    logger.error('Get impact stats error:', error);
    res.status(500).json({
      error: {
        code: 'FETCH_FAILED',
        message: 'Failed to fetch impact statistics',
      },
    });
  }
}
