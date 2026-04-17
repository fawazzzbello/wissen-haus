import { Request, Response } from 'express';
import { pool } from '@/config/database';
import { logger } from '@/utils/logger';

export type SectionType =
  | 'hero-premium'
  | 'stats-advanced'
  | 'programs-grid'
  | 'features-list'
  | 'team'
  | 'testimonials-advanced'
  | 'newsletter'
  | 'faq-accordion'
  | 'partners'
  | 'events'
  | 'donation-tiers'
  | 'timeline'
  | 'two-column-advanced'
  | 'cta-banner'
  | 'custom';

export interface HomepageSection {
  id: string;
  sectionName: string;
  sectionType: SectionType;
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
    const result = await pool.query(
      `SELECT * FROM homepage_sections WHERE is_active = true ORDER BY display_order ASC`
    );
    const sections = result.rows.map(mapRowToSection);
    res.json({ sections });
  } catch (error: any) {
    // If table doesn't exist (42P01), return empty sections
    if (error.code === '42P01') {
      logger.warn('Homepage sections table not yet created');
      return res.json({ sections: [] });
    }
    logger.error('Get homepage sections error:', error);
    res.status(500).json({ error: 'Failed to fetch homepage sections' });
  }
}

// Get specific section
export async function getHomepageSection(req: Request, res: Response) {
  try {
    const { sectionName } = req.params;
    const result = await pool.query(
      `SELECT * FROM homepage_sections WHERE section_name = $1`,
      [sectionName]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Section not found' });
    }
    const section = mapRowToSection(result.rows[0]);
    res.json({ section });
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
    const { sectionType, title, subtitle, description, htmlContent, imageUrl, backgroundColor, textColor, buttonText, buttonUrl, displayOrder } = req.body;

    // Check if section exists
    const check = await pool.query(
      `SELECT id FROM homepage_sections WHERE section_name = $1`,
      [sectionName]
    );

    if (check.rows.length === 0) {
      // Create new section
      await pool.query(
        `INSERT INTO homepage_sections
         (section_name, section_type, title, subtitle, description, html_content, image_url, background_color, text_color, button_text, button_url, display_order, is_active, updated_by, updated_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, true, $13, NOW())`,
        [sectionName, sectionType || 'custom', title, subtitle, description, htmlContent, imageUrl, backgroundColor, textColor, buttonText, buttonUrl, displayOrder || 1, req.user.userId]
      );
    } else {
      // Update existing section
      await pool.query(
        `UPDATE homepage_sections
         SET section_type = $1, title = $2, subtitle = $3, description = $4, html_content = $5, image_url = $6,
             background_color = $7, text_color = $8, button_text = $9, button_url = $10,
             display_order = $11, updated_by = $12, updated_at = NOW()
         WHERE section_name = $13`,
        [sectionType || 'custom', title, subtitle, description, htmlContent, imageUrl, backgroundColor, textColor, buttonText, buttonUrl, displayOrder || 1, req.user.userId, sectionName]
      );
    }

    const result = await pool.query(
      `SELECT * FROM homepage_sections WHERE section_name = $1`,
      [sectionName]
    );

    const section = mapRowToSection(result.rows[0]);
    res.json({ section, message: 'Section updated successfully' });
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

    for (const section of sections) {
      await pool.query(
        `UPDATE homepage_sections SET display_order = $1, updated_by = $2, updated_at = NOW() WHERE section_name = $3`,
        [section.displayOrder, req.user.userId, section.sectionName]
      );
    }

    const result = await pool.query(
      `SELECT * FROM homepage_sections ORDER BY display_order ASC`
    );

    const reorderedSections = result.rows.map(mapRowToSection);
    res.json({ sections: reorderedSections, message: 'Sections reordered successfully' });
  } catch (error: any) {
    logger.error('Reorder sections error:', error);
    res.status(500).json({ error: 'Failed to reorder sections' });
  }
}

function mapRowToSection(row: any): HomepageSection {
  return {
    id: row.id,
    sectionName: row.section_name,
    sectionType: row.section_type as SectionType,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    htmlContent: row.html_content,
    imageUrl: row.image_url,
    backgroundColor: row.background_color,
    textColor: row.text_color,
    buttonText: row.button_text,
    buttonUrl: row.button_url,
    isActive: row.is_active,
    displayOrder: row.display_order,
    updatedAt: row.updated_at,
    updatedBy: row.updated_by,
  };
}
