import { Request, Response } from 'express';
import { getAIService } from '@/services/ai';
import { logger } from '@/utils/logger';

/**
 * AI Controller
 * Handles all AI-related endpoints
 */

export async function getProviders(req: Request, res: Response) {
  try {
    const aiService = getAIService();
    const providers = aiService.getAvailableProviders();
    const primaryProvider = aiService.getPrimaryProvider();

    res.json({
      success: true,
      data: {
        primary: primaryProvider,
        available: providers,
        total: providers.length,
      },
    });
  } catch (error: any) {
    logger.error('Get providers error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Failed to get AI providers',
      message: error.message,
    });
  }
}

export async function generateContent(req: Request, res: Response) {
  try {
    const { prompt, context, type = 'text' } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        error: 'Missing required field: prompt',
      });
    }

    const aiService = getAIService();
    const result = await aiService.generateContent(prompt, context);

    res.json({
      success: true,
      data: {
        content: result.content,
        type: result.type,
        tokensUsed: result.tokens_used,
        provider: aiService.getPrimaryProvider()?.name,
      },
    });
  } catch (error: any) {
    logger.error('Generate content error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Content generation failed',
      message: error.message,
    });
  }
}

export async function analyzeDonations(req: Request, res: Response) {
  try {
    const { donations } = req.body;

    if (!donations || !Array.isArray(donations)) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid field: donations (must be array)',
      });
    }

    const aiService = getAIService();
    const analysis = await aiService.analyzeData(donations, 'donation');

    res.json({
      success: true,
      data: {
        ...analysis,
        provider: aiService.getPrimaryProvider()?.name,
      },
    });
  } catch (error: any) {
    logger.error('Donation analysis error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Donation analysis failed',
      message: error.message,
    });
  }
}

export async function analyzeDonors(req: Request, res: Response) {
  try {
    const { donors } = req.body;

    if (!donors || !Array.isArray(donors)) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid field: donors (must be array)',
      });
    }

    const aiService = getAIService();
    const analysis = await aiService.analyzeData(donors, 'donor');

    res.json({
      success: true,
      data: {
        ...analysis,
        provider: aiService.getPrimaryProvider()?.name,
      },
    });
  } catch (error: any) {
    logger.error('Donor analysis error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Donor analysis failed',
      message: error.message,
    });
  }
}

export async function chat(req: Request, res: Response) {
  try {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        success: false,
        error: 'Missing or invalid field: messages (must be array)',
      });
    }

    // Validate message format
    const validMessages = messages.every(
      (m) => m.role && (m.role === 'user' || m.role === 'assistant') && m.content
    );

    if (!validMessages) {
      return res.status(400).json({
        success: false,
        error: 'Invalid message format. Each message must have "role" (user/assistant) and "content"',
      });
    }

    const aiService = getAIService();
    const response = await aiService.chat(messages);

    res.json({
      success: true,
      data: {
        message: response,
        provider: aiService.getPrimaryProvider()?.name,
      },
    });
  } catch (error: any) {
    logger.error('Chat error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Chat failed',
      message: error.message,
    });
  }
}

export async function generateReport(req: Request, res: Response) {
  try {
    const { reportType, data, customPrompt } = req.body;

    if (!reportType || !data) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: reportType and data',
      });
    }

    let prompt = customPrompt;

    if (!prompt) {
      switch (reportType) {
        case 'donor_impact':
          prompt = `Generate a compelling impact report showing how donations from these donors have made a difference:\n${JSON.stringify(data)}`;
          break;
        case 'monthly_summary':
          prompt = `Create a professional monthly donation summary report with insights:\n${JSON.stringify(data)}`;
          break;
        case 'campaign_performance':
          prompt = `Analyze campaign performance and generate actionable recommendations:\n${JSON.stringify(data)}`;
          break;
        default:
          prompt = `Generate a comprehensive report about the following data:\n${JSON.stringify(data)}`;
      }
    }

    const aiService = getAIService();
    const result = await aiService.generateContent(prompt, {
      system:
        'You are a professional report writer for a non-profit organization. Generate clear, impactful reports that highlight achievements and suggest improvements.',
    });

    res.json({
      success: true,
      data: {
        report: result.content,
        type: reportType,
        tokensUsed: result.tokens_used,
        provider: aiService.getPrimaryProvider()?.name,
      },
    });
  } catch (error: any) {
    logger.error('Report generation error:', error.message);
    res.status(500).json({
      success: false,
      error: 'Report generation failed',
      message: error.message,
    });
  }
}
