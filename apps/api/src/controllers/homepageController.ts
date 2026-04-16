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

// Initialize default homepage sections if they don't exist
async function ensureHomepageSectionsExist() {
  try {
    const client = await pool.connect();
    try {
      // First, ensure the table exists
      await client.query(`
        CREATE TABLE IF NOT EXISTS homepage_sections (
          id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
          section_name VARCHAR(100) NOT NULL UNIQUE,
          section_type VARCHAR(50) NOT NULL DEFAULT 'body',
          title VARCHAR(255),
          subtitle VARCHAR(255),
          description TEXT,
          html_content TEXT,
          image_url VARCHAR(500),
          background_color VARCHAR(7),
          text_color VARCHAR(7),
          button_text VARCHAR(100),
          button_url VARCHAR(500),
          is_active BOOLEAN DEFAULT true,
          display_order INTEGER DEFAULT 1,
          updated_by UUID REFERENCES users(id) ON DELETE SET NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          CONSTRAINT valid_section_type CHECK (section_type IN ('hero', 'header', 'body', 'footer', 'cta', 'stats', 'programs', 'testimonials', 'custom'))
        )
      `);

      // Create indexes
      await client.query(`CREATE INDEX IF NOT EXISTS idx_homepage_sections_name ON homepage_sections(section_name)`);
      await client.query(`CREATE INDEX IF NOT EXISTS idx_homepage_sections_active_order ON homepage_sections(is_active, display_order)`);

      // Insert default sections
      const defaultSections = [
        { name: 'hero', type: 'hero', title: 'Empowering Future Leaders', subtitle: 'Educational opportunities for underprivileged youth', description: 'Wissen-Haus provides comprehensive educational support and mentorship to help young people reach their full potential.', order: 1 },
        { name: 'header', type: 'header', title: 'Our Mission', subtitle: 'Education is the key to breaking the cycle of poverty', description: 'We believe that every child deserves access to quality education regardless of their socioeconomic background.', order: 2 },
        { name: 'about', type: 'body', title: 'About Wissen-Haus', subtitle: 'Building Futures Through Education', description: 'Founded with a vision to democratize education, Wissen-Haus has been transforming lives through personalized learning and mentorship programs. Our impact spans across multiple communities, reaching hundreds of students annually.', order: 3 },
        { name: 'impact', type: 'body', title: 'Our Impact', subtitle: 'Making a Difference', description: 'Since our inception, we have helped thousands of students achieve their educational goals. Through dedicated mentors and comprehensive programs, we are building a brighter future.', order: 4 },
        { name: 'cta', type: 'cta', title: 'Join Our Mission', subtitle: 'Help us empower the next generation', description: 'Your contribution can transform a young person\'s life. Together, we can create lasting change.', order: 5 },
        { name: 'footer', type: 'footer', title: 'Contact & Connect', subtitle: 'Get in touch with us', description: 'Reach out to learn more about our programs or to volunteer with Wissen-Haus.', order: 6 },
      ];

      for (const section of defaultSections) {
        await client.query(
          `INSERT INTO homepage_sections (section_name, section_type, title, subtitle, description, is_active, display_order)
           VALUES ($1, $2, $3, $4, $5, true, $6)
           ON CONFLICT (section_name) DO NOTHING`,
          [section.name, section.type, section.title, section.subtitle, section.description, section.order]
        );
      }

      logger.info('✓ Homepage sections table created and populated');
    } finally {
      client.release();
    }
  } catch (error: any) {
    logger.warn('⚠ Could not ensure homepage sections:', error.message?.substring(0, 150));
  }
}

// Get all homepage sections
export async function getHomepageSections(req: Request, res: Response) {
  try {
    // Ensure sections exist before fetching
    await ensureHomepageSectionsExist();

    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM homepage_sections WHERE is_active = true ORDER BY display_order ASC`
      );
      const sections = result.rows.map(mapRowToSection);
      res.json({ sections });
    } finally {
      client.release();
    }
  } catch (error: any) {
    // If table doesn't exist (42P01), return empty sections - it will be created on next migration
    if (error.code === '42P01') {
      logger.warn('Homepage sections table not yet created - returning empty');
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
    const client = await pool.connect();
    try {
      const result = await client.query(
        `SELECT * FROM homepage_sections WHERE section_name = $1`,
        [sectionName]
      );
      if (result.rows.length === 0) {
        return res.status(404).json({ error: 'Section not found' });
      }
      const section = mapRowToSection(result.rows[0]);
      res.json({ section });
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

      const section = mapRowToSection(result.rows[0]);
      res.json({ section, message: 'Section updated successfully' });
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

      const reorderedSections = result.rows.map(mapRowToSection);
      res.json({ sections: reorderedSections, message: 'Sections reordered successfully' });
    } finally {
      client.release();
    }
  } catch (error: any) {
    logger.error('Reorder sections error:', error);
    res.status(500).json({ error: 'Failed to reorder sections' });
  }
}

function mapRowToSection(row: any): HomepageSection {
  return {
    id: row.id,
    sectionName: row.section_name,
    sectionType: row.section_type,
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
