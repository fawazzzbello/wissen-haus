/**
 * AI Provider Interface
 * Defines the contract for all AI service providers
 */

export interface AIAnalysis {
  summary: string;
  insights: string[];
  recommendations: string[];
  metrics?: Record<string, any>;
}

export interface AIGeneratedContent {
  content: string;
  type: 'text' | 'html' | 'markdown';
  tokens_used: number;
}

export interface IAIProvider {
  /**
   * Generate content based on a prompt
   */
  generateContent(
    prompt: string,
    context?: Record<string, any>
  ): Promise<AIGeneratedContent>;

  /**
   * Analyze data and provide insights
   */
  analyzeData(
    data: Record<string, any>[],
    analysisType: string
  ): Promise<AIAnalysis>;

  /**
   * Chat with the AI for interactive conversations
   */
  chat(messages: Array<{ role: 'user' | 'assistant'; content: string }>): Promise<string>;

  /**
   * Get provider name
   */
  getProviderName(): string;

  /**
   * Check if provider is available (API key set, etc)
   */
  isAvailable(): boolean;

  /**
   * Get estimated cost for a request
   */
  estimateCost(tokens: number): number;
}

export type ProviderType = 'anthropic' | 'gemini' | 'openai';

export interface ProviderConfig {
  type: ProviderType;
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}
