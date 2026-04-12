import { Request, Response } from 'express';
import { pool } from '@/config/database';
import { logger } from '@/utils/logger';

export interface HomepageSection {
  id: string;
  sectionName: string;
  sectionType: 'hero' | 'header' | 'body' | 'footer' | 'cta';
  title?: string;
  subtitle?: string;
  description?: string;
  htmlContent?: string;
  imageUrl?: string;
  backgroundColor?: string;
  textColor?: string;
  buttonText?: string;
  buttonUrl?: string;
  isActive: boolean;
  displayOrder: number;
  updatedAt: Date;
  updatedBy?: string;
}

// Get all homepage sections
export async function getHomepageSections(req: Request, res: Response) {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM homepage_sections WHERE is_active = true ORDER BY display_order ASC`
      );
      res.json({ sections: result.rows });
    } finally {
      client.release();
    }
  } catch (error: any) {
    logger.error('Get homepage sections error:', error);
    res.status(500).json({ error: 'Failed to fetch homepage sections' });
  }
}

// Get specific section
export async function getHomepageSection(req: Request, res: Response) {
  try {
    const { sectionName } = req.params;
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM homepage_sections WHERE section_name = $1`,
        [sectionName]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Section not found' });
      }
      res.json({ section: result.rows[0] });
    } finally {
      client.release();
    }
  } catch (error: any) {
    logger.error('Get section error:', error);
    res.status(500).json({ error: 'Failed to fetch section' });
  }
}

// Update homepage section (admin)
export async function updateHomepageSection(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { sectionName } = req.params;
    const { title, subtitle, description, htmlContent, imageUrl, backgroundColor, textColor, buttonText, buttonUrl, displayOrder } = req.body;

    const client = await pool.connect();
    try {
      // Check if section exists, if not create it
      const check = await client.query(
        `SELECT id FROM homepage_sections WHERE section_name = $1`,
        [sectionName]
      );

      if (check.rows.length === 0) {
        // Create new section
        await client.query(
          `INSERT INTO homepage_sections
           (section_name, title, subtitle, description, html_content, image_url, background_color, text_color, button_text, button_url, display_order, is_active, updated_by, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, true, $12, NOW())`,
          [sectionName, title, subtitle, description, htmlContent, imageUrl, backgroundColor, textColor, buttonText, buttonUrl, displayOrder || 1, req.user.userId]
        );
      } else {
        // Update existing section
        await client.query(
          `UPDATE homepage_sections
           SET title = $1, subtitle = $2, description = $3, html_content = $4, image_url = $5,
               background_color = $6, text_color = $7, button_text = $8, button_url = $9,
               display_order = $10, updated_by = $11, updated_at = NOW()
           WHERE section_name = $12`,
          [title, subtitle, description, htmlContent, imageUrl, backgroundColor, textColor, buttonText, buttonUrl, displayOrder || 1, req.user.userId, sectionName]
        );
      }

      const result = await client.query(
        `SELECT * FROM homepage_sections WHERE section_name = $1`,
        [sectionName]
      );

      res.json({ section: result.rows[0], message: 'Section updated successfully' });
    } finally {
      client.release();
    }
  } catch (error: any) {
    logger.error('Update section error:', error);
    res.status(500).json({ error: 'Failed to update section' });
  }
}

// Reorder sections (admin)
export async function reorderHomepageSections(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { sections } = req.body; // Array of { sectionName, displayOrder }

    const client = await pool.connect();
    try {
      for (const section of sections) {
        await client.query(
          `UPDATE homepage_sections SET display_order = $1, updated_by = $2, updated_at = NOW() WHERE section_name = $3`,
          [section.displayOrder, req.user.userId, section.sectionName]
        );
      }

      const result = await client.query(
        `SELECT * FROM homepage_sections ORDER BY display_order ASC`
      );

      res.json({ sections: result.rows, message: 'Sections reordered successfully' });
    } finally {
      client.release();
    }
  } catch (error: any) {
    logger.error('Reorder sections error:', error);
    res.status(500).json({ error: 'Failed to reorder sections' });
  }
}
