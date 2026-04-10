import { pool } from '@/config/database';
import { logger } from '@/utils/logger';
import { v4 as uuid } from 'uuid';

export interface CreateCampaignOptions {
  name: string;
  description?: string;
  goalAmountCents: number;
  campaignType: 'general' | 'emergency' | 'specific_project' | 'recurring';
  startDate?: Date;
  endDate?: Date;
  targetDonors?: number;
  impactStatement?: string;
  createdBy: string;
}

export interface CampaignStats {
  id: string;
  name: string;
  status: string;
  goalAmount: number;
  raisedAmount: number;
  progressPercentage: number;
  donorCount: number;
  averageDonation: number;
  daysRemaining: number;
}

export interface DonationWithCampaign {
  id: string;
  donorId: string;
  amountCents: number;
  campaignId?: string;
  campaignName?: string;
  donationSource: string;
  donorNameAtTime: string;
  status: string;
  createdAt: string;
  impactMessage?: string;
}

/**
 * Donation Management Service
 * Handles campaign management, donation tracking, and reporting
 */
export class DonationManagementService {
  /**
   * Create a new donation campaign
   */
  async createCampaign(options: CreateCampaignOptions): Promise<string> {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `INSERT INTO donation_campaigns
         (name, description, goal_amount_cents, campaign_type, start_date, end_date,
          target_donors, impact_statement, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id`,
        [
          options.name,
          options.description || null,
          options.goalAmountCents,
          options.campaignType,
          options.startDate || null,
          options.endDate || null,
          options.targetDonors || null,
          options.impactStatement || null,
          options.createdBy,
        ]
      );

