import { v4 as uuidv4 } from 'uuid';
import { query } from '@/config/database';
import { logger } from '@/utils/logger';

export interface ContentPage {
  id: string;
  slug: string;
  title: string;
  contentHtml: string;
  metaDescription?: string;
  metaKeywords?: string;
  isPublished: boolean;
  createdBy?: string;
  updatedBy?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Get all pages
export async function getContentPages(published?: boolean) {
  try {
    let q = 'SELECT * FROM content_pages';
    const params: any[] = [];

    if (published !== undefined) {
      q += ' WHERE is_published = $1';
      params.push(published);
    }

    q += ' ORDER BY created_at DESC';
    const result = await query(q, params);
    return result.rows.map(mapRowToPage);
  } catch (error) {
    logger.error('Get content pages error:', error);
    throw error;
  }
}

// Get page by slug
export async function getPageBySlug(slug: string, publishedOnly: boolean = true): Promise<ContentPage | null> {
  try {
    let q = 'SELECT * FROM content_pages WHERE slug = $1';
    const params: any[] = [slug];

    if (publishedOnly) {
      q += ' AND is_published = true';
    }

    const result = await query(q, params);
    return result.rows.length > 0 ? mapRowToPage(result.rows[0]) : null;
  } catch (error) {
    logger.error('Get page by slug error:', error);
    throw error;
  }
}

// Get page by ID
export async function getPageById(pageId: string): Promise<ContentPage | null> {
  try {
    const result = await query('SELECT * FROM content_pages WHERE id = $1', [pageId]);
    return result.rows.length > 0 ? mapRowToPage(result.rows[0]) : null;
  } catch (error) {
    logger.error('Get page by ID error:', error);
    throw error;
  }
}

// Create page
export async function createPage(
  slug: string,
  title: string,
  contentHtml: string,
  metaDescription: string,
  metaKeywords: string,
  createdBy: string,
  isPublished: boolean = false
): Promise<ContentPage> {
  try {
    // Check if slug exists
    const existing = await query('SELECT id FROM content_pages WHERE slug = $1', [slug]);
    if (existing.rows.length > 0) {
      throw new Error('Page with this slug already exists');
    }

    const pageId = uuidv4();
    const result = await query(
      `INSERT INTO content_pages (id, slug, title, content_html, meta_description, meta_keywords, is_published, created_by, updated_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [pageId, slug, title, contentHtml, metaDescription, metaKeywords, isPublished, createdBy, createdBy]
    );

    logger.info(`Page created: ${slug}`);
    return mapRowToPage(result.rows[0]);
  } catch (error) {
    logger.error('Create page error:', error);
    throw error;
  }
}

// Update page
export async function updatePage(
  pageId: string,
  updates: {
    title?: string;
    contentHtml?: string;
    metaDescription?: string;
    metaKeywords?: string;
    isPublished?: boolean;
  },
  updatedBy: string
): Promise<ContentPage> {
  try {
    const updateFields: string[] = [];
    const params: any[] = [];
    let paramIndex = 1;

    if (updates.title) {
      updateFields.push(`title = $${paramIndex++}`);
      params.push(updates.title);
    }
    if (updates.contentHtml) {
      updateFields.push(`content_html = $${paramIndex++}`);
      params.push(updates.contentHtml);
    }
    if (updates.metaDescription) {
      updateFields.push(`meta_description = $${paramIndex++}`);
      params.push(updates.metaDescription);
    }
    if (updates.metaKeywords) {
      updateFields.push(`meta_keywords = $${paramIndex++}`);
      params.push(updates.metaKeywords);
    }
    if (updates.isPublished !== undefined) {
      updateFields.push(`is_published = $${paramIndex++}`);
      params.push(updates.isPublished);
    }

    updateFields.push(`updated_by = $${paramIndex++}`);
    params.push(updatedBy);

    params.push(pageId);

    const result = await query(
      `UPDATE content_pages SET ${updateFields.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramIndex} RETURNING *`,
      params
    );

    if (result.rows.length === 0) {
      throw new Error('Page not found');
    }

    logger.info(`Page updated: ${pageId}`);
    return mapRowToPage(result.rows[0]);
  } catch (error) {
    logger.error('Update page error:', error);
    throw error;
  }
}

// Delete page
export async function deletePage(pageId: string): Promise<void> {
  try {
    const result = await query('DELETE FROM content_pages WHERE id = $1 RETURNING id', [pageId]);

    if (result.rows.length === 0) {
      throw new Error('Page not found');
    }

    logger.info(`Page deleted: ${pageId}`);
  } catch (error) {
    logger.error('Delete page error:', error);
    throw error;
  }
}

function mapRowToPage(row: any): ContentPage {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    contentHtml: row.content_html,
    metaDescription: row.meta_description,
    metaKeywords: row.meta_keywords,
    isPublished: row.is_published,
    createdBy: row.created_by,
    updatedBy: row.updated_by,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
