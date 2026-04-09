import { Request, Response } from 'express';
import {
  getContentPages,
  getPageBySlug,
  getPageById,
  createPage,
  updatePage,
  deletePage,
} from '@/services/contentService';
import { logger } from '@/utils/logger';

// Get public page by slug
export async function getPublicPage(req: Request, res: Response) {
  try {
    const { slug } = req.params;
    const page = await getPageBySlug(slug, true);

    if (!page) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Page not found' } });
    }

    res.json({ page });
  } catch (error: any) {
    logger.error('Get public page error:', error);
    res.status(500).json({ error: { code: 'FETCH_FAILED', message: 'Failed to fetch page' } });
  }
}

// List all content pages (admin)
export async function listContentPages(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
    }

    const pages = await getContentPages();
    res.json({ pages });
  } catch (error: any) {
    logger.error('List pages error:', error);
    res.status(500).json({ error: { code: 'FETCH_FAILED', message: 'Failed to fetch pages' } });
  }
}

// Get page by ID (admin)
export async function getContentPageById(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
    }

    const { id } = req.params;
    const page = await getPageById(id);

    if (!page) {
      return res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Page not found' } });
    }

    res.json({ page });
  } catch (error: any) {
    logger.error('Get page error:', error);
    res.status(500).json({ error: { code: 'FETCH_FAILED', message: 'Failed to fetch page' } });
  }
}

// Create page (admin)
export async function createNewPage(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
    }

    const { slug, title, contentHtml, metaDescription, metaKeywords, isPublished } = req.body;

    if (!slug || !title || !contentHtml) {
      return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Missing required fields' } });
    }

    const page = await createPage(slug, title, contentHtml, metaDescription || '', metaKeywords || '', req.user.userId, isPublished || false);
    res.status(201).json({ page, message: 'Page created successfully' });
  } catch (error: any) {
    logger.error('Create page error:', error);

    if (error.message.includes('already exists')) {
      return res.status(409).json({ error: { code: 'PAGE_EXISTS', message: error.message } });
    }

    res.status(500).json({ error: { code: 'CREATE_FAILED', message: 'Failed to create page' } });
  }
}

// Update page (admin)
export async function updatePageContent(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
    }

    const { id } = req.params;
    const updates = req.body;

    const page = await updatePage(id, updates, req.user.userId);
    res.json({ page, message: 'Page updated successfully' });
  } catch (error: any) {
    logger.error('Update page error:', error);
    res.status(500).json({ error: { code: 'UPDATE_FAILED', message: 'Failed to update page' } });
  }
}

// Delete page (admin)
export async function deletePageContent(req: Request, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'Auth required' } });
    }

    const { id } = req.params;
    await deletePage(id);

    res.json({ message: 'Page deleted successfully' });
  } catch (error: any) {
    logger.error('Delete page error:', error);
    res.status(500).json({ error: { code: 'DELETE_FAILED', message: 'Failed to delete page' } });
  }
}