      if (!result.rows[0]) {
        throw new Error('Failed to create campaign');
      }
      const campaignId = result.rows[0].id;
      logger.info(`✓ Created campaign: ${options.name} (${campaignId})`);
      return campaignId;
    } finally {
      client.release();
    }
  }

  /**
   * Get campaign stats
   */
  async getCampaignStats(campaignId: string): Promise<CampaignStats> {
    try {
      const result = await pool.query(
        `SELECT
          c.id,
          c.name,
          c.status,
          c.goal_amount_cents,
          COALESCE(c.current_amount_cents, 0) as raised_amount,
          COALESCE(c.current_donor_count, 0) as donor_count,
          COALESCE(AVG(d.amount_cents), 0) as average_donation,
          EXTRACT(DAY FROM (c.end_date - NOW())) as days_remaining
        FROM donation_campaigns c
        LEFT JOIN donations d ON c.id = d.campaign_id AND d.status = 'completed'
        WHERE c.id = $1
        GROUP BY c.id, c.name, c.status, c.goal_amount_cents, c.current_amount_cents, c.current_donor_count, c.end_date`,
        [campaignId]
      );

      if (result.rows.length === 0) {
        throw new Error('Campaign not found');
      }

      const row = result.rows[0];
      const raisedAmount = parseInt(row.raised_amount, 10);
      const goalAmount = parseInt(row.goal_amount_cents, 10);

      return {
        id: row.id,
        name: row.name,
        status: row.status,
        goalAmount,
        raisedAmount,
        progressPercentage: goalAmount > 0 ? Math.round((raisedAmount / goalAmount) * 100) : 0,
        donorCount: parseInt(row.donor_count, 10),
        averageDonation: Math.round(parseFloat(row.average_donation)),
        daysRemaining: Math.max(0, Math.floor(row.days_remaining || 0)),
      };
    } catch (error: any) {
      logger.error('Get campaign stats error:', error.message);
      throw new Error(`Failed to get campaign stats: ${error.message}`);
    }
  }

  /**
   * List all campaigns
   */
  async listCampaigns(status?: string): Promise<CampaignStats[]> {
    try {
      let query = `
        SELECT
          c.id,
          c.name,
          c.status,
          c.goal_amount_cents,
          COALESCE(c.current_amount_cents, 0) as raised_amount,
          COALESCE(c.current_donor_count, 0) as donor_count,
          COALESCE(AVG(d.amount_cents), 0) as average_donation,
          EXTRACT(DAY FROM (c.end_date - NOW())) as days_remaining
        FROM donation_campaigns c
        LEFT JOIN donations d ON c.id = d.campaign_id AND d.status = 'completed'
      `;

      const params: any[] = [];

      if (status) {
        query += ` WHERE c.status = $1`;
        params.push(status);
      }

      query += ` GROUP BY c.id, c.name, c.status, c.goal_amount_cents, c.current_amount_cents, c.current_donor_count, c.end_date
                 ORDER BY c.created_at DESC`;

      const result = await pool.query(query, params);

      return result.rows.map((row) => ({
        id: row.id,
        name: row.name,
        status: row.status,
        goalAmount: parseInt(row.goal_amount_cents, 10),
        raisedAmount: parseInt(row.raised_amount, 10),
        progressPercentage:
          parseInt(row.goal_amount_cents, 10) > 0
            ? Math.round((parseInt(row.raised_amount, 10) / parseInt(row.goal_amount_cents, 10)) * 100)
            : 0,
        donorCount: parseInt(row.donor_count, 10),
        averageDonation: Math.round(parseFloat(row.average_donation)),
        daysRemaining: Math.max(0, Math.floor(row.days_remaining || 0)),
      }));
    } catch (error: any) {
      logger.error('List campaigns error:', error.message);
      throw new Error(`Failed to list campaigns: ${error.message}`);
    }
  }

  /**
   * Get donations for a campaign
   */
  async getCampaignDonations(campaignId: string): Promise<DonationWithCampaign[]> {
    try {
      const result = await pool.query(
        `SELECT
          d.id,
          d.donor_id,
          d.amount_cents,
          d.campaign_id,
          c.name as campaign_name,
          d.donation_source,
          d.donor_name_at_time,
          d.status,
          d.created_at,
          d.impact_message
        FROM donations d
        LEFT JOIN donation_campaigns c ON d.campaign_id = c.id
        WHERE d.campaign_id = $1
        ORDER BY d.created_at DESC`,
        [campaignId]
      );

      return result.rows.map((row) => ({
        id: row.id,
        donorId: row.donor_id,
        amountCents: parseInt(row.amount_cents, 10),
        campaignId: row.campaign_id,
        campaignName: row.campaign_name,
        donationSource: row.donation_source,
        donorNameAtTime: row.donor_name_at_time,
        status: row.status,
        createdAt: new Date(row.created_at).toISOString(),
        impactMessage: row.impact_message,
      }));
    } catch (error: any) {
      logger.error('Get campaign donations error:', error.message);
      throw new Error(`Failed to get campaign donations: ${error.message}`);
    }
  }

  /**
   * Add donation to campaign
   */
  async addDonationToCampaign(
    donationId: string,
    campaignId: string
  ): Promise<void> {
    try {
      await pool.query(
        `UPDATE donations SET campaign_id = $1 WHERE id = $2`,
        [campaignId, donationId]
      );

      logger.info(`✓ Linked donation ${donationId} to campaign ${campaignId}`);
    } catch (error: any) {
      logger.error('Add donation to campaign error:', error.message);
      throw new Error(`Failed to add donation to campaign: ${error.message}`);
    }
  }

  /**
   * Create campaign milestone
   */
  async createMilestone(
    campaignId: string,
    milestoneNumber: number,
    targetAmountCents: number,
    description?: string,
    rewardDescription?: string
  ): Promise<string> {
    try {
      const result = await pool.query(
        `INSERT INTO campaign_milestones
         (campaign_id, milestone_number, target_amount_cents, description, reward_description)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [campaignId, milestoneNumber, targetAmountCents, description || null, rewardDescription || null]
      );

      if (!result.rows[0]) {
        throw new Error('Failed to create milestone');
      }
      logger.info(`✓ Created milestone for campaign ${campaignId}`);
      return result.rows[0].id;
    } catch (error: any) {
      logger.error('Create milestone error:', error.message);
      throw new Error(`Failed to create milestone: ${error.message}`);
    }
  }

  /**
   * Get donor preferences
   */
  async getDonorPreferences(donorId: string): Promise<any> {
    try {
      const result = await pool.query(
        `SELECT * FROM donor_preferences WHERE donor_id = $1`,
        [donorId]
      );

      if (result.rows.length === 0) {
        // Create default preferences
        await pool.query(
          `INSERT INTO donor_preferences (donor_id) VALUES ($1)`,
          [donorId]
        );
        return {
          donorId,
          communicationFrequency: 'monthly',
          prefersEmail: true,
          prefersPhone: false,
          prefersSms: false,
          anonymousDonation: false,
          receiveImpactReports: true,
          receiveNewsletters: true,
          receiveEventInvitations: true,
          marketingConsent: true,
        };
      }

      return result.rows[0];
    } catch (error: any) {
      logger.error('Get donor preferences error:', error.message);
      throw new Error(`Failed to get donor preferences: ${error.message}`);
    }
  }

  /**
   * Update donor preferences
   */
  async updateDonorPreferences(donorId: string, preferences: any): Promise<void> {
    try {
      await pool.query(
        `UPDATE donor_preferences
         SET communication_frequency = $1,
             prefers_email = $2,
             prefers_phone = $3,
             prefers_sms = $4,
             anonymous_donation = $5,
             receive_impact_reports = $6,
             receive_newsletters = $7,
             receive_event_invitations = $8,
             marketing_consent = $9
         WHERE donor_id = $10`,
        [
          preferences.communicationFrequency || 'monthly',
          preferences.prefersEmail !== false,
          preferences.prefersPhone || false,
          preferences.prefersSms || false,
          preferences.anonymousDonation || false,
          preferences.receiveImpactReports !== false,
          preferences.receiveNewsletters !== false,
          preferences.receiveEventInvitations !== false,
          preferences.marketingConsent !== false,
          donorId,
        ]
      );

      logger.info(`✓ Updated preferences for donor ${donorId}`);
    } catch (error: any) {
      logger.error('Update donor preferences error:', error.message);
      throw new Error(`Failed to update donor preferences: ${error.message}`);
    }
  }

  /**
   * Add donor note
   */
  async addDonorNote(
    donorId: string,
    content: string,
    createdBy: string,
    noteType: string = 'internal',
    followUpDate?: Date
  ): Promise<string> {
    try {
      const result = await pool.query(
        `INSERT INTO donor_notes (donor_id, note_type, content, created_by, follow_up_date)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id`,
        [donorId, noteType, content, createdBy, followUpDate || null]
      );

      if (!result.rows[0]) {
        throw new Error('Failed to create donor note');
      }
      logger.info(`✓ Added note for donor ${donorId}`);
      return result.rows[0].id;
    } catch (error: any) {
      logger.error('Add donor note error:', error.message);
      throw new Error(`Failed to add donor note: ${error.message}`);
    }
  }

  /**
   * Get donor notes
   */
  async getDonorNotes(donorId: string): Promise<any[]> {
    try {
      const result = await pool.query(
        `SELECT * FROM donor_notes WHERE donor_id = $1 ORDER BY created_at DESC`,
        [donorId]
      );

      return result.rows;
    } catch (error: any) {
      logger.error('Get donor notes error:', error.message);
      throw new Error(`Failed to get donor notes: ${error.message}`);
    }
  }

  /**
   * Generate batch report
   */
  async generateBatchReport(
    reportType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual',
    periodStart: Date,
    periodEnd: Date,
    generatedBy: string
  ): Promise<string> {
    try {
      // Get donation stats for period
      const statsResult = await pool.query(
        `SELECT
          COUNT(DISTINCT id) as total_donations,
          SUM(amount_cents) as total_amount,
          COUNT(DISTINCT donor_id) as donor_count,
          AVG(amount_cents) as average_donation,
          MAX(amount_cents) as largest_donation,
          COUNT(DISTINCT CASE WHEN donation_source = 'recurring' THEN donor_id END) as recurring_donors
        FROM donations
        WHERE status = 'completed' AND created_at BETWEEN $1 AND $2`,
        [periodStart, periodEnd]
      );

      if (!statsResult.rows[0]) {
        throw new Error('Failed to fetch donation statistics');
      }
      const stats = statsResult.rows[0];

      // Get new donors count
      const newDonorsResult = await pool.query(
        `SELECT COUNT(DISTINCT d.donor_id) as new_donors
         FROM donations d
         WHERE d.status = 'completed' AND d.created_at BETWEEN $1 AND $2
         AND d.donor_id NOT IN (
           SELECT donor_id FROM donations WHERE created_at < $1
         )`,
        [periodStart, periodEnd]
      );

      if (!newDonorsResult.rows[0]) {
        throw new Error('Failed to fetch new donors count');
      }
      const newDonors = newDonorsResult.rows[0].new_donors;

      // Insert report
      const reportResult = await pool.query(
        `INSERT INTO batch_reports
         (report_type, period_start, period_end, total_donations, total_amount_cents,
          donor_count, new_donors, recurring_donors, average_donation_cents,
          largest_donation_cents, generated_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
         RETURNING id`,
        [
          reportType,
          periodStart,
          periodEnd,
          stats.total_donations || 0,
          stats.total_amount || 0,
          stats.donor_count || 0,
          newDonors || 0,
          stats.recurring_donors || 0,
          Math.round(parseFloat(stats.average_donation) || 0),
          stats.largest_donation || 0,
          generatedBy,
        ]
      );

      if (!reportResult.rows[0]) {
        throw new Error('Failed to create batch report');
      }
      logger.info(`✓ Generated ${reportType} batch report`);
      return reportResult.rows[0].id;
    } catch (error: any) {
      logger.error('Generate batch report error:', error.message);
      throw new Error(`Failed to generate batch report: ${error.message}`);
    }
  }

  /**
   * Get batch report
   */
  async getBatchReport(reportId: string): Promise<any> {
    try {
      const result = await pool.query(
        `SELECT * FROM batch_reports WHERE id = $1`,
        [reportId]
      );

      if (result.rows.length === 0) {
        throw new Error('Report not found');
      }

      return result.rows[0];
    } catch (error: any) {
      logger.error('Get batch report error:', error.message);
      throw new Error(`Failed to get batch report: ${error.message}`);
    }
  }
}

// Singleton instance
let donationService: DonationManagementService | null = null;

export function getDonationManagementService(): DonationManagementService {
  if (!donationService) {
    donationService = new DonationManagementService();
  }
  return donationService;
}
