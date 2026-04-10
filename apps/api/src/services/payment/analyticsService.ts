import { pool } from '@/config/database';
import { logger } from '@/utils/logger';

export interface DonationMetrics {
  totalDonations: number;
  totalAmount: number;
  averageDonation: number;
  largestDonation: number;
  smallestDonation: number;
  donorCount: number;
  recurringDonorCount: number;
}

export interface DonationTrend {
  period: string;
  amount: number;
  count: number;
  averageDonation: number;
}

export interface DonorSegment {
  segment: string;
  count: number;
  totalDonated: number;
  averageDonation: number;
  retentionRate: number;
}

export interface LifetimeValue {
  donorId: string;
  donorEmail: string;
  totalDonated: number;
  donationCount: number;
  averageDonation: number;
  firstDonation: string;
  lastDonation: string;
  monthsSinceFirst: number;
  monthlyAverage: number;
  churnRisk: 'low' | 'medium' | 'high';
}

/**
 * Payment Analytics Service
 * Provides insights into donation patterns and donor behavior
 */
export class PaymentAnalyticsService {
  /**
   * Get overall donation metrics
   */
  async getDonationMetrics(
    startDate?: Date,
    endDate?: Date
  ): Promise<DonationMetrics> {
    try {
      let query = `
        SELECT
          COUNT(DISTINCT id) as total_donations,
          SUM(amount_cents) as total_amount,
          AVG(amount_cents) as average_donation,
          MAX(amount_cents) as largest_donation,
          MIN(amount_cents) as smallest_donation,
          COUNT(DISTINCT donor_id) as donor_count
        FROM donations
        WHERE status = 'completed'
      `;

      const params: any[] = [];

      if (startDate) {
        query += ` AND created_at >= $${params.length + 1}`;
        params.push(startDate);
      }

      if (endDate) {
        query += ` AND created_at <= $${params.length + 1}`;
        params.push(endDate);
      }

      const result = await pool.query(query, params);
      const row = result.rows[0];

      // Get recurring donor count
      const recurringResult = await pool.query(
        `SELECT COUNT(DISTINCT donor_id) as count FROM donations WHERE is_recurring = TRUE AND status = 'completed'`
      );

      return {
        totalDonations: parseInt(row.total_donations, 10),
        totalAmount: parseInt(row.total_amount, 10),
        averageDonation: Math.round(parseFloat(row.average_donation)),
        largestDonation: parseInt(row.largest_donation, 10),
        smallestDonation: parseInt(row.smallest_donation, 10),
        donorCount: parseInt(row.donor_count, 10),
        recurringDonorCount: parseInt(recurringResult.rows[0].count, 10),
      };
    } catch (error: any) {
      logger.error('Get donation metrics error:', error.message);
      throw new Error(`Failed to get donation metrics: ${error.message}`);
    }
  }

  /**
   * Get donation trends over time (monthly)
   */
  async getDonationTrends(months: number = 12): Promise<DonationTrend[]> {
    try {
      const query = `
        SELECT
          TO_CHAR(created_at, 'YYYY-MM') as period,
          SUM(amount_cents) as amount,
          COUNT(id) as count,
          AVG(amount_cents) as average_donation
        FROM donations
        WHERE status = 'completed'
          AND created_at >= NOW() - INTERVAL '1 month' * $1
        GROUP BY TO_CHAR(created_at, 'YYYY-MM')
        ORDER BY period DESC
      `;

      const result = await pool.query(query, [months]);

      return result.rows.map((row) => ({
        period: row.period,
        amount: parseInt(row.amount, 10),
        count: parseInt(row.count, 10),
        averageDonation: Math.round(parseFloat(row.average_donation)),
      }));
    } catch (error: any) {
      logger.error('Get donation trends error:', error.message);
      throw new Error(`Failed to get donation trends: ${error.message}`);
    }
  }

  /**
   * Get donor segmentation by donation amount
   */
  async getDonorSegments(): Promise<DonorSegment[]> {
    try {
      const query = `
        WITH donor_stats AS (
          SELECT
            donor_id,
            SUM(amount_cents) as total_donated,
            COUNT(id) as donation_count,
            AVG(amount_cents) as average_donation
          FROM donations
          WHERE status = 'completed'
          GROUP BY donor_id
        ),
        segments AS (
          SELECT
            CASE
              WHEN total_donated >= 100000 THEN 'Major Donor (>$1000)'
              WHEN total_donated >= 50000 THEN 'Sustaining Donor ($500-$1000)'
              WHEN total_donated >= 10000 THEN 'Regular Donor ($100-$500)'
              ELSE 'Emerging Donor (<$100)'
            END as segment,
            COUNT(*) as count,
            SUM(total_donated) as total_amount,
            AVG(average_donation) as avg_donation
          FROM donor_stats
          GROUP BY segment
        )
        SELECT
          segment,
          count,
          total_amount,
          ROUND(avg_donation) as avg_donation,
          ROUND(count::numeric / (SELECT COUNT(*) FROM donor_stats) * 100)::numeric as retention_rate
        FROM segments
        ORDER BY total_amount DESC
      `;

      const result = await pool.query(query);

      return result.rows.map((row) => ({
        segment: row.segment,
        count: parseInt(row.count, 10),
        totalDonated: parseInt(row.total_amount, 10),
        averageDonation: parseInt(row.avg_donation, 10),
        retentionRate: parseFloat(row.retention_rate),
      }));
    } catch (error: any) {
      logger.error('Get donor segments error:', error.message);
      throw new Error(`Failed to get donor segments: ${error.message}`);
    }
  }

