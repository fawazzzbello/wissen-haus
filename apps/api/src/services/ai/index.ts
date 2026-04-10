import { logger } from '@/utils/logger';
import { IAIProvider, ProviderType, AIGeneratedContent, AIAnalysis } from './types';
import { AnthropicProvider } from './providers/anthropic.provider';
import { GeminiProvider } from './providers/gemini.provider';
import { OpenAIProvider } from './providers/openai.provider';

/**
 * AI Service Manager
 * Manages multiple AI providers with automatic fallback
 */
export class AIService {
  private providers: Map<string, IAIProvider> = new Map();
  private primaryProvider: IAIProvider | null = null;
  private preferredProvider: ProviderType;

  constructor(preferredProvider?: ProviderType) {
    this.preferredProvider = preferredProvider || (process.env.AI_PROVIDER as ProviderType) || 'anthropic';
    this.initializeProviders();
  }

  private initializeProviders(): void {
    // Initialize all available providers
    const anthropic = new AnthropicProvider();
    const gemini = new GeminiProvider();
    const openai = new OpenAIProvider();

    if (anthropic.isAvailable()) {
      this.providers.set('anthropic', anthropic);
      logger.info('✓ Anthropic Claude provider available');
    }

    if (gemini.isAvailable()) {
      this.providers.set('gemini', gemini);
      logger.info('✓ Google Gemini provider available');
    }

    if (openai.isAvailable()) {
      this.providers.set('openai', openai);
      logger.info('✓ OpenAI ChatGPT provider available');
    }

    // Set primary provider
    if (this.providers.has(this.preferredProvider)) {
      this.primaryProvider = this.providers.get(this.preferredProvider) || null;
      logger.info(`✓ Using ${this.preferredProvider} as primary AI provider`);
    } else {
      // Fallback to first available
      const firstProvider = this.providers.values().next().value;
      if (firstProvider) {
        this.primaryProvider = firstProvider;
        logger.warn(
          `⚠ Preferred provider "${this.preferredProvider}" not available, using ${firstProvider.getProviderName()}`
        );
      } else {
        logger.warn('⚠ No AI providers configured. Set ANTHROPIC_API_KEY, GOOGLE_GEMINI_API_KEY, or OPENAI_API_KEY');
      }
    }
  }

  /**
   * Get list of available providers
   */
  getAvailableProviders(): Array<{ name: string; type: string }> {
    return Array.from(this.providers.values()).map((provider) => ({
      name: provider.getProviderName(),
      type: provider.constructor.name,
    }));
  }

  /**
   * Get primary provider info
   */
  getPrimaryProvider(): { name: string; available: boolean } | null {
    if (!this.primaryProvider) {
      return null;
    }
    return {
      name: this.primaryProvider.getProviderName(),
      available: this.primaryProvider.isAvailable(),
    };
  }

  /**
   * Generate content using primary provider (with fallback)
   */
  async generateContent(
    prompt: string,
    context?: Record<string, any>,
    fallbackOnError: boolean = true
  ): Promise<AIGeneratedContent> {
    if (!this.primaryProvider) {
      throw new Error('No AI provider configured');
    }

    try {
      return await this.primaryProvider.generateContent(prompt, context);
    } catch (error: any) {
      if (!fallbackOnError) {
        throw error;
      }

      logger.warn(
        `Primary provider (${this.primaryProvider.getProviderName()}) failed, trying fallback...`
      );

      // Try other providers
      for (const [name, provider] of this.providers) {
        if (provider === this.primaryProvider) {
          continue; // Skip primary
        }
        try {
          logger.info(`Attempting with ${provider.getProviderName()}`);
          return await provider.generateContent(prompt, context);
        } catch (fallbackError) {
          logger.warn(`${provider.getProviderName()} also failed: ${(fallbackError as Error).message}`);
          continue;
        }
      }

      // All providers failed
      throw new Error(`All AI providers failed. Last error: ${error.message}`);
    }
  }

  /**
   * Analyze data using primary provider (with fallback)
   */
  async analyzeData(
    data: Record<string, any>[],
    analysisType: string,
    fallbackOnError: boolean = true
  ): Promise<AIAnalysis> {
    if (!this.primaryProvider) {
      throw new Error('No AI provider configured');
    }

    try {
      return await this.primaryProvider.analyzeData(data, analysisType);
    } catch (error: any) {
      if (!fallbackOnError) {
        throw error;
      }

      logger.warn(
        `Primary provider (${this.primaryProvider.getProviderName()}) analysis failed, trying fallback...`
      );

      for (const [name, provider] of this.providers) {
        if (provider === this.primaryProvider) {
          continue;
        }
        try {
          logger.info(`Attempting analysis with ${provider.getProviderName()}`);
          return await provider.analyzeData(data, analysisType);
        } catch (fallbackError) {
          logger.warn(`${provider.getProviderName()} analysis failed: ${(fallbackError as Error).message}`);
          continue;
        }
      }

      throw new Error(`All AI providers failed. Last error: ${error.message}`);
    }
  }

  /**
   * Chat with primary provider (with fallback)
   */
  async chat(
    messages: Array<{ role: 'user' | 'assistant'; content: string }>,
    fallbackOnError: boolean = true
  ): Promise<string> {
    if (!this.primaryProvider) {
      throw new Error('No AI provider configured');
    }

    try {
      return await this.primaryProvider.chat(messages);
    } catch (error: any) {
      if (!fallbackOnError) {
        throw error;
      }

      logger.warn(
        `Primary provider (${this.primaryProvider.getProviderName()}) chat failed, trying fallback...`
      );

      for (const [name, provider] of this.providers) {
        if (provider === this.primaryProvider) {
          continue;
        }
        try {
          logger.info(`Attempting chat with ${provider.getProviderName()}`);
          return await provider.chat(messages);
        } catch (fallbackError) {
          logger.warn(`${provider.getProviderName()} chat failed: ${(fallbackError as Error).message}`);
          continue;
        }
      }

      throw new Error(`All AI providers failed. Last error: ${error.message}`);
    }
  }
}

// Singleton instance
let aiService: AIService | null = null;

/**
 * Get or create AI service instance
 */
export function getAIService(): AIService {
  if (!aiService) {
    aiService = new AIService();
  }
  return aiService;
}

export { AIGeneratedContent, AIAnalysis } from './types';