  /**
   * Get lifetime value for top donors
   */
  async getTopDonorLifetimeValues(limit: number = 20): Promise<LifetimeValue[]> {
    try {
      const query = `
        SELECT
          d.id as donor_id,
          d.email as donor_email,
          SUM(don.amount_cents) as total_donated,
          COUNT(don.id) as donation_count,
          AVG(don.amount_cents) as average_donation,
          MIN(don.created_at) as first_donation,
          MAX(don.created_at) as last_donation,
          EXTRACT(EPOCH FROM (MAX(don.created_at) - MIN(don.created_at))) / 86400 / 30.44 as months_since_first
        FROM donors d
        LEFT JOIN donations don ON d.id = don.donor_id AND don.status = 'completed'
        GROUP BY d.id, d.email
        HAVING COUNT(don.id) > 0
        ORDER BY total_donated DESC
        LIMIT $1
      `;

      const result = await pool.query(query, [limit]);

      return result.rows.map((row) => {
        const monthsSinceFirst = Math.max(1, Math.round(row.months_since_first));
        const monthlyAverage = Math.round(parseInt(row.total_donated, 10) / monthsSinceFirst);
        const daysSinceLastDonation = Math.round(
          (Date.now() - new Date(row.last_donation).getTime()) / (1000 * 60 * 60 * 24)
        );

        let churnRisk: 'low' | 'medium' | 'high' = 'low';
        if (daysSinceLastDonation > 180) {
          churnRisk = 'high';
        } else if (daysSinceLastDonation > 90) {
          churnRisk = 'medium';
        }

        return {
          donorId: row.donor_id,
          donorEmail: row.donor_email,
          totalDonated: parseInt(row.total_donated, 10),
          donationCount: parseInt(row.donation_count, 10),
          averageDonation: Math.round(parseFloat(row.average_donation)),
          firstDonation: new Date(row.first_donation).toISOString(),
          lastDonation: new Date(row.last_donation).toISOString(),
          monthsSinceFirst,
          monthlyAverage,
          churnRisk,
        };
      });
    } catch (error: any) {
      logger.error('Get lifetime values error:', error.message);
      throw new Error(`Failed to get lifetime values: ${error.message}`);
    }
  }

  /**
   * Get churn risk donors (inactive for >90 days)
   */
  async getChurnRiskDonors(): Promise<LifetimeValue[]> {
    try {
      const query = `
        SELECT
          d.id as donor_id,
          d.email as donor_email,
          SUM(don.amount_cents) as total_donated,
          COUNT(don.id) as donation_count,
          AVG(don.amount_cents) as average_donation,
          MIN(don.created_at) as first_donation,
          MAX(don.created_at) as last_donation,
          EXTRACT(EPOCH FROM (MAX(don.created_at) - MIN(don.created_at))) / 86400 / 30.44 as months_since_first
        FROM donors d
        LEFT JOIN donations don ON d.id = don.donor_id AND don.status = 'completed'
        WHERE MAX(don.created_at) < NOW() - INTERVAL '90 days'
        GROUP BY d.id, d.email
        HAVING COUNT(don.id) > 0
        ORDER BY total_donated DESC
      `;

      const result = await pool.query(query);

      return result.rows.map((row) => {
        const monthsSinceFirst = Math.max(1, Math.round(row.months_since_first));
        return {
          donorId: row.donor_id,
          donorEmail: row.donor_email,
          totalDonated: parseInt(row.total_donated, 10),
          donationCount: parseInt(row.donation_count, 10),
          averageDonation: Math.round(parseFloat(row.average_donation)),
          firstDonation: new Date(row.first_donation).toISOString(),
          lastDonation: new Date(row.last_donation).toISOString(),
          monthsSinceFirst,
          monthlyAverage: Math.round(parseInt(row.total_donated, 10) / monthsSinceFirst),
          churnRisk: 'high' as const,
        };
      });
    } catch (error: any) {
      logger.error('Get churn risk donors error:', error.message);
      throw new Error(`Failed to get churn risk donors: ${error.message}`);
    }
  }

  /**
   * Get revenue forecast (simple linear projection)
   */
  async getRevenueForecast(months: number = 6): Promise<DonationTrend[]> {
    try {
      // Get historical trends
      const historicalTrends = await this.getDonationTrends(12);

      // Calculate average monthly amount
      const avgMonthlyAmount =
        historicalTrends.reduce((sum, t) => sum + t.amount, 0) / historicalTrends.length;

      // Generate forecast
      const forecast: DonationTrend[] = [];
      const now = new Date();

      for (let i = 1; i <= months; i++) {
        const forecastDate = new Date(now);
        forecastDate.setMonth(forecastDate.getMonth() + i);

        forecast.push({
          period: forecastDate.toISOString().substring(0, 7),
          amount: Math.round(avgMonthlyAmount),
          count: 0,
          averageDonation: 0,
        });
      }

      return forecast;
    } catch (error: any) {
      logger.error('Get revenue forecast error:', error.message);
      throw new Error(`Failed to get revenue forecast: ${error.message}`);
    }
  }
}

// Singleton instance
let analyticsService: PaymentAnalyticsService | null = null;

export function getPaymentAnalyticsService(): PaymentAnalyticsService {
  if (!analyticsService) {
    analyticsService = new PaymentAnalyticsService();
  }
  return analyticsService;
}
